"""
generate_synthetic_datasets.py
=============================================================================
Bhunetra (SIH26018) Multi-Document Land & Property Synthetic Dataset Generator
=============================================================================
Generates realistic, legally accurate synthetic datasets across the full
Indian land and revenue document lifecycle:

1. Village Form 7/12 (गावाचा नमुना सात/बारा) - Rural Agricultural Records
   - Multi-tenure: Class-1, Class-2 (Restricted), Govt Lessee, Joint, Devasthan
   - Realistic crop loans, tractor mortgages, and civil stay orders
2. Village Form 8-A (गाव नमुना ८-अ / खातेवही उतारा) - Consolidated Khata Holding
   - Farmer's combined parcels across multiple survey numbers & revenue tax
3. Village Form 6 (गाव नमुना ६ - फेरफार नोंदवही) - Historical Mutation Trail
   - Sale deeds, inheritance (वारस), gifts (बक्षीस), partition, lien entries
4. Urban Property Card / Akhiv Patrika (नगर भूमापन / मालमत्ता पत्रक)
   - City Survey (CTS) numbers, PRN numbers, municipal ward, Sq. Meters
5. Registered Sale Deed (नोंदणीकृत खरेदी खत / Conveyance Deed)
   - SRO doc numbers, 4 boundaries (चतुःसीमा), market valuation, stamp duty
6. Encumbrance & 30-Year Search Report (शोध अहवाल / बोजा प्रमाणपत्र)
   - 30-year transaction audit chain and advocate legal title opinion
7. Ground-Truth Fraud & Tampering Benchmark Cases
   - Duplicate village claims, area math anomalies, forged seals, unauthorized mutations
8. Non-Land Document Rejection Suite (Negative Controls)
   - GST, FSSAI, electricity utility bills, invoices, pay slips

Outputs:
  - JSON & CSV datasets in: backend/app/data/synthetic_datasets/
  - Multi-table indexed SQLite DB: backend/app/data/synthetic_land_registry.db
"""

import os
import sys
import json
import csv
import sqlite3
import random
import hashlib
from datetime import datetime, timedelta

# Fix Windows console UTF-8 output if run directly
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
OUTPUT_DIR = os.path.join(DATA_DIR, "synthetic_datasets")
DB_PATH = os.path.join(DATA_DIR, "synthetic_land_registry.db")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Deterministic seed for reproducible testing
random.seed(42)

# =============================================================================
# REUSABLE DICTIONARIES & MASTER METADATA
# =============================================================================

FIRST_NAMES_MR = ["रमेश", "सुरेश", "गणेश", "सुनील", "अनिल", "प्रकाश", "विजय", "संजय", "दिनेश", "महेश", "सचिन", "अशोक", "दीपक", "नितिन", "राजेश", "सुनीता", "अनिता", "कविता", "स्वाती", "रेखा", "आशा", "संगीता", "पूनम", "छाया", "अलका", "मंदा", "वैशाली"]
FIRST_NAMES_EN = ["Ramesh", "Suresh", "Ganesh", "Sunil", "Anil", "Prakash", "Vijay", "Sanjay", "Dinesh", "Mahesh", "Sachin", "Ashok", "Deepak", "Nitin", "Rajesh", "Sunita", "Anita", "Kavita", "Swati", "Rekha", "Asha", "Sangeeta", "Poonam", "Chhaya", "Alka", "Manda", "Vaishali"]

FATHER_NAMES_MR = ["विठ्ठल", "बाबुराव", "आनंदराव", "पांडुरंग", "विलास", "जगन्नाथ", "रामचंद्र", "दत्तू", "मारुती", "तुकाराम", "ज्ञानदेव", "सोपान", "नारायण", "शिवाजी", "भास्कर", "तानाजी", "सखाराम", "हरिभाऊ", "किसन"]
FATHER_NAMES_EN = ["Vitthal", "Baburao", "Anandrao", "Pandurang", "Vilas", "Jagannath", "Ramchandra", "Dattu", "Maruti", "Tukaram", "Dnyandev", "Sopan", "Narayan", "Shivaji", "Bhaskar", "Tanaji", "Sakharam", "Haribhau", "Kisan"]

SURNAMES_MR = ["पाटील", "देशमुख", "पवार", "कदम", "शिंदे", "यादव", "जाधव", "गायकवाड", "जोशी", "कुलकर्णी", "मोरे", "चव्हाण", "साळुंके", "माने", "जगताप", "नाईक", "भोसले", "वाघमारे", "थोरात", "कांबळे", "वाघ", "शेळके", "घोरपडे"]
SURNAMES_EN = ["Patil", "Deshmukh", "Pawar", "Kadam", "Shinde", "Yadav", "Jadhav", "Gaikwad", "Joshi", "Kulkarni", "More", "Chavan", "Salunkhe", "Mane", "Jagtap", "Naik", "Bhosale", "Waghmare", "Thorat", "Kamble", "Wagh", "Shelke", "Ghorpade"]

RURAL_DISTRICTS = [
    ("पुणे", "Pune", "हवेली", "Haveli", ["वाघोली", "खडकवासला", "बावधन", "शिरूर", "लोणी काळभोर", "चाकण", "आळंदी", "उरुळी कांचन", "थेऊर"]),
    ("नागपूर", "Nagpur", "सावनेर", "Saoner", ["कळमेश्वर", "पारशिवनी", "उमरेड", "कामठी", "खापरखेडा", "हिंगणा", "कुही"]),
    ("नाशिक", "Nashik", "नाशिक", "Nashik", ["त्र्यंबकेश्वर", "पंचवटी", "इगतपुरी", "दिंडोरी", "निफाड", "सिन्नर", "चांदवड"]),
    ("ठाणे", "Thane", "कल्याण", "Kalyan", ["टिटवाळा", "अंबरनाथ", "बदलापूर", "शहापूर", "मुरबाड", "वांगणी"]),
    ("छत्रपती संभाजीनगर", "Chhatrapati Sambhajinagar", "संभाजीनगर", "Sambhajinagar", ["वैजापूर", "पैठण", "गंगापूर", "सिल्लोड", "खुलताबाद"]),
    ("कोल्हापूर", "Kolhapur", "करवीर", "Karveer", ["कागल", "पन्हाळा", "शिरोळ", "हातकणंगले", "राधानगरी"]),
    ("सोलापूर", "Solapur", "उत्तर सोलापूर", "North Solapur", ["अक्कलकोट", "बार्शी", "पंढरपूर", "मोहोळ", "करमाळा"]),
    ("सातारा", "Satara", "कराड", "Karad", ["पाटण", "वाई", "महाबळेश्वर", "फलटण", "कोरेगाव"]),
    ("अहमदनगर", "Ahmednagar", "राहाता", "Rahata", ["शिर्डी", "संगमनेर", "श्रीरामपूर", "कोपरगाव", "नेवासा"]),
]

