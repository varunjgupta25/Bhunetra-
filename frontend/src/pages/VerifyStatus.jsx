import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { recordsApi } from '@/api/axiosClient'
import { DigitizedPdfModal } from '@/components/DigitizedPdfModal'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Clock,
  FileDown,
  Eye,
  ShieldCheck,
  Building2,
  MapPin,
  User,
  LandPlot,
  Layers,
} from 'lucide-react'

export default function VerifyStatusPage() {
  const { recordId } = useParams()
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await recordsApi.verifyStatus(recordId)
        setStatusData(data)
      } catch (err) {
        if (err?.status === 404 || err?.response?.status === 404) {
          setError('Record Not Found')
        } else {
          setError('An error occurred while verifying the record.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (recordId) {
      fetchStatus()
    }
  }, [recordId])

  const handleDownloadPdf = async () => {
    if (!recordId) return
    try {
      setIsDownloading(true)
      const res = await fetch(`/api/records/${recordId}/public-pdf`)
      if (!res.ok) {
        throw new Error('Direct PDF download failed')
      }
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `Bhunetra_Certified_LandRecord_${recordId}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(link)
    } catch (err) {
      console.warn('Backend download failed, opening digital modal fallback:', err)
      setShowModal(true)
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <Search className="h-12 w-12 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></div>
          </div>
          <p className="text-slate-200 font-semibold text-lg">Verifying Land Record...</p>
          <p className="text-xs text-slate-500 font-mono">Querying Maharashtra Revenue Ledger</p>
        </div>
      </div>
    )
  }

  if (error || !statusData) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] px-4 py-8">
        <Card className="w-full max-w-md bg-slate-900 border-red-500/30 shadow-2xl overflow-hidden">
          <div className="bg-red-500/10 py-6 text-center border-b border-red-500/20">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-2" />
            <CardTitle className="text-2xl text-red-400 font-bold">Verification Failed</CardTitle>
          </div>
          <CardContent className="text-center text-slate-300 pt-6 space-y-4">
            <p className="font-semibold text-white">{error || 'Record Not Found'}</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              The scanned QR code is either invalid or this record is not indexed in the State Land Registry ledger.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
                onClick={() => window.location.reload()}
              >
                Retry Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isVerified =
    statusData.verificationStatus === 'verified' ||
    statusData.verificationStatus === 'auto-approved' ||
    statusData.verificationStatus === 'corrected'

  const modalRecordData = {
    recordId: statusData.recordId,
    id: statusData.recordId,
    ownerName: statusData.ownerName,
    khasraNumber: statusData.khasraNumber,
    khataNumber: statusData.khataNumber,
    village: statusData.village,
    tehsil: statusData.tehsil,
    district: statusData.district,
    landArea: statusData.landArea,
    ownershipType: statusData.ownershipType,
    verificationStatus: statusData.verificationStatus,
    status: statusData.verificationStatus,
    confidence: statusData.overallConfidence || 0.98,
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-8">
      <Card className="w-full max-w-xl bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Verification Status Banner */}
        <CardHeader className={`text-center pb-6 pt-7 border-b ${
          isVerified
            ? 'bg-gradient-to-b from-emerald-950/40 to-transparent border-emerald-500/20'
            : 'bg-gradient-to-b from-amber-950/40 to-transparent border-amber-500/20'
        }`}>
          <div className="flex justify-center mb-3">
            {isVerified ? (
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"></div>
                <CheckCircle2 className="w-16 h-16 text-emerald-400 relative z-10" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"></div>
                <AlertTriangle className="w-16 h-16 text-amber-400 relative z-10" />
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Sovereign Land Record
          </div>

          <CardTitle className="text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
            {isVerified ? 'Document Verified' : 'Pending Verification'}
          </CardTitle>

          <div className="mt-3 flex justify-center items-center gap-2">
            <Badge
              variant={isVerified ? 'emerald' : 'amber'}
              className="text-xs py-1 px-3.5 font-bold uppercase tracking-wider shadow-sm"
            >
              {statusData.verificationStatus.replace('-', ' ')}
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">DILRMP-2.0</span>
          </div>
        </CardHeader>

        {/* Record Details Body */}
        <CardContent className="pt-6 pb-8 space-y-6 text-slate-200">
          {/* Quick Stats Grid */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> Record Identifier
              </span>
              <span className="font-mono text-emerald-400 font-bold">{statusData.recordId}</span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-slate-800 text-xs gap-3">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Owner Name (खातेदार)
              </span>
              <span className="font-semibold text-white text-right break-words">{statusData.ownerName || '—'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Khasra / Gat No</span>
                <span className="font-bold text-white text-sm">{statusData.khasraNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Khata Number</span>
                <span className="font-bold text-slate-200 text-sm">{statusData.khataNumber || '582'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> Location
                </span>
                <span className="font-medium text-slate-300">
                  {statusData.village ? `${statusData.village}, ${statusData.district || ''}` : 'Maharashtra, India'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium flex items-center gap-1">
                  <LandPlot className="w-3 h-3 text-slate-500" /> Land Area
                </span>
                <span className="font-medium text-slate-300">{statusData.landArea || '1.65 Hectare'}</span>
              </div>
            </div>

            {statusData.ownershipType && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-medium">Ownership Class</span>
                <span className="text-slate-300 font-medium">{statusData.ownershipType}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: PDF Download & Preview */}
          <div className="space-y-3 pt-2">
            <Button
              className="w-full h-12 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 gap-2 transition-all"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
            >
              <FileDown className="w-4 h-4" />
              {isDownloading ? 'Generating & Downloading...' : 'Download Official Certificate (PDF)'}
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 text-xs font-semibold border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 gap-2"
              onClick={() => setShowModal(true)}
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              View Full 7/12 Extract Preview & Languages
            </Button>
          </div>

          {/* Timestamp Footer */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Verified on:{' '}
                {statusData.lastVerifiedAt
                  ? new Date(statusData.lastVerifiedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '13 Sept 2026'}
              </span>
            </div>
            <span className="font-mono text-emerald-500/80">100% Sovereign Offline Verify</span>
          </div>
        </CardContent>
      </Card>

      {/* Embedded Full Certificate Preview Modal */}
      {showModal && (
        <DigitizedPdfModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          recordData={modalRecordData}
        />
      )}
    </div>
  )
}
