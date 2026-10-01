import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import TenueCard, { CardSkeletons } from '../components/TenueCard'
import Pagination from '../components/Pagination'
import { ALL_SIZES } from '../config'

const PAGE_SIZE = 12

export default function Catalogue() {
  const [sp, setSp] = useSearchParams()
  const page = Math.max(1, Number(sp.get('page')) || 1)
  const size = sp.get('size') || ''
  const category = sp.get('category') || ''
  const favorite = sp.get('favorite') === '1'

  const meta = useAsync(() => api('/meta/'), [])
  const list = useAsync(
    () =>
      api('/tenues/', {
        params: { page, page_size: PAGE_SIZE, size, category, favorite: favorite ? '1' : '' },
      }),
    [page, size, category, favorite],
  )

  // Si la page demandée n'existe plus (ex. filtre changé), on revient à la page 1
  useEffect(() => {
    if (list.error?.status === 404 && page > 1) update({ page: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.error])

  function update(patch) {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (!('page' in patch)) next.delete('page') // tout changement de filtre repart de la page 1
    setSp(next, { replace: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sizes = meta.data?.sizes?.length ? meta.data.sizes : ALL_SIZES
  const categories = meta.data?.categories || []
  const items = list.data?.results || []
  const hasFilter = size || category || favorite

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
          {favorite ? 'Notre sélection' : 'Collection'}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          {favorite ? 'Coups de cœur' : 'Toutes nos tenues'}
        </h1>
        {list.data && (
          <p className="mt-1 text-sm text-muted">
            {list.data.count} tenue{list.data.count > 1 ? 's' : ''} • les plus récentes d'abord
          </p>
        )}
      </header>

      {/* Filtres */}
      <div className="sticky top-14 z-20 -mx-4 mt-6 border-b border-line/60 bg-bg/90 px-4 py-3 backdrop-blur-xl sm:top-16 sm:-mx-6 sm:px-6">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
          <span className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-wider text-muted">Taille</span>
          <button className="chip shrink-0" data-active={!size} onClick={() => update({ size: '' })}>
            Toutes
          </button>
          {sizes.map((s) => (
            <button
              key={s}
              className="chip shrink-0"
              data-active={size === s}
              onClick={() => update({ size: size === s ? '' : s })}
            >
              {s}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <div className="hide-scrollbar mt-2 flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-wider text-muted">Type</span>
            <button className="chip shrink-0" data-active={!category} onClick={() => update({ category: '' })}>
              Tous
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className="chip shrink-0"
                data-active={category === String(c.id)}
                onClick={() => update({ category: category === String(c.id) ? '' : String(c.id) })}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grille */}
      <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
        {list.loading ? <CardSkeletons n={8} /> : items.map((t, i) => <TenueCard key={t.id} t={t} index={i} />)}
      </div>

      {list.error && list.error.status !== 404 && (
        <p className="mt-10 text-center text-sm text-danger">{list.error.message}</p>
      )}

      {!list.loading && !list.error && items.length === 0 && (
        <div className="mt-16 text-center">
          <p className="font-display text-xl">Aucune tenue trouvée</p>
          <p className="mt-2 text-sm text-muted">Essayez une autre taille ou un autre type.</p>
          {hasFilter && (
            <button
              className="btn btn-outline mt-5"
              onClick={() => update({ size: '', category: '', favorite: '' })}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {list.data && (
        <Pagination
          page={page}
          count={list.data.count}
          pageSize={PAGE_SIZE}
          onChange={(p) => update({ page: p > 1 ? String(p) : '' })}
        />
      )}
    </div>
  )
}