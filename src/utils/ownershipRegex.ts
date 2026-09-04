/**
 * ownershipRegex.ts
 * Comprehensive Regex Pattern Engine for `ownershipType` extraction across multiple document types:
 * - Land Records (7/12 Extract, RoR, Khatauni, Jamabandi, Khasra)
 * - Business Certificates (GST, FSSAI, Business Reg)
 * - Property Deeds (Conveyance Deed, Sale Registry)
 * - MSME / Udyam Certificates
 */

export interface PatternRule {
  key: string;
  label: string;
  regex: RegExp;
  confidence: number;
}

export interface OwnershipExtractionResult {
  success: boolean;
  ownershipType: string | null;
  normalizedCategory: string | null;
  rawMatch: string | null;
  confidence: number;
  matchedPatternGroup: string | null;
  docTypeUsed: string;
}

/**
 * 1. LAND RECORDS PATTERNS (Maharashtra 7/12, MLRC 1966, RoR, Khatauni, Jamabandi)
 * Fully covers Maharashtra statutory occupant classes and All-India revenue tenures.
 * Uses Unicode-aware boundary lookarounds to prevent false positives and ASCII \b failures on Devanagari.
 */
export const LAND_RECORD_PATTERNS: PatternRule[] = [
  // --- Maharashtra 7/12 Specific: Occupant Class 1 (Bhogwatadar Varg-1: Alienable / Freehold Private) ---
  {
    key: 'OCCUPANT_CLASS_1',
    label: 'भोगवटादार वर्ग - १ (Occupant Class-1 / Freehold Private)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|भोगवटा\s*प्रकार|भोगवटादाराचा\s*वर्ग|खातेदार(?:ाचे)?\s*प्रकार|कब्जेदार\s*प्रकार|भूमि\s*स्वामी|हक्काचा\s*प्रकार|ownership\s*type|tenure\s*type|occupant\s*class)\s*[:\-]?\s*(भोगवटादार\s*वर्ग\s*[-–]?\s*[१1]|वर्ग\s*[-–]?\s*[१1]|occupant\s*class\s*[-–]?\s*1|class\s*[-–]?\s*1|भूमि\s*स्वामी|निजी|व्यक्तिगत|खुद|स्वयं|private|individual|sole\s*owner|bhumidhar)/iu,
    confidence: 0.98,
  },
  {
    key: 'OCCUPANT_CLASS_1',
    label: 'भोगवटादार वर्ग - १ (Occupant Class-1 / Freehold Private)',
    regex: /(?<![\p{L}\p{N}])(भोगवटादार\s*वर्ग\s*[-–]?\s*[१1]|भोगवटादार\s*वर्ग\s*१|वर्ग\s*[-–]?\s*[१1]|occupant\s*class\s*[-–]?\s*1|bhumidhar\s*with\s*transferable\s*rights|sole\s*proprietorship\s*land|private\s*ownership)(?![\p{L}\p{N}])/iu,
    confidence: 0.88,
  },

  // --- Maharashtra 7/12 Specific: Occupant Class 2 (Bhogwatadar Varg-2: Inalienable / Restricted Govt Grant) ---
  {
    key: 'OCCUPANT_CLASS_2',
    label: 'भोगवटादार वर्ग - २ (Occupant Class-2 / Restricted Tenure)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|भोगवटा\s*प्रकार|भोगवटादाराचा\s*वर्ग|हक्काचा\s*प्रकार|ownership\s*type|tenure\s*type|occupant\s*class)\s*[:\-]?\s*(भोगवटादार\s*वर्ग\s*[-–]?\s*[२2]|वर्ग\s*[-–]?\s*[२2]|occupant\s*class\s*[-–]?\s*2|class\s*[-–]?\s*2|प्रतिबंधित\s*सत्ताप्रकार|restricted\s*tenure|inalienable)/iu,
    confidence: 0.98,
  },
  {
    key: 'OCCUPANT_CLASS_2',
    label: 'भोगवटादार वर्ग - २ (Occupant Class-2 / Restricted Tenure)',
    regex: /(?<![\p{L}\p{N}])(भोगवटादार\s*वर्ग\s*[-–]?\s*[२2]|भोगवटादार\s*वर्ग\s*२|वर्ग\s*[-–]?\s*[२2]|occupant\s*class\s*[-–]?\s*2|प्रतिबंधित\s*सत्ताप्रकार|restricted\s*tenure)(?![\p{L}\p{N}])/iu,
    confidence: 0.88,
  },

  // --- Government / State / Public Land / Govt Lessee (MLRC Sec 38) ---
  {
    key: 'GOVERNMENT_STATE',
    label: 'शासकीय / सरकारी जमीन (Government Land / Lessee)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|भोगवटा\s*प्रकार|भोगवटादाराचा\s*वर्ग|ownership\s*type|land\s*type)\s*[:\-]?\s*(शासकीय\s*पट्टेदार|सरकारी\s*पट्टेदार|सरकारी\s*जमीन|शासकीय\s*जमीन|राज्य\s*सरकार|ग्राम\s*पंचायत|आबादी|government\s*lessee|state\s*govt|public\s*land|gram\s*sabha)/iu,
    confidence: 0.96,
  },
  {
    key: 'GOVERNMENT_STATE',
    label: 'शासकीय / सरकारी जमीन (Government Land / Lessee)',
    regex: /(?<![\p{L}\p{N}])(शासकीय\s*पट्टेदार|सरकारी\s*पट्टेदार|सरकारी\s*जमीन|शासकीय\s*जमीन|ग्राम\s*पंचायत\s*भूमि|state\s*government\s*land|government\s*lessee|gram\s*sabha\s*property)(?![\p{L}\p{N}])/iu,
    confidence: 0.86,
  },

  // --- Joint / Co-ownership Holding ---
  {
    key: 'JOINT_COOWNERSHIP',
    label: 'संयुक्त / सह-खातेदार (Joint / Co-Shareholding)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|कब्जेदार\s*प्रकार|ownership\s*type|tenure\s*type)\s*[:\-]?\s*(सह-खातेदार|संयुक्त|साझा|सहयोगी|सामाईक|joint|co-owner|co-sharer|multiple\s*owners)/iu,
    confidence: 0.95,
  },
  {
    key: 'JOINT_COOWNERSHIP',
    label: 'संयुक्त / सह-खातेदार (Joint / Co-Shareholding)',
    regex: /(?<![\p{L}\p{N}])(सह-खातेदार|संयुक्त\s*खाता|साझेदारी\s*भूमि|सामाईक\s*जमीन|joint\s*holding|co-shared|joint\s*khatadar)(?![\p{L}\p{N}])/iu,
    confidence: 0.85,
  },

  // --- Protected Tenant / Leasehold / Mortgage ---
  {
    key: 'LEASEHOLD_TENANT',
    label: 'पट्टा / कुळ वहिवाट (Protected Tenant / Leasehold)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|ownership\s*type|tenure)\s*[:\-]?\s*(कुळ|संरक्षित\s*कुळ|पट्टा|लीज|किरायेदार|असामी|बंधक|tenant|protected\s*tenant|leasehold|lessee|mortgaged)/iu,
    confidence: 0.95,
  },
  {
    key: 'LEASEHOLD_TENANT',
    label: 'पट्टा / कुळ वहिवाट (Protected Tenant / Leasehold)',
    regex: /(?<![\p{L}\p{N}])(संरक्षित\s*कुळ|कुळ\s*वहिवाट|पट्टाधारी|लीज\s*पर|किराया\s*अनुबंध|leasehold\s*tenure|government\s*lease)(?![\p{L}\p{N}])/iu,
    confidence: 0.85,
  },

  // --- Trust / Temple / Devasthan Inam Land ---
  {
    key: 'TRUST_INSTITUTIONAL',
    label: 'देवस्थान / इनाम / संस्था (Devasthan / Trust Land)',
    regex: /(?:धारणा\s*प्रकार|धारणाधिकार\s*प्रकार|जमिनीचा\s*प्रकार|ownership\s*type)\s*[:\-]?\s*(देवस्थान\s*इनाम|इनाम\s*जमीन|ट्रस्ट|संस्था|मंदिर|देवस्थान|समीति|devasthan|inam\s*land|trust|society|institutional|temple\s*land)/iu,
    confidence: 0.95,
  },
  {
    key: 'TRUST_INSTITUTIONAL',
    label: 'देवस्थान / इनाम / संस्था (Devasthan / Trust Land)',
    regex: /(?<![\p{L}\p{N}])(देवस्थान\s*इनाम|इनाम\s*जमीन|देवस्थान\s*ट्रस्ट|temple\s*land|trust\s*property)(?![\p{L}\p{N}])/iu,
    confidence: 0.85,
  },
];

