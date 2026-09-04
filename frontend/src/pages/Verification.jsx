import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { recordsApi } from '@/api/axiosClient'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { cn } from '@/lib/utils'

// Demo document profiles with accurate Marathi land metadata and OCR bounding boxes
const DEMO_DOCUMENTS = {
  paper1: {
    id: 'REC-712-PUNE-1423',
    title: 'Paper 1: Wagholi, Pune (७/१२ उतारा)',
    image: '/demo_papers/paper_1_wagholi_pune.jpg',
    category: 'VILLAGE_FORM_7_12',
    categoryLabel: 'गाव नमुना ७/१२ उतारा',
    extractedFields: {
      villageCode: { value: 'MH-PN-HV-0042', confidence: 0.98 },
      village: { value: 'वाघोली (Wagholi)', confidence: 0.97 },
      tehsil: { value: 'हवेली (Haveli)', confidence: 0.96 },
      district: { value: 'पुणे (Pune)', confidence: 0.99 },
      khasraNumber: { value: '142/3A', confidence: 0.94 },
      khataNumber: { value: '582', confidence: 0.95 },
      ownerName: { value: 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)', confidence: 0.96 },
      area: { value: '1.45', confidence: 0.92 },
      assessment: { value: '₹ 4500', confidence: 0.88 },
      ownershipType: { value: 'भोगवटादार वर्ग - १', confidence: 0.95 },
    },
    // Normalized bounding box percentages { top, left, width, height }
    boundingBoxes: {
      village: { top: 12, left: 14, width: 35, height: 6, label: 'गाव: वाघोली' },
      khasraNumber: { top: 22, left: 10, width: 38, height: 7, label: 'गट क्र. १४२/३अ' },
      khataNumber: { top: 31, left: 10, width: 38, height: 7, label: 'खाते क्र. ५८२' },
      ownerName: { top: 41, left: 10, width: 78, height: 10, label: 'खातेदार: रमेश विठ्ठल पाटील' },
      area: { top: 53, left: 10, width: 45, height: 8, label: 'क्षेत्र: १.४५ हेक्टर' },
      assessment: { top: 63, left: 10, width: 45, height: 7, label: 'आकारणी: ₹ ४५००' },
      stamp: { top: 78, left: 60, width: 32, height: 16, label: 'तलाठी डिजिटल शिक्का' },
    },
    forensic: {
      authenticScore: '99.4% AUTHENTIC',
      elaStatus: 'Uniform Compression (Tamper-Free)',
      mutationLedger: 'Ferfar #1842 Verified in Mahabhulekh',
      collisionCount: '0 Collisions (Unique)',
      isForged: false,
    },
  },
  paper2: {
    id: 'REC-712-PUNE-0248',
    title: 'Paper 2: Khadakwasla, Pune (७/१२ उतारा)',
    image: '/demo_papers/paper_2_khadakwasla.jpg',
    category: 'VILLAGE_FORM_7_12',
    categoryLabel: 'गाव नमुना ७/१२ उतारा',
    extractedFields: {
      villageCode: { value: 'MH-PN-HV-0089', confidence: 0.96 },
      village: { value: 'खडकवासला (Khadakwasla)', confidence: 0.95 },
      tehsil: { value: 'हवेली (Haveli)', confidence: 0.96 },
      district: { value: 'पुणे (Pune)', confidence: 0.98 },
      khasraNumber: { value: '248', confidence: 0.65 }, // flagged low confidence
      khataNumber: { value: '712', confidence: 0.93 },
      ownerName: { value: 'रमेश बाबूराव पाटील (Ramesh Baburao Patil)', confidence: 0.94 },
      area: { value: '2.10', confidence: 0.89 },
      assessment: { value: '₹ 3200', confidence: 0.82 },
      ownershipType: { value: 'भोगवटादार वर्ग - १', confidence: 0.92 },
    },
    boundingBoxes: {
      village: { top: 11, left: 12, width: 36, height: 6, label: 'गाव: खडकवासला' },
      khasraNumber: { top: 20, left: 10, width: 38, height: 8, label: 'गट क्र. २४८ (Flagged)' },
      khataNumber: { top: 30, left: 10, width: 38, height: 7, label: 'खाते क्र. ७१२' },
      ownerName: { top: 40, left: 10, width: 80, height: 10, label: 'खातेदार: रमेश बाबूराव पाटील' },
      area: { top: 52, left: 10, width: 45, height: 8, label: 'क्षेत्र: २.१० हेक्टर' },
      assessment: { top: 62, left: 10, width: 45, height: 7, label: 'आकारणी: ₹ ३२००' },
      stamp: { top: 76, left: 58, width: 34, height: 18, label: 'तलाठी महसूल शिक्का' },
    },
    forensic: {
      authenticScore: '98.8% AUTHENTIC',
      elaStatus: 'Uniform ELA Gradient',
      mutationLedger: 'Ferfar #2481 Matched',
      collisionCount: '0 Collisions (Unique)',
      isForged: false,
    },
  },
  paper3: {
    id: 'REC-8A-NASHIK-0105',
    title: 'Paper 3: Trimbakeshwar, Nashik (८-अ खाते उतारा)',
    image: '/demo_papers/paper_3_trimbakeshwar.jpg',
    category: 'VILLAGE_FORM_8A',
    categoryLabel: 'गाव नमुना ८-अ खातेवही नोंद',
    extractedFields: {
      villageCode: { value: 'MH-NS-TR-0012', confidence: 0.98 },
      village: { value: 'त्र्यंबकेश्वर (Trimbakeshwar)', confidence: 0.97 },
      tehsil: { value: 'त्र्यंबकेश्वर (Trimbakeshwar)', confidence: 0.97 },
      district: { value: 'नाशिक (Nashik)', confidence: 0.99 },
      khasraNumber: { value: '105/B', confidence: 0.92 },
      khataNumber: { value: '341', confidence: 0.96 },
      ownerName: { value: 'गणेश पांडुरंग पवार (Ganesh Pandurang Pawar)', confidence: 0.95 },
      area: { value: '0.85', confidence: 0.91 },
      assessment: { value: '₹ 1800', confidence: 0.86 },
      ownershipType: { value: 'भोगवटादार वर्ग - १', confidence: 0.94 },
    },
    boundingBoxes: {
      village: { top: 12, left: 15, width: 40, height: 6, label: 'गाव: त्र्यंबकेश्वर' },
      khasraNumber: { top: 22, left: 12, width: 36, height: 7, label: 'गट क्र. १०५/ब' },
      khataNumber: { top: 31, left: 12, width: 36, height: 7, label: 'खाते क्र. ३४१' },
      ownerName: { top: 41, left: 12, width: 75, height: 10, label: 'खातेदार: गणेश पांडुरंग पवार' },
      area: { top: 53, left: 12, width: 42, height: 8, label: 'क्षेत्र: ०.८५ हेक्टर' },
      assessment: { top: 63, left: 12, width: 42, height: 7, label: 'आकारणी: ₹ १८००' },
      stamp: { top: 77, left: 62, width: 30, height: 16, label: 'तहसील कार्यालय शिक्का' },
    },
    forensic: {
      authenticScore: '99.1% AUTHENTIC',
      elaStatus: 'Uniform Compression',
      mutationLedger: 'Ferfar #902 Verified',
      collisionCount: '0 Collisions (Unique)',
      isForged: false,
    },
  },
  paper4: {
    id: 'REC-FORGED-UNAUTH-0999',
    title: 'Paper 4: Unauthorized / Forged Sample (अनधिकृत)',
    image: '/demo_papers/paper_4_forged_unauthorized_extract.jpg',
    category: 'FORGED_ANOMALY',
    categoryLabel: '⚠️ संशयास्पद अनधिकृत दस्तऐवज',
    extractedFields: {
      villageCode: { value: 'MH-XX-9999', confidence: 0.25 },
      village: { value: 'खोट्यावाडी (Fake Village)', confidence: 0.30 },
      tehsil: { value: 'हवेली (Haveli)', confidence: 0.40 },
      district: { value: 'पुणे (Pune)', confidence: 0.50 },
      khasraNumber: { value: '999/X', confidence: 0.35 },
      khataNumber: { value: '999', confidence: 0.32 },
      ownerName: { value: 'विक्रम बनावटराव शिंदे (Unauthorized Fake Claim)', confidence: 0.28 },
      area: { value: '9.99', confidence: 0.20 },
      assessment: { value: '₹ 9999', confidence: 0.15 },
      ownershipType: { value: '⚠️ अनधिकृत फेरफार', confidence: 0.20 },
    },
    boundingBoxes: {
      village: { top: 12, left: 12, width: 38, height: 6, label: 'खोट्यावाडी (Fake Village)' },
      khasraNumber: { top: 22, left: 10, width: 38, height: 7, label: '९९९/X (Invalid)' },
      khataNumber: { top: 31, left: 10, width: 38, height: 7, label: 'खाते क्र. ९९९ (Duplicate)' },
      ownerName: { top: 41, left: 10, width: 78, height: 10, label: 'बनावट खातेदार' },
      area: { top: 53, left: 10, width: 45, height: 8, label: 'क्षेत्र ९.९९ हेक्टर' },
      stamp: { top: 75, left: 55, width: 38, height: 20, label: '❌ बनावट / विसंगत शिक्का' },
    },
    forensic: {
      authenticScore: '12.4% FRAUD ALERT',
      elaStatus: 'High Noise Anomaly (Manipulated Pixels)',
      mutationLedger: 'Record Not Found in 1M Mahabhulekh DB',
      collisionCount: '3 Geographic Collisions Detected',
      isForged: true,
    },
  },
}

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

