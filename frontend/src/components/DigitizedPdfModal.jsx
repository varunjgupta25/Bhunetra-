/**
 * DigitizedPdfModal.jsx
 * ─────────────────────────────────────────────────────────────────
 * BHUNETRA — "Download Official Land Record PDF" modal
 *
 * Entry points:
 *   • CitizenPortal.jsx  → verified / forged record
 *   • Verification.jsx   → OCR-corrected record
 *
 * Props (API unchanged):
 *   isOpen          {boolean}
 *   onClose         {() => void}
 *   recordData      {Object}
 *   onConfirmExport {(langCode: string) => void}  optional
 *
 * Language state is owned here. When selectedLanguage changes:
 *   → preview labels re-render immediately via t(key, selectedLanguage)
 *   → download uses the same selectedLanguage
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { CONSTITUTION_22_LANGUAGES } from '@/utils/languages'
import {
  generateLandRecordPdf,
  buildLandRecordPdfData,
  validateRecordForPdf,
} from '@/utils/pdfGenerator'
import { t } from '@/utils/pdfTranslations'

// ─── Constants ────────────────────────────────────────────────────

const FEATURED_LANGUAGES = [
  { code: 'mr', name: 'मराठी (Marathi)',      icon: '🚩' },
  { code: 'en', name: 'English (English)',     icon: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी (Hindi)',         icon: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)',    icon: '🏛️' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)',       icon: '🏛️' },
  { code: 'ta', name: 'தமிழ் (Tamil)',          icon: '🏛️' },
  { code: 'te', name: 'తెలుగు (Telugu)',        icon: '🏛️' },
  { code: 'bn', name: 'বাংলা (Bengali)',        icon: '🇧🇩' },
]

const DASH = '—'

// ─── Sub-components ───────────────────────────────────────────────

/** Single preview field row — hides rows where value is DASH */
function PreviewField({ label, value, highlight }) {
  if (!value || value === DASH) return null
  return (
    <div className={`flex gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0 ${
      highlight ? 'bg-amber-50/60 -mx-2 px-2 rounded' : ''
    }`}>
      <span className="text-gray-500 shrink-0 w-40 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold break-words flex-1">{value}</span>
    </div>
  )
}

