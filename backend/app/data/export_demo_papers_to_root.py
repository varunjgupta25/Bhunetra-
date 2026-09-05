import os
import shutil
import glob
import sys

# Append directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_all_10_land_doc_types import DOC_TYPES_DATA

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEMO_PAPERS_DIR = os.path.join(ROOT_DIR, "demo_papers")
FRONTEND_PAPERS_DIR = os.path.join(ROOT_DIR, "frontend", "public", "demo_papers")

def clean_and_populate():
    os.makedirs(DEMO_PAPERS_DIR, exist_ok=True)
    
    # 1. Remove all old files in demo_papers
    old_files = glob.glob(os.path.join(DEMO_PAPERS_DIR, "*"))
    for f in old_files:
        try:
            if os.path.isfile(f):
                os.remove(f)
            elif os.path.isdir(f):
                shutil.rmtree(f)
            print(f"Deleted old file: {os.path.basename(f)}")
        except Exception as e:
            print(f"Error removing {f}: {e}")

    index_links = []
    
    # 2. Iterate through each category and each paper
    for idx, cat in enumerate(DOC_TYPES_DATA, 1):
        cat_prefix = f"{idx:02d}_{cat['id']}"
        cat_title = f"{cat['nameMr']} ({cat['nameEn']})"
        cat_links = []
        
        for p_idx, paper in enumerate(cat["papers"], 1):
            is_forged = paper["isForged"]
            village_clean = paper.get("village", "").split("(")[-1].replace(")", "").strip().replace(" ", "_")
            
            if is_forged:
                file_stem = f"{cat_prefix}_{p_idx}_TAMPERED_{village_clean}"
            else:
                file_stem = f"{cat_prefix}_{p_idx}_Authorized_{village_clean}"
                
            # Copy SVG
            svg_src = os.path.join(FRONTEND_PAPERS_DIR, f"{paper['key']}.svg")
            svg_dst = os.path.join(DEMO_PAPERS_DIR, f"{file_stem}.svg")
            if os.path.exists(svg_src):
                shutil.copy2(svg_src, svg_dst)
                
            # Write HTML
            html_content = generate_html_cert(cat, paper, p_idx)
            html_dst = os.path.join(DEMO_PAPERS_DIR, f"{file_stem}.html")
            with open(html_dst, "w", encoding="utf-8") as f:
                f.write(html_content)
                
            cat_links.append({
                "stem": file_stem,
                "html": f"{file_stem}.html",
                "svg": f"{file_stem}.svg",
                "title": paper["title"],
                "is_forged": is_forged,
                "confidence": paper["confidence"],
                "authenticScore": paper["authenticScore"],
                "extraDetails": paper.get("extraDetails", {})
            })
            
        index_links.append({
            "cat_num": idx,
            "category": cat_title,
            "badge": cat["badge"],
            "icon": cat["icon"],
            "papers": cat_links
        })

    # Generate Index Page
    generate_master_index(index_links)
    print("[SUCCESS] Successfully purged old demo files and generated all 30 HTML and SVG demo documents in demo_papers/")

