import type { Purpose } from '../types/tool'
import { PURPOSE_LABELS } from '../types/tool'

const PURPOSE_CLASS: Record<Purpose, string> = {
  analyza: 'text-purpose-analyza border-purpose-analyza/40 bg-purpose-analyza/10',
  predikcia: 'text-purpose-predikcia border-purpose-predikcia/40 bg-purpose-predikcia/10',
  fakturacia: 'text-purpose-fakturacia border-purpose-fakturacia/40 bg-purpose-fakturacia/10',
}

interface PurposeBadgeProps {
  purpose: Purpose
}

export default function PurposeBadge({ purpose }: PurposeBadgeProps) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[11px] uppercase tracking-wide ${PURPOSE_CLASS[purpose]}`}
    >
      {PURPOSE_LABELS[purpose]}
    </span>
  )
}
