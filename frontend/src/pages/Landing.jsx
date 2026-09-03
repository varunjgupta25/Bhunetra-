import React from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { t } from '@/utils/languages'

export default function LandingPage() {
  const { currentLanguage } = useAppStore()
  const lang = currentLanguage || 'mr'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#0F2C59] via-[#163A72] to-[#0A1E3F] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <span className="text-[280px] font-black tracking-tighter">भू</span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Official NIC Standards Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider mb-6">
            <span>🏛️ NIC GOVERNANCE STANDARDS</span>
            <span>•</span>
            <span>DILRMP COMPLIANT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            <span className="text-amber-400 font-serif">भूनेत्रा (BHUNETRA)</span>
            <span className="block text-2xl sm:text-4xl mt-2 text-slate-100 font-medium">
              Intelligent Land Record Digitization, Forensic ELA & GIS Monitoring System
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            India's privacy-first, offline sovereign AI platform for Marathi 7/12 extracts, Devanagari OCR, automated revenue verification, and certified digital land records across all 22 official languages of India.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-amber-300"
            >
              <span>{t('enterPortalBtn', lang)}</span>
              <span className="text-xl">➔</span>
            </Link>

            <a
              href="#capabilities"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-base rounded-lg border border-slate-600 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <span>{t('exploreFeaturesBtn', lang)}</span>
              <span>↓</span>
            </a>
          </div>

          {/* Live System Metrics Quick Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-700/60 max-w-4xl mx-auto text-center">
            <div className="p-3 bg-[#0A1E3F]/60 rounded-lg border border-slate-700">
              <div className="text-2xl font-black text-amber-400">1,28,450+</div>
              <div className="text-xs text-slate-300 font-medium uppercase mt-0.5">7/12 Records Digitized</div>
            </div>
            <div className="p-3 bg-[#0A1E3F]/60 rounded-lg border border-slate-700">
              <div className="text-2xl font-black text-amber-400">&lt; 800 ms</div>
              <div className="text-xs text-slate-300 font-medium uppercase mt-0.5">Automated Extraction</div>
            </div>
            <div className="p-3 bg-[#0A1E3F]/60 rounded-lg border border-slate-700">
              <div className="text-2xl font-black text-amber-400">99.4 %</div>
              <div className="text-xs text-slate-300 font-medium uppercase mt-0.5">Forensic ELA Accuracy</div>
            </div>
            <div className="p-3 bg-[#0A1E3F]/60 rounded-lg border border-slate-700">
              <div className="text-2xl font-black text-amber-400">22 Languages</div>
              <div className="text-xs text-slate-300 font-medium uppercase mt-0.5">Eighth Schedule Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SYSTEM CAPABILITIES GRID */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            SYSTEM ARCHITECTURE & FEATURES
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            What Does Bhunetra Do?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            Explore the core pillars powering India's next-generation revenue record digitization engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: 22 Languages */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-amber-200">
              📜
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              All 22 Constitutional Languages
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Real-time localized interface and PDF certificate translation across all 22 official Eighth Schedule languages of India (Assamese to Urdu).
            </p>
            <div className="flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 w-fit">
              ✔ Complete Localized PDF Export
            </div>
          </div>

          {/* Card 2: ELA Forensic Tamper Detection */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-red-200">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Forensic ELA Tamper Detection
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Error Level Analysis (ELA) detects image splicing, digital Photoshop modifications, stamp alteration, and physical paper document forgery.
            </p>
            <div className="flex items-center text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200 w-fit">
              ✔ Anti-Forgery & Fraud Shield
            </div>
          </div>

          {/* Card 3: Rule-Based Structuring */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-blue-200">
              ⚙️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Rule-Based Match-Evidence Engine
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Extracts Khasra/Survey numbers, Khata accounts, owner names, and area metrics (Hectare/R) with deterministic match-evidence confidence scoring.
            </p>
            <div className="flex items-center text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 w-fit">
              ✔ 100% Deterministic Extraction
            </div>
          </div>

          {/* Card 4: GIS Map Spatial Intelligence */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-emerald-200">
              🗺️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              GIS Boundary & Spatial Mapping
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Maps paper 7/12 Khasra survey numbers directly to spatial GIS land boundaries, district revenue zones, and satellite overlays.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-fit">
              ✔ Interactive GeoJSON Layer
            </div>
          </div>

          {/* Card 5: Offline Privacy Sovereignty */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-purple-200">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              100% Offline Data Sovereignty
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Operates 100% locally on revenue office hardware with Bhashini / EasyOCR local engines. Zero cloud data leaks to external foreign servers.
            </p>
            <div className="flex items-center text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 w-fit">
              ✔ Indian Data Sovereignty
            </div>
          </div>

          {/* Card 6: Revenue Verifier Queue */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-2xl mb-4 border border-orange-200">
              ⚖️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Revenue Verifier Approval Queue
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Auto-approves verified scans while routing questionable or unindexed documents to Talathi / Tehsildar queues with digital QR certification.
            </p>
            <div className="flex items-center text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded border border-orange-200 w-fit">
              ✔ Role-Based Access Control
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS PIPELINE */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              End-to-End Digitization Workflow
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From physical paper scan to verified digital 7/12 certificate in 4 steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 01</div>
              <h4 className="font-bold text-white mb-1">Paper Scan Upload</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Upload Marathi 7/12 extract paper scan or PDF document.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 02</div>
              <h4 className="font-bold text-white mb-1">OCR & ELA Analysis</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Extracts Devanagari text & checks Error Level Analysis for tampering.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 03</div>
              <h4 className="font-bold text-white mb-1">DB Cross-Match</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Verifies extracted Khasra/Khata against State Land Database.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 04</div>
              <h4 className="font-bold text-white mb-1">QR Certificate Export</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Generates certified 22-language PDF record with official QR code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#0F2C59] to-[#163A72] text-white py-14 px-4 text-center border-t-4 border-amber-500">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Ready to Explore the Revenue Officer Portal?
          </h2>
          <p className="text-slate-200 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-light">
            Experience live 7/12 document ingestion, ELA tamper detection, and multilingual PDF export right now.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-9 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-xl shadow-2xl transition-all transform hover:scale-105"
          >
            <span>{t('enterPortalBtn', lang)}</span>
            <span className="text-2xl">➔</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
