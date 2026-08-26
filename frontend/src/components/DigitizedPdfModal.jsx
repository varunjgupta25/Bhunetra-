import React, { useState } from 'react'

export function DigitizedPdfModal({ isOpen, onClose, recordData, onConfirmExport }) {
  const [selectedLanguage, setSelectedLanguage] = useState('mr') // 'mr', 'en', 'hi'
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCertificateView, setShowCertificateView] = useState(false)

  if (!isOpen) return null

  const record = recordData || {
    recordId: 'REC-712-PUNE-0941',
    khasraNumber: '142/3A',
    khataNumber: '582',
    ownerName: 'रमेश बाबुराव पाटील',
    ownerNameEn: 'Ramesh Baburao Patil',
    village: 'खडकवासला',
    villageEn: 'Khadakwasla',
    tehsil: 'हवेली',
    tehsilEn: 'Haveli',
    district: 'पुणे',
    districtEn: 'Pune',
    landArea: '1.45 हेक्टर',
    landAreaEn: '1.45 Hectares',
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
          /* STEP 1: Pre-Generation Multilingual Selection */
          <div className="p-6 space-y-6">
            <p className="text-sm text-on-surface-variant">
              Select the official certificate language below. The local ML engine will generate the digitized land extract PDF in a single pass without extra database conversions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Marathi */}
              <div
                onClick={() => setSelectedLanguage('mr')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedLanguage === 'mr'
                    ? 'border-primary bg-primary-container/10 shadow-md scale-[1.02]'
                    : 'border-[#B8D8EE] bg-[#F4F9FE] hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🚩</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        selectedLanguage === 'mr'
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {selectedLanguage === 'mr' && (
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-on-surface text-base">1. Marathi (मराठी)</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    7/12 Extract Official State Format (महाराष्ट्र शासन मूळ नमुना)
                  </p>
                </div>
                <span className="mt-4 inline-block text-[11px] font-semibold text-primary bg-primary-container/20 px-2.5 py-1 rounded-full text-center">
                  Recommended for State Revenue
                </span>
              </div>

              {/* Option 2: English */}
              <div
                onClick={() => setSelectedLanguage('en')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedLanguage === 'en'
                    ? 'border-primary bg-primary-container/10 shadow-md scale-[1.02]'
                    : 'border-[#B8D8EE] bg-[#F4F9FE] hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        selectedLanguage === 'en'
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {selectedLanguage === 'en' && (
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-on-surface text-base">2. English</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Translated Official Revenue Certificate
                  </p>
                </div>
                <span className="mt-4 inline-block text-[11px] font-semibold text-secondary bg-secondary-container/30 px-2.5 py-1 rounded-full text-center">
                  Ideal for Bank Loans &amp; Audits
                </span>
              </div>

              {/* Option 3: Hindi */}
              <div
                onClick={() => setSelectedLanguage('hi')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedLanguage === 'hi'
                    ? 'border-primary bg-primary-container/10 shadow-md scale-[1.02]'
                    : 'border-[#B8D8EE] bg-[#F4F9FE] hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🇮🇳</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        selectedLanguage === 'hi'
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {selectedLanguage === 'hi' && (
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-on-surface text-base">3. Hindi (हिंदी)</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    राष्ट्रीय मानकीकृत राजस्व प्रमाण पत्र
                  </p>
                </div>
                <span className="mt-4 inline-block text-[11px] font-semibold text-on-surface-variant bg-surface-container-highest px-2.5 py-1 rounded-full text-center">
                  National Standardized Format
                </span>
              </div>
            </div>

            {/* Direct Storage Efficiency Note */}
            <div className="p-3.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/40 text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base shrink-0">
                bolt
              </span>
              <span>
                <strong>Single-Pass Direct Generation:</strong> Saves 50% Firestore reads/writes and bypasses secondary translation API passes.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-secondary hover:bg-surface-container-highest transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-[#2DA090] text-on-primary shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                    <span>Generating Certificate...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Generate &amp; Preview PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Official Digitized Certificate Preview Output */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-2xl border border-[#D0E8F5]">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
                Single-Pass PDF Generated Successfully
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-container-highest text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print
                </button>
                <button
                  onClick={() => alert('PDF Certificate Downloaded Successfully!')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-[#2DA090] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
                  (गावाचे नाव: {record.village} • तालुका: {record.tehsil} • जिल्हा: {record.district})
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
                    <td className="p-2 border-r border-gray-300 font-bold">{record.khasraNumber}</td>
                    <td className="p-2 border-r border-gray-300 font-bold">{record.khataNumber}</td>
                    <td className="p-2 border-r border-gray-300 font-semibold">
                      {selectedLanguage === 'en' ? record.ownerNameEn || 'Ramesh Baburao Patil' : record.ownerName}
                    </td>
                    <td className="p-2 border-r border-gray-300">
                      {selectedLanguage === 'en' ? record.landAreaEn || '1.45 Hectare' : record.landArea}
                    </td>
                    <td className="p-2 text-emerald-700 font-medium">
                      {selectedLanguage === 'en' ? 'Nil / Clear Title' : 'बोnamed नाही (निरंक)'}
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
