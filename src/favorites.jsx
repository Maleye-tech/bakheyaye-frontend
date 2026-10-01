import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'by_favorites_v1'
const Ctx = createContext(null)
export const useFavorites = () => useContext(Ctx)

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.filter((n) => Number.isInteger(n)) : []
  } catch {
    return []
  }
}

/** Favoris du CLIENT : enregistrés sur son appareil (pas de compte nécessaire). */
export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      /* stockage indisponible : les favoris restent en mémoire */
    }
  }, [ids])

  const toggle = useCallback((id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur])), [])
  const value = useMemo(() => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle }), [ids, toggle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
