import React from 'react'

export function Footer() {
  return (
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

        {/* Center: Official Government Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
          <a href="https://bhulekh.mahabhumi.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">महाभूलेख पोर्टल</a>
          <span>|</span>
          <a href="https://dilrmp.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">DILRMP Central Gateway</a>
          <span>|</span>
          <a href="https://mahabhumi.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">ई-फेरफार प्रणाली</a>
        </div>

        {/* Right: Official NIC Developer Attribution */}
        <div className="flex flex-col items-center md:items-end text-[10px] text-slate-400">
          <span>सामग्री मालकी: महसूल विभाग, महाराष्ट्र शासन</span>
          <span className="text-slate-400 font-medium mt-0.5">
            National Informatics Centre (NIC) Land Records Division
          </span>
        </div>
      </div>
    </footer>
  )
}
