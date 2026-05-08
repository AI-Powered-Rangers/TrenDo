import { useState } from 'react'
import type { TraditionConnection as Conn } from '../types'

export function TraditionConnection({ conn }: { conn: Conn }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-ink-100 bg-white">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-400">
            전통 연결
          </span>
          <span className="text-sm font-bold text-ink-600">{conn.label}</span>
        </div>
        <span className={`text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div className="border-t border-ink-50 px-4 pb-4 pt-3 text-sm leading-relaxed text-ink-400">
          {conn.body}
        </div>
      )}
    </div>
  )
}