/** Section heading band */
function PreviewSection({ title, children }) {
  return (
    <div className="mb-4">
      <div className="bg-[#0F2C59] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">
        {title}
      </div>
      <div className="px-1">{children}</div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────

export function DigitizedPdfModal({ isOpen, onClose, recordData, onConfirmExport }) {
  const globalLanguage = useAppStore((state) => state.currentLanguage) || 'mr'
  const [selectedLanguage, setSelectedLanguage] = useState(globalLanguage)
  const [step, setStep] = useState('pick')           // 'pick' | 'preview'
  const [dlState, setDlState] = useState('idle')     // 'idle' | 'generating' | 'done' | 'error'
  const [dlError, setDlError]  = useState(null)

  const modalRef = useRef(null)
  const closeRef = useRef(null)
  const previewCardRef = useRef(null)

  // ── Reset on open ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep('pick')
      setDlState('idle')
      setDlError(null)
      setSelectedLanguage(globalLanguage || 'mr')
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [isOpen, globalLanguage])

  // ── ESC closes ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Record computation (above early return, not hooks) ───────────
  const record     = recordData || {}
  const validation = validateRecordForPdf(record)
  const rawStatus  = record.status || record.verificationStatus || ''
  const isForged   = !!record.isForged

  const VERIFIED_STATUSES = new Set(['VERIFIED', 'verified', 'auto-approved', 'approved'])
  const isVerified  = VERIFIED_STATUSES.has(rawStatus) && !isForged
  const isPending   = !VERIFIED_STATUSES.has(rawStatus) && !isForged

  // ── Handlers (all useCallback above early return) ─────────────────
  const handleGoToPreview = useCallback(() => setStep('preview'), [])
  const handleBackToPick  = useCallback(() => {
    setStep('pick')
    setDlState('idle')
    setDlError(null)
  }, [])
  const handleRetry = useCallback(() => {
    setDlState('idle')
    setDlError(null)
  }, [])

  const handleDownload = useCallback(async () => {
    if (dlState === 'generating' || dlState === 'done') return
    setDlState('generating')
    setDlError(null)
    try {
      await generateLandRecordPdf(record, {
        language: selectedLanguage,
        previewElement: previewCardRef.current,
      })
      setDlState('done')
      if (onConfirmExport) onConfirmExport(selectedLanguage)
    } catch (err) {
      console.error('[PDF Generation Error]', err)
      setDlState('error')
      setDlError('Unable to generate the PDF. Please try again.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, selectedLanguage, dlState, onConfirmExport])

  // ── Early return AFTER all hooks ─────────────────────────────────
  if (!isOpen) return null

  // ── Derived (not hooks) ──────────────────────────────────────────
  // pdfData re-computes every render → whenever selectedLanguage changes,
  // the component re-renders and pd immediately uses the new language.
  const pd = validation.valid ? buildLandRecordPdfData(record, selectedLanguage) : null

  // Shorthand translator for UI strings (modal chrome, preview labels)
  const T = (key) => t(key, selectedLanguage)

  const downloadDisabled = dlState === 'generating' || dlState === 'done' || !validation.valid

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={T('modalTitle')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={modalRef}
        className="bg-white border border-[#D0E8F5] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* ── Modal Header ──────────────────────────────────────── */}
        <div className="bg-[#0D2B40] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl" aria-hidden="true">
              picture_as_pdf
            </span>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {step === 'pick' ? T('modalTitle') : T('modalPreviewTitle')}
              </h2>
              <p className="text-xs text-white/60 mt-0.5">{T('modalSubtitle')}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            type="button"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* ── Insufficient data ──────────────────────────────────── */}
        {!validation.valid && (
          <div className="p-8 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-slate-300" aria-hidden="true">description</span>
            <h3 className="text-base font-bold text-slate-800">Insufficient Record Data</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">{validation.reason}</p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              type="button"
            >
              Close
            </button>
          </div>
        )}

        {/* ── Status warning banner ─────────────────────────────── */}
        {validation.valid && (isPending || isForged) && (
          <div className={`mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
            isForged
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}>
            <span className="material-symbols-outlined text-base mt-0.5 shrink-0" aria-hidden="true">
              {isForged ? 'gpp_bad' : 'warning'}
            </span>
            <span>
              {isForged
                ? 'This document is flagged as UNAUTHORIZED / FORGED. The PDF will clearly mark it as non-official.'
                : 'This record is PENDING verification. The PDF will be watermarked as non-official.'}
            </span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 1 — LANGUAGE SELECTION
        ════════════════════════════════════════════════════════ */}
        {validation.valid && step === 'pick' && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <p className="text-sm text-slate-600">
              Select any of the <strong>22 Official Constitutional Languages of India (8th Schedule)</strong>{' '}
              below. The PDF preview and downloaded file will use your chosen language.
            </p>

            {/* Full dropdown (all 22 languages) */}
            <div className="bg-slate-50 border border-[#B8D8EE] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label
                htmlFor="pdf-lang-select"
                className="text-xs font-bold text-slate-700 flex items-center gap-2 shrink-0"
              >
                <span aria-hidden="true">📜</span>
                Certificate Language:
              </label>
              <select
                id="pdf-lang-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white text-slate-900 text-sm font-bold border-2 border-[#0F2C59]/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] cursor-pointer w-full sm:w-auto"
              >
                {CONSTITUTION_22_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.icon} {lang.nameNative} — {lang.nameEn} ({lang.script} Script)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick language buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FEATURED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLanguage(l.code)}
                  type="button"
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedLanguage === l.code
                      ? 'border-[#0F2C59] bg-[#0F2C59]/10 text-[#0F2C59] shadow-sm ring-2 ring-[#0F2C59]/30'
                      : 'border-[#B8D8EE] bg-white text-slate-700 hover:border-[#0F2C59]/40'
                  }`}
                  aria-pressed={selectedLanguage === l.code}
                >
                  <span className="text-base block mb-1" aria-hidden="true">{l.icon}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>

            {/* Preview of selected language label */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">translate</span>
              <span>
                Selected: <strong>{
                  CONSTITUTION_22_LANGUAGES.find(l => l.code === selectedLanguage)?.nameNative
                } ({
                  CONSTITUTION_22_LANGUAGES.find(l => l.code === selectedLanguage)?.nameEn
                })</strong> — document title will read: <em>{T('docTitle')}</em>
              </span>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToPreview}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#163A72] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">visibility</span>
                Preview Document
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 2 — DOCUMENT PREVIEW + DOWNLOAD
        ════════════════════════════════════════════════════════ */}
        {validation.valid && step === 'preview' && pd && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">

            {/* ── Toolbar ──────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-slate-50 border border-[#D0E8F5] p-3 rounded-2xl flex-wrap gap-3">
              <button
                onClick={handleBackToPick}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                type="button"
                aria-label="Back to language selection"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                Change Language
              </button>

              {/* Current language indicator */}
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#0F2C59]/10 px-3 py-1 rounded-full">
                {CONSTITUTION_22_LANGUAGES.find(l => l.code === selectedLanguage)?.nameNative || selectedLanguage.toUpperCase()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#B8D8EE] text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  type="button"
                  aria-label="Print document"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">print</span>
                  Print
                </button>

                <button
                  onClick={dlState === 'error' ? handleRetry : handleDownload}
                  disabled={downloadDisabled && dlState !== 'error'}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                    downloadDisabled && dlState !== 'error'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : dlState === 'done'
                      ? 'bg-emerald-600 text-white'
                      : dlState === 'error'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                  type="button"
                  aria-busy={dlState === 'generating'}
                >
                  {dlState === 'generating' ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">autorenew</span>
                      <span>Generating PDF…</span>
                    </>
                  ) : dlState === 'done' ? (
                    <>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
                      <span>Downloaded!</span>
                    </>
                  ) : dlState === 'error' ? (
                    <>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
                      <span>Retry Download</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feedback banners */}
            {dlState === 'done' && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
                Land record PDF downloaded successfully.
              </div>
            )}
            {dlState === 'error' && dlError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold px-4 py-2.5 rounded-xl"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                {dlError}
              </div>
            )}

            {/* ── Document Preview Card ───────────────────────── */}
            {/* NOTE: Every label below uses T(key) so it updates immediately
                when selectedLanguage changes — no stale English labels. */}
            <div
              ref={previewCardRef}
              id="bhunetra-pdf-preview"
              className={`bg-white border-2 rounded-2xl shadow-sm overflow-hidden ${
                pd.isForged   ? 'border-red-400'
                : pd.isVerified ? 'border-[#0F2C59]/30'
                :                 'border-amber-400'
              }`}
              aria-label="Document preview"
            >
              {/* Header */}
              <div className="bg-[#0F2C59] text-white px-5 py-4 text-center">
                <div className="text-xs font-bold tracking-widest text-amber-400 mb-1">BHUNETRA</div>
                <div className="text-[10px] text-white/60 mb-2 uppercase tracking-wider">
                  {T('previewSystem')}
                </div>
                <div className="text-sm font-extrabold tracking-tight">{T('previewHeader')}</div>
                <div className="text-[10px] text-white/50 mt-1">{T('previewSubtitle')}</div>
              </div>

              {/* Status strip */}
              <div className={`text-center py-1.5 text-[10px] font-extrabold tracking-widest uppercase ${
                pd.isForged    ? 'bg-red-600 text-white'
                : pd.isVerified  ? 'bg-emerald-600 text-white'
                :                  'bg-amber-500 text-slate-950'
              }`}>
                {pd.isForged
                  ? `🚨 ${T('statusForged')}`
                  : pd.isVerified
                  ? `✔ ${T('statusVerified')}`
                  : `⚠ ${T('statusPending')}`}
              </div>

              {/* Meta row */}
              <div className="flex justify-between items-center px-5 py-2 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-mono">
                <span>{T('previewRecordId')} <strong className="text-slate-800">{pd.recordId}</strong></span>
                <span>{T('previewGenerated')} <strong className="text-slate-800">{pd.generatedAt}</strong></span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-1 text-sm">

                {/* Section 1 — Land Identification */}
                <PreviewSection title={T('sec1')}>
                  <PreviewField label={T('fldSurveyNo')}    value={pd.khasraNumber} />
                  <PreviewField label={T('fldHissaNo')}     value={pd.hissaNumber} />
                  <PreviewField label={T('fldKhataNo')}     value={pd.khataNumber} />
                  <PreviewField label={T('fldPlotNo')}      value={pd.plotNumber} />
                  <PreviewField label={T('fldVillageCode')} value={pd.villageCode} />
                  <PreviewField label={T('fldVillage')}     value={pd.village} />
                  <PreviewField label={T('fldTehsil')}      value={pd.tehsil} />
                  <PreviewField label={T('fldDistrict')}    value={pd.district} />
                </PreviewSection>

                {/* Section 2 — Land Details */}
                <PreviewSection title={T('sec2')}>
                  <PreviewField label={T('fldArea')}            value={pd.landArea} />
                  <PreviewField label={T('fldAssessment')}      value={pd.assessment} />
                  <PreviewField label={T('fldLandClass')}       value={pd.landClassification} />
                  <PreviewField label={T('fldLandType')}        value={pd.landType} />
                  <PreviewField label={T('fldOwnershipType')}   value={pd.ownershipType} />
                </PreviewSection>

                {/* Section 3 — Ownership */}
                <PreviewSection title={T('sec3')}>
                  <PreviewField
                    label={T('fldOwnerName')}
                    value={pd.ownerName}
                    highlight={pd.isForged}
                  />
                  <PreviewField label={T('fldEncumbrance')} value={pd.encumbrance} />
                </PreviewSection>

                {/* Section 4 — Mutation (conditional) */}
                {(pd.mutationNumber !== DASH || pd.mutationDate !== DASH || pd.registrationInfo !== DASH) && (
                  <PreviewSection title={T('sec4')}>
                    <PreviewField label={T('fldMutationNo')}       value={pd.mutationNumber} />
                    <PreviewField label={T('fldMutationDate')}     value={pd.mutationDate} />
                    <PreviewField label={T('fldRegistrationInfo')} value={pd.registrationInfo} />
                  </PreviewSection>
                )}

                {/* Section 5 — Validation Summary */}
                <PreviewSection title={T('sec5')}>
                  <PreviewField label={T('fldConfidence')}   value={pd.confidence} />
                  <PreviewField label={T('fldVerifStatus')}  value={pd.statusLabel} />
                  <PreviewField label={T('fldSystem')}       value={T('fldSystem2')} />
                </PreviewSection>

                {/* Signature row */}
                <div className="flex justify-between items-end pt-3 mt-3 border-t border-gray-200">
                  <div className="text-[10px] text-gray-500 font-mono">
                    <div>{T('previewSysRef')} 712MV-{pd.recordId}-BHUNETRA</div>
                    <div className="mt-0.5 text-[9px]">{T('previewNote')}</div>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-2 text-right bg-gray-50 min-w-[140px]">
                    <div className="text-[10px] font-bold text-gray-800">{T('previewSigTitle')}</div>
                    <div className="text-[9px] text-gray-600">{T('previewSigRole')}</div>
                    <div className={`text-[9px] font-bold mt-0.5 ${pd.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {pd.isVerified ? T('previewSigVerified') : T('previewSigPending')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isPending && !isForged && (
              <p className="text-[10px] text-amber-700 text-center font-medium">
                {T('statusPending')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DigitizedPdfModal