/**
 * 2. BUSINESS REGISTRATION PATTERNS (GST, FSSAI, Business License)
 * Matches Constitution of Business and Entity Types.
 */
export const BUSINESS_CERT_PATTERNS: PatternRule[] = [
  {
    key: 'PROPRIETORSHIP',
    label: 'Proprietorship',
    regex: /(?:constitution\s*of\s*business|entity\s*type|business\s*type|ownership\s*type)\s*[:\-]?\s*(proprietorship|sole\s*proprietorship|proprietor|स्वामित्व|व्यष्टि)/i,
    confidence: 0.95,
  },
  {
    key: 'PROPRIETORSHIP',
    label: 'Proprietorship (Inline)',
    regex: /(?<![\p{L}\p{N}])(sole\s*proprietorship|proprietorship\s*firm|एकल\s*स्वामित्व)(?![\p{L}\p{N}])/iu,
    confidence: 0.85,
  },
  {
    key: 'PARTNERSHIP',
    label: 'Partnership Firm',
    regex: /(?:constitution\s*of\s*business|entity\s*type|ownership)\s*[:\-]?\s*(partnership|partnership\s*firm|साझेदारी|साझेदारी\s*फर्म)/iu,
    confidence: 0.95,
  },
  {
    key: 'PRIVATE_LIMITED',
    label: 'Private Limited Company',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(private\s*limited|pvt\s*ltd|pvt\.\s*ltd\.|पी०\s*वी०\s*टी०)/iu,
    confidence: 0.95,
  },
  {
    key: 'PUBLIC_LIMITED',
    label: 'Public Limited Company',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(public\s*limited|public\s*ltd)/iu,
    confidence: 0.95,
  },
  {
    key: 'LLP',
    label: 'Limited Liability Partnership (LLP)',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(limited\s*liability\s*partnership|llp|एलएलपी)/iu,
    confidence: 0.95,
  },
  {
    key: 'HUF',
    label: 'Hindu Undivided Family (HUF)',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(hindu\s*undivided\s*family|huf|हिन्दू\s*अविभक्त\s*कुटुंब)/iu,
    confidence: 0.95,
  },
  {
    key: 'SOCIETY_TRUST',
    label: 'Society / Trust / Co-operative',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(society|trust|cooperative|co-operative|समीति|ट्रस्ट)/iu,
    confidence: 0.95,
  },
];

