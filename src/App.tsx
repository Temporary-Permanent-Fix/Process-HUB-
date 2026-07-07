import { useEffect, useMemo, useState } from 'react'
import type { Purpose, Status, Tool } from './types/tool'
import { toolsRepository } from './lib/storage'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { useAuth } from './lib/AuthContext'
import LoginScreen from './components/LoginScreen'
import ConfigError from './components/ConfigError'
import Header from './components/Header'
import ToolCard from './components/ToolCard'
import AddTile from './components/AddTile'
import EmptyState from './components/EmptyState'
import ToolModal, { type ToolFormValues } from './components/ToolModal'

function Dashboard() {
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
    <div className="min-h-screen bg-bg">
      <Header
        counts={counts}
        search={search}
        onSearchChange={setSearch}
        purposeFilter={purposeFilter}
        onPurposeFilterChange={setPurposeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
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
              <ToolCard key={tool.id} tool={tool} onEdit={openEditModal} onDelete={handleDelete} />
            ))}

            {filteredTools.length === 0 && <EmptyState hasTools={tools.length > 0} />}

            <AddTile onClick={openAddModal} />
          </div>
        )}
      </main>

      {modalOpen && (
        <ToolModal initialTool={editingTool} onClose={closeModal} onSubmit={handleSubmit} />
      )}
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) {
    return <ConfigError />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-textDim">Načítavam...</p>
      </div>
    )
  }

  return session ? <Dashboard /> : <LoginScreen />
}
