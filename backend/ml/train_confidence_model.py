"""
Bhunetra ML Confidence Scoring Model - Training Pipeline
=========================================================
Trains a per-field XGBoost binary classifier that predicts whether a field
extraction is *correct* (label=1) vs *missing / wrong* (label=0) given
text-level feature signals.

The trained model is saved to:
    backend/app/models/field_confidence_model.joblib

Usage:
    python ml/train_confidence_model.py
"""

import json
import re
import os
import sys
import logging
import warnings
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

import numpy as np
import joblib
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import xgboost as xgb

warnings.filterwarnings("ignore")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("bhunetra.train")

# Paths
REPO_ROOT  = Path(__file__).resolve().parent.parent
DATA_DIR   = REPO_ROOT / "app" / "data" / "synthetic_datasets"
OUT_DIR    = REPO_ROOT / "app" / "models"
OUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = OUT_DIR / "field_confidence_model.joblib"

# Keywords (mirror of ml_structuring_engine.py)
_KHASRA_KW   = ["gat kramank", "survey number", "gat kr", "7/12"]
_KHATA_KW    = ["khata kramank", "khata kr", "khata no", "khata number"]
_AREA_KW     = ["kshetra", "hectare", "are", "sq.mtr"]
_OWNER_TITLE = ["patil", "deshmukh", "yadav", "pawar", "kadam", "shinde"]
_AREA_UNITS  = ["hectare", "are", "sq.mtr", "chaurase"]
_CTS_RE      = re.compile(r"CTS[-/]?\d+", re.IGNORECASE)
_PRN_RE      = re.compile(r"PRN[-/]?[A-Z]{0,3}[-/]?\d{4,}", re.IGNORECASE)
_KHASRA_RE   = re.compile(r"\b\d{1,4}(?:/\w{1,4})+\b")
_DEV_RE      = re.compile(r"[\u0900-\u097F]")


def featurize(record: Dict[str, Any], doc_type: str) -> Dict[str, float]:
    """
    Converts a structured synthetic record into the numeric feature space
    used by ml_structuring_engine.MLFeatureVector plus doc-type one-hot bits.
    """
    text = " ".join(str(v) for v in record.values() if isinstance(v, (str, int, float)))
    total     = max(len(text), 1)
    digits    = len(re.findall(r"\d", text))
    dev_chars = len(_DEV_RE.findall(text))

    feat: Dict[str, float] = {}

    # Text composition
    feat["digit_ratio"]       = digits / total
    feat["devanagari_ratio"]  = dev_chars / total
    feat["has_slash"]         = float("/" in text)
    feat["has_hyphen"]        = float("-" in text)
    feat["text_length"]       = min(total / 500.0, 1.0)

    # Keyword proximity (binary)
    text_lower = text.lower()
    feat["kw_khasra"]      = float(any(k in text_lower for k in _KHASRA_KW))
    feat["kw_khata"]       = float(any(k in text_lower for k in _KHATA_KW))
    feat["kw_area"]        = float(any(k in text_lower for k in _AREA_KW))
    feat["kw_owner_title"] = float(any(k in text_lower for k in _OWNER_TITLE))
    feat["kw_area_unit"]   = float(any(u in text_lower for u in _AREA_UNITS))

    # Pattern signals
    feat["has_khasra_pattern"] = float(bool(_KHASRA_RE.search(text)))
    feat["has_cts_number"]     = float(bool(_CTS_RE.search(text)))
    feat["has_prn_number"]     = float(bool(_PRN_RE.search(text)))

    # Field presence flags
    for field in [
        "khasraNumber", "khataNumber", "ownerNameMr", "ownerNameEn",
        "villageMr", "villageEn", "tehsilMr", "tehsilEn", "districtMr", "districtEn",
        "totalAreaHa", "ownershipType", "ownershipCategory", "encumbranceStatus",
        "ctsNumber", "prnNumber", "carpetAreaSqMtr", "wardMr", "holdingType",
        "taxAssessmentStatus", "mutationNo", "causeOfMutation",
        "transactionDate", "vendorNameMr", "vendeeNameMr",
        "saleConsiderationRs", "stampDutyRs",
    ]:
        feat[f"has_{field}"] = float(bool(record.get(field)))

    # Verification / authenticity
    v_status = str(record.get("verificationStatus", "")).upper()
    feat["is_verified"]     = float(v_status == "VERIFIED")
    feat["is_unverified"]   = float(v_status == "UNVERIFIED")
    feat["has_digital_sig"] = float(bool(
        record.get("digitalSignatureHash") or record.get("digitalCertificateNo")
    ))
    feat["has_ulpin"]       = float(bool(record.get("ulpinCode")))

    # Encumbrance
    enc = str(record.get("encumbranceStatus", "")).lower()
    feat["has_encumbrance"] = float(bool(enc) and enc not in {"clear", "nil", "none", ""})
    feat["encumbrance_len"] = min(len(enc) / 80.0, 1.0)

    # Fraud signals
    defect = str(record.get("defectCategory", "")).upper()
    auth   = str(record.get("expectedAuthenticityRating", "")).upper()
    feat["is_fraud"]           = float(bool(defect))
    feat["is_fabricated"]      = float("FABRICATED" in defect)
    feat["is_duplicate_claim"] = float("DUPLICATE" in defect)
    feat["is_high_risk"]       = float("HIGH_RISK" in auth)
    feat["needs_inspection"]   = float("HUMAN_INSPECTION" in auth)

    # Document-type one-hot
    for dt in ["712", "8A", "FORM6", "URBAN", "DEED", "ENC", "FRAUD", "NONLAND"]:
        feat[f"dtype_{dt}"] = float(doc_type == dt)

    return feat


