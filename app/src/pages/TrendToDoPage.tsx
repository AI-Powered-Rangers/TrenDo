import { useMemo, useState } from 'react'
import {
  TREND_TODO,
  TOTAL_TODOS,
  tierFor,
  nextTier,
  type TodoMovement,
} from '../data/trendToDo'
import { TrendToDoRow } from '../components/TrendToDoItem'
import { InsiderLeaderboard } from '../components/InsiderLeaderboard'
import { useDoneTrends } from '../lib/social'

const MOVEMENT_FILTERS: Array<{ id: 'all' | TodoMovement; label: string; emoji: string }> = [
  { id: 'all', label: '전체', emoji: '🌐' },
  { id: 'peak', label: '정점', emoji: '🔥' },
  { id: 'rising', label: '상승', emoji: '↑' },
  { id: 'fading', label: '한물', emoji: '↓' },
]

const HIDE_DONE_KEY = 'trendo.todo.hideDone'

export function TrendToDoPage() {
  const [done] = useDoneTrends()
  const [filter, setFilter] = useState<'all' | TodoMovement>('all')
  const [hideDone, setHideDone] = useState(() => {
    try {
      return window.localStorage.getItem(HIDE_DONE_KEY) === '1'
    } catch {
      return false
    }
  })
  const myCount = done.size
  const tier = tierFor(myCount)
  const upcoming = nextTier(myCount)
  const remain = upcoming ? upcoming.threshold - myCount : 0

  const visible = useMemo(() => {
    let items = [...TREND_TODO].sort((a, b) => a.rank - b.rank)
    if (filter !== 'all') items = items.filter((i) => i.movement === filter)
    if (hideDone) items = items.filter((i) => !done.has(i.id))
    return items
  }, [filter, hideDone, done])

  return (
    <div className="space-y-5 px-4 pt-6">
      <header>
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
          MONTHLY TREND TO-DO
        </div>
        <h1 className="text-2xl font-black text-ink-700">이번 달 트렌드 To-Do</h1>
        <p className="mt-1 text-xs text-ink-300">
          유행은 빠르게 들고 빠르게 빠져요. 카테고리 박스 없이 인기순으로 한 줄씩 따라해 보세요.
        </p>
      </header>

      {/* my progress */}
      <section className="overflow-hidden rounded-[24px] bg-white shadow-card">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 p-5 text-white cover-grain">
          <div className="absolute inset-0 cover-shine" />
          <div className="absolute -right-12 -top-10 h-44 w-44 rounded-full bg-coral-400 opacity-30 blur-3xl" />
          <div className="relative flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-200">
                MY PROGRESS
              </div>
              <h2 className="mt-1 break-keep text-2xl font-black leading-tight">
                {myCount}
                <span className="text-base text-white/60">/{TOTAL_TODOS}개 따라했어요</span>
              </h2>
            </div>
            <div className="text-right">
              <div className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-black backdrop-blur-sm">
                {tier.emoji} {tier.label}
              </div>
              {upcoming && (
                <div className="mt-1 text-[10px] text-white/70">
                  {upcoming.label}까지 {remain}개
                </div>
              )}
            </div>
          </div>
          <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral-300 to-coral-500"
              style={{ width: `${Math.round((myCount / TOTAL_TODOS) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* movement filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {MOVEMENT_FILTERS.map((f) => {
          const count =
            f.id === 'all'
              ? TREND_TODO.length
              : TREND_TODO.filter((i) => i.movement === f.id).length
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
                active
                  ? 'border-ink-700 bg-ink-700 text-white'
                  : 'border-ink-100 bg-white text-ink-500'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  active ? 'bg-white/20 text-white' : 'bg-ink-50 text-ink-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}

        <label className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-ink-500 shadow-card">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => {
              setHideDone(e.target.checked)
              try {
                window.localStorage.setItem(HIDE_DONE_KEY, e.target.checked ? '1' : '0')
              } catch {
                /* ignore */
              }
            }}
            className="accent-coral-500"
          />
          완료 숨기기
        </label>
      </div>

      {/* flat ranked list */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
          이 필터에는 남은 트렌드가 없어요. 다른 동향을 골라보세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((it) => (
            <li key={it.id}>
              <TrendToDoRow item={it} />
            </li>
          ))}
        </ul>
      )}

      <InsiderLeaderboard />
    </div>
  )
}
