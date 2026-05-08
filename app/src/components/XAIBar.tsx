import type { XAIFeature } from '../types'

interface Props {
  feature: XAIFeature
  highlight?: boolean
  description?: string
  showFormula?: boolean
}

export function XAIBar({
  feature,
  highlight = false,
  description,
  showFormula = false,
}: Props) {
  const contribution = feature.weight * feature.value
  const widthPct = Math.max(2, Math.min(100, feature.value))
  const contribPct = Math.round(contribution * 10) / 10

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3 text-[11px]">
        <div className="min-w-0">
          <div className={`font-bold ${highlight ? 'text-coral-600' : 'text-ink-600'}`}>
            {feature.label}
          </div>
          {description && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-ink-300">{description}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-ink-400">
          <span className="font-bold text-ink-700">{feature.value}</span>
          <span className="ml-1 text-[10px] text-ink-300">기여 {contribPct.toFixed(1)}</span>
          {showFormula && (
            <div className="text-[10px] text-ink-300">
              {feature.weight.toFixed(2)} × {feature.value}
            </div>
          )}
        </div>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-ink-50 ring-1 ring-ink-100/60">
        <div
          className={`bar-fill relative h-full rounded-full ${
            highlight
              ? 'bg-gradient-to-r from-coral-300 via-coral-500 to-coral-600 shimmer'
              : 'bg-gradient-to-r from-ink-500 via-ink-700 to-ink-700'
          }`}
          style={{ width: `${widthPct}%` }}
        />
        {highlight && (
          <div
            className="pointer-events-none absolute top-0 h-full w-1 rounded-full bg-white/80 blur-[1px]"
            style={{ left: `calc(${widthPct}% - 2px)` }}
          />
        )}
      </div>
    </div>
  )
}
