import { useEffect, useState } from 'react'
import { RefreshCw, ShieldCheck, X } from 'lucide-react'
import { listProfiles, setUserRole, type Profile } from '../lib/profiles'
import { useAuth } from '../lib/AuthContext'
import RivetCorners from './RivetCorners'

const ROLE_LABELS: Record<Profile['role'], string> = {
  user: 'Používateľ',
  admin: 'Administrátor',
  mega_admin: 'Mega admin',
}

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { profile: ownProfile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setProfiles(await listProfiles())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať používateľov.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRoleChange(id: string, role: 'user' | 'admin') {
    setPendingId(id)
    setError(null)
    try {
      await setUserRole(id, role)
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa zmeniť rolu.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="rivets relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded border border-borderStrong bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <RivetCorners />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-accent" />
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-text">
              Administrácia používateľov
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1.5 rounded border border-border px-2 py-1.5 text-xs uppercase tracking-wide text-textDim hover:bg-panelHover hover:text-text"
            >
              <RefreshCw size={13} />
              Obnoviť
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border p-1.5 text-textDim hover:bg-panelHover hover:text-text"
              aria-label="Zavrieť"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-status-chyba/40 bg-status-chyba/10 px-4 py-2 text-sm text-status-chyba">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-textDim">Načítavam používateľov...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {profiles.map((p) => {
              const isSelf = p.id === ownProfile?.id
              const isMegaAdmin = p.role === 'mega_admin'
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-border bg-bg px-4 py-3"
                >
                  <div>
                    <span className="font-display text-lg font-bold uppercase tracking-wide text-text">
                      {p.username}
                    </span>
                    {isSelf && <span className="ml-2 text-xs text-textFaint">(ty)</span>}
                  </div>

                  {isMegaAdmin || isSelf ? (
                    <span className="rounded border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs uppercase tracking-wide text-accent">
                      {ROLE_LABELS[p.role]}
                    </span>
                  ) : (
                    <div className="flex gap-1.5">
                      {(['user', 'admin'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          disabled={pendingId === p.id}
                          onClick={() => handleRoleChange(p.id, role)}
                          className={`rounded border px-2.5 py-1 text-xs uppercase tracking-wide transition-colors disabled:opacity-50 ${
                            p.role === role
                              ? 'border-accent bg-accent/15 text-accent'
                              : 'border-border text-textDim hover:bg-panelHover'
                          }`}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
