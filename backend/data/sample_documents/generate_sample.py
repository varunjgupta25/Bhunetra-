"""
Sample Land Record Document Generator for Testing OCR & Pipeline
Creates synthetic degraded/damaged land record test images.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter


def generate_sample_degraded_record(output_path: str = "data/sample_documents/sample_degraded_record.jpg"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create parchment / paper background
    width, height = 1200, 1600
    img = Image.new("RGB", (width, height), color=(247, 243, 233))
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(40, 40), (width - 40, 160)], outline=(80, 80, 80), width=3)
    draw.text((380, 60), "GOVERNMENT OF MAHARASHTRA", fill=(20, 20, 20))
    draw.text((430, 90), "REVENUE DEPARTMENT", fill=(40, 40, 40))
    draw.text((350, 120), "VILLAGE FORM VII-XII (7/12 EXTRACT)", fill=(10, 10, 10))

    # Details table
    rows = [
        ("District (जिल्हा)", "PUNE (पुणे)"),
        ("Tehsil / Taluka (तालुका)", "HAVELI (हवेली)"),
        ("Village / Mauza (गाव)", "WAGHOLI (वाघोली)"),
        ("Khasra / Survey No. (गट क्र.)", "142/3A"),
        ("Khata / Account No. (खाते क्र.)", "582"),
        ("Land Area / Total Extent (एकूण क्षेत्र)", "1.45 Hectare (१.४५ हेक्टर)"),
        ("Assessment / Tax (आकारणी)", "Rs. 12.50"),
        ("Owner / Occupant (भोगवटादाराचे नाव)", "RAMESH VITTHAL PATIL (रमेश विठ्ठल पाटील)"),
        ("Tenure / Ownership Type (धारणा प्रकार)", "Occupant Class - 1 (भोगवटादार वर्ग - १)"),
        ("Other Rights / Encumbrance (इतर हक्क)", "Bank of Maharashtra Crop Loan Rs. 50,000"),
    ]

    y_start = 200
    row_height = 80
    
    for i, (label, val) in enumerate(rows):
        y = y_start + i * row_height
        draw.rectangle([(60, y), (width - 60, y + row_height)], outline=(120, 120, 120), width=1)
        draw.line([(500, y), (500, y + row_height)], fill=(120, 120, 120), width=1)
        draw.text((80, y + 25), label, fill=(50, 50, 50))
        draw.text((530, y + 25), val, fill=(10, 10, 10))

    # Add simulated stamp & signature
    draw.ellipse([(800, 1150), (1050, 1350)], outline=(180, 40, 40), width=3)
    draw.text((840, 1230), "TALATHI OFFICE", fill=(180, 40, 40))
    draw.text((860, 1260), "WAGHOLI (PUNE)", fill=(180, 40, 40))

    # Add realistic degradation: slight noise and blur to simulate aged paper & scanning
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))

    img.save(output_path, "JPEG", quality=85)
    print(f"Generated sample degraded land record image at: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_sample_degraded_record()
