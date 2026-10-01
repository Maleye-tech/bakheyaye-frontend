import { API_URL } from './config'

const AK = 'by_access'
const RK = 'by_refresh'

export const tokens = {
  get: () => localStorage.getItem(AK),
  set: ({ access, refresh }) => {
    if (access) localStorage.setItem(AK, access)
    if (refresh) localStorage.setItem(RK, refresh)
  },
  clear: () => {
    localStorage.removeItem(AK)
    localStorage.removeItem(RK)
  },
  hasAny: () => !!(localStorage.getItem(AK) || localStorage.getItem(RK)),
}

async function refreshAccess() {
  const refresh = localStorage.getItem(RK)
  if (!refresh) return false
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return false
    tokens.set(await res.json())
    return true
  } catch {
    return false
  }
}

export async function api(path, { method = 'GET', body, auth = false, params } = {}) {
  let url = `${API_URL}${path}`
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v)
    })
    const s = qs.toString()
    if (s) url += `?${s}`
  }

  const send = () => {
    const headers = {}
    let payload
    if (body instanceof FormData) payload = body
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const t = tokens.get()
    if (auth && t) headers.Authorization = `Bearer ${t}`
    return fetch(url, { method, headers, body: payload })
  }

  let res
  try {
    res = await send()
    if (res.status === 401 && auth && (await refreshAccess())) res = await send()
  } catch {
    const e = new Error("Impossible de joindre le serveur. Vérifiez votre connexion.")
    e.network = true
    throw e
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const e = new Error(flattenError(data) || 'Une erreur est survenue.')
    e.status = res.status
    e.data = data
    throw e
  }
  return data
}

function flattenError(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' • ')
}
