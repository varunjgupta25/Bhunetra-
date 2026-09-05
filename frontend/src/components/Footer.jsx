import React, { useState } from 'react'
import { SihTeamModal } from '@/components/SihTeamModal'

export function Footer() {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-[#0A1E3F] text-slate-300 text-xs py-6 border-t-4 border-amber-500 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Official Government Disclaimer */}
          <div className="flex flex-col text-left">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <span>भूनेत्रा - महाराष्ट्र राज्य भूमी अभिलेख संगणकीकरण प्रणाली</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              महसूल व वन विभाग, महाराष्ट्र शासन | Digital India Land Records Modernization Programme (DILRMP)
            </span>
          </div>

          {/* Center: Official Government Links & SIH Team Trigger */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
            <a href="https://bhulekh.mahabhumi.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">महाभूलेख पोर्टल</a>
            <span>|</span>
            <a href="https://dilrmp.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">DILRMP Central Gateway</a>
            <span>|</span>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              type="button"
              className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/30"
            >
              <span>💡</span>
              <span>SIH 2026 · Team Code.IT (ID: 121124)</span>
            </button>
          </div>

          {/* Right: Official NIC Developer Attribution */}
          <div className="flex flex-col items-center md:items-end text-[10px] text-slate-400">
            <span>सामग्री मालकी: महसूल विभाग, महाराष्ट्र शासन</span>
            <span className="text-amber-300 font-medium mt-0.5">
              © २०२६ Smart India Hackathon · Team Code.IT (SLRTCE)
            </span>
          </div>
        </div>
      </footer>

      {/* SIH Team Details Modal */}
      <SihTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </>
  )
}
