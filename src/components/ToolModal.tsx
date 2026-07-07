import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Purpose, Status, Tool } from '../types/tool'
import { PURPOSE_LABELS, STATUS_DESCRIPTIONS, STATUS_LABELS } from '../types/tool'
import { ICON_NAMES } from '../lib/icons'
import IconPicker from './IconPicker'

const PURPOSES: Purpose[] = ['analyza', 'predikcia', 'fakturacia']
const STATUSES: Status[] = ['online', 'vyvoj', 'chyba']

const PURPOSE_ACTIVE_CLASS: Record<Purpose, string> = {
  analyza: 'border-purpose-analyza bg-purpose-analyza/15 text-purpose-analyza',
  predikcia: 'border-purpose-predikcia bg-purpose-predikcia/15 text-purpose-predikcia',
  fakturacia: 'border-purpose-fakturacia bg-purpose-fakturacia/15 text-purpose-fakturacia',
}

const STATUS_ACTIVE_CLASS: Record<Status, string> = {
  online: 'border-status-online bg-status-online/15 text-status-online',
  vyvoj: 'border-status-vyvoj bg-status-vyvoj/15 text-status-vyvoj',
  chyba: 'border-status-chyba bg-status-chyba/15 text-status-chyba',
}

export interface ToolFormValues {
  name: string
  icon: string
  purpose: Purpose
  status: Status
  url: string
  note: string
}

interface ToolModalProps {
  initialTool: Tool | null
  onClose: () => void
  onSubmit: (values: ToolFormValues) => void
}

function toFormValues(tool: Tool | null): ToolFormValues {
  if (!tool) {
    return {
      name: '',
      icon: ICON_NAMES[0],
      purpose: 'analyza',
      status: 'vyvoj',
      url: '',
      note: '',
    }
  }
  return {
    name: tool.name,
    icon: tool.icon,
    purpose: tool.purpose,
    status: tool.status,
    url: tool.url ?? '',
    note: tool.note ?? '',
  }
}

export default function ToolModal({ initialTool, onClose, onSubmit }: ToolModalProps) {
  const [values, setValues] = useState<ToolFormValues>(() => toFormValues(initialTool))
  const isEdit = initialTool !== null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.name.trim()) return
    onSubmit(values)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="rivets relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-borderStrong bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-text">
            {isEdit ? 'Upraviť nástroj' : 'Pridať nástroj'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border p-1.5 text-textDim hover:bg-panelHover hover:text-text"
            aria-label="Zavrieť"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Názov
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              required
              autoFocus
              placeholder="napr. Kibana – TMS monitoring"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Ikona
            </label>
            <IconPicker value={values.icon} onChange={(icon) => setValues((v) => ({ ...v, icon }))} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Účel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, purpose: p }))}
                  className={`rounded border px-2 py-2 text-xs uppercase tracking-wide transition-colors ${
                    values.purpose === p
                      ? PURPOSE_ACTIVE_CLASS[p]
                      : 'border-border text-textDim hover:bg-panelHover'
                  }`}
                >
                  {PURPOSE_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Stav
            </label>
            <div className="flex flex-col gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, status: s }))}
                  className={`flex items-center justify-between rounded border px-3 py-2 text-left text-xs uppercase tracking-wide transition-colors ${
                    values.status === s
                      ? STATUS_ACTIVE_CLASS[s]
                      : 'border-border text-textDim hover:bg-panelHover'
                  }`}
                >
                  <span>{STATUS_LABELS[s]}</span>
                  <span className="normal-case tracking-normal text-textFaint">
                    {STATUS_DESCRIPTIONS[s]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              URL <span className="text-textFaint normal-case">(voliteľné)</span>
            </label>
            <input
              type="text"
              value={values.url}
              onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Poznámka <span className="text-textFaint normal-case">(voliteľné)</span>
            </label>
            <textarea
              value={values.note}
              onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border px-4 py-2 text-xs uppercase tracking-wide text-textDim hover:bg-panelHover"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="rounded border border-accent bg-accent/15 px-4 py-2 text-xs uppercase tracking-wide text-accent hover:bg-accent/25"
            >
              {isEdit ? 'Uložiť zmeny' : 'Pridať nástroj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
