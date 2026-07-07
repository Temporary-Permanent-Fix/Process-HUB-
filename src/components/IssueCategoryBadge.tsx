import type { IssueCategory } from '../types/issue'
import { ISSUE_CATEGORY_LABELS } from '../types/issue'

interface IssueCategoryBadgeProps {
  category: IssueCategory
}

export default function IssueCategoryBadge({ category }: IssueCategoryBadgeProps) {
  return (
    <span className="inline-block rounded border border-borderStrong bg-panelHover px-2 py-0.5 text-[11px] uppercase tracking-wide text-textDim">
      {ISSUE_CATEGORY_LABELS[category]}
    </span>
  )
}
