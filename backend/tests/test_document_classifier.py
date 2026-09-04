"""
Unit Tests for Sovereign Document Classifier (Step 1 of ML Structuring Upgrade)
Validates multi-category detection, rejection gatekeeper, and structuring integration.
"""
import pytest
from app.services.document_classifier import document_classifier, DocumentCategory
from app.services.ml_structuring_engine import ml_structuring_engine


def test_classify_satbara_712():
    text = (
        "महाराष्ट्र शासन - महसूल व वन विभाग\n"
        "गाव नमुना सात (७/१२) - अधिकार अभिलेख पत्रक\n"
        "गाव: वाघोली, तालुका: हवेली, जिल्हा: पुणे\n"
        "भूमापन क्रमांक / गट क्रमांक: 142/3A\n"
        "खाते क्रमांक: 582\n"
        "भोगवटादाराचे नाव: रमेश विठ्ठल पाटील\n"
        "एकूण क्षेत्र: 1.45 हेक्टर\n"
        "धारणा प्रकार: भोगवटादार वर्ग - १\n"
        "पोटखराब: 0.10 हेक्टर, जिरायत: 1.35 हेक्टर"
    )
    result = document_classifier.classify(text, filename="satbara_extract_pune.pdf")
    assert result.category == DocumentCategory.VILLAGE_FORM_7_12
    assert result.is_land_record is True
    assert result.confidence >= 0.75
    assert len(result.matched_anchors) > 0


def test_classify_form_8a_khata():
    text = (
        "महाराष्ट्र शासन महसूल विभाग\n"
        "गाव नमुना ८-अ - खातेवही उतारा (Khate Pustika)\n"
        "गाव: आंबेगाव, तालुका: हवेली, जिल्हा: पुणे\n"
        "खाते क्रमांक: 104\n"
        "खातेदाराचे नाव: गणपत पांडुरंग देशमुख\n"
        "धारणा जमीन सर्व्हे नं: 45/1, 48/2, 52/3\n"
        "एकूण आकारणी: रु. 48.75"
    )
    result = document_classifier.classify(text, filename="khata_extract_8a.pdf")
    assert result.category == DocumentCategory.VILLAGE_FORM_8_A
    assert result.is_land_record is True
    assert result.confidence >= 0.70


def test_classify_form_6_ferfar():
    text = (
        "गाव नमुना ६ - फेरफार नोंदवही (Register of Mutations)\n"
        "गाव: शिक्रापूर, तालुका: शिरूर, जिल्हा: पुणे\n"
        "फेरफार क्रमांक: 4892\n"
        "नोंदणीकृत खरेदीखतानुसार हक्काची नोंद\n"
        "मंडळ अधिकारी प्रमाणित व मंजूर आदेशानुसार"
    )
    result = document_classifier.classify(text, filename="ferfar_mutation_4892.pdf")
    assert result.category == DocumentCategory.VILLAGE_FORM_6_FERFAR
    assert result.is_land_record is True
    assert result.confidence >= 0.70


def test_classify_urban_property_card():
    text = (
        "नगर भूमापन विभाग - महाराष्ट्र शासन\n"
        "मालमत्ता पत्रक (Urban Property Card / Akhiv Patrika)\n"
        "नगर भूमापन अधिकारी, पुणे शहर\n"
        "सिटी सर्व्हे क्रमांक (CTS No): 1845/A\n"
        "PRN Number: PRN-2024-MH-98124\n"
        "क्षेत्र: 350.50 चौरस मीटर"
    )
    result = document_classifier.classify(text, filename="property_card_cts_1845.pdf")
    assert result.category == DocumentCategory.URBAN_PROPERTY_CARD
    assert result.is_land_record is True
    assert result.confidence >= 0.70


def test_classify_sale_deed():
    text = (
        "दस्तऐवज क्रमांक: 2841/2023\n"
        "नोंदणीकृत खरेदीखत (Registered Sale Deed / Conveyance)\n"
        "सहदुय्यम निबंधक वर्ग-२ हवेली पुणे\n"
        "खरेदी देणारा: प्रकाश नारायण जोशी\n"
        "खरेदी घेणारा: सचिन बाबुराव पवार\n"
        "बाजारमूल्य: रु. 45,00,000/- मुद्रांक शुल्क: रु. 2,70,000/-\n"
        "चतुःसीमा: पूर्वेस रस्ता, पश्चिमेस गट नं. 143"
    )
    result = document_classifier.classify(text, filename="sale_deed_haveli.pdf")
    assert result.category == DocumentCategory.REGISTERED_SALE_DEED
    assert result.is_land_record is True
    assert result.confidence >= 0.70


def test_classify_search_report():
    text = (
        "३० वर्षांचा शोध अहवाल (30-Year Title Search & Encumbrance Report)\n"
        "Advocate & Legal Advisor High Court, Mumbai\n"
        "शीर्षक प्रमाणपत्र (Title Clearance Certificate)\n"
        "बोजा प्रमाणपत्र व महसूल अभिलेख तपासणी\n"
        "सदर मिळकतीचे शीर्षक निर्दोष व मार्केटेबल आहे."
    )
    result = document_classifier.classify(text, filename="search_report_wagholi.pdf")
    assert result.category == DocumentCategory.SEARCH_REPORT
    assert result.is_land_record is True
    assert result.confidence >= 0.70


def test_reject_gst_invoice():
    text = (
        "TAX INVOICE / RETAIL CASH MEMO\n"
        "GSTIN: 27AAAAA0000A1Z5\n"
        "Invoice No: INV-2024-889\n"
        "Goods and Services Tax SGST: 9%, CGST: 9%\n"
        "Subtotal: Rs. 14,500.00\n"
        "Grand Total: Rs. 17,110.00"
    )
    result = document_classifier.classify(text, filename="invoice_hardware.pdf")
    assert result.category == DocumentCategory.NON_LAND_DOCUMENT
    assert result.is_land_record is False
    assert result.rejection_reason is not None


def test_reject_salary_slip():
    text = (
        "Tech Solutions Pvt Ltd\n"
        "Monthly Employee Salary Slip - August 2024\n"
        "Employee Name: Rahul Sharma, Emp ID: EMP-1049\n"
        "Basic Pay: 50,000, HRA: 20,000, PF Deduction: 1,800\n"
        "Net Salary Transferred: Rs. 68,200"
    )
    result = document_classifier.classify(text, filename="salary_slip_august.pdf")
    assert result.category == DocumentCategory.NON_LAND_DOCUMENT
    assert result.is_land_record is False


def test_ml_structuring_engine_integration():
    sample_satbara = (
        "गाव नमुना सात (७/१२)\n"
        "गाव: वाघोली, तालुका: हवेली, जिल्हा: पुणे\n"
        "गट क्रमांक: 142/3A\n"
        "खाते क्रमांक: 582\n"
        "भोगवटादाराचे नाव: रमेश विठ्ठल पाटील\n"
        "क्षेत्र: 1.45 हेक्टर\n"
        "धारणा प्रकार: भोगवटादार वर्ग - १"
    )
    fields, conf = ml_structuring_engine.extract_fields(sample_satbara)
    assert fields.khasraNumber == "142/3A"
    assert fields.khataNumber == "582"
    assert fields.village == "वाघोली"
    assert fields.documentCategory == DocumentCategory.VILLAGE_FORM_7_12.value
