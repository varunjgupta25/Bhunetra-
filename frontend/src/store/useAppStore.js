import { create } from 'zustand'
import { isFirebaseConfigured, signInWithEmail, signInWithGoogle, signOutUser } from '../firebase'

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
    // 1. If Firebase is live configured and not a demo placeholder password, attempt live Firebase Auth
    if (isFirebaseConfigured && password && password !== '••••••••') {
      try {
        const userCredential = await signInWithEmail(email, password)
        const idToken = await userCredential.user.getIdToken()
        const profile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          role: role || 'officer',
          district: 'Live Session',
        }
        set({
          user: profile,
          isAuthenticated: true,
          token: idToken,
        })
        return profile
      } catch (err) {
        console.warn("Live Firebase auth attempt failed, using role profile fallback:", err?.message)
      }
    }

    // 2. Demo role login fallback for instant offline testing and presentations
    const roleProfiles = {
      officer: {
        uid: 'officer-001',
        email: email || 'officer.pune@bhunetra.gov.in',
        displayName: 'K. S. Patil (Revenue Officer)',
        role: 'officer',
        district: 'Pune',
        department: 'Department of Land Resources',
      },
      civilian: {
        uid: 'civilian-001',
        email: email || 'citizen.sharma@gmail.com',
        displayName: 'Rajesh Sharma (नागरिक / Citizen)',
        role: 'civilian',
        district: 'Pune',
        department: 'Citizen Land Access Portal',
      },
    }

    const selectedProfile = roleProfiles[role] || roleProfiles.officer
    set({
      user: selectedProfile,
      isAuthenticated: true,
      token: `dev-${selectedProfile.role}-token`,
    })
    return selectedProfile
  },

  loginWithGoogle: async () => {
    // 1. If Firebase is live configured, trigger Firebase Google OAuth popup
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithGoogle()
        const fbUser = userCredential.user
        const idToken = await fbUser.getIdToken()
        const profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Citizen (नागरिक)',
          photoURL: fbUser.photoURL || null,
          role: 'civilian',
          district: 'Pune',
          department: 'Citizen Land Access Portal',
        }
        set({
          user: profile,
          isAuthenticated: true,
          token: idToken,
        })
        return profile
      } catch (err) {
        if (err?.code === 'auth/popup-closed-by-user') {
          throw new Error('Google Sign-In was closed before completion.')
        }
        console.warn("Live Google Sign-In failed, using mock civilian fallback:", err?.message)
        throw err
      }
    }

    // 2. Demo civilian fallback when Firebase keys are not yet filled in .env
    const demoCivilian = {
      uid: 'civilian-001',
      email: 'citizen.sharma@gmail.com',
      displayName: 'Rajesh Sharma (नागरिक / Citizen)',
      role: 'civilian',
      district: 'Pune',
      department: 'Citizen Land Access Portal',
    }
    set({
      user: demoCivilian,
      isAuthenticated: true,
      token: 'dev-civilian-token',
    })
    return demoCivilian
  },

  logout: async () => {
    try {
      await signOutUser()
    } catch {
      // Ignore
    }
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    })
  },

  switchDemoRole: (newRole) => {
    const { user } = get()
    if (!user) return
    const validRole = newRole === 'civilian' ? 'civilian' : 'officer'
    const names = {
      officer: 'K. S. Patil (Revenue Officer)',
      civilian: 'Rajesh Sharma (नागरिक / Citizen)',
    }
    const updatedUser = {
      ...user,
      role: validRole,
      displayName: names[validRole],
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
    }),
}))
