"""
Firebase Admin SDK Connection and Cloud Services Management
Handles Firestore DB, Firebase Auth verification, and Firebase Storage bucket operations.
Includes signed URL generation for secure frontend document viewing and offline dev fallbacks.
"""
import os
import logging
from datetime import timedelta
from typing import Optional, Dict, Any

from app.config import settings

logger = logging.getLogger("bhunetra.firebase")

# Firebase Admin state
_firebase_app = None
_db = None
_bucket = None
_is_connected = False


class LocalMockFirestore:
    """
    In-memory mock store used during early development or offline mode
    when firebase-adminsdk.json is not yet provided by the user.
    """
    def __init__(self):
        self._collections: Dict[str, Dict[str, Any]] = {
            "users": {},
            "documents": {},
            "records": {},
            "verificationQueue": {},
            "auditLog": {},
        }
        logger.warning(
            "⚠️ Running with in-memory Mock Firestore. Place 'firebase-adminsdk.json' "
            "to connect to live Google Cloud Firestore."
        )

    def collection(self, name: str):
        if name not in self._collections:
            self._collections[name] = {}
        return MockCollection(self._collections[name], name)


class MockCollection:
    def __init__(self, storage: dict, name: str):
        self.storage = storage
        self.name = name

    def document(self, doc_id: str):
        return MockDocumentReference(self.storage, doc_id, self.name)

    def get(self):
        return [MockDocumentSnapshot(k, v) for k, v in self.storage.items()]

    def where(self, field: str, op: str, value: Any):
        # Basic filter simulation
        filtered = {}
        for k, v in self.storage.items():
            if op == "==" and v.get(field) == value:
                filtered[k] = v
            elif op == ">=" and v.get(field, 0) >= value:
                filtered[k] = v
            elif op == "<=" and v.get(field, 0) <= value:
                filtered[k] = v
        return MockCollection(filtered, self.name)

    def add(self, data: dict):
        import uuid
        doc_id = str(uuid.uuid4())
        self.storage[doc_id] = data
        return None, MockDocumentReference(self.storage, doc_id, self.name)


class MockDocumentReference:
    def __init__(self, storage: dict, doc_id: str, collection_name: str):
        self.storage = storage
        self.id = doc_id
        self.collection_name = collection_name

    def set(self, data: dict, merge: bool = False):
        if merge and self.id in self.storage:
            self.storage[self.id].update(data)
        else:
            self.storage[self.id] = data

    def update(self, data: dict):
        if self.id in self.storage:
            self.storage[self.id].update(data)
        else:
            self.storage[self.id] = data

    def get(self):
        if self.id in self.storage:
            return MockDocumentSnapshot(self.id, self.storage[self.id], exists=True)
        return MockDocumentSnapshot(self.id, {}, exists=False)

    def delete(self):
        if self.id in self.storage:
            del self.storage[self.id]


class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: dict, exists: bool = True):
        self.id = doc_id
        self._data = data
        self.exists = exists

    def to_dict(self):
        return dict(self._data)


def initialize_firebase():
    """
    Initializes Firebase Admin SDK using service account credentials.
    Falls back to mock mode if credentials file is not found.
    """
    global _firebase_app, _db, _bucket, _is_connected

    cred_path = settings.FIREBASE_CREDENTIALS_PATH

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage

        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            _db = firestore.client()
            try:
                _bucket = storage.bucket()
            except Exception as e:
                logger.warning(f"Storage bucket init warning: {e}")
                _bucket = None
            _is_connected = True
            logger.info(f"✅ Firebase Admin SDK initialized successfully with {cred_path}")
        else:
            logger.warning(
                f"ℹ️ Firebase credentials file not found at '{cred_path}'. "
                "Backend will run in mock/dev mode until credentials are provided."
            )
            _db = LocalMockFirestore()
            _is_connected = False

    except ImportError:
        logger.error("firebase-admin package is not installed.")
        _db = LocalMockFirestore()
        _is_connected = False
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        _db = LocalMockFirestore()
        _is_connected = False


# Initialize on module load
initialize_firebase()


def get_db():
    """Returns the Firestore DB client (or mock client in dev mode)"""
    global _db
    if _db is None:
        initialize_firebase()
    return _db


def get_storage_bucket():
    """Returns the Firebase Storage Bucket instance"""
    global _bucket
    return _bucket


def is_firebase_connected() -> bool:
    """Returns True if live Firebase connection is active"""
    return _is_connected


def generate_signed_url(blob_path: str, expires_minutes: int = 15) -> str:
    """
    Generates a secure, short-lived signed URL for document viewing by the frontend.
    Falls back to mock static URL in local dev mode.
    """
    bucket = get_storage_bucket()
    if bucket is not None and _is_connected:
        try:
            blob = bucket.blob(blob_path)
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(minutes=expires_minutes),
                method="GET",
            )
            return url
        except Exception as e:
            logger.error(f"Error generating signed URL for {blob_path}: {e}")
    
    # Dev / fallback URL
    return f"/api/documents/static/{blob_path}"
