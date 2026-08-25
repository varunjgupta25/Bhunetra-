import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { uploadDirectToStorage, triggerBackendProcessing } from '@/api/storageService'

const MAX_FILE_SIZE_MB = 50
const ALLOWED_EXTENSIONS = ['.pdf', '.tiff', '.tif', '.jpg', '.jpeg', '.png']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/tiff',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

export function UploadForm() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

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
    setLastExtractedResult,
    setUploadError,
    uploadError,
    resetUploadState,
  } = useAppStore()

  // Form Configuration State
  const [documentCategory, setDocumentCategory] = useState('7/12 Extract')
  const [districtScope, setDistrictScope] = useState('Pune')
  const [primaryLanguage, setPrimaryLanguage] = useState('mr')

  // UI Interactive States
  const [dragActive, setDragActive] = useState(false)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [uploadStatusText, setUploadStatusText] = useState('Ready to ingest')
  const [storageUrl, setStorageUrl] = useState(null)
  const [cancelController, setCancelController] = useState(null)

  // Generate image preview thumbnail if file is image
  useEffect(() => {
    if (currentFile?.rawFile && currentFile.rawFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(currentFile.rawFile)
      setFilePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setFilePreviewUrl(null)
    }
  }, [currentFile])

  // --- FILE VALIDATION ---
  const validateFile = (file) => {
    setValidationError(null)
    if (!file) return false

    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      const err = `File size (${sizeInMB.toFixed(1)}MB) exceeds maximum allowed limit of ${MAX_FILE_SIZE_MB}MB.`
      setValidationError(err)
      return false
    }

    const extension = '.' + file.name.split('.').pop().toLowerCase()
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension)

    if (!isValidType) {
      const err = `Unsupported file format '${extension}'. Allowed: PDF, TIFF, PNG, JPG, JPEG.`
      setValidationError(err)
      return false
    }

    return true
  }

  // --- FILE SELECTION HANDLERS ---
  const handleFile = (file) => {
    if (!validateFile(file)) return

    setCurrentFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      rawSize: file.size,
      type: file.type || 'application/pdf',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawFile: file,
    })
    setUploadStatusText('File validated & ready for storage ingestion')
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    resetUploadState()
    setFilePreviewUrl(null)
    setValidationError(null)
    setStorageUrl(null)
    setUploadStatusText('Ready to ingest')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // --- CANCEL UPLOAD ---
  const handleCancelUpload = () => {
    if (cancelController) {
      cancelController.abort()
      setCancelController(null)
    }
    setIsUploading(false)
    setIsProcessing(false)
    setUploadProgress(0)
    setProcessingStep(0)
    setUploadStatusText('Upload cancelled by user')
  }

  // --- MAIN DIGITIZATION PIPELINE: DIRECT-TO-STORAGE & BACKEND TRIGGER ---
  const handleStartPipeline = async () => {
    if (!currentFile || !currentFile.rawFile) {
      setValidationError('Please select or drop a valid document first.')
      return
    }

    setValidationError(null)
    setIsUploading(true)
    setIsProcessing(true)
    setUploadProgress(5)
    setProcessingStep(1)
    setUploadStatusText('Direct Upload to Cloud Storage in progress...')

    const controller = new AbortController()
    setCancelController(controller)

    try {
      // Step 1: Direct-to-Storage Upload (Firebase Storage / AWS S3 / Blob)
      const uploadResult = await uploadDirectToStorage(currentFile.rawFile, {
        onProgress: (progress) => {
          setUploadProgress(progress)
        },
        signal: controller.signal,
      })

      setStorageUrl(uploadResult.storageUrl)
      setUploadStatusText('Cloud Storage Upload Complete! Triggering Backend AI Pipeline...')

      // Step 2: Trigger Backend Processing API (FastAPI / Groq LLM / Bhashini OCR)
      const metadata = {
        category: documentCategory,
        district: districtScope,
        language: primaryLanguage,
      }

      const backendResult = await triggerBackendProcessing(
        uploadResult,
        metadata,
        (step) => {
          setProcessingStep(step)
          if (step === 2) setUploadStatusText('Running Multilingual OCR (Bhashini Engine)...')
          if (step === 3) setUploadStatusText('Structuring Document with LLM (Groq Engine)...')
          if (step === 4) setUploadStatusText('Validating Extraction & Confidence Scoring...')
        }
      )

      // Step 3: Pipeline Completion
      setLastExtractedResult(backendResult)
      setIsUploading(false)
      setIsProcessing(false)
      setUploadStatusText('AI Extraction & Digitization Complete!')

      // Redirect to verification view after short pause
      setTimeout(() => {
        navigate('/verification')
      }, 1200)
    } catch (err) {
      console.error('[Upload Component Error]', err)
      if (err.message !== 'Upload cancelled by user') {
        setUploadError(err.message || 'An error occurred during upload processing.')
        setUploadStatusText('Pipeline execution failed.')
      }
      setIsUploading(false)
      setIsProcessing(false)
    } finally {
      setCancelController(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Left Column: File Dropzone, Configuration & Action */}
      <div className="lg:col-span-7 space-y-gutter">
        <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
                Document Storage Ingestion
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Direct-to-cloud storage upload with automatic backend AI processing
              </p>
            </div>
            {isUploading && (
              <button
                onClick={handleCancelUpload}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-container text-error hover:bg-error/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Cancel upload"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Cancel
              </button>
            )}
          </div>

          {/* Validation Error Alert Banner */}
          {(validationError || uploadError) && (
            <div className="mb-4 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-start gap-3">
              <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 text-sm font-medium">
                {validationError || uploadError}
              </div>
              <button
                onClick={() => {
                  setValidationError(null)
                  setUploadError(null)
                }}
                className="text-error hover:opacity-75"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Drag & Drop Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 mb-6 relative group ${
              dragActive
                ? 'border-primary bg-primary-container/20 scale-[1.01]'
                : 'border-[#B8D8EE] bg-[#F4F9FE] hover:bg-surface-container hover:border-primary/60'
            } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.tiff,.tif,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              disabled={isProcessing}
            />

            <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">
                {dragActive ? 'file_download' : 'cloud_upload'}
              </span>
            </div>

            <p className="font-body-lg text-body-lg text-on-surface font-semibold">
              {dragActive
                ? 'Drop file here to upload directly'
                : 'Drag & drop scanned land record here'}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              or click to browse from your device
            </p>
            <p className="text-xs text-on-surface-variant mt-4 opacity-70">
              Supported formats: PDF, TIFF, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)
            </p>

            {/* Cloud Storage Tag */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-highest/80 text-xs font-label-sm text-secondary flex items-center gap-1 border border-outline-variant/30">
              <span className="material-symbols-outlined text-xs">cloud_done</span>
              Cloud Direct-Upload
            </div>
          </div>

          {/* Selected File Details & Preview Card */}
          {currentFile && (
            <div className="border border-[#D0E8F5] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-container-lowest mb-6 gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {filePreviewUrl ? (
                  <img
                    src={filePreviewUrl}
                    alt="Document Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-outline-variant shrink-0"
                  />
                ) : (
                  <div className="p-3 bg-secondary-container rounded-lg shrink-0">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      {currentFile.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-on-surface font-semibold truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span>{currentFile.size}</span>
                    <span>•</span>
                    <span>{currentFile.uploadedAt || 'Selected'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="status-chip-green px-3 py-1 rounded-full font-label-sm text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs font-bold">check_circle</span>
                  {storageUrl ? 'Cloud Uploaded' : 'Validated'}
                </span>
                {!isProcessing && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container"
                    type="button"
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Configuration Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Category */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2">
                Document Category
              </label>
              <div className="relative">
                <select
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  disabled={isProcessing}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-60"
                >
                  <option value="7/12 Extract">7/12 Extract (७/१२ उतारा)</option>
                  <option value="Property Card">Property Card (मालमत्ता पत्रक)</option>
                  <option value="Sale Deed">Sale Deed (खरेदीखत)</option>
                  <option value="Mutation Register">Mutation Register (फेरीपत्रक)</option>
                  <option value="Hakka Patrika">Hakka Patrika (हक्कपत्रक)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* District Scope */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2">
                District Scope
              </label>
              <div className="relative">
                <select
                  value={districtScope}
                  onChange={(e) => setDistrictScope(e.target.value)}
                  disabled={isProcessing}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-60"
                >
                  <option value="Pune">Pune (पुणे)</option>
                  <option value="Mumbai">Mumbai (मुंबई)</option>
                  <option value="Nagpur">Nagpur (नागपूर)</option>
                  <option value="Nashik">Nashik (नाशिक)</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                  <option value="Thane">Thane (ठाणे)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Primary Script / Language */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2">
                Primary Language / OCR
              </label>
              <div className="relative">
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  disabled={isProcessing}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-60"
                >
                  <option value="mr">Marathi (मराठी Devanagari)</option>
                  <option value="en">English (Roman)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Direct Storage Cloud & Backend Integration Instructions Note */}
          <div className="p-3.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/40 mb-6 text-xs text-on-surface-variant flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
              code
            </span>
            <div>
              <span className="font-semibold text-on-surface">Integration Slot Ready: </span>
              Direct-to-storage cloud upload handler (`uploadDirectToStorage`) and backend API trigger (`triggerBackendProcessing`) are fully wired with modular hooks in `src/api/storageService.js`.
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleStartPipeline}
            disabled={isProcessing || !currentFile}
            className="w-full bg-primary hover:bg-[#2DA090] text-on-primary rounded-[16px] py-4 px-6 font-body-lg text-body-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-2xl">
                  autorenew
                </span>
                <span>Executing Ingestion & AI Pipeline...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                <span>Upload to Cloud & Start AI Extraction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Processing Pipeline Status Widget */}
      <div className="lg:col-span-5">
        <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5] h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
                Pipeline Live Status
              </h2>
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isProcessing
                    ? 'bg-primary-container text-primary border border-primary/30'
                    : processingStep === 4
                    ? 'bg-success-container text-success border border-success/30'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    <span>Processing</span>
                  </>
                ) : processingStep === 4 ? (
                  <>
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Done</span>
                  </>
                ) : (
                  <span>Idle</span>
                )}
              </div>
            </div>

            <p className="text-sm text-on-surface-variant mb-6">{uploadStatusText}</p>

            {/* Overall Progress Indicator */}
            <div className="mb-8 p-4 rounded-xl bg-[#F4F9FE] border border-[#D0E8F5]">
              <div className="flex justify-between font-label-sm text-xs mb-2 text-on-surface">
                <span className="font-semibold">Pipeline Execution Progress</span>
                <span className="font-bold text-primary">
                  {isProcessing
                    ? `${uploadProgress}%`
                    : processingStep === 4
                    ? '100%'
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden p-0.5 border border-outline-variant/30">
                <div
                  className="progress-gradient h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      isProcessing ? uploadProgress : processingStep === 4 ? 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="space-y-6">
              {/* Step 1: Direct Storage Upload */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep >= 1
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border-2 border-outline-variant bg-surface-container-lowest text-outline-variant'
                    }`}
                  >
                    {processingStep > 1 ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : processingStep === 1 ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        autorenew
                      </span>
                    ) : (
                      '1'
                    )}
                  </div>
                  <div
                    className={`w-0.5 h-8 mt-1.5 transition-colors ${
                      processingStep > 1 ? 'bg-primary' : 'bg-outline-variant/40'
                    }`}
                  ></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-2">
                    <span>Direct Storage Ingestion</span>
                    {processingStep === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-container text-primary font-medium">
                        Uploading...
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    File uploaded directly to cloud storage bucket (Firebase / S3).
                  </p>
                </div>
              </div>

              {/* Step 2: Multilingual OCR */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep >= 2
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border-2 border-outline-variant bg-surface-container-lowest text-outline-variant'
                    }`}
                  >
                    {processingStep > 2 ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : processingStep === 2 ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        autorenew
                      </span>
                    ) : (
                      '2'
                    )}
                  </div>
                  <div
                    className={`w-0.5 h-8 mt-1.5 transition-colors ${
                      processingStep > 2 ? 'bg-primary' : 'bg-outline-variant/40'
                    }`}
                  ></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-2">
                    <span>Multilingual OCR (Bhashini)</span>
                    {processingStep === 2 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-container text-primary font-medium">
                        Extracting Text
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Devanagari script extracted with layout preservation.
                  </p>
                </div>
              </div>

              {/* Step 3: LLM Structuring */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep >= 3
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border-2 border-outline-variant bg-surface-container-lowest text-outline-variant'
                    }`}
                  >
                    {processingStep > 3 ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : processingStep === 3 ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        autorenew
                      </span>
                    ) : (
                      '3'
                    )}
                  </div>
                  <div
                    className={`w-0.5 h-8 mt-1.5 transition-colors ${
                      processingStep > 3 ? 'bg-primary' : 'bg-outline-variant/40'
                    }`}
                  ></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold flex items-center gap-2">
                    <span>LLM Entity Structuring</span>
                    {processingStep === 3 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-container text-primary font-medium">
                        Groq AI Mapping
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Mapping entities to standardized land schema JSON.
                  </p>
                </div>
              </div>

              {/* Step 4: Verification & Routing */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep === 4
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border-2 border-outline-variant bg-surface-container-lowest text-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">
                    Validation & Queue Routing
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Confidence threshold evaluation & officer routing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Footer */}
          <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield</span>
              256-bit Encrypted Storage
            </span>
            <span className="font-mono">v1.2.0-cloud-pipeline</span>
          </div>
        </div>
      </div>
    </div>
  )
}
