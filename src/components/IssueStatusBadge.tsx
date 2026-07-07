import type { IssueStatus } from '../types/issue'
import { ISSUE_STATUS_LABELS } from '../types/issue'

const STATUS_DOT_CLASS: Record<IssueStatus, string> = {
  open: 'bg-textDim',
  in_progress: 'bg-accent shadow-[0_0_6px_2px_rgba(110,198,217,0.5)]',
  resolved: 'bg-status-online shadow-glowOnline',
  closed: 'bg-textFaint',
}

const STATUS_TEXT_CLASS: Record<IssueStatus, string> = {
  open: 'text-textDim',
  in_progress: 'text-accent',
  resolved: 'text-status-online',
  closed: 'text-textFaint',
}

interface IssueStatusBadgeProps {
  status: IssueStatus
}

export default function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
      <span className={STATUS_TEXT_CLASS[status]}>{ISSUE_STATUS_LABELS[status]}</span>
    </span>
  )
}
