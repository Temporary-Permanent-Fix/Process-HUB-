import type { Status } from '../types/tool'
import { STATUS_LABELS } from '../types/tool'

const STATUS_DOT_CLASS: Record<Status, string> = {
  online: 'bg-status-online shadow-glowOnline',
  vyvoj: 'bg-status-vyvoj',
  chyba: 'bg-status-chyba',
}

const STATUS_TEXT_CLASS: Record<Status, string> = {
  online: 'text-status-online',
  vyvoj: 'text-status-vyvoj',
  chyba: 'text-status-chyba',
}

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
      <span className={STATUS_TEXT_CLASS[status]}>{STATUS_LABELS[status]}</span>
    </span>
  )
}
