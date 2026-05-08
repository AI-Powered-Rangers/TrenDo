interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MatchBadge({ score, size = 'sm', className = '' }: Props) {
  const safe = Math.max(0, Math.min(100, Math.round(score)))
  const tone =
    safe >= 90
      ? 'from-coral-400 to-coral-600'
      : safe >= 75
      ? 'from-amber-400 to-coral-500'
      : safe >= 55
      ? 'from-indigo-400 to-coral-500'
      : 'from-ink-400 to-ink-600'

  const cls =
    size === 'lg'
      ? 'h-20 w-20 text-2xl'
      : size === 'md'
      ? 'h-12 w-12 text-base'
      : 'h-9 w-9 text-[11px]'

  return (
    <div
      key={safe}
      className={`reveal relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${tone} ${cls} font-black text-white shadow-card glow-soft ${className}`}
    >
      <span className="leading-none">{safe}</span>
      {size === 'lg' && (
        <span className="absolute -bottom-1 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-black text-coral-600">
          MATCH
        </span>
      )}
    </div>
  )
}
