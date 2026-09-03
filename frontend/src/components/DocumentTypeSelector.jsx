import React from 'react'

/**
 * DOCUMENT TYPE DEFINITIONS
 * Internal values are clean enum-like strings; display labels are separate.
 */
export const DOCUMENT_TYPES = [
  {
    value: '7_12',
    label: '7/12 Utara',
    labelNative: '७/१२ उतारा',
    icon: 'description',
    description: 'Land ownership, cultivation and agricultural land details.',
    example: 'Example: 7/12 Extract / Saat-Baara Utara',
    color: 'emerald',
  },
  {
    value: '8A',
    label: '8A Extract',
    labelNative: '8A खाता उतारा',
    icon: 'assignment',
    description: 'Landholding and account-related information.',
    example: 'Example: 8A Khata Extract',
    color: 'blue',
  },
  {
    value: 'PROPERTY_CARD',
    label: 'Property Card',
    labelNative: 'मालमत्ता पत्रक',
    icon: 'home_work',
    description: 'Urban property ownership and property details.',
    example: 'Example: Property Card / मालमत्ता पत्रक',
    color: 'violet',
  },
  {
    value: 'MUTATION',
    label: 'Mutation / Ferfar',
    labelNative: 'फेरफार / नोंद',
    icon: 'sync_alt',
    description: 'Records showing changes in land ownership or land records.',
    example: 'Example: Ferfar Entry / Mutation Entry',
    color: 'amber',
  },
]

export const OTHER_DOCUMENT_TYPE = {
  value: 'OTHER',
  label: 'Other Land Document',
  labelNative: 'इतर जमीन दस्तावेज',
  icon: 'folder_open',
  description: 'Upload another land-related document not listed above.',
  example: 'Example: Sale Deed, Gift Deed, Partition Deed, NA Order, etc.',
  color: 'slate',
}

const ALL_DOC_TYPES = [...DOCUMENT_TYPES, OTHER_DOCUMENT_TYPE]

/** Map a documentType value back to its display label */
export function getDocumentTypeLabel(value) {
  if (!value) return ''
  return ALL_DOC_TYPES.find((d) => d.value === value)?.label || value
}

/** Map a documentType value back to its description */
export function getDocumentTypeDescription(value) {
  if (!value) return ''
  return ALL_DOC_TYPES.find((d) => d.value === value)?.description || ''
}

/** Map a documentType value back to its icon */
export function getDocumentTypeIcon(value) {
  if (!value) return 'description'
  return ALL_DOC_TYPES.find((d) => d.value === value)?.icon || 'description'
}

// ─── Colour config per card type ─────────────────────────────────────────────
const COLOR_CONFIG = {
  emerald: {
    idle: 'border-[#B8D8EE] hover:border-[#3DB8A5] hover:bg-[#f0fdfb]',
    selected: 'border-[#006b5e] bg-[#ecfdf9] ring-2 ring-[#006b5e]/30',
    icon: 'bg-[#d1fae5] text-[#006b5e]',
    check: 'bg-[#006b5e] text-white',
  },
  blue: {
    idle: 'border-[#B8D8EE] hover:border-[#3b82f6] hover:bg-[#eff6ff]',
    selected: 'border-[#3b82f6] bg-[#eff6ff] ring-2 ring-[#3b82f6]/30',
    icon: 'bg-[#dbeafe] text-[#1d4ed8]',
    check: 'bg-[#1d4ed8] text-white',
  },
  violet: {
    idle: 'border-[#B8D8EE] hover:border-[#7c3aed] hover:bg-[#f5f3ff]',
    selected: 'border-[#7c3aed] bg-[#f5f3ff] ring-2 ring-[#7c3aed]/30',
    icon: 'bg-[#ede9fe] text-[#6d28d9]',
    check: 'bg-[#6d28d9] text-white',
  },
  amber: {
    idle: 'border-[#B8D8EE] hover:border-[#d97706] hover:bg-[#fffbeb]',
    selected: 'border-[#d97706] bg-[#fffbeb] ring-2 ring-[#d97706]/30',
    icon: 'bg-[#fef3c7] text-[#b45309]',
    check: 'bg-[#b45309] text-white',
  },
  slate: {
    idle: 'border-[#B8D8EE] hover:border-[#475569] hover:bg-[#f8fafc]',
    selected: 'border-[#475569] bg-[#f1f5f9] ring-2 ring-[#475569]/30',
    icon: 'bg-[#e2e8f0] text-[#475569]',
    check: 'bg-[#475569] text-white',
  },
}

