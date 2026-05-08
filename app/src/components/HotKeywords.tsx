import { Link } from 'react-router-dom'
import { HOT_KEYWORDS } from '../data/hotKeywords'
import type { HotHighlight } from '../data/hotKeywords'

const HIGHLIGHT_STYLE: Record<NonNullable<HotHighlight>, { label: string; cls: string }> = {
  new: { label: 'NEW', cls: 'bg-coral-500 text-white' },
  hot: { label: 'HOT', cls: 'bg-rose-500 text-white' },
  family: { label: '가족 추천', cls: 'bg-emerald-500 text-white' },
  fading: { label: '한물 가는 중', cls: 'bg-stone-400 text-white' },
}

export function HotKeywords() {
  const top = HOT_KEYWORDS.slice(0, 6)
  return (
    <section className="overflow-hidden rounded-[24px] bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral-500" />
          </span>
          <span className="text-sm font-black text-ink-700">실시간 급상승 키워드</span>
        </div>
        <span className="text-[11px] font-bold text-ink-300">1분 전 갱신</span>
      </div>

      <ul>
        {top.map((kw, idx) => {
          const isLast = idx === top.length - 1
          const upTone =
            kw.movement === 'up'
              ? 'text-coral-600'
              : kw.movement === 'down'
              ? 'text-stone-500'
              : 'text-ink-300'
          return (
            <li key={kw.rank} className={`relative ${isLast ? '' : 'border-b border-ink-50'}`}>
              <Link
                to={`/c/${kw.challenge_id}`}
                className="flex items-center gap-3 px-4 py-3 transition active:bg-coral-50"
              >
                <span className="w-5 shrink-0 text-center text-[13px] font-black text-ink-300">
                  {kw.rank}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-xl">
                  {kw.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-black text-ink-700">
                      {kw.hashtag}
                    </span>
                    {kw.highlight && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${HIGHLIGHT_STYLE[kw.highlight].cls}`}
                      >
                        {HIGHLIGHT_STYLE[kw.highlight].label}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-300">
                    {kw.participants_label}
                  </div>
                </div>

                <div className={`flex shrink-0 items-baseline gap-1 text-right ${upTone}`}>
                  <span className="text-base font-black">
                    {kw.movement === 'up' ? '↑' : kw.movement === 'down' ? '↓' : '→'}
                  </span>
                  <span className="text-[13px] font-black tabular-nums">{kw.growth}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-ink-50 bg-coral-50 px-4 py-2.5">
        <span className="text-[11px] font-bold text-coral-700">
          🔥 따라하기만 해도 우리 동네에 신호가 가요
        </span>
        <Link to="/community" className="text-[11px] font-black text-coral-700">
          전체 →
        </Link>
      </div>
    </section>
  )
}
