import { useState } from 'react'
import type { Step } from '../types'

export function ChallengeStepList({ steps }: { steps: Step[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({})
  const total = steps.length
  const completed = Object.values(done).filter(Boolean).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-ink-700">따라하기 순서</h3>
        <span className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600">
          {completed}/{total} 완료
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-50">
        <div
          className="h-full rounded-full bg-coral-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="space-y-2">
        {steps.map((s) => {
          const checked = !!done[s.order]
          return (
            <li
              key={s.order}
              className={`flex gap-3 rounded-2xl border p-3 transition ${
                checked ? 'border-coral-300 bg-coral-50' : 'border-ink-100 bg-white'
              }`}
            >
              <button
                onClick={() => setDone((d) => ({ ...d, [s.order]: !checked }))}
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                  checked ? 'border-coral-500 bg-coral-500 text-white' : 'border-ink-200 text-ink-300'
                }`}
                aria-label={`step ${s.order} 토글`}
              >
                {checked ? '✓' : s.order}
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-ink-700">{s.title}</p>
                  {s.duration_minutes ? (
                    <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-300">
                      {s.duration_minutes}분
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 break-keep text-sm leading-relaxed text-ink-400">{s.body}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