/**
 * 3. PROPERTY DEED / SALE REGISTRY PATTERNS
 */
export const PROPERTY_DEED_PATTERNS: PatternRule[] = [
  {
    key: 'FREEHOLD',
    label: 'Freehold Title',
    regex: /(?:nature\s*of\s*title|ownership\s*status|deed\s*type)\s*[:\-]?\s*(freehold|free-hold|पूर्ण\s*स्वामित्व)/iu,
    confidence: 0.95,
  },
  {
    key: 'FREEHOLD',
    label: 'Freehold Title (Inline)',
    regex: /(?<![\p{L}\p{N}])(freehold\s*property|freehold\s*land|पूर्ण\s*स्वामित्वाधीन)(?![\p{L}\p{N}])/iu,
    confidence: 0.85,
  },
  {
    key: 'LEASEHOLD',
    label: 'Leasehold Property',
    regex: /(?:nature\s*of\s*title|ownership\s*status)\s*[:\-]?\s*(leasehold|lease-hold|पट्टागत|पट्टा\s*विलेख)/iu,
    confidence: 0.95,
  },
  {
    key: 'POWER_OF_ATTORNEY',
    label: 'Power of Attorney Holder',
    regex: /(?:nature\s*of\s*title|ownership\s*by)\s*[:\-]?\s*(power\s*of\s*attorney|poa|मुख्तारनामा|जीपीए)/iu,
    confidence: 0.95,
  },
];

