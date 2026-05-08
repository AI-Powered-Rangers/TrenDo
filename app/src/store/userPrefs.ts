import { useEffect, useState } from 'react'
import type { UserPrefs } from '../types'

const KEY = 'trendo.prefs.v1'

const defaults: UserPrefs = {
  generation: 'adult',
  region: 'seoul',
  interests: ['food', 'tradition', 'family'],
  time_budget: '30m',
  cost_range: 'under10k',
  participation_type: 'family',
  onboarded: false,
}

function read(): UserPrefs {
  if (typeof window === 'undefined') return defaults
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

function write(prefs: UserPrefs) {
  window.localStorage.setItem(KEY, JSON.stringify(prefs))
  window.dispatchEvent(new CustomEvent('trendo:prefs', { detail: prefs }))
}

export function useUserPrefs(): [UserPrefs, (next: Partial<UserPrefs>) => void] {
  const [prefs, setPrefs] = useState<UserPrefs>(() => read())

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<UserPrefs>).detail
      if (detail) setPrefs(detail)
    }
    window.addEventListener('trendo:prefs', onChange)
    return () => window.removeEventListener('trendo:prefs', onChange)
  }, [])

  const update = (next: Partial<UserPrefs>) => {
    const merged = { ...prefs, ...next }
    write(merged)
    setPrefs(merged)
  }

  return [prefs, update]
}

export function getPrefs(): UserPrefs {
  return read()
}
