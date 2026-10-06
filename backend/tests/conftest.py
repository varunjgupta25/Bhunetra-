"""
Keep the test suite hermetic: always use the in-memory mock Firestore,
even when a local firebase-adminsdk.json would connect to the live project.
"""
import app.firebase_config as firebase_config

firebase_config._db = firebase_config.LocalMockFirestore()
firebase_config._bucket = None
firebase_config._is_connected = False