/**
 * 4. UDYAM / MSME CERTIFICATE PATTERNS
 */
export const UDYAM_MSME_PATTERNS: PatternRule[] = [
  {
    key: 'PROPRIETARY',
    label: 'Proprietary MSME',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(proprietary|proprietorship)/iu,
    confidence: 0.95,
  },
  {
    key: 'PARTNERSHIP',
    label: 'Partnership MSME',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(partnership)/iu,
    confidence: 0.95,
  },
  {
    key: 'SELF_HELP_GROUP',
    label: 'Self Help Group (SHG)',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(self\s*help\s*group|shg|स्वयं\s*सहायता\s*समूह)/iu,
    confidence: 0.95,
  },
  {
    key: 'COOPERATIVE',
    label: 'Co-operative Society',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(co-operative|cooperative|सहकारी\s*समिति)/iu,
    confidence: 0.95,
  },
];

/**
 * Registry mapping per document type
 */
export const PATTERN_GROUPS: Record<string, PatternRule[]> = {
  LAND_RECORD: LAND_RECORD_PATTERNS,
  BUSINESS_CERT: BUSINESS_CERT_PATTERNS,
  GST: BUSINESS_CERT_PATTERNS,
  FSSAI: BUSINESS_CERT_PATTERNS,
  PROPERTY_DEED: PROPERTY_DEED_PATTERNS,
  UDYAM: UDYAM_MSME_PATTERNS,
  ARTISAN_CARD: LAND_RECORD_PATTERNS,
};

/**
 * Extract ownershipType from raw document text using multi-tier regex matching.
 * 
 * @param rawText Document text extracted via OCR or raw input
 * @param docType Optional document type identifier (e.g., 'LAND_RECORD', 'GST', 'UDYAM')
 */
export function extractOwnershipType(rawText: string, docType?: string): OwnershipExtractionResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      success: false,
      ownershipType: null,
      normalizedCategory: null,
      rawMatch: null,
      confidence: 0.0,
      matchedPatternGroup: null,
      docTypeUsed: docType || 'GENERIC',
    };
  }

  const normalizedInput = rawText.replace(/\s+/g, ' ');

  // 1. Try document-type specific patterns first if docType is provided
  if (docType && PATTERN_GROUPS[docType.toUpperCase()]) {
    const rules = PATTERN_GROUPS[docType.toUpperCase()];
    for (const rule of rules) {
      const match = normalizedInput.match(rule.regex);
      if (match) {
        return {
          success: true,
          ownershipType: rule.label,
          normalizedCategory: rule.key,
          rawMatch: match[0],
          confidence: rule.confidence,
          matchedPatternGroup: docType.toUpperCase(),
          docTypeUsed: docType,
        };
      }
    }
  }

  // 2. Generic scan across all pattern groups if primary group gave no match
  const allGroups = [
    { name: 'LAND_RECORD', rules: LAND_RECORD_PATTERNS },
    { name: 'BUSINESS_CERT', rules: BUSINESS_CERT_PATTERNS },
    { name: 'PROPERTY_DEED', rules: PROPERTY_DEED_PATTERNS },
    { name: 'UDYAM_MSME', rules: UDYAM_MSME_PATTERNS },
  ];

  for (const group of allGroups) {
    for (const rule of group.rules) {
      const match = normalizedInput.match(rule.regex);
      if (match) {
        return {
          success: true,
          ownershipType: rule.label,
          normalizedCategory: rule.key,
          rawMatch: match[0],
          confidence: rule.confidence * 0.9, // Slightly lower confidence when fallback generic match is used
          matchedPatternGroup: group.name,
          docTypeUsed: docType || 'GENERIC',
        };
      }
    }
  }

  // 3. Fallback if no pattern matched
  return {
    success: false,
    ownershipType: null,
    normalizedCategory: 'UNSPECIFIED',
    rawMatch: null,
    confidence: 0.0,
    matchedPatternGroup: null,
    docTypeUsed: docType || 'GENERIC',
  };
}
