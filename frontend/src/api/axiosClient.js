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
    return await axiosClient.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Triggers OCR (Bhashini) -> LLM Structuring (Groq) -> Confidence pipeline
   * @param {string} docId 
   * @returns {Promise<Object>} Extracted record with confidence scores
   */
  process: async (docId) => {
    return await axiosClient.post(`/api/documents/${docId}/process`)
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

  /**
   * Public endpoint to fetch verification status
   */
  verifyStatus: async (recordId) => {
    return await axiosClient.get(`/api/records/${recordId}/verify-status`)
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
