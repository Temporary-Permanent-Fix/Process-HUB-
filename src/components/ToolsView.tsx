import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Purpose, Status, Tool } from '../types/tool'
import { PURPOSE_LABELS, STATUS_LABELS } from '../types/tool'
import { toolsRepository } from '../lib/storage'
import ToolCard from './ToolCard'
import AddTile from './AddTile'
import EmptyState from './EmptyState'
import ToolModal, { type ToolFormValues } from './ToolModal'

const PURPOSE_FILTERS: Array<Purpose | 'all'> = ['all', 'analyza', 'predikcia', 'fakturacia']
const STATUS_FILTERS: Array<Status | 'all'> = ['all', 'online', 'vyvoj', 'chyba']

interface ToolsViewProps {
  canEdit: boolean
}

export default function ToolsView({ canEdit }: ToolsViewProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [purposeFilter, setPurposeFilter] = useState<Purpose | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)

  useEffect(() => {
    let cancelled = false
    toolsRepository
      .list()
      .then((loaded) => {
        if (!cancelled) setTools(loaded)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať nástroje.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = toolsRepository.subscribe((event) => {
      setTools((prev) => {
        if (event.type === 'insert') {
          if (prev.some((t) => t.id === event.tool.id)) return prev
          return [event.tool, ...prev]
        }
        if (event.type === 'update') {
          return prev.map((t) => (t.id === event.tool.id ? event.tool : t))
        }
        return prev.filter((t) => t.id !== event.id)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const counts = useMemo(
    () => ({
      online: tools.filter((t) => t.status === 'online').length,
      vyvoj: tools.filter((t) => t.status === 'vyvoj').length,
      chyba: tools.filter((t) => t.status === 'chyba').length,
    }),
    [tools],
  )

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tools
      .filter((t) => (query ? t.name.toLowerCase().includes(query) : true))
      .filter((t) => (purposeFilter === 'all' ? true : t.purpose === purposeFilter))
      .filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [tools, search, purposeFilter, statusFilter])

  function openAddModal() {
    setEditingTool(null)
    setModalOpen(true)
  }

  function openEditModal(tool: Tool) {
    setEditingTool(tool)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingTool(null)
  }

  async function handleSubmit(values: ToolFormValues) {
    const payload = {
      name: values.name.trim(),
      icon: values.icon,
      purpose: values.purpose,
      status: values.status,
      url: values.url.trim() || undefined,
      note: values.note.trim() || undefined,
    }

    try {
      if (editingTool) {
        await toolsRepository.update(editingTool.id, payload)
      } else {
        await toolsRepository.create(payload)
      }
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa uložiť nástroj.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await toolsRepository.remove(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa zmazať nástroj.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-textDim">
          <span className="text-status-online">{counts.online} online</span>
          <span className="text-textFaint"> · </span>
          <span className="text-status-vyvoj">{counts.vyvoj} vo vývoji</span>
          <span className="text-textFaint"> · </span>
          <span className="text-status-chyba">{counts.chyba} chyba</span>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textFaint"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hľadať podľa názvu..."
            className="w-full rounded border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PURPOSE_FILTERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurposeFilter(p)}
              className={`rounded border px-2.5 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                purposeFilter === p
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-textDim hover:bg-panelHover'
              }`}
            >
              {p === 'all' ? 'Všetky účely' : PURPOSE_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded border px-2.5 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                statusFilter === s
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-textDim hover:bg-panelHover'
              }`}
            >
              {s === 'all' ? 'Všetky stavy' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-status-chyba/40 bg-status-chyba/10 px-4 py-2 text-sm text-status-chyba">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-textDim">Načítavam nástroje...</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              canEdit={canEdit}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}

          {filteredTools.length === 0 && <EmptyState hasItems={tools.length > 0} />}

          {canEdit && <AddTile onClick={openAddModal} />}
        </div>
      )}

      {modalOpen && (
        <ToolModal initialTool={editingTool} onClose={closeModal} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
