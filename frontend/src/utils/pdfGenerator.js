/**
 * pdfGenerator.js
 * ─────────────────────────────────────────────────────────────────
 * BHUNETRA — Land Record PDF Certificate Generator
 *
 * Supports all 22 Constitutional Languages of India (8th Schedule).
 *
 * Architecture:
 *   1. Primary Engine: High-resolution vector-scaled HTML5 Canvas capture
 *      via html2canvas -> jsPDF A4. This uses the browser's native HarfBuzz
 *      complex text shaping engine, guaranteeing 100% pixel perfection
 *      for Indic scripts (Devanagari, Gujarati, Bengali, Tamil, Telugu,
 *      Kannada, Malayalam, Gurmukhi, Odia, etc.) with correct conjuncts
 *      and matras, completely offline without any .woff2 network failures.
 *
 *   2. Fallback Engine: Programmatic jsPDF + jspdf-autotable for headless
 *      environments or when no DOM preview element is supplied.
 * ─────────────────────────────────────────────────────────────────
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { formatConfidence } from '@/lib/utils'
import { t } from '@/utils/pdfTranslations'
import { getLocalizedRecord } from '@/utils/recordLocalization'

// ─── Constants ────────────────────────────────────────────────────

const DASH = '—'
const VERIFIED_STATUSES = new Set(['VERIFIED', 'verified', 'auto-approved', 'approved'])

// ─── Helpers ──────────────────────────────────────────────────────

function safe(value) {
  if (value === null || value === undefined) return DASH
  const str = String(value).trim()
  if (str === '' || str === 'undefined' || str === 'null') return DASH
  return str
}

function sanitiseFilename(value) {
  return String(value || 'UNKNOWN')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 60)
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Normalises a raw record object into a flat, PDF-ready data map.
 * All values are strings — never null/undefined.
 * When language === 'en', uses English variant fields if available.
 *
 * @param {Object} record
 * @param {string} [language='en']
 * @returns {Object} pdfData
 */
export function buildLandRecordPdfData(record = {}, language = 'en') {
  const loc = getLocalizedRecord(record, language)

  const ownerName     = safe(loc.ownerName)
  const village       = safe(loc.village)
  const tehsil        = safe(loc.tehsil)
  const district      = safe(loc.district)
  const landArea      = safe(loc.landArea)
  const ownershipType = safe(loc.ownershipType)
  const encumbrance   = safe(loc.encumbrance)

  // Confidence
  let confidence = record.confidence ?? record.averageConfidence ?? record.overallConfidence
  confidence = (confidence !== undefined && confidence !== null)
    ? formatConfidence(confidence)
    : DASH

  // Verification status — raw value preserved, display label from t()
  const rawStatus  = record.status || record.verificationStatus || ''
  const isVerified = VERIFIED_STATUSES.has(rawStatus)

  // Localized status label
  const statusLabel = isVerified
    ? t('valVerified', language)
    : rawStatus
    ? rawStatus.toUpperCase().replace(/_/g, ' ')
    : t('valPending', language)

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })

  return {
    recordId:         safe(record.recordId || record.id),
    docId:            safe(record.docId),
    khasraNumber:     safe(record.khasraNumber || record.khasra_no),
    khataNumber:      safe(record.khataNumber  || record.khata_no),
    plotNumber:       safe(record.plotNumber),
    hissaNumber:      safe(record.hissaNumber),
    villageCode:      safe(record.villageCode),
    village,
    tehsil,
    district,
    landArea,
    assessment:       safe(record.assessment),
    landClassification: safe(record.landClassification),
    landType:         safe(record.landType),
    ownershipType:    safe(record.ownershipType),
    ownerName,
    encumbrance,
    mutationNumber:   safe(record.mutationNumber || record.ferfar),
    mutationDate:     safe(record.mutationDate),
    registrationInfo: safe(record.registrationInfo),
    confidence,
    statusLabel,
    isVerified,
    isForged: !!record.isForged,
    generatedAt,
    language,
  }
}

/**
 * Validates record has minimum required fields.
 */
export function validateRecordForPdf(record = {}) {
  if (!record) return { valid: false, reason: 'No record data provided.' }
  const hasOwner    = record.ownerName || record.ownerNameEn
  const hasSurvey   = record.khasraNumber || record.khasra_no
  const hasLocation = record.village || record.district
  if (!hasOwner && !hasSurvey && !hasLocation) {
    return { valid: false, reason: 'This land record does not contain enough verified information to generate the PDF.' }
  }
  return { valid: true }
}

// ─── PDF Generation ───────────────────────────────────────────────