URBAN_CITIES = [
    ("पुणे", "Pune", "हवेली / पुणे शहर", "Pune City", ["शिवाजीनगर", "कोथरूड", "औंध", "हडपसर", "विमान नगर", "बाणेर", "डेक्कन जिमखाना", "कॅम्प"]),
    ("मुंबई उपनगर", "Mumbai Suburban", "अंधेरी", "Andheri", ["अंधेरी पश्चिम", "वांद्रे पूर्व", "बोरिवली पश्चिम", "कुर्ला पश्चिम", "घाटकोपर पूर्व", "जोगेश्वरी"]),
    ("ठाणे", "Thane", "ठाणे नगर", "Thane City", ["नौपाडा", "घोड़बंदर रोड", "कोपरी", "वागळे इस्टेट", "माजिवडा", "कपूरबावडी"]),
    ("नाशिक", "Nashik", "नाशिक महानगर", "Nashik Metro", ["कॉलेज रोड", "गंगापूर रोड", "पंचवटी", "सातपूर औद्योगिक क्षेत्र", "इंदिरानगर"]),
    ("नागपूर", "Nagpur", "नागपूर महानगर", "Nagpur Metro", ["धरमपेठ", "सीताबर्डी", "सदर बाजार", "रामदासपेठ", "प्रतापनगर"]),
]

TENURES = [
    ("भोगवटादार वर्ग - १ (Private / Class-1)", "OCCUPANT_CLASS_1", 0.60),
    ("भोगवटादार वर्ग - २ (Restricted / Class-2)", "OCCUPANT_CLASS_2", 0.20),
    ("शासकीय / सरकारी जमीन (Govt Land / Lessee)", "GOVERNMENT_STATE", 0.08),
    ("संयुक्त / सह-खातेदार (Joint Co-ownership)", "JOINT_COOWNERSHIP", 0.07),
    ("देवस्थान / इनाम जमीन (Trust / Inam Land)", "TRUST_INSTITUTIONAL", 0.03),
    ("पट्टा / कुळ वहिवाट (Protected Tenant / Leasehold)", "LEASEHOLD_TENANT", 0.02),
]

BANKS = [
    "बँक ऑफ महाराष्ट्र", "स्टेट बँक ऑफ इंडिया", "पुणे जिल्हा मध्यवर्ती सहकारी बँक",
    "बँक ऑफ बडोदा", "सेंट्रल बँक ऑफ इंडिया", "नागपूर जिल्हा मध्यवर्ती बँक",
    "नाशिक मर्चंट्स को-ऑप बँक", "महाराष्ट्र ग्रामीण बँक", "एचडीएफसी बँक"
]

