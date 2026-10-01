import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import Icon from '../components/Icon'
import Pagination from '../components/Pagination'
import { ImagePlaceholder } from '../components/TenueCard'
import { fmtPrice } from '../utils'

const PAGE_SIZE = 10

export default function Dashboard() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [tick, setTick] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')

  const list = useAsync(
    () => api('/tenues/', { params: { page, page_size: PAGE_SIZE, search: q, status } }),
    [page, q, status, tick],
  )
  const items = list.data?.results || []

  const flash = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 2200)
  }

  async function act(t, fn, msg) {
    setBusyId(t.id)
    try {
      await fn()
      flash(msg)
      setTick((n) => n + 1)
    } catch (e) {
      flash(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const toggleStatus = (t) => {
    const next = t.status === 'available' ? 'sold_out' : 'available'
    act(t, () => api(`/tenues/${t.id}/set-status/`, { method: 'POST', auth: true, body: { status: next } }), next === 'sold_out' ? 'Marquée épuisée' : 'Marquée disponible')
  }

  const remove = (t) => {
    if (!window.confirm(`Supprimer « ${t.name} » définitivement ?`)) return
    act(t, () => api(`/tenues/${t.id}/`, { method: 'DELETE', auth: true }), 'Tenue supprimée')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mes tenues</h1>
          {list.data && <p className="text-sm text-muted">{list.data.count} au total</p>}
        </div>
        <Link to="/admin/new" className="btn btn-gold">
          <Icon name="plus" className="size-4" /> Ajouter une tenue
        </Link>
      </div>

      <form
        className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          setQ(search.trim())
        }}
      >
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input className="input !pl-10" placeholder="Rechercher (nom, tissu, type…)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
          <option value="">Tous les statuts</option>
          <option value="available">Disponibles</option>
          <option value="sold_out">Épuisées</option>
        </select>
      </form>

      <ul className="mt-5 space-y-3">
        {list.loading &&
          Array.from({ length: 4 }).map((_, i) => <li key={i} className="skeleton h-28 rounded-2xl" />)}

        {!list.loading &&
          items.map((t) => (
            <li
              key={t.id}
              className={`flex gap-3 rounded-2xl border border-line bg-surface p-3 transition ${busyId === t.id ? 'opacity-60' : ''}`}
            >
              <div className="size-24 shrink-0 overflow-hidden rounded-xl sm:size-28">
                {t.images[0] ? <img src={t.images[0].thumb} alt="" className="size-full object-cover" /> : <ImagePlaceholder />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold">{t.name}</p>
                    <p className="text-sm font-semibold">{fmtPrice(t.price)}</p>
                    <p className="truncate text-xs text-muted">
                      {[t.category_name, t.fabric, t.sizes.join(' · ')].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => toggleStatus(t)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                      t.status === 'available' ? 'bg-surface2 text-ink' : 'bg-ink text-bg'
                    }`}
                    title="Changer le statut"
                  >
                    <span className={`size-1.5 rounded-full ${t.status === 'available' ? 'bg-ok' : 'bg-bg'}`} />
                    {t.status === 'available' ? 'Disponible' : 'Épuisé'}
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <Link to={`/tenue/${t.id}`} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink" aria-label="Voir">
                      <Icon name="eye" className="size-4" />
                    </Link>
                    <Link to={`/admin/${t.id}/edit`} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink" aria-label="Modifier">
                      <Icon name="edit" className="size-4" />
                    </Link>
                    <button onClick={() => remove(t)} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-danger" aria-label="Supprimer">
                      <Icon name="trash" className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>

      {!list.loading && !list.error && items.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">Aucune tenue. Ajoutez votre première création !</p>
      )}
      {list.error && <p className="mt-8 text-center text-sm text-danger">{list.error.message}</p>}

      {list.data && <Pagination page={page} count={list.data.count} pageSize={PAGE_SIZE} onChange={setPage} />}

      {toast && (
        <div className="fade-up fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90%] rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg shadow-soft">
          {toast}
        </div>
      )}
    </div>
  )
}
