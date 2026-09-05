import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

/**
 * Global Axios Client for BHUNETRA
 * Pre-configured with base URL, timeout, and Firebase Auth JWT interceptors.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
      
      // Deterministic extraction record data with fixed per-field values and confidence
      const recordId = 'REC-712-PUNE-0941'
      const overallConfidence = 0.78

      const extractedFields = {
        villageCode: {
          value: 'MH-PN-SH-0042',
          confidence: 0.98,
        },
        khasraNumber: {
          value: '248',
          confidence: 0.42,
        },
        khataNumber: {
          value: '582',
          confidence: 0.91,
        },
        ownerName: {
          value: 'बाबूराव रामचंद्र पाटील (Baburao Ramchandra Patil)',
          confidence: 0.98,
        },
        village: {
          value: 'हवेली (Haveli)',
          confidence: 0.98,
        },
        tehsil: {
          value: 'पुणे शहर (Pune City)',
          confidence: 0.95,
        },
        district: {
          value: 'पुणे (Pune)',
          confidence: 0.99,
        },
        landArea: {
          value: '1.25 हेक्टर (Hectare)',
          confidence: 0.76,
        },
        area: {
          value: '1.25',
          confidence: 0.76,
        },
        assessment: {
          value: '₹ 4500',
          confidence: 0.84,
        },
        ownershipType: {
          value: 'भोगवटादार वर्ग-१ (Class 1 Occupant)',
          confidence: 0.86,
        },
      }

      const confidenceScores = {
        villageCode: extractedFields.villageCode.confidence,
        khasraNumber: extractedFields.khasraNumber.confidence,
        khataNumber: extractedFields.khataNumber.confidence,
        ownerName: extractedFields.ownerName.confidence,
        village: extractedFields.village.confidence,
        tehsil: extractedFields.tehsil.confidence,
        district: extractedFields.district.confidence,
        landArea: extractedFields.landArea.confidence,
        area: extractedFields.area.confidence,
        assessment: extractedFields.assessment.confidence,
        ownershipType: extractedFields.ownershipType.confidence,
      }

      return {
        recordId,
        docId,
        extractedFields,
        confidenceScores,
        overallConfidence,
        verificationStatus: 'pending-review',
        flaggedFields: ['khasraNumber'],
        processedAt: '2026-08-25T10:30:00.000Z',
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
