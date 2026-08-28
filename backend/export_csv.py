"""
Exports Mahabhulekh Land Records from SQLite DB to CSV format (backend/app/data/mahabhulekh_land_records.csv).
"""
import os
import sqlite3
import csv

DB_PATH = os.path.join(os.path.dirname(__file__), "app", "data", "mahabhulekh_1million.db")
CSV_PATH = os.path.join(os.path.dirname(__file__), "app", "data", "mahabhulekh_land_records.csv")

def export_to_csv(limit: int = 10000):
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT khasraNumber, khataNumber, ownerNameMr, ownerNameEn, villageMr, villageEn, tehsilMr, tehsilEn, districtMr, districtEn, totalAreaHa, cultivableAreaHa, uncultivableAreaHa, ownershipType, encumbranceStatus, lastMutationNo, ulpinCode, digitalSignatureHash FROM records LIMIT ?", (limit,))
    rows = cursor.fetchall()
    
    headers = [
        "khasraNumber", "khataNumber", "ownerNameMr", "ownerNameEn",
        "villageMr", "villageEn", "tehsilMr", "tehsilEn", "districtMr", "districtEn",
        "totalAreaHa", "cultivableAreaHa", "uncultivableAreaHa", "ownershipType",
        "encumbranceStatus", "lastMutationNo", "ulpinCode", "digitalSignatureHash"
    ]
    
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
        
    conn.close()
    print(f"[SUCCESS] Exported {len(rows):,} records to CSV at: {CSV_PATH}")

if __name__ == "__main__":
    export_to_csv(10000)