def generate_html_cert(cat, paper, p_idx):
    is_forged = paper["isForged"]
    
    if is_forged:
        reason = paper.get("extraDetails", {}).get("fraudSummary") or paper.get("extraDetails", {}).get("tamperingReason") or paper.get("extraDetails", {}).get("forgeryReason") or "Manipulated pixel layers & forged authority stamp detected by ML."
        status_banner = f"""
        <div style="background:#fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 14px; margin-bottom: 20px; color: #991b1b;">
            <div style="font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
                <span>🚨 भूनेत्र फॉरेन्सिक इशारा / BHUNETRA FRAUD ALERT: TAMPERED DOCUMENT DETECTED</span>
                <span style="background:#dc2626; color:#fff; padding: 2px 8px; border-radius: 4px; font-size: 11px;">ML CONFIDENCE: {int(paper['confidence'] * 100)}% (FAILED)</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-weight: 600;">
                <strong>ML Analysis:</strong> {reason}
            </p>
            <div style="margin-top: 8px; font-size: 12px; display: flex; flex-wrap: wrap; gap: 15px;">
                <span>• ELA Status: <strong>{paper.get('elaStatus', 'Noise Anomaly')}</strong></span>
                <span>• Mahabhulekh Ledger: <strong>{paper.get('mutationLedger', 'Mismatch')}</strong></span>
                <span>• Collision Check: <strong>{paper.get('collisionCount', '3 Collisions')}</strong></span>
            </div>
        </div>
        """
    else:
        status_banner = f"""
        <div style="background:#f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 12px; margin-bottom: 20px; color: #166534;">
            <div style="font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: space-between;">
                <span>✓ प्रमाणित अधिकृत दस्तऐवज (OFFICIALLY AUTHORIZED RECORD)</span>
                <span style="background:#16a34a; color:#fff; padding: 2px 8px; border-radius: 4px; font-size: 11px;">ML CONFIDENCE: {int(paper['confidence'] * 100)}% (AUTHENTIC)</span>
            </div>
            <div style="margin-top: 6px; font-size: 12px; display: flex; flex-wrap: wrap; gap: 15px;">
                <span>• ELA Check: <strong>{paper.get('elaStatus', 'Uniform Compression')}</strong></span>
                <span>• Digital Ledger: <strong>{paper.get('mutationLedger', 'Verified Matched')}</strong></span>
                <span>• Collision Check: <strong>{paper.get('collisionCount', '0 Collisions')}</strong></span>
            </div>
        </div>
        """

    # Extract field rows
    field_keys = [
        ("village", "गाव / Village"),
        ("tehsil", "तालुका / Tehsil"),
        ("district", "जिल्हा / District"),
        ("khasraNumber", "गट / सर्व्हे क्रमांक (Survey / Khasra No.)"),
        ("khataNumber", "खाते क्रमांक (Khata No.)"),
        ("ownerName", "खातेदार / मालकाचे नाव (Owner Name)"),
        ("area", "एकूण क्षेत्र (Total Land Area)"),
        ("assessment", "आकारणी कर (Assessment / Revenue)"),
        ("ownershipType", "भोगवटादार वर्ग / धारणाधिकार (Tenure Class)"),
        ("ctsNumber", "नगर भूमापन क्र. (CTS No.)"),
        ("sheetNumber", "शीट क्रमांक (Sheet No.)"),
        ("mutationNumber", "फेरफार क्रमांक (Mutation No.)"),
        ("transactionType", "व्यवहार प्रकार (Transaction Nature)"),
        ("registrationNumber", "नोंदणी क्रमांक (Registration No.)"),
        ("sroOffice", "दुय्यम निबंधक कार्यालय (SRO Office)"),
        ("marketValue", "बाजारमूल्य / मोबदला (Market Value)"),
        ("stampDuty", "मुद्रांक शुल्क (Stamp Duty Paid)"),
        ("searchPeriod", "शोध कालावधी (Search Period)"),
        ("encumbranceStatus", "बोजा व भार स्थिती (Encumbrance Status)"),
        ("gatNumber", "गट क्रमांक (Gat Parcel No.)"),
        ("scale", "नकाशा प्रमाण (Map Scale)"),
        ("naOrderNo", "अकृषिक आदेश क्र. व सनद (NA Order No.)"),
        ("sanctionDate", "मंजुरी दिनांक (Sanction Date)"),
        ("donorName", "देणगीदार / हक्कसोडकर्ता (Donor Name)"),
        ("doneeName", "स्वीकारकर्ता / लाभार्थी (Donee Name)"),
        ("heirNames", "कायदेशीर वारसदार व हिस्से (Legal Heirs)"),
        ("partitionBasis", "वाटपपत्र आधार (Partition Basis)"),
    ]

    rows_html = ""
    for k, label in field_keys:
        val = paper.get(k)
        if val:
            tampered_style = "color:#dc2626; font-weight:bold; background:#fee2e2;" if is_forged and (k in ["khasraNumber", "area", "mutationNumber", "ctsNumber", "stampDuty", "heirNames", "encumbranceStatus", "naOrderNo", "ownerName"]) else ""
            rows_html += f"""
            <tr>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: 600; width: 35%;">{label}</td>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; {tampered_style}">{val}</td>
            </tr>
            """

    # Extra details
    if "extraDetails" in paper:
        for k, v in paper["extraDetails"].items():
            if v and isinstance(v, str):
                rows_html += f"""
                <tr>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: 600; width: 35%;">{k}</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">{v}</td>
                </tr>
                """

    stamp_color = "#dc2626" if is_forged else "#1e3a8a"
    stamp_text = "तलाठी / महसूल अधिकारी डिजिटल स्वाक्षरी" if not is_forged else "❌ बनावट / विसंगत शासकीय शिक्का"

    html_content = f"""<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <title>{cat['nameMr']} - {paper.get('village', 'Maharashtra')} ({paper['id']})</title>
    <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ box-sizing: border-box; }}
        body {{
            font-family: 'Mukta', 'Inter', sans-serif;
            background: #e2e8f0;
            margin: 0;
            padding: 30px 15px;
            color: #0f172a;
        }}
        .page-container {{
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px solid #0f172a;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            padding: 35px;
            position: relative;
        }}
        .govt-header {{
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }}
        .emblem {{
            font-size: 32px;
            margin-bottom: 4px;
        }}
        .state-title {{
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }}
        .doc-title {{
            font-size: 22px;
            font-weight: 800;
            color: #0369a1;
            margin: 6px 0;
        }}
        .sub-dept {{
            font-size: 13px;
            color: #475569;
            font-weight: 600;
        }}
        .loc-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 14px;
        }}
        .loc-grid div {{
            display: flex;
            flex-direction: column;
        }}
        .loc-label {{
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
        }}
        .loc-val {{
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }}
        table.data-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 14px;
        }}
        .footer-section {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #cbd5e1;
        }}
        .seal-box {{
            border: 2px dashed {stamp_color};
            color: {stamp_color};
            padding: 12px 20px;
            border-radius: 50%;
            text-align: center;
            font-size: 12px;
            font-weight: 800;
            width: 150px;
            height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transform: rotate(-3deg);
        }}
        .qr-placeholder {{
            border: 1px solid #94a3b8;
            padding: 8px;
            text-align: center;
            font-size: 10px;
            font-family: monospace;
            background: #f8fafc;
            width: 120px;
        }}
        .qr-box {{
            width: 80px;
            height: 80px;
            background: repeating-conic-gradient(#0f172a 0% 25%, #ffffff 0% 50%) 50% / 10px 10px;
            margin: 0 auto 4px auto;
            border: 1px solid #000;
        }}
        .watermark {{
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 60px;
            font-weight: 900;
            color: rgba(15, 23, 42, 0.04);
            pointer-events: none;
            white-space: nowrap;
            text-transform: uppercase;
        }}
        @media print {{
            body {{ background: #fff; padding: 0; }}
            .page-container {{ box-shadow: none; border: 1px solid #000; }}
        }}
    </style>
</head>
<body>
    <div class="page-container">
        <div class="watermark">MAHARASHTRA GOVT · BHUNETRA</div>
        
        {status_banner}

        <div class="govt-header">
            <div class="emblem">🏛️ सत्यमेव जयते</div>
            <div class="state-title">महाराष्ट्र शासन • महसूल व भूमी अभिलेख विभाग</div>
            <div class="doc-title">{cat['nameMr']}</div>
            <div class="sub-dept">{cat['nameEn']} • Record ID: #{paper['id']}</div>
        </div>

        <div class="loc-grid">
            <div>
                <span class="loc-label">गाव / Village</span>
                <span class="loc-val">{paper.get('village', '-')}</span>
            </div>
            <div>
                <span class="loc-label">तालुका / Tehsil</span>
                <span class="loc-val">{paper.get('tehsil', '-')}</span>
            </div>
            <div>
                <span class="loc-label">जिल्हा / District</span>
                <span class="loc-val">{paper.get('district', '-')}</span>
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                    <th style="padding: 10px 12px; text-align: left;">नोंद तपशील (Attribute Field)</th>
                    <th style="padding: 10px 12px; text-align: left;">नोंदणीकृत माहिती (Extracted Record Value)</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>

        <div class="footer-section">
            <div class="qr-placeholder">
                <div class="qr-box"></div>
                <span>ULPIN / डिजिटल कोड<br><strong>{paper['id']}</strong></span>
            </div>

            <div style="font-size: 11px; color: #475569; text-align: center;">
                <p style="margin: 0 0 4px 0;"><strong>डिजिटल स्वाक्षरीत अधिकृत नक्कल</strong></p>
                <p style="margin: 0;">दिनांक: २०२४ • प्रणाली: भूनेत्र पोर्टल (SIH 2026)</p>
            </div>

            <div class="seal-box">
                <div style="font-size: 18px; margin-bottom: 2px;">★</div>
                <div>{stamp_text}</div>
                <div style="font-size: 9px; margin-top: 4px;">शासकीय शिक्का</div>
            </div>
        </div>
    </div>
</body>
</html>
"""
    return html_content

