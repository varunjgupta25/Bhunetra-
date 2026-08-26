import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { recordsApi } from '@/api/axiosClient'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'

export default function VerificationPage() {
  const { user, pendingVerificationCount, decrementPendingCount, lastExtractedResult } = useAppStore()

  const [recordId, setRecordId] = useState('REC-712-PUNE-0941')
  const [formState, setFormState] = useState({
    villageCode: 'MH-PN-SH-0042',
    khasraNumber: '248',
    ownerName: 'Ramesh Baburao Patil',
    area: '1.25',
    notes: '',
  })

  const [isSaved, setIsSaved] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  useEffect(() => {
    // If an extracted result from pipeline exists, seed form state dynamically
    if (lastExtractedResult) {
      setRecordId(lastExtractedResult.recordId || 'REC-712-PUNE-0941')
      const fields = lastExtractedResult.extractedFields || {}
      setFormState({
        villageCode: 'MH-PN-SH-0042',
        khasraNumber: fields.khasraNumber || '248',
        ownerName: fields.ownerName || 'Ramesh Baburao Patil',
        area: fields.landArea || '1.25',
        notes: '',
      })
    }
  }, [lastExtractedResult])

  const handleReset = () => {
    setFormState({
      villageCode: 'MH-PN-SH-0042',
      khasraNumber: '248',
      ownerName: 'Ramesh Baburao Patil',
      area: '1.25',
      notes: '',
    })
    setIsSaved(false)
  }

  const handleApprove = async () => {
    setIsSaved(true)
    decrementPendingCount()

    try {
      // Call backend API PATCH /api/records/{recordId}/verify
      await recordsApi.verifyRecord(recordId, {
        correctedFields: {
          khasraNumber: formState.khasraNumber,
          ownerName: formState.ownerName,
          landArea: formState.area,
        },
        approved: true,
        notes: formState.notes,
      })
    } catch (err) {
      console.warn('Backend API record verification fallback:', err)
    }
  }

  return (
    <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-gutter py-6 md:py-8 flex flex-col gap-6 md:gap-8 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-15 text-amber-600 px-3 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1.5 border border-amber-600/20">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              gavel
            </span>
            Module 3 · Human-in-the-Loop Review
          </span>
          <span className="text-xs text-on-surface-variant font-mono">
            Assigned: {user?.displayName || 'A. R. Shinde'}
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-deep-navy">
          Verification Workspace &amp; OCR Correction
        </h2>
        <p className="text-on-surface-variant max-w-2xl">
          Review extracted data against the original scanned land record. Correct flagged fields below to maintain data integrity.
        </p>
      </div>

      {/* Split View Layout */}
      <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full min-h-[600px]">
        {/* Panel 1: Scanned Document Viewer */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl blue-tint-shadow border border-[#D0E8F5] flex flex-col overflow-hidden relative group h-[500px] xl:h-auto">
          {/* Viewer Header */}
          <div className="bg-surface-container px-4 py-3 border-b border-[#D0E8F5] flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">description</span>
              <span className="font-mono-code text-mono-code text-secondary font-medium">
                #{recordId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 15, 150))}
                className="p-1.5 hover:bg-surface-container-high rounded text-secondary transition-colors cursor-pointer"
                title="Zoom In"
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  zoom_in
                </span>
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 15, 75))}
                className="p-1.5 hover:bg-surface-container-high rounded text-secondary transition-colors cursor-pointer"
                title="Zoom Out"
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  zoom_out
                </span>
              </button>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 hover:bg-surface-container-high rounded text-secondary transition-colors cursor-pointer"
                title="Rotate"
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  rotate_right
                </span>
              </button>
            </div>
          </div>

          {/* Simulated Document Content */}
          <div className="flex-1 bg-[#F9FAFB] p-8 overflow-auto relative flex justify-center items-start">
            <div
              className="bg-white shadow-sm border border-gray-200 w-full max-w-[600px] min-h-[800px] p-8 font-hindi-text text-hindi-text text-gray-800 relative transition-transform duration-300 origin-top"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              }}
            >
              <div className="text-center mb-8 border-b-2 border-gray-400 pb-4">
                <h3 className="text-2xl font-bold mb-2">गाव नमुना ७/१२</h3>
                <p className="text-sm text-gray-600 font-body-md text-body-md">
                  महाराष्ट्र शासन महसूल विभाग
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500 mr-2">गाव:</span> शिरूर</div>
                <div><span className="text-gray-500 mr-2">तालुका:</span> शिरूर</div>
                <div><span className="text-gray-500 mr-2">जिल्हा:</span> पुणे</div>
                <div><span className="text-gray-500 mr-2">वर्ष:</span> २०२३-२०२४</div>
              </div>

              {/* Highlighted Region (Simulating OCR bounding box) */}
              <div className="border border-gray-300 p-4 mb-6 relative group/box">
                <div className="absolute -inset-1 border-2 border-amber-600/50 bg-amber-600/10 rounded pointer-events-none animate-pulse"></div>
                <span className="absolute -top-3 -right-3 bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md shadow-amber-600/20 font-sans z-10 font-bold">
                  !
                </span>
                <table className="w-full text-left text-sm border-collapse">
                  <tbody>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50 w-1/3">
                        गट क्रमांक / Survey No.
                      </th>
                      <td className="border border-gray-300 p-2 font-bold relative">
                        <span className="opacity-40 line-through mr-2">२४B</span>
                        <span className="text-amber-700 bg-amber-50 px-1 rounded border border-amber-300">
                          {formState.khasraNumber}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50">
                        उप-विभाग / Sub-div
                      </th>
                      <td className="border border-gray-300 p-2">१/अ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-300 p-4">
                <table className="w-full text-left text-sm border-collapse">
                  <tbody>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50 w-1/3">
                        खातेदाराचे नाव
                      </th>
                      <td className="border border-gray-300 p-2">{formState.ownerName}</td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50">
                        क्षेत्र (हेक्टर.आर)
                      </th>
                      <td className="border border-gray-300 p-2">{formState.area}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Verification Form */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl blue-tint-shadow border border-[#D0E8F5] flex flex-col relative overflow-hidden h-auto">
          {/* Teal Left Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>

          <div className="px-6 py-5 border-b border-[#D0E8F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">edit_document</span>
              <h3 className="font-headline-md text-headline-md text-deep-navy text-xl">
                Extracted Data Verification
              </h3>
            </div>
            {isSaved && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Approved &amp; Logged to Audit Trail
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              {/* Standard Field */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                  Village Code
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border border-[#B8D8EE] rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent text-gray-500 cursor-not-allowed"
                    readOnly
                    type="text"
                    value={formState.villageCode}
                  />
                  <span
                    className="material-symbols-outlined absolute right-3 top-2.5 text-primary-container"
                    style={{ fontSize: '20px' }}
                  >
                    check_circle
                  </span>
                </div>
              </div>

              {/* Flagged Field (Khasra Number) */}
              <div className="bg-amber-50/50 -mx-4 px-4 py-4 rounded-lg border border-amber-200/50 relative">
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                    Khasra Number (Survey No.)
                  </label>
                  <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      warning
                    </span>
                    ⚠ Flagged for low confidence (42%)
                  </span>
                </div>
                <div className="relative group">
                  <input
                    className="w-full bg-white border-2 border-amber-400 rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-shadow"
                    type="text"
                    value={formState.khasraNumber}
                    onChange={(e) => setFormState({ ...formState, khasraNumber: e.target.value })}
                  />
                  <div className="absolute right-2 top-1.5 flex gap-1">
                    <button
                      className="p-1 text-gray-400 hover:text-primary transition-colors rounded cursor-pointer"
                      title="Accept Original OCR (24B)"
                      type="button"
                      onClick={() => setFormState({ ...formState, khasraNumber: '24B' })}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        history
                      </span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-body-md">
                  OCR suggested &apos;24B&apos; but pattern matching indicates digits only.
                </p>
              </div>

              {/* Standard Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                    Owner Name
                  </label>
                  <input
                    className="w-full bg-white border border-[#B8D8EE] rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    type="text"
                    value={formState.ownerName}
                    onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                    Area (Hectares)
                  </label>
                  <input
                    className="w-full bg-white border border-[#B8D8EE] rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    type="text"
                    value={formState.area}
                    onChange={(e) => setFormState({ ...formState, area: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                  Reviewer Notes (Optional)
                </label>
                <textarea
                  className="w-full bg-white border border-[#B8D8EE] rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all resize-none"
                  placeholder="Add context for manual correction..."
                  rows={3}
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                ></textarea>
              </div>
            </form>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-surface-container-low border-t border-[#D0E8F5] flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-2xl font-label-sm text-xs text-secondary hover:bg-surface-container-highest transition-colors border border-transparent hover:border-[#B8D8EE] cursor-pointer"
                type="button"
              >
                Reset Edits
              </button>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2 rounded-2xl font-label-sm text-xs bg-surface-container-highest text-primary font-semibold hover:bg-surface-container-high transition-colors border border-outline-variant/40 flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export Digitized PDF Certificate
              </button>
            </div>

            <button
              onClick={handleApprove}
              disabled={isSaved}
              className={`px-6 py-2.5 rounded-2xl font-label-sm text-label-sm text-on-primary transition-colors duration-200 shadow-sm flex items-center gap-2 cursor-pointer ${
                isSaved
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-container hover:bg-[#2DA090]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                verified
              </span>
              {isSaved ? 'Approved & Logged' : 'Approve & Save to Audit Trail'}
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Generation Multilingual PDF Selection Modal */}
      <DigitizedPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        recordData={{
          recordId: recordId,
          khasraNumber: formState.khasraNumber,
          khataNumber: '582',
          ownerName: formState.ownerName,
          ownerNameEn: formState.ownerName,
          village: 'खडकवासला',
          villageEn: 'Khadakwasla',
          tehsil: 'हवेली',
          tehsilEn: 'Haveli',
          district: 'पुणे',
          districtEn: 'Pune',
          landArea: `${formState.area} हेक्टर`,
          landAreaEn: `${formState.area} Hectares`,
        }}
        onConfirmExport={(lang) => {
          console.log(`[PDF Generator] Certificate generated directly in ${lang} language`)
        }}
      />
    </main>
  )
}
