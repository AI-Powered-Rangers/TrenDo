import { useMemo } from 'react'
import {
  INSIDER_LEADERBOARD,
  TOTAL_TODOS,
  tierFor,
  type InsiderEntry,
} from '../data/trendToDo'
import { useDoneTrends } from '../lib/social'

interface Props {
  preview?: boolean // true면 상위 3+나만 표시
}

const RANK_BADGE = ['🥇', '🥈', '🥉']

export function InsiderLeaderboard({ preview = false }: Props) {
  const [done] = useDoneTrends()
  const myCount = done.size

  const list = useMemo<(InsiderEntry & { mine?: boolean })[]>(() => {
    const me: InsiderEntry & { mine: boolean } = {
      id: 'me',
      name: '나',
      emoji: '😀',
      region: '내 지역',
      generation: '내 세대',
      done_count: myCount,
      mine: true,
    }
    const all = [...INSIDER_LEADERBOARD, me].sort((a, b) => b.done_count - a.done_count)
    return all
  }, [myCount])

  const myIdx = list.findIndex((u) => (u as any).mine)
  const visible = preview
    ? Array.from(new Set([...list.slice(0, 3), list[myIdx]])).filter(Boolean) as typeof list
    : list

  return (
    <section className="overflow-hidden rounded-[24px] bg-white shadow-card">
      <div className="border-b border-ink-50 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-600">
          INSIDER OF THE MONTH
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <h3 className="text-base font-black text-ink-700">오늘의 인싸 — 이번 달 리더보드</h3>
          <span className="text-[11px] font-bold text-ink-300">월 {TOTAL_TODOS}개 기준</span>
        </div>
      </div>

      <ol className="divide-y divide-ink-50">
        {visible.map((u) => {
          const idx = list.indexOf(u)
          const tier = tierFor(u.done_count)
          const pct = Math.round((u.done_count / TOTAL_TODOS) * 100)
          return (
            <li
              key={u.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                u.mine ? 'bg-coral-50/60' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${
                  idx < 3 ? 'bg-coral-500 text-white' : 'bg-ink-50 text-ink-400'
                }`}
              >
                {idx < 3 ? RANK_BADGE[idx] : idx + 1}
              </span>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-50 text-base">
                {u.emoji}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-black text-ink-700">
                    {u.name}
                  </span>
                  {u.mine && (
                    <span className="rounded-full bg-coral-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                      나
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-ink-300">
                  {u.region} · {u.generation}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[14px] font-black text-coral-600 tabular-nums">
                  {u.done_count}
                  <span className="text-[10px] font-bold text-ink-300">/{TOTAL_TODOS}</span>
                </div>
                <div className={`mt-0.5 text-[10px] font-bold ${tier.ringClass.split(' ').find((c) => c.startsWith('text-')) ?? 'text-ink-400'}`}>
                  {tier.emoji} {tier.label} · {pct}%
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {preview && (
        <div className="border-t border-ink-50 bg-ink-50/40 px-4 py-2.5 text-center text-[11px] font-bold text-ink-500">
          전체 리더보드는{' '}
          <span className="text-coral-600">트렌드 To-Do</span>에서 확인
        </div>
      )}
    </section>
  )
}
