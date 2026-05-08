import { Link } from 'react-router-dom'
import type { TrendCardData } from '../types'
import { formatViews } from '../lib/format'

const genLabel: Record<string, string> = {
  teen: '10대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
}

export function TrendCard({ trend }: { trend: TrendCardData }) {
  return (
    <Link
      to={`/c/${trend.challenge_id}`}
      className="block overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.99]"
    >
      <div
        className={`relative aspect-[16/10] bg-gradient-to-br ${trend.cover_gradient} flex items-end p-4 text-white`}
      >
        <div className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-1 text-xs">
          🔥 24h {formatViews(trend.views_24h)}
        </div>
        <div className="text-5xl drop-shadow-md">{trend.emoji}</div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-bold text-ink-700">{trend.title}</h3>
        <p className="text-sm leading-relaxed text-ink-300">{trend.short_pitch}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {trend.generations_reached.map((g) => (
            <span
              key={g}
              className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-semibold text-coral-600"
            >
              {genLabel[g]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
