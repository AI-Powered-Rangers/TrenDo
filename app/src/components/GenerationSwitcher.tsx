import type { Generation } from '../types'

const ITEMS: { id: Generation; label: string; sub: string }[] = [
  { id: 'teen', label: '10대', sub: '트렌디·짧게' },
  { id: 'adult', label: '30·40대', sub: '실용·따뜻' },
  { id: 'senior', label: '50·60대', sub: '친절·단계적' },
  { id: 'family', label: '온 가족', sub: '함께' },
  { id: 'foreign', label: '외국인', sub: 'EN-friendly' },
]

export function GenerationSwitcher({
  value,
  onChange,
  className = '',
}: {
  value: Generation
  onChange: (next: Generation) => void
  className?: string
}) {
  return (
    <div className={`grid grid-cols-5 gap-1.5 ${className}`}>
      {ITEMS.map((it) => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`rounded-xl px-1.5 py-2 text-center transition ${
              active
                ? 'bg-ink-700 text-white shadow-card'
                : 'bg-white text-ink-400 hover:bg-ink-50'
            }`}
          >
            <div className="text-xs font-bold">{it.label}</div>
            <div className={`mt-0.5 text-[9px] leading-tight ${active ? 'text-coral-200' : 'text-ink-200'}`}>
              {it.sub}
            </div>
          </button>
        )
      })}
    </div>
  )
}
