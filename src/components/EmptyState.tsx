import { SearchX, Inbox } from 'lucide-react'

interface EmptyStateProps {
  hasItems: boolean
  emptyTitle?: string
  emptySubtitle?: string
  filteredTitle?: string
  filteredSubtitle?: string
}

export default function EmptyState({
  hasItems,
  emptyTitle = 'Zatiaľ žiadne nástroje',
  emptySubtitle = 'Pridajte prvý nástroj kliknutím na dlaždicu „Pridať nástroj".',
  filteredTitle = 'Žiadny nástroj nevyhovuje filtru',
  filteredSubtitle = 'Skúste zmeniť vyhľadávanie alebo filter účelu/stavu.',
}: EmptyStateProps) {
  const Icon = hasItems ? SearchX : Inbox

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded border border-border bg-panel py-16 text-center">
      <Icon size={32} className="text-textFaint" />
      <p className="font-display text-xl font-bold uppercase tracking-wide text-textDim">
        {hasItems ? filteredTitle : emptyTitle}
      </p>
      <p className="max-w-sm text-sm text-textFaint">{hasItems ? filteredSubtitle : emptySubtitle}</p>
    </div>
  )
}
