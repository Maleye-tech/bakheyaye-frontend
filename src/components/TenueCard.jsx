import { Link, useLocation } from 'react-router-dom'
import FavButton from './FavButton'
import { LOGO_SRC } from '../config'
import { fmtPrice } from '../utils'

export function ImagePlaceholder() {
  return (
    <div className="grid size-full place-items-center bg-gradient-to-br from-surface2 to-line">
      <img src={LOGO_SRC} alt="" className="size-1/3 opacity-40" />
    </div>
  )
}

export default function TenueCard({ t, index = 0 }) {
  const location = useLocation()
  const soldOut = t.status === 'sold_out'
  const img = t.images?.[0]
  return (
    <Link
      to={`/tenue/${t.id}`}
      state={{ background: location }}
      className="fade-up group block"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface2 shadow-soft">
        {img ? (
          <img
            src={img.thumb}
            alt={t.name}
            loading="lazy"
            className={`size-full object-cover transition duration-500 group-hover:scale-105 ${
              soldOut ? 'grayscale-[0.6] opacity-80' : ''
            }`}
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {soldOut && (
            <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-bg">
              Épuisé
            </span>
          )}
        </div>
        <FavButton id={t.id} />
      </div>
      <div className="px-1 pt-3">
        {t.category_name && (
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{t.category_name}</p>
        )}
        <h3 className="mt-0.5 line-clamp-1 font-display text-base font-semibold sm:text-lg">{t.name}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{fmtPrice(t.price)}</p>
          {t.colors?.length > 0 && (
            <div className="flex -space-x-1">
              {t.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  title={c.name}
                  className="size-4 rounded-full border-2 border-bg"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function CardSkeletons({ n = 8 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i}>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="skeleton mt-3 h-3 w-1/3 rounded" />
      <div className="skeleton mt-2 h-4 w-3/4 rounded" />
    </div>
  ))
}
