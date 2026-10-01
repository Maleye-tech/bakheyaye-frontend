import Icon from './Icon'

function pagesToShow(page, total) {
  const set = new Set([1, total, page, page - 1, page + 1])
  const list = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  list.forEach((p, i) => {
    if (i && p - list[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export default function Pagination({ page, count, pageSize, onChange }) {
  const total = Math.max(1, Math.ceil(count / pageSize))
  if (total <= 1) return null
  const btn =
    'grid size-10 place-items-center rounded-full border border-line bg-surface text-sm font-medium transition active:scale-95 disabled:opacity-40'
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Page précédente">
        <Icon name="chevL" className="size-4" />
      </button>
      {pagesToShow(page, total).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? '!border-gold !bg-gold !text-ongold' : 'hover:border-gold'}`}
          >
            {p}
          </button>
        ),
      )}
      <button className={btn} disabled={page >= total} onClick={() => onChange(page + 1)} aria-label="Page suivante">
        <Icon name="chevR" className="size-4" />
      </button>
    </nav>
  )
}
