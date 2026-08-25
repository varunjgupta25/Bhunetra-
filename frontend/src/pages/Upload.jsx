import React from 'react'
import { UploadForm } from '@/components/UploadForm'

export default function UploadPage() {
  return (
    <div className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-gutter py-6 md:py-8">
      {/* Page Header */}
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
            Upload scanned land records (7/12 extracts, property cards, sale deeds) directly to cloud storage and run AI-driven multilingual extraction.
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

      {/* Main Upload Form & Pipeline Status Widget */}
      <UploadForm />
    </div>
  )
}
