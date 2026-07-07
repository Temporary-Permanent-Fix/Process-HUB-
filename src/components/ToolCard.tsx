import { useState } from 'react'
import { ExternalLink, Pencil, Trash2, Check, X } from 'lucide-react'
import type { Tool } from '../types/tool'
import { getIcon } from '../lib/icons'
import StatusBadge from './StatusBadge'
import PurposeBadge from './PurposeBadge'
import RivetCorners from './RivetCorners'

const PURPOSE_ICON_BG: Record<Tool['purpose'], string> = {
  analyza: 'bg-purpose-analyza/15 text-purpose-analyza border-purpose-analyza/40',
  predikcia: 'bg-purpose-predikcia/15 text-purpose-predikcia border-purpose-predikcia/40',
  fakturacia: 'bg-purpose-fakturacia/15 text-purpose-fakturacia border-purpose-fakturacia/40',
}

interface ToolCardProps {
  tool: Tool
  canEdit: boolean
  onEdit: (tool: Tool) => void
  onDelete: (id: string) => void
}

export default function ToolCard({ tool, canEdit, onEdit, onDelete }: ToolCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const Icon = getIcon(tool.icon)
  const canOpen = tool.status !== 'chyba' && !!tool.url

  return (
    <div className="rivets relative flex flex-col gap-3 rounded border border-border bg-panel p-4 transition-colors hover:bg-panelHover hover:border-borderStrong">
      <RivetCorners />

      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border ${PURPOSE_ICON_BG[tool.purpose]}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl font-bold uppercase leading-tight tracking-wide text-text">
            {tool.name}
          </h3>
          <div className="mt-1">
            <PurposeBadge purpose={tool.purpose} />
          </div>
        </div>
      </div>

      {tool.note && <p className="text-xs leading-relaxed text-textDim">{tool.note}</p>}

      <div className="mt-auto flex items-center justify-between pt-2">
        <StatusBadge status={tool.status} />
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <a
          href={canOpen ? tool.url : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!canOpen}
          onClick={(e) => {
            if (!canOpen) e.preventDefault()
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-2 py-1.5 text-xs uppercase tracking-wide transition-colors ${
            canOpen
              ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
              : 'cursor-not-allowed border-border text-textFaint'
          }`}
        >
          <ExternalLink size={14} />
          Otvoriť
        </a>

        {canEdit &&
          (confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onDelete(tool.id)}
                className="flex items-center justify-center rounded border border-status-chyba/50 bg-status-chyba/15 p-1.5 text-status-chyba hover:bg-status-chyba/25"
                aria-label="Potvrdiť zmazanie"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex items-center justify-center rounded border border-border p-1.5 text-textDim hover:bg-panelHover"
                aria-label="Zrušiť zmazanie"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(tool)}
                className="flex items-center justify-center rounded border border-border p-1.5 text-textDim hover:bg-panelHover hover:text-text"
                aria-label="Upraviť"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center justify-center rounded border border-border p-1.5 text-textDim hover:border-status-chyba/50 hover:text-status-chyba"
                aria-label="Zmazať"
              >
                <Trash2 size={14} />
              </button>
            </>
          ))}
      </div>
    </div>
  )
}
