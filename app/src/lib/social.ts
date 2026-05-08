import { useEffect, useState, useCallback } from 'react'

const KEYS = {
  saved: 'trendo.saved.v1',
  liked: 'trendo.liked.v1',
  joined: 'trendo.joined.v1',
  setlog: 'trendo.setlog.v1',
  postLikes: 'trendo.postLikes.v1',
  myStories: 'trendo.myStories.v1',
  storiesSeen: 'trendo.storiesSeen.v1',
  doneTrends: 'trendo.doneTrends.v1',
} as const

type StoreKey = keyof typeof KEYS
type Listener = () => void
const listeners: Record<StoreKey, Set<Listener>> = {
  saved: new Set(),
  liked: new Set(),
  joined: new Set(),
  setlog: new Set(),
  postLikes: new Set(),
  myStories: new Set(),
  storiesSeen: new Set(),
  doneTrends: new Set(),
}

function notify(key: StoreKey) {
  listeners[key].forEach((l) => l())
}

function subscribe(key: StoreKey, fn: Listener): () => void {
  listeners[key].add(fn)
  return () => {
    listeners[key].delete(fn)
  }
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function useSet(storeKey: StoreKey): [Set<string>, (id: string) => void, (id: string) => boolean] {
  const lsKey = KEYS[storeKey]
  const [snap, setSnap] = useState<Set<string>>(() => new Set(readJSON<string[]>(lsKey, [])))

  useEffect(() => {
    return subscribe(storeKey, () => {
      setSnap(new Set(readJSON<string[]>(lsKey, [])))
    })
  }, [storeKey, lsKey])

  const toggle = useCallback(
    (id: string) => {
      const arr = readJSON<string[]>(lsKey, [])
      const idx = arr.indexOf(id)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.unshift(id)
      writeJSON(lsKey, arr)
      notify(storeKey)
    },
    [storeKey, lsKey],
  )

  const has = useCallback((id: string) => snap.has(id), [snap])
  return [snap, toggle, has]
}

export const useSaved = () => useSet('saved')
export const useLikedChallenges = () => useSet('liked')
export const useJoined = () => useSet('joined')
export const useLikedPosts = () => useSet('postLikes')
export const useDoneTrends = () => useSet('doneTrends')

import type { SetlogEntry } from '../types'

export function useSetlog(): [
  SetlogEntry[],
  (entry: Omit<SetlogEntry, 'id'>) => void,
  (id: string) => void,
] {
  const lsKey = KEYS.setlog
  const [items, setItems] = useState<SetlogEntry[]>(() => readJSON<SetlogEntry[]>(lsKey, []))

  useEffect(() => {
    return subscribe('setlog', () => setItems(readJSON<SetlogEntry[]>(lsKey, [])))
  }, [lsKey])

  const add = useCallback(
    (entry: Omit<SetlogEntry, 'id'>) => {
      const next: SetlogEntry = { ...entry, id: `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
      const arr = readJSON<SetlogEntry[]>(lsKey, [])
      writeJSON(lsKey, [next, ...arr])
      notify('setlog')
    },
    [lsKey],
  )

  const remove = useCallback(
    (id: string) => {
      const arr = readJSON<SetlogEntry[]>(lsKey, [])
      writeJSON(
        lsKey,
        arr.filter((e) => e.id !== id),
      )
      notify('setlog')
    },
    [lsKey],
  )

  return [items, add, remove]
}

export function computeStreak(entries: SetlogEntry[]): number {
  if (!entries.length) return 0
  const days = new Set(entries.map((e) => e.date))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) streak++
    else break
  }
  return streak
}

export interface MyStory {
  id: string
  challenge_id: string
  cover_emoji: string
  cover_gradient: string
  caption: string
  mood: '🔥' | '💛' | '🌿' | '😴' | '✨'
  created_at: string // ISO
  image_data_url?: string // 사용자가 첨부한 사진 (data URL)
}

export function useMyStories(): [
  MyStory[],
  (entry: Omit<MyStory, 'id' | 'created_at'>) => MyStory,
  (id: string) => void,
] {
  const lsKey = KEYS.myStories
  const [items, setItems] = useState<MyStory[]>(() => readJSON<MyStory[]>(lsKey, []))

  useEffect(() => {
    return subscribe('myStories', () => setItems(readJSON<MyStory[]>(lsKey, [])))
  }, [lsKey])

  const add = useCallback(
    (entry: Omit<MyStory, 'id' | 'created_at'>) => {
      const next: MyStory = {
        ...entry,
        id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
      }
      const arr = readJSON<MyStory[]>(lsKey, [])
      writeJSON(lsKey, [next, ...arr])
      notify('myStories')
      return next
    },
    [lsKey],
  )

  const remove = useCallback(
    (id: string) => {
      const arr = readJSON<MyStory[]>(lsKey, [])
      writeJSON(
        lsKey,
        arr.filter((e) => e.id !== id),
      )
      notify('myStories')
    },
    [lsKey],
  )

  return [items, add, remove]
}

export function useStoriesSeen(): [Set<string>, (id: string) => void] {
  const lsKey = KEYS.storiesSeen
  const [snap, setSnap] = useState<Set<string>>(
    () => new Set(readJSON<string[]>(lsKey, [])),
  )
  useEffect(() => {
    return subscribe('storiesSeen', () => {
      setSnap(new Set(readJSON<string[]>(lsKey, [])))
    })
  }, [lsKey])
  const mark = useCallback(
    (id: string) => {
      const arr = readJSON<string[]>(lsKey, [])
      if (arr.includes(id)) return
      arr.push(id)
      writeJSON(lsKey, arr)
      notify('storiesSeen')
    },
    [lsKey],
  )
  return [snap, mark]
}

export async function shareLink(url: string, title: string): Promise<'native' | 'clipboard'> {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, url })
      return 'native'
    } catch {
      // user cancelled — fall through
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(url)
  }
  return 'clipboard'
}
