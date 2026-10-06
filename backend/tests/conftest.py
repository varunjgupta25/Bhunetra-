"""
Keep the test suite hermetic, independent of any local .env:
- always use the in-memory mock Firestore, even when a local firebase-adminsdk.json
  would connect to the live project
- API tests call endpoints without a token, so run with the dev auth bypass on
  (test_auth_bypass.py overrides these per test to check the secure defaults)
"""
from app.config import settings
import app.firebase_config as firebase_config

settings.ENVIRONMENT = "development"
settings.ALLOW_DEV_AUTH_BYPASS = True

firebase_config._db = firebase_config.LocalMockFirestore()
firebase_config._bucket = None
firebase_config._is_connected = False
