import { Link } from 'react-router-dom'
import type { TrendCardData } from '../types'
import { formatViews } from '../lib/format'
import { findChallenge } from '../data/trends'
import { MatchBadge } from './MatchBadge'

const genLabel: Record<string, string> = {
  teen: '10~20대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
}

const categoryLabel: Record<TrendCardData['category'], string> = {
  food: '먹거리',
  fitness: '루틴',
  photo: '인증샷',
  craft: '만들기',
}

const difficultyLabel: Record<string, string> = {
  easy: '쉬움',
  medium: '중간',
  hard: '도전',
}

export function TrendCard({
  trend,
  matchScore,
}: {
  trend: TrendCardData
  matchScore?: number
}) {
  const challenge = findChallenge(trend.challenge_id)

  return (
    <Link
      to={`/c/${trend.challenge_id}`}
      className="block overflow-hidden rounded-[24px] bg-white shadow-card transition active:scale-[0.99]"
    >
      <div
        className={`relative flex min-h-[190px] overflow-hidden bg-gradient-to-br ${trend.cover_gradient} p-4 text-white cover-grain`}
      >
        {challenge?.image_url && (
          <img
            src={challenge.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute left-3 top-3 rounded-full bg-black/24 px-2.5 py-1 text-[11px] font-bold">
          {categoryLabel[trend.category]}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
          🔥 {formatViews(trend.views_24h)}
        </div>
        {typeof matchScore === 'number' && (
          <div className="absolute right-3 bottom-3 z-10">
            <MatchBadge score={matchScore} size="md" />
          </div>
        )}
        <div className="relative mt-auto flex w-full items-end justify-between gap-3">
          <div>
            {!challenge?.image_url && (
              <div className="text-6xl drop-shadow-md">{trend.emoji}</div>
            )}
            <h3 className="mt-2 break-keep text-2xl font-black leading-tight drop-shadow">
              {trend.title}
            </h3>
          </div>
          <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right text-ink-700 shadow-card">
            <div className="text-[10px] font-bold text-ink-300">바로 하기</div>
            <div className="text-sm font-black text-coral-600">시작 →</div>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="break-keep text-sm leading-relaxed text-ink-400">{trend.short_pitch}</p>
        {challenge && (
          <div className="grid grid-cols-3 gap-2">
            <Mini label="시간" value={`${challenge.duration_minutes}분`} />
            <Mini label="비용" value={challenge.estimated_cost ?? '변동'} />
            <Mini label="난이도" value={difficultyLabel[challenge.difficulty]} />
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {trend.generations_reached.map((g) => (
            <span
              key={g}
              className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600"
            >
              {genLabel[g]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 px-3 py-2">
      <div className="text-[10px] font-bold text-ink-300">{label}</div>
      <div className="mt-0.5 text-sm font-black text-ink-700">{value}</div>
    </div>
  )
}