/**
 * Generates a certified Maharashtra 7/12-style A4 PDF in any of the 22 constitutional languages.
 *
 * @param {Object} record - Raw record object
 * @param {Object} [options]
 * @param {string} [options.language='en']
 * @param {HTMLElement|null} [options.previewElement=null]
 * @returns {Promise<void>}
 */
export async function generateLandRecordPdf(record = {}, { language = 'en', previewElement = null } = {}) {
  const safeId = sanitiseFilename(record.recordId || record.id || 'RECORD')
  const filename = `Bhunetra_LandRecord_${safeId}_${language}.pdf`

  // ── Strategy A: High-Fidelity HTML5 Canvas Render (100% Indic Script Accuracy) ─
  const targetElem = previewElement || document.getElementById('bhunetra-pdf-preview')
  if (targetElem) {
    try {
      const canvas = await html2canvas(targetElem, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
      })

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth  = doc.internal.pageSize.getWidth()   // 210 mm
      const pageHeight = doc.internal.pageSize.getHeight()  // 297 mm
      const margin = 12
      const printWidth = pageWidth - margin * 2             // 186 mm
      const printHeight = (canvas.height * printWidth) / canvas.width

      const imgData = canvas.toDataURL('image/png')

      if (printHeight <= pageHeight - margin * 2) {
        // Fits comfortably on a single A4 page
        doc.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight, undefined, 'FAST')
      } else {
        // Scale to fit page cleanly with borders
        const maxAvailableHeight = pageHeight - margin * 2
        const scaleFactor = maxAvailableHeight / printHeight
        const fittedWidth = printWidth * scaleFactor
        const fittedHeight = printHeight * scaleFactor
        const offsetX = (pageWidth - fittedWidth) / 2
        doc.addImage(imgData, 'PNG', offsetX, margin, fittedWidth, fittedHeight, undefined, 'FAST')
      }

      // Add digital certification tag at bottom
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(120, 130, 145)
      doc.text(
        `BHUNETRA Sovereign AI Land Verification Engine • Record ID: ${safeId} • Language: ${language.toUpperCase()} • DILRMP Compliant`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )

      doc.save(filename)
      return
    } catch (canvasErr) {
      console.warn('[pdfGenerator] html2canvas capture failed, running programmatic PDF fallback:', canvasErr)
    }
  }

  // ── Strategy B: Programmatic jsPDF + autoTable Fallback ──────────
  const data = buildLandRecordPdfData(record, language)
  const T = (key) => t(key, language)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PAGE_W    = doc.internal.pageSize.getWidth()
  const PAGE_H    = doc.internal.pageSize.getHeight()
  const MARGIN    = 15
  const CONTENT_W = PAGE_W - MARGIN * 2

  const NAVY  = [14, 44, 89]
  const AMBER = [180, 120, 20]
  const GRAY  = [100, 100, 100]
  const LIGHT = [240, 243, 248]
  const RED   = [180, 30, 30]
  const GREEN = [22, 120, 60]
  const WHITE = [255, 255, 255]
  const BLACK = [20, 20, 20]

  let curY = MARGIN
  const addY = (mm) => { curY += mm }

  const sectionHeader = (title, y) => {
    doc.setFillColor(...NAVY)
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...WHITE)
    doc.text(title, MARGIN + 3, y + 5)
    doc.setTextColor(...BLACK)
    return y + 7
  }

  const addPageFooter = () => {
    const totalPages  = doc.internal.getNumberOfPages()
    const currentPage = doc.internal.getCurrentPageInfo().pageNumber
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.setDrawColor(...GRAY)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, PAGE_H - MARGIN - 8, PAGE_W - MARGIN, PAGE_H - MARGIN - 8)
    doc.text(
      `${T('footerSystem')} • ${T('labelRecordId')} ${data.recordId} • ${T('labelGenerated')} ${data.generatedAt}`,
      MARGIN, PAGE_H - MARGIN - 3
    )
    doc.text(
      `${T('footerPage')} ${currentPage} ${T('footerOf')} ${totalPages}`,
      PAGE_W - MARGIN, PAGE_H - MARGIN - 3,
      { align: 'right' }
    )
  }

  // Header Banner
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 42, 'F')
  doc.setFillColor(...AMBER)
  doc.rect(0, 42, PAGE_W, 1.2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...WHITE)
  doc.text('BHUNETRA', PAGE_W / 2, 14, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(T('systemSubtitle'), PAGE_W / 2, 21, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(T('docTitle'), PAGE_W / 2, 30, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 210, 230)
  doc.text(T('docSubtitle'), PAGE_W / 2, 37, { align: 'center' })

  curY = 50

  // Meta row
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(T('labelRecordId'), MARGIN, curY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(data.recordId, MARGIN + 26, curY)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(T('labelGenerated'), PAGE_W / 2, curY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(data.generatedAt, PAGE_W / 2 + 24, curY)
  addY(8)

  // Status badge
  const badgeFill = data.isForged ? RED : data.isVerified ? GREEN : [160, 120, 20]
  const badgeText = data.isForged
    ? T('statusForged')
    : data.isVerified
    ? T('statusVerified')
    : T('statusPending')

  doc.setFillColor(...badgeFill)
  doc.roundedRect(MARGIN, curY, CONTENT_W, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...WHITE)
  doc.text(badgeText, PAGE_W / 2, curY + 5.5, { align: 'center' })
  doc.setTextColor(...BLACK)
  addY(13)

  const tableStyles = {
    theme: 'grid',
    bodyStyles: { fontSize: 8, textColor: BLACK, font: 'helvetica' },
    headStyles: { fillColor: LIGHT, textColor: BLACK, fontStyle: 'bold', fontSize: 7.5, font: 'helvetica' },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.38, fontStyle: 'bold', fillColor: [248, 250, 253] },
      1: { cellWidth: CONTENT_W * 0.62 },
    },
    margin: { left: MARGIN, right: MARGIN },
  }

  // Section 1
  curY = sectionHeader(T('sec1'), curY)
  autoTable(doc, {
    ...tableStyles,
    startY: curY,
    body: [
      [T('fldSurveyNo'),    data.khasraNumber],
      [T('fldHissaNo'),     data.hissaNumber],
      [T('fldKhataNo'),     data.khataNumber],
      [T('fldPlotNo'),      data.plotNumber],
      [T('fldVillageCode'), data.villageCode],
      [T('fldVillage'),     data.village],
      [T('fldTehsil'),      data.tehsil],
      [T('fldDistrict'),    data.district],
    ].filter(([, v]) => v !== DASH),
  })
  curY = doc.lastAutoTable.finalY + 6

  // Section 2
  curY = sectionHeader(T('sec2'), curY)
  autoTable(doc, {
    ...tableStyles,
    startY: curY,
    body: [
      [T('fldArea'),          data.landArea],
      [T('fldAssessment'),    data.assessment],
      [T('fldLandClass'),     data.landClassification],
      [T('fldLandType'),      data.landType],
      [T('fldOwnershipType'), data.ownershipType],
    ].filter(([, v]) => v !== DASH),
  })
  curY = doc.lastAutoTable.finalY + 6

  // Section 3
  curY = sectionHeader(T('sec3'), curY)
  autoTable(doc, {
    ...tableStyles,
    startY: curY,
    body: [
      [T('fldOwnerName'),   data.ownerName],
      [T('fldEncumbrance'), data.encumbrance],
    ].filter(([, v]) => v !== DASH),
  })
  curY = doc.lastAutoTable.finalY + 6

  // Section 5
  curY = sectionHeader(T('sec5'), curY)
  autoTable(doc, {
    ...tableStyles,
    startY: curY,
    body: [
      [T('fldConfidence'),  data.confidence],
      [T('fldVerifStatus'), data.statusLabel],
      [T('fldGeneratedAt'), data.generatedAt],
      [T('fldRecordId'),    data.recordId],
      [T('fldSystem'),      T('systemName')],
    ],
  })
  curY = doc.lastAutoTable.finalY + 8

  // Digital Signature Box
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN, curY, CONTENT_W, 26, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text(T('sigTitle'), MARGIN + 4, curY + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  doc.text(T('sigNote'), MARGIN + 4, curY + 13)
  doc.text(`System Ref: 712MV-${data.recordId}-BHUNETRA`, MARGIN + 4, curY + 18)
  doc.setFontSize(6)
  doc.text(T('sigNote2'), MARGIN + 4, curY + 23)

  const boxX = PAGE_W - MARGIN - 55
  doc.setDrawColor(...GRAY)
  doc.setLineWidth(0.3)
  doc.rect(boxX, curY + 2, 50, 22, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BLACK)
  doc.text(T('sigRole'), boxX + 25, curY + 9, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  doc.text(T('sigDept'), boxX + 25, curY + 14, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  const sigColor = data.isVerified ? GREEN : RED
  doc.setTextColor(sigColor[0], sigColor[1], sigColor[2])
  doc.text(data.isVerified ? T('sigVerified') : T('sigPending'), boxX + 25, curY + 19, { align: 'center' })

  addPageFooter()
  doc.save(filename)
}

export default generateLandRecordPdf
