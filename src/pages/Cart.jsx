import { Link } from 'react-router-dom'
import { useCart } from '../cart'
import Icon, { WhatsAppIcon } from '../components/Icon'
import { ImagePlaceholder } from '../components/TenueCard'
import { fmtPrice, orderMessage, waLink } from '../utils'

export default function Cart() {
  const { items, setQty, remove, clear, total, count } = useCart()

  if (!items.length)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Icon name="bag" className="mx-auto size-12 text-muted" strokeWidth={1.3} />
        <p className="mt-4 font-display text-2xl">Votre panier est vide</p>
        <p className="mt-2 text-sm text-muted">Ajoutez des tenues pour les commander toutes ensemble sur WhatsApp.</p>
        <Link to="/catalogue" className="btn btn-gold mt-6">
          Voir le catalogue
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Mon panier</h1>
          <p className="mt-1 text-sm text-muted">
            {count} article{count > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => window.confirm('Vider le panier ?') && clear()} className="text-sm text-muted underline-offset-4 hover:underline">
          Vider
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((it) => (
          <li key={it.key} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
            <Link to={`/tenue/${it.id}`} className="block h-28 w-22 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-26">
              {it.thumb ? <img src={it.thumb} alt={it.name} className="size-full object-cover" /> : <ImagePlaceholder />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/tenue/${it.id}`} className="line-clamp-2 font-display text-base font-semibold leading-snug">
                    {it.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {[it.size && `Taille ${it.size}`, it.color && it.color].filter(Boolean).join(' • ') || 'Taille et couleur à préciser'}
                  </p>
                </div>
                <button onClick={() => remove(it.key)} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:text-danger" aria-label="Retirer">
                  <Icon name="x" className="size-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-full border border-line">
                  <button onClick={() => setQty(it.key, it.qty - 1)} disabled={it.qty <= 1} className="grid size-8 place-items-center disabled:opacity-30" aria-label="Moins">
                    <Icon name="minus" className="size-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                  <button onClick={() => setQty(it.key, it.qty + 1)} className="grid size-8 place-items-center" aria-label="Plus">
                    <Icon name="plus" className="size-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold">{fmtPrice(it.price * it.qty)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="font-display text-2xl font-semibold">{fmtPrice(total)}</span>
        </div>
        <a href={waLink(orderMessage(items))} target="_blank" rel="noreferrer" className="btn btn-wa mt-4 w-full !py-3.5 text-base">
          <WhatsAppIcon className="size-5" />
          Commander sur WhatsApp
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          Le message contient chaque tenue avec sa photo, sa taille, sa couleur et la quantité.
        </p>
      </div>
    </div>
  )
}
