import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import Icon from '../components/Icon'

export default function Categories() {
  const [tick, setTick] = useState(0)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null) // { id, name }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useAsync(() => api('/categories/'), [tick])
  const items = list.data || []

  async function run(fn) {
    setBusy(true)
    setError('')
    try {
      await fn()
      setTick((n) => n + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const create = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    run(async () => {
      await api('/categories/', { method: 'POST', auth: true, body: { name: name.trim() } })
      setName('')
    })
  }

  const rename = () =>
    run(async () => {
      await api(`/categories/${editing.id}/`, { method: 'PATCH', auth: true, body: { name: editing.name.trim() } })
      setEditing(null)
    })

  const remove = (c) => {
    const msg = c.tenues_count
      ? `Supprimer « ${c.name} » ? Ses ${c.tenues_count} tenue(s) seront conservées, sans catégorie.`
      : `Supprimer « ${c.name} » ?`
    if (window.confirm(msg)) run(() => api(`/categories/${c.id}/`, { method: 'DELETE', auth: true }))
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <Icon name="chevL" className="size-4" /> Retour
      </Link>
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Catégories</h1>
      <p className="mt-1 text-sm text-muted">Les types de tenues proposés dans le filtre du site (Boubou, Costume, Robe…).</p>

      <form onSubmit={create} className="mt-5 flex gap-2">
        <input className="input" placeholder="Nouvelle catégorie (ex : Caftan)" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        <button className="btn btn-gold shrink-0" disabled={busy || !name.trim()}>
          <Icon name="plus" className="size-4" /> Ajouter
        </button>
      </form>
      {error && <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {list.loading && <li className="p-4 text-sm text-muted">Chargement…</li>}
        {!list.loading && items.length === 0 && <li className="p-6 text-center text-sm text-muted">Aucune catégorie pour le moment.</li>}
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-2 p-3">
            {editing?.id === c.id ? (
              <>
                <input
                  autoFocus
                  className="input !py-2"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') rename()
                    if (e.key === 'Escape') setEditing(null)
                  }}
                />
                <button onClick={rename} disabled={busy || !editing.name.trim()} className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-ongold" aria-label="Valider">
                  <Icon name="check" className="size-4" />
                </button>
                <button onClick={() => setEditing(null)} className="grid size-9 shrink-0 place-items-center rounded-full border border-line" aria-label="Annuler">
                  <Icon name="x" className="size-4" />
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.tenues_count} tenue{c.tenues_count > 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => setEditing({ id: c.id, name: c.name })} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink" aria-label="Renommer">
                  <Icon name="edit" className="size-4" />
                </button>
                <button onClick={() => remove(c)} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-danger" aria-label="Supprimer">
                  <Icon name="trash" className="size-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
