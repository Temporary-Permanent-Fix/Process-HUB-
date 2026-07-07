import { useEffect, useMemo, useState } from 'react'
import type { Purpose, Status, Tool } from './types/tool'
import { createSeedTools, toolsRepository } from './lib/storage'
import Header from './components/Header'
import ToolCard from './components/ToolCard'
import AddTile from './components/AddTile'
import EmptyState from './components/EmptyState'
import ToolModal, { type ToolFormValues } from './components/ToolModal'

export default function App() {
  const [tools, setTools] = useState<Tool[]>(() => {
    const loaded = toolsRepository.load()
    return loaded.length > 0 ? loaded : createSeedTools()
  })
  const [search, setSearch] = useState('')
  const [purposeFilter, setPurposeFilter] = useState<Purpose | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)

  useEffect(() => {
    toolsRepository.save(tools)
  }, [tools])

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

  function handleSubmit(values: ToolFormValues) {
    const trimmedUrl = values.url.trim()
    const trimmedNote = values.note.trim()

    if (editingTool) {
      setTools((prev) =>
        prev.map((t) =>
          t.id === editingTool.id
            ? {
                ...t,
                name: values.name.trim(),
                icon: values.icon,
                purpose: values.purpose,
                status: values.status,
                url: trimmedUrl || undefined,
                note: trimmedNote || undefined,
              }
            : t,
        ),
      )
    } else {
      const newTool: Tool = {
        id: crypto.randomUUID(),
        name: values.name.trim(),
        icon: values.icon,
        purpose: values.purpose,
        status: values.status,
        url: trimmedUrl || undefined,
        note: trimmedNote || undefined,
        createdAt: Date.now(),
      }
      setTools((prev) => [...prev, newTool])
    }
    closeModal()
  }

  function handleDelete(id: string) {
    setTools((prev) => prev.filter((t) => t.id !== id))
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onEdit={openEditModal} onDelete={handleDelete} />
          ))}

          {filteredTools.length === 0 && <EmptyState hasTools={tools.length > 0} />}

          <AddTile onClick={openAddModal} />
        </div>
      </main>

      {modalOpen && (
        <ToolModal initialTool={editingTool} onClose={closeModal} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
