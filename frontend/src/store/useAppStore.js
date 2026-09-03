import { create } from 'zustand'

// Initial mock user for instant hackathon testing & demo
const DEFAULT_USER = {
  uid: 'officer-user-001',
  email: 'officer.pune@bhunetra.gov.in',
  displayName: 'K. S. Patil',
  role: 'officer', // 'admin' | 'verifier' | 'officer'
  district: 'Pune',
  department: 'Department of Land Resources',
}

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bhunetra-theme')
    if (saved) return saved
  }
  return 'dark'
}

export const useAppStore = create((set, get) => ({
  // --- MULTILINGUAL STATE (22 Official Constitutional Languages) ---
  currentLanguage: 'mr',
  setLanguage: (langCode) => set({ currentLanguage: langCode }),

  // --- AUTH STATE ---
  user: null,
  isAuthenticated: false,
  token: null,

  login: async ({ email, password, role = 'officer' }) => {
    // Allows fast mock login + hook for Firebase signInWithEmailAndPassword
    const roleProfiles = {
      admin: {
        uid: 'admin-001',
        email: email || 'admin@bhunetra.gov.in',
        displayName: 'Varun Gupta (Admin)',
        role: 'admin',
        district: 'All Districts',
      },
      verifier: {
        uid: 'verifier-001',
        email: email || 'verifier.nashik@bhunetra.gov.in',
        displayName: 'A. R. Shinde (Verifier)',
        role: 'verifier',
        district: 'Nashik',
      },
      officer: {
        uid: 'officer-001',
        email: email || 'officer.pune@bhunetra.gov.in',
        displayName: 'K. S. Patil (Revenue Officer)',
        role: 'officer',
        district: 'Pune',
      },
      civilian: {
        uid: 'civilian-001',
        email: email || 'citizen.sharma@gmail.com',
        displayName: 'Rajesh Sharma (नागरिक / Citizen)',
        role: 'civilian',
        district: 'Pune',
      },
    }

    const selectedProfile = roleProfiles[role] || roleProfiles.officer
    set({
      user: selectedProfile,
      isAuthenticated: true,
      token: `jwt-token-${role}-${Date.now()}`,
    })
    return selectedProfile
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    })
  },

  switchDemoRole: (newRole) => {
    const { user } = get()
    if (!user) return
    const names = {
      admin: 'Varun Gupta (Admin)',
      verifier: 'A. R. Shinde (Verifier)',
      officer: 'K. S. Patil (Revenue Officer)',
      civilian: 'Rajesh Sharma (नागरिक / Citizen)',
    }
    const updatedUser = {
      ...user,
      role: newRole,
      displayName: names[newRole] || 'K. S. Patil (Revenue Officer)',
    }
    set({ user: updatedUser })
  },

  // --- QUEUE & NOTIFICATION STATE ---
  pendingVerificationCount: 7,
  setPendingVerificationCount: (count) => set({ pendingVerificationCount: count }),
  decrementPendingCount: () =>
    set((state) => ({
      pendingVerificationCount: Math.max(0, state.pendingVerificationCount - 1),
    })),

  // --- THEME STATE ---
  theme: getInitialTheme(),
  toggleTheme: () => {
    const current = get().theme
    const next = current === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      localStorage.setItem('bhunetra-theme', next)
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
    set({ theme: next })
  },

  // --- UPLOAD & PROCESSING PIPELINE STATE ---
  currentFile: null,
  activeDocument: null,
  isUploading: false,
  isProcessing: false,
  processingStep: 0, // 0: Idle, 1: Uploading, 2: OCR Extracting, 3: LLM Structuring, 4: Validating & Routing
  uploadProgress: 0,
  lastExtractedResult: null,
  uploadError: null,

  // --- DOCUMENT TYPE SELECTION STATE ---
  // Values: '7_12' | '8A' | 'PROPERTY_CARD' | 'MUTATION' | 'OTHER' | null
  documentType: null,
  setDocumentType: (docType) => set({ documentType: docType }),

  setCurrentFile: (file) => set({ currentFile: file, uploadError: null }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setIsUploading: (status) => set({ isUploading: status }),
  setIsProcessing: (status) => set({ isProcessing: status }),
  setProcessingStep: (step) => set({ processingStep: step }),
  setLastExtractedResult: (result) => set({ lastExtractedResult: result }),
  setUploadError: (err) => set({ uploadError: err, isProcessing: false, isUploading: false }),
  resetUploadState: () =>
    set({
      currentFile: null,
      activeDocument: null,
      isUploading: false,
      isProcessing: false,
      processingStep: 0,
      uploadProgress: 0,
      lastExtractedResult: null,
      uploadError: null,
      // Note: documentType is intentionally NOT reset here so it persists
      // across re-uploads in the same session. Use setDocumentType(null) to clear.
    }),
}))
