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
 * 1. LAND RECORDS PATTERNS (7/12, RoR, Khatauni, Jamabandi, Bhulekh)
 * Matches English & Devanagari (Hindi/Marathi) tenure & holding headers and values.
 */
export const LAND_RECORD_PATTERNS: PatternRule[] = [
  {
    key: 'PRIVATE_INDIVIDUAL',
    label: 'Private / Sole Individual Owner',
    regex: /(?:धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|कब्जेदार\s*प्रकार|भूमि\s*स्वामी|ownership\s*type|land\s*holding\s*type|tenure\s*type)\s*[:\-]?\s*(निजी|व्यक्तिगत|खुद|स्वयं|private|individual|sole\s*owner|bhumidhar)/i,
    confidence: 0.95,
  },
  {
    key: 'PRIVATE_INDIVIDUAL',
    label: 'Private / Sole Individual Owner (Inline)',
    regex: /\b(निजी|व्यक्तिगत|स्वयं\s*अधिकृत|bhumidhar\s*with\s*transferable\s*rights|sole\s*proprietorship\s*land|private\s*ownership)\b/i,
    confidence: 0.85,
  },
  {
    key: 'JOINT_COOWNERSHIP',
    label: 'Joint / Co-Shareholding',
    regex: /(?:धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|कब्जेदार\s*प्रकार|ownership\s*type|tenure\s*type)\s*[:\-]?\s*(सह-खातेदार|संयुक्त|साझा|सहयोगी|joint|co-owner|co-sharer|multiple\s*owners)/i,
    confidence: 0.95,
  },
  {
    key: 'JOINT_COOWNERSHIP',
    label: 'Joint / Co-Shareholding (Inline)',
    regex: /\b(सह-खातेदार|संयुक्त\s*खाता|साझेदारी\s*भूमि|joint\s*holding|co-shared|joint\s*khatadar)\b/i,
    confidence: 0.85,
  },
  {
    key: 'GOVERNMENT_STATE',
    label: 'Government / State / Public Land',
    regex: /(?:धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|ownership\s*type|land\s*type)\s*[:\-]?\s*(सरकारी|शासकीय|राज्य\s*सरकार|ग्राम\s*पंचायत|आबादी|government|state\s*govt|public|gram\s*sabha)/i,
    confidence: 0.95,
  },
  {
    key: 'GOVERNMENT_STATE',
    label: 'Government / State / Public Land (Inline)',
    regex: /\b(सरकारी\s*भूमि|शासकीय\s*जमीन|ग्राम\s*पंचायत\s*भूमि|state\s*government\s*land|gram\s*sabha\s*property)\b/i,
    confidence: 0.85,
  },
  {
    key: 'LEASEHOLD_TENANT',
    label: 'Leasehold / Tenant / Mortgage',
    regex: /(?:धारणाधिकार\s*प्रकार|खातेदाराचे\s*प्रकार|ownership\s*type|tenure)\s*[:\-]?\s*(पट्टा|लीज|किरायेदार|असामी|बंधक|leasehold|tenant|lessee|mortgaged)/i,
    confidence: 0.95,
  },
  {
    key: 'LEASEHOLD_TENANT',
    label: 'Leasehold / Tenant (Inline)',
    regex: /\b(पट्टाधारी|लीज\s*पर|किराया\s*अनुबंध|leasehold\s*tenure|government\s*lease)\b/i,
    confidence: 0.85,
  },
  {
    key: 'TRUST_INSTITUTIONAL',
    label: 'Trust / Society / Institutional Land',
    regex: /(?:धारणाधिकार\s*प्रकार|ownership\s*type)\s*[:\-]?\s*(ट्रस्ट|संस्था|मंदिर|देवस्थान|समीति|trust|society|institutional|temple\s*land)/i,
    confidence: 0.95,
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
    regex: /\b(sole\s*proprietorship|proprietorship\s*firm|एकल\s*स्वामित्व)\b/i,
    confidence: 0.85,
  },
  {
    key: 'PARTNERSHIP',
    label: 'Partnership Firm',
    regex: /(?:constitution\s*of\s*business|entity\s*type|ownership)\s*[:\-]?\s*(partnership|partnership\s*firm|साझेदारी|साझेदारी\s*फर्म)/i,
    confidence: 0.95,
  },
  {
    key: 'PRIVATE_LIMITED',
    label: 'Private Limited Company',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(private\s*limited|pvt\s*ltd|pvt\.\s*ltd\.|पी०\s*वी०\s*टी०)/i,
    confidence: 0.95,
  },
  {
    key: 'PUBLIC_LIMITED',
    label: 'Public Limited Company',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(public\s*limited|public\s*ltd)/i,
    confidence: 0.95,
  },
  {
    key: 'LLP',
    label: 'Limited Liability Partnership (LLP)',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(limited\s*liability\s*partnership|llp|एलएलपी)/i,
    confidence: 0.95,
  },
  {
    key: 'HUF',
    label: 'Hindu Undivided Family (HUF)',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(hindu\s*undivided\s*family|huf|हिन्दू\s*अविभक्त\s*कुटुंब)/i,
    confidence: 0.95,
  },
  {
    key: 'SOCIETY_TRUST',
    label: 'Society / Trust / Co-operative',
    regex: /(?:constitution\s*of\s*business|entity\s*type)\s*[:\-]?\s*(society|trust|cooperative|co-operative|समीति|ट्रस्ट)/i,
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
    regex: /(?:nature\s*of\s*title|ownership\s*status|deed\s*type)\s*[:\-]?\s*(freehold|free-hold|पूर्ण\s*स्वामित्व)/i,
    confidence: 0.95,
  },
  {
    key: 'FREEHOLD',
    label: 'Freehold Title (Inline)',
    regex: /\b(freehold\s*property|freehold\s*land|पूर्ण\s*स्वामित्वाधीन)\b/i,
    confidence: 0.85,
  },
  {
    key: 'LEASEHOLD',
    label: 'Leasehold Property',
    regex: /(?:nature\s*of\s*title|ownership\s*status)\s*[:\-]?\s*(leasehold|lease-hold|पट्टागत|पट्टा\s*विलेख)/i,
    confidence: 0.95,
  },
  {
    key: 'POWER_OF_ATTORNEY',
    label: 'Power of Attorney Holder',
    regex: /(?:nature\s*of\s*title|ownership\s*by)\s*[:\-]?\s*(power\s*of\s*attorney|poa|मुख्तारनामा|जीपीए)/i,
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
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(proprietary|proprietorship)/i,
    confidence: 0.95,
  },
  {
    key: 'PARTNERSHIP',
    label: 'Partnership MSME',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(partnership)/i,
    confidence: 0.95,
  },
  {
    key: 'SELF_HELP_GROUP',
    label: 'Self Help Group (SHG)',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(self\s*help\s*group|shg|स्वयं\s*सहायता\s*समूह)/i,
    confidence: 0.95,
  },
  {
    key: 'COOPERATIVE',
    label: 'Co-operative Society',
    regex: /(?:type\s*of\s*enterprise|organisation\s*type)\s*[:\-]?\s*(co-operative|cooperative|सहकारी\s*समिति)/i,
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
