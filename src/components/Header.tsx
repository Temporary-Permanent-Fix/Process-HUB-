import { Eye, LogOut, UserCog } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { shadowEmailToUsername } from '../lib/username'

export type Tab = 'tools' | 'issues'

interface HeaderProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  canManageTools: boolean
  isMegaAdmin: boolean
  viewAsUser: boolean
  onToggleViewAsUser: () => void
  onOpenAdminPanel: () => void
}

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'tools', label: 'Nástroje' },
  { key: 'issues', label: 'Nahlásené problémy' },
]

export default function Header({
  activeTab,
  onTabChange,
  canManageTools,
  isMegaAdmin,
  viewAsUser,
  onToggleViewAsUser,
  onOpenAdminPanel,
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

          {session && (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-textFaint sm:inline">
                {session.user.user_metadata?.username ?? shadowEmailToUsername(session.user.email)}
              </span>

              {canManageTools && (
                <button
                  type="button"
                  onClick={onToggleViewAsUser}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs uppercase tracking-wide transition-colors ${
                    viewAsUser
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border text-textDim hover:bg-panelHover'
                  }`}
                  title="Prepnúť náhľad ako bežný používateľ"
                >
                  <Eye size={13} />
                  {viewAsUser ? 'Návrat do administrácie' : 'Zobraziť ako používateľ'}
                </button>
              )}

              {isMegaAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs uppercase tracking-wide text-textDim hover:bg-panelHover hover:text-text"
                  title="Administrácia používateľov"
                >
                  <UserCog size={13} />
                  Administrácia
                </button>
              )}

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

        <div className="mt-5 flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded border px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
                activeTab === tab.key
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-textDim hover:bg-panelHover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
