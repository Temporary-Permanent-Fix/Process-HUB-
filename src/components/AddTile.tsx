import { Plus } from 'lucide-react'

interface AddTileProps {
  onClick: () => void
  label?: string
}

export default function AddTile({ onClick, label = 'Pridať nástroj' }: AddTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-border text-textFaint transition-colors hover:border-accent/50 hover:text-accent"
    >
      <Plus size={28} strokeWidth={1.5} />
      <span className="font-display text-lg font-bold uppercase tracking-wide">{label}</span>
    </button>
  )
}
