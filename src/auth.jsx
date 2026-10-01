import { createContext, useContext, useEffect, useState } from 'react'
import { api, tokens } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!tokens.hasAny()) {
      setReady(true)
      return
    }
    api('/auth/me/', { auth: true })
      .then((u) => setUser(u.is_staff ? u : null))
      .catch(() => tokens.clear())
      .finally(() => setReady(true))
  }, [])

  const login = async (username, password) => {
    const t = await api('/auth/token/', { method: 'POST', body: { username, password } })
    tokens.set(t)
    const u = await api('/auth/me/', { auth: true })
    if (!u.is_staff) {
      tokens.clear()
      throw new Error("Ce compte n'a pas accès au back-office.")
    }
    setUser(u)
  }

  const logout = () => {
    tokens.clear()
    setUser(null)
  }

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>
}