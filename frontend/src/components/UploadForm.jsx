import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function UploadForm() {
  const navigate = useNavigate()
  const {
    currentFile,
    setCurrentFile,
    isUploading,
    setIsUploading,
    isProcessing,
    setIsProcessing,
    processingStep,
    setProcessingStep,
    uploadProgress,
    setUploadProgress,
  } = useAppStore()

  const [documentCategory, setDocumentCategory] = useState('7/12 Extract')
  const [districtScope, setDistrictScope] = useState('Pune')
  const [dragActive, setDragActive] = useState(false)

  // Default file state simulation
  const activeFile = currentFile || {
    name: '7-12_Extract_Pune.pdf',
    size: '2.4 MB',
    uploadedAt: 'Uploaded just now',
  }

  const handleStartDigitization = () => {
    setIsProcessing(true)
    setIsUploading(true)
    setProcessingStep(1)
    setUploadProgress(25)

    setTimeout(() => {
      setProcessingStep(2)
      setUploadProgress(50)
    }, 1000)

    setTimeout(() => {
      setProcessingStep(3)
      setUploadProgress(75)
    }, 2000)

    setTimeout(() => {
      setProcessingStep(4)
      setUploadProgress(100)
      setIsProcessing(false)
      setIsUploading(false)
      navigate('/verification')
    }, 3200)
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCurrentFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: 'Uploaded just now',
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Left Column: Upload & Configuration */}
      <div className="lg:col-span-7 space-y-gutter">
        <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5]">
          <h2 className="font-headline-md text-headline-md text-[#0D2B40] mb-4">
            Document Upload
          </h2>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0]
                setCurrentFile({
                  name: file.name,
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  uploadedAt: 'Uploaded just now',
                })
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-6 group ${
              dragActive
                ? 'border-primary bg-surface-container'
                : 'border-[#B8D8EE] bg-[#F4F9FE] hover:bg-surface-container'
            }`}
          >
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.tiff,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="cloud_upload">
                  cloud_upload
                </span>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                Drag &amp; drop scanned land record here
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                or click to browse from device
              </p>
              <p className="text-xs text-on-surface-variant mt-4 opacity-70">
                Supported formats: PDF, TIFF, JPG (Max 50MB)
              </p>
            </label>
          </div>

          {/* Post-Upload File Card State */}
          <div className="border border-[#D0E8F5] rounded-xl p-4 flex items-center justify-between bg-surface-container-lowest mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-secondary-container rounded-lg">
                <span className="material-symbols-outlined text-secondary" data-icon="description">
                  description
                </span>
              </div>
              <div>
                <p className="font-body-md text-body-md text-on-surface font-semibold">
                  {activeFile.name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {activeFile.size} · {activeFile.uploadedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="status-chip-green px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-sm"
                  data-icon="check_circle"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Ready for Digitization
              </span>
              <button
                onClick={() => setCurrentFile(null)}
                className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container"
                type="button"
                title="Remove file"
              >
                <span className="material-symbols-outlined" data-icon="delete">
                  delete
                </span>
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2">
                Document Category
              </label>
              <div className="relative">
                <select
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="7/12 Extract">7/12 Extract</option>
                  <option value="Property Card">Property Card</option>
                  <option value="Sale Deed">Sale Deed</option>
                </select>
                <span
                  className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  data-icon="arrow_drop_down"
                >
                  arrow_drop_down
                </span>
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2">
                District Scope
              </label>
              <div className="relative">
                <select
                  value={districtScope}
                  onChange={(e) => setDistrictScope(e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Nagpur">Nagpur</option>
                </select>
                <span
                  className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  data-icon="arrow_drop_down"
                >
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartDigitization}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-[#2DA090] text-on-primary rounded-[16px] py-4 px-6 font-body-lg text-body-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60"
            type="button"
          >
            <span className="material-symbols-outlined" data-icon="memory">
              memory
            </span>
            {isProcessing ? 'Processing AI Pipeline...' : 'Start AI Digitization'}
          </button>
        </div>
      </div>

      {/* Right Column: Processing State */}
      <div className="lg:col-span-5">
        <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5] h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
              Pipeline Status
            </h2>
            <div className="animate-pulse flex items-center gap-2 text-primary">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-label-sm text-label-sm">Active</span>
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            Intelligent Extraction Pipeline Active
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between font-label-sm text-label-sm mb-2 text-on-surface">
              <span>Overall Progress</span>
              <span className="font-bold">
                {isProcessing ? `${uploadProgress}%` : '75%'}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
              <div
                className="progress-gradient h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${isProcessing ? uploadProgress : 75}%` }}
              ></div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="space-y-6 flex-1">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 z-10">
                  <span className="material-symbols-outlined text-sm" data-icon="check">
                    check
                  </span>
                </div>
                <div className="w-0.5 h-full bg-primary mt-2"></div>
              </div>
              <div className="pb-2">
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                  Storage Ingestion
                </p>
                <p className="text-sm text-on-surface-variant">File encrypted and stored securely.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 z-10">
                  <span className="material-symbols-outlined text-sm" data-icon="check">
                    check
                  </span>
                </div>
                <div className="w-0.5 h-full bg-primary mt-2"></div>
              </div>
              <div className="pb-2">
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                  Multilingual OCR
                </p>
                <p className="text-sm text-on-surface-variant">Marathi text extracted with 98% confidence.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                    processingStep === 3 || !isProcessing
                      ? 'border-primary bg-surface-container-lowest text-primary'
                      : 'border-primary bg-primary text-on-primary'
                  }`}
                >
                  {processingStep === 3 && isProcessing ? (
                    <span className="material-symbols-outlined text-sm animate-spin" data-icon="autorenew">
                      autorenew
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm" data-icon="check">
                      check
                    </span>
                  )}
                </div>
                <div className="w-0.5 h-full bg-outline-variant mt-2"></div>
              </div>
              <div className="pb-2">
                <p className="font-body-lg text-body-lg text-on-surface font-semibold text-primary">
                  LLM Structuring
                </p>
                <p className="text-sm text-on-surface-variant">Mapping entities to schema...</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                    processingStep === 4
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container-lowest text-outline-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" data-icon="verified">
                    verified
                  </span>
                </div>
              </div>
              <div className={`pb-2 ${processingStep === 4 ? 'opacity-100' : 'opacity-50'}`}>
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                  Validation
                </p>
                <p className="text-sm text-on-surface-variant">
                  {processingStep === 4 ? 'Validation complete. Routing to queue.' : 'Awaiting structuring completion.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
