import { AlertTriangle } from 'lucide-react'
import RivetCorners from './RivetCorners'

export default function ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="rivets relative w-full max-w-md rounded border border-status-chyba/40 bg-panel p-6">
        <RivetCorners />
        <div className="mb-3 flex items-center gap-2 text-status-chyba">
          <AlertTriangle size={18} />
          <h1 className="font-display text-xl font-bold uppercase tracking-wide">
            Chýba konfigurácia
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-textDim">
          Nie sú nastavené premenné <code className="text-text">VITE_SUPABASE_URL</code> a{' '}
          <code className="text-text">VITE_SUPABASE_ANON_KEY</code>. Skopírujte{' '}
          <code className="text-text">.env.example</code> do <code className="text-text">.env.local</code>{' '}
          (lokálne) alebo ich nastavte v premenných prostredia vo Vercel projekte a znovu nasaďte.
        </p>
      </div>
    </div>
  )
}