export default function VerificationPage() {
  const { user, decrementPendingCount, lastExtractedResult } = useAppStore()

  const [selectedDocKey, setSelectedDocKey] = useState('paper1')
  const [viewerMode, setViewerMode] = useState('annotated') // 'annotated' | 'raw' | 'ocr-lines' | 'simulated'
  const [activeHoverField, setActiveHoverField] = useState(null)
  const [recordId, setRecordId] = useState(DEMO_DOCUMENTS.paper1.id)
  const [fields, setFields] = useState(DEMO_DOCUMENTS.paper1.extractedFields)
  const [notes, setNotes] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  // Current document profile
  const currentDoc = DEMO_DOCUMENTS[selectedDocKey] || DEMO_DOCUMENTS.paper1

  useEffect(() => {
    // If an extracted result from pipeline exists, populate dynamic state
    if (lastExtractedResult) {
      setRecordId(lastExtractedResult.recordId || `REC-${Date.now()}`)
      const raw = lastExtractedResult.extractedFields || {}
      const scores = lastExtractedResult.confidenceScores || {}
      const normalized = normalizeExtractedFields(raw, scores)

      setFields((prev) => ({
        ...prev,
        ...normalized,
        area: normalized.area || normalized.landArea || prev.area,
      }))
    }
  }, [lastExtractedResult])

  const handleSelectDoc = (key) => {
    setSelectedDocKey(key)
    setImageLoadError(false)
    const doc = DEMO_DOCUMENTS[key]
    if (doc) {
      setRecordId(doc.id)
      setFields(doc.extractedFields)
      setIsSaved(false)
    }
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
    const doc = DEMO_DOCUMENTS[selectedDocKey] || DEMO_DOCUMENTS.paper1
    setFields(doc.extractedFields)
    setNotes('')
    setIsSaved(false)
  }

  const handleApprove = async () => {
    setIsSaved(true)
    decrementPendingCount()

    try {
      await recordsApi.verifyRecord(recordId, {
        correctedFields: {
          villageCode: fields.villageCode?.value,
          village: fields.village?.value,
          khasraNumber: fields.khasraNumber?.value,
          ownerName: fields.ownerName?.value,
          landArea: fields.area?.value,
          khataNumber: fields.khataNumber?.value,
          assessment: fields.assessment?.value,
        },
        approved: true,
        notes,
      })
    } catch (err) {
      console.warn('Backend API record verification fallback:', err)
    }
  }

  return (
    <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-gutter py-6 md:py-8 flex flex-col gap-6 md:gap-8 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border border-amber-500/20">
              <span className="material-symbols-outlined text-sm">gavel</span>
              Module 3 · Human-in-the-Loop OCR Verification
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              Assigned: {user?.displayName || 'A. R. Shinde (Verifier)'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-navy dark:text-white">
            Verification Workspace &amp; OCR Bounding Box Inspector
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Inspect EasyOCR extracted text against original scanned land records with real-time bounding box synchronization.
          </p>
        </div>

        {/* Demo Document Quick Switcher */}
        <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl border border-[#D0E8F5] dark:border-slate-800">
          <label className="text-xs font-bold text-on-surface whitespace-nowrap pl-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">folder_open</span>
            <span>Document:</span>
          </label>
          <select
            value={selectedDocKey}
            onChange={(e) => handleSelectDoc(e.target.value)}
            className="bg-white dark:bg-slate-900 text-xs font-bold text-on-surface border border-[#B8D8EE] dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="paper1">📄 Paper 1: Wagholi, Pune (७/१२)</option>
            <option value="paper2">📄 Paper 2: Khadakwasla (७/१२ - Flagged)</option>
            <option value="paper3">📄 Paper 3: Trimbakeshwar (८-अ)</option>
            <option value="paper4">🚨 Paper 4: Unauthorized (Fraud Demo)</option>
          </select>
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
              <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
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
                  OCR Overlays
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
                  Raw Scan
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
                  Text Layer
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
                    EasyOCR Devanagari Text Blocks
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    52 BLOCKS EXTRACTED
                  </span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries(currentDoc.extractedFields).map(([k, f], idx) => (
                    <div
                      key={k}
                      onMouseEnter={() => setActiveHoverField(k)}
                      onMouseLeave={() => setActiveHoverField(null)}
                      className={cn(
                        "p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                        activeHoverField === k
                          ? "bg-primary/10 border-primary shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{k}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{f.value}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {Math.round(f.confidence * 100)}% Conf
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Interactive Scanned Image Canvas with Bounding Boxes */
              <div
                className="relative bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-300 dark:border-slate-800 transition-transform duration-200 origin-top overflow-hidden max-w-[650px] w-full"
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
                          const isKhasraFlag = fieldKey === 'khasraNumber' && (fields.khasraNumber?.confidence ?? 1) < 0.7
                          const isFraudStamp = fieldKey === 'stamp' && currentDoc.forensic.isForged

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
                                  : isFraudStamp
                                  ? "border-2 border-red-500 bg-red-500/20 animate-pulse z-10"
                                  : isKhasraFlag
                                  ? "border-2 border-amber-500 bg-amber-500/20 z-10"
                                  : "border border-primary/40 bg-primary/10 hover:border-primary hover:bg-primary/20"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs font-mono uppercase truncate",
                                  isHovered
                                    ? "bg-primary text-white"
                                    : isFraudStamp
                                    ? "bg-red-600 text-white"
                                    : isKhasraFlag
                                    ? "bg-amber-600 text-white"
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
                  /* Fallback Simulated Sheet if image is unreachable */
                  <div className="p-8 font-hindi-text text-gray-800 space-y-6">
                    <div className="text-center border-b-2 border-gray-400 pb-4">
                      <h3 className="text-2xl font-bold">{currentDoc.categoryLabel}</h3>
                      <p className="text-sm text-gray-600">महाराष्ट्र शासन महसूल विभाग</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">गाव:</span> {fields.village?.value || 'वाघोली'}</div>
                      <div><span className="text-gray-500">तालुका:</span> हवेली</div>
                      <div><span className="text-gray-500">जिल्हा:</span> पुणे</div>
                      <div><span className="text-gray-500">वर्ष:</span> २०२३-२०२४</div>
                    </div>
                    <div className="border border-gray-300 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-bold mb-1">गट क्रमांक / Khasra No:</p>
                      <p className="text-base font-bold text-primary">{fields.khasraNumber?.value}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Verification Form & Forensic Intelligence */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-[#D0E8F5] dark:border-slate-800 flex flex-col relative overflow-hidden h-auto">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>

          <div className="px-6 py-5 border-b border-[#D0E8F5] dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">edit_document</span>
              <h3 className="text-xl font-bold text-deep-navy dark:text-white">
                Extracted Data Verification
              </h3>
            </div>
            {isSaved && (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Approved &amp; Logged to Audit Trail
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Forensic & Authenticity Security Panel */}
            <div className={cn(
              "border rounded-xl p-4 space-y-3 transition-all",
              currentDoc.forensic.isForged
                ? "bg-red-50/50 dark:bg-red-950/20 border-red-400"
                : "bg-[#F4F9FE] dark:bg-slate-900 border-[#B8D8EE] dark:border-slate-800"
            )}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-deep-navy dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span className={cn("material-symbols-outlined text-base", currentDoc.forensic.isForged ? "text-red-600" : "text-primary")}>
                    {currentDoc.forensic.isForged ? "dangerous" : "shield_with_heart"}
                  </span>
                  Forensic ELA &amp; Mutation Authenticity Analysis
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                  currentDoc.forensic.isForged
                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                )}>
                  {currentDoc.forensic.authenticScore}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Image ELA Tamper Check</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.forensic.isForged ? "text-red-600" : "text-emerald-700 dark:text-emerald-400")}>
                    <span className="material-symbols-outlined text-xs">{currentDoc.forensic.isForged ? "error" : "check_circle"}</span>
                    {currentDoc.forensic.elaStatus}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Mutation Ledger Match</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.forensic.isForged ? "text-red-600" : "text-primary")}>
                    <span className="material-symbols-outlined text-xs">history_edu</span>
                    {currentDoc.forensic.mutationLedger}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#D0E8F5] dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Village Claim Collision</span>
                  <span className={cn("font-semibold flex items-center gap-1 mt-0.5", currentDoc.forensic.isForged ? "text-red-600" : "text-emerald-700 dark:text-emerald-400")}>
                    <span className="material-symbols-outlined text-xs">{currentDoc.forensic.isForged ? "warning" : "verified"}</span>
                    {currentDoc.forensic.collisionCount}
                  </span>
                </div>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              {/* Field 1: Village Name & Code */}
              <div
                onMouseEnter={() => setActiveHoverField('village')}
                onMouseLeave={() => setActiveHoverField(null)}
                className={cn("p-2 rounded-lg transition-all", activeHoverField === 'village' && "bg-primary/5 ring-1 ring-primary/30")}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">
                    Village (गाव) &amp; Code
                  </label>
                  <ConfidenceBadge confidence={fields.village?.confidence || fields.villageCode?.confidence} />
                </div>
                <input
                  id="input-village"
                  className="w-full bg-surface-container-low dark:bg-slate-800 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  type="text"
                  value={fields.village?.value || 'वाघोली (Wagholi)'}
                  onChange={(e) => handleFieldChange('village', e.target.value)}
                />
              </div>

              {/* Field 2: Khasra / Survey Number (Interactive Flagging) */}
              <div
                onMouseEnter={() => setActiveHoverField('khasraNumber')}
                onMouseLeave={() => setActiveHoverField(null)}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  (fields.khasraNumber?.confidence ?? 1) < 0.7
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
                    : activeHoverField === 'khasraNumber'
                    ? "bg-primary/5 border-primary ring-1 ring-primary/30"
                    : "bg-surface-container-low/20 border-[#B8D8EE] dark:border-slate-700"
                )}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-on-surface">
                    Khasra Number (गट / सर्व्हे क्रमांक)
                  </label>
                  <div className="flex items-center gap-2">
                    {(fields.khasraNumber?.confidence ?? 1) < 0.7 && (
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Flagged For Review
                      </span>
                    )}
                    <ConfidenceBadge confidence={fields.khasraNumber?.confidence} />
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="input-khasraNumber"
                    className={cn(
                      "w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-2.5 text-on-surface font-bold text-sm focus:outline-none shadow-xs transition-all",
                      (fields.khasraNumber?.confidence ?? 1) < 0.7
                        ? "border-2 border-amber-400 focus:ring-2 focus:ring-amber-500"
                        : "border border-[#B8D8EE] dark:border-slate-700 focus:ring-2 focus:ring-primary"
                    )}
                    type="text"
                    value={fields.khasraNumber?.value || ''}
                    onChange={(e) => handleFieldChange('khasraNumber', e.target.value)}
                  />
                  {(fields.khasraNumber?.confidence ?? 1) < 0.7 && (
                    <button
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      title="Reset to 248"
                      type="button"
                      onClick={() => handleFieldChange('khasraNumber', '248')}
                    >
                      <span className="material-symbols-outlined text-base">restore</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Clicking this field highlights the corresponding OCR bounding box on the original document.
                </p>
              </div>

              {/* Field 3: Farmer/Owner Name */}
              <div
                onMouseEnter={() => setActiveHoverField('ownerName')}
                onMouseLeave={() => setActiveHoverField(null)}
                className={cn("p-2 rounded-lg transition-all", activeHoverField === 'ownerName' && "bg-primary/5 ring-1 ring-primary/30")}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">
                    Farmer / Land Owner Name (खातेदाराचे नाव)
                  </label>
                  <ConfidenceBadge confidence={fields.ownerName?.confidence} />
                </div>
                <input
                  id="input-ownerName"
                  className="w-full bg-white dark:bg-slate-900 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-semibold"
                  type="text"
                  value={fields.ownerName?.value || ''}
                  onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                />
              </div>

              {/* Grid: Khata Number & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onMouseEnter={() => setActiveHoverField('khataNumber')}
                  onMouseLeave={() => setActiveHoverField(null)}
                  className={cn("p-2 rounded-lg transition-all", activeHoverField === 'khataNumber' && "bg-primary/5 ring-1 ring-primary/30")}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant">
                      Khata Number (खाते क्र.)
                    </label>
                    <ConfidenceBadge confidence={fields.khataNumber?.confidence} />
                  </div>
                  <input
                    id="input-khataNumber"
                    className="w-full bg-white dark:bg-slate-900 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                    type="text"
                    value={fields.khataNumber?.value || ''}
                    onChange={(e) => handleFieldChange('khataNumber', e.target.value)}
                  />
                </div>

                <div
                  onMouseEnter={() => setActiveHoverField('area')}
                  onMouseLeave={() => setActiveHoverField(null)}
                  className={cn("p-2 rounded-lg transition-all", activeHoverField === 'area' && "bg-primary/5 ring-1 ring-primary/30")}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant">
                      Area in Hectares (क्षेत्र हेक्टर)
                    </label>
                    <ConfidenceBadge confidence={fields.area?.confidence} />
                  </div>
                  <input
                    id="input-area"
                    className="w-full bg-white dark:bg-slate-900 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                    type="text"
                    value={fields.area?.value || ''}
                    onChange={(e) => handleFieldChange('area', e.target.value)}
                  />
                </div>
              </div>

              {/* Reviewer Notes */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Verification Notes / Audit Remarks
                </label>
                <textarea
                  className="w-full bg-white dark:bg-slate-900 border border-[#B8D8EE] dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Record justification for field correction or verification audit..."
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
                Reset Edits
              </button>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export Digitized PDF Certificate
              </button>
            </div>

            <button
              onClick={handleApprove}
              disabled={isSaved}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer",
                isSaved
                  ? "bg-emerald-700 cursor-not-allowed"
                  : "bg-primary hover:bg-[#2DA090]"
              )}
              type="button"
            >
              <span className="material-symbols-outlined text-base">
                {isSaved ? "task_alt" : "verified"}
              </span>
              {isSaved ? "Approved & Logged to Audit Trail" : "Approve & Save Record"}
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
          khasraNumber: fields.khasraNumber?.value || '142/3A',
          khataNumber: fields.khataNumber?.value || '582',
          ownerName: fields.ownerName?.value || 'रमेश विठ्ठल पाटील',
          ownerNameEn: 'Ramesh Vitthal Patil',
          village: fields.village?.value || 'वाघोली',
          villageEn: 'Wagholi',
          tehsil: 'हवेली',
          tehsilEn: 'Haveli',
          district: 'पुणे',
          districtEn: 'Pune',
          landArea: `${fields.area?.value || '1.45'} हेक्टर`,
          landAreaEn: `${fields.area?.value || '1.45'} Hectare`,
          isForged: currentDoc.forensic.isForged,
        }}
      />
    </main>
  )
}
