import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from '../components/Logo'

export default function Login() {
  const { user, ready, login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (ready && user) return <Navigate to="/admin" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
      nav(loc.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Identifiant ou mot de passe incorrect.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="safe-top safe-bottom grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="fade-up w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-soft">
        <div className="flex flex-col items-center text-center">
          <Logo size="size-16" showName={false} />
          <h1 className="mt-4 font-display text-2xl font-semibold">Espace tailleur</h1>
          <p className="mt-1 text-sm text-muted">Connectez-vous pour gérer vos tenues.</p>
        </div>
        <div className="mt-6 space-y-3">
          <input
            className="input"
            placeholder="Identifiant"
            autoComplete="username"
            autoCapitalize="none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-gold mt-5 w-full !py-3.5" disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
