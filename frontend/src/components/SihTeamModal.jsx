import React from 'react'

export function SihTeamModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const teamMembers = [
    {
      role: 'LEADER',
      name: 'Varun Jayshankar Gupta',
      email: 'varun.j.gupta25@slrtce.in',
      phone: '9321847596',
      gender: 'Male',
      isLeader: true,
    },
    {
      role: 'TEAM_MEMBER',
      name: 'Aakash Bhagawatiprasad Gupta',
      email: 'aakash.b.gupta25@slrtce.in',
      phone: '9152553449',
      gender: 'Male',
      isLeader: false,
    },
    {
      role: 'TEAM_MEMBER',
      name: 'Abhishek Sanjay Gupta',
      email: 'abhishek1.s.gupta25@slrtce.in',
      phone: '7257915522',
      gender: 'Male',
      isLeader: false,
    },
    {
      role: 'TEAM_MEMBER',
      name: 'Dhruv Gunvantbhai Mevada',
      email: 'dhruv.g.mevada25@slrtce.in',
      phone: '9152252124',
      gender: 'Male',
      isLeader: false,
    },
    {
      role: 'TEAM_MEMBER',
      name: 'Akash Sanjay Yadav',
      email: 'akash.s.yadav25@slrtce.in',
      phone: '8591396027',
      gender: 'Male',
      isLeader: false,
    },
    {
      role: 'TEAM_MEMBER',
      name: 'Sneha Pramodkumar Gupta',
      email: 'sneha.p.gupta25@slrtce.in',
      phone: '9137797120',
      gender: 'Female',
      isLeader: false,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F4F6F9] dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#0F2C59] via-[#163A72] to-[#0A1E3F] px-6 py-4 flex items-center justify-between border-b-2 border-amber-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 border border-amber-400/40 rounded-xl flex items-center justify-center text-xl shadow-inner">
              💡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-sm tracking-wider uppercase">
                  SMART INDIA HACKATHON 2026
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-400/30 font-mono font-bold">
                  OFFICIAL SUBMISSION
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Team Detail · Team Code.IT (ID: 121124)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section Title */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Team Detail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Project: <span className="font-bold text-slate-700 dark:text-slate-300">BHUNETRA — Sovereign Land Record Digitization &amp; Forensic ELA Verification Engine</span>
            </p>
          </div>

          {/* 4 Gradient Summary Cards Grid (Exact SIH Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Team Name (Blue Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white p-4 shadow-md flex flex-col justify-between min-h-[110px]">
              {/* Background watermark icon */}
              <div className="absolute right-2 bottom-1 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">badge</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-100">
                Team Name
              </span>
              <span className="text-xl font-black tracking-tight text-white relative z-10">
                Team Code.IT
              </span>
            </div>

            {/* Card 2: Team Leader Name (Green Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#84cc16] to-[#16a34a] text-white p-4 shadow-md flex flex-col justify-between min-h-[110px]">
              <div className="absolute right-2 bottom-1 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">groups</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-lime-100">
                Team Leader Name
              </span>
              <span className="text-lg font-black tracking-tight text-white relative z-10">
                Varun Jayshankar Gupta
              </span>
            </div>

            {/* Card 3: Team ID (Purple Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#a855f7] to-[#4f46e5] text-white p-4 shadow-md flex flex-col justify-between min-h-[110px]">
              <div className="absolute right-2 bottom-1 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">account_balance</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
                Team ID
              </span>
              <span className="text-2xl font-black tracking-tight text-white relative z-10">
                121124
              </span>
            </div>

            {/* Card 4: College Name (Teal/Cyan Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] text-white p-4 shadow-md flex flex-col justify-between min-h-[110px]">
              <div className="absolute right-2 bottom-1 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">description</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
                College Name
              </span>
              <span className="text-[13px] font-bold leading-snug text-white relative z-10 line-clamp-2">
                SHREE L R TIWARI COLLEGE OF ENGINEERING, THANE
              </span>
            </div>
          </div>

          {/* Team Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-[#581c87] dark:text-purple-300 flex items-center gap-1.5">
                <span>Team Members</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  (6 Members Active)
                </span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                Institute Code: SLRTCE
              </span>
            </div>

            {/* Table (Pixel-perfect SIH format) */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#222222] text-white font-bold">
                    <th className="py-3 px-4 uppercase tracking-wider">Member Role</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Member Name</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Member Email</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Member Phone</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Member Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {teamMembers.map((member, idx) => (
                    <tr
                      key={member.email}
                      className={
                        idx % 2 === 0
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          : 'bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                      }
                    >
                      <td className="py-3 px-4 font-bold">
                        {member.isLeader ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-extrabold text-[11px] border border-amber-300 dark:border-amber-700">
                            👑 LEADER
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono text-[11px]">
                            TEAM_MEMBER
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {member.email}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {member.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {member.gender}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3 border-t border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <span>Copyright © 2026 SIH · Team Code.IT. All rights reserved.</span>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-1.5 bg-[#0F2C59] hover:bg-[#163A72] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  )
}
