import { Link } from 'react-router-dom'
import { TOTAL_TODOS, TREND_TODO, tierFor, nextTier } from '../data/trendToDo'
import { useDoneTrends } from '../lib/social'

export function TrendToDoCard() {
  const [done] = useDoneTrends()
  const myCount = done.size
  const pct = Math.round((myCount / TOTAL_TODOS) * 100)
  const tier = tierFor(myCount)
  const upcoming = nextTier(myCount)
  const remain = upcoming ? upcoming.threshold - myCount : 0

  // 다음 도전 — 인기 상위 중 아직 안 한 것 4개
  const nextChallenges = TREND_TODO.filter((it) => !done.has(it.id)).slice(0, 4)

  return (
    <Link
      to="/todo"
      className="block overflow-hidden rounded-[24px] bg-white shadow-card transition active:scale-[0.99]"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 p-5 text-white cover-grain">
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-12 -top-10 h-44 w-44 rounded-full bg-coral-400 opacity-30 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-200">
              MONTHLY TREND TO-DO
            </div>
            <h3 className="mt-1 break-keep text-lg font-black leading-tight">
              {myCount === 0 ? '이번 달 트렌드, 한 개라도 따라해봐요' : `이번 달 트렌드 ${myCount}개 따라했어요`}
            </h3>
          </div>
          <div className="ml-3 shrink-0 text-right">
            <div className="text-[10px] text-white/55">현재 등급</div>
            <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-black backdrop-blur-sm">
              <span>{tier.emoji}</span>
              <span>{tier.label}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex items-baseline justify-between text-[11px] text-white/70">
            <span className="font-bold">
              {myCount}/{TOTAL_TODOS} 완료
            </span>
            <span className="font-black tabular-nums text-coral-200">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral-300 to-coral-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {upcoming && (
            <div className="mt-1.5 text-[10px] text-white/65">
              {upcoming.emoji} {upcoming.label}까지 {remain}개 남음
            </div>
          )}
        </div>
      </div>

      {/* 다음 도전 추천 */}
      {nextChallenges.length > 0 && (
        <div className="px-3 py-3">
          <div className="px-1 pb-2 text-[11px] font-black text-ink-400">
            다음 도전 — 인기 상위 중 아직 안 해본 것
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {nextChallenges.map((it) => (
              <div
                key={it.id}
                className="flex w-[150px] shrink-0 flex-col gap-1.5 rounded-xl bg-ink-50/70 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${it.cover_gradient} text-base text-white shadow-card`}
                  >
                    {it.emoji}
                  </span>
                  <span className="text-[10px] font-black text-ink-300">#{it.rank}</span>
                </div>
                <div className="line-clamp-1 text-[11px] font-black text-ink-700">
                  {it.title}
                </div>
                <div className="line-clamp-1 text-[10px] text-ink-300">{it.hashtag}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-coral-50 px-4 py-2.5">
        <span className="text-[11px] font-bold text-coral-700">
          🌟 따라할수록 등급이 올라요
        </span>
        <span className="text-[11px] font-black text-coral-700">전체 보기 →</span>
      </div>
    </Link>
  )
}
