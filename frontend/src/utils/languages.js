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
