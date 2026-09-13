import io
import os
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

# Register Devanagari font for Hindi/Marathi text support
FONT_PATH = os.path.join(os.path.dirname(__file__), 'fonts', 'NotoSansDevanagari-Regular.ttf')
try:
    pdfmetrics.registerFont(TTFont('NotoSansDevanagari', FONT_PATH))
    FONT_NAME = 'NotoSansDevanagari'
except Exception as e:
    print(f"Failed to load Devanagari font from {FONT_PATH}: {e}")
    FONT_NAME = 'Helvetica'

def generate_record_pdf(record_id: str, record_data: dict, verification_url: str) -> bytes:
    """
    Generate a PDF certificate for a land record, including a QR code for verification.
    Uses ReportLab to properly embed fonts and render Devanagari text.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Header
    c.setFont(FONT_NAME, 24)
    c.drawCentredString(width / 2.0, height - 1 * inch, "Land Record Certificate")
    c.drawCentredString(width / 2.0, height - 1.4 * inch, "भूमि रिकॉर्ड प्रमाणपत्र")

    # Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = io.BytesIO()
    img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    # Draw QR code in the top right
    qr_size = 1.5 * inch
    c.drawImage(ImageReader(qr_buffer), width - qr_size - 0.5 * inch, height - qr_size - 0.5 * inch, width=qr_size, height=qr_size)

    # Record Information
    c.setFont(FONT_NAME, 12)
    y_position = height - 2.5 * inch
    line_height = 0.3 * inch

    def draw_field(label, value):
        nonlocal y_position
        if value:
            c.drawString(1 * inch, y_position, f"{label}: {value}")
            y_position -= line_height

    draw_field("Record ID / रिकॉर्ड आईडी", record_id)
    draw_field("Owner Name / मालिक का नाम", record_data.get("owner_name", "N/A"))
    draw_field("Property ID / संपत्ति आईडी", record_data.get("property_id", "N/A"))
    
    area = record_data.get("area", "N/A")
    area_unit = record_data.get("area_unit", "sq meters")
    draw_field("Area / क्षेत्रफल", f"{area} {area_unit}")
    
    draw_field("Village / गाँव", record_data.get("village", record_data.get("location", "N/A")))
    draw_field("District / ज़िला", record_data.get("district", "N/A"))
    draw_field("State / राज्य", record_data.get("state", "N/A"))
    
    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2.0, 1 * inch, f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawCentredString(width / 2.0, 0.7 * inch, "Scan the QR code to verify the authenticity of this document.")

    c.showPage()
    c.save()
    
    return buffer.getvalue()
