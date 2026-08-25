import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import {
  Database,
  Search,
  Filter,
  MapPin,
  FileCheck2,
  AlertTriangle,
  Download,
  Eye,
  Layers,
} from 'lucide-react'

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [districtFilter, setDistrictFilter] = useState('All')

  const mockRecords = [
    {
      recordId: 'REC-712-PUN-001',
      khasraNumber: '142/2-अ',
      khataNumber: '894',
      ownerName: 'बाबूराव रामचंद्र पाटील (Baburao Patil)',
      district: 'Pune',
      village: 'हवेली (Haveli)',
      landArea: '0.45 Ha',
      confidence: 0.94,
      status: 'auto-approved',
      date: '2026-08-25',
    },
    {
      recordId: 'REC-712-NSK-002',
      khasraNumber: '88/1-ब',
      khataNumber: '312',
      ownerName: 'सखाराम गोपाळ कांबळे (Sakharam Kamble)',
      district: 'Nashik',
      village: 'दिंडोरी (Dindori)',
      landArea: '1.20 Ha',
      confidence: 0.91,
      status: 'auto-approved',
      date: '2026-08-24',
    },
    {
      recordId: 'REC-712-NGP-003',
      khasraNumber: '204/5',
      khataNumber: '571',
      ownerName: 'ज्ञानेश्वर विठ्ठल देशमुख (Dnyaneshwar Deshmukh)',
      district: 'Nagpur',
      village: 'उमरेड (Umred)',
      landArea: '0.85 Ha',
      confidence: 0.88,
      status: 'auto-approved',
      date: '2026-08-24',
    },
    {
      recordId: 'REC-712-AUR-004',
      khasraNumber: '56/3',
      khataNumber: '109',
      ownerName: 'अनिल वसंतराव शिंदे (Anil Shinde)',
      district: 'Aurangabad',
      village: 'पैठण (Paithan)',
      landArea: '2.10 Ha',
      confidence: 0.72,
      status: 'pending-review',
      date: '2026-08-23',
    },
  ]

  const filteredRecords = mockRecords.filter((r) => {
    const matchesSearch =
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.khasraNumber.includes(searchTerm) ||
      r.khataNumber.includes(searchTerm) ||
      r.village.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDistrict = districtFilter === 'All' || r.district === districtFilter
    return matchesSearch && matchesDistrict
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald" className="text-[10px] uppercase font-mono">
              Module 4 · Land Registry & GIS
            </Badge>
            <span className="text-xs text-slate-400">Integrated DILRMP Data</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-400" />
            Digitized Land Records & Registry
          </h1>
        </div>

        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Export DILRMP CSV</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Owner Name, Khasra/Survey No, Khata No, or Village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-950/80 border-slate-700 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto"
          >
            <option value="All">All Districts (महाराष्ट्र)</option>
            <option value="Pune">Pune</option>
            <option value="Nashik">Nashik</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Aurangabad">Aurangabad</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Record ID</th>
                <th className="px-4 py-3.5">Khasra / Survey No</th>
                <th className="px-4 py-3.5">Khata No</th>
                <th className="px-4 py-3.5">Owner Name (खातेदार)</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Area</th>
                <th className="px-4 py-3.5">Confidence</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.recordId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">{r.recordId}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{r.khasraNumber}</td>
                  <td className="px-4 py-3.5 text-slate-300">{r.khataNumber}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">{r.ownerName}</td>
                  <td className="px-4 py-3.5 text-slate-400">{r.village}, {r.district}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{r.landArea}</td>
                  <td className="px-4 py-3.5">
                    <ConfidenceBadge score={r.confidence} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={r.status === 'auto-approved' ? 'emerald' : 'amber'} className="text-[10px]">
                      {r.status === 'auto-approved' ? 'Auto-Approved' : 'Pending Review'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
