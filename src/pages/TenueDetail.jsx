import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAsync } from '../hooks'
import { useCart } from '../cart'
import Icon, { WhatsAppIcon } from '../components/Icon'
import FavButton from '../components/FavButton'
import { ImagePlaceholder } from '../components/TenueCard'
import { BRAND } from '../config'
import { fmtPrice, orderMessage, toOrderItem, waLink } from '../utils'

function Gallery({ images, name, soldOut, modal }) {
  const [i, setI] = useState(0)
  const ref = useRef(null)

  const go = (n) => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * n, behavior: 'smooth' })
    setI(n)
  }

  const frame = modal ? 'md:h-full md:flex-col md:flex' : ''
  const box = modal ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-[4/5] rounded-3xl shadow-soft'

  if (!images.length)
    return (
      <div className={`${frame} bg-surface2`}>
        <div className={`${modal ? 'aspect-[4/5] md:aspect-auto md:flex-1' : 'aspect-[4/5] overflow-hidden rounded-3xl'}`}>
          <ImagePlaceholder />
        </div>
      </div>
    )

  return (
    <div className={`${frame} bg-surface2 ${modal ? '' : 'rounded-3xl'}`}>
      <div className={`relative ${modal ? 'md:min-h-0 md:flex-1' : ''}`}>
        <div
          ref={ref}
          onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className={`hide-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-surface2 ${box}`}
        >
          {images.map((img) => (
            <img key={img.id} src={img.url} alt={name} className={`size-full shrink-0 snap-center object-contain ${soldOut ? 'grayscale-[0.5]' : ''}`} />
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={() => go(Math.max(0, i - 1))} className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/85 backdrop-blur md:grid" aria-label="Précédente">
              <Icon name="chevL" className="size-4" />
            </button>
            <button onClick={() => go(Math.min(images.length - 1, i + 1))} className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/85 backdrop-blur md:grid" aria-label="Suivante">
              <Icon name="chevR" className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, n) => (
                <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={`hide-scrollbar flex gap-2 overflow-x-auto ${modal ? 'p-3' : 'mt-3'}`}>
          {images.map((img, n) => (
            <button key={img.id} onClick={() => go(n)} className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${n === i ? 'border-ink' : 'border-transparent opacity-60'}`}>
              <img src={img.thumb} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Contenu d'une tenue : image à gauche, détails à droite (empilé sur téléphone). */
export function TenueView({ id, modal = false, onClose }) {
  const { data: t, loading, error } = useAsync(() => api(`/tenues/${id}/`), [id])
  const { add } = useCart()
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [hint, setHint] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setSize('')
    setColor('')
    setHint('')
    setAdded(false)
  }, [id])

  if (loading)
    return (
      <div className="grid gap-8 p-5 md:grid-cols-2 md:p-0">
        <div className="skeleton aspect-[4/5] md:h-full md:rounded-none" />
        <div className="space-y-4 md:p-8">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-9 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/3 rounded" />
        </div>
      </div>
    )

  if (error)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-display text-2xl">Tenue introuvable</p>
        <p className="mt-2 text-sm text-muted">{error.status === 404 ? "Ce modèle n'existe plus." : error.message}</p>
        <Link to="/catalogue" className="btn btn-gold mt-6" onClick={onClose}>
          Retour au catalogue
        </Link>
      </div>
    )

  const soldOut = t.status === 'sold_out'

  function addToCart() {
    // Une seule taille / couleur disponible : on la choisit automatiquement
    const s = size || (t.sizes.length === 1 ? t.sizes[0] : '')
    const c = color || (t.colors.length === 1 ? t.colors[0].name : '')
    const missing = t.sizes.length && !s ? 'size' : t.colors.length && !c ? 'color' : ''
    if (missing) {
      setHint(missing === 'size' ? 'Choisissez une taille pour ajouter au panier' : 'Choisissez une couleur pour ajouter au panier')
      document.getElementById(`sec-${missing}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setHint('')
    setSize(s)
    setColor(c)
    add(toOrderItem(t, { size: s, color: c }))
    setAdded(true)
    setTimeout(() => setAdded(false), 4000)
  }

  const stick = modal
    ? 'sticky bottom-0 md:static md:shrink-0'
    : 'sticky bottom-[calc(3.9rem+env(safe-area-inset-bottom))] md:static'

  return (
    <div className={modal ? 'md:grid md:h-full md:grid-cols-2 md:grid-rows-1' : 'grid gap-8 md:grid-cols-2 md:gap-12'}>
      <Gallery images={t.images} name={t.name} soldOut={soldOut} modal={modal} />

      <div className={modal ? 'md:flex md:h-full md:min-h-0 md:flex-col' : ''}>
        <div className={modal ? 'px-5 pb-2 pt-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:px-8 md:pt-12' : ''}>
          <div className="flex flex-wrap items-center gap-2">
            {t.category_name && <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">{t.category_name}</span>}
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{t.name}</h1>
            <FavButton id={t.id} variant="detail" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{fmtPrice(t.price)}</p>

          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${soldOut ? 'bg-ink text-bg' : 'bg-surface2 text-ink'}`}>
            <span className={`size-1.5 rounded-full ${soldOut ? 'bg-bg' : 'bg-ok'}`} />
            {soldOut ? 'Épuisé' : 'Disponible'}
          </span>

          {t.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-muted">{t.description}</p>}

          {t.fabric && (
            <dl className="mt-5 flex items-center gap-3 border-y border-line py-3 text-sm">
              <dt className="text-muted">Tissu</dt>
              <dd className="font-medium">{t.fabric}</dd>
            </dl>
          )}

          {t.sizes.length > 0 && (
            <div id="sec-size" className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Taille {size && <span className="normal-case tracking-normal text-ink">· {size}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {t.sizes.map((s) => (
                  <button key={s} className="chip" data-active={size === s} onClick={() => { setSize(size === s ? '' : s); setHint('') }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {t.colors.length > 0 && (
            <div id="sec-color" className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Couleur {color && <span className="normal-case tracking-normal text-ink">· {color}</span>}</p>
              <div className="flex flex-wrap gap-3">
                {t.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => { setColor(color === c.name ? '' : c.name); setHint('') }}
                    className={`size-10 rounded-full border-2 p-0.5 transition active:scale-90 ${color === c.name ? 'border-ink' : 'border-line'}`}
                  >
                    <span className="block size-full rounded-full border border-black/10" style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`${stick} z-10 mt-6 border-t border-line/70 bg-bg/95 px-4 py-3 backdrop-blur-xl ${modal ? 'md:mt-0 md:border-t md:bg-bg md:px-8 md:pb-6' : 'md:mt-8 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none'}`}>
          {(hint || added) && (
            <p className={`mb-2 rounded-xl px-3 py-2 text-center text-sm font-medium ${hint ? 'bg-danger/10 text-danger' : 'bg-surface2 text-ink'}`}>
              {hint || (
                <>
                  ✓ Ajouté au panier ·{' '}
                  <Link to="/panier" className="font-semibold underline underline-offset-4">
                    Voir le panier
                  </Link>
                </>
              )}
            </p>
          )}
          {soldOut ? (
            <a href={waLink(`Bonjour ${BRAND} 👋\nLa tenue « ${t.name} » est épuisée. Pouvez-vous la refaire ?`)} target="_blank" rel="noreferrer" className="btn btn-outline w-full !py-3.5">
              <WhatsAppIcon className="size-5" />
              Épuisé — demander à la refaire
            </a>
          ) : (
            <div className="flex gap-2">
              <button onClick={addToCart} className="btn btn-outline flex-[1.4] !px-3 !py-3.5">
                <Icon name="bag" className="size-5" />
                Ajouter au panier
              </button>
              <a
                href={waLink(orderMessage([toOrderItem(t, { size, color })]))}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa flex-1 !px-3 !py-3.5"
              >
                <WhatsAppIcon className="size-5" />
                Commander
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Page complète (lien direct /tenue/:id) */
export default function TenueDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <button onClick={() => (window.history.length > 1 ? nav(-1) : nav('/catalogue'))} className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-ink">
        <Icon name="chevL" className="size-4" /> Retour
      </button>
      <TenueView id={id} />
    </div>
  )
}

/** Aperçu en fenêtre : s'ouvre au clic sur une tenue, sans quitter le catalogue. */
export function TenueModal() {
  const { id } = useParams()
  const nav = useNavigate()
  const close = () => nav(-1)
  const { count } = useCart()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && nav(-1)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [nav])

  return (
    <div className="fixed inset-0 z-50 md:grid md:place-items-center md:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 hidden bg-black/55 backdrop-blur-sm md:block" onClick={close} />
      <div className="fade-up relative h-dvh w-full overflow-y-auto bg-bg md:h-[min(92dvh,860px)] md:max-w-5xl md:overflow-hidden md:rounded-3xl md:shadow-soft">
        <Link
          to="/panier"
          className="absolute left-3 top-3 z-20 inline-flex h-10 items-center gap-2 rounded-full bg-bg/90 px-4 text-sm font-semibold shadow-soft backdrop-blur"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <Icon name="bag" className="size-4" />
          Panier
          {count > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] leading-5 text-bg">{count}</span>}
        </Link>
        <button
          onClick={close}
          className="safe-top absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-bg/90 shadow-soft backdrop-blur"
          aria-label="Fermer"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <Icon name="x" className="size-5" />
        </button>
        <TenueView id={id} modal onClose={close} />
      </div>
    </div>
  )
}
