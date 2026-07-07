import { LogOut, Search } from 'lucide-react'
import type { Purpose, Status } from '../types/tool'
import { PURPOSE_LABELS, STATUS_LABELS } from '../types/tool'
import { useAuth } from '../lib/AuthContext'

interface HeaderProps {
  counts: Record<Status, number>
  search: string
  onSearchChange: (value: string) => void
  purposeFilter: Purpose | 'all'
  onPurposeFilterChange: (value: Purpose | 'all') => void
  statusFilter: Status | 'all'
  onStatusFilterChange: (value: Status | 'all') => void
}

const PURPOSE_FILTERS: Array<Purpose | 'all'> = ['all', 'analyza', 'predikcia', 'fakturacia']
const STATUS_FILTERS: Array<Status | 'all'> = ['all', 'online', 'vyvoj', 'chyba']

export default function Header({
  counts,
  search,
  onSearchChange,
  purposeFilter,
  onPurposeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: HeaderProps) {
  const { session, signOut } = useAuth()

  return (
    <header className="border-b border-border bg-panel">
      <div className="hazard-stripe h-2 w-full" />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-wide sm:text-5xl">
              <span className="text-text">PROCESS</span>{' '}
              <span className="text-accent">HUB</span>
            </h1>
            <p className="mt-1.5 text-sm text-textDim">Ovládací panel interných nástrojov</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs uppercase tracking-wide text-textDim">
              <span className="text-status-online">{counts.online} online</span>
              <span className="text-textFaint"> · </span>
              <span className="text-status-vyvoj">{counts.vyvoj} vo vývoji</span>
              <span className="text-textFaint"> · </span>
              <span className="text-status-chyba">{counts.chyba} chyba</span>
            </div>

            {session && (
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <span className="hidden text-xs text-textFaint sm:inline">
                  {session.user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs uppercase tracking-wide text-textDim hover:border-status-chyba/50 hover:text-status-chyba"
                  title="Odhlásiť sa"
                >
                  <LogOut size={13} />
                  Odhlásiť
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textFaint"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Hľadať podľa názvu..."
              className="w-full rounded border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PURPOSE_FILTERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPurposeFilterChange(p)}
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
                onClick={() => onStatusFilterChange(s)}
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
      </div>
    </header>
  )
}
