import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Icon from '../components/Icon'
import { ALL_SIZES } from '../config'

const EMPTY = {
  name: '',
  description: '',
  category: '',
  fabric: '',
  price: '',
  sizes: [],
  colors: [],
  status: 'available',
  is_favorite: false,
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export default function TenueForm() {
  const { id } = useParams()
  const editing = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [existing, setExisting] = useState([]) // images déjà enregistrées
  const [removed, setRemoved] = useState([]) // ids à supprimer
  const [files, setFiles] = useState([]) // nouveaux fichiers
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [customSize, setCustomSize] = useState('')
  const [color, setColor] = useState({ name: '', hex: '#1b2a49' })

  useEffect(() => {
    api('/categories/').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!editing) return
    api(`/tenues/${id}/`)
      .then((t) => {
        setForm({
          name: t.name,
          description: t.description,
          category: t.category ? String(t.category) : '',
          fabric: t.fabric,
          price: String(t.price),
          sizes: t.sizes,
          colors: t.colors,
          status: t.status,
          is_favorite: t.is_favorite,
        })
        setExisting(t.images)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, editing])

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleSize = (s) => set('sizes', form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s])

  function addCustomSize() {
    const s = customSize.trim().toUpperCase()
    if (s && !form.sizes.includes(s)) set('sizes', [...form.sizes, s])
    setCustomSize('')
  }

  function addColor() {
    const name = color.name.trim()
    if (!name || form.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return
    set('colors', [...form.colors, { name, hex: color.hex }])
    setColor({ ...color, name: '' })
  }

  const totalImages = existing.filter((i) => !removed.includes(i.id)).length + files.length

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Le nom de la tenue est obligatoire.')
    if (!form.price || Number(form.price) <= 0) return setError('Indiquez un prix valide.')
    setSaving(true)
    try {
      const payload = { ...form, name: form.name.trim(), price: Number(form.price), category: form.category ? Number(form.category) : null }
      const saved = editing
        ? await api(`/tenues/${id}/`, { method: 'PATCH', auth: true, body: payload })
        : await api('/tenues/', { method: 'POST', auth: true, body: payload })

      for (const imgId of removed) await api(`/tenues/${saved.id}/images/${imgId}/`, { method: 'DELETE', auth: true })
      if (files.length) {
        const fd = new FormData()
        files.forEach((f) => fd.append('images', f))
        await api(`/tenues/${saved.id}/images/`, { method: 'POST', auth: true, body: fd })
      }
      nav('/admin')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="py-20 text-center text-sm text-muted">Chargement…</p>

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl pb-28">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <Icon name="chevL" className="size-4" /> Retour
      </Link>
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{editing ? 'Modifier la tenue' : 'Nouvelle tenue'}</h1>

      <div className="mt-6 space-y-6">
        {/* Photos */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Photos ({totalImages}/10)</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existing
              .filter((i) => !removed.includes(i.id))
              .map((i) => (
                <div key={i.id} className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <img src={i.thumb} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemoved([...removed, i.id])}
                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white"
                    aria-label="Retirer la photo"
                  >
                    <Icon name="x" className="size-4" />
                  </button>
                </div>
              ))}
            {previews.map((src, n) => (
              <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-xl ring-2 ring-ink/40">
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, k) => k !== n))}
                  className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Retirer la photo"
                >
                  <Icon name="x" className="size-4" />
                </button>
              </div>
            ))}
            {totalImages < 10 && (
              <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs text-muted transition hover:border-ink hover:text-ink">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    setFiles([...files, ...Array.from(e.target.files)].slice(0, 10 - (totalImages - files.length)))
                    e.target.value = ''
                  }}
                />
                <span>
                  <Icon name="image" className="mx-auto mb-1 size-6" />
                  Ajouter
                </span>
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">La première photo est la photo de couverture. Stockage sur Cloudinary.</p>
        </section>

        {/* Infos */}
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-4">
          <Field label="Nom de la tenue *">
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex : Grand Boubou Brodé Royal" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prix (FCFA) *">
              <input className="input" type="number" inputMode="numeric" min="0" step="500" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="45000" />
            </Field>
            <Field label="Catégorie">
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">
                <Link to="/admin/categories" className="underline underline-offset-2">Gérer les catégories</Link>
              </span>
            </Field>
          </div>
          <Field label="Type de tissu">
            <input className="input" value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="Bazin riche, Wax, Getzner, Dentelle…" />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-28" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Détails, finitions, conseils d'entretien…" />
          </Field>
        </section>

        {/* Tailles */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Tailles disponibles</h2>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...ALL_SIZES, ...form.sizes])].map((s) => (
              <button key={s} type="button" className="chip" data-active={form.sizes.includes(s)} onClick={() => toggleSize(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input"
              placeholder="Autre taille (ex : 42, Unique)"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
            />
            <button type="button" className="btn btn-outline shrink-0" onClick={addCustomSize}>Ajouter</button>
          </div>
        </section>

        {/* Couleurs */}
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Couleurs disponibles</h2>
          {form.colors.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {form.colors.map((c) => (
                <li key={c.name} className="flex items-center gap-2 rounded-full border border-line bg-bg py-1 pl-1.5 pr-1 text-sm">
                  <span className="size-5 rounded-full border border-black/10" style={{ background: c.hex }} />
                  {c.name}
                  <button
                    type="button"
                    onClick={() => set('colors', form.colors.filter((x) => x.name !== c.name))}
                    className="grid size-6 place-items-center rounded-full text-muted hover:text-danger"
                    aria-label={`Retirer ${c.name}`}
                  >
                    <Icon name="x" className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="color"
              value={color.hex}
              onChange={(e) => setColor({ ...color, hex: e.target.value })}
              className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border border-line bg-surface p-1"
              aria-label="Choisir la couleur"
            />
            <input
              className="input"
              placeholder="Nom (ex : Bleu nuit)"
              value={color.name}
              onChange={(e) => setColor({ ...color, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
            />
            <button type="button" className="btn btn-outline shrink-0" onClick={addColor}>Ajouter</button>
          </div>
        </section>

        {/* Statut */}
        <section>
          <button
            type="button"
            onClick={() => set('status', form.status === 'available' ? 'sold_out' : 'available')}
            className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 text-left"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Statut</span>
              <span className={`mt-0.5 block font-semibold ${form.status === 'available' ? 'text-ok' : ''}`}>
                {form.status === 'available' ? 'Disponible' : 'Épuisé'}
              </span>
            </span>
            <Switch on={form.status === 'available'} />
          </button>
        </section>
      </div>

      {error && <p className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 py-3">
          <Link to="/admin" className="btn btn-outline">Annuler</Link>
          <button className="btn btn-gold flex-1" disabled={saving}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Publier la tenue'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Switch({ on }) {
  return (
    <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-gold' : 'bg-line'}`}>
      <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </span>
  )
}
