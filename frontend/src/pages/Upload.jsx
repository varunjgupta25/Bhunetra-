import React from 'react'
import { UploadForm } from '@/components/UploadForm'

export default function UploadPage() {
  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-gutter py-6 md:py-8">
      {/* Page Header */}
      <div className="mb-container-margin">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-secondary text-sm font-label-sm mb-3">
          <span>Module 1</span>
          <span>·</span>
          <span>Ingestion Pipeline</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Land Record Digitization &amp; Validation
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
          Upload scanned land records or legal documents to initiate the AI-driven extraction and structuring pipeline.
        </p>
      </div>

      {/* Main Upload Form & Pipeline Widget */}
      <UploadForm />
    </div>
  )
}
