"""
Bhunetra Live Firestore Synchronization Script
Populates your real Google Cloud Firestore database with:
- All 30 demo land records across all 10 document categories (Authorized + Fraud demos)
- Active verification queue entries
- Initial system audit log entries
- Default RBAC role metadata in 'users' collection

Usage:
    python sync_to_firestore.py
"""
import os
import sys
from datetime import datetime, timezone

# Ensure stdout supports UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.firebase_config import get_db, is_firebase_connected
from app.routes.records import DEMO_PAPERS_MAP, demo_paper_to_land_record
from app.schemas.common import VerificationStatus

SYSTEM_USERS = [
    {
        "uid": "admin-001",
        "email": "admin@bhunetra.gov.in",
        "displayName": "Varun Gupta",
        "role": "admin",
        "district": "All Districts",
        "department": "State Land Records Directorate",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "uid": "verifier-001",
        "email": "verifier.nashik@bhunetra.gov.in",
        "displayName": "A. R. Shinde",
        "role": "verifier",
        "district": "Nashik",
        "department": "Revenue Inspection Division",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "uid": "officer-001",
        "email": "officer.pune@bhunetra.gov.in",
        "displayName": "K. S. Patil",
        "role": "officer",
        "district": "Pune",
        "department": "Department of Land Resources",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    },
]

def main():
    print("=" * 65)
    print(" [BHUNETRA] FIRESTORE DATABASE SYNCHRONIZATION")
    print("=" * 65)

    db = get_db()
    live = is_firebase_connected()

    if live:
        print("  [LIVE] Target: LIVE Google Cloud Firestore")
    else:
        print("  [MOCK] Target: Local In-Memory Mock Store")
        print("         (Provide 'firebase-adminsdk.json' in backend to write directly to Google Cloud)")

    print(f"\n1. Synchronizing {len(DEMO_PAPERS_MAP)} demo land records across all 10 categories...")
    records_count = 0
    queue_count = 0

    for paper_id, paper in DEMO_PAPERS_MAP.items():
        land_rec = demo_paper_to_land_record(paper)
        rec_dict = land_rec.model_dump()
        db.collection("records").document(rec_dict["recordId"]).set(rec_dict)
        records_count += 1

        if rec_dict.get("verificationStatus") == VerificationStatus.PENDING_REVIEW.value:
            queue_data = {
                "queueId": f"Q-{rec_dict['recordId']}",
                "recordId": rec_dict["recordId"],
                "assignedTo": None,
                "priority": "high",
                "status": "pending",
                "flaggedFields": ["isForged"] if rec_dict.get("isForged") else [],
                "overallConfidence": rec_dict.get("overallConfidence", 0.0),
                "createdAt": rec_dict.get("createdAt", datetime.now(timezone.utc).isoformat()),
            }
            db.collection("verificationQueue").document(f"Q-{rec_dict['recordId']}").set(queue_data)
            queue_count += 1

    print(f"   [OK] {records_count} records synchronized into collection 'records'.")
    print(f"   [OK] {queue_count} pending review items synchronized into collection 'verificationQueue'.")

    print("\n2. Seeding default RBAC system user profiles...")
    for user in SYSTEM_USERS:
        db.collection("users").document(user["uid"]).set(user)
    print(f"   [OK] {len(SYSTEM_USERS)} user roles created in collection 'users'.")

    print("\n3. Creating initial audit log entry...")
    audit_entry = {
        "action": "FIRESTORE_DATABASE_SYNCHRONIZATION",
        "actor": "admin-001 (Varun Gupta)",
        "details": f"Synchronized {records_count} land records across 10 categories into Firestore.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ipAddress": "127.0.0.1",
        "status": "SUCCESS"
    }
    db.collection("auditLog").document("INIT-SYNC-001").set(audit_entry)
    print("   [OK] Initialization audit log written to collection 'auditLog'.")

    print("\n" + "=" * 65)
    print(f" [OK] SYNC COMPLETE: {records_count} records, {queue_count} queues, {len(SYSTEM_USERS)} users.")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    main()
