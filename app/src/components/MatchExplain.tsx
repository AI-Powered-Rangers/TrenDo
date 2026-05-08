import type { MatchResult } from '../lib/personalize'

interface Props {
  result: MatchResult
  generationLabel: string
  regionLabel: string
}

export function MatchExplain({ result, generationLabel, regionLabel }: Props) {
  const sorted = [...result.contributions].sort((a, b) => b.points - a.points)
  const max = sorted[0]?.points ?? 1

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-black text-ink-700">왜 이 추천인가요?</h2>
          <p className="mt-0.5 text-[11px] text-ink-300">
            {regionLabel} · {generationLabel} 기준 매칭 분해
          </p>
        </div>
        <div className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-black text-coral-600">
          {result.score}점
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {sorted.map((c) => {
          const widthPct = Math.max(6, (c.points / Math.max(max, 18)) * 100)
          return (
            <li key={c.key} className="space-y-1">
              <div className="flex items-baseline justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>{c.emoji}</span>
                  <span className="font-bold text-ink-700">{c.label}</span>
                </div>
                <span className="font-black text-coral-600">+{c.points}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-50">
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-coral-300 to-coral-600"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <p className="text-[10px] leading-relaxed text-ink-400">{c.detail}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
