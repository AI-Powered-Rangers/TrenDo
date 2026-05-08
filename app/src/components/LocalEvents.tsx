import type { LocalEvent } from '../types'
import { EVENT_TYPE_EMOJI, EVENT_TYPE_LABEL } from '../data/localEvents'

interface Props {
  events: LocalEvent[]
  title?: string
  subtitle?: string
  empty?: string
}

export function LocalEvents({
  events,
  title = '내 주변 챌린지 연결',
  subtitle = '축제·공방·시장·전시 — 지금 이 유행을 직접 체험할 수 있는 곳.',
  empty = '이 챌린지에 연결된 지역 행사가 아직 없어요. 다른 지역을 골라 보세요.',
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-black text-ink-700">{title}</h2>
          <p className="mt-0.5 text-[11px] text-ink-300">{subtitle}</p>
        </div>
        <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-bold text-ink-300">
          AI · Local Remix
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">{empty}</div>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex gap-3 rounded-xl border border-ink-100 bg-white p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-base">
                {EVENT_TYPE_EMOJI[e.type] ?? '📍'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-ink-700">{e.name}</span>
                  <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral-600">
                    {EVENT_TYPE_LABEL[e.type] ?? e.type}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-ink-300">{e.when}</div>
                <p className="mt-1 break-keep text-[12px] leading-relaxed text-ink-500">{e.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
