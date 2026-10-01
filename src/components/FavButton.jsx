import Icon from './Icon'
import { useFavorites } from '../favorites'

/** Cœur pour ajouter/retirer une tenue de SES favoris (côté client). */
export default function FavButton({ id, variant = 'card' }) {
  const { has, toggle } = useFavorites()
  const on = has(id)
  const style =
    variant === 'card'
      ? 'absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-bg/85 text-ink shadow-soft backdrop-blur'
      : 'grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink'
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={on ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
      className={`${style} transition active:scale-90`}
    >
      <Icon name="heart" className="size-5" fill={on} />
    </button>
  )
}
