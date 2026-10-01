import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon, { WhatsAppIcon } from './Icon'
import Logo from './Logo'
import { useInstallPrompt } from '../hooks'
import { useCart } from '../cart'
import { BRAND } from '../config'
import { waLink } from '../utils'

function Badge({ n }) {
  if (!n) return null
  return (
    <span className="absolute -right-2 -top-1.5 grid min-w-4.5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold leading-4.5 text-bg">
      {n > 99 ? '99+' : n}
    </span>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const install = useInstallPrompt()
  const { count } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const tabs = [
    { to: '/', label: 'Accueil', icon: 'home', active: pathname === '/' },
    { to: '/catalogue', label: 'Catalogue', icon: 'grid', active: pathname === '/catalogue' },
    { to: '/favoris', label: 'Favoris', icon: 'heart', active: pathname === '/favoris' },
  ]

  return (
    <div className="min-h-dvh">
      <header className="safe-top sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((t) => (
              <NavLink
                key={t.label}
                to={t.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition hover:text-ink ${t.active ? 'text-ink underline decoration-1 underline-offset-8' : 'text-muted'}`}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {install && (
              <button onClick={install} className="btn btn-outline !px-3.5 !py-2 text-xs">
                <Icon name="download" className="size-4" />
                <span className="hidden sm:inline">Installer l'app</span>
              </button>
            )}
            <NavLink to="/panier" className="btn btn-outline relative !hidden !px-3.5 !py-2 text-xs md:!inline-flex" aria-label="Panier">
              <Icon name="bag" className="size-4" />
              Panier
              <Badge n={count} />
            </NavLink>
            <a href={waLink(`Bonjour ${BRAND} 👋`)} target="_blank" rel="noreferrer" className="btn btn-wa !px-3.5 !py-2 text-xs" aria-label="WhatsApp">
              <WhatsAppIcon className="size-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line bg-surface2/50 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted">Tenues élégantes confectionnées avec soin. Commandez en un clic sur WhatsApp.</p>
          </div>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {BRAND}
          </p>
        </div>
      </footer>

      {/* Barre d'onglets type application mobile */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-bg/90 backdrop-blur-xl md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map((t) => (
            <li key={t.label}>
              <NavLink to={t.to} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition active:scale-95 ${t.active ? 'text-ink' : 'text-muted'}`}>
                <Icon name={t.icon} className="size-6" fill={t.active && t.icon === 'heart'} strokeWidth={t.active ? 2.1 : 1.7} />
                {t.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/panier" className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition active:scale-95 ${pathname === '/panier' ? 'text-ink' : 'text-muted'}`}>
              <span className="relative">
                <Icon name="bag" className="size-6" strokeWidth={pathname === '/panier' ? 2.1 : 1.7} />
                <Badge n={count} />
              </span>
              Panier
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}
