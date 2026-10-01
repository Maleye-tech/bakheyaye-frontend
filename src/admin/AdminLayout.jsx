import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

export default function AdminLayout() {
  const { user, ready, logout } = useAuth()
  const loc = useLocation()

  if (!ready) return <div className="grid min-h-dvh place-items-center text-sm text-muted">Chargement…</div>
  if (!user) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />

  return (
    <div className="min-h-dvh">
      <header className="safe-top sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo to="/admin" size="size-8" showName={false} />
            <div className="leading-tight">
              <p className="font-display text-base font-semibold">Back-office</p>
              <p className="text-[11px] text-muted">Bonjour, {user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/categories" className="btn btn-outline !px-3.5 !py-2 text-xs">
              <Icon name="grid" className="size-4" />
              <span className="hidden sm:inline">Catégories</span>
            </Link>
            <Link to="/" className="btn btn-outline !px-3.5 !py-2 text-xs">
              <Icon name="eye" className="size-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <button onClick={logout} className="btn btn-outline !px-3.5 !py-2 text-xs" aria-label="Se déconnecter">
              <Icon name="logout" className="size-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>
      <main className="safe-bottom mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
