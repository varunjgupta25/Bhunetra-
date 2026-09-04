"""
Unit Tests for Multi-Document Land Structuring Engine
Validates dedicated extraction routines for:
1. Form 7/12 (Satbara Extract)
2. Form 8-A (Khate Pustika / Holding Sheet)
3. Form 6 (Ferfar Mutation Register)
4. Urban Property Card (CTS / PRN)
5. Registered Sale Deed (खरेदीखत / Conveyance)
"""

import pytest
from app.services.ml_structuring_engine import structuring_engine
from app.services.document_classifier import DocumentCategory
from app.services.validation_rules import validator


def test_extract_form_7_12():
    raw_ocr = """
    महाराष्ट्र शासन - महसूल व वन विभाग
    गाव नमुना सात (अधिकार अभिलेख पत्रक) आणि गाव नमुना १२ (पिकांची पाहणी)
    गाव: वाघोली   तालुका: हवेली   जिल्हा: पुणे
    गट क्रमांक: 142/3A
    खाते क्रमांक: 58
    भोगवटादाराचे नाव: श्री. रमेश किसनराव पाटील
    धारणा प्रकार: भोगवटादार वर्ग - १
    एकूण क्षेत्र: 2.45 हेक्टर
    आकारणी: रु. 14.50
    """
    extracted, scores = structuring_engine.extract_fields(raw_ocr)

    assert extracted.documentCategory == DocumentCategory.VILLAGE_FORM_7_12.value
    assert extracted.khasraNumber == "142/3A"
    assert extracted.khataNumber == "58"
    assert "रमेश किसनराव पाटील" in extracted.ownerName
    assert "वाघोली" in extracted.village
    assert "हवेली" in extracted.tehsil
    assert "पुणे" in extracted.district
    assert "2.45" in extracted.landArea
    assert "वर्ग - १" in extracted.ownershipType
    assert scores["khasraNumber"] > 0.75
    assert scores["ownerName"] > 0.75

    val_res = validator.validate_record(extracted, scores)
    assert val_res.is_valid is True


def test_extract_form_8a_khata():
    raw_ocr = """
    महाराष्ट्र शासन महसूल विभाग
    गाव नमुना आठ-अ (खातेदारांची नोंदवही - खाते पुस्तक)
    गाव: खडकवासला   तालुका: हवेली   जिल्हा: पुणे
    खाते क्रमांक: 204
    खातेदाराचे नाव: पांडुरंग बाळकृष्ण कदम
    गट क्रमांक: 12, 14/2, 18
    एकूण क्षेत्र: 4.80 हेक्टर
    एकूण आकारणी: रु. 48.50
    धारणाधिकार: भोगवटादार वर्ग - १
    """
    extracted, scores = structuring_engine.extract_fields(raw_ocr)

    assert extracted.documentCategory == DocumentCategory.FORM_8A.value
    assert extracted.khataNumber == "204"
    assert "पांडुरंग बाळकृष्ण कदम" in extracted.ownerName
    assert "खडकवासला" in extracted.village
    assert "हवेली" in extracted.tehsil
    assert "पुणे" in extracted.district
    assert "4.80" in extracted.landArea
    assert extracted.extraDetails["khataTotalAssessment"] == "48.50"
    assert "12" in extracted.extraDetails["subParcels"]
    assert "14/2" in extracted.extraDetails["subParcels"]
    assert "18" in extracted.extraDetails["subParcels"]

    val_res = validator.validate_record(extracted, scores)
    assert val_res.is_valid is True


def test_extract_form_6_ferfar_mutation():
    raw_ocr = """
    महाराष्ट्र शासन
    गाव नमुना सहा - फेरफार नोंदवही
    गाव: बावधन   तालुका: मुळशी   जिल्हा: पुणे
    फेरफार नोंद क्र: 3451
    नोंद दिनांक: 14/03/2021
    व्यवहाराचे स्वरूप: खरेदीखत फेरफार
    माजी खातेदार: तुकाराम विठोबा जगताप
    नवीन खातेदार: सचिन सुरेश देशमुख
    बाधित गट क्रमांक: 108/2
    हस्तांतरित क्षेत्र: 0.85 हेक्टर
    स्थिती: मंजूर / प्रमाणित
    """
    extracted, scores = structuring_engine.extract_fields(raw_ocr)

    assert extracted.documentCategory == DocumentCategory.FORM_6_MUTATION.value
    assert extracted.khasraNumber == "108/2"
    assert extracted.khataNumber == "3451"  # Mutation entry serves as reference
    assert "सचिन सुरेश देशमुख" in extracted.ownerName
    assert "तुकाराम विठोबा जगताप" in extracted.extraDetails["previousOwners"]
    assert extracted.extraDetails["mutationNumber"] == "3451"
    assert extracted.extraDetails["mutationDate"] == "14/03/2021"
    assert "खरेदीखत" in extracted.extraDetails["mutationType"]
    assert "प्रमाणित" in extracted.extraDetails["mutationStatus"]
    assert "बावधन" in extracted.village
    assert "मुळशी" in extracted.tehsil
    assert "0.85" in extracted.landArea

    val_res = validator.validate_record(extracted, scores)
    assert val_res.is_valid is True


