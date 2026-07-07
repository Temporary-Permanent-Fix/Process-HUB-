import { Paperclip } from 'lucide-react'
import type { Issue } from '../types/issue'
import IssueCategoryBadge from './IssueCategoryBadge'
import IssuePriorityBadge from './IssuePriorityBadge'
import IssueStatusBadge from './IssueStatusBadge'
import RivetCorners from './RivetCorners'

interface IssueCardProps {
  issue: Issue
  onOpen: (issue: Issue) => void
}

export default function IssueCard({ issue, onOpen }: IssueCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(issue)}
      className="rivets relative flex flex-col gap-3 rounded border border-border bg-panel p-4 text-left transition-colors hover:bg-panelHover hover:border-borderStrong"
    >
      <RivetCorners />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-text">
          {issue.title}
        </h3>
        {issue.attachments.length > 0 && (
          <Paperclip size={14} className="mt-1 shrink-0 text-textFaint" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <IssueCategoryBadge category={issue.category} />
        <IssuePriorityBadge priority={issue.priority} />
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-textDim">{issue.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs">
        <IssueStatusBadge status={issue.status} />
        <span className="text-textFaint">
          {issue.assigneeUsername ? `→ ${issue.assigneeUsername}` : issue.reporterUsername}
        </span>
      </div>
    </button>
  )
}
