import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

/**
 * Global Axios Client for BHUNETRA
 * Pre-configured with base URL, timeout, and Firebase Auth JWT interceptors.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Firebase Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    // Retrieve token from Zustand store or localStorage
    const token = useAppStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response Interceptor: Standardize error format & handle 401s
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error?.response?.status
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred'

    console.warn(`[API Response Error ${status}]:`, message)

    if (status === 401) {
      // Session expired or invalid token
      console.warn('Unauthorized request - session may need re-authentication')
    }

    return Promise.reject({
      status,
      message,
      originalError: error,
    })
  }
)

// ==========================================
// BHUNETRA Backend API Service Contracts
// ==========================================

export const documentApi = {
  /**
   * Uploads a document (PDF or Image) to Firebase / Backend
   * @param {FormData} formData - multipart/form-data containing 'file' and metadata
   * @returns {Promise<{ docId: string, storageUrl: string, status: string }>}
   */
  upload: async (formData) => {
    try {
      return await axiosClient.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (err) {
      // Fallback mock simulation for frontend prototyping/demo
      console.info('[Mock Mode] Simulating document upload endpoint')
      await new Promise((r) => setTimeout(r, 900))
      return {
        docId: `DOC-${Date.now().toString(36).toUpperCase()}`,
        storageUrl: 'https://firebasestorage.googleapis.com/v0/b/bhunetra/mock-doc.png',
        status: 'pending',
        fileName: formData.get('file')?.name || 'uploaded_document.png',
        fileType: formData.get('file')?.type?.includes('pdf') ? 'pdf' : 'image',
      }
    }
  },

  /**
   * Triggers OCR (Bhashini) -> LLM Structuring (Groq) -> Confidence pipeline
   * @param {string} docId 
   * @returns {Promise<Object>} Extracted record with confidence scores
   */
  process: async (docId) => {
    try {
      return await axiosClient.post(`/api/documents/${docId}/process`)
    } catch (err) {
      console.info('[Mock Mode] Simulating OCR & Groq LLM extraction pipeline')
      await new Promise((r) => setTimeout(r, 1600))
      
      // Dynamic mock result (Maharashtra 7/12 format)
      const mockScore = Math.random() > 0.35 ? 0.88 : 0.64 // Mix of auto-approve and review queue
      const isLow = mockScore < 0.75

      return {
        recordId: `REC-${Date.now().toString(36).toUpperCase()}`,
        docId,
        extractedFields: {
          khasraNumber: isLow ? '142/2-अ (Uncertain)' : '142/2-अ',
          khataNumber: '894',
          ownerName: 'बाबूराव रामचंद्र पाटील (Baburao Ramchandra Patil)',
          village: 'हवेली (Haveli)',
          tehsil: 'पुणे शहर (Pune City)',
          district: 'पुणे (Pune)',
          landArea: '0.45 हेक्टर (Hectare)',
          ownershipType: 'भोगवटादार वर्ग-१ (Class 1 Occupant)',
          surveyNumber: '142',
          hissaNumber: '2-अ',
          assessment: '₹ 12.50',
        },
        confidenceScores: {
          khasraNumber: isLow ? 0.58 : 0.94,
          khataNumber: 0.96,
          ownerName: 0.91,
          village: 0.98,
          tehsil: 0.95,
          district: 0.99,
          landArea: 0.89,
          ownershipType: 0.86,
        },
        overallConfidence: mockScore,
        verificationStatus: isLow ? 'pending-review' : 'auto-approved',
        flaggedFields: isLow ? ['khasraNumber'] : [],
        processedAt: new Date().toISOString(),
      }
    }
  },

  getById: async (docId) => {
    return await axiosClient.get(`/api/documents/${docId}`)
  },
}

export const recordsApi = {
  /**
   * Fetch filterable land records
   */
  getRecords: async (params = {}) => {
    return await axiosClient.get('/api/records', { params })
  },

  /**
   * Fetch single record detail including document image URL
   */
  getRecordById: async (recordId) => {
    return await axiosClient.get(`/api/records/${recordId}`)
  },

  /**
   * Human verification and correction submission
   */
  verifyRecord: async (recordId, { correctedFields, approved }) => {
    return await axiosClient.patch(`/api/records/${recordId}/verify`, {
      correctedFields,
      approved,
    })
  },

  /**
   * Duplicate detection endpoint
   */
  getDuplicates: async () => {
    return await axiosClient.get('/api/records/duplicates')
  },
}

export const dashboardApi = {
  /**
   * Summary metrics for Admin/Officer dashboard
   */
  getStats: async () => {
    return await axiosClient.get('/api/dashboard/stats')
  },
}