def load_dataset() -> Tuple[np.ndarray, np.ndarray, List[str]]:
    configs = [
        ("01_diverse_712_satbara_records.json",  "712",     1),
        ("02_village_form_8a_khata_extracts.json","8A",      1),
        ("03_village_form_6_ferfar_mutations.json","FORM6",  1),
        ("04_urban_property_cards.json",          "URBAN",   1),
        ("05_registered_sale_deeds.json",         "DEED",    1),
        ("06_encumbrance_search_reports.json",    "ENC",     1),
        ("07_fraud_adversarial_benchmarks.json",  "FRAUD",   0),
        ("08_non_land_rejection_suite.json",      "NONLAND", 0),
    ]

    all_features: List[Dict[str, float]] = []
    all_labels:   List[int]              = []

    for filename, doc_type, base_label in configs:
        path = DATA_DIR / filename
        if not path.exists():
            log.warning("Missing dataset file: %s - skipping.", path.name)
            continue

        log.info("Loading  %-50s  [label=%d]", filename, base_label)
        records = json.load(open(path, encoding="utf-8"))

        for rec in tqdm(records, desc=f"  {doc_type}", unit="rec", leave=False):
            if doc_type == "FRAUD":
                auth = str(rec.get("expectedAuthenticityRating", "")).upper()
                lbl  = 0 if "HIGH_RISK" in auth else (1 if "LOW" in auth else 0)
            else:
                lbl = base_label

            feat_dict = featurize(rec, doc_type)
            all_features.append(feat_dict)
            all_labels.append(lbl)

    log.info("Total samples: %d", len(all_labels))

    all_keys = sorted({k for d in all_features for k in d})
    X = np.array(
        [[d.get(k, 0.0) for k in all_keys] for d in tqdm(all_features, desc="Vectorising")],
        dtype=np.float32,
    )
    y = np.array(all_labels, dtype=np.int8)

    log.info("Feature matrix: %s  |  Classes: 0=%d  1=%d",
             X.shape, (y == 0).sum(), (y == 1).sum())

    return X, y, all_keys


def train(X: np.ndarray, y: np.ndarray, feature_names: List[str]):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    log.info("Train=%d  Test=%d", len(X_train), len(X_test))

    neg_count = int((y_train == 0).sum())
    pos_count = int((y_train == 1).sum())
    spw = neg_count / max(pos_count, 1)
    log.info("scale_pos_weight = %.2f  (neg=%d / pos=%d)", spw, neg_count, pos_count)

    model = xgb.XGBClassifier(
        n_estimators     = 400,
        max_depth        = 6,
        learning_rate    = 0.05,
        subsample        = 0.8,
        colsample_bytree = 0.8,
        scale_pos_weight = spw,
        eval_metric      = "logloss",
        tree_method      = "hist",
        random_state     = 42,
        n_jobs           = -1,
        verbosity        = 0,
    )

    log.info("Training XGBoost ...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=50,
    )

    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    auc = roc_auc_score(y_test, y_prob)
    log.info("ROC-AUC : %.4f", auc)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Fraud/NonLand", "Valid Land"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    importances = model.feature_importances_
    top_idx = np.argsort(importances)[::-1][:20]
    log.info("Top-20 features:")
    for i in top_idx:
        log.info("  %-40s  %.4f", feature_names[i], importances[i])

    return model, feature_names


def save_model(model, feature_names: List[str]):
    bundle = {"model": model, "feature_names": feature_names}
    joblib.dump(bundle, MODEL_PATH, compress=3)
    size_mb = MODEL_PATH.stat().st_size / 1_048_576
    log.info("Model saved -> %s  (%.2f MB)", MODEL_PATH, size_mb)


def smoke_test(feature_names: List[str]):
    bundle = joblib.load(MODEL_PATH)
    m  = bundle["model"]
    fn = bundle["feature_names"]

    good_rec = {
        "khasraNumber": "142/3A", "khataNumber": "582",
        "ownerNameMr": "Ramesh Patil", "villageMr": "Wagholi",
        "tehsilMr": "Haveli", "districtMr": "Pune",
        "totalAreaHa": 1.45, "ownershipType": "Class-1",
        "verificationStatus": "VERIFIED",
        "digitalSignatureHash": "712MV-XG9-2026-PUNE-0941",
        "ulpinCode": "MH-27-PN-HV-WAG-1423A",
    }
    bad_rec = {
        "fileName": "invoice_abc.pdf",
        "detectedCategory": "COMMERCIAL_INVOICE",
        "description": "GST Invoice for office supplies",
    }

    def predict(rec, dt):
        feat = featurize(rec, dt)
        row  = np.array([[feat.get(k, 0.0) for k in fn]], dtype=np.float32)
        return round(float(m.predict_proba(row)[0][1]), 4)

    good_score = predict(good_rec, "712")
    bad_score  = predict(bad_rec, "NONLAND")

    log.info("Smoke Test: valid 7/12 -> %.4f  (expect > 0.50)", good_score)
    log.info("Smoke Test: non-land   -> %.4f  (expect < 0.50)", bad_score)
    assert good_score > 0.50, f"FAILED: valid record scored {good_score}"
    assert bad_score  < 0.50, f"FAILED: non-land scored {bad_score}"
    log.info("Smoke test PASSED")


if __name__ == "__main__":
    log.info("=" * 60)
    log.info("  Bhunetra - ML Confidence Model Training")
    log.info("  Data : %s", DATA_DIR)
    log.info("  Out  : %s", MODEL_PATH)
    log.info("=" * 60)

    X, y, feature_names = load_dataset()
    model, feature_names = train(X, y, feature_names)
    save_model(model, feature_names)
    smoke_test(feature_names)

    log.info("Training complete. Model ready at: %s", MODEL_PATH)
