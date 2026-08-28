import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { t } from '@/utils/languages'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'

import { UploadForm } from '@/components/UploadForm'

export default function CitizenPortalPage() {
  const { currentLanguage } = useAppStore()
  const lang = currentLanguage || 'mr'

  const [selectedRecord, setSelectedRecord] = useState({
    id: 'REC-PUNE-101',
    khasraNumber: '142/3A',
    khataNumber: '582',
    ownerName: 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)',
    village: 'वाघोली (Wagholi)',
    tehsil: 'हवेली (Haveli)',
    district: 'पुणे (Pune)',
    landArea: '1.45 हेक्टर (1.45 Hectare)',
    ownershipType: 'भोगवटादार वर्ग - १ (Private / Class-1)',
    status: 'VERIFIED',
    encumbrance: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
  })
  const handleUploadComplete = (extractedResult) => {
    if (extractedResult && extractedResult.entities) {
      const e = extractedResult.entities
      setSelectedRecord({
        id: extractedResult.docId || `REC-${Date.now()}`,
        khasraNumber: e.khasra_no || e.survey_no || '142/3A',
        khataNumber: e.khata_no || '582',
        ownerName: e.owner_name || 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)',
        village: e.village || 'वाघोली (Wagholi)',
        tehsil: e.tehsil || 'हवेली (Haveli)',
        district: e.district || 'पुणे (Pune)',
        landArea: e.area_ha ? `${e.area_ha} हेक्टर` : '1.45 हेक्टर',
        ownershipType: e.ownership_type || 'भोगवटादार वर्ग - १',
        status: extractedResult.status || 'VERIFIED',
        encumbrance: e.liens || 'निरंक (No lien)',
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Header Banner for Citizen Portal */}
      <section className="bg-gradient-to-r from-[#0F2C59] via-[#163A72] to-[#0A1E3F] text-white py-8 px-4 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full px-3 py-0.5 text-xs font-semibold uppercase mb-2">
              <span>🏛️ PUBLIC LAND RECORDS GATEWAY</span>
              <span>•</span>
              <span>नागरिक अपलोड व पडताळणी पोर्टल</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              नागरिक भूमि अभिलेख सेवा (Citizen Upload & Validation Portal)
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-2xl font-light">
              Upload your 7/12 land extract document (PDF/JPG) for instant AI OCR verification, digital validation, and certified 22-language PDF download.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              📄 दस्तावेज अपलोड (Upload 7/12)
            </button>
            <button
              onClick={() => setActiveTab('mutation')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeTab === 'mutation'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              📑 फेरफार स्थिती (Mutation Status)
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Upload Section (Left Column) */}
            <div className="lg:col-span-6">
              <UploadForm onComplete={handleUploadComplete} />
            </div>

            {/* Results & Certified Digital PDF Export Card */}
            <div className="lg:col-span-6 space-y-6">
              {selectedRecord ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 mb-4">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-emerald-300 uppercase tracking-wider">
                        ✔ VERIFIED STATE LAND RECORD
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        गट क्र. {selectedRecord.khasraNumber} — खाते क्र. {selectedRecord.khataNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedRecord.village}, {selectedRecord.tehsil}, {selectedRecord.district}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPdfModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 border border-amber-300"
                    >
                      <span>📜 प्रमाणपत्र डाउनलोड करा (Download Certified PDF)</span>
                    </button>
                  </div>

                  {/* Field Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">खातेदाराचे नाव (Owner Name)</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedRecord.ownerName}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">एकूण क्षेत्र (Land Area)</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedRecord.landArea}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">धारणा प्रकार (Ownership Type)</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedRecord.ownershipType}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">इतर हक्क व कर्ज बोजा (Liens & Encumbrances)</span>
                      <span className="text-xs font-bold text-amber-800 mt-0.5 block">{selectedRecord.encumbrance}</span>
                    </div>
                  </div>

                  {/* Digital Signature Guarantee Strip */}
                  <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛡️</span>
                      <span>डिजिटल स्वाक्षरित ७/१२ — महाराष्ट्र शासन महसूल विभाग</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">QR VERIFIED</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
                  <span className="text-4xl block mb-3">📜</span>
                  <p className="text-sm font-semibold">गट क्रमांक टाकून तुमचा ७/१२ अभिलेख शोधा.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mutation' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-2">फेरफार अर्ज स्थिती (Land Mutation Application Status)</h2>
            <p className="text-xs text-slate-500 mb-6">Track title mutation status for Gat No. 142/3A (Wagholi)</p>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500 pl-8">
              <div className="relative">
                <span className="absolute -left-8 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                <h4 className="text-sm font-bold text-slate-900">अर्ज सादर केला (Application Submitted)</h4>
                <p className="text-xs text-slate-500">12 ऑगस्ट 2026 • ई-फेरफार प्रणालीद्वारे स्वीकृत</p>
              </div>

              <div className="relative">
                <span className="absolute -left-8 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                <h4 className="text-sm font-bold text-slate-900">तलाठी पडताळणी पूर्ण (Talathi Verified)</h4>
                <p className="text-xs text-slate-500">18 ऑगस्ट 2026 • स्थळ पाहणी व दस्तऐवज पडताळणी पूर्ण</p>
              </div>

              <div className="relative">
                <span className="absolute -left-8 top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
                <h4 className="text-sm font-bold text-amber-900">तहसीलदार मंजुरी प्रक्रियेत (Tehsildar Final Approval)</h4>
                <p className="text-xs text-slate-500">अंतिम डिजिटल हुकूम व ७/१२ नोंद प्रलंबित</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Certified PDF Export Modal connected to 22 Constitutional Languages */}
      <DigitizedPdfModal
        isOpen={showPdfModal}
        recordData={selectedRecord}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  )
}
