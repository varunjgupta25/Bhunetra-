import os
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = 'http://localhost:8000'
HEADERS = {'Authorization': 'Bearer dev-admin-token'}

print("--- 1. Testing Clean Document Upload ---")
clean_path = os.path.join('demo_papers', '01_712_extract_1_Authorized_Wagholi.jpg')
with open(clean_path, 'rb') as f:
    r1 = requests.post(f"{BASE}/api/documents/upload", files={'file': (os.path.basename(clean_path), f, 'image/jpeg')}, headers=HEADERS)
print(f"Status Code: {r1.status_code}")
print(f"Response: {r1.json()}")
assert r1.status_code == 201

print("\n--- 2. Testing Non-Land / Garbage Document Upload ---")
dummy_content = b"%PDF-1.4 Resume Curriculum Vitae Software Engineer"
r2 = requests.post(
    f"{BASE}/api/documents/upload",
    files={'file': ('resume_sample_candidate.pdf', dummy_content, 'application/pdf')},
    headers=HEADERS
)
print(f"Status Code: {r2.status_code}")
print(f"Response text: {r2.text}")
assert r2.status_code in [400, 422], f"Expected 400 or 422 rejection, got {r2.status_code}"

print("\n--- 3. Testing Tampered Document Upload ---")
tampered_path = os.path.join('demo_papers', '01_712_extract_3_TAMPERED_Fake_Village.jpg')
with open(tampered_path, 'rb') as f:
    r3 = requests.post(f"{BASE}/api/documents/upload", files={'file': (os.path.basename(tampered_path), f, 'image/jpeg')}, headers=HEADERS)
print(f"Status Code: {r3.status_code}")
print(f"Response: {r3.json()}")
assert r3.status_code == 201

print("\nAll 3 upload scenario tests PASSED.")
