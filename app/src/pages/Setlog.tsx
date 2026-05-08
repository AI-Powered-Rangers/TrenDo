import { useMemo } from 'react'
import { SetlogComposer } from '../components/SetlogComposer'
import { SetlogEntryCard } from '../components/SetlogEntry'
import { computeStreak, useSetlog } from '../lib/social'

export function SetlogPage() {
  const [items] = useSetlog()
  const streak = useMemo(() => computeStreak(items), [items])
  const total = items.length
  const moods = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of items) map[e.mood] = (map[e.mood] ?? 0) + 1
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [items])

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <div className="text-coral-600 text-[11px] font-extrabold tracking-[0.3em]">SETLOG</div>
        <h1 className="text-2xl font-black text-ink-700">오늘의 셋</h1>
        <p className="mt-1 text-xs text-ink-300">
          유행을 기록하면 “현실에서 살아남은 문화”가 되어요. 매일 한 줄이면 충분.
        </p>
      </header>

      <section className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="연속 기록" value={`${streak}일`} hi />
        <Stat label="총 셋로그" value={`${total}개`} />
        <Stat
          label="자주 쓴 기분"
          value={moods[0] ? `${moods[0][0]} ${moods[0][1]}` : '—'}
        />
      </section>

      <section className="mb-5">
        <SetlogComposer />
      </section>

      <h2 className="mb-2 px-1 text-sm font-bold text-ink-700">기록</h2>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
          아직 셋로그가 없어요. 오늘의 한 줄을 위에서 남겨보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <SetlogEntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, hi = false }: { label: string; value: string; hi?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 shadow-card ${
        hi ? 'bg-coral-500 text-white' : 'bg-white text-ink-700'
      }`}
    >
      <div className={`text-[11px] ${hi ? 'text-white/80' : 'text-ink-300'}`}>{label}</div>
      <div className="text-base font-black">{value}</div>
    </div>
  )
}
