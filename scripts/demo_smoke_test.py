r"""
Standalone QR URL verification and demo scenario smoke test.
Run from project root: bhunetra/
Usage: python scripts/demo_smoke_test.py
"""
import sys, os, io, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, 'backend')

from app.services.qr_certificate_generator import generate_record_pdf

BACKEND = "http://localhost:8000"
LAN_IP = "10.24.165.216"
FRONTEND_PORT = 5173

print("=" * 60)
print("  BHUNETRA END-TO-END DEMO SMOKE TEST")
print("=" * 60)

results = {}

# ── Test 1: verify-status for a real synthetic record ─────────────
print("\n[1/5] verify-status endpoint (no auth required)...")
rid = "REC-SYN-1050001"
try:
    with urllib.request.urlopen(f"{BACKEND}/api/records/{rid}/verify-status", timeout=8) as r:
        data = json.loads(r.read().decode('utf-8'))
        assert data["recordId"] == rid
        assert data["verificationStatus"]
        owner = data.get('ownerName','?').encode('ascii', errors='replace').decode()[:30]
        print(f"     PASS  status={data['verificationStatus']}, owner={owner}")
        results["verify_status_real_id"] = "PASS"
except Exception as e:
    print(f"     FAIL  {e}")
    results["verify_status_real_id"] = f"FAIL: {e}"

# ── Test 2: 404 for invalid record ID ─────────────────────────────
print("\n[2/5] verify-status returns 404 for invalid ID...")
try:
    with urllib.request.urlopen(f"{BACKEND}/api/records/INVALID-XYZ-999/verify-status", timeout=8) as r:
        print(f"     FAIL  Expected 404 but got {r.status}")
        results["404_invalid_id"] = f"FAIL: got {r.status}"
except urllib.error.HTTPError as e:
    if e.code == 404:
        print(f"     PASS  HTTP 404 confirmed")
        results["404_invalid_id"] = "PASS"
    else:
        print(f"     FAIL  Unexpected HTTP {e.code}")
        results["404_invalid_id"] = f"FAIL: HTTP {e.code}"

# ── Test 3: PDF generation + QR URL correctness ───────────────────
print("\n[3/5] PDF generation (ReportLab + embedded QR)...")
try:
    verify_url = f"http://{LAN_IP}:{FRONTEND_PORT}/verify/{rid}"
    pdf_bytes = generate_record_pdf(rid, {
        "owner_name": "Ramesh Vitthal Patil",
        "property_id": "142/3A",
        "area": "1.45",
        "village": "Wagholi",
        "district": "Pune",
        "state": "Maharashtra",
    }, verify_url)
    assert pdf_bytes[:5] == b"%PDF-", "Not a valid PDF"
    assert len(pdf_bytes) > 10000, f"PDF too small: {len(pdf_bytes)} bytes"
    print(f"     PASS  {len(pdf_bytes):,} bytes, valid PDF header")
    print(f"           QR points to: {verify_url}")
    results["pdf_generation"] = "PASS"

    # Save for demo backup
    os.makedirs("demo_output", exist_ok=True)
    out_path = f"demo_output/certificate_{rid}.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)
    print(f"           Saved: {out_path}")
except Exception as e:
    print(f"     FAIL  {e}")
    results["pdf_generation"] = f"FAIL: {e}"

# ── Test 4: export-pdf authenticated endpoint ─────────────────────
print("\n[4/5] export-pdf endpoint (authenticated)...")
try:
    req = urllib.request.Request(
        f"{BACKEND}/api/records/{rid}/export-pdf",
        headers={"Authorization": "Bearer dev-admin-token"},
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        content = r.read()
        ct = r.headers.get("Content-Type", "")
        assert content[:5] == b"%PDF-"
        assert "application/pdf" in ct
        print(f"     PASS  {len(content):,} bytes, Content-Type: {ct}")
        results["export_pdf_endpoint"] = "PASS"
except Exception as e:
    print(f"     FAIL  {e}")
    results["export_pdf_endpoint"] = f"FAIL: {e}"

# ── Test 5: LAN reachability check ────────────────────────────────
print(f"\n[5/5] LAN reachability (frontend at http://{LAN_IP}:{FRONTEND_PORT})...")
try:
    req = urllib.request.Request(f"http://{LAN_IP}:{FRONTEND_PORT}/", method="GET")
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"     PASS  Frontend reachable from LAN, HTTP {r.status}")
        results["lan_frontend"] = "PASS"
except Exception as e:
    print(f"     WARN  Frontend not yet reachable: {e}")
    print(f"           → Start with: cd frontend && npm run dev -- --host")
    results["lan_frontend"] = f"WARN (start Vite first): {e}"

# ── Summary ────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  RESULTS SUMMARY")
print("=" * 60)
for k, v in results.items():
    icon = "[PASS]" if v == "PASS" else ("[WARN]" if "WARN" in v else "[FAIL]")
    print(f"  {icon}  {k:<30} {v}")

all_pass = all(v in ("PASS",) or "WARN" in v for v in results.values())
print(f"\n  Overall: {'READY FOR DEMO ✅' if all_pass else 'NEEDS ATTENTION ❌'}")
print("=" * 60)
