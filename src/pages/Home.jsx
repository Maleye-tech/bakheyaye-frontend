import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import Icon, { WhatsAppIcon } from '../components/Icon'
import TenueCard, { CardSkeletons } from '../components/TenueCard'
import { BRAND, LOGO_SRC } from '../config'
import { waLink } from '../utils'

function Section({ title, kicker, to, toLabel, state, empty }) {
  const items = state.data?.results || []
  if (!state.loading && !state.error && items.length === 0) return empty || null
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">{kicker}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        <Link to={to} className="shrink-0 text-sm font-medium text-ink hover:underline">
          {toLabel} →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-4">
        {state.loading ? <CardSkeletons n={4} /> : items.map((t, i) => <TenueCard key={t.id} t={t} index={i} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const latest = useAsync(() => api('/tenues/', { params: { page_size: 8 } }), [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_20%,var(--surface-2),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--gold)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Haute couture sénégalaise</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              L'élégance,
              <br />
              <span className="italic text-muted">taillée pour vous.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
              Découvrez nos tenues confectionnées à la main, dans des tissus nobles. Choisissez votre modèle, votre
              taille, votre couleur — et commandez en un clic sur WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogue" className="btn btn-gold">
                Voir le catalogue
                <Icon name="chevR" className="size-4" />
              </Link>
              <a href={waLink(`Bonjour ${BRAND} 👋`)} target="_blank" rel="noreferrer" className="btn btn-outline">
                <WhatsAppIcon className="size-4 text-ink" />
                Nous écrire
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-ink" /> Sur mesure
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-ink" /> Tissus premium
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-ink" /> Commande via WhatsApp
              </li>
            </ul>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm md:block">
            <div className="absolute inset-0 rounded-full border border-gold/30" />
            <div className="absolute inset-6 rounded-full border border-gold/20" />
            <div className="absolute inset-12 grid place-items-center rounded-full bg-surface shadow-soft">
              <img src={LOGO_SRC} alt={BRAND} className="size-3/4 object-contain" />
            </div>
          </div>
        </div>
      </section>

      <Section kicker="Fraîchement cousues" title="Nouveautés" to="/catalogue" toLabel="Tout le catalogue" state={latest} />

      {latest.error && (
        <p className="mx-auto mt-10 max-w-6xl px-4 text-center text-sm text-danger sm:px-6">
          {latest.error.message}
        </p>
      )}

      {/* Bandeau commande */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-surface2 to-surface2 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Une idée, un modèle en tête ?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Parlez-nous de votre projet : nous confectionnons aussi vos tenues entièrement sur mesure.
          </p>
          <a
            href={waLink(`Bonjour ${BRAND} 👋\nJ'aimerais une tenue sur mesure.`)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-wa mt-6"
          >
            <WhatsAppIcon className="size-5" />
            Discuter sur WhatsApp
          </a>
        </div>
      </section>
      <div className="h-6" />
    </>
  )
}
