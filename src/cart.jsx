import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'by_cart_v1'
const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* stockage indisponible : le panier reste en mémoire */
    }
  }, [items])

  const add = useCallback((item) => {
    setItems((cur) => {
      const i = cur.findIndex((x) => x.key === item.key)
      if (i === -1) return [...cur, { ...item, qty: item.qty || 1 }]
      return cur.map((x, n) => (n === i ? { ...x, qty: Math.min(20, x.qty + (item.qty || 1)) } : x))
    })
  }, [])
  const setQty = useCallback(
    (key, qty) => setItems((cur) => cur.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(20, qty)) } : x))),
    [],
  )
  const remove = useCallback((key) => setItems((cur) => cur.filter((x) => x.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items, add, setQty, remove, clear],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
