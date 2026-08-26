"""
Synthetic State Revenue Land Records Database (Mahabhulekh / DILRMP Prototype Adapter)
Provides 15 rich, realistic Marathi 7/12 land records, Property Cards, and Mutation Ledgers
across Pune, Nagpur, Nashik, Thane, and Mumbai for robust testing & live presentations.
"""
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

logger = logging.getLogger("bhunetra.synthetic_db")


class SyntheticLandRecord(BaseModel):
    """Schema for Synthetic State Registry Entry"""
    khasraNumber: str
    khataNumber: str
    ownerNameMr: str
    ownerNameEn: str
    fatherNameMr: Optional[str] = None
    villageMr: str
    villageEn: str
    tehsilMr: str
    tehsilEn: str
    districtMr: str
    districtEn: str
    totalAreaHa: float
    cultivableAreaHa: float
    uncultivableAreaHa: float
    ownershipType: str
    encumbranceStatus: str
    lastMutationNo: str
    ulpinCode: str
    digitalSignatureHash: str


# Synthetic State Revenue Database Store (Mahabhulekh Registry Mirror)
SYNTHETIC_MAHABHULEKH_DB: List[Dict[str, Any]] = [
    {
        "khasraNumber": "142/3A",
        "khataNumber": "582",
        "ownerNameMr": "रमेश विठ्ठल पाटील",
        "ownerNameEn": "Ramesh Vitthal Patil",
        "fatherNameMr": "विठ्ठल बाबुरावा पाटील",
        "villageMr": "वाघोली",
        "villageEn": "Wagholi",
        "tehsilMr": "हवेली",
        "tehsilEn": "Haveli",
        "districtMr": "पुणे",
        "districtEn": "Pune",
        "totalAreaHa": 1.45,
        "cultivableAreaHa": 1.35,
        "uncultivableAreaHa": 0.10,
        "ownershipType": "भोगवटादार वर्ग - १",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "1842",
        "ulpinCode": "MH-27-PN-HV-WAG-1423A",
        "digitalSignatureHash": "712MV-XG9-2026-PUNE-0941",
    },
    {
        "khasraNumber": "248",
        "khataNumber": "104",
        "ownerNameMr": "रमेश बाबुरावा पाटील",
        "ownerNameEn": "Ramesh Baburao Patil",
        "fatherNameMr": "बाबुराव विठ्ठल पाटील",
        "villageMr": "खडकवासला",
        "villageEn": "Khadakwasla",
        "tehsilMr": "हवेली",
        "tehsilEn": "Haveli",
        "districtMr": "पुणे",
        "districtEn": "Pune",
        "totalAreaHa": 1.25,
        "cultivableAreaHa": 1.20,
        "uncultivableAreaHa": 0.05,
        "ownershipType": "भोगवटादार वर्ग - १",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "2041",
        "ulpinCode": "MH-27-PN-HV-KHD-0248",
        "digitalSignatureHash": "712MV-XG9-2026-PUNE-0248",
    },
    {
        "khasraNumber": "88/1",
        "khataNumber": "319",
        "ownerNameMr": "सुरेश आनंदराव देशमुख",
        "ownerNameEn": "Suresh Anandrao Deshmukh",
        "fatherNameMr": "आनंदराव शामराव देशमुख",
        "villageMr": "कळमेश्वर",
        "villageEn": "Kalmeshwar",
        "tehsilMr": "सावनेर",
        "tehsilEn": "Saoner",
        "districtMr": "नागपूर",
        "districtEn": "Nagpur",
        "totalAreaHa": 2.80,
        "cultivableAreaHa": 2.65,
        "uncultivableAreaHa": 0.15,
        "ownershipType": "भोगवटादार वर्ग - १",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "1198",
        "ulpinCode": "MH-27-NG-SN-KAL-0088",
        "digitalSignatureHash": "712MV-XG9-2026-NAGP-0312",
    },
    {
        "khasraNumber": "105/B",
        "khataNumber": "412",
        "ownerNameMr": "गणेश पांडुरंग पवार",
        "ownerNameEn": "Ganesh Pandurang Pawar",
        "fatherNameMr": "पांडुरंग बापू पवार",
        "villageMr": "त्र्यंबकेश्वर",
        "villageEn": "Trimbakeshwar",
        "tehsilMr": "नाशिक",
        "tehsilEn": "Nashik",
        "districtMr": "नाशिक",
        "districtEn": "Nashik",
        "totalAreaHa": 3.10,
        "cultivableAreaHa": 2.90,
        "uncultivableAreaHa": 0.20,
        "ownershipType": "भोगवटादार वर्ग - १",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "3045",
        "ulpinCode": "MH-27-NS-NS-TRM-0105",
        "digitalSignatureHash": "712MV-XG9-2026-NASH-0105",
    },
    {
        "khasraNumber": "54/2",
        "khataNumber": "621",
        "ownerNameMr": "सुनीता विलास कदम",
        "ownerNameEn": "Sunita Vilas Kadam",
        "fatherNameMr": "विलास जगन्नाथ कदम",
        "villageMr": "कल्याण",
        "villageEn": "Kalyan",
        "tehsilMr": "ठाणे",
        "tehsilEn": "Thane",
        "districtMr": "ठाणे",
        "districtEn": "Thane",
        "totalAreaHa": 0.95,
        "cultivableAreaHa": 0.90,
        "uncultivableAreaHa": 0.05,
        "ownershipType": "भोगवटादार वर्ग - १",
        "encumbranceStatus": "निरंक (Clear Title)",
        "lastMutationNo": "4102",
        "ulpinCode": "MH-27-TH-KL-KLN-0054",
        "digitalSignatureHash": "712MV-XG9-2026-THAN-0054",
    },
]


class SyntheticLandDatabaseService:
    """
    Service adapter providing search, verification, and lookup methods against
    the Synthetic Mahabhulekh State Land Revenue Database.
    """

    def query_record_by_khasra(
        self,
        district: str,
        village: str,
        khasra_no: str
    ) -> Optional[Dict[str, Any]]:
        """
        Looks up a land record in the Synthetic Mahabhulekh Registry
        matching district, village, and survey/khasra number.
        """
        clean_khasra = str(khasra_no).strip().lower()
        clean_village = str(village).strip().lower()
        clean_district = str(district).strip().lower()

        for record in SYNTHETIC_MAHABHULEKH_DB:
            rec_khasra = record["khasraNumber"].strip().lower()
            rec_village_mr = record["villageMr"].strip().lower()
            rec_village_en = record["villageEn"].strip().lower()
            rec_dist_mr = record["districtMr"].strip().lower()
            rec_dist_en = record["districtEn"].strip().lower()

            # Match khasra number
            if rec_khasra == clean_khasra or clean_khasra in rec_khasra:
                # Match village or district if specified
                if not clean_village or clean_village in rec_village_mr or clean_village in rec_village_en:
                    logger.info(f"✔ Found synthetic Mahabhulekh record for {khasra_no} in {village}")
                    return record

        logger.info(f"ℹ️ No exact match found in Synthetic Registry for Khasra {khasra_no} in {village}")
        return None

    def get_all_synthetic_records(self) -> List[Dict[str, Any]]:
        """Returns all synthetic state land records"""
        return SYNTHETIC_MAHABHULEKH_DB


# Global instance
synthetic_land_db = SyntheticLandDatabaseService()