def test_extract_urban_property_card():
    raw_ocr = """
    भूमि अभिलेख विभाग महाराष्ट्र शासन
    नगर भूमापन मालमत्ता पत्रक (Urban Property Card)
    नगर भूमापन कार्यालय: कसबा पेठ, पुणे
    वॉर्ड / पेठ: कसबा पेठ
    नगर भूमापन क्रमांक (CTS No): 1420
    पी.आर.एन. क्र: 2718293041526374
    मिळकतदाराचे नाव: राजेश मनोहर जोशी
    क्षेत्रफळ: 245.50 चौ.मी.
    धारणाधिकार: फ्रीहोल्ड मिळकत
    तालुका: पुणे शहर   जिल्हा: पुणे
    """
    extracted, scores = structuring_engine.extract_fields(raw_ocr)

    assert extracted.documentCategory == DocumentCategory.URBAN_PROPERTY_CARD.value
    assert extracted.khasraNumber == "1420"
    assert extracted.khataNumber == "2718293041526374"
    assert "राजेश मनोहर जोशी" in extracted.ownerName
    assert "245.50" in extracted.landArea
    assert "चौ.मी." in extracted.landArea
    assert "फ्रीहोल्ड" in extracted.ownershipType
    assert extracted.extraDetails["ctsNumber"] == "1420"
    assert extracted.extraDetails["prnNumber"] == "2718293041526374"
    assert "कसबा पेठ" in extracted.extraDetails["ward"]

    val_res = validator.validate_record(extracted, scores)
    assert val_res.is_valid is True


def test_extract_registered_sale_deed():
    raw_ocr = """
    नोंदणी व मुद्रांक विभाग महाराष्ट्र शासन
    दस्त नोंदणी क्रमांक: HAV-5/4521/2022
    दस्त नोंदणी दिनांक: 18/06/2022
    खरेदीखत (Sale Deed)
    विक्रेता (लिहून देणारा): श्री. विठ्ठल सखाराम नाईक
    खरेदीदार (लिहून घेणारा): सौ. अनिता प्रकाश गायकवाड
    गट क्रमांक: 215/4
    क्षेत्रफळ: 1200 चौ.फूट
    मोबदला रक्कम: ₹ 35,00,000
    बाजारमूल्य: ₹ 38,50,000
    मुद्रांक शुल्क: ₹ 2,69,500
    गाव: मांजरी   तालुका: हवेली   जिल्हा: पुणे
    चतुःसीमा:
    पूर्व: रस्ता
    पश्चिम: गट क्र. 215/3
    दक्षिण: ओढा
    उत्तर: गट क्र. 215/5
    """
    extracted, scores = structuring_engine.extract_fields(raw_ocr)

    assert extracted.documentCategory == DocumentCategory.SALE_DEED.value
    assert extracted.khasraNumber == "215/4"
    assert extracted.khataNumber == "HAV-5/4521/2022"
    assert "अनिता प्रकाश गायकवाड" in extracted.ownerName
    assert "1200" in extracted.landArea
    assert "मांजरी" in extracted.village
    assert "हवेली" in extracted.tehsil
    assert "पुणे" in extracted.district
    assert extracted.extraDetails["sellerName"] == "श्री. विठ्ठल सखाराम नाईक"
    assert extracted.extraDetails["buyerName"] == "सौ. अनिता प्रकाश गायकवाड"
    assert "35,00,000" in extracted.extraDetails["considerationAmount"]
    assert "38,50,000" in extracted.extraDetails["marketValue"]
    assert "2,69,500" in extracted.extraDetails["stampDuty"]
    assert extracted.extraDetails["boundaries"]["east"] == "रस्ता"
    assert extracted.extraDetails["boundaries"]["south"] == "ओढा"

    val_res = validator.validate_record(extracted, scores)
    assert val_res.is_valid is True
