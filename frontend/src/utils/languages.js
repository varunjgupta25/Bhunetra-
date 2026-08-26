/*
Official 22 Languages of India (8th Schedule of the Constitution) + English
*/

export const CONSTITUTION_22_LANGUAGES = [
  { code: 'mr', nameEn: 'Marathi', nameNative: 'मराठी', icon: '🚩', script: 'Devanagari' },
  { code: 'hi', nameEn: 'Hindi', nameNative: 'हिन्दी', icon: '🇮🇳', script: 'Devanagari' },
  { code: 'en', nameEn: 'English', nameNative: 'English', icon: '🇬🇧', script: 'Latin' },
  { code: 'bn', nameEn: 'Bengali', nameNative: 'বাংলা', icon: '🇧🇩', script: 'Bengali' },
  { code: 'gu', nameEn: 'Gujarati', nameNative: 'ગુજરાતી', icon: '🏛️', script: 'Gujarati' },
  { code: 'ta', nameEn: 'Tamil', nameNative: 'தமிழ்', icon: '🏛️', script: 'Tamil' },
  { code: 'te', nameEn: 'Telugu', nameNative: 'తెలుగు', icon: '🏛️', script: 'Telugu' },
  { code: 'kn', nameEn: 'Kannada', nameNative: 'ಕನ್ನಡ', icon: '🏛️', script: 'Kannada' },
  { code: 'ml', nameEn: 'Malayalam', nameNative: 'മലയാളം', icon: '🏛️', script: 'Malayalam' },
  { code: 'pa', nameEn: 'Punjabi', nameNative: 'ਪੰਜਾਬੀ', icon: '🏛️', script: 'Gurmukhi' },
  { code: 'or', nameEn: 'Odia', nameNative: 'ଓଡ଼ିଆ', icon: '🏛️', script: 'Odia' },
  { code: 'as', nameEn: 'Assamese', nameNative: 'অসমীয়া', icon: '🏛️', script: 'Bengali-Assamese' },
  { code: 'ur', nameEn: 'Urdu', nameNative: 'اردو', icon: '🏛️', script: 'Perso-Arabic' },
  { code: 'sa', nameEn: 'Sanskrit', nameNative: 'संस्कृतम्', icon: '🕉️', script: 'Devanagari' },
  { code: 'ks', nameEn: 'Kashmiri', nameNative: 'कॉशुर', icon: '🏔️', script: 'Perso-Arabic/Devanagari' },
  { code: 'sd', nameEn: 'Sindhi', nameNative: 'सिन्धी', icon: '🏛️', script: 'Perso-Arabic/Devanagari' },
  { code: 'ne', nameEn: 'Nepali', nameNative: 'नेपाली', icon: '🏔️', script: 'Devanagari' },
  { code: 'kok', nameEn: 'Konkani', nameNative: 'कोंकणी', icon: '🏖️', script: 'Devanagari' },
  { code: 'doi', nameEn: 'Dogri', nameNative: 'डोगरी', icon: '🏛️', script: 'Devanagari' },
  { code: 'mni', nameEn: 'Manipuri (Meitei)', nameNative: 'मइतैलोन', icon: '🏛️', script: 'Meitei/Bengali' },
  { code: 'sat', nameEn: 'Santali', nameNative: 'संताली', icon: '🏛️', script: 'Ol Chiki' },
  { code: 'brx', nameEn: 'Bodo', nameNative: 'बर\'', icon: '🏛️', script: 'Devanagari' },
  { code: 'mai', nameEn: 'Maithili', nameNative: 'मैथिली', icon: '🏛️', script: 'Devanagari' },
]

export function getLanguageByCode(code) {
  return CONSTITUTION_22_LANGUAGES.find((l) => l.code === code) || CONSTITUTION_22_LANGUAGES[0]
}

export const UI_TRANSLATIONS = {
  mr: {
    welcome: "पुन्हा स्वागत आहे",
    subtitle: "कृत्रिम बुद्धिमत्ता आधारित भूमी अभिलेख संगणकीकरण प्रणाली",
    totalDigitized: "एकूण डिजिटाईज्ड अभिलेख",
    avgConfidence: "सरासरी अचूकता दर",
    autoApproved: "स्वायत्त स्वीकृत अभिलेख",
    pendingQueue: "महसूल पडताळणी प्रलंबित",
    districtModernization: "जिल्हास्तरीय संगणकीकरण प्रगती",
    today: "आज जोडले",
    highConfidence: "उच्च अचूकता दर",
    awaitingVerifier: "तलाठी/तहसीलदार पडताळणी प्रलंबित",
    ingestBtn: "नवीन ७/१२ अपलोड करा",
    recordsProcessing: "अभिलेख प्रक्रियेत",
    complete: "पूर्ण",
    dashboardTab: "मुख्य पृष्ठ",
    uploadTab: "७/१२ अपलोड",
    queueTab: "महसूल पडताळणी",
    gisTab: "नकाशा / GIS",
  },
  hi: {
    welcome: "पुनः स्वागत है",
    subtitle: "कृत्रिम बुद्धिमत्ता आधारित भूमि अभिलेख डिजिटलीकरण एवं निगरानी पोर्टल",
    totalDigitized: "कुल डिजिटाइज़्ड अभिलेख",
    avgConfidence: "औसत सटीकता दर",
    autoApproved: "स्वायत्त स्वीकृत रिकॉर्ड्स",
    pendingQueue: "समीक्षा हेतु लंबित",
    districtModernization: "जिला स्तरीय आधुनिकीकरण प्रगति",
    today: "आज जोड़े गए",
    highConfidence: "उच्च सटीकता",
    awaitingVerifier: "राजस्व अधिकारी सत्यापन हेतु लंबित",
    ingestBtn: "नया ७/१२ अपलोड करें",
    recordsProcessing: "रिकॉर्ड्स प्रसंस्करण में",
    complete: "पूर्ण",
    dashboardTab: "मुख्य पृष्ठ",
    uploadTab: "७/१२ अपलोड",
    queueTab: "राजस्व सत्यापन",
    gisTab: "मानचित्र / GIS",
  },
  en: {
    welcome: "Welcome back",
    subtitle: "AI-assisted land record digitization and monitoring portal",
    totalDigitized: "TOTAL RECORDS DIGITIZED",
    avgConfidence: "AVERAGE CONFIDENCE",
    autoApproved: "AUTO-APPROVED RECORDS",
    pendingQueue: "VERIFICATION BACKLOG",
    districtModernization: "District-Level Modernization Progress",
    today: "today",
    highConfidence: "HIGH CONFIDENCE",
    awaitingVerifier: "Awaiting Human Verifier",
    ingestBtn: "Ingest New Document",
    recordsProcessing: "Records Processing",
    complete: "Complete",
    dashboardTab: "Dashboard",
    uploadTab: "Upload",
    queueTab: "Queue",
    gisTab: "GIS",
  }
}

export function t(key, langCode = 'mr') {
  const langDict = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS['mr'] || UI_TRANSLATIONS['en']
  return langDict[key] || UI_TRANSLATIONS['en'][key] || key
}
