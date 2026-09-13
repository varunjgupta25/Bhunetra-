import { documentApi } from './axiosClient'
import { isFirebaseConfigured, uploadFileToFirebase } from '../firebase'

/**
 * Storage & Backend Processing Pipeline Helper
 * 
 * Flow:
 * 1. Direct-to-Storage Upload: Upload file directly to Firebase Storage / AWS S3 presigned URL
 * 2. Backend Processing API Trigger: Send file metadata & storage URL to backend FastAPI processing pipeline
 */

/**
 * Direct-to-Cloud Storage Upload Abstraction
 * 
 * @param {File} file - File object selected by user
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback (0 - 100)
 * @param {AbortSignal} [options.signal] - Abort signal to cancel upload
 * @returns {Promise<{ storageUrl: string, storagePath: string, fileId: string }>}
 */
export async function uploadDirectToStorage(file, { onProgress, signal } = {}) {
  console.info('[StorageService] Initiating direct-to-storage upload for:', file.name)

  const mockFileId = `FILE-${Date.now().toString(36).toUpperCase()}`
  const storagePath = `land-records/${mockFileId}/${file.name}`

  // 1. Live Firebase Storage Upload if configured
  if (isFirebaseConfigured) {
    try {
      const { downloadUrl } = await uploadFileToFirebase(file, storagePath, onProgress)
      return {
        storageUrl: downloadUrl,
        storagePath,
        fileId: mockFileId,
        fileSize: file.size,
        fileName: file.name,
        fileType: file.type,
      }
    } catch (err) {
      console.warn('[StorageService] Firebase Storage upload error, falling back to local flow:', err)
    }
  }

  // 2. Mock storage upload simulation with smooth progress feedback
  const totalChunks = 20
  for (let step = 1; step <= totalChunks; step++) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled by user')
    }
    await new Promise((r) => setTimeout(r, 60))
    const progress = Math.round((step / totalChunks) * 100)
    if (onProgress) onProgress(progress)
  }

  const mockStorageUrl = `https://storage.bhunetra.gov.in/documents/${mockFileId}/${encodeURIComponent(file.name)}`

  return {
    storageUrl: mockStorageUrl,
    storagePath,
    fileId: mockFileId,
    fileSize: file.size,
    fileName: file.name,
    fileType: file.type,
  }
}

/**
 * Triggers backend processing API after cloud upload completes
 * 
 * @param {Object} uploadResult - Output from uploadDirectToStorage
 * @param {Object} metadata - Form metadata (category, district, language)
 * @param {Function} onStepChange - Callback on pipeline step change (1..4)
 * @returns {Promise<Object>} Processing API response (extracted fields, confidence scores)
 */
export async function triggerBackendProcessing(uploadResult, metadata = {}, onStepChange) {
  console.info('[StorageService] Triggering backend processing API for:', uploadResult.fileId, metadata)

  // Step 1: Storage Ingestion Verified
  if (onStepChange) onStepChange(1)
  await new Promise((r) => setTimeout(r, 600))

  // =========================================================================
  // 🔌 BACKEND API WIRING SLOT: FASTAPI PIPELINE INGESTION
  // =========================================================================
  // To trigger real backend API (FastAPI / Node.js):
  // 
  // const payload = {
  //   fileId: uploadResult.fileId,
  //   storageUrl: uploadResult.storageUrl,
  //   category: metadata.category,
  //   district: metadata.district,
  //   language: metadata.language || 'mr',
  // }
  // const response = await documentApi.process(uploadResult.fileId)
  // return response
  // =========================================================================

  // Step 2: Multilingual OCR (Bhashini Engine)
  if (onStepChange) onStepChange(2)
  await new Promise((r) => setTimeout(r, 1000))

  // Step 3: LLM Entity Structuring (Groq Llama 3 / Gemini)
  if (onStepChange) onStepChange(3)
  await new Promise((r) => setTimeout(r, 1200))

  // Step 4: Rule Validation & Verification Routing
  if (onStepChange) onStepChange(4)
  await new Promise((r) => setTimeout(r, 800))

  // Call mock API contract in axiosClient
  const apiResponse = await documentApi.process(uploadResult.fileId)
  return {
    ...apiResponse,
    metadata,
    uploadResult,
  }
}
