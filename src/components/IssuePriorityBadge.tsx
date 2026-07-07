import type { IssuePriority } from '../types/issue'
import { ISSUE_PRIORITY_LABELS } from '../types/issue'

const PRIORITY_DOT_CLASS: Record<IssuePriority, string> = {
  nizka: 'bg-status-online',
  stredna: 'bg-status-vyvoj',
  vysoka: 'bg-status-chyba shadow-glowChyba',
}

const PRIORITY_TEXT_CLASS: Record<IssuePriority, string> = {
  nizka: 'text-status-online',
  stredna: 'text-status-vyvoj',
  vysoka: 'text-status-chyba',
}

interface IssuePriorityBadgeProps {
  priority: IssuePriority
}

export default function IssuePriorityBadge({ priority }: IssuePriorityBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
      <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT_CLASS[priority]}`} />
      <span className={PRIORITY_TEXT_CLASS[priority]}>{ISSUE_PRIORITY_LABELS[priority]}</span>
    </span>
  )
}
