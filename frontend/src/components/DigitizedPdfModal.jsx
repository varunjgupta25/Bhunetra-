import React, { useState } from 'react'
import { CONSTITUTION_22_LANGUAGES } from '@/utils/languages'

export function DigitizedPdfModal({ isOpen, onClose, recordData, onConfirmExport }) {
  const [selectedLanguage, setSelectedLanguage] = useState('mr') // 'mr', 'en', 'hi'
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCertificateView, setShowCertificateView] = useState(false)

  if (!isOpen) return null

  const record = recordData || {
    recordId: 'REC-712-PUNE-0941',
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
    encumbrance: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowCertificateView(true)
      if (onConfirmExport) onConfirmExport(selectedLanguage)
    }, 800)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest border border-[#D0E8F5] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden transition-all duration-300">
        {/* Modal Header */}
        <div className="bg-[#0D2B40] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              picture_as_pdf
            </span>
            <div>
              <h3 className="font-headline-md text-lg font-bold">
                {showCertificateView
                  ? 'Official Digital 7/12 Land Certificate'
                  : 'Select Certificate Language for PDF Generation'}
              </h3>
              <p className="text-xs text-white/70">
                {showCertificateView
                  ? `Unique Certificate ID: *MH/PUNE/HV/24/712*001 • Language: ${
                      selectedLanguage === 'mr' ? 'Marathi' : selectedLanguage === 'en' ? 'English' : 'Hindi'
                    }`
                  : 'Choose target language BEFORE PDF creation to save processing & storage steps.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        {!showCertificateView ? (
          <div className="p-6 space-y-6">
            <p className="text-sm text-on-surface-variant">
              Select any of the <strong>22 Official Constitutional Languages of India (8th Schedule)</strong> below. The local ML engine will generate the digitized land extract PDF in a single pass without extra database conversions.
            </p>

            {/* 22 Constitutional Languages Dropdown & Quick Selector */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-2xl border border-[#B8D8EE]">
                <label className="text-xs font-bold text-on-surface flex items-center gap-2">
                  <span className="text-lg">📜</span>
                  <span>Select Target Certificate Language (२२ संविधानात्मक भाषा):</span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white text-slate-900 text-sm font-bold border-2 border-primary rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
                >
                  {CONSTITUTION_22_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.icon} {lang.nameNative} — {lang.nameEn} ({lang.script} Script)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Featured Languages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { code: 'mr', name: 'मराठी (Marathi)', icon: '🚩' },
                  { code: 'en', name: 'English (English)', icon: '🇬🇧' },
                  { code: 'hi', name: 'हिन्दी (Hindi)', icon: '🇮🇳' },
                  { code: 'gu', name: 'ગુજરાતી (Gujarati)', icon: '🏛️' },
                  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', icon: '🏛️' },
                  { code: 'ta', name: 'தமிழ் (Tamil)', icon: '🏛️' },
                  { code: 'te', name: 'తెలుగు (Telugu)', icon: '🏛️' },
                  { code: 'bn', name: 'বাংলা (Bengali)', icon: '🇧🇩' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLanguage(l.code)}
                    type="button"
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedLanguage === l.code
                        ? 'border-primary bg-primary-container/30 text-primary shadow-sm ring-2 ring-primary/40'
                        : 'border-[#B8D8EE] bg-white text-on-surface hover:border-primary/50'
                    }`}
                  >
                    <span className="text-base block mb-1">{l.icon}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-[#2DA090] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      autorenew
                    </span>
                    <span>Generating Single-Pass PDF...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span>Generate &amp; Preview PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Certificate Preview Mode */
          <div className="p-6 space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-primary-container/20 p-3 rounded-2xl border border-primary/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Single-Pass PDF Generated Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#B8D8EE] text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print
                </button>
                <button
                  onClick={() => alert('PDF Certificate Downloaded Successfully!')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-[#2DA090] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download PDF
                </button>
              </div>
            </div>

            {/* Official Certificate Paper Card */}
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-sm text-gray-800 space-y-6 relative print:border-none print:shadow-none">
              {/* Certificate Header */}
              <div className="text-center border-b-2 border-gray-400 pb-4 relative">
                <div className="absolute top-0 right-0">
                  {/* QR Code Simulation */}
                  <div className="w-16 h-16 bg-gray-900 rounded p-1 flex flex-col justify-between items-center text-[8px] text-white font-mono">
                    <div className="w-full flex justify-between"><span>■</span><span>■</span></div>
                    <span className="text-[7px]">QR VERIFIED</span>
                    <div className="w-full flex justify-between"><span>■</span><span>■</span></div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedLanguage === 'en'
                    ? 'GOVERNMENT OF MAHARASHTRA'
                    : selectedLanguage === 'hi'
                    ? 'महाराष्ट्र सरकार'
                    : 'महाराष्ट्र शासन'}
                </h2>
                <h3 className="text-xl font-extrabold mt-1 text-gray-900">
                  {selectedLanguage === 'en'
                    ? 'DIGITAL 7/12 EXTRACT CERTIFICATE'
                    : selectedLanguage === 'hi'
                    ? 'डिजिटल सातबारा (७/१२) राजस्व प्रमाण पत्र'
                    : 'डिजिटल सातबारा (७/१२) उतारा'}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  (गावाचे नाव: {selectedLanguage === 'en' ? record.villageEn || record.village : record.village} • तालुका: {selectedLanguage === 'en' ? record.tehsilEn || record.tehsil : record.tehsil} • जिल्हा: {selectedLanguage === 'en' ? record.districtEn || record.district : record.district})
                </p>
              </div>

              {/* Data Table */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-gray-300 text-gray-700">
                    <th className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? 'Gat / Survey No.' : 'गट / सर्व्हे क्र.'}
                    </th>
                    <th className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? 'Khata No.' : 'खाते क्र.'}
                    </th>
                    <th className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? 'Land Owner Name' : 'खातेदाराचे नाव'}
                    </th>
                    <th className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? 'Total Area' : 'एकूण क्षेत्र (हेक्टर)'}
                    </th>
                    <th className="p-2">
                      {selectedLanguage === 'en' ? 'Encumbrance' : 'बोझा तपशील'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300 font-bold">{record.khasraNumber || record.khasra_no}</td>
                    <td className="p-2 border-r border-gray-300 font-bold">{record.khataNumber || record.khata_no}</td>
                    <td className="p-2 border-r border-gray-300 font-semibold">
                      {selectedLanguage === 'en' ? record.ownerNameEn || record.ownerName : record.ownerName}
                    </td>
                    <td className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? record.landAreaEn || record.landArea : record.landArea}
                    </td>
                    <td className={`p-2 font-medium ${record.isForged ? 'text-red-700 font-bold' : 'text-emerald-700'}`}>
                      {selectedLanguage === 'en' ? record.encumbranceEn || record.encumbrance : record.encumbrance}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Official Revenue Digital Signature Box */}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200 text-xs">
                <div>
                  <p className="text-gray-500 font-mono text-[10px]">
                    System Verification Hash: 712MV-XG9-2026-BHUNETRA
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    Digitally generated by BHUNETRA Sub-5ms Local ML Engine
                  </p>
                </div>
                <div className="border border-gray-300 p-2.5 rounded-lg text-right bg-gray-50 max-w-[220px]">
                  <p className="font-bold text-gray-900">डिजिटल सही (Digital Signature)</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">तहसीलदार / तलाठी</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">महसूल विभाग, पुणे</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5">✔ Digitally Signed</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-start">
              <button
                onClick={() => setShowCertificateView(false)}
                className="px-4 py-2 text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Change Language Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
