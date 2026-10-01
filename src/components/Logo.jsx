import { Link } from 'react-router-dom'
import { BRAND, LOGO_SRC } from '../config'

export default function Logo({ size = 'size-9', showName = true, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label={BRAND}>
      <img src={LOGO_SRC} alt="" className={`${size} object-contain`} />
      {showName && (
        <span className="font-display text-lg font-semibold tracking-wide text-ink">
          Bakh<span className="text-muted">Yaye</span>
          <span className="hidden font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted sm:ml-2 sm:inline">
            Couture
          </span>
        </span>
      )}
    </Link>
  )
}