def generate_master_index(index_links):
    cards_html = ""
    for item in index_links:
        papers_grid = ""
        for p in item["papers"]:
            if p["is_forged"]:
                bg = "#fef2f2"
                border = "#fecaca"
                title_color = "#991b1b"
                icon = "🚨"
                tag = f"<span style='background:#dc2626; color:#fff; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700;'>TAMPERED ({int(p['confidence']*100)}%)</span>"
                desc = f"<div style='font-size:11px; color:#b91c1c; margin-top:4px;'>{p.get('extraDetails',{}).get('fraudSummary') or p.get('extraDetails',{}).get('tamperingReason') or p.get('extraDetails',{}).get('forgeryReason') or 'ML Fraud Anomaly'}</div>"
            else:
                bg = "#f0fdf4"
                border = "#bbf7d0"
                title_color = "#166534"
                icon = "✓"
                tag = f"<span style='background:#16a34a; color:#fff; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700;'>AUTHORIZED ({int(p['confidence']*100)}%)</span>"
                desc = "<div style='font-size:11px; color:#15803d; margin-top:4px;'>Clear Title · Matched Mahabhulekh Ledger</div>"
                
            papers_grid += f"""
            <div style="background:{bg}; border:1px solid {border}; border-radius:8px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                    <div style="font-weight:700; font-size:13px; color:{title_color};">{icon} {p['title']}</div>
                    {tag}
                </div>
                {desc}
                <div style="font-size:12px; margin-top:8px; display:flex; gap:10px;">
                    <a href="{p['html']}" style="color:#0284c7; font-weight:700; text-decoration:none;">📄 Open HTML</a>
                    <span>|</span>
                    <a href="{p['svg']}" style="color:#4f46e5; font-weight:700; text-decoration:none;">🖼️ Open SVG</a>
                </div>
            </div>
            """
            
        cards_html += f"""
        <div style="background:#ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <h3 style="margin:0; font-size: 17px; font-weight:800; color:#0f172a;">
                    <span style="color:#0284c7;">Category {item['cat_num']:02d}:</span> {item['category']}
                </h3>
                <span style="background:#e0f2fe; color:#0369a1; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight:700;">{item['badge']}</span>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
                {papers_grid}
            </div>
        </div>
        """

    index_html = f"""<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <title>BHUNETRA - Complete 30 Land & Property Demo Documents Suite</title>
    <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'Inter', 'Mukta', sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 40px 20px;
            color: #0f172a;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        h1 {{
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 8px 0;
        }}
        p.subtitle {{
            font-size: 15px;
            color: #475569;
            margin: 0;
        }}
        .stats-bar {{
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0 30px 0;
        }}
        .stat-card {{
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ BHUNETRA Land Records & Forensic Demo Suite</h1>
            <p class="subtitle">Complete 30 Land & Property Documents Across All 10 Maharashtra Categories (20 Authorized + 10 Tampered ML Test Samples)</p>
            <div class="stats-bar">
                <div class="stat-card" style="color:#0284c7;">📁 10 Official Document Categories</div>
                <div class="stat-card" style="color:#16a34a;">✓ 20 Authorized Clean Records</div>
                <div class="stat-card" style="color:#dc2626;">🚨 10 Tampered ML Fraud Test Samples</div>
            </div>
        </div>

        <div>
            {cards_html}
        </div>
    </div>
</body>
</html>
"""
    with open(os.path.join(DEMO_PAPERS_DIR, "INDEX_OF_ALL_30_DEMO_PAPERS.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

if __name__ == "__main__":
    clean_and_populate()
