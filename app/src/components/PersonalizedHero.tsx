import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TRENDS, findChallenge } from '../data/trends'
import { useUserPrefs } from '../store/userPrefs'
import {
  matchScore,
  REGION_TINT,
  GENERATION_LABEL,
  REGION_LABEL,
} from '../lib/personalize'
import { MatchBadge } from './MatchBadge'

const COST_LABEL: Record<string, string> = {
  free: '무료',
  under5k: '5천 원',
  under10k: '1만 원',
  under30k: '3만 원',
}
const TIME_LABEL: Record<string, string> = {
  '10m': '10분',
  '30m': '30분',
  '1h': '1시간',
  halfday: '반나절',
}
const PARTICIPATION_LABEL: Record<string, string> = {
  solo: '혼자',
  friends: '친구와',
  family: '가족과',
  local: '지역 모임',
}

export function PersonalizedHero() {
  const [prefs] = useUserPrefs()

  const ranked = useMemo(() => {
    return TRENDS.map((trend) => {
      const ch = findChallenge(trend.challenge_id)
      if (!ch) return null
      return { trend, challenge: ch, match: matchScore(trend, ch, prefs) }
    })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => b.match.score - a.match.score)
  }, [prefs])

  const top = ranked[0]
  const tint = REGION_TINT[prefs.region]

  if (!top) return null

  const { trend, challenge, match } = top
  const localVariant = challenge.local_variants.find((v) => v.region === prefs.region)
  const genVariant =
    challenge.generation_variants.find((v) => v.generation === prefs.generation) ??
    challenge.generation_variants[0]

  // Top-3 contributions for preview (skip base)
  const topContribs = [...match.contributions]
    .filter((c) => c.key !== 'base')
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)

  // 다른 카드 매칭 차이 — "이 조합에서 +N점 더 받는 카드"
  const second = ranked[1]
  const lift = second ? match.score - second.match.score : 0

  return (
    <section
      key={`${prefs.generation}-${prefs.region}`}
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${tint.hero} text-white shadow-card`}
    >
      <div className="absolute inset-0 cover-grain opacity-70" />
      <div className="absolute inset-0 cover-shine" />
      <div
        className={`absolute -right-16 -top-12 h-52 w-52 rounded-full ${tint.orb} opacity-40 blur-3xl`}
      />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-coral-300 opacity-30 blur-3xl" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className={`reveal inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-[0.18em] ${tint.chipBg} ${tint.chipText}`}
            >
              FOR YOU · {REGION_LABEL[prefs.region]} · {GENERATION_LABEL[prefs.generation]}
            </div>
            <h2 className="reveal reveal-1 mt-3 break-keep text-xl font-black leading-tight">
              {REGION_LABEL[prefs.region]}의 {GENERATION_LABEL[prefs.generation]}에게
              <br />
              가장 잘 맞는 챌린지
            </h2>
            <p className="reveal reveal-2 mt-1.5 text-[11px] text-white/75">
              {TIME_LABEL[prefs.time_budget]} · {COST_LABEL[prefs.cost_range]} ·{' '}
              {PARTICIPATION_LABEL[prefs.participation_type]}
            </p>
          </div>
          <MatchBadge score={match.score} size="lg" className="shrink-0" />
        </div>

        {/* Featured card */}
        <Link
          to={`/c/${challenge.id}`}
          className="reveal reveal-3 mt-4 block overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 transition active:scale-[0.99]"
        >
          <div className="flex items-stretch gap-3 p-3">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${challenge.cover_gradient} text-4xl shadow-card`}
            >
              <span className="float-breathe drop-shadow">{challenge.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-white/65">
                트렌드 · {trend.title}
              </div>
              <div className="mt-0.5 break-keep text-base font-black leading-tight">
                {localVariant?.title ?? genVariant.title}
              </div>
              <div className="mt-1 line-clamp-2 break-keep text-[11px] leading-relaxed text-white/75">
                {localVariant?.twist ?? genVariant.hook}
              </div>
            </div>
          </div>

          {/* contribution mini-bars */}
          <div className="grid grid-cols-2 gap-px bg-white/10 px-px">
            {topContribs.map((c) => (
              <div
                key={c.key}
                className="bg-ink-800/35 px-3 py-2 text-[10px] backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between">
                  <span className="flex items-center gap-1 font-bold text-white/80">
                    <span>{c.emoji}</span>
                    <span>{c.label}</span>
                  </span>
                  <span className="font-black text-coral-200">+{c.points}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-coral-500/95 px-4 py-2.5">
            <span className="text-[12px] font-black text-white">
              지금 시작 →
            </span>
            <span className="text-[10px] font-bold text-white/80">
              {challenge.duration_minutes}분 · {challenge.estimated_cost ?? '비용 변동'}
            </span>
          </div>
        </Link>

        {lift > 0 && second && (
          <div className="reveal reveal-3 mt-3 flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[10px] backdrop-blur-sm">
            <span className="text-coral-200">▲ +{lift}점</span>
            <span className="text-white/70">
              2위 “{second.challenge.title}” 대비 더 잘 맞아요
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
