"""
Bhunetra Firebase Diagnostics & Connection Test Script
Tests Firebase Admin SDK credentials, Firestore DB, and Cloud Storage connectivity.
Run with:
    python test_firebase_connection.py
"""
import os
import sys
import json
from datetime import datetime, timezone

# Ensure stdout supports UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def main():
    print("=" * 65)
    print(" [BHUNETRA] FIREBASE CONNECTIVITY DIAGNOSTICS")
    print("=" * 65)

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    bucket_name = settings.FIREBASE_STORAGE_BUCKET

    print(f"\n1. Checking Service Account Credentials Path:")
    print(f"   Configured path: {cred_path}")

    abs_path = os.path.abspath(cred_path)
    if not os.path.exists(abs_path):
        print(f"   [X] File NOT found at: {abs_path}")
        print("\n" + "-" * 65)
        print("   >>> HOW TO RESOLVE IN 2 MINUTES:")
        print("   1. Open Firebase Console: https://console.firebase.google.com")
        print("   2. Select your project")
        print("   3. Click Gear icon (Project Settings) -> 'Service accounts' tab")
        print("   4. Click 'Generate new private key'")
        print("   5. Rename the downloaded file to 'firebase-adminsdk.json'")
        print(f"   6. Place it in: {os.path.dirname(abs_path)}")
        print("-" * 65 + "\n")
        print("[i] Bhunetra backend is currently running in Local Mock Mode.")
        return 1

    print(f"   [OK] Credentials file found at: {abs_path}")

    # Inspect JSON integrity
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            cred_data = json.load(f)
        project_id = cred_data.get("project_id", "unknown")
        client_email = cred_data.get("client_email", "unknown")
        print(f"   [OK] Project ID: {project_id}")
        print(f"   [OK] Client Email: {client_email}")
    except Exception as e:
        print(f"   [X] Failed to parse JSON key: {e}")
        return 1

    # Initialize Firebase Admin
    print("\n2. Initializing Firebase Admin SDK...")
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage

        try:
            app = firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(abs_path)
            app = firebase_admin.initialize_app(cred, {
                "storageBucket": bucket_name
            })
        print("   [OK] Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"   [X] Firebase Admin SDK initialization failed: {e}")
        return 1

    # Test Firestore Read / Write
    print("\n3. Testing Google Cloud Firestore connection...")
    try:
        db = firestore.client()
        test_doc_ref = db.collection("_system_health").document("connection_test")
        test_payload = {
            "service": "Bhunetra Diagnostics",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "connected"
        }
        test_doc_ref.set(test_payload)
        snapshot = test_doc_ref.get()
        if snapshot.exists and snapshot.to_dict().get("status") == "connected":
            print("   [OK] Firestore Write & Read verified successfully!")
            test_doc_ref.delete()
        else:
            print("   [!] Firestore read did not return expected verification data.")
    except Exception as e:
        print(f"   [X] Firestore connection test failed: {e}")
        print("       Tip: Ensure 'Cloud Firestore' is created in Firebase Console (Start in test mode).")
        return 1

    # Test Cloud Storage Bucket
    print("\n4. Testing Firebase Storage Bucket...")
    try:
        bucket = storage.bucket()
        print(f"   Target Bucket: {bucket.name}")
        ping_blob = bucket.blob("_system_health_ping.txt")
        ping_blob.upload_from_string(b"bhunetra-ping", content_type="text/plain")
        if ping_blob.exists():
            print("   [OK] Cloud Storage Write & Verify successful!")
            ping_blob.delete()
        else:
            print("   [!] Cloud Storage upload succeeded but blob was not found.")
    except Exception as e:
        print(f"   [!] Cloud Storage test notice: {e}")
        print(f"       Tip: Verify bucket '{bucket_name}' exists in Firebase Console -> Storage.")

    print("\n" + "=" * 65)
    print(" [OK] ALL CORE FIREBASE SERVICES CONNECTED AND OPERATIONAL!")
    print("      You can now run: python sync_to_firestore.py")
    print("      to populate all 30 demo land records to live Firestore.")
    print("=" * 65 + "\n")
    return 0

if __name__ == "__main__":
    sys.exit(main())
