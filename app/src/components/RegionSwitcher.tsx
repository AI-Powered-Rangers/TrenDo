import type { Region } from '../types'
import { REGIONS } from '../data/regions'

export function RegionSwitcher({
  value,
  onChange,
  className = '',
}: {
  value: Region
  onChange: (next: Region) => void
  className?: string
}) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-none ${className}`}>
      {REGIONS.map((r) => {
        const active = r.id === value
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
              active
                ? 'border-coral-500 bg-coral-500 text-white'
                : 'border-ink-100 bg-white text-ink-400 hover:border-coral-200'
            }`}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
