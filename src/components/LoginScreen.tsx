import { useState, type FormEvent } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import RivetCorners from './RivetCorners'

export default function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)
    if (result) {
      setError(result)
      return
    }
    if (mode === 'signUp') {
      setInfo('Účet vytvorený. Skontrolujte e-mail pre potvrdenie, potom sa prihláste.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="rivets relative w-full max-w-sm rounded border border-borderStrong bg-panel p-6">
        <RivetCorners />

        <h1 className="font-display text-3xl font-extrabold uppercase leading-none tracking-wide">
          <span className="text-text">PROCESS</span> <span className="text-accent">HUB</span>
        </h1>
        <p className="mt-1.5 mb-6 text-sm text-textDim">
          {mode === 'signIn' ? 'Prihlásenie do ovládacieho panela' : 'Vytvorenie nového účtu'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Heslo
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-xs text-status-chyba">{error}</p>}
          {info && <p className="text-xs text-status-online">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex items-center justify-center gap-2 rounded border border-accent bg-accent/15 px-4 py-2 text-xs uppercase tracking-wide text-accent hover:bg-accent/25 disabled:opacity-50"
          >
            {mode === 'signIn' ? <LogIn size={14} /> : <UserPlus size={14} />}
            {mode === 'signIn' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'))
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center text-xs text-textDim hover:text-accent"
        >
          {mode === 'signIn' ? 'Nemáte účet? Vytvoriť nový' : 'Už máte účet? Prihlásiť sa'}
        </button>
      </div>
    </div>
  )
}