# Helper for export
def export_csv(filepath, records):
    if not records:
        return
    keys = list(records[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(records)

def export_json(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# =============================================================================
# 1. VILLAGE FORM 7/12 (SATBARA) DATASET GENERATOR
# =============================================================================
def generate_diverse_712(count=5000):
    records = []
    # Anchored Paper 1, 2, 3 Demo Records
    records.append({
        "recordId": "REC-PUNE-WAG-001",
        "khasraNumber": "142/3A",
        "khataNumber": "582",
        "ownerNameMr": "रमेश विठ्ठल पाटील",
        "ownerNameEn": "Ramesh Vitthal Patil",
        "fatherNameMr": "विठ्ठल बाबुराव पाटील",
        "villageMr": "वाघोली",
        "villageEn": "Wagholi",
        "tehsilMr": "हवेली",
        "tehsilEn": "Haveli",
        "districtMr": "पुणे",
        "districtEn": "Pune",
        "totalAreaHa": 1.45,
        "cultivableAreaHa": 1.35,
        "uncultivableAreaHa": 0.10,
        "ownershipType": "भोगवटादार वर्ग - १ (Private / Class-1)",
        "ownershipCategory": "OCCUPANT_CLASS_1",
        "encumbranceStatus": "बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-",
        "lastMutationNo": "1842",
        "ulpinCode": "MH-27-PN-HV-WAG-1423A",
        "digitalSignatureHash": "712MV-XG9-2026-PUNE-0941",
        "verificationStatus": "VERIFIED"
    })
    records.append({
        "recordId": "REC-PUNE-KHD-002",
        "khasraNumber": "248",
        "khataNumber": "712",
        "ownerNameMr": "रमेश बाबुराव पाटील",
        "ownerNameEn": "Ramesh Baburao Patil",
        "fatherNameMr": "बाबुराव विठ्ठल पाटील",
        "villageMr": "खडकवासला",
        "villageEn": "Khadakwasla",
        "tehsilMr": "हवेली",
        "tehsilEn": "Haveli",
        "districtMr": "पुणे",
        "districtEn": "Pune",
        "totalAreaHa": 2.10,
        "cultivableAreaHa": 1.95,
        "uncultivableAreaHa": 0.15,
        "ownershipType": "भोगवटादार वर्ग - १ (Private / Class-1)",
        "ownershipCategory": "OCCUPANT_CLASS_1",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "2041",
        "ulpinCode": "MH-27-PN-HV-KHD-0248",
        "digitalSignatureHash": "712MV-XG9-2026-PUNE-0248",
        "verificationStatus": "VERIFIED"
    })
    records.append({
        "recordId": "REC-NASH-TRM-003",
        "khasraNumber": "105/B",
        "khataNumber": "341",
        "ownerNameMr": "गणेश पांडुरंग पवार",
        "ownerNameEn": "Ganesh Pandurang Pawar",
        "fatherNameMr": "पांडुरंग बापू पवार",
        "villageMr": "त्र्यंबकेश्वर",
        "villageEn": "Trimbakeshwar",
        "tehsilMr": "त्र्यंबकेश्वर",
        "tehsilEn": "Trimbakeshwar",
        "districtMr": "नाशिक",
        "districtEn": "Nashik",
        "totalAreaHa": 0.85,
        "cultivableAreaHa": 0.80,
        "uncultivableAreaHa": 0.05,
        "ownershipType": "भोगवटादार वर्ग - १ (Private / Class-1)",
        "ownershipCategory": "OCCUPANT_CLASS_1",
        "encumbranceStatus": "स्टेट बँक ऑफ इंडिया कर्ज बोजा रु. १,२०,०००/-",
        "lastMutationNo": "3045",
        "ulpinCode": "MH-27-NS-NS-TRM-0105",
        "digitalSignatureHash": "712MV-XG9-2026-NASH-0105",
        "verificationStatus": "VERIFIED"
    })

    tenure_choices = [t[0] for t in TENURES]
    tenure_weights = [t[2] for t in TENURES]

    for i in range(len(records) + 1, count + 1):
        dist_info = random.choice(RURAL_DISTRICTS)
        dist_mr, dist_en, teh_mr, teh_en, villages = dist_info
        village_mr = random.choice(villages)
        village_en = village_mr

        fn_idx = random.randint(0, len(FIRST_NAMES_MR) - 1)
        mn_idx = random.randint(0, len(FATHER_NAMES_MR) - 1)
        sn_idx = random.randint(0, len(SURNAMES_MR) - 1)

        owner_mr = f"{FIRST_NAMES_MR[fn_idx]} {FATHER_NAMES_MR[mn_idx]} {SURNAMES_MR[sn_idx]}"
        owner_en = f"{FIRST_NAMES_EN[fn_idx]} {FATHER_NAMES_EN[mn_idx]} {SURNAMES_EN[sn_idx]}"
        father_mr = f"{FATHER_NAMES_MR[mn_idx]} {SURNAMES_MR[sn_idx]}"

        khasra_base = random.randint(1, 450)
        sub_div = random.choice(["", f"/{random.randint(1, 5)}", f"/{random.randint(1, 3)}{random.choice(['अ', 'ब', 'A', 'B'])}"])
        khasra_no = f"{khasra_base}{sub_div}"
        khata_no = str(random.randint(12, 1250))

        tot_area = round(random.uniform(0.40, 6.50), 2)
        uncult = round(min(random.uniform(0.02, 0.30), tot_area * 0.15), 2)
        cult = round(tot_area - uncult, 2)

        chosen_tenure = random.choices(tenure_choices, weights=tenure_weights, k=1)[0]
        cat_key = next(t[1] for t in TENURES if t[0] == chosen_tenure)

        if chosen_tenure.startswith("संयुक्त"):
            fn2 = random.choice(FIRST_NAMES_MR)
            owner_mr += f" व {fn2} {FATHER_NAMES_MR[mn_idx]} {SURNAMES_MR[sn_idx]} (सामाईक)"
        elif chosen_tenure.startswith("भोगवटादार वर्ग - २"):
            owner_mr += " (आदिवासी / शासन अनुदानित जमीन)"
        elif chosen_tenure.startswith("देवस्थान"):
            owner_mr = f"श्री सिद्धेश्वर देवस्थान ट्रस्ट (पुजारी: {owner_mr})"

        # Encumbrance
        enc_roll = random.random()
        if enc_roll < 0.45:
            enc = "निरंक (Clear Title)"
        elif enc_roll < 0.85:
            bank = random.choice(BANKS)
            amount = random.randint(25, 450) * 1000
            enc = f"{bank} पीक कर्ज बोजा रु. {amount:,}/-"
        elif enc_roll < 0.95:
            bank = random.choice(BANKS)
            amount = random.randint(200, 1500) * 1000
            enc = f"{bank} ट्रॅक्टर/मुदत कर्ज गहाण बोजा रु. {amount:,}/-"
        else:
            enc = "दिवाणी न्यायालय मनाई हुकूम (Civil Court Stay Order)"

        mut_no = str(random.randint(1001, 9890))
        ulpin = f"MH-27-{dist_en[:2].upper()}-{teh_en[:2].upper()}-{khasra_base:04d}"
        sig_hash = hashlib.sha256(f"{khasra_no}:{khata_no}:{owner_mr}:{tot_area}".encode("utf-8")).hexdigest()[:16].upper()

        records.append({
            "recordId": f"REC-MH-{i:06d}",
            "khasraNumber": khasra_no,
            "khataNumber": khata_no,
            "ownerNameMr": owner_mr,
            "ownerNameEn": owner_en,
            "fatherNameMr": father_mr,
            "villageMr": village_mr,
            "villageEn": village_en,
            "tehsilMr": teh_mr,
            "tehsilEn": teh_en,
            "districtMr": dist_mr,
            "districtEn": dist_en,
            "totalAreaHa": tot_area,
            "cultivableAreaHa": cult,
            "uncultivableAreaHa": uncult,
            "ownershipType": chosen_tenure,
            "ownershipCategory": cat_key,
            "encumbranceStatus": enc,
            "lastMutationNo": mut_no,
            "ulpinCode": ulpin,
            "digitalSignatureHash": f"712MV-{sig_hash}",
            "verificationStatus": "AUTO_APPROVED" if enc_roll < 0.80 else "PENDING_REVIEW"
        })
    return records


# =============================================================================
# 2. VILLAGE FORM 8-A (KHATA EXTRACT) DATASET GENERATOR
# =============================================================================
def generate_form_8a(rural_records, count=1500):
    """
    Generates 8-A extracts consolidating multiple survey numbers under single Khatedars.
    """
    records = []
    # Group by (village, khataNumber)
    village_groups = {}
    for r in rural_records:
        key = (r["villageMr"], r["khataNumber"])
        if key not in village_groups:
            village_groups[key] = []
        village_groups[key].append(r)

    idx = 1
    for (village, khata), parcel_list in village_groups.items():
        if idx > count:
            break
        primary = parcel_list[0]
        total_holding_area = round(sum(p["totalAreaHa"] for p in parcel_list), 2)
        total_tax = round(total_holding_area * random.uniform(8.5, 14.5), 2)
        local_cess = round(total_tax * 0.20, 2)
        grand_tax = round(total_tax + local_cess, 2)

        parcels_summary = ", ".join([f"गट {p['khasraNumber']} ({p['totalAreaHa']} Ha)" for p in parcel_list[:4]])

        records.append({
            "khataExtractId": f"KHATA-8A-{idx:05d}",
            "khataNumber": khata,
            "ownerNameMr": primary["ownerNameMr"],
            "ownerNameEn": primary["ownerNameEn"],
            "villageMr": village,
            "villageEn": primary["villageEn"],
            "tehsilMr": primary["tehsilMr"],
            "districtMr": primary["districtMr"],
            "totalParcelCount": len(parcel_list),
            "parcelsSummary": parcels_summary,
            "consolidatedAreaHa": total_holding_area,
            "landAssessmentTaxRupees": total_tax,
            "localCessRupees": local_cess,
            "grandTotalTaxRupees": grand_tax,
            "taxPaymentStatus": "चालू वर्षाचा शेतसारा भरणा पूर्ण (Paid - No Dues)" if random.random() > 0.15 else "शेतसारा थकबाकी रु. ४२५/-"
        })
        idx += 1
    return records


# =============================================================================
# 3. VILLAGE FORM 6 (FERFAR MUTATION REGISTER) DATASET GENERATOR
# =============================================================================
def generate_ferfar_mutations(rural_records, count=5000):
    mutations = []
    MUTATION_TYPES = [
        ("खरेदी खत", "SALE_DEED", "नोंदणीकृत खरेदी दस्तान्वये मालकी हक्क हस्तांतरण"),
        ("वारस नोंद", "INHERITANCE", "मूळ खातेदाराच्या मृत्यूनंतर कायदेशीर वारसांची नोंद (कलम १४९/१५०)"),
        ("बक्षीस पत्र", "GIFT_DEED", "रक्ताच्या नात्यातील नातेवाईकास नोंदणीकृत बक्षीस पत्र दस्त"),
        ("हक्कसोड पत्र", "RELINQUISHMENT", "इतर सह-खातेदारांच्या लाभात स्व-हक्क सोडल्याबाबत नोंद"),
        ("बोजा नोंद", "MORTGAGE_ENTRY", "बँकेकडून घेतलेल्या शेती कर्जाचा अधिकार अभिलेखावर बोजा"),
        ("बोजा मुक्ती", "MORTGAGE_RELEASE", "बँक कर्ज पूर्ण परतफेड झाल्याने बोजा कमी करण्यात आला"),
        ("फाळणी / वाटणी", "PARTITION", "सह-खातेदारांमध्ये आपापसातील संमतीने जमिनीची हिस्सा वाटणी"),
    ]

    # Anchored Paper 1, 2, 3 Ferfars
    mutations.append({
        "mutationNo": "1842",
        "khasraNumber": "142/3A",
        "villageMr": "वाघोली",
        "tehsilMr": "हवेली",
        "districtMr": "पुणे",
        "mutationType": "खरेदी खत",
        "mutationCategory": "SALE_DEED",
        "description": "रजिस्ट्रार हवेली क्रमांक ४ येथील नोंदणीकृत खरेदी दस्त क्र. ४८२१/२०१८ अन्वये मालकी नोंद",
        "transferorMr": "विठ्ठल बाबुराव पाटील (विक्रेता)",
        "transfereeMr": "रमेश विठ्ठल पाटील (खरेदीदार)",
        "approvedDate": "2018-06-14",
        "approvingOfficer": "मंडळ अधिकारी (Circle Officer, Haveli)",
        "status": "प्रमाणित (Certified & Locked)"
    })
    mutations.append({
        "mutationNo": "2041",
        "khasraNumber": "248",
        "villageMr": "खडकवासला",
        "tehsilMr": "हवेली",
        "districtMr": "पुणे",
        "mutationType": "वारस नोंद",
        "mutationCategory": "INHERITANCE",
        "description": "मूळ खातेदार कै. बाबुराव विठ्ठल पाटील यांच्या निधनानंतर वारस हक्क नोंदणी",
        "transferorMr": "कै. बाबुराव विठ्ठल पाटील",
        "transfereeMr": "रमेश बाबुराव पाटील (वारसदार)",
        "approvedDate": "2020-03-22",
        "approvingOfficer": "मंडळ अधिकारी (Circle Officer, Haveli)",
        "status": "प्रमाणित (Certified & Locked)"
    })
    mutations.append({
        "mutationNo": "3045",
        "khasraNumber": "105/B",
        "villageMr": "त्र्यंबकेश्वर",
        "tehsilMr": "त्र्यंबकेश्वर",
        "districtMr": "नाशिक",
        "mutationType": "बोजा नोंद",
        "mutationCategory": "MORTGAGE_ENTRY",
        "description": "स्टेट बँक ऑफ इंडिया कृषी पीक कर्ज रु. १,२०,०००/- चा अधिकार अभिलेखावर बोजा नोंद",
        "transferorMr": "गणेश पांडुरंग पवार (कर्जदार)",
        "transfereeMr": "स्टेट बँक ऑफ इंडिया (बँक बोजाधारक)",
        "approvedDate": "2022-11-05",
        "approvingOfficer": "मंडळ अधिकारी (Circle Officer, Trimbak)",
        "status": "प्रमाणित (Certified & Locked)"
    })

    base_date = datetime(2014, 1, 1)
    for i in range(len(mutations) + 1, count + 1):
        ref_rec = random.choice(rural_records)
        m_type, m_cat, m_desc = random.choice(MUTATION_TYPES)
        rand_days = random.randint(10, 3950)
        entry_date = (base_date + timedelta(days=rand_days)).strftime("%Y-%m-%d")
        status = "प्रमाणित (Certified & Locked)" if random.random() > 0.08 else "तक्रार प्रलंबित (Dispute Objection Registered)"

        seller_fn = random.choice(FIRST_NAMES_MR)
        seller_sn = random.choice(SURNAMES_MR)

        mutations.append({
            "mutationNo": str(random.randint(1100, 9999)),
            "khasraNumber": ref_rec["khasraNumber"],
            "villageMr": ref_rec["villageMr"],
            "tehsilMr": ref_rec["tehsilMr"],
            "districtMr": ref_rec["districtMr"],
            "mutationType": m_type,
            "mutationCategory": m_cat,
            "description": f"{m_desc} - गट क्र. {ref_rec['khasraNumber']} खाते क्र. {ref_rec['khataNumber']}",
            "transferorMr": f"{seller_fn} {seller_sn}",
            "transfereeMr": ref_rec["ownerNameMr"],
            "approvedDate": entry_date,
            "approvingOfficer": f"मंडळ अधिकारी ({ref_rec['tehsilMr']})",
            "status": status
        })
    return mutations


# =============================================================================
# 4. URBAN PROPERTY CARD (AKHIV PATRIKA) DATASET GENERATOR
# =============================================================================
def generate_urban_property_cards(count=2500):
    records = []
    urban_tenures = [
        "पूर्ण खाजगी मालकी (Freehold Title)",
        "शासकीय ९९ वर्षे लीज (99-Year Govt Leasehold)",
        "म्हाडा पुनर्विकास भूखंड (MHADA Allotment)",
        "सिडको लीजहोल्ड प्लॉट (CIDCO Leasehold)",
        "गृहनिर्माण संस्था सामाईक मालकी (Co-op Housing Society)",
    ]

    for i in range(1, count + 1):
        city_info = random.choice(URBAN_CITIES)
        city_mr, city_en, tal_mr, tal_en, wards = city_info
        ward_mr = random.choice(wards)

        fn = random.choice(FIRST_NAMES_MR)
        mn = random.choice(FATHER_NAMES_MR)
        sn = random.choice(SURNAMES_MR)
        owner_mr = f"{fn} {mn} {sn}"
        owner_en = f"{FIRST_NAMES_EN[FIRST_NAMES_MR.index(fn)]} {FATHER_NAMES_EN[FATHER_NAMES_MR.index(mn)]} {SURNAMES_EN[SURNAMES_MR.index(sn)]}"

        cts_no = f"CTS-{random.randint(101, 8999)}{random.choice(['', '/A', '/B', '/1'])}"
        prn_no = f"PRN-MH-{random.randint(100000, 999999)}"
        carpet_sqm = round(random.uniform(45.0, 1850.0), 2)
        tenure = random.choice(urban_tenures)
        tax_status = "चालू आर्थिक वर्षाचा कर भरणा पूर्ण (Tax Paid - Nil Dues)" if random.random() > 0.15 else "महानगरपालिका मालमत्ता कर थकबाकी रु. २२,४००/-"
        enc = "निरंक (No Liens)" if random.random() > 0.35 else f"{random.choice(BANKS)} गृहकर्ज बोजा रु. {random.randint(15, 95)*100000:,}/-"

        records.append({
            "propertyCardId": f"PC-URBAN-{i:05d}",
            "ctsNumber": cts_no,
            "prnNumber": prn_no,
            "ownerNameMr": owner_mr,
            "ownerNameEn": owner_en,
            "cityMr": city_mr,
            "cityEn": city_en,
            "talukaMr": tal_mr,
            "talukaEn": tal_en,
            "wardMr": ward_mr,
            "carpetAreaSqMtr": carpet_sqm,
            "holdingType": tenure,
            "taxAssessmentStatus": tax_status,
            "encumbranceStatus": enc,
            "digitalCertificateNo": f"PC-DIGI-2026-{i:05d}"
        })
    return records


# =============================================================================
# 5. REGISTERED SALE DEED (CONVEYANCE CONTRACTS) DATASET GENERATOR
# =============================================================================
def generate_registered_sale_deeds(count=1500):
    records = []
    base_date = datetime(2018, 1, 1)

    for i in range(1, count + 1):
        dist_info = random.choice(RURAL_DISTRICTS)
        dist_mr, dist_en, teh_mr, teh_en, villages = dist_info
        village_mr = random.choice(villages)

        seller_fn = random.choice(FIRST_NAMES_MR)
        seller_sn = random.choice(SURNAMES_MR)
        buyer_fn = random.choice(FIRST_NAMES_MR)
        buyer_sn = random.choice(SURNAMES_MR)

        khasra_no = f"{random.randint(10, 450)}/{random.randint(1, 4)}"
        area_ha = round(random.uniform(0.50, 4.20), 2)
        price_lakhs = round(area_ha * random.uniform(15.0, 45.0), 2)
        rr_lakhs = round(price_lakhs * random.uniform(0.85, 1.05), 2)
        stamp_duty = round(price_lakhs * 100000 * 0.06)  # 6% stamp duty in Maharashtra
        reg_fee = 30000  # Cap in MH

        rand_days = random.randint(10, 2900)
        exec_date = (base_date + timedelta(days=rand_days)).strftime("%Y-%m-%d")

        records.append({
            "deedDocNumber": f"DOC-SRO-{teh_en[:3].upper()}-{i:04d}-2024",
            "sroOfficeName": f"दुय्यम निबंधक वर्ग-२ ({teh_mr}, {dist_mr})",
            "executionDate": exec_date,
            "khasraNumber": khasra_no,
            "villageMr": village_mr,
            "tehsilMr": teh_mr,
            "districtMr": dist_mr,
            "landAreaHa": area_ha,
            "sellerNameMr": f"{seller_fn} {seller_sn}",
            "buyerNameMr": f"{buyer_fn} {buyer_sn}",
            "considerationAmountRupees": int(price_lakhs * 100000),
            "readyReckonerValueRupees": int(rr_lakhs * 100000),
            "stampDutyPaidRupees": stamp_duty,
            "registrationFeePaidRupees": reg_fee,
            "boundaryNorth": f"गट क्रमांक {random.randint(10, 450)} ची जमीन",
            "boundarySouth": "सार्वजनिक पाणंद रस्ता",
            "boundaryEast": f"गट क्रमांक {random.randint(10, 450)} ची शेतजमीन",
            "boundaryWest": "कालवा / ओढा सिमा",
            "status": "नोंदणीकृत व मुद्रांकित (Registered & Stamped)"
        })
    return records


# =============================================================================
# 6. ENCUMBRANCE 30-YEAR SEARCH REPORT DATASET GENERATOR
# =============================================================================
def generate_search_reports(count=1000):
    records = []
    advocates = [
        "अ‍ॅड. वि. ना. कुलकर्णी (B.Sc, LL.B, जिल्हा न्यायालय पुणे)",
        "अ‍ॅड. एस. पी. जोशी (LL.M, मुंबई उच्च न्यायालय)",
        "अ‍ॅड. एम. आर. देशमुख (दीर्घानुभवी महसूल विधिज्ञ, नाशिक)",
        "अ‍ॅड. पी. बी. पाटील (कायदेशीर सल्लागार, कोल्हापूर)",
    ]

    for i in range(1, count + 1):
        dist_info = random.choice(RURAL_DISTRICTS)
        dist_mr, dist_en, teh_mr, teh_en, villages = dist_info
        village_mr = random.choice(villages)
        khasra = f"{random.randint(20, 350)}"
        owner = f"{random.choice(FIRST_NAMES_MR)} {random.choice(SURNAMES_MR)}"

        has_enc = random.random() > 0.70
        opinion = "दोषयुक्त / बँक बोजा चालू (Title Subject to Active Bank Mortgage)" if has_enc else "स्वच्छ, निर्वेध व बाजारक्षम मालकी हक्क (Clean, Clear & Marketable Title)"

        records.append({
            "reportId": f"SEARCH-TITLE-{i:04d}",
            "advocateName": random.choice(advocates),
            "searchPeriod": "1994 ते 2024 (सलग ३० वर्षे शोध कालावधी)",
            "khasraNumber": khasra,
            "villageMr": village_mr,
            "tehsilMr": teh_mr,
            "districtMr": dist_mr,
            "titleHolderNameMr": owner,
            "subRegistrarIndexesChecked": "सूची क्रमांक १ व २ (Index-I & Index-II SRO Online Verification)",
            "activeMortgageDetected": "होय (बँक बोजा चालू)" if has_enc else "नाही (कोणताही बोजा नाही)",
            "courtStayDetected": "नाही (कोणताही दावा प्रलंबित नाही)",
            "finalLegalOpinion": opinion,
            "reportIssuedDate": "2024-08-15"
        })
    return records


# =============================================================================
# 7. GROUND-TRUTH FRAUD & TAMPERING BENCHMARK CASES
# =============================================================================
def generate_fraud_benchmarks(count=25000):
    benchmarks = []
    # Distribute count evenly across 4 fraud categories (plus 1 anchor)
    per_cat = max(100, (count - 1) // 4)
    # 1. Paper 4 Anchored Case:
    benchmarks.append({
        "caseId": "FRAUD-CASE-001-PAPER4",
        "documentType": "7/12 Satbara Extract",
        "khasraNumber": "999/X",
        "village": "खोट्यावाडी (Fake Village)",
        "claimedOwner": "विक्रम बनावटराव शिंदे (Vikram Banavatrao Shinde)",
        "defectCategory": "FABRICATED_DOCUMENT_AND_FORGED_SEAL",
        "expectedAuthenticityRating": "HIGH_RISK_FORGERY",
        "forensicIndicators": [
            "Village Khotyawadi does not exist in 1M Mahabhulekh Census Master",
            "JPEG Error Level Analysis (ELA) detected high-contrast Photoshop overlay around seal",
            "Ferfar Entry No. 999 has no record in State Mutation Ledgers",
            "Duplicate collision alert triggered"
        ]
    })

    # 2. Duplicate Land Claims
    for i in range(1, per_cat + 1):
        benchmarks.append({
            "caseId": f"FRAUD-COLLISION-{i:03d}",
            "documentType": "7/12 Satbara Extract",
            "khasraNumber": f"{random.randint(10, 150)}/{random.randint(1, 3)}",
            "village": random.choice(["वाघोली", "खडकवासला", "कळमेश्वर", "त्र्यंबकेश्वर"]),
            "claimedOwner": f"{random.choice(FIRST_NAMES_MR)} {random.choice(SURNAMES_MR)} (Duplicate Claimant)",
            "defectCategory": "DUPLICATE_VILLAGE_CLAIM",
            "expectedAuthenticityRating": "NEEDS_HUMAN_INSPECTION",
            "forensicIndicators": [
                "Survey Number already registered to a different active titleholder in database",
                "Simultaneous active ownership conflict flagged for revenue officer inquiry"
            ]
        })

    # 3. Area Arithmetic Violations
    for i in range(1, per_cat + 1):
        benchmarks.append({
            "caseId": f"FRAUD-AREA-MISMATCH-{i:03d}",
            "documentType": "7/12 Satbara Extract",
            "khasraNumber": f"{random.randint(151, 300)}",
            "village": "चाकण",
            "claimedOwner": f"{random.choice(FIRST_NAMES_MR)} {random.choice(SURNAMES_MR)}",
            "defectCategory": "AREA_ARITHMETIC_MISMATCH",
            "expectedAuthenticityRating": "NEEDS_HUMAN_INSPECTION",
            "forensicIndicators": [
                "Stated Total Area (5.50 Ha) does not equal Cultivable (2.10 Ha) + Uncultivable (1.20 Ha)",
                "Discrepancy of 2.20 Hectares indicates potential encroachment or typo"
            ]
        })

    # 4. Class-2 Illegal Transfer
    for i in range(1, per_cat + 1):
        benchmarks.append({
            "caseId": f"FRAUD-CLASS2-VIOLATION-{i:03d}",
            "documentType": "7/12 Satbara Extract",
            "khasraNumber": f"{random.randint(301, 450)}/A",
            "village": "इगतपुरी",
            "claimedOwner": f"{random.choice(FIRST_NAMES_MR)} {random.choice(SURNAMES_MR)}",
            "defectCategory": "RESTRICTED_CLASS2_ILLEGAL_TRANSFER",
            "expectedAuthenticityRating": "HIGH_RISK_FORGERY",
            "forensicIndicators": [
                "Document marked as Class-2 Tribal Grant but registered via regular private Sale Deed",
                "Mandatory District Collector prior sanction order missing under MLRC Section 36A"
            ]
        })

    # 5. ELA Tamper Signatures
    for i in range(1, per_cat + 1):
        benchmarks.append({
            "caseId": f"FRAUD-ELA-TAMPER-{i:03d}",
            "documentType": "7/12 Satbara Extract",
            "khasraNumber": f"{random.randint(50, 200)}/2",
            "village": "हडपसर",
            "claimedOwner": f"{random.choice(FIRST_NAMES_MR)} {random.choice(SURNAMES_MR)}",
            "defectCategory": "DIGITAL_CANVA_PHOTOSHOP_TAMPER",
            "expectedAuthenticityRating": "HIGH_RISK_FORGERY",
            "forensicIndicators": [
                "Error Level Analysis (ELA) score 0.420 < threshold 0.60",
                "Digitally altered boundary numbers and owner name overlays detected on aged paper texture"
            ]
        })

    return benchmarks


# =============================================================================
# 8. NON-LAND DOCUMENT REJECTION SUITE (NEGATIVE CONTROLS)
# =============================================================================
def generate_non_land_rejections(count=25000):
    items = []
    types = [
        ("GST_REGISTRATION_CERTIFICATE", "GST REG-06 Certificate of Registration for Commercial Business"),
        ("FSSAI_FOOD_LICENSE", "Food Safety and Standards Authority of India License Form C"),
        ("ELECTRICITY_UTILITY_BILL", "MSEDCL Residential / Commercial Electricity Bill"),
        ("RESTAURANT_TAX_INVOICE", "Commercial Retail Tax Invoice / Purchase Receipt"),
        ("EMPLOYEE_SALARY_SLIP", "Corporate Monthly Pay Slip with PF and Tax Deductions"),
        ("INCOME_TAX_PAN_CARD", "National Income Tax Identity Card Metadata"),
        ("ACADEMIC_DEGREE_CERTIFICATE", "University Engineering Degree / Marksheet Document")
    ]
    for i in range(1, count + 1):
        cat_code, desc = random.choice(types)
        items.append({
            "docId": f"NONLAND-TEST-{i:04d}",
            "fileName": f"{cat_code.lower()}_sample_{i:03d}.pdf",
            "detectedCategory": cat_code,
            "description": desc,
            "expectedAction": "REJECT_WITH_HTTP_422",
            "expectedErrorMessage": "THE UPLOADED DOCUMENT IS NOT A LAND RECORD",
            "modalTrigger": "NonLandRecordModal"
        })
    return items


# =============================================================================
# 9. MULTI-TABLE SQLITE DATABASE BUILDER
# =============================================================================
def build_sqlite_database(rural_712, form_8a, property_cards, ferfar_mutations, sale_deeds, search_reports, fraud_cases):
    print(f"Building multi-table indexed SQLite database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Satbara Records Table
    cur.execute("DROP TABLE IF EXISTS satbara_records")
    cur.execute("""
        CREATE TABLE satbara_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recordId TEXT UNIQUE,
            khasraNumber TEXT,
            khataNumber TEXT,
            ownerNameMr TEXT,
            ownerNameEn TEXT,
            fatherNameMr TEXT,
            villageMr TEXT,
            villageEn TEXT,
            tehsilMr TEXT,
            tehsilEn TEXT,
            districtMr TEXT,
            districtEn TEXT,
            totalAreaHa REAL,
            cultivableAreaHa REAL,
            uncultivableAreaHa REAL,
            ownershipType TEXT,
            ownershipCategory TEXT,
            encumbranceStatus TEXT,
            lastMutationNo TEXT,
            ulpinCode TEXT,
            digitalSignatureHash TEXT,
            verificationStatus TEXT
        )
    """)

    # 2. Form 8A Table
    cur.execute("DROP TABLE IF EXISTS khata_8a_records")
    cur.execute("""
        CREATE TABLE khata_8a_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            khataExtractId TEXT UNIQUE,
            khataNumber TEXT,
            ownerNameMr TEXT,
            ownerNameEn TEXT,
            villageMr TEXT,
            villageEn TEXT,
            tehsilMr TEXT,
            districtMr TEXT,
            totalParcelCount INTEGER,
            parcelsSummary TEXT,
            consolidatedAreaHa REAL,
            landAssessmentTaxRupees REAL,
            localCessRupees REAL,
            grandTotalTaxRupees REAL,
            taxPaymentStatus TEXT
        )
    """)

    # 3. Urban Property Cards Table
    cur.execute("DROP TABLE IF EXISTS urban_property_cards")
    cur.execute("""
        CREATE TABLE urban_property_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            propertyCardId TEXT UNIQUE,
            ctsNumber TEXT,
            prnNumber TEXT,
            ownerNameMr TEXT,
            ownerNameEn TEXT,
            cityMr TEXT,
            cityEn TEXT,
            talukaMr TEXT,
            talukaEn TEXT,
            wardMr TEXT,
            carpetAreaSqMtr REAL,
            holdingType TEXT,
            taxAssessmentStatus TEXT,
            encumbranceStatus TEXT,
            digitalCertificateNo TEXT
        )
    """)

    # 4. Ferfar Mutations Table
    cur.execute("DROP TABLE IF EXISTS ferfar_mutations")
    cur.execute("""
        CREATE TABLE ferfar_mutations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mutationNo TEXT,
            khasraNumber TEXT,
            villageMr TEXT,
            tehsilMr TEXT,
            districtMr TEXT,
            mutationType TEXT,
            mutationCategory TEXT,
            description TEXT,
            transferorMr TEXT,
            transfereeMr TEXT,
            approvedDate TEXT,
            approvingOfficer TEXT,
            status TEXT
        )
    """)

    # 5. Registered Sale Deeds Table
    cur.execute("DROP TABLE IF EXISTS registered_sale_deeds")
    cur.execute("""
        CREATE TABLE registered_sale_deeds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deedDocNumber TEXT UNIQUE,
            sroOfficeName TEXT,
            executionDate TEXT,
            khasraNumber TEXT,
            villageMr TEXT,
            tehsilMr TEXT,
            districtMr TEXT,
            landAreaHa REAL,
            sellerNameMr TEXT,
            buyerNameMr TEXT,
            considerationAmountRupees INTEGER,
            readyReckonerValueRupees INTEGER,
            stampDutyPaidRupees INTEGER,
            registrationFeePaidRupees INTEGER,
            boundaryNorth TEXT,
            boundarySouth TEXT,
            boundaryEast TEXT,
            boundaryWest TEXT,
            status TEXT
        )
    """)

    # 6. Fraud Benchmarks Table
    cur.execute("DROP TABLE IF EXISTS fraud_benchmarks")
    cur.execute("""
        CREATE TABLE fraud_benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caseId TEXT UNIQUE,
            documentType TEXT,
            khasraNumber TEXT,
            village TEXT,
            claimedOwner TEXT,
            defectCategory TEXT,
            expectedAuthenticityRating TEXT,
            forensicIndicators TEXT
        )
    """)

    # Populate Tables
    cur.executemany("""
        INSERT INTO satbara_records (
            recordId, khasraNumber, khataNumber, ownerNameMr, ownerNameEn, fatherNameMr,
            villageMr, villageEn, tehsilMr, tehsilEn, districtMr, districtEn,
            totalAreaHa, cultivableAreaHa, uncultivableAreaHa, ownershipType,
            ownershipCategory, encumbranceStatus, lastMutationNo, ulpinCode,
            digitalSignatureHash, verificationStatus
        ) VALUES (
            :recordId, :khasraNumber, :khataNumber, :ownerNameMr, :ownerNameEn, :fatherNameMr,
            :villageMr, :villageEn, :tehsilMr, :tehsilEn, :districtMr, :districtEn,
            :totalAreaHa, :cultivableAreaHa, :uncultivableAreaHa, :ownershipType,
            :ownershipCategory, :encumbranceStatus, :lastMutationNo, :ulpinCode,
            :digitalSignatureHash, :verificationStatus
        )
    """, rural_712)

    cur.executemany("""
        INSERT INTO khata_8a_records (
            khataExtractId, khataNumber, ownerNameMr, ownerNameEn,
            villageMr, villageEn, tehsilMr, districtMr, totalParcelCount,
            parcelsSummary, consolidatedAreaHa, landAssessmentTaxRupees,
            localCessRupees, grandTotalTaxRupees, taxPaymentStatus
        ) VALUES (
            :khataExtractId, :khataNumber, :ownerNameMr, :ownerNameEn,
            :villageMr, :villageEn, :tehsilMr, :districtMr, :totalParcelCount,
            :parcelsSummary, :consolidatedAreaHa, :landAssessmentTaxRupees,
            :localCessRupees, :grandTotalTaxRupees, :taxPaymentStatus
        )
    """, form_8a)

    cur.executemany("""
        INSERT INTO urban_property_cards (
            propertyCardId, ctsNumber, prnNumber, ownerNameMr, ownerNameEn,
            cityMr, cityEn, talukaMr, talukaEn, wardMr, carpetAreaSqMtr,
            holdingType, taxAssessmentStatus, encumbranceStatus, digitalCertificateNo
        ) VALUES (
            :propertyCardId, :ctsNumber, :prnNumber, :ownerNameMr, :ownerNameEn,
            :cityMr, :cityEn, :talukaMr, :talukaEn, :wardMr, :carpetAreaSqMtr,
            :holdingType, :taxAssessmentStatus, :encumbranceStatus, :digitalCertificateNo
        )
    """, property_cards)

    cur.executemany("""
        INSERT INTO ferfar_mutations (
            mutationNo, khasraNumber, villageMr, tehsilMr, districtMr,
            mutationType, mutationCategory, description, transferorMr,
            transfereeMr, approvedDate, approvingOfficer, status
        ) VALUES (
            :mutationNo, :khasraNumber, :villageMr, :tehsilMr, :districtMr,
            :mutationType, :mutationCategory, :description, :transferorMr,
            :transfereeMr, :approvedDate, :approvingOfficer, :status
        )
    """, ferfar_mutations)

    cur.executemany("""
        INSERT INTO registered_sale_deeds (
            deedDocNumber, sroOfficeName, executionDate, khasraNumber,
            villageMr, tehsilMr, districtMr, landAreaHa, sellerNameMr,
            buyerNameMr, considerationAmountRupees, readyReckonerValueRupees,
            stampDutyPaidRupees, registrationFeePaidRupees, boundaryNorth,
            boundarySouth, boundaryEast, boundaryWest, status
        ) VALUES (
            :deedDocNumber, :sroOfficeName, :executionDate, :khasraNumber,
            :villageMr, :tehsilMr, :districtMr, :landAreaHa, :sellerNameMr,
            :buyerNameMr, :considerationAmountRupees, :readyReckonerValueRupees,
            :stampDutyPaidRupees, :registrationFeePaidRupees, :boundaryNorth,
            :boundarySouth, :boundaryEast, :boundaryWest, :status
        )
    """, sale_deeds)

    fraud_rows = []
    for f in fraud_cases:
        row = dict(f)
        row["forensicIndicators"] = " | ".join(f["forensicIndicators"])
        fraud_rows.append(row)

    cur.executemany("""
        INSERT INTO fraud_benchmarks (
            caseId, documentType, khasraNumber, village, claimedOwner,
            defectCategory, expectedAuthenticityRating, forensicIndicators
        ) VALUES (
            :caseId, :documentType, :khasraNumber, :village, :claimedOwner,
            :defectCategory, :expectedAuthenticityRating, :forensicIndicators
        )
    """, fraud_rows)

    # Sub-millisecond Lookup Indexes
    cur.execute("CREATE INDEX idx_satbara_khasra ON satbara_records(khasraNumber, villageMr)")
    cur.execute("CREATE INDEX idx_satbara_khata ON satbara_records(khataNumber, villageMr)")
    cur.execute("CREATE INDEX idx_8a_khata ON khata_8a_records(khataNumber, villageMr)")
    cur.execute("CREATE INDEX idx_property_cts ON urban_property_cards(ctsNumber, cityMr)")
    cur.execute("CREATE INDEX idx_ferfar_khasra ON ferfar_mutations(khasraNumber, villageMr)")
    cur.execute("CREATE INDEX idx_ferfar_mut ON ferfar_mutations(mutationNo, villageMr)")
    cur.execute("CREATE INDEX idx_deed_khasra ON registered_sale_deeds(khasraNumber, villageMr)")
    cur.execute("CREATE INDEX idx_fraud_khasra ON fraud_benchmarks(khasraNumber, village)")

    conn.commit()
    conn.close()
    print("✅ Multi-Table SQLite Registry built and indexed successfully!")


# =============================================================================
# MAIN ORCHESTRATION PIPELINE
# =============================================================================
def main():
    print("====================================================================")
    print("🚀 BHUNETRA MULTI-DOCUMENT SYNTHETIC DATASET GENERATION PIPELINE")
    print("====================================================================")

    # 1. Rural 7/12 Satbara
    print("[1/8] Generating 25,000 diverse 7/12 Satbara Records...")
    rural_712 = generate_diverse_712(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "01_diverse_712_satbara_records.json"), rural_712)
    export_csv(os.path.join(OUTPUT_DIR, "01_diverse_712_satbara_records.csv"), rural_712)
    print(f"      -> {len(rural_712):,} records saved.")

    # 2. Village Form 8-A (Khata Extract)
    print("[2/8] Generating 25,000 Village Form 8-A Consolidated Khata Extracts...")
    form_8a = generate_form_8a(rural_712, count=25000)
    export_json(os.path.join(OUTPUT_DIR, "02_village_form_8a_khata_extracts.json"), form_8a)
    export_csv(os.path.join(OUTPUT_DIR, "02_village_form_8a_khata_extracts.csv"), form_8a)
    print(f"      -> {len(form_8a):,} extracts saved.")

    # 3. Village Form 6 (Ferfar Mutation Register)
    print("[3/8] Generating 25,000 Village Form 6 Mutation Ledgers...")
    ferfar = generate_ferfar_mutations(rural_712, count=25000)
    export_json(os.path.join(OUTPUT_DIR, "03_village_form_6_ferfar_mutations.json"), ferfar)
    export_csv(os.path.join(OUTPUT_DIR, "03_village_form_6_ferfar_mutations.csv"), ferfar)
    print(f"      -> {len(ferfar):,} mutations saved.")

    # 4. Urban Property Cards (Akhiv Patrika / CTS)
    print("[4/8] Generating 25,000 Urban Property Cards (CTS numbers)...")
    prop_cards = generate_urban_property_cards(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "04_urban_property_cards.json"), prop_cards)
    export_csv(os.path.join(OUTPUT_DIR, "04_urban_property_cards.csv"), prop_cards)
    print(f"      -> {len(prop_cards):,} property cards saved.")

    # 5. Registered Sale Deeds
    print("[5/8] Generating 25,000 Registered Sale Deeds (Sub-Registrar Contracts)...")
    sale_deeds = generate_registered_sale_deeds(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "05_registered_sale_deeds.json"), sale_deeds)
    export_csv(os.path.join(OUTPUT_DIR, "05_registered_sale_deeds.csv"), sale_deeds)
    print(f"      -> {len(sale_deeds):,} deeds saved.")

    # 6. Encumbrance & 30-Year Search Reports
    print("[6/8] Generating 25,000 30-Year Title Search Reports...")
    search_reports = generate_search_reports(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "06_encumbrance_search_reports.json"), search_reports)
    export_csv(os.path.join(OUTPUT_DIR, "06_encumbrance_search_reports.csv"), search_reports)
    print(f"      -> {len(search_reports):,} search reports saved.")

    # 7. Fraud & Tampering Benchmarks
    print("[7/8] Generating 25,000 Ground-Truth Fraud & Tampering Benchmark Cases...")
    fraud_cases = generate_fraud_benchmarks(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "07_fraud_adversarial_benchmarks.json"), fraud_cases)
    print(f"      -> {len(fraud_cases):,} benchmark cases saved.")

    # 8. Negative Control Non-Land Documents
    print("[8/8] Generating 25,000 Negative Control Non-Land Documents (Rejection Suite)...")
    non_land = generate_non_land_rejections(count=25000)
    export_json(os.path.join(OUTPUT_DIR, "08_non_land_rejection_suite.json"), non_land)
    export_csv(os.path.join(OUTPUT_DIR, "08_non_land_rejection_suite.csv"), non_land)
    print(f"      -> {len(non_land):,} non-land rejection cases saved.")

    # 9. Multi-Table SQLite Registry
    build_sqlite_database(rural_712, form_8a, prop_cards, ferfar, sale_deeds, search_reports, fraud_cases)

    # 10. Datasets Manifest & Documentation
    manifest = {
        "title": "Bhunetra Multi-Document Land & Property Synthetic Dataset Suite",
        "problemStatement": "SIH26018 - Intelligent Land Record Digitization & Validation",
        "generatedAt": datetime.now().isoformat(),
        "totalRecords": (
            len(rural_712) + len(form_8a) + len(ferfar) + len(prop_cards) +
            len(sale_deeds) + len(search_reports) + len(fraud_cases) + len(non_land)
        ),
        "databaseFile": "backend/app/data/synthetic_land_registry.db",
        "datasets": {
            "01_diverse_712_satbara_records": {
                "description": "Maharashtra Rural 7/12 land extracts with diverse statutory tenures & bank liens",
                "count": len(rural_712),
                "formats": ["JSON", "CSV", "SQLite (satbara_records)"],
                "tenures": [t[0] for t in TENURES]
            },
            "02_village_form_8a_khata_extracts": {
                "description": "Consolidated land holding book per farmer across all village parcels with tax assessment",
                "count": len(form_8a),
                "formats": ["JSON", "CSV", "SQLite (khata_8a_records)"]
            },
            "03_village_form_6_ferfar_mutations": {
                "description": "Historical mutation register entries tracking title transfer chain of custody",
                "count": len(ferfar),
                "formats": ["JSON", "CSV", "SQLite (ferfar_mutations)"]
            },
            "04_urban_property_cards": {
                "description": "Municipal CTS City Survey numbers and PRN property cards for urban non-agricultural land",
                "count": len(prop_cards),
                "formats": ["JSON", "CSV", "SQLite (urban_property_cards)"],
                "cities": [c[1] for c in URBAN_CITIES]
            },
            "05_registered_sale_deeds": {
                "description": "Sub-Registrar Office conveyance deeds with boundaries, consideration, and stamp duty",
                "count": len(sale_deeds),
                "formats": ["JSON", "CSV", "SQLite (registered_sale_deeds)"]
            },
            "06_encumbrance_search_reports": {
                "description": "Advocate 30-year title search opinions on encumbrance and marketability",
                "count": len(search_reports),
                "formats": ["JSON", "CSV"]
            },
            "07_fraud_adversarial_benchmarks": {
                "description": "Labeled adversarial test cases for benchmarking ELA forensic and duplicate detection engines",
                "count": len(fraud_cases),
                "formats": ["JSON", "SQLite (fraud_benchmarks)"]
            },
            "08_non_land_rejection_suite": {
                "description": "Commercial invoices, utility bills, and GST certificates to test negative rejection filter",
                "count": len(non_land),
                "formats": ["JSON"]
            }
        }
    }
    export_json(os.path.join(OUTPUT_DIR, "datasets_manifest.json"), manifest)

    print("====================================================================")
    print(f"🎉 ALL SYNTHETIC DATASETS GENERATED & ORGANIZED IN: {OUTPUT_DIR}")
    print(f"📁 Total generated records: {manifest['totalRecords']:,}")
    print(f"🗄️ Database available at: {DB_PATH}")
    print("====================================================================")

if __name__ == "__main__":
    main()
