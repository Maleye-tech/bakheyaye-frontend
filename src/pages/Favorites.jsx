import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import { useFavorites } from '../favorites'
import Icon from '../components/Icon'
import TenueCard, { CardSkeletons } from '../components/TenueCard'

export default function Favorites() {
  const { ids, has } = useFavorites()
  // Chargé une seule fois à l'ouverture ; un cœur retiré fait disparaître la tenue aussitôt
  const state = useAsync(
    async () => (await Promise.all(ids.map((id) => api(`/tenues/${id}/`).catch(() => null)))).filter(Boolean),
    [],
  )
  const items = (state.data || []).filter((t) => has(t.id))

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">Ma sélection</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Mes favoris</h1>
      <p className="mt-1 text-sm text-muted">Enregistrés sur cet appareil. Touchez le cœur d'une tenue pour l'ajouter ou la retirer.</p>

      <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
        {state.loading && ids.length > 0 ? <CardSkeletons n={Math.min(ids.length, 8)} /> : items.map((t, i) => <TenueCard key={t.id} t={t} index={i} />)}
      </div>

      {!state.loading && items.length === 0 && (
        <div className="mx-auto mt-16 max-w-sm text-center">
          <Icon name="heart" className="mx-auto size-12 text-muted" strokeWidth={1.3} />
          <p className="mt-4 font-display text-2xl">Aucun favori pour l'instant</p>
          <p className="mt-2 text-sm text-muted">Parcourez le catalogue et touchez le cœur des tenues qui vous plaisent.</p>
          <Link to="/catalogue" className="btn btn-gold mt-6">
            Voir le catalogue
          </Link>
        </div>
      )}
    </div>
  )
}
