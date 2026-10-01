import { useEffect, useState } from 'react'

/** Charge des données ; se relance quand `deps` change. */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}

/** Bouton "Installer l'application" (PWA). */
export function useInstallPrompt() {
  const [evt, setEvt] = useState(null)
  useEffect(() => {
    const h = (e) => {
      e.preventDefault()
      setEvt(e)
    }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  return evt
    ? async () => {
        evt.prompt()
        await evt.userChoice
        setEvt(null)
      }
    : null
}
