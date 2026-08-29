import React from 'react'

export function NonLandRecordModal({ isOpen, onClose, fileName }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white border-2 border-red-500 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-center p-6 space-y-5 animate-scaleUp">
        {/* Rejection Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 border-4 border-red-200 flex items-center justify-center mx-auto text-4xl shadow-inner">
          🚫
        </div>

        <div>
          <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest inline-block mb-2">
            STRICT REJECTION TRIGGERED
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            THE UPLOADED DOCUMENT IS NOT A LAND RECORD
          </h3>
          {fileName && (
            <p className="text-xs font-mono text-red-600 mt-2 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 inline-block font-bold">
              File: {fileName}
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-2.5">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Why was this document rejected?</span>
          </p>
          <p className="leading-relaxed">
            Bhunetra AI is strictly built for <strong>Mahabhulekh Land Records (7/12 सातबारा &amp; 8A Extracts)</strong>. Non-land record files (invoices, ID cards, bills, resumes, general PDFs) are directly blocked to maintain Indian data sovereignty &amp; system integrity.
          </p>
          <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 p-2 rounded border border-amber-200">
            💡 Please upload an official 7/12 (सातबारा) land extract or one of the official demo papers (Paper 1, Paper 2, Paper 3, or Paper 4).
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          type="button"
        >
          UNDERSTOOD &amp; CLOSE
        </button>
      </div>
    </div>
  )
}
