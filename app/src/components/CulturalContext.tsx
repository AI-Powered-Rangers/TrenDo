import type { CulturalContext as Ctx } from '../types'

const sections: Array<{
  key: keyof Ctx
  emoji: string
  label: string
  tint: string
}> = [
  { key: 'origin', emoji: '🌱', label: '시작·기원', tint: 'bg-coral-50 text-coral-700' },
  { key: 'meaning', emoji: '💡', label: '의미·맥락', tint: 'bg-indigo-50 text-indigo-700' },
  { key: 'fun_point', emoji: '🎯', label: '재미 포인트', tint: 'bg-amber-50 text-amber-700' },
  { key: 'caution', emoji: '⚠️', label: '주의사항', tint: 'bg-rose-50 text-rose-700' },
]

export function CulturalContext({ ctx }: { ctx: Ctx }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-black text-ink-700">문화 맥락 요약</h2>
        <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-bold text-ink-300">
          AI · Cultural Context
        </span>
      </div>
      <p className="mt-1 text-[11px] text-ink-300">
        이 유행의 시작·의미·재미 포인트·주의사항을 한 화면에서 확인하세요.
      </p>

      <div className="mt-3 grid gap-2">
        {sections.map((s) => {
          const value = ctx[s.key]
          if (!value) return null
          return (
            <div key={s.key} className="flex gap-3 rounded-xl bg-ink-50/60 p-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.tint} text-base`}
              >
                {s.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-ink-700">{s.label}</div>
                <p className="mt-0.5 break-keep text-[12px] leading-relaxed text-ink-500">
                  {value}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
