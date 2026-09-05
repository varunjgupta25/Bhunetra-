import React, { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { recordsApi } from '@/api/axiosClient'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { cn } from '@/lib/utils'
import { t } from '@/utils/languages'
import { DEMO_DOCUMENTS_CATALOG, DOCUMENT_CATEGORIES } from '@/data/demoDocumentsCatalog'

function normalizeExtractedFields(rawFields = {}, confidenceScores = {}) {
  const normalized = {}
  for (const [key, val] of Object.entries(rawFields)) {
    if (val && typeof val === 'object' && 'value' in val) {
      normalized[key] = {
        value: val.value !== undefined && val.value !== null ? String(val.value) : '',
        confidence: typeof val.confidence === 'number'
          ? val.confidence
          : (typeof confidenceScores[key] === 'number' ? confidenceScores[key] : 0.85),
      }
    } else {
      normalized[key] = {
        value: val !== undefined && val !== null ? String(val) : '',
        confidence: typeof confidenceScores[key] === 'number' ? confidenceScores[key] : 0.85,
      }
    }
  }

  for (const [key, score] of Object.entries(confidenceScores)) {
    if (!normalized[key] && typeof score === 'number') {
      normalized[key] = {
        value: '',
        confidence: score,
      }
    }
  }
  return normalized
}

// Field label mappings for human-readable forms in English and Marathi
const FIELD_LABELS = {
  village: { en: 'Village / Locality', mr: 'गाव / परिसर' },
  villageCode: { en: 'Village / Census Code', mr: 'गाव / एलजीडी संकेतांक' },
  tehsil: { en: 'Tehsil / Taluka', mr: 'तालुका' },
  district: { en: 'District', mr: 'जिल्हा' },
  khasraNumber: { en: 'Gat / Survey / Khasra No.', mr: 'गट / भूमापन क्रमांक' },
  khataNumber: { en: 'Khata / Account No.', mr: 'खाते क्रमांक' },
  ownerName: { en: 'Owner / Holder Name', mr: 'खातेदार / मालकाचे नाव' },
  area: { en: 'Total Land Area', mr: 'एकूण क्षेत्र' },
  assessment: { en: 'Assessment / Revenue (Juma)', mr: 'आकारणी / महसूल कर' },
  ownershipType: { en: 'Occupancy / Tenure Class', mr: 'भोगवटादार वर्ग / धारणाधिकार' },
  ctsNumber: { en: 'CTS / Cadastral Sheet No.', mr: 'नगर भूमापन (CTS) क्र.' },
  sheetNumber: { en: 'Sheet / Ward No.', mr: 'प्रभाग / शीट क्रमांक' },
  mutationNumber: { en: 'Mutation / Ferfar No.', mr: 'फेरफार क्रमांक' },
  transactionType: { en: 'Transaction / Deed Nature', mr: 'दस्तऐवजाचा प्रकार' },
  registrationNumber: { en: 'Doc Registration No.', mr: 'दस्त नोंदणी क्रमांक' },
  sroOffice: { en: 'Sub-Registrar (SRO) Office', mr: 'दुय्यम निबंधक कार्यालय' },
  marketValue: { en: 'Consideration / Market Value', mr: 'बाजारमूल्य / मोबदला' },
  stampDuty: { en: 'Stamp Duty Paid', mr: 'मुद्रांक शुल्क भरणा' },
  searchPeriod: { en: 'Title Search Period', mr: 'शोध कालावधी' },
  encumbranceStatus: { en: 'Encumbrance Status', mr: 'बोजा व भार स्थिती' },
  gatNumber: { en: 'Gat / Field Parcel No.', mr: 'गट क्रमांक' },
  scale: { en: 'Map Scale & Geometry', mr: 'नकाशा प्रमाण व भूमिती' },
  naOrderNo: { en: 'NA Order / Sanad No.', mr: 'अकृषिक आदेश क्र. व सनद' },
  sanctionDate: { en: 'Sanction Date', mr: 'मंजुरी दिनांक' },
  donorName: { en: 'Donor / Relinquisher', mr: 'देणगीदार / हक्कसोडकर्ता' },
  doneeName: { en: 'Donee / Beneficiary', mr: 'स्वीकारकर्ता / लाभार्थी' },
  heirNames: { en: 'Legal Heirs & Shares', mr: 'कायदेशीर वारसदार व हिस्से' },
  partitionBasis: { en: 'Partition Deed Basis', mr: 'कौटुंबिक वाटप आधार' },
}

export default function VerificationPage() {
  const { user, decrementPendingCount, lastExtractedResult, currentLanguage } = useAppStore()
  const lang = currentLanguage || 'mr'

  // Default selection: 7/12 extract, first authorized paper
  const [selectedCategoryId, setSelectedCategoryId] = useState('712_extract')
  const [selectedDocKey, setSelectedDocKey] = useState('712_auth_1')
  const [viewerMode, setViewerMode] = useState('annotated') // 'annotated' | 'raw' | 'ocr-lines'
  const [activeHoverField, setActiveHoverField] = useState(null)
  const [notes, setNotes] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  // Filter papers by selected category (always 3 papers: auth_1, auth_2, tampered)
  const categoryPapers = useMemo(() => {
    return DEMO_DOCUMENTS_CATALOG.filter((doc) => doc.categoryId === selectedCategoryId)
  }, [selectedCategoryId])

  // Current active document
  const currentDoc = useMemo(() => {
    const found = DEMO_DOCUMENTS_CATALOG.find((doc) => doc.key === selectedDocKey)
    return found || categoryPapers[0] || DEMO_DOCUMENTS_CATALOG[0]
  }, [selectedDocKey, categoryPapers])

  const [recordId, setRecordId] = useState(currentDoc.id)
  const [fields, setFields] = useState(currentDoc.extractedFields)

  // Sync state when selectedDocKey changes
  useEffect(() => {
    setImageLoadError(false)
    setRecordId(currentDoc.id)
    setFields(currentDoc.extractedFields)
    setIsSaved(false)
    setNotes('')
  }, [currentDoc])

  // Pipeline upload result override
  useEffect(() => {
    if (lastExtractedResult) {
      if (lastExtractedResult.categoryId) {
        setSelectedCategoryId(lastExtractedResult.categoryId)
      }
      if (lastExtractedResult.docKey) {
        setSelectedDocKey(lastExtractedResult.docKey)
      } else if (lastExtractedResult.isForged) {
        // If forged but no key specified, find the forged variant of the selected category
        const cat = lastExtractedResult.categoryId || selectedCategoryId
        const tamperedDoc = DEMO_DOCUMENTS_CATALOG.find((d) => d.categoryId === cat && d.isForged)
        if (tamperedDoc) {
          setSelectedDocKey(tamperedDoc.key)
        }
      }

      setRecordId(lastExtractedResult.recordId || `REC-${Date.now()}`)
      const raw = lastExtractedResult.extractedFields || {}
      const scores = lastExtractedResult.confidenceScores || {}
      const normalized = normalizeExtractedFields(raw, scores)

      setFields((prev) => ({
        ...prev,
        ...normalized,
      }))
    }
  }, [lastExtractedResult])

  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId)
    const firstPaper = DEMO_DOCUMENTS_CATALOG.find((d) => d.categoryId === catId)
    if (firstPaper) {
      setSelectedDocKey(firstPaper.key)
    }
  }

  const handleSelectDoc = (key) => {
    setSelectedDocKey(key)
  }

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { confidence: 0.85 }),
        value,
      },
    }))
  }

  const handleReset = () => {
    setFields(currentDoc.extractedFields)
    setNotes('')
    setIsSaved(false)
  }

  const handleApprove = async () => {
    setIsSaved(true)
    decrementPendingCount()

    try {
      await recordsApi.verifyRecord(recordId, {
        correctedFields: fields,
        approved: !currentDoc.isForged,
        notes,
      })
    } catch (err) {
      console.warn('Backend API record verification fallback:', err)
    }
  }

  return (
    <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-gutter py-6 md:py-8 flex flex-col gap-6 md:gap-8 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border border-amber-500/20">
              <span className="material-symbols-outlined text-sm">gavel</span>
              {t('module3Title', lang)}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              {t('assignedVerifier', lang)}: {user?.displayName || 'A. R. Shinde (Sub-Divisional Officer)'}
            </span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              30 Demo Papers · 10 Land Categories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-navy dark:text-white">
            {t('verWorkspaceTitle', lang)}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            {t('verWorkspaceSubtitle', lang)}
          </p>
        </div>

        {/* Category Selector Dropdown (Quick Access) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-low p-2.5 rounded-2xl border border-[#D0E8F5] dark:border-slate-800">
          <div className="flex items-center gap-2 px-2">
            <span className="material-symbols-outlined text-base text-primary">category</span>
            <span className="text-xs font-bold text-on-surface whitespace-nowrap">दस्तऐवज प्रकार:</span>
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-white dark:bg-slate-900 text-xs font-bold text-on-surface border border-[#B8D8EE] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
          >
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameMr} ({cat.nameEn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 10 Document Types Pill Carousel & 3 Variant Selector Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#D0E8F5] dark:border-slate-800 p-4 shadow-sm flex flex-col gap-4">
        {/* Row 1: All 10 Document Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap pr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">folder_open</span>
            Categories:
          </span>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategoryId
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border-transparent hover:border-[#B8D8EE]"
                )}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                <span>{cat.badge}</span>
              </button>
            )
          })}
        </div>

        {/* Row 2: 3 Papers per Category (2 Authorized + 1 Tampered Demo) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#D0E8F5] dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-deep-navy dark:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-primary">description</span>
              <span>Available Demo Papers:</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {categoryPapers.map((paper, idx) => {
              const isSelected = paper.key === selectedDocKey
              const isForged = paper.isForged

              return (
                <button
                  key={paper.key}
                  type="button"
                  onClick={() => handleSelectDoc(paper.key)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border",
                    isSelected
                      ? isForged
                        ? "bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400"
                        : "bg-[#0D2B40] text-white border-[#0D2B40] shadow-md ring-2 ring-primary/50"
                      : isForged
                      ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-100"
                      : "bg-surface-container-low text-on-surface border-[#D0E8F5] dark:border-slate-800 hover:border-primary"
                  )}
                >
                  <span className={cn("material-symbols-outlined text-base", isForged ? "text-red-500 dark:text-red-400" : isSelected ? "text-emerald-400" : "text-emerald-600")}>
                    {isForged ? "warning" : "verified_user"}
                  </span>
                  <span>{isForged ? `🚨 Paper ${idx + 1}: Tampered Sample` : `📄 Paper ${idx + 1}: Authorized`}</span>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold",
                    isSelected ? "bg-white/20 text-white" : isForged ? "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                  )}>
                    {Math.round(paper.confidence * 100)}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Split View Layout */}
      <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full min-h-[650px]">
        {/* Panel 1: Scanned Document & OCR Bounding Box Inspector */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-[#D0E8F5] dark:border-slate-800 flex flex-col overflow-hidden relative group min-h-[550px] xl:h-auto">
          {/* Viewer Header */}
          <div className="bg-surface-container px-4 py-3 border-b border-[#D0E8F5] dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">document_scanner</span>
              <span className="font-mono text-xs font-bold text-secondary">
                #{recordId}
              </span>
              <span className={cn(
                "text-[11px] px-2.5 py-0.5 rounded-full font-bold",
                currentDoc.isForged
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300"
                  : "bg-primary/10 text-primary"
              )}>
                {currentDoc.categoryLabel}
              </span>
            </div>

            {/* Viewer Mode & Zoom Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-container-high rounded-xl p-0.5 border border-outline-variant/30 text-xs">
                <button
                  onClick={() => setViewerMode('annotated')}
                  type="button"
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer",
                    viewerMode === 'annotated' ? "bg-white dark:bg-slate-800 text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                  )}
                  title="Show interactive OCR overlays on document"
                >
                  {t('ocrOverlaysBtn', lang)}
                </button>
                <button
                  onClick={() => setViewerMode('raw')}
                  type="button"
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer",
                    viewerMode === 'raw' ? "bg-white dark:bg-slate-800 text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                  )}
                  title="Show raw scanned image"
                >
                  {t('rawScanBtn', lang)}
                </button>
                <button
                  onClick={() => setViewerMode('ocr-lines')}
                  type="button"
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer",
                    viewerMode === 'ocr-lines' ? "bg-white dark:bg-slate-800 text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                  )}
                  title="View list of all OCR extracted text lines"
                >
                  {t('textLayerBtn', lang)}
                </button>
              </div>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 15, 175))}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-secondary transition-colors cursor-pointer"
                title="Zoom In"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">zoom_in</span>
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 15, 70))}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-secondary transition-colors cursor-pointer"
                title="Zoom Out"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">zoom_out</span>
              </button>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-secondary transition-colors cursor-pointer"
                title="Rotate 90°"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">rotate_right</span>
              </button>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-6 overflow-auto relative flex justify-center items-start">
            {viewerMode === 'ocr-lines' ? (
              /* OCR Text Stream Mode */
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">subject</span>
                    EasyOCR Devanagari & Marathi Text Extraction
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded",
                    currentDoc.isForged
                      ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                  )}>
                    {Object.keys(currentDoc.extractedFields).length} FIELDS EXTRACTED
                  </span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries(currentDoc.extractedFields).map(([k, f]) => {
                    const labelObj = FIELD_LABELS[k] || { en: k, mr: k }
                    const isTampered = f.confidence < 0.6 || currentDoc.boundingBoxes[k]?.isTampered

                    return (
                      <div
                        key={k}
                        onMouseEnter={() => setActiveHoverField(k)}
                        onMouseLeave={() => setActiveHoverField(null)}
                        className={cn(
                          "p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                          activeHoverField === k
                            ? "bg-primary/10 border-primary shadow-xs"
                            : isTampered
                            ? "bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-800"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            {labelObj.mr} ({labelObj.en})
                          </span>
                          <span className={cn("font-bold text-xs", isTampered ? "text-red-700 dark:text-red-400" : "text-slate-900 dark:text-white")}>
                            {f.value}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded border",
                          isTampered
                            ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        )}>
                          {Math.round(f.confidence * 100)}% Conf
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Interactive Scanned SVG Canvas with Bounding Boxes */
              <div
                className="relative bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-300 dark:border-slate-800 transition-transform duration-200 origin-top overflow-hidden max-w-[700px] w-full"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                }}
              >
                {!imageLoadError ? (
                  <div className="relative w-full">
                    <img
                      src={currentDoc.image}
                      alt={currentDoc.title}
                      onError={() => setImageLoadError(true)}
                      className="w-full h-auto object-contain select-none block"
                    />

                    {/* Interactive OCR Bounding Box Overlays */}
                    {viewerMode === 'annotated' && (
                      <div className="absolute inset-0 pointer-events-auto">
                        {Object.entries(currentDoc.boundingBoxes).map(([fieldKey, box]) => {
                          const isHovered = activeHoverField === fieldKey
                          const isTamperedBox = box.isTampered || (currentDoc.isForged && (fieldKey === 'stamp' || fieldKey === 'khasraNumber' || fieldKey === 'ownerName' || fieldKey === 'heirNames' || fieldKey === 'encumbranceStatus'))

                          return (
                            <div
                              key={fieldKey}
                              onMouseEnter={() => setActiveHoverField(fieldKey)}
                              onMouseLeave={() => setActiveHoverField(null)}
                              onClick={() => {
                                const inputEl = document.getElementById(`input-${fieldKey}`)
                                if (inputEl) inputEl.focus()
                              }}
                              style={{
                                top: `${box.top}%`,
                                left: `${box.left}%`,
                                width: `${box.width}%`,
                                height: `${box.height}%`,
                              }}
                              className={cn(
                                "absolute rounded cursor-pointer transition-all duration-200 flex items-center justify-start px-1.5",
                                isHovered
                                  ? "border-2 border-primary bg-primary/25 shadow-lg ring-4 ring-primary/30 z-20"
                                  : isTamperedBox
                                  ? "border-2 border-red-500 bg-red-500/25 animate-pulse z-10"
                                  : "border border-primary/40 bg-primary/10 hover:border-primary hover:bg-primary/20"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs font-mono uppercase truncate",
                                  isHovered
                                    ? "bg-primary text-white"
                                    : isTamperedBox
                                    ? "bg-red-600 text-white"
                                    : "bg-black/70 text-white opacity-80"
                                )}
                              >
                                {box.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback Sheet */
                  <div className="p-8 font-hindi-text text-gray-800 space-y-6">
                    <div className="text-center border-b-2 border-gray-400 pb-4">
                      <h3 className="text-2xl font-bold">{currentDoc.categoryLabel}</h3>
                      <p className="text-sm text-gray-600">महाराष्ट्र शासन महसूल विभाग</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">दस्त क्र:</span> {recordId}</div>
                      <div><span className="text-gray-500">वर्ष:</span> २०२३-२०२४</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Verification Form & Forensic Intelligence */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-[#D0E8F5] dark:border-slate-800 flex flex-col relative overflow-hidden h-auto">
          <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", currentDoc.isForged ? "bg-red-600" : "bg-primary")}></div>

          <div className="px-6 py-5 border-b border-[#D0E8F5] dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className={cn("material-symbols-outlined text-2xl", currentDoc.isForged ? "text-red-600" : "text-primary")}>
                {currentDoc.isForged ? "gavel" : "edit_document"}
              </span>
              <div>
                <h3 className="text-xl font-bold text-deep-navy dark:text-white">
                  {t('extractedDataVerificationTitle', lang)}
                </h3>
                <p className="text-xs text-gray-500">
                  {currentDoc.categoryNameMr} ({currentDoc.categoryNameEn})
                </p>
              </div>
            </div>
            {isSaved && (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> {t('approvedLoggedBtn', lang)}
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Forensic & Authenticity Security Panel */}
            <div className={cn(
              "border rounded-xl p-4 space-y-3 transition-all",
              currentDoc.isForged
                ? "bg-red-50/60 dark:bg-red-950/30 border-red-400"
                : "bg-[#F4F9FE] dark:bg-slate-900 border-[#B8D8EE] dark:border-slate-800"
            )}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-deep-navy dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span className={cn("material-symbols-outlined text-base", currentDoc.isForged ? "text-red-600" : "text-primary")}>
                    {currentDoc.isForged ? "dangerous" : "shield_with_heart"}
                  </span>
                  {t('forensicElaBadge', lang)}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                  currentDoc.isForged
                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                )}>
                  {currentDoc.forensic.authenticScore}
                </span>
              </div>

              {/* 3 Forensic Pillar Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">{t('imageElaCheckLabel', lang)}</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.isForged ? "text-red-600" : "text-emerald-700 dark:text-emerald-400")}>
                    <span className="material-symbols-outlined text-xs">{currentDoc.isForged ? "error" : "check_circle"}</span>
                    {currentDoc.forensic.elaStatus}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">{t('mutationLedgerLabel', lang)}</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.isForged ? "text-red-600" : "text-primary")}>
                    <span className="material-symbols-outlined text-xs">history_edu</span>
                    {currentDoc.forensic.mutationLedger}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">{t('villageCollisionLabel', lang)}</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.isForged ? "text-red-600" : "text-emerald-700 dark:text-emerald-400")}>
                    <span className="material-symbols-outlined text-xs">{currentDoc.isForged ? "warning" : "verified"}</span>
                    {currentDoc.forensic.collisionCount}
                  </span>
                </div>
              </div>

              {/* Forensic Details Alert Box for Tampered Papers */}
              {currentDoc.isForged && currentDoc.extraDetails && (
                <div className="bg-red-100/80 dark:bg-red-950/60 p-3 rounded-lg border border-red-300 dark:border-red-900 text-xs text-red-950 dark:text-red-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-800 dark:text-red-300">
                    <span className="material-symbols-outlined text-sm">report</span>
                    <span>ML Pipeline Tampering Reason / फसवणूक विश्लेषण:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {currentDoc.extraDetails.fraudSummary || currentDoc.extraDetails.forgeryReason || currentDoc.extraDetails.violationReason || currentDoc.extraDetails.tamperingReason || currentDoc.extraDetails.disputeSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Verification Form Fields based on Document Category */}
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              {Object.entries(fields).map(([key, field]) => {
                const labelObj = FIELD_LABELS[key] || { en: key, mr: key }
                const isHovered = activeHoverField === key
                const isLowConfidence = (field?.confidence ?? 1) < 0.7

                return (
                  <div
                    key={key}
                    onMouseEnter={() => setActiveHoverField(key)}
                    onMouseLeave={() => setActiveHoverField(null)}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      isLowConfidence
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
                        : isHovered
                        ? "bg-primary/5 border-primary ring-1 ring-primary/30"
                        : "bg-surface-container-low/30 border-[#B8D8EE] dark:border-slate-700"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-on-surface">
                        {labelObj.mr} <span className="text-gray-400 font-normal">({labelObj.en})</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {isLowConfidence && (
                          <span className="text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            {t('flaggedForReviewLabel', lang)}
                          </span>
                        )}
                        <ConfidenceBadge confidence={field?.confidence} />
                      </div>
                    </div>
                    <input
                      id={`input-${key}`}
                      className={cn(
                        "w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none shadow-xs transition-all font-semibold",
                        isLowConfidence
                          ? "border-2 border-red-400 text-red-700 dark:text-red-300 focus:ring-2 focus:ring-red-500"
                          : "border border-[#B8D8EE] dark:border-slate-700 focus:ring-2 focus:ring-primary"
                      )}
                      type="text"
                      value={field?.value || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                    />
                  </div>
                )
              })}

              {/* Reviewer Notes */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('verNotesLabel', lang)}
                </label>
                <textarea
                  className="w-full bg-white dark:bg-slate-900 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder={t('verNotesPlaceholder', lang)}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </form>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-surface-container-low dark:bg-slate-900 border-t border-[#D0E8F5] dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-secondary hover:bg-surface-container transition-colors border border-transparent hover:border-[#B8D8EE] cursor-pointer"
                type="button"
              >
                {t('resetEditsBtn', lang)}
              </button>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                {t('downloadCertifiedPdfBtn', lang)}
              </button>
            </div>

            <button
              onClick={handleApprove}
              disabled={isSaved}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer",
                isSaved
                  ? "bg-emerald-700 cursor-not-allowed"
                  : currentDoc.isForged
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-[#2DA090]"
              )}
              type="button"
            >
              <span className="material-symbols-outlined text-base">
                {isSaved ? "task_alt" : currentDoc.isForged ? "gavel" : "verified"}
              </span>
              {isSaved ? t('approvedLoggedBtn', lang) : currentDoc.isForged ? 'Log Fraud Rejection' : t('approveSaveBtn', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Multilingual PDF Generation Modal */}
      <DigitizedPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        recordData={{
          recordId: recordId,
          khasraNumber: fields.khasraNumber?.value || fields.gatNumber?.value || fields.ctsNumber?.value || '142/3A',
          khataNumber: fields.khataNumber?.value || fields.mutationNumber?.value || '582',
          ownerName: fields.ownerName?.value || fields.doneeName?.value || fields.heirNames?.value || 'रमेश विठ्ठल पाटील',
          ownerNameEn: fields.ownerName?.value || 'Ramesh Vitthal Patil',
          village: fields.village?.value || 'वाघोली',
          villageEn: 'Wagholi',
          tehsil: fields.tehsil?.value || 'हवेली',
          tehsilEn: 'Haveli',
          district: fields.district?.value || 'पुणे',
          districtEn: 'Pune',
          landArea: `${fields.area?.value || '1.45'} हेक्टर`,
          landAreaEn: `${fields.area?.value || '1.45'} Hectare`,
          isForged: currentDoc.isForged,
        }}
      />
    </main>
  )
}
