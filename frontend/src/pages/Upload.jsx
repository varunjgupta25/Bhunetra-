import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UploadForm } from '@/components/UploadForm'
import {
  DocumentTypeSelector,
  getDocumentTypeLabel,
  getDocumentTypeDescription,
  getDocumentTypeIcon,
} from '@/components/DocumentTypeSelector'

// ─── Step progress bar ───────────────────────────────────────────────────────
const STEPS = [
  { label: 'Document Type', icon: 'article' },
  { label: 'Upload', icon: 'cloud_upload' },
  { label: 'Processing', icon: 'psychology' },
  { label: 'Validation', icon: 'verified' },
]

function StepProgressBar({ activeStep }) {
  return (
    <nav aria-label="Upload progress steps" className="mb-6 md:mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < activeStep
          const isActive = stepNum === activeStep
          const isUpcoming = stepNum > activeStep

          return (
            <React.Fragment key={step.label}>
              <li
                className="flex flex-col items-center"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Circle */}
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 border-2
                    ${isCompleted
                      ? 'bg-primary border-primary text-on-primary'
                      : isActive
                      ? 'bg-primary-container/40 border-primary text-primary shadow-sm shadow-primary/30'
                      : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'}
                  `}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className={`material-symbols-outlined text-base ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {step.icon}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={`mt-1.5 text-[11px] font-medium text-center hidden sm:block whitespace-nowrap transition-colors duration-200 ${
                    isActive ? 'text-primary font-semibold' : isCompleted ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`
                    h-0.5 flex-1 mx-1 sm:mx-2 mt-[-18px] sm:mt-[-22px] transition-all duration-500
                    ${isCompleted ? 'bg-primary' : 'bg-outline-variant/50'}
                  `}
                />
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── Selected document type banner (shown above UploadForm) ──────────────────
function SelectedTypeBanner({ documentType, onChangeType }) {
  const label = getDocumentTypeLabel(documentType)
  const desc  = getDocumentTypeDescription(documentType)
  const icon  = getDocumentTypeIcon(documentType)

  return (
    <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5] mb-gutter">
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-container/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-0.5">
              Selected Document
            </p>
            <p className="font-semibold text-[#0D2B40] text-[16px] leading-tight">{label}</p>
            <p className="text-sm text-on-surface-variant mt-0.5">{desc}</p>
          </div>
        </div>
        <button
          id="change-document-type-btn"
          type="button"
          onClick={onChangeType}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#B8D8EE] bg-surface-container-low text-on-surface-variant text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary-container/20 transition-all duration-200 cursor-pointer shrink-0"
          aria-label="Go back and change the selected document type"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Change
        </button>
      </div>
    </div>
  )
}

// ─── AI Detection notice (shown after type selection) ───────────────────────
function AiDetectionNotice({ documentType }) {
  const label = getDocumentTypeLabel(documentType)
  return (
    <div className="mt-gutter p-4 rounded-xl bg-[#F4F9FE] border border-[#D0E8F5] flex items-start gap-3">
      <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">smart_toy</span>
      <div>
        <p className="text-sm font-semibold text-[#0D2B40]">
          🤖 Document Type
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          You selected: <span className="font-semibold text-[#0D2B40]">{label}</span>
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          Bhunetra will analyze the uploaded document and verify whether it matches
          the selected document type.
        </p>
      </div>
    </div>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function UploadPage() {
  const { documentType, setDocumentType } = useAppStore()

  // uploadStep: 1 = document-type selection, 2 = upload form
  const [uploadStep, setUploadStep] = useState(documentType ? 2 : 1)
  const [docTypeError, setDocTypeError] = useState(null)

  // Local selection before committing to store (for validation UX)
  const [localSelectedType, setLocalSelectedType] = useState(documentType)

  const handleSelectType = (value) => {
    setLocalSelectedType(value)
    setDocTypeError(null)
  }

  const handleContinue = () => {
    if (!localSelectedType) {
      setDocTypeError('Please select a document type before continuing.')
      return
    }
    setDocTypeError(null)
    setDocumentType(localSelectedType)
    setUploadStep(2)
  }

  const handleChangeType = () => {
    // Return to step 1; keep the current selection pre-filled
    setUploadStep(1)
    setLocalSelectedType(documentType)
  }

  return (
    <div className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-gutter py-6 md:py-8">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-container-margin flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-secondary text-xs font-label-sm mb-3 border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-primary">cloud_upload</span>
            <span>Module 1</span>
            <span>·</span>
            <span>Ingestion Pipeline</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Land Record Storage Ingestion &amp; Digitization
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            {uploadStep === 1
              ? 'First, identify the document type. This helps Bhunetra apply the correct OCR and validation schema.'
              : 'Upload scanned land records directly to cloud storage and run AI-driven multilingual extraction.'}
          </p>
        </div>

        {/* System Capabilities Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-[#D0E8F5] text-xs text-on-surface-variant font-medium flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-primary">cloud</span>
            Direct Cloud Storage
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-[#D0E8F5] text-xs text-on-surface-variant font-medium flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-primary">translate</span>
            Bhashini OCR (Marathi)
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-[#D0E8F5] text-xs text-on-surface-variant font-medium flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-primary">psychology</span>
            Groq Llama-3 LLM
          </span>
        </div>
      </div>

      {/* ── Step Progress Bar ────────────────────────────────────────── */}
      <StepProgressBar activeStep={uploadStep} />

      {/* ── Step 1: Document Type Selector ──────────────────────────── */}
      {uploadStep === 1 && (
        <DocumentTypeSelector
          selectedType={localSelectedType}
          onSelect={handleSelectType}
          onContinue={handleContinue}
          validationError={docTypeError}
        />
      )}

      {/* ── Step 2: Upload Form ──────────────────────────────────────── */}
      {uploadStep === 2 && documentType && (
        <div>
          {/* Selected type banner with "Change" button */}
          <SelectedTypeBanner documentType={documentType} onChangeType={handleChangeType} />

          {/* Existing Upload Form — unchanged, receives documentType as prop */}
          <UploadForm documentType={documentType} />

          {/* AI Detection notice */}
          <AiDetectionNotice documentType={documentType} />
        </div>
      )}
    </div>
  )
}
