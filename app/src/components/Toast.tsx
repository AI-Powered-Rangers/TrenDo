import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'

interface ToastItem {
  id: string
  text: string
}

const ToastCtx = createContext<{ push: (text: string) => void }>({ push: () => {} })

export function useToast() {
  return useContext(ToastCtx)
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((text: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
    setItems((s) => [...s, { id, text }])
  }, [])

  useEffect(() => {
    if (!items.length) return
    const t = setTimeout(() => {
      setItems((s) => s.slice(1))
    }, 1800)
    return () => clearTimeout(t)
  }, [items])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-32 z-50 flex flex-col items-center gap-2 px-6">
        {items.map((it) => (
          <div
            key={it.id}
            className="pointer-events-auto rounded-full bg-ink-700/95 px-4 py-2 text-xs font-semibold text-white shadow-card"
          >
            {it.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
