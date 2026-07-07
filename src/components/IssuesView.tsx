import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Issue, IssueCategory, IssuePriority, IssueStatus } from '../types/issue'
import {
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_LABELS,
  ISSUE_PRIORITIES,
  ISSUE_PRIORITY_LABELS,
  ISSUE_STATUSES,
  ISSUE_STATUS_LABELS,
} from '../types/issue'
import { issuesRepository, type NewIssue } from '../lib/issues'
import { useAuth } from '../lib/AuthContext'
import IssueCard from './IssueCard'
import AddTile from './AddTile'
import EmptyState from './EmptyState'
import NewIssueModal from './NewIssueModal'
import IssueDetailModal from './IssueDetailModal'
import FilterDropdown from './FilterDropdown'

interface IssuesViewProps {
  canManage: boolean
}

export default function IssuesView({ canManage }: IssuesViewProps) {
  const { session, profile } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory[]>([])
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([])
  const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([])
  const [newIssueOpen, setNewIssueOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  useEffect(() => {
    let cancelled = false
    issuesRepository
      .list()
      .then((loaded) => {
        if (!cancelled) setIssues(loaded)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať nahlásenia.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = issuesRepository.subscribe((event) => {
      setIssues((prev) => {
        if (event.type === 'insert') {
          if (prev.some((i) => i.id === event.issue.id)) return prev
          return [event.issue, ...prev]
        }
        if (event.type === 'update') {
          return prev.map((i) => (i.id === event.issue.id ? event.issue : i))
        }
        return prev.filter((i) => i.id !== event.id)
      })
      setSelectedIssue((prev) => {
        if (!prev) return prev
        if (event.type === 'update' && event.issue.id === prev.id) return event.issue
        if (event.type === 'delete' && event.id === prev.id) return null
        return prev
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase()
    return issues
      .filter((i) => (query ? i.title.toLowerCase().includes(query) : true))
      .filter((i) => (categoryFilter.length === 0 ? true : categoryFilter.includes(i.category)))
      .filter((i) => (priorityFilter.length === 0 ? true : priorityFilter.includes(i.priority)))
      .filter((i) => (statusFilter.length === 0 ? true : statusFilter.includes(i.status)))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [issues, search, categoryFilter, priorityFilter, statusFilter])

  async function handleCreate(input: NewIssue) {
    if (!session || !profile) return
    await issuesRepository.create(input, session.user.id, profile.username)
    setNewIssueOpen(false)
  }

  async function handleStatusChange(id: string, status: IssueStatus) {
    try {
      await issuesRepository.setStatus(id, status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa zmeniť stav.')
    }
  }

  async function handleAssigneeChange(id: string, assigneeId: string | null, assigneeUsername: string | null) {
    try {
      await issuesRepository.setAssignee(id, assigneeId, assigneeUsername)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa nastaviť riešiteľa.')
    }
  }

  return (
    <div>
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

        <FilterDropdown
          label="Oddelenie"
          options={ISSUE_CATEGORIES.map((c) => ({ value: c, label: ISSUE_CATEGORY_LABELS[c] }))}
          selected={categoryFilter}
          onChange={(values) => setCategoryFilter(values as IssueCategory[])}
        />

        <FilterDropdown
          label="Dôležitosť"
          options={ISSUE_PRIORITIES.map((p) => ({ value: p, label: ISSUE_PRIORITY_LABELS[p] }))}
          selected={priorityFilter}
          onChange={(values) => setPriorityFilter(values as IssuePriority[])}
        />

        <FilterDropdown
          label="Stav"
          options={ISSUE_STATUSES.map((s) => ({ value: s, label: ISSUE_STATUS_LABELS[s] }))}
          selected={statusFilter}
          onChange={(values) => setStatusFilter(values as IssueStatus[])}
        />
      </div>

      {error && (
        <div className="mb-4 rounded border border-status-chyba/40 bg-status-chyba/10 px-4 py-2 text-sm text-status-chyba">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-textDim">Načítavam nahlásenia...</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onOpen={setSelectedIssue} />
          ))}

          {filteredIssues.length === 0 && (
            <EmptyState
              hasItems={issues.length > 0}
              emptyTitle="Zatiaľ žiadne nahlásené problémy"
              emptySubtitle='Nahláste prvý problém kliknutím na dlaždicu „Nahlásiť problém".'
              filteredTitle="Žiadny problém nevyhovuje filtru"
              filteredSubtitle="Skúste zmeniť vyhľadávanie alebo filter oddelenia/priority/stavu."
            />
          )}

          <AddTile onClick={() => setNewIssueOpen(true)} label="Nahlásiť problém" />
        </div>
      )}

      {newIssueOpen && (
        <NewIssueModal onClose={() => setNewIssueOpen(false)} onSubmit={handleCreate} />
      )}

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          canManage={canManage}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
        />
      )}
    </div>
  )
}
