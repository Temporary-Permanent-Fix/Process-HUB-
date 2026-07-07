import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { useAuth } from './lib/AuthContext'
import LoginScreen from './components/LoginScreen'
import ConfigError from './components/ConfigError'
import Header, { type Tab } from './components/Header'
import ToolsView from './components/ToolsView'
import IssuesView from './components/IssuesView'
import AdminPanel from './components/AdminPanel'

function Dashboard() {
  const { profile } = useAuth()
  const role = profile?.role ?? 'user'
  const canManageTools = role === 'admin' || role === 'mega_admin'
  const isMegaAdmin = role === 'mega_admin'

  const [activeTab, setActiveTab] = useState<Tab>('tools')
  const [viewAsUser, setViewAsUser] = useState(false)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const canEdit = canManageTools && !viewAsUser

  return (
    <div className="min-h-screen bg-bg">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canManageTools={canManageTools}
        isMegaAdmin={isMegaAdmin}
        viewAsUser={viewAsUser}
        onToggleViewAsUser={() => setViewAsUser((v) => !v)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === 'tools' ? (
          <ToolsView canEdit={canEdit} />
        ) : (
          <IssuesView canManage={canEdit} />
        )}
      </main>

      {adminPanelOpen && <AdminPanel onClose={() => setAdminPanelOpen(false)} />}
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
