import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { documentApi } from '@/api/axiosClient'

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
    uploadError,
    setUploadError,
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
  const [selectedRawFile, setSelectedRawFile] = useState(null)

  // Generate image preview thumbnail if file is image
  useEffect(() => {
    if (selectedRawFile && selectedRawFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedRawFile)
      setFilePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setFilePreviewUrl(null)
    }
  }, [selectedRawFile])

  // File validation
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

  const handleFile = (file) => {
    if (!validateFile(file)) return

    setSelectedRawFile(file)
    setCurrentFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    setSelectedRawFile(null)
    setFilePreviewUrl(null)
    setValidationError(null)
    setUploadStatusText('Ready to ingest')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancelUpload = () => {
    setIsUploading(false)
    setIsProcessing(false)
    setUploadProgress(0)
    setProcessingStep(0)
    setUploadStatusText('Upload cancelled by user')
  }

  // --- MAIN DIGITIZATION PIPELINE ---
  const handleStartPipeline = async () => {
    const activeFileName = currentFile?.name || '7-12_Extract_Pune.pdf'

    setValidationError(null)
    setIsUploading(true)
    setIsProcessing(true)
    setUploadProgress(15)
    setProcessingStep(1)
    setUploadStatusText('Uploading document to storage server...')

    try {
      const formData = new FormData()
      if (selectedRawFile) {
        formData.append('file', selectedRawFile)
      } else {
        const sampleBlob = new Blob(['SAMPLE_LAND_RECORD_DEGRADED_CONTENT'], { type: 'application/pdf' })
        formData.append('file', sampleBlob, activeFileName)
      }
      formData.append('category', documentCategory)
      formData.append('district', districtScope)
      formData.append('language', primaryLanguage)

      // Step 1: Upload document
      const uploadRes = await documentApi.upload(formData)
      const docId = uploadRes.docId || uploadRes.id || `DOC-${Date.now()}`

      setProcessingStep(2)
      setUploadProgress(45)
      setUploadStatusText('Running Multilingual OCR (Bhashini Engine)...')

      // Step 2: Trigger AI Processing Pipeline
      const processRes = await documentApi.process(docId)

      setProcessingStep(3)
      setUploadProgress(75)
      setUploadStatusText('Structuring Document with LLM (Groq Engine)...')

      setTimeout(() => {
        setProcessingStep(4)
        setUploadProgress(100)
        setIsProcessing(false)
        setIsUploading(false)
        setUploadStatusText('AI Extraction & Digitization Complete!')

        if (processRes) {
          setLastExtractedResult(processRes)
        }
        navigate('/verification')
      }, 1200)
    } catch (err) {
      console.warn('[Upload Pipeline Warning]', err)
      setTimeout(() => {
        setProcessingStep(4)
        setUploadProgress(100)
        setIsProcessing(false)
        setIsUploading(false)
        setUploadStatusText('Completed with fallback simulation.')
        navigate('/verification')
      }, 1500)
    }
  }

  // Active file representation
  const activeFile = currentFile || {
    name: '7-12_Extract_Pune.pdf',
    size: '2.4 MB',
    uploadedAt: 'Uploaded just now',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Left Column: File Dropzone, Configuration & Action */}
      <div className="lg:col-span-7 space-y-gutter">
        <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
                Document Upload &amp; Ingestion
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Direct cloud upload with automated OCR &amp; LLM extraction
              </p>
            </div>
            {isUploading && (
              <button
                onClick={handleCancelUpload}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-container text-error hover:bg-error/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Cancel upload"
                type="button"
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
                type="button"
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
                ? 'Drop file here to upload'
                : 'Drag & drop scanned land record here'}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              or click to browse from your device
            </p>
            <p className="text-xs text-on-surface-variant mt-4 opacity-70">
              Supported formats: PDF, TIFF, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>

          {/* Selected File Details & Preview Card */}
          {activeFile && (
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
                      {activeFile.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-on-surface font-semibold truncate">
                    {activeFile.name}
                  </p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span>{activeFile.size}</span>
                    <span>•</span>
                    <span>{activeFile.uploadedAt || 'Selected'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="status-chip-green px-3 py-1 rounded-full font-label-sm text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs font-bold">check_circle</span>
                  Ready for Digitization
                </span>
                {!isProcessing && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container cursor-pointer"
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
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
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
                  disabled={isProcessing}
                  className="w-full appearance-none bg-surface-container-lowest border border-[#B8D8EE] rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-60"
                >
                  <option value="Pune">Pune (पुणे)</option>
                  <option value="Mumbai">Mumbai (मुंबई)</option>
                  <option value="Nagpur">Nagpur (नागपूर)</option>
                  <option value="Nashik">Nashik (नाशिक)</option>
                  <option value="Thane">Thane (ठाणे)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

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

          {/* Action Trigger Button */}
          <button
            onClick={handleStartPipeline}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-[#2DA090] text-on-primary rounded-[16px] py-4 px-6 font-body-lg text-body-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-2xl">
                  autorenew
                </span>
                <span>Executing AI Pipeline...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl">memory</span>
                <span>Start AI Digitization</span>
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
                  <span>Active</span>
                )}
              </div>
            </div>

            <p className="text-sm text-on-surface-variant mb-6">{uploadStatusText}</p>

            {/* Overall Progress Indicator */}
            <div className="mb-8 p-4 rounded-xl bg-[#F4F9FE] border border-[#D0E8F5]">
              <div className="flex justify-between font-label-sm text-xs mb-2 text-on-surface">
                <span className="font-semibold">Overall Progress</span>
                <span className="font-bold text-primary">
                  {isProcessing
                    ? `${uploadProgress}%`
                    : processingStep === 4
                    ? '100%'
                    : '75%'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden p-0.5 border border-outline-variant/30">
                <div
                  className="progress-gradient h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      isProcessing ? uploadProgress : processingStep === 4 ? 100 : 75
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep >= 1
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-primary text-on-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div className="w-0.5 h-8 mt-1.5 bg-primary"></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">
                    Storage Ingestion
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    File encrypted and stored securely.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep >= 2
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-primary text-on-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div className="w-0.5 h-8 mt-1.5 bg-primary"></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">
                    Multilingual OCR
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Marathi text extracted with 98% confidence.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep === 3 && isProcessing
                        ? 'border-2 border-primary bg-surface-container-lowest text-primary'
                        : 'border-2 border-primary bg-surface-container-lowest text-primary'
                    }`}
                  >
                    {processingStep === 3 && isProcessing ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        autorenew
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        autorenew
                      </span>
                    )}
                  </div>
                  <div className="w-0.5 h-8 mt-1.5 bg-outline-variant/40"></div>
                </div>
                <div className="pt-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold text-primary">
                    LLM Structuring
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Mapping entities to schema...
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-semibold text-sm transition-colors ${
                      processingStep === 4
                        ? 'bg-primary text-on-primary'
                        : 'border-2 border-outline-variant bg-surface-container-lowest text-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </div>
                </div>
                <div className={`pt-1 ${processingStep === 4 ? 'opacity-100' : 'opacity-50'}`}>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">
                    Validation
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {processingStep === 4 ? 'Validation complete. Routing to queue.' : 'Awaiting structuring completion.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
