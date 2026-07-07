import { SearchX, Inbox } from 'lucide-react'

interface EmptyStateProps {
  hasTools: boolean
}

export default function EmptyState({ hasTools }: EmptyStateProps) {
  const Icon = hasTools ? SearchX : Inbox

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded border border-border bg-panel py-16 text-center">
      <Icon size={32} className="text-textFaint" />
      <p className="font-display text-xl font-bold uppercase tracking-wide text-textDim">
        {hasTools ? 'Žiadny nástroj nevyhovuje filtru' : 'Zatiaľ žiadne nástroje'}
      </p>
      <p className="max-w-sm text-sm text-textFaint">
        {hasTools
          ? 'Skúste zmeniť vyhľadávanie alebo filter účelu/stavu.'
          : 'Pridajte prvý nástroj kliknutím na dlaždicu „Pridať nástroj".'}
      </p>
    </div>
  )
}
