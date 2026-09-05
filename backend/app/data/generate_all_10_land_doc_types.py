"""
generate_all_10_land_doc_types.py
=============================================================================
Generates the complete 30-document demo suite across all 10 official Indian
land and property document types (2 Authorized + 1 Tampered each).
Outputs:
  - 30 visual SVG files in `frontend/public/demo_papers/`
  - JavaScript catalog in `frontend/src/data/demoDocumentsCatalog.js`
"""
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
FRONTEND_PUBLIC_DEMO = os.path.join(BASE_DIR, "frontend", "public", "demo_papers")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")

os.makedirs(FRONTEND_PUBLIC_DEMO, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

# ── 10 Document Type Definitions ─────────────────────────────────────────────
DOC_TYPES_DATA = [
    {
        "id": "712_extract",
        "categoryKey": "VILLAGE_FORM_7_12",
        "nameMr": "गाव नमुना ७/१२ उतारा",
        "nameEn": "Village Form 7/12 Extract",
        "icon": "description",
        "badge": "गाव नमुना ७/१२",
        "papers": [
            {
                "key": "712_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Wagholi, Pune",
                "isForged": False,
                "confidence": 0.994,
                "authenticScore": "99.4% AUTHENTIC",
                "elaStatus": "Uniform JPEG Compression (Tamper-Free)",
                "mutationLedger": "Ferfar #1842 Verified in Mahabhulekh",
                "collisionCount": "0 Collisions (Unique)",
                "id": "REC-712-PUN-001",
                "title": "Village Form 7/12 Extract · Wagholi, Pune (७/१२ उतारा)",
                "village": "वाघोली (Wagholi)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "142/3A",
                "khataNumber": "582",
                "ownerName": "रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)",
                "area": "1.45 Hectare",
                "assessment": "₹ 4,500/-",
                "ownershipType": "भोगवटादार वर्ग - १ (Class-1)",
                "extraDetails": {
                    "potKharaba": "0.10 Ha",
                    "cultivableArea": "1.35 Ha",
                    "crops": "ऊस (Sugarcane) - बागायत",
                    "bankLien": "Bank of Maharashtra Crop Loan ₹ 50,000/-"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 35, "height": 6, "label": "गाव: वाघोली (Haveli, Pune)"},
                    "khasraNumber": {"top": 22, "left": 10, "width": 38, "height": 7, "label": "गट क्र. १४२/३अ (Khasra 142/3A)"},
                    "khataNumber": {"top": 31, "left": 10, "width": 38, "height": 7, "label": "खाते क्र. ५८२ (Khata 582)"},
                    "ownerName": {"top": 41, "left": 10, "width": 78, "height": 10, "label": "खातेदार: रमेश विठ्ठल पाटील"},
                    "area": {"top": 53, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: १.४५ हेक्टर (1.45 Ha)"},
                    "assessment": {"top": 63, "left": 10, "width": 45, "height": 7, "label": "आकारणी: ₹ ४५०० (Assessment)"},
                    "stamp": {"top": 78, "left": 60, "width": 32, "height": 16, "label": "तलाठी डिजिटल शिक्का (NIC Verified)"}
                }
            },
            {
                "key": "712_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Khadakwasla, Pune",
                "isForged": False,
                "confidence": 0.986,
                "authenticScore": "98.6% AUTHENTIC",
                "elaStatus": "Uniform ELA Gradient (Verified)",
                "mutationLedger": "Ferfar #2481 Matched with SRO",
                "collisionCount": "0 Collisions (Unique)",
                "id": "REC-712-PUN-002",
                "title": "Village Form 7/12 Extract · Khadakwasla, Pune",
                "village": "खडकवासला (Khadakwasla)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "248",
                "khataNumber": "712",
                "ownerName": "रमेश बाबूराव पाटील व सुरेश पाटील (Joint)",
                "area": "2.10 Hectare",
                "assessment": "₹ 3,200/-",
                "ownershipType": "भोगवटादार वर्ग - १ (Joint Co-owner)",
                "extraDetails": {
                    "potKharaba": "0.15 Ha",
                    "cultivableArea": "1.95 Ha",
                    "crops": "गहू व भाजीपाला (Wheat & Veg)",
                    "bankLien": "State Bank of India KCC Loan ₹ 1,20,000/-"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 12, "width": 36, "height": 6, "label": "गाव: खडकवासला"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 38, "height": 8, "label": "गट क्र. २४८ (Survey 248)"},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "खाते क्र. ७१२ (Khata 712)"},
                    "ownerName": {"top": 40, "left": 10, "width": 80, "height": 10, "label": "खातेदार: रमेश बाबूराव पाटील व इतर"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: २.१० हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "आकारणी: ₹ ३२००"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "तलाठी महसूल शिक्का"}
                }
            },
            {
                "key": "712_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Fake Claim & Altered Area",
                "isForged": True,
                "confidence": 0.142,
                "authenticScore": "14.2% FRAUD ALERT",
                "elaStatus": "High Noise Anomaly (Digitally Manipulated Text)",
                "mutationLedger": "Unregistered Ferfar #9999 (Not Found)",
                "collisionCount": "3 Geographic Collisions Detected",
                "id": "REC-712-FRAUD-001",
                "title": "⚠️ Tampered 7/12 Extract · Forged Fake Claim (अनधिकृत)",
                "village": "खोट्यावाडी (Fake Village)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "999/X",
                "khataNumber": "999",
                "ownerName": "विक्रम बनावटराव शिंदे (Unauthorized Claim)",
                "area": "9.99 Hectare (Altered)",
                "assessment": "₹ 9,999/-",
                "ownershipType": "⚠️ अनधिकृत कब्जा (Fraudulent Tenure)",
                "extraDetails": {
                    "potKharaba": "0.00 Ha",
                    "cultivableArea": "9.99 Ha",
                    "crops": "अवैध बिगरशेती वापर (Illegal NA)",
                    "bankLien": "AI ALERT: Fake Seal & Unmatched Khata"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 12, "width": 38, "height": 6, "label": "❌ खोट्यावाडी (Non-Existent Village)", "isTampered": True},
                    "khasraNumber": {"top": 22, "left": 10, "width": 38, "height": 7, "label": "❌ ९९९/X (Fabricated Khasra No.)", "isTampered": True},
                    "khataNumber": {"top": 31, "left": 10, "width": 38, "height": 7, "label": "❌ खाते क्र. ९९९ (Duplicate Collision)", "isTampered": True},
                    "ownerName": {"top": 41, "left": 10, "width": 78, "height": 10, "label": "❌ बनावट खातेदार: विक्रम शिंदे", "isTampered": True},
                    "area": {"top": 53, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र ९.९९ हेक्टर (Area Math Mismatch)", "isTampered": True},
                    "stamp": {"top": 75, "left": 55, "width": 38, "height": 20, "label": "❌ बनावट / विसंगत तलाठी शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "8a_khata",
        "categoryKey": "VILLAGE_FORM_8_A",
        "nameMr": "गाव नमुना ८-अ खाते नोंद",
        "nameEn": "Village Form 8-A Khata Sheet",
        "icon": "format_list_bulleted",
        "badge": "गाव नमुना ८-अ",
        "papers": [
            {
                "key": "8a_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Trimbakeshwar, Nashik",
                "isForged": False,
                "confidence": 0.991,
                "authenticScore": "99.1% AUTHENTIC",
                "elaStatus": "Uniform Paper Density & Math Verified",
                "mutationLedger": "Linked with Mahabhulekh Khata #341",
                "collisionCount": "0 Collisions",
                "id": "REC-8A-NSK-001",
                "title": "Village Form 8-A · Trimbakeshwar, Nashik (८-अ खातेवही)",
                "village": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "tehsil": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "105/B, 112/1",
                "khataNumber": "341",
                "ownerName": "गणेश पांडुरंग पवार (Ganesh Pandurang Pawar)",
                "area": "0.85 Hectare (2 Parcels)",
                "assessment": "₹ 1,800/-",
                "ownershipType": "भोगवटादार वर्ग - १ (Class-1)",
                "extraDetails": {
                    "totalParcels": "2 Parcels",
                    "parcel1": "Gat 105/B (0.50 Ha, ₹1000)",
                    "parcel2": "Gat 112/1 (0.35 Ha, ₹800)",
                    "localCess": "₹ 360/- Zilla Parishad Tax"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 15, "width": 40, "height": 6, "label": "गाव: त्र्यंबकेश्वर (Nashik)"},
                    "khasraNumber": {"top": 22, "left": 12, "width": 36, "height": 7, "label": "गट क्र. १०५/ब, ११२/१"},
                    "khataNumber": {"top": 31, "left": 12, "width": 36, "height": 7, "label": "खाते क्र. ३४१"},
                    "ownerName": {"top": 41, "left": 12, "width": 75, "height": 10, "label": "खातेदार: गणेश पांडुरंग पवार"},
                    "area": {"top": 53, "left": 12, "width": 42, "height": 8, "label": "एकूण क्षेत्र: ०.८५ हेक्टर"},
                    "assessment": {"top": 63, "left": 12, "width": 42, "height": 7, "label": "एकूण जुमला आकारणी: ₹ १८००"},
                    "stamp": {"top": 77, "left": 62, "width": 30, "height": 16, "label": "तहसील कार्यालय अधिकृत शिक्का"}
                }
            },
            {
                "key": "8a_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Hingna, Nagpur",
                "isForged": False,
                "confidence": 0.984,
                "authenticScore": "98.4% AUTHENTIC",
                "elaStatus": "Uniform Typography & Tax Ledger Consistent",
                "mutationLedger": "Khata #582 Synced with Land DB",
                "collisionCount": "0 Collisions",
                "id": "REC-8A-NGP-002",
                "title": "Village Form 8-A · Hingna, Nagpur",
                "village": "हिंगणा (Hingna)",
                "tehsil": "हिंगणा (Hingna)",
                "district": "नागपूर (Nagpur)",
                "khasraNumber": "204/5, 208/2",
                "khataNumber": "582",
                "ownerName": "ज्ञानेश्वर विठ्ठल देशमुख (Dnyaneshwar Deshmukh)",
                "area": "1.65 Hectare",
                "assessment": "₹ 3,100/-",
                "ownershipType": "भोगवटादार वर्ग - १ (Class-1)",
                "extraDetails": {
                    "totalParcels": "2 Parcels",
                    "parcel1": "Gat 204/5 (1.00 Ha, ₹1900)",
                    "parcel2": "Gat 208/2 (0.65 Ha, ₹1200)",
                    "localCess": "₹ 620/- Education Cess"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 38, "height": 6, "label": "गाव: हिंगणा (Nagpur)"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 38, "height": 7, "label": "गट क्र. २०४/५, २०८/२"},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "खाते क्र. ५८२"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "खातेदार: ज्ञानेश्वर विठ्ठल देशमुख"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "एकूण क्षेत्र: १.६५ हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "शासकीय आकारणी: ₹ ३१००"},
                    "stamp": {"top": 76, "left": 60, "width": 32, "height": 16, "label": "तलाठी डिजिटल प्रमाणीकरण"}
                }
            },
            {
                "key": "8a_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Tax Evasion & Fabricated Khata",
                "isForged": True,
                "confidence": 0.185,
                "authenticScore": "18.5% FRAUD ALERT",
                "elaStatus": "Tax Assessment Tampered & Mismatched Font",
                "mutationLedger": "Khata #9999 Unregistered in Mahabhulekh",
                "collisionCount": "2 Khata Collisions",
                "id": "REC-8A-FRAUD-001",
                "title": "⚠️ Tampered 8-A Sheet · Tax Evasion & Fabricated Khata",
                "village": "बेसा (Besa)",
                "tehsil": "नागपूर शहर (Nagpur City)",
                "district": "नागपूर (Nagpur)",
                "khasraNumber": "999/A, 999/B",
                "khataNumber": "9999",
                "ownerName": "संजय बनावटराव कांबळे (Fabricated Khata)",
                "area": "12.50 Hectare (Exaggerated)",
                "assessment": "₹ 0/- (Illegal Tax Waiver)",
                "ownershipType": "⚠️ बनावट कर माफी (Illegal Tax Waiver)",
                "extraDetails": {
                    "totalParcels": "2 Fabricated Parcels",
                    "parcel1": "Gat 999/A (7.50 Ha, ₹0)",
                    "parcel2": "Gat 999/B (5.00 Ha, ₹0)",
                    "localCess": "AI ALERT: Unaccounted Revenue Evasion"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 38, "height": 6, "label": "गाव: बेसा"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 38, "height": 7, "label": "❌ गट क्र. ९९९/A (Unassigned Number)", "isTampered": True},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "❌ बनावट खाते क्र. ९९९९", "isTampered": True},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "❌ खातेदार: संजय बनावटराव कांबळे", "isTampered": True},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र १२.५० हेक्टर (Fabricated Area)", "isTampered": True},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "❌ आकारणी ₹ ०/- (Tax Evasion Forgery)", "isTampered": True},
                    "stamp": {"top": 76, "left": 60, "width": 32, "height": 16, "label": "❌ विसंगत व बनावट महसूल शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "property_card",
        "categoryKey": "URBAN_PROPERTY_CARD",
        "nameMr": "नगर भूमापन मिळकत पत्रिका",
        "nameEn": "Urban Property Card (CTS / Akhiv Patrika)",
        "icon": "location_city",
        "badge": "मालमत्ता पत्रक",
        "papers": [
            {
                "key": "prop_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Shivajinagar, Pune",
                "isForged": False,
                "confidence": 0.995,
                "authenticScore": "99.5% AUTHENTIC",
                "elaStatus": "Uniform City Survey GIS Registry Match",
                "mutationLedger": "PRN Linked with Pune CTSO Ledger",
                "collisionCount": "0 Collisions",
                "id": "REC-CTS-PUN-001",
                "title": "City Survey Property Card · Shivajinagar, Pune (मालमत्ता पत्रक)",
                "village": "शिवाजीनगर (Pune City)",
                "tehsil": "पुणे शहर (Pune City)",
                "district": "पुणे (Pune)",
                "khasraNumber": "CTS No. 4520",
                "khataNumber": "PRN-PN-4520-91",
                "ownerName": "बाबूराव रामचंद्र पाटील (Baburao Patil)",
                "area": "450.0 Sq. Meters (4,843 Sq.Ft)",
                "assessment": "₹ 12,400/- Municipal Tax",
                "ownershipType": "फ्रीहोल्ड नगर भूमापन मिळकत (Freehold Urban)",
                "extraDetails": {
                    "ward": "Ward No. 12 (Shivajinagar Gaothan)",
                    "sheetNo": "Sheet No. 14",
                    "tenure": "Freehold Commercial & Residential",
                    "fsiPermissible": "2.5 FSI Sanctioned"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "नगर भूमापन: शिवाजीनगर, पुणे"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 42, "height": 7, "label": "सीटीएस क्र. ४५२० (CTS No. 4520)"},
                    "khataNumber": {"top": 29, "left": 10, "width": 42, "height": 7, "label": "PRN: PN-4520-91 (Property Reg. No.)"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "मालक: बाबूराव रामचंद्र पाटील"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ४५०.० चौ. मी. (450.0 Sq.M)"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "महानगरपालिका कर: ₹ १२,४००/-"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "नगर भूमापन अधिकारी (CTSO) डिजिटल शिक्का"}
                }
            },
            {
                "key": "prop_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Andheri West, Mumbai",
                "isForged": False,
                "confidence": 0.989,
                "authenticScore": "98.9% AUTHENTIC",
                "elaStatus": "Authentic CTS Registry Record Verified",
                "mutationLedger": "PRN MUM-1204 Registered in BMC Gateway",
                "collisionCount": "0 Collisions",
                "id": "REC-CTS-MUM-002",
                "title": "City Survey Property Card · Andheri West, Mumbai",
                "village": "अंधेरी पश्चिम (Andheri West)",
                "tehsil": "अंधेरी (Andheri)",
                "district": "मुंबई उपनगर (Mumbai Suburban)",
                "khasraNumber": "CTS No. 1204/B",
                "khataNumber": "PRN-MUM-1204-55",
                "ownerName": "राजेश विष्णू कुलकर्णी (Rajesh Kulkarni)",
                "area": "320.5 Sq. Meters",
                "assessment": "₹ 18,500/- BMC Property Tax",
                "ownershipType": "फ्रीहोल्ड निवासी मिळकत (Freehold Residential)",
                "extraDetails": {
                    "ward": "K/West Ward (BMC)",
                    "sheetNo": "Cadastral Sheet No. 88",
                    "tenure": "Private Residential Ownership",
                    "fsiPermissible": "2.0 FSI Permitted"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 45, "height": 6, "label": "नगर भूमापन: अंधेरी पश्चिम, मुंबई"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 42, "height": 7, "label": "सीटीएस क्र. १२०४/ब (CTS 1204/B)"},
                    "khataNumber": {"top": 29, "left": 10, "width": 42, "height": 7, "label": "PRN: MUM-1204-55"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "मालक: राजेश विष्णू कुलकर्णी"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ३२०.५ चौ. मी."},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "आकारणी: ₹ १८,५००/-"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "मुंबई नगर भूमापन कार्यालय शिक्का"}
                }
            },
            {
                "key": "prop_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Forged CTSO Seal & Altered FSI",
                "isForged": True,
                "confidence": 0.160,
                "authenticScore": "16.0% FRAUD ALERT",
                "elaStatus": "Pixel Level Discontinuity in Plot Dimensions & FSI",
                "mutationLedger": "CTS #8888 Not Found in Municipal Cadastre",
                "collisionCount": "1 Boundary Dispute Collision",
                "id": "REC-CTS-FRAUD-001",
                "title": "⚠️ Tampered Property Card · Forged CTSO Seal & Altered FSI",
                "village": "डेक्कन जिमखाना (Deccan)",
                "tehsil": "पुणे शहर (Pune City)",
                "district": "पुणे (Pune)",
                "khasraNumber": "CTS No. 8888 (Fake)",
                "khataNumber": "PRN-FAKE-8888-00",
                "ownerName": "अजय बनावटराव देशमुख (Illegal Title Claim)",
                "area": "1,850.0 Sq. Meters (Altered 4x)",
                "assessment": "₹ 1,000/- (Manipulated Low Tax)",
                "ownershipType": "⚠️ अनधिकृत आरक्षण फेरफार (Illegal FSI Forgery)",
                "extraDetails": {
                    "ward": "Fake Ward 99",
                    "sheetNo": "Non-Existent Sheet 999",
                    "tenure": "Encroached Public Garden Zone",
                    "fsiPermissible": "AI ALERT: Fraudulent 5.0 FSI Claim"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "नगर भूमापन: डेक्कन जिमखाना"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 42, "height": 7, "label": "❌ सीटीएस क्र. ८८८८ (Forged CTS No.)", "isTampered": True},
                    "khataNumber": {"top": 29, "left": 10, "width": 42, "height": 7, "label": "❌ PRN-FAKE-8888-00 (Invalid PRN)", "isTampered": True},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "❌ बनावट मालक: अजय देशमुख", "isTampered": True},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र: १८५०.० चौ. मी. (Altered 4x)", "isTampered": True},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "❌ आकारणी: ₹ १०००/- (Tax Fraud)", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट CTSO शिक्का व स्वाक्षरी", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "mutation_register",
        "categoryKey": "VILLAGE_FORM_6_FERFAR",
        "nameMr": "गाव नमुना ६ फेरफार नोंदवही",
        "nameEn": "Mutation Register (Form 6 Ferfar)",
        "icon": "history_edu",
        "badge": "फेरफार नोंद",
        "papers": [
            {
                "key": "ferfar_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Inheritance (वारस हक्क)",
                "isForged": False,
                "confidence": 0.992,
                "authenticScore": "99.2% AUTHENTIC",
                "elaStatus": "Certified Circle Officer Signature Verified",
                "mutationLedger": "Ferfar #1842 Certified under Sec 150 MLRC",
                "collisionCount": "0 Collisions",
                "id": "REC-FER-PUN-001",
                "title": "Mutation Register · Inheritance Entry #1842, Baramati (ई-फेरफार)",
                "village": "बारामती (Baramati)",
                "tehsil": "बारामती (Baramati)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Ferfar Entry #1842",
                "ownerName": "रमेश विठ्ठल पाटील (Successor / वारसदार)",
                "area": "1.45 Hectare Transferred",
                "assessment": "वारस हक्क नोंदणी (Legal Inheritance)",
                "ownershipType": "भोगवटादार वर्ग - १ (वारस नोंद)",
                "extraDetails": {
                    "deceasedOwner": "कै. विठ्ठल बाबुराव पाटील (Deceased)",
                    "mutationType": "Sec 149/150 MLRC Legal Heirship",
                    "noticePeriod": "15 Days Public Notice Issued (No Objections)",
                    "certifyingOfficer": "Circle Officer Baramati Division"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 38, "height": 6, "label": "गाव: बारामती, जि. पुणे"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 38, "height": 7, "label": "गट क्र. १४२/३अ मधील फेरफार"},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "फेरफार नोंद क्रमांक: १८४२"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "वारसदार: रमेश विठ्ठल पाटील"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "हस्तांतरित क्षेत्र: १.४५ हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "नोंदणी प्रकार: वारस हक्क नोंद"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "मंडळ अधिकारी प्रमाणित शिक्का व सही"}
                }
            },
            {
                "key": "ferfar_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Sale Mutation (खरेदी नोंद)",
                "isForged": False,
                "confidence": 0.987,
                "authenticScore": "98.7% AUTHENTIC",
                "elaStatus": "Authentic Mutation Ledger Trail Verified",
                "mutationLedger": "Ferfar #2481 Synced with SRO Index-II",
                "collisionCount": "0 Collisions",
                "id": "REC-FER-NSK-002",
                "title": "Mutation Register · Sale Deed Transfer #2481, Dindori",
                "village": "दिंडोरी (Dindori)",
                "tehsil": "दिंडोरी (Dindori)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "Gat No. 88/1-B",
                "khataNumber": "Ferfar Entry #2481",
                "ownerName": "सखाराम गोपाळ कांबळे (Purchaser / खरेदीदार)",
                "area": "1.20 Hectare",
                "assessment": "खरेदीखत नोंद क्र. D-2026/NSK/112",
                "ownershipType": "भोगवटादार वर्ग - १ (खरेदीखत नोंद)",
                "extraDetails": {
                    "seller": "आनंदराव पांडुरंग शिंदे (Seller)",
                    "sroDocNo": "Reg. Deed D-2026/NSK/112 (Dindori SRO)",
                    "consideration": "₹ 35,00,000/- Consideration Paid",
                    "certifyingOfficer": "Circle Inspector Dindori"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 38, "height": 6, "label": "गाव: दिंडोरी, जि. नाशिक"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 38, "height": 7, "label": "गट क्र. ८८/१-ब"},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "फेरफार नोंद क्रमांक: २४८१"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "खरेदीदार: सखाराम गोपाळ कांबळे"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: १.२० हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "नोंदणी प्रकार: खरेदीखत फेरफार"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "मंडळ अधिकारी डिजिटल प्रमाणित"}
                }
            },
            {
                "key": "ferfar_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Unauthorized Court Injunction Bypass",
                "isForged": True,
                "confidence": 0.153,
                "authenticScore": "15.3% FRAUD ALERT",
                "elaStatus": "Illegal Mutation Entry during Civil Injunction",
                "mutationLedger": "Court Stay Order Active: RCS No. 142/2025",
                "collisionCount": "1 Legal Title Stay Injunction",
                "id": "REC-FER-FRAUD-001",
                "title": "⚠️ Tampered Mutation Register · Unauthorized Stay Injunction Bypass",
                "village": "पैठण (Paithan)",
                "tehsil": "पैठण (Paithan)",
                "district": "छत्रपती संभाजीनगर (Sambhajinagar)",
                "khasraNumber": "Gat No. 56/3",
                "khataNumber": "Ferfar Entry #9999 (Illegal)",
                "ownerName": "अनिल वसंतराव शिंदे (Unauthorized Transfer)",
                "area": "2.10 Hectare (Disputed Title)",
                "assessment": "⚠️ बेकायदेशीर फेरफार (Illegal Mutation)",
                "ownershipType": "⚠️ स्थगिती आदेश उल्लंघन (Injunction Violation)",
                "extraDetails": {
                    "stayDetails": "Civil Court Paithan Injunction Order (RCS 142/2025)",
                    "violation": "Attempted Title Transfer during Sub-Judice Litigation",
                    "certifyingOfficer": "AI ALERT: Forged Circle Officer Seal"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 38, "height": 6, "label": "गाव: पैठण, संभाजीनगर"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 38, "height": 7, "label": "❌ गट क्र. ५६/३ (Disputed Court Injunction)", "isTampered": True},
                    "khataNumber": {"top": 30, "left": 10, "width": 38, "height": 7, "label": "❌ बेकायदेशीर फेरफार क्र. ९९९९", "isTampered": True},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "❌ अनधिकृत लाभार्थी: अनिल शिंदे", "isTampered": True},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र: २.१० हेक्टर (Title Stayed)", "isTampered": True},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "❌ न्यायालयीन स्थगिती उल्लंघन", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट मंडळ अधिकारी शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "sale_deed",
        "categoryKey": "REGISTERED_SALE_DEED",
        "nameMr": "नोंदणीकृत खरेदीखत दस्तऐवज",
        "nameEn": "Registered Sale Deed (Conveyance)",
        "icon": "gavel",
        "badge": "खरेदीखत दस्त",
        "papers": [
            {
                "key": "deed_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Haveli SRO, Pune",
                "isForged": False,
                "confidence": 0.996,
                "authenticScore": "99.6% AUTHENTIC",
                "elaStatus": "Sub-Registrar Stamp & Index-II Barcode Verified",
                "mutationLedger": "SRO Deed D-2026/PUN/8921 Verified on IGR Maharashtra",
                "collisionCount": "0 Collisions",
                "id": "REC-DEED-PUN-001",
                "title": "Registered Sale Deed · Haveli SRO, Pune (खरेदीखत)",
                "village": "वाघोली (Haveli, Pune)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Deed No. D-2026/PUN/8921",
                "ownerName": "रमेश विठ्ठल पाटील (Purchaser / खरेदीदार)",
                "area": "1.45 Hectare Conveyed",
                "assessment": "Consideration ₹ 65,00,000/- (Paid)",
                "ownershipType": "नोंदणीकृत खरेदीखत (Absolute Conveyance)",
                "extraDetails": {
                    "seller": "बाबूराव रामचंद्र पाटील (Vendor / Seller)",
                    "stampDuty": "₹ 3,90,000/- Paid (6% e-Challan GRAS)",
                    "registrationFee": "₹ 30,000/- Paid",
                    "boundaries": "East: Gat 143, West: Nala, North: Road, South: Gat 141"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक हवेली क्र. ३, पुणे"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "दस्त मधील मिळकत: गट क्र. १४२/३अ"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "दस्त नोंदणी क्र. D-2026/PUN/8921"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "खरेदी घेणारा: रमेश विठ्ठल पाटील"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: १.४५ हेक्टर (पूर्ण हक्क)"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "मोबदला रक्कम: ₹ ६५,००,०००/-"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "सह दुय्यम निबंधक अधिकृत डिजिटल शिक्का"}
                }
            },
            {
                "key": "deed_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Nagpur City SRO",
                "isForged": False,
                "confidence": 0.990,
                "authenticScore": "99.0% AUTHENTIC",
                "elaStatus": "IGR Registry Verified & GRAS Challan Clean",
                "mutationLedger": "SRO Deed D-2026/NGP/4102 Synced",
                "collisionCount": "0 Collisions",
                "id": "REC-DEED-NGP-002",
                "title": "Registered Sale Deed · Nagpur City SRO",
                "village": "उमरेड (Umred, Nagpur)",
                "tehsil": "उमरेड (Umred)",
                "district": "नागपूर (Nagpur)",
                "khasraNumber": "Gat No. 204/5",
                "khataNumber": "Deed No. D-2026/NGP/4102",
                "ownerName": "ज्ञानेश्वर विठ्ठल देशमुख (Purchaser)",
                "area": "0.85 Hectare Conveyed",
                "assessment": "Consideration ₹ 42,00,000/-",
                "ownershipType": "नोंदणीकृत खरेदीखत (Conveyance)",
                "extraDetails": {
                    "seller": "अनिल वसंतराव शिंदे (Seller)",
                    "stampDuty": "₹ 2,52,000/- (e-Challan Paid)",
                    "registrationFee": "₹ 30,000/-",
                    "boundaries": "East: Gat 205, West: Canal, North: Gat 203, South: Survey 204/6"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक उमरेड, नागपूर"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "गट क्र. २०४/५"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "दस्त क्र. D-2026/NGP/4102"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "खरेदी घेणारा: ज्ञानेश्वर देशमुख"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ०.८५ हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "मोबदला: ₹ ४२,००,०००/-"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "उप-निबंधक कार्यालय शिक्का व बारकोड"}
                }
            },
            {
                "key": "deed_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Under-Valuation & Forged SRO Seal",
                "isForged": True,
                "confidence": 0.118,
                "authenticScore": "11.8% FRAUD ALERT",
                "elaStatus": "Major Stamp Duty Evasion & Manipulated Numerical Digits",
                "mutationLedger": "Forged SRO Receipt #0000 (IGR Mismatch)",
                "collisionCount": "1 Stamp Duty Evasion Notice",
                "id": "REC-DEED-FRAUD-001",
                "title": "⚠️ Tampered Sale Deed · Under-Valuation & Forged SRO Seal",
                "village": "कल्याण (Kalyan, Thane)",
                "tehsil": "कल्याण (Kalyan)",
                "district": "ठाणे (Thane)",
                "khasraNumber": "Survey No. 77/2-A",
                "khataNumber": "Deed No. D-FAKE/THN/0000",
                "ownerName": "प्रकाश बनावटराव जाधव (Tax Fraud Buyer)",
                "area": "2.50 Hectare",
                "assessment": "Consideration ₹ 10,00,000/- (Actual ₹ 90L)",
                "ownershipType": "⚠️ बनावट खरेदी दस्त (Stamp Duty Evasion Fraud)",
                "extraDetails": {
                    "seller": "संजय रामचंद्र पवार (Seller)",
                    "fraudSummary": "Altered Valuation from ₹90 Lakhs to ₹10 Lakhs to Evade Stamp Duty",
                    "igrStatus": "AI ALERT: Invalid e-Stamp Certificate & Fabricated SRO Seal"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक कल्याण, ठाणे"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "सर्व्हे क्र. ७७/२-अ"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट दस्त क्र. D-FAKE/THN/0000", "isTampered": True},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "❌ खरेदीदार: प्रकाश बनावटराव जाधव", "isTampered": True},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: २.५० हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "❌ दर्शविलेला मोबदला ₹ १०,००,०००/- (Under-Valued)", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट मुद्रांक व सह-निबंधक बनावट शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "search_report",
        "categoryKey": "SEARCH_REPORT",
        "nameMr": "बोजा प्रमाणपत्र व ३०-वर्षीय शोध अहवाल",
        "nameEn": "Encumbrance & 30-Year Search Report",
        "icon": "find_in_page",
        "badge": "शोध अहवाल",
        "papers": [
            {
                "key": "search_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · 30-Year Clear Title, Pune",
                "isForged": False,
                "confidence": 0.993,
                "authenticScore": "99.3% AUTHENTIC",
                "elaStatus": "Advocate Title Opinion & Index-II Records Verified",
                "mutationLedger": "1996-2026 Audit Trail Clear (No Undisclosed Liens)",
                "collisionCount": "0 Collisions",
                "id": "REC-SR-PUN-001",
                "title": "30-Year Title Search & Encumbrance Report · Pune",
                "village": "वाघोली (Wagholi)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Search Ref. SR-2026/PUN/4019",
                "ownerName": "रमेश विठ्ठल पाटील (Title Holder)",
                "area": "1.45 Hectare (Clear & Marketable)",
                "assessment": "Search Period: 1996 to 2026 (30 Years)",
                "ownershipType": "निर्दोष व मार्केटेबल टायटल (Clear & Marketable Title)",
                "extraDetails": {
                    "advocate": "Adv. K. S. Kulkarni (High Court Advocate, Pune)",
                    "searchRegisters": "SRO Haveli Index-II inspected from 1996 to 2026",
                    "conclusion": "Property Title is Clear, Absolute, Marketable and Free from Encumbrances"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "मिळकत स्थान: वाघोली, हवेली, पुणे"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "शोध घेतलेली मिळकत: गट क्र. १४२/३अ"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "शोध अहवाल संदर्भ क्र. SR-2026/PUN/4019"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "टायटल मालक: रमेश विठ्ठल पाटील"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "शोध क्षेत्र: १.४५ हेक्टर (निर्दोष टायटल)"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "शोध कालावधी: १९९६ ते २०२६ (३० वर्षे)"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "विधीज्ञ (Advocate) अधिकृत स्वाक्षरी व सील"}
                }
            },
            {
                "key": "search_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Clean Search, Nashik",
                "isForged": False,
                "confidence": 0.988,
                "authenticScore": "98.8% AUTHENTIC",
                "elaStatus": "Verified SRO Ledger History Matches",
                "mutationLedger": "SRO Trimbakeshwar Index-II Verified",
                "collisionCount": "0 Collisions",
                "id": "REC-SR-NSK-002",
                "title": "30-Year Title Search Report · Nashik",
                "village": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "tehsil": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "Gat No. 105/B",
                "khataNumber": "Search Ref. SR-2026/NSK/1108",
                "ownerName": "गणेश पांडुरंग पवार (Title Holder)",
                "area": "0.50 Hectare (Clean Title)",
                "assessment": "Search Period: 1996 to 2026",
                "ownershipType": "निर्दोष टायटल (Marketable Title)",
                "extraDetails": {
                    "advocate": "Adv. V. M. Deshmukh (Nashik Bar Council)",
                    "searchRegisters": "Trimbakeshwar SRO Ledgers Verified",
                    "conclusion": "No Bank Encumbrance, Clear Agricultural Ownership"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "गाव: त्र्यंबकेश्वर, जि. नाशिक"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "गट क्र. १०५/ब"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "शोध संदर्भ: SR-2026/NSK/1108"},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "मालक: गणेश पांडुरंग पवार"},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ०.५० हेक्टर"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "३० वर्षे शोध निष्कर्श: निर्दोष"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "विधीज्ञ सनद व बार कौन्सिल सील"}
                }
            },
            {
                "key": "search_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Concealed Bank Auction & Mortgage",
                "isForged": True,
                "confidence": 0.171,
                "authenticScore": "17.1% FRAUD ALERT",
                "elaStatus": "Fabricated Title Certificate Concealing Active DRT Bank Charge",
                "mutationLedger": "Active Bank Auction Attachment: DRT-PUN/2024/88",
                "collisionCount": "1 Undisclosed Bank Attachment",
                "id": "REC-SR-FRAUD-001",
                "title": "⚠️ Tampered Search Report · Concealed DRT Bank Mortgage",
                "village": "टिटवाळा (Titwala, Thane)",
                "tehsil": "कल्याण (Kalyan)",
                "district": "ठाणे (Thane)",
                "khasraNumber": "Survey No. 91/4",
                "khataNumber": "Search Ref. SR-FAKE/THN/9999",
                "ownerName": "सुनील बनावटराव सावंत (Borrower in Default)",
                "area": "1.80 Hectare (Mortgaged)",
                "assessment": "⚠️ लपविलेला बँक बोजा (Undisclosed Mortgage)",
                "ownershipType": "⚠️ बँक तारण लपविण्याचा गुन्हा (Concealed DRT Charge)",
                "extraDetails": {
                    "concealedCharge": "₹ 1.50 Crore Bank of Baroda SARFAESI Mortgage",
                    "drtNotice": "DRT Court Auction Notice Active since Nov 2024",
                    "fraudSummary": "Advocate Title Certificate was fabricated to conceal bank attachment"
                },
                "boundingBoxes": {
                    "village": {"top": 12, "left": 14, "width": 42, "height": 6, "label": "गाव: टिटवाळा, कल्याण, ठाणे"},
                    "khasraNumber": {"top": 21, "left": 10, "width": 40, "height": 7, "label": "सर्व्हे क्र. ९१/४"},
                    "khataNumber": {"top": 30, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट शोध क्र. SR-FAKE/THN/9999", "isTampered": True},
                    "ownerName": {"top": 40, "left": 10, "width": 78, "height": 10, "label": "❌ कर्जदार मालक: सुनील सावंत", "isTampered": True},
                    "area": {"top": 52, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: १.८० हेक्टर (तारण मिळकत)"},
                    "assessment": {"top": 62, "left": 10, "width": 45, "height": 7, "label": "❌ लपविलेला ₹ १.५० कोटी बँक बोजा", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट विधीज्ञ सील व स्वाक्षरी", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "gat_nakasha_map",
        "categoryKey": "GAT_NAKASHA_MAP",
        "nameMr": "गट नकाशा व भूमापन मोजणी प्रत",
        "nameEn": "Cadastral Gat Map & Survey Sheet",
        "icon": "map",
        "badge": "गट नकाशा",
        "papers": [
            {
                "key": "map_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Haveli Gat 142/3A Map",
                "isForged": False,
                "confidence": 0.994,
                "authenticScore": "99.4% AUTHENTIC",
                "elaStatus": "Cadastral Coordinates & SLR Map Sheet Authentic",
                "mutationLedger": "Tipan & Mojani Sheet #42 Verified in Bhubharti",
                "collisionCount": "0 Collisions",
                "id": "REC-MAP-PUN-001",
                "title": "Cadastral Survey Gat Map · Wagholi Gat 142/3A (गट नकाशा)",
                "village": "वाघोली (Wagholi)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Mojani Sheet #MH-PUN-HV-142",
                "ownerName": "रमेश विठ्ठल पाटील (Demarcated Landholder)",
                "area": "1.45 Hectare (Scale 1:2000)",
                "assessment": "सीमांकन मोजणी प्रमाणीकरण (Demarcated)",
                "ownershipType": "क मोजणी प्रत व टिपण (Cadastral Demarcated)",
                "extraDetails": {
                    "scale": "Scale 1:2000",
                    "surveyor": "Dy. Superintendent of Land Records (DILR Haveli)",
                    "boundaries": "East: 120m, West: 118m, North: 125m, South: 122m",
                    "coOrdinates": "18.5793° N, 73.9782° E"
                },
                "boundingBoxes": {
                    "village": {"top": 10, "left": 14, "width": 42, "height": 6, "label": "भूमि अभिलेख नकाशा: वाघोली, हवेली"},
                    "khasraNumber": {"top": 19, "left": 10, "width": 40, "height": 7, "label": "गट नकाशा: गट क्र. १४२/३अ"},
                    "khataNumber": {"top": 28, "left": 10, "width": 40, "height": 7, "label": "मोजणी प्रत क्र. MH-PUN-HV-142"},
                    "ownerName": {"top": 38, "left": 10, "width": 78, "height": 10, "label": "भूधारक: रमेश विठ्ठल पाटील"},
                    "area": {"top": 50, "left": 10, "width": 45, "height": 8, "label": "प्रमाण: १:२००० (क्षेत्र १.४५ हेक्टर)"},
                    "assessment": {"top": 60, "left": 10, "width": 45, "height": 7, "label": "सीमांकन: पूर्व १२०मी, उत्तर १२५मी"},
                    "stamp": {"top": 75, "left": 58, "width": 34, "height": 18, "label": "उप अधीक्षक भूमी अभिलेख (DILR) शिक्का"}
                }
            },
            {
                "key": "map_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Trimbak Gat 105/B",
                "isForged": False,
                "confidence": 0.985,
                "authenticScore": "98.5% AUTHENTIC",
                "elaStatus": "Cadastral Geometry & Boundary Coordinates Verified",
                "mutationLedger": "Mojani Sheet Synced with DILR Nashik",
                "collisionCount": "0 Collisions",
                "id": "REC-MAP-NSK-002",
                "title": "Cadastral Survey Gat Map · Trimbakeshwar",
                "village": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "tehsil": "त्र्यंबकेश्वर (Trimbakeshwar)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "Gat No. 105/B",
                "khataNumber": "Mojani Sheet #MH-NSK-TR-105",
                "ownerName": "गणेश पांडुरंग पवार",
                "area": "0.50 Hectare (Scale 1:2500)",
                "assessment": "हद्द कायम मोजणी (Boundary Fixed)",
                "ownershipType": "भूमापन मोजणी प्रत (Cadastral Survey)",
                "extraDetails": {
                    "scale": "Scale 1:2500",
                    "surveyor": "DILR Trimbakeshwar Office",
                    "boundaries": "East: 85m, West: 82m, North: 60m, South: 61m"
                },
                "boundingBoxes": {
                    "village": {"top": 10, "left": 14, "width": 42, "height": 6, "label": "गाव: त्र्यंबकेश्वर, नाशिक"},
                    "khasraNumber": {"top": 19, "left": 10, "width": 40, "height": 7, "label": "गट क्र. १०५/ब"},
                    "khataNumber": {"top": 28, "left": 10, "width": 40, "height": 7, "label": "मोजणी प्रत क्र. MH-NSK-TR-105"},
                    "ownerName": {"top": 38, "left": 10, "width": 78, "height": 10, "label": "खातेदार: गणेश पांडुरंग पवार"},
                    "area": {"top": 50, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ०.५० हेक्टर (प्रमाण १:२५००)"},
                    "assessment": {"top": 60, "left": 10, "width": 45, "height": 7, "label": "हद्द कायम मोजणी प्रमाणीकरण"},
                    "stamp": {"top": 75, "left": 58, "width": 34, "height": 18, "label": "भूमी अभिलेख निरीक्षक सील"}
                }
            },
            {
                "key": "map_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Forest Boundary Encroachment",
                "isForged": True,
                "confidence": 0.135,
                "authenticScore": "13.5% FRAUD ALERT",
                "elaStatus": "Illegal Redrawing of Boundary Line Encroaching Reserved Forest",
                "mutationLedger": "Forest Boundary Pillar #44 Altered in CAD Overlay",
                "collisionCount": "1 Reserved Forest Encroachment Alert",
                "id": "REC-MAP-FRAUD-001",
                "title": "⚠️ Tampered Gat Map · Reserved Forest Boundary Encroachment",
                "village": "शहापूर (Shahapur, Thane)",
                "tehsil": "शहापूर (Shahapur)",
                "district": "ठाणे (Thane)",
                "khasraNumber": "Gat No. 777/X (Fake Boundary)",
                "khataNumber": "Mojani Sheet FAKE-777",
                "ownerName": "दिनेश बनावटराव जाधव (Encroacher)",
                "area": "5.50 Hectare (Altered +3.0 Ha Forest)",
                "assessment": "⚠️ वनजमीन अतिक्रमण (Illegal Forest Encroachment)",
                "ownershipType": "⚠️ संरक्षित वनजमीन हडपण्याचा प्रयत्न",
                "extraDetails": {
                    "encroachmentDetails": "3.0 Hectares of Reserved Forest Compartment No. 12 Encroached",
                    "fraudSummary": "Boundary polygon artificially expanded by 300 meters into state forest",
                    "forestDeptAction": "AI ALERT: Boundary Pillar Coordinates Mismatch with Forest GIS"
                },
                "boundingBoxes": {
                    "village": {"top": 10, "left": 14, "width": 42, "height": 6, "label": "गाव: शहापूर, ठाणे"},
                    "khasraNumber": {"top": 19, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट गट नकाशा क्र. ७७७/X", "isTampered": True},
                    "khataNumber": {"top": 28, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट मोजणी प्रत FAKE-777", "isTampered": True},
                    "ownerName": {"top": 38, "left": 10, "width": 78, "height": 10, "label": "❌ अतिक्रमणदार: दिनेश जाधव", "isTampered": True},
                    "area": {"top": 50, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र ५.५० हे. (३ हे. वनजमीन समाविष्ट)", "isTampered": True},
                    "assessment": {"top": 60, "left": 10, "width": 45, "height": 7, "label": "❌ संरक्षित वनजमीन अतिक्रमण", "isTampered": True},
                    "stamp": {"top": 75, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट DILR भूमापक शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "na_order_sanad",
        "categoryKey": "NA_ORDER_SANAD",
        "nameMr": "अकृषिक (NA) आदेश व सनद",
        "nameEn": "Non-Agricultural (NA) Order & Sanad",
        "icon": "domain",
        "badge": "अकृषिक सनद",
        "papers": [
            {
                "key": "na_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Pune Collector NA Resi",
                "isForged": False,
                "confidence": 0.991,
                "authenticScore": "99.1% AUTHENTIC",
                "elaStatus": "Sec 44 MLRC Collector Order & Sanad Verified",
                "mutationLedger": "NA Order #NA-REV/2026/412 Recorded in Revenue Ledger",
                "collisionCount": "0 Collisions",
                "id": "REC-NA-PUN-001",
                "title": "Collector Non-Agricultural (NA) Sanad · Pune (अकृषिक सनद)",
                "village": "बावधन (Bavdhan, Pune)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 89/1A",
                "khataNumber": "Order #NA-REV/2026/412",
                "ownerName": "रमेश विठ्ठल पाटील (Developer / Landowner)",
                "area": "1.00 Hectare (10,000 Sq.M NA)",
                "assessment": "Residential NA Tax ₹ 25,000/- Per Annum",
                "ownershipType": "अकृषिक सनद (Residential NA Sanad)",
                "extraDetails": {
                    "collectorOrder": "District Collector Pune Order Sec 44 MLRC 1966",
                    "layoutSanction": "PMRDA Layout Plan Sanctioned (TP/2026/891)",
                    "premiumPaid": "₹ 15,00,000/- NA Conversion Premium Paid",
                    "naTax": "₹ 25,000/- Annual Assessment Fixed"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "जिल्हाधिकारी कार्यालय, पुणे"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "अकृषिक जमीन: गट क्र. ८९/१अ"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "अकृषिक आदेश क्र. NA-REV/2026/412"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "अर्जदार / भूधारक: रमेश विठ्ठल पाटील"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "अकृषिक क्षेत्र: १.०० हेक्टर (निवासी)"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "अकृषिक आकारणी: ₹ २५,०००/- प्रतिवर्ष"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "जिल्हाधिकारी (Collector) मुद्रा व स्वाक्षरी"}
                }
            },
            {
                "key": "na_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Thane Collector NA Comm",
                "isForged": False,
                "confidence": 0.987,
                "authenticScore": "98.7% AUTHENTIC",
                "elaStatus": "Commercial NA Conversion Verified by Collectorate",
                "mutationLedger": "Sanad Synced with MMRDA Planning Authority",
                "collisionCount": "0 Collisions",
                "id": "REC-NA-THN-002",
                "title": "Commercial NA Conversion Order · Thane",
                "village": "बदलापूर (Badlapur)",
                "tehsil": "अंबरनाथ (Ambernath)",
                "district": "ठाणे (Thane)",
                "khasraNumber": "Survey No. 112/3",
                "khataNumber": "Order #NA-COMM/2026/781",
                "ownerName": "सचिन तुकाराम कदम (Commercial Applicant)",
                "area": "0.75 Hectare (Commercial NA)",
                "assessment": "Commercial NA Tax ₹ 45,000/- Per Annum",
                "ownershipType": "व्यावसायिक अकृषिक सनद (Commercial NA)",
                "extraDetails": {
                    "collectorOrder": "Collector Thane Order Sec 44 MLRC",
                    "layoutSanction": "Commercial IT Park / Warehouse Zone Sanctioned",
                    "premiumPaid": "₹ 22,50,000/- Paid"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "जिल्हाधिकारी कार्यालय, ठाणे"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "सर्व्हे क्र. ११२/३"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "आदेश क्र. NA-COMM/2026/781"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "भूधारक: सचिन तुकाराम कदम"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "क्षेत्र: ०.७५ हेक्टर (व्यावसायिक)"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "वार्षिक आकारणी: ₹ ४५,०००/-"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "अपर जिल्हाधिकारी (Addl. Collector) सील"}
                }
            },
            {
                "key": "na_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Fake SDO Signature & Forest Zone",
                "isForged": True,
                "confidence": 0.122,
                "authenticScore": "12.2% FRAUD ALERT",
                "elaStatus": "Fabricated NA Order in Eco-Sensitive Green Zone / Forest Buffer",
                "mutationLedger": "Order #NA-FAKE/2026/000 Not Found in Collectorate Ledger",
                "collisionCount": "1 Eco-Sensitive Zone Violation Alert",
                "id": "REC-NA-FRAUD-001",
                "title": "⚠️ Tampered NA Sanad · Fake SDO Signature in Green Zone",
                "village": "महाबळेश्वर (Mahabaleshwar Eco-Zone)",
                "tehsil": "महाबळेश्वर (Mahabaleshwar)",
                "district": "सातारा (Satara)",
                "khasraNumber": "Survey No. 404/Eco",
                "khataNumber": "Order #NA-FAKE/2026/000",
                "ownerName": "प्रदीप बनावटराव जगताप (Illegal Resort Developer)",
                "area": "3.50 Hectare (No-Development Zone)",
                "assessment": "⚠️ अनधिकृत एनए परवानगी (Illegal Eco Sanad)",
                "ownershipType": "⚠️ पर्यावरण संवेदनशील क्षेत्र उल्लंघन (ESZ Violation)",
                "extraDetails": {
                    "ecoZone": "Eco-Sensitive Zone (ESZ) - Construction Strictly Prohibited",
                    "fraudSummary": "Fabricated Sub-Divisional Officer (SDO) signature on fake letterhead",
                    "collectorateNotice": "AI ALERT: No Record of Premium Payment in State Treasury"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "उपविभागीय अधिकारी कार्यालय, सातारा"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "❌ सर्व्हे क्र. ४०४/Eco (Eco-Sensitive Green Zone)", "isTampered": True},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट आदेश क्र. NA-FAKE/2026/000", "isTampered": True},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "❌ अनधिकृत अर्जदार: प्रदीप जगताप", "isTampered": True},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र ३.५० हे. (बांधकाम प्रतिबंधित क्षेत्र)", "isTampered": True},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "❌ बेकायदेशीर रिसॉर्ट एनए बनावट सनद", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट उपविभागीय अधिकारी (SDO) शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "gift_relinquishment",
        "categoryKey": "GIFT_RELINQUISHMENT_DEED",
        "nameMr": "बक्षीसपत्र व हक्कसोडपत्र",
        "nameEn": "Gift & Relinquishment Deed",
        "icon": "volunteer_activism",
        "badge": "बक्षीस / हक्कसोड",
        "papers": [
            {
                "key": "gift_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Family Gift Deed, Pune",
                "isForged": False,
                "confidence": 0.995,
                "authenticScore": "99.5% AUTHENTIC",
                "elaStatus": "Registered Gratuitous Intra-Family Conveyance Verified",
                "mutationLedger": "SRO Gift Deed GD-2026/PUN/5512 Synced with Ferfar",
                "collisionCount": "0 Collisions",
                "id": "REC-GIFT-PUN-001",
                "title": "Registered Gift Deed (बक्षीसपत्र) · Father to Son, Pune",
                "village": "वाघोली (Wagholi, Pune)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Deed No. GD-2026/PUN/5512",
                "ownerName": "रमेश विठ्ठल पाटील (Donee / बक्षीस घेणारा)",
                "area": "1.45 Hectare Gifted",
                "assessment": "विनामोबदला बक्षीसपत्र (Blood Relation ₹200 Stamp)",
                "ownershipType": "नोंदणीकृत बक्षीसपत्र (Registered Gift Deed)",
                "extraDetails": {
                    "donor": "विठ्ठल बाबुराव पाटील (Donor / Father)",
                    "donee": "रमेश विठ्ठल पाटील (Donee / Son)",
                    "consideration": "विनामोबदला नैसर्गिक प्रेमापोटी (Natural Love & Affection)",
                    "stampDuty": "₹ 200/- (Maharashtra Stamp Act Sec 34 Exemption)"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक हवेली, पुणे"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "बक्षीस मिळकत: गट क्र. १४२/३अ"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "बक्षीसपत्र नोंद क्र. GD-2026/PUN/5512"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "बक्षीस घेणारा: रमेश विठ्ठल पाटील (मुलगा)"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "बक्षीस क्षेत्र: १.४५ हेक्टर"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "देणारा: विठ्ठल बाबुराव पाटील (वडील)"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "सह दुय्यम निबंधक अधिकृत शिक्का व सही"}
                }
            },
            {
                "key": "gift_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Relinquishment, Nagpur",
                "isForged": False,
                "confidence": 0.989,
                "authenticScore": "98.9% AUTHENTIC",
                "elaStatus": "Registered Co-owner Release Deed Verified",
                "mutationLedger": "Release Deed RD-2026/NGP/2219 Verified",
                "collisionCount": "0 Collisions",
                "id": "REC-GIFT-NGP-002",
                "title": "Registered Relinquishment Deed (हक्कसोडपत्र) · Nagpur",
                "village": "उमरेड (Umred, Nagpur)",
                "tehsil": "उमरेड (Umred)",
                "district": "नागपूर (Nagpur)",
                "khasraNumber": "Gat No. 204/5",
                "khataNumber": "Deed No. RD-2026/NGP/2219",
                "ownerName": "ज्ञानेश्वर विठ्ठल देशमुख (Release Beneficiary)",
                "area": "0.85 Hectare Rights Released",
                "assessment": "हक्कसोड दस्त (Co-owner Release)",
                "ownershipType": "नोंदणीकृत हक्कसोडपत्र (Relinquishment)",
                "extraDetails": {
                    "releasingParty": "सुनीता विठ्ठल देशमुख (Sister)",
                    "beneficiary": "ज्ञानेश्वर विठ्ठल देशमुख (Brother)",
                    "stampDuty": "₹ 200/- Paid"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक उमरेड, नागपूर"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "मिळकत: गट क्र. २०४/५"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "हक्कसोडपत्र क्र. RD-2026/NGP/2219"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "लाभार्थी: ज्ञानेश्वर विठ्ठल देशमुख"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "हक्कसोड क्षेत्र: ०.८५ हेक्टर"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "हक्क सोडणारी: सुनीता देशमुख (बहीण)"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "सह दुय्यम निबंधक शिक्का"}
                }
            },
            {
                "key": "gift_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Forged Minor Co-Sharer Signature",
                "isForged": True,
                "confidence": 0.148,
                "authenticScore": "14.8% FRAUD ALERT",
                "elaStatus": "Fabricated Minor Co-Sharer Consent & Forged Thumbprint",
                "mutationLedger": "Invalid Minor Relinquishment without District Court Guardian Sanction",
                "collisionCount": "1 Legal Guardian Violation Alert",
                "id": "REC-GIFT-FRAUD-001",
                "title": "⚠️ Tampered Relinquishment Deed · Forged Minor Co-Sharer Consent",
                "village": "पंचवटी (Panchavati, Nashik)",
                "tehsil": "नाशिक (Nashik)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "Gat No. 105/Minor",
                "khataNumber": "Deed No. RD-FAKE/NSK/9999",
                "ownerName": "अशोक बनावटराव पवार (Fraudulent Co-owner)",
                "area": "1.50 Hectare (Stolen Minor Share)",
                "assessment": "⚠️ बनावट हक्कसोड (Forged Minor Consent)",
                "ownershipType": "⚠️ अल्पवयीन वारसदार फसवणूक (Minor Rights Fraud)",
                "extraDetails": {
                    "minorVictim": "अल्पवयीन वारस: चि. रोहित पवार (वय १४ वर्षे)",
                    "guardianViolation": "Guardians and Wards Act Sec 8 Violation (No Court Permission)",
                    "fraudSummary": "Forged minor co-sharer thumbprint to usurp ancestral property"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक नाशिक"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "❌ गट क्र. १०५/Minor (Minor's Ancestral Share)", "isTampered": True},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट हक्कसोड क्र. RD-FAKE/NSK/9999", "isTampered": True},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "❌ बनावट लाभार्थी: अशोक पवार", "isTampered": True},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र: १.५० हेक्टर (अल्पवयीन हिस्सा हडप)", "isTampered": True},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "❌ अल्पवयीन वारसदार बनावट अंगठा नोंद", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट दुय्यम निबंधक शिक्का", "isTampered": True}
                }
            }
        ]
    },
    {
        "id": "partition_heirship",
        "categoryKey": "PARTITION_HEIRSHIP_DEED",
        "nameMr": "वारस नोंद व कौटुंबिक वाटपपत्र",
        "nameEn": "Partition Deed & Legal Heirship",
        "icon": "family_restroom",
        "badge": "वारस व वाटप",
        "papers": [
            {
                "key": "part_auth_1",
                "variant": "auth_1",
                "variantLabel": "Authorized · Tahsildar Heirship Order, Pune",
                "isForged": False,
                "confidence": 0.992,
                "authenticScore": "99.2% AUTHENTIC",
                "elaStatus": "Tahsildar Legal Heirship Inquiry Certificate Verified",
                "mutationLedger": "Heirship Case #WARAS-2026/088 Recorded in Revenue DB",
                "collisionCount": "0 Collisions",
                "id": "REC-WARAS-PUN-001",
                "title": "Tahsildar Legal Heirship Order (वारस चौकशी आदेश) · Pune",
                "village": "वाघोली (Wagholi)",
                "tehsil": "हवेली (Haveli)",
                "district": "पुणे (Pune)",
                "khasraNumber": "Gat No. 142/3A",
                "khataNumber": "Case #WARAS-2026/088",
                "ownerName": "१. रमेश विठ्ठल पाटील, २. सुनीता विठ्ठल पाटील (Heirs)",
                "area": "1.45 Hectare (Equal Share)",
                "assessment": "हिंदू वारसा कायदा कलम ८ (Hindu Succession Act)",
                "ownershipType": "वारसदार नोंदणी (Legal Heirship Record)",
                "extraDetails": {
                    "deceased": "कै. विठ्ठल बाबुराव पाटील (Deceased on 12/01/2026)",
                    "heirs": "१. रमेश पाटील (मुलगा), २. सुनीता पाटील (मुलगी), ३. लक्ष्मीबाई पाटील (पत्नी)",
                    "inquiry": "Talathi & Circle Officer Public Inquiry Completed (No Other Heirs)"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "तहसीलदार कार्यालय हवेली, पुणे"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "वारस नोंद मिळकत: गट क्र. १४२/३अ"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "वारस चौकशी प्रकरण क्र. WARAS-2026/088"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "कायदेशीर वारस: रमेश, सुनीता व लक्ष्मीबाई पाटील"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "एकूण वारस क्षेत्र: १.४५ हेक्टर"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "वारसा प्रकार: हिंदू वारसा कायदा १९५६"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "तहसीलदार तथा दंडाधिकारी अधिकृत सील"}
                }
            },
            {
                "key": "part_auth_2",
                "variant": "auth_2",
                "variantLabel": "Authorized · Family Partition Deed, Kolhapur",
                "isForged": False,
                "confidence": 0.986,
                "authenticScore": "98.6% AUTHENTIC",
                "elaStatus": "Registered Family Partition Deed & Map Verified",
                "mutationLedger": "Partition Deed PART-2026/KOP/312 Synced",
                "collisionCount": "0 Collisions",
                "id": "REC-PART-KOP-002",
                "title": "Registered Family Partition Deed (आपसात वाटपपत्र) · Kolhapur",
                "village": "करवीर (Karveer, Kolhapur)",
                "tehsil": "करवीर (Karveer)",
                "district": "कोल्हापूर (Kolhapur)",
                "khasraNumber": "Gat No. 312/1, 312/2, 312/3",
                "khataNumber": "Deed #PART-2026/KOP/312",
                "ownerName": "१. प्रकाश आनंदराव कदम, २. विजय आनंदराव कदम",
                "area": "3.00 Hectare (1.50 Ha Each)",
                "assessment": "आपसात समसमान वाटप (Equal Partition)",
                "ownershipType": "नोंदणीकृत वाटपपत्र (Registered Partition)",
                "extraDetails": {
                    "share1": "Share A: Prakash Kadam (Gat 312/1 - 1.50 Ha)",
                    "share2": "Share B: Vijay Kadam (Gat 312/2 - 1.50 Ha)",
                    "sro": "Karveer Sub-Registrar SRO"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "दुय्यम निबंधक करवीर, कोल्हापूर"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "वाटप मिळकत: गट क्र. ३१२/१ व ३१२/२"},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "वाटपपत्र नोंद क्र. PART-2026/KOP/312"},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "हिस्सेदार: प्रकाश कदम व विजय कदम"},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "एकूण वाटप क्षेत्र: ३.०० हेक्टर"},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "वाटप: समसमान प्रत्येकी १.५० हेक्टर"},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "सह दुय्यम निबंधक करवीर शिक्का"}
                }
            },
            {
                "key": "part_tampered",
                "variant": "tampered",
                "variantLabel": "⚠️ Tampered · Fraudulent Omission of Female Heirs",
                "isForged": True,
                "confidence": 0.150,
                "authenticScore": "15.0% FRAUD ALERT",
                "elaStatus": "Illegal Omission of Surviving Female Legal Heirs (Daughters/Wife)",
                "mutationLedger": "Heirship Affidavit WARAS-FAKE/999 Failed Verification",
                "collisionCount": "1 Legal Succession Dispute Alert",
                "id": "REC-WARAS-FRAUD-001",
                "title": "⚠️ Tampered Heirship Deed · Fraudulent Omission of Daughters",
                "village": "सिन्नर (Sinnar, Nashik)",
                "tehsil": "सिन्नर (Sinnar)",
                "district": "नाशिक (Nashik)",
                "khasraNumber": "Gat No. 66/Ancestral",
                "khataNumber": "Case #WARAS-FAKE/999",
                "ownerName": "सचिन बनावटराव पवार (Sole Fabricated Heir)",
                "area": "4.20 Hectare (Sole Claim)",
                "assessment": "⚠️ बेकायदेशीर वारस नोंद (Daughters Omitted Fraud)",
                "ownershipType": "⚠️ वारसा हक्क डावलण्याचा गुन्हा (Succession Act Violation)",
                "extraDetails": {
                    "omittedHeirs": "२ विवाहीत बहिणींचे नाव लपवून एकट्याच्या नावावर नोंदणीचा प्रयत्न",
                    "violation": "Hindu Succession (Amendment) Act 2005 Violation (Coparcener Rights)",
                    "fraudSummary": "Submitted false affidavit claiming no surviving female siblings"
                },
                "boundingBoxes": {
                    "village": {"top": 11, "left": 14, "width": 42, "height": 6, "label": "तहसीलदार कार्यालय सिन्नर"},
                    "khasraNumber": {"top": 20, "left": 10, "width": 40, "height": 7, "label": "❌ गट क्र. ६६/वडिलोपार्जित (Ancestral Property)", "isTampered": True},
                    "khataNumber": {"top": 29, "left": 10, "width": 40, "height": 7, "label": "❌ बनावट वारस प्रकरण क्र. WARAS-FAKE/999", "isTampered": True},
                    "ownerName": {"top": 39, "left": 10, "width": 78, "height": 10, "label": "❌ बनावट एकमेव वारस: सचिन पवार", "isTampered": True},
                    "area": {"top": 51, "left": 10, "width": 45, "height": 8, "label": "❌ क्षेत्र ४.२० हेक्टर (बहिणींचा हिस्सा हडप)", "isTampered": True},
                    "assessment": {"top": 61, "left": 10, "width": 45, "height": 7, "label": "❌ कायदेशीर महिला वारस डावलल्याची तक्रार", "isTampered": True},
                    "stamp": {"top": 76, "left": 58, "width": 34, "height": 18, "label": "❌ बनावट तहसीलदार स्वाक्षरी व विसंगत शिक्का", "isTampered": True}
                }
            }
        ]
    }
]


def generate_svg_document(doc_type, paper):
    """Generates an ultra-crisp, authentic looking Indian Revenue SVG document."""
    is_forged = paper.get("isForged", False)
    header_color = "#991b1b" if is_forged else "#0f2c59"
    border_color = "#ef4444" if is_forged else "#d97706"
    watermark_text = "⚠️ FORGED / FRAUDULENT SAMPLE" if is_forged else "BHUNETRA · MAHARASHTRA STATE DILRMP"
    watermark_color = "rgba(239, 68, 68, 0.15)" if is_forged else "rgba(15, 44, 89, 0.05)"
    
    # SVG Dimensions: 800 x 1100 (Standard A4 Aspect Ratio)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%" style="background:#FAF8F5;font-family:'Noto Sans Devanagari', 'Mukta', 'Segoe UI', Arial, sans-serif;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5" opacity="0.3"/>
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Document Page Base -->
  <rect width="800" height="1100" fill="#FCFAF7"/>
  <rect width="800" height="1100" fill="url(#grid)"/>

  <!-- Border Frame -->
  <rect x="25" y="25" width="750" height="1050" fill="none" stroke="{border_color}" stroke-width="3" rx="8"/>
  <rect x="32" y="32" width="736" height="1036" fill="none" stroke="{header_color}" stroke-width="1" rx="6" stroke-dasharray="8,4"/>

  <!-- Diagonal Watermark -->
  <g transform="translate(400, 550) rotate(-35)">
    <text x="0" y="0" font-size="38" font-weight="900" fill="{watermark_color}" text-anchor="middle" letter-spacing="4">{watermark_text}</text>
  </g>

  <!-- Government Emblem & Header -->
  <g transform="translate(400, 65)">
    <circle cx="0" cy="0" r="24" fill="{header_color}" opacity="0.1"/>
    <text x="0" y="6" font-size="22" text-anchor="middle">🏛️</text>
    <text x="0" y="34" font-size="13" font-weight="800" fill="{header_color}" text-anchor="middle" letter-spacing="1">महाराष्ट्र शासन — महसूल व वन विभाग</text>
    <text x="0" y="50" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">DIGITAL INDIA LAND RECORDS MODERNIZATION PROGRAMME (DILRMP)</text>
    <text x="0" y="72" font-size="16" font-weight="900" fill="{header_color}" text-anchor="middle">{doc_type['nameMr']} ({doc_type['badge']})</text>
  </g>

  <!-- Verification Security Bar -->
  <g transform="translate(50, 155)">
    <rect width="700" height="30" fill="{header_color}" rx="4"/>
    <text x="15" y="20" font-size="10" font-weight="800" fill="#fbbf24" letter-spacing="0.5">दस्तऐवज ओळख क्र: {paper['id']}</text>
    <text x="685" y="20" font-size="10" font-weight="800" fill="#ffffff" text-anchor="end">तपासणी स्थिती: {paper['authenticScore']}</text>
  </g>

  <!-- Geographic Location Section -->
  <g transform="translate(50, 200)">
    <rect width="700" height="60" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" rx="4"/>
    <text x="15" y="25" font-size="11" font-weight="700" fill="#475569">जिल्हा (District): <tspan font-weight="900" fill="#0f172a">{paper['district']}</tspan></text>
    <text x="250" y="25" font-size="11" font-weight="700" fill="#475569">तालुका (Tehsil): <tspan font-weight="900" fill="#0f172a">{paper['tehsil']}</tspan></text>
    <text x="480" y="25" font-size="11" font-weight="700" fill="#475569">गाव (Village): <tspan font-weight="900" fill="#0f172a">{paper['village']}</tspan></text>
    
    <text x="15" y="48" font-size="11" font-weight="700" fill="#475569">गट / सर्व्हे क्रमांक: <tspan font-weight="900" fill="#0f172a">{paper['khasraNumber']}</tspan></text>
    <text x="250" y="48" font-size="11" font-weight="700" fill="#475569">खाते / दस्त नोंद क्र: <tspan font-weight="900" fill="#0f172a">{paper['khataNumber']}</tspan></text>
    <text x="480" y="48" font-size="11" font-weight="700" fill="#475569">प्रमाण / दर्जा: <tspan font-weight="900" fill="#0f172a">डिजिटल प्रमाणित</tspan></text>
  </g>

  <!-- Main Table Section -->
  <g transform="translate(50, 275)">
    <rect width="700" height="420" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" rx="4"/>
    
    <!-- Table Header Row -->
    <rect width="700" height="35" fill="#e2e8f0" rx="3"/>
    <text x="15" y="22" font-size="11" font-weight="800" fill="#1e293b">तपशील शीर्षक (Attribute)</text>
    <text x="260" y="22" font-size="11" font-weight="800" fill="#1e293b">नोंद तपशील (Extracted Revenue Record)</text>
    <text x="560" y="22" font-size="11" font-weight="800" fill="#1e293b">सत्यता पडताळणी</text>
    
    <!-- Row 1: Landholder / Title Owner -->
    <line x1="0" y1="90" x2="700" y2="90" stroke="#e2e8f0" stroke-width="1"/>
    <text x="15" y="65" font-size="11" font-weight="700" fill="#475569">खातेदार / मालकाचे नाव</text>
    <text x="15" y="80" font-size="9" fill="#94a3b8">Owner / Landholder Name</text>
    <text x="260" y="70" font-size="13" font-weight="900" fill="#0f172a">{paper['ownerName']}</text>
    <text x="560" y="70" font-size="11" font-weight="800" fill="{ '#16a34a' if not is_forged else '#dc2626' }">{ '✔ Verified' if not is_forged else '❌ Mismatch' }</text>

    <!-- Row 2: Land Area & Dimensions -->
    <line x1="0" y1="150" x2="700" y2="150" stroke="#e2e8f0" stroke-width="1"/>
    <text x="15" y="125" font-size="11" font-weight="700" fill="#475569">एकूण क्षेत्र / भूमापन परिमाण</text>
    <text x="15" y="140" font-size="9" fill="#94a3b8">Total Land Area / Dimensions</text>
    <text x="260" y="130" font-size="13" font-weight="900" fill="#0f172a">{paper['area']}</text>
    <text x="560" y="130" font-size="11" font-weight="800" fill="{ '#16a34a' if not is_forged else '#dc2626' }">{ '✔ Math Valid' if not is_forged else '❌ Area Alert' }</text>

    <!-- Row 3: Assessment / Tax -->
    <line x1="0" y1="210" x2="700" y2="210" stroke="#e2e8f0" stroke-width="1"/>
    <text x="15" y="185" font-size="11" font-weight="700" fill="#475569">शासकीय आकारणी / कर</text>
    <text x="15" y="200" font-size="9" fill="#94a3b8">Revenue Tax / Assessment</text>
    <text x="260" y="190" font-size="12" font-weight="900" fill="#0f172a">{paper['assessment']}</text>
    <text x="560" y="190" font-size="11" font-weight="800" fill="{ '#16a34a' if not is_forged else '#dc2626' }">{ '✔ Tax Paid' if not is_forged else '❌ Evasion' }</text>

    <!-- Row 4: Tenure & Classification -->
    <line x1="0" y1="270" x2="700" y2="270" stroke="#e2e8f0" stroke-width="1"/>
    <text x="15" y="245" font-size="11" font-weight="700" fill="#475569">धारणा प्रकार / वर्ग</text>
    <text x="15" y="260" font-size="9" fill="#94a3b8">Tenure Classification</text>
    <text x="260" y="250" font-size="12" font-weight="900" fill="#0f172a">{paper['ownershipType']}</text>
    <text x="560" y="250" font-size="11" font-weight="800" fill="{ '#16a34a' if not is_forged else '#dc2626' }">{ '✔ Class-1' if not is_forged else '❌ Fraudulent' }</text>

    <!-- Row 5: Additional Specifics -->
    <line x1="0" y1="340" x2="700" y2="340" stroke="#e2e8f0" stroke-width="1"/>
    <text x="15" y="305" font-size="11" font-weight="700" fill="#475569">इतर हक्क, बोजा व फेरफार</text>
    <text x="15" y="320" font-size="9" fill="#94a3b8">Liens, Mutation &amp; Encumbrance</text>
    <text x="260" y="310" font-size="10.5" font-weight="700" fill="#334155">{list(paper['extraDetails'].values())[0] if paper['extraDetails'] else 'निरंक (No Encumbrance)'}</text>
    <text x="260" y="328" font-size="10" font-weight="600" fill="#64748b">{list(paper['extraDetails'].values())[1] if len(paper['extraDetails']) > 1 else ''}</text>
    <text x="560" y="315" font-size="11" font-weight="800" fill="{ '#16a34a' if not is_forged else '#dc2626' }">{ '✔ Clear' if not is_forged else '❌ Flagged' }</text>

    <!-- Row 6: Security Check Hash -->
    <text x="15" y="375" font-size="10" font-weight="700" fill="#475569">डिजिटल क्रिप्टोग्राफिक हॅश</text>
    <text x="15" y="390" font-size="9" fill="#94a3b8">SHA-256 State Ledger Hash</text>
    <text x="260" y="380" font-size="9.5" font-family="monospace" font-weight="700" fill="#475569">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</text>
  </g>

  <!-- Forensic Stamp & Verification Section -->
  <g transform="translate(50, 715)">
    <!-- Stamp Box -->
    <g transform="translate(450, 15)">
      <rect width="230" height="95" fill="none" stroke="{ '#dc2626' if is_forged else '#2563eb' }" stroke-width="2" rx="6" stroke-dasharray="{ '4,2' if is_forged else 'none' }"/>
      <circle cx="45" cy="48" r="30" fill="{ '#fee2e2' if is_forged else '#eff6ff' }" stroke="{ '#dc2626' if is_forged else '#2563eb' }" stroke-width="1.5"/>
      <text x="45" y="53" font-size="18" text-anchor="middle">{ '❌' if is_forged else '🏛️' }</text>
      <text x="88" y="35" font-size="10" font-weight="900" fill="{ '#dc2626' if is_forged else '#1e40af' }">{ '⚠️ बनावट / अनधिकृत' if is_forged else 'महसूल विभाग, महाराष्ट्र' }</text>
      <text x="88" y="50" font-size="9" font-weight="700" fill="#475569">{ 'विसंगत शिक्का व सही' if is_forged else 'सक्षम महसूल अधिकारी' }</text>
      <text x="88" y="65" font-size="8" font-family="monospace" fill="#64748b">DS-2026-NIC-MH-{paper['variant'].upper()}</text>
      <text x="88" y="80" font-size="8" font-weight="800" fill="{ '#dc2626' if is_forged else '#15803d' }">{ '❌ FRAUD ALERT' if is_forged else '✔ Digitally Verified' }</text>
    </g>

    <!-- Barcode & QR Stamp -->
    <g transform="translate(20, 20)">
      <rect width="180" height="70" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
      <!-- Simulated Barcode Bars -->
      <g transform="translate(15, 12)">
        <rect x="0" width="3" height="32" fill="#0f172a"/>
        <rect x="5" width="2" height="32" fill="#0f172a"/>
        <rect x="9" width="4" height="32" fill="#0f172a"/>
        <rect x="15" width="2" height="32" fill="#0f172a"/>
        <rect x="19" width="5" height="32" fill="#0f172a"/>
        <rect x="26" width="3" height="32" fill="#0f172a"/>
        <rect x="31" width="1" height="32" fill="#0f172a"/>
        <rect x="34" width="4" height="32" fill="#0f172a"/>
        <rect x="40" width="2" height="32" fill="#0f172a"/>
        <rect x="44" width="6" height="32" fill="#0f172a"/>
        <rect x="52" width="2" height="32" fill="#0f172a"/>
        <rect x="56" width="4" height="32" fill="#0f172a"/>
        <rect x="62" width="3" height="32" fill="#0f172a"/>
        <rect x="67" width="1" height="32" fill="#0f172a"/>
        <rect x="70" width="5" height="32" fill="#0f172a"/>
        <rect x="77" width="2" height="32" fill="#0f172a"/>
        <rect x="81" width="4" height="32" fill="#0f172a"/>
        <rect x="87" width="3" height="32" fill="#0f172a"/>
        <rect x="92" width="5" height="32" fill="#0f172a"/>
        <rect x="99" width="2" height="32" fill="#0f172a"/>
        <rect x="103" width="4" height="32" fill="#0f172a"/>
        <rect x="109" width="2" height="32" fill="#0f172a"/>
        <rect x="113" width="5" height="32" fill="#0f172a"/>
        <rect x="120" width="3" height="32" fill="#0f172a"/>
        <rect x="125" width="2" height="32" fill="#0f172a"/>
        <rect x="129" width="4" height="32" fill="#0f172a"/>
        <rect x="135" width="3" height="32" fill="#0f172a"/>
        <rect x="140" width="4" height="32" fill="#0f172a"/>
        <rect x="146" width="2" height="32" fill="#0f172a"/>
      </g>
      <text x="90" y="58" font-size="8" font-family="monospace" text-anchor="middle" fill="#475569">MH-{paper['id']}</text>
    </g>
  </g>

  <!-- Legal Disclaimer Footer -->
  <g transform="translate(50, 1020)">
    <line x1="0" y1="0" x2="700" y2="0" stroke="#cbd5e1" stroke-width="1"/>
    <text x="0" y="16" font-size="8.5" fill="#64748b">सूचना: हा दस्तऐवज महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत डिजिटल स्वाक्षरीने तयार करण्यात आला आहे. अधिकृत तपासणीसाठी https://bhulekh.mahabhumi.gov.in वापरावे.</text>
    <text x="700" y="16" font-size="8.5" font-weight="700" fill="{ '#dc2626' if is_forged else '#0f2c59' }" text-anchor="end">BHUNETRA FORENSIC SUITE 2026</text>
  </g>
</svg>"""
    return svg


def main():
    print(f"Generating 30 demo visual documents across 10 categories...")
    
    catalog_entries = []
    
    for doc_type in DOC_TYPES_DATA:
        type_id = doc_type["id"]
        print(f"Processing category: {doc_type['nameEn']} ({type_id})")
        
        for paper in doc_type["papers"]:
            paper_key = paper["key"]
            svg_content = generate_svg_document(doc_type, paper)
            
            # Save SVG file
            svg_filename = f"{paper_key}.svg"
            svg_path = os.path.join(FRONTEND_PUBLIC_DEMO, svg_filename)
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
                
            # Create matching catalog entry for React
            catalog_entry = {
                "key": paper_key,
                "categoryId": type_id,
                "categoryKey": doc_type["categoryKey"],
                "categoryNameMr": doc_type["nameMr"],
                "categoryNameEn": doc_type["nameEn"],
                "badge": doc_type["badge"],
                "icon": doc_type["icon"],
                "variant": paper["variant"],
                "variantLabel": paper["variantLabel"],
                "isForged": paper["isForged"],
                "confidence": paper["confidence"],
                "id": paper["id"],
                "title": paper["title"],
                "image": f"/demo_papers/{svg_filename}",
                "category": doc_type["categoryKey"],
                "categoryLabel": doc_type["nameMr"],
                "extractedFields": {
                    "village": {"value": paper["village"], "confidence": paper["confidence"]},
                    "tehsil": {"value": paper["tehsil"], "confidence": paper["confidence"]},
                    "district": {"value": paper["district"], "confidence": paper["confidence"]},
                    "khasraNumber": {"value": paper["khasraNumber"], "confidence": 0.35 if paper["isForged"] else 0.96},
                    "khataNumber": {"value": paper["khataNumber"], "confidence": 0.32 if paper["isForged"] else 0.95},
                    "ownerName": {"value": paper["ownerName"], "confidence": 0.28 if paper["isForged"] else 0.96},
                    "area": {"value": paper["area"], "confidence": 0.25 if paper["isForged"] else 0.94},
                    "assessment": {"value": paper["assessment"], "confidence": 0.20 if paper["isForged"] else 0.90},
                    "ownershipType": {"value": paper["ownershipType"], "confidence": 0.20 if paper["isForged"] else 0.95},
                },
                "boundingBoxes": paper["boundingBoxes"],
                "forensic": {
                    "authenticScore": paper["authenticScore"],
                    "elaStatus": paper["elaStatus"],
                    "mutationLedger": paper["mutationLedger"],
                    "collisionCount": paper["collisionCount"],
                    "isForged": paper["isForged"],
                },
                "extraDetails": paper["extraDetails"]
            }
            catalog_entries.append(catalog_entry)

    # Write frontend JS module
    js_content = f"""/*
 * Auto-generated 30 Land & Property Demo Documents Catalog
 * 10 Categories x 3 Papers (2 Authorized + 1 Tampered)
 */

export const DEMO_DOCUMENTS_CATALOG = {json.dumps(catalog_entries, indent=2, ensure_ascii=False)};

export const DOCUMENT_CATEGORIES = {json.dumps([
    {
        "id": d["id"],
        "categoryKey": d["categoryKey"],
        "nameMr": d["nameMr"],
        "nameEn": d["nameEn"],
        "icon": d["icon"],
        "badge": d["badge"]
    }
    for d in DOC_TYPES_DATA
], indent=2, ensure_ascii=False)};
"""
    catalog_js_path = os.path.join(FRONTEND_DATA_DIR, "demoDocumentsCatalog.js")
    with open(catalog_js_path, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Successfully generated 30 SVG files in {FRONTEND_PUBLIC_DEMO}")
    print(f"Successfully created catalog module at {catalog_js_path}")


if __name__ == "__main__":
    main()
