"""
Seed Data Script for BHUNETRA
Pre-populates Firestore / Mock DB with realistic Marathi 7/12 land records
across Pune, Nagpur, Nashik, and Mumbai districts for live demo & Q&A presentations.
"""
import sys
import logging
from datetime import datetime, timezone

from app.firebase_config import get_db
from app.schemas.common import VerificationStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bhunetra.seed")

DEMO_RECORDS = [
    {
        "recordId": "REC-712-PUNE-0941",
        "docId": "DOC-SATBARA-2026-08",
        "khasraNumber": "142/3A",
        "khataNumber": "582",
        "ownerName": "रमेश विठ्ठल पाटील",
        "village": "वाघोली",
        "tehsil": "हवेली",
        "district": "पुणे",
        "landArea": "1.45 हेक्टर",
        "ownershipType": "भोगवटादार वर्ग - १",
        "extractedFields": {
            "khasraNumber": "142/3A",
            "khataNumber": "582",
            "ownerName": "रमेश विठ्ठल पाटील",
            "village": "वाघोली",
            "tehsil": "हवेली",
            "district": "पुणे",
            "landArea": "1.45 हेक्टर",
            "ownershipType": "भोगवटादार वर्ग - १",
        },
        "confidenceScores": {
            "khasraNumber": 0.998,
            "khataNumber": 0.996,
            "ownerName": 0.985,
            "village": 0.997,
            "tehsil": 0.994,
            "district": 0.998,
            "landArea": 0.991,
            "ownershipType": 0.990,
        },
        "overallConfidence": 0.993,
        "verificationStatus": VerificationStatus.AUTO_APPROVED.value,
        "flaggedFields": [],
        "verifiedBy": "AUTO_ML_ENGINE",
        "verifiedAt": datetime.now(timezone.utc).isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "recordId": "REC-712-PUNE-0248",
        "docId": "DOC-SATBARA-2026-02",
        "khasraNumber": "248",
        "khataNumber": "104",
        "ownerName": "Ramesh Baburao Patil",
        "village": "खडकवासला",
        "tehsil": "हवेली",
        "district": "पुणे",
        "landArea": "1.25 हेक्टर",
        "ownershipType": "भोगवटादार वर्ग - १",
        "extractedFields": {
            "khasraNumber": "24B",
            "khataNumber": "104",
            "ownerName": "Ramesh Baburao Patil",
            "village": "खडकवासला",
            "tehsil": "हवेली",
            "district": "पुणे",
            "landArea": "1.25 हेक्टर",
            "ownershipType": "भोगवटादार वर्ग - १",
        },
        "confidenceScores": {
            "khasraNumber": 0.42,
            "khataNumber": 0.95,
            "ownerName": 0.92,
            "village": 0.98,
            "tehsil": 0.97,
            "district": 0.99,
            "landArea": 0.96,
            "ownershipType": 0.98,
        },
        "overallConfidence": 0.896,
        "verificationStatus": VerificationStatus.PENDING_REVIEW.value,
        "flaggedFields": ["khasraNumber"],
        "verifiedBy": None,
        "verifiedAt": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "recordId": "REC-712-NAGP-0312",
        "docId": "DOC-SATBARA-2026-11",
        "khasraNumber": "88/1",
        "khataNumber": "319",
        "ownerName": "सुरेश आनंदराव देशमुख",
        "village": "कळमेश्वर",
        "tehsil": "सावनेर",
        "district": "नागपूर",
        "landArea": "2.80 हेक्टर",
        "ownershipType": "भोगवटादार वर्ग - १",
        "extractedFields": {
            "khasraNumber": "88/1",
            "khataNumber": "319",
            "ownerName": "सुरेश आनंदराव देशमुख",
            "village": "कळमेश्वर",
            "tehsil": "सावनेर",
            "district": "नागपूर",
            "landArea": "2.80 हेक्टर",
            "ownershipType": "भोगवटादार वर्ग - १",
        },
        "confidenceScores": {
            "khasraNumber": 0.995,
            "khataNumber": 0.992,
            "ownerName": 0.989,
            "village": 0.996,
            "tehsil": 0.993,
            "district": 0.999,
            "landArea": 0.994,
            "ownershipType": 0.991,
        },
        "overallConfidence": 0.994,
        "verificationStatus": VerificationStatus.AUTO_APPROVED.value,
        "flaggedFields": [],
        "verifiedBy": "AUTO_ML_ENGINE",
        "verifiedAt": datetime.now(timezone.utc).isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    },
]


def seed_records():
    db = get_db()
    logger.info("🌱 Seeding demo land records into database...")
    for rec in DEMO_RECORDS:
        db.collection("records").document(rec["recordId"]).set(rec)
        if rec["verificationStatus"] == VerificationStatus.PENDING_REVIEW.value:
            queue_data = {
                "queueId": f"Q-{rec['recordId']}",
                "recordId": rec["recordId"],
                "assignedTo": None,
                "priority": "high",
                "status": "pending",
                "flaggedFields": rec["flaggedFields"],
                "overallConfidence": rec["overallConfidence"],
                "createdAt": rec["createdAt"],
            }
            db.collection("verificationQueue").document(f"Q-{rec['recordId']}").set(queue_data)
        logger.info(f"  └─ Seeded record: {rec['recordId']} ({rec['verificationStatus']})")
    logger.info("✅ Database seeded successfully.")


if __name__ == "__main__":
    seed_records()
