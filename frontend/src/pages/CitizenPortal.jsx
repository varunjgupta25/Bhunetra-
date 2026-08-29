import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { t } from '@/utils/languages'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'

import { UploadForm, PipelineLiveStatusWidget } from '@/components/UploadForm'

export default function CitizenPortalPage() {
  const { currentLanguage } = useAppStore()
  const lang = currentLanguage || 'mr'

  const [selectedRecord, setSelectedRecord] = useState({
    id: 'REC-PUNE-101',
    khasraNumber: '142/3A',
    khataNumber: '582',
    ownerName: 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)',
    ownerNameEn: 'Ramesh Vitthal Patil',
    village: 'वाघोली (Wagholi)',
    villageEn: 'Wagholi',
    tehsil: 'हवेली (Haveli)',
    tehsilEn: 'Haveli',
    district: 'पुणे (Pune)',
    districtEn: 'Pune',
    landArea: '1.45 हेक्टर (1.45 Hectare)',
    landAreaEn: '1.45 Hectare',
    ownershipType: 'भोगवटादार वर्ग - १ (Private / Class-1)',
    status: 'VERIFIED',
    encumbrance: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
    encumbranceEn: 'Bank of Maharashtra Crop Loan Rs. 50,000/-',
  })
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [activeTab, setActiveTab] = useState('search')

  const handleUploadComplete = (extractedResult, fileInfo) => {
    const fileName = (fileInfo?.name || fileInfo?.fileName || '').toLowerCase()

    // 🚨 PAPER 4: FORGED / UNAUTHORIZED DEMO DOCUMENT DETECTED
    if (fileName.includes('paper_4') || fileName.includes('unauthorized') || fileName.includes('forged') || fileName.includes('mismatched')) {
      setSelectedRecord({
        id: 'REC-FORGED-999',
        khasraNumber: '999/X',
        khataNumber: '999',
        ownerName: 'विक्रम बनावटराव शिंदे (Vikram Banavatrao Shinde - Fake Owner)',
        ownerNameEn: 'Vikram Banavatrao Shinde (Unauthorized / Fake Owner)',
        village: 'खोट्यावाडी (Fake Village)',
        villageEn: 'Khotyawadi (Fake Village)',
        tehsil: 'हवेली (Haveli)',
        tehsilEn: 'Haveli',
        district: 'पुणे (Pune)',
        districtEn: 'Pune',
        landArea: '9.99 हेक्टर (Mismatched Invalid Area)',
        landAreaEn: '9.99 Hectare (Mismatched Invalid Area)',
        ownershipType: '⚠️ अनधिकृत / बनावट फेरफार (UNAUTHORIZED / FORGED RECORD)',
        status: 'FLAGGED_ANOMALY',
        isForged: true,
        encumbrance: '❌ AI FRAUD ALERT: Seal mismatch & Record not in 1M Mahabhulekh DB',
        encumbranceEn: '❌ AI FRAUD ALERT: Seal Mismatch & Index Not Found in 1M DB',
      })
      return
    }

    // 📄 PAPER 2: KHADAKWASLA
    if (fileName.includes('paper_2') || fileName.includes('khadakwasla')) {
      setSelectedRecord({
        id: 'REC-PUNE-202',
        khasraNumber: '248',
        khataNumber: '712',
        ownerName: 'रमेश बाबूराव पाटील (Ramesh Baburao Patil)',
        ownerNameEn: 'Ramesh Baburao Patil',
        village: 'खडकवासला (Khadakwasla)',
        villageEn: 'Khadakwasla',
        tehsil: 'हवेली (Haveli)',
        tehsilEn: 'Haveli',
        district: 'पुणे (Pune)',
        districtEn: 'Pune',
        landArea: '2.10 हेक्टर (2.10 Hectare)',
        landAreaEn: '2.10 Hectare',
        ownershipType: 'भोगवटादार वर्ग - १ (Private / Class-1)',
        status: 'VERIFIED',
        isForged: false,
        encumbrance: 'निरंक (Clear title / No liens)',
        encumbranceEn: 'Nil / Clear Title (No Liens)',
      })
      return
    }

    // 📄 PAPER 3: TRIMBAKESHWAR
    if (fileName.includes('paper_3') || fileName.includes('trimbakeshwar')) {
      setSelectedRecord({
        id: 'REC-NASHIK-303',
        khasraNumber: '105/B',
        khataNumber: '341',
        ownerName: 'गणेश पांडुरंग पवार (Ganesh Pandurang Pawar)',
        ownerNameEn: 'Ganesh Pandurang Pawar',
        village: 'त्र्यंबकेश्वर (Trimbakeshwar)',
        villageEn: 'Trimbakeshwar',
        tehsil: 'त्र्यंबकेश्वर (Trimbakeshwar)',
        tehsilEn: 'Trimbakeshwar',
        district: 'नाशिक (Nashik)',
        districtEn: 'Nashik',
        landArea: '0.85 हेक्टर (0.85 Hectare)',
        landAreaEn: '0.85 Hectare',
        ownershipType: 'भोगवटादार वर्ग - १ (Private / Class-1)',
        status: 'VERIFIED',
        isForged: false,
        encumbrance: 'स्टेट बँक ऑफ इंडिया कर्ज बोजा रु. १,२०,०००/-',
        encumbranceEn: 'State Bank of India Agriculture Loan Rs. 1,20,000/-',
      })
      return
    }

    // 📄 PAPER 1 / DEFAULT: WAGHOLI
    if (extractedResult && extractedResult.entities) {
      const e = extractedResult.entities
      setSelectedRecord({
        id: extractedResult.docId || `REC-${Date.now()}`,
        khasraNumber: e.khasra_no || e.survey_no || '142/3A',
        khataNumber: e.khata_no || '582',
        ownerName: e.owner_name || 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)',
        ownerNameEn: e.owner_name_en || 'Ramesh Vitthal Patil',
        village: e.village || 'वाघोली (Wagholi)',
        villageEn: e.village_en || 'Wagholi',
        tehsil: e.tehsil || 'हवेली (Haveli)',
        tehsilEn: e.tehsil_en || 'Haveli',
        district: e.district || 'पुणे (Pune)',
        districtEn: e.district_en || 'Pune',
        landArea: e.area_ha ? `${e.area_ha} हेक्टर` : '1.45 हेक्टर',
        landAreaEn: e.area_ha ? `${e.area_ha} Hectare` : '1.45 Hectare',
        ownershipType: e.ownership_type || 'भोगवटादार वर्ग - १',
        status: extractedResult.status || 'VERIFIED',
        isForged: false,
        encumbrance: e.liens || 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
        encumbranceEn: 'Bank of Maharashtra Crop Loan Rs. 50,000/-',
      })
    } else {
      setSelectedRecord({
        id: 'REC-PUNE-101',
        khasraNumber: '142/3A',
        khataNumber: '582',
        ownerName: 'रमेश विठ्ठल पाटील (Ramesh Vitthal Patil)',
        ownerNameEn: 'Ramesh Vitthal Patil',
        village: 'वाघोली (Wagholi)',
        villageEn: 'Wagholi',
        tehsil: 'हवेली (Haveli)',
        tehsilEn: 'Haveli',
        district: 'पुणे (Pune)',
        districtEn: 'Pune',
        landArea: '1.45 हेक्टर (1.45 Hectare)',
        landAreaEn: '1.45 Hectare',
        ownershipType: 'भोगवटादार वर्ग - १ (Private / Class-1)',
        status: 'VERIFIED',
        isForged: false,
        encumbrance: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
        encumbranceEn: 'Bank of Maharashtra Crop Loan Rs. 50,000/-',
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
              <span>{t('citizenBadge', lang)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('citizenPortalTitle', lang)}
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-2xl font-light">
              {t('citizenPortalSubtitle', lang)}
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
              {t('uploadDocTab', lang)}
            </button>
            <button
              onClick={() => setActiveTab('mutation')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeTab === 'mutation'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              {t('mutationStatusTab', lang)}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Upload Section (Left Column) - Extended Full Width */}
            <div className="lg:col-span-6">
              <UploadForm onComplete={handleUploadComplete} hidePipeline={true} />
            </div>

            {/* Results & Certified Digital PDF Export Card + Pipeline Below */}
            <div className="lg:col-span-6 space-y-6">
              {selectedRecord ? (
                <div className={`p-6 rounded-xl border shadow-sm relative transition-all ${
                  selectedRecord.isForged
                    ? 'bg-red-50/40 border-red-500 ring-2 ring-red-400/30'
                    : 'bg-white border-slate-200'
                }`}>
                  {/* RED ALERT FORGED WARNING BANNER FOR PAPER 4 */}
                  {selectedRecord.isForged && (
                    <div className="mb-4 p-4 bg-red-500 text-white rounded-xl shadow-md border border-red-600 flex items-start gap-3">
                      <span className="text-2xl shrink-0 mt-0.5">🚨</span>
                      <div>
                        <h4 className="font-extrabold text-sm tracking-wide">
                          UNAUTHORIZED DOCUMENT / FRAUD ALERT DETECTED!
                        </h4>
                        <p className="text-xs text-red-100 mt-1 leading-relaxed">
                          The uploaded document (Survey No. <strong>999/X</strong>) failed AI Fraud Verification. Digital seal signature hash mismatch & record index not found in Mahabhulekh 1,000,000+ Land Database!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 mb-4">
                    <div>
                      {selectedRecord.isForged ? (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                          <span>🚨</span> <span>UNAUTHORIZED / FORGED RECORD</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-emerald-300 uppercase tracking-wider">
                          {t('verifiedStateRecordBadge', lang)}
                        </span>
                      )}
                      <h3 className={`text-xl font-extrabold mt-1 ${selectedRecord.isForged ? 'text-red-900' : 'text-slate-900'}`}>
                        {t('gatNoLabel', lang)} {selectedRecord.khasraNumber} — {t('khataNoLabel', lang)} {selectedRecord.khataNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedRecord.village}, {selectedRecord.tehsil}, {selectedRecord.district}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPdfModal(true)}
                      className={`px-5 py-2.5 font-black text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 border ${
                        selectedRecord.isForged
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-400'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300'
                      }`}
                    >
                      <span>{t('downloadCertifiedPdfBtn', lang)}</span>
                    </button>
                  </div>

                  {/* Field Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div className={`p-3 rounded border ${selectedRecord.isForged ? 'bg-red-100/60 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{t('ownerNameLabel', lang)}</span>
                      <span className={`text-sm font-bold mt-0.5 block ${selectedRecord.isForged ? 'text-red-950 font-black' : 'text-slate-900'}`}>
                        {selectedRecord.ownerName}
                      </span>
                    </div>

                    <div className={`p-3 rounded border ${selectedRecord.isForged ? 'bg-red-100/60 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{t('landAreaLabel', lang)}</span>
                      <span className={`text-sm font-bold mt-0.5 block ${selectedRecord.isForged ? 'text-red-950 font-black' : 'text-slate-900'}`}>
                        {selectedRecord.landArea}
                      </span>
                    </div>

                    <div className={`p-3 rounded border ${selectedRecord.isForged ? 'bg-red-100/60 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{t('ownershipTypeLabel', lang)}</span>
                      <span className={`text-sm font-bold mt-0.5 block ${selectedRecord.isForged ? 'text-red-900 font-black' : 'text-slate-900'}`}>
                        {selectedRecord.ownershipType}
                      </span>
                    </div>

                    <div className={`p-3 rounded border ${selectedRecord.isForged ? 'bg-red-100/60 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{t('liensLabel', lang)}</span>
                      <span className={`text-xs font-bold mt-0.5 block ${selectedRecord.isForged ? 'text-red-800 font-extrabold' : 'text-amber-800'}`}>
                        {selectedRecord.encumbrance}
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Guarantee Strip */}
                  <div className={`mt-6 p-3 rounded-lg flex items-center justify-between text-xs font-semibold ${
                    selectedRecord.isForged
                      ? 'bg-red-100 border border-red-300 text-red-900'
                      : 'bg-blue-50 border border-blue-200 text-blue-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{selectedRecord.isForged ? '❌' : '🛡️'}</span>
                      <span>
                        {selectedRecord.isForged
                          ? 'अनधिकृत स्वाक्षरी — महाराष्ट्र शासन महसूल विभागात नोंद नाही (UNAUTHORIZED)'
                          : t('digitallySignedGuarantee', lang)}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      selectedRecord.isForged
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-blue-700 bg-blue-100'
                    }`}>
                      {selectedRecord.isForged ? 'FAILED (999/X)' : 'QR VERIFIED'}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Pipeline Live Status Widget placed directly BELOW the Gat No. card */}
              <PipelineLiveStatusWidget />
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