// ─── Individual Type Card ─────────────────────────────────────────────────────
function DocumentTypeCard({ doc, selected, onSelect }) {
  const isSelected = selected === doc.value
  const cc = COLOR_CONFIG[doc.color] || COLOR_CONFIG.slate

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select document type: ${doc.label}`}
      onClick={() => onSelect(doc.value)}
      className={`
        w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
        cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
        ${isSelected ? cc.selected + ' shadow-md' : cc.idle + ' shadow-sm hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon bubble */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cc.icon}`}>
          <span className="material-symbols-outlined text-2xl">{doc.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[#0D2B40] text-[15px] leading-tight">
                {doc.label}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {doc.labelNative}
              </p>
            </div>
            {/* Checkmark badge */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                isSelected ? cc.check + ' scale-100 opacity-100' : 'bg-surface-container-highest text-transparent scale-75 opacity-0'
              }`}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-sm fill-1">check</span>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            {doc.description}
          </p>
          <p className="text-xs text-on-surface-variant/70 mt-1.5 italic">
            {doc.example}
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Main Exported Component ──────────────────────────────────────────────────
/**
 * DocumentTypeSelector
 *
 * Props:
 *   selectedType    — current value string or null
 *   onSelect        — (value: string) => void
 *   onContinue      — () => void
 *   validationError — string | null
 */
export function DocumentTypeSelector({ selectedType, onSelect, onContinue, validationError }) {
  return (
    <div className="w-full" role="radiogroup" aria-label="Select document type">
      <div className="bg-surface-container-lowest rounded-[20px] p-card-padding card-shadow border border-[#D0E8F5]">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">article</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
              What type of land document do you want to upload?
            </h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Select the document type to help Bhunetra apply the appropriate extraction
              and validation process.
            </p>
          </div>
        </div>

        {/* ── Validation banner ────────────────────────────────────────── */}
        {validationError && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-xl shrink-0">error</span>
            <span className="text-sm font-medium">{validationError}</span>
          </div>
        )}

        {/* ── 2-col grid for main types ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {DOCUMENT_TYPES.map((doc) => (
            <DocumentTypeCard
              key={doc.value}
              doc={doc}
              selected={selectedType}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* ── Full-width "Other" card ──────────────────────────────────── */}
        <DocumentTypeCard
          doc={OTHER_DOCUMENT_TYPE}
          selected={selectedType}
          onSelect={onSelect}
        />

        {/* ── Continue Button ──────────────────────────────────────────── */}
        <div className="mt-6">
          <button
            id="doc-type-continue-btn"
            type="button"
            onClick={onContinue}
            disabled={!selectedType}
            aria-disabled={!selectedType}
            className={`
              w-full rounded-[16px] py-4 px-6 font-body-lg text-body-lg font-semibold
              flex items-center justify-center gap-2 transition-all duration-200 shadow-md
              ${selectedType
                ? 'bg-primary hover:bg-[#005046] text-on-primary cursor-pointer'
                : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60'}
            `}
          >
            {selectedType ? (
              <>
                <span>Continue</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">touch_app</span>
                <span>Select a document type to continue</span>
              </>
            )}
          </button>
          {!selectedType && (
            <p className="text-center text-xs text-on-surface-variant mt-2" role="status" aria-live="polite">
              Please select a document type before continuing.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
