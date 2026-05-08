import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LocalFestival } from '../data/localFestivals'
import { findChallenge } from '../data/trends'

const SOURCE_BADGE: Record<LocalFestival['source'], { emoji: string; label: string; cls: string }> = {
  collab: {
    emoji: '🤝',
    label: '콜라보',
    cls: 'bg-coral-500 text-white',
  },
  visitkorea: {
    emoji: '🇰🇷',
    label: 'VisitKorea',
    cls: 'bg-ink-700 text-white',
  },
}

interface Props {
  festival: LocalFestival
  /** true면 헤더만 표시하고 클릭 시 인라인 펼침 (기본값: true) */
  collapsible?: boolean
}

export function FestivalTrendCard({ festival, collapsible = true }: Props) {
  const sourceBadge = SOURCE_BADGE[festival.source]
  const [open, setOpen] = useState(!collapsible)

  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-card">
      {/* hero — clickable to toggle */}
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`relative block w-full overflow-hidden bg-gradient-to-br ${festival.cover_gradient} p-4 text-left text-white cover-grain ${
          collapsible ? 'transition active:scale-[0.99]' : ''
        }`}
      >
        <div className="absolute inset-0 cover-shine" />

        <div className="relative flex items-center gap-3">
          <span className="text-3xl drop-shadow">{festival.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/85">
              <span>{festival.city_label}</span>
              <span>·</span>
              <span>{festival.when}</span>
            </div>
            <h3 className="mt-0.5 truncate text-base font-black leading-tight">
              {festival.name}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${sourceBadge.cls}`}
          >
            {sourceBadge.emoji}
          </span>
          {collapsible && (
            <span className={`text-white/70 transition ${open ? 'rotate-180' : ''}`}>⌄</span>
          )}
        </div>
      </button>

      {/* expanded content */}
      {open && (
        <div className="space-y-3 p-4">
          <p className="break-keep text-[12px] leading-relaxed text-ink-500">
            {festival.base_pitch}
          </p>
          {festival.highlight && (
            <p className="break-keep text-[11px] text-ink-400">✦ {festival.highlight}</p>
          )}

          {festival.marketing_partner && (
            <div className="text-[10px] font-bold text-coral-600">
              🤝 {festival.marketing_partner}
            </div>
          )}

          {festival.trend_pitch && (
            <div className="rounded-xl bg-coral-50 p-3 text-[12px] leading-relaxed text-coral-700">
              {festival.trend_pitch}
            </div>
          )}

          {festival.tieins.length > 0 ? (
            <div>
              <h4 className="mb-2 text-[12px] font-black text-ink-700">트렌드 결합 부스</h4>
          <ul className="mt-3 space-y-2">
            {festival.tieins.map((t) => {
              const ch = findChallenge(t.challenge_id)
              return (
                <li key={`${festival.id}-${t.challenge_id}-${t.trend_title}`}>
                  <Link
                    to={`/c/${t.challenge_id}`}
                    className="flex gap-3 rounded-xl border border-ink-100 p-3 transition active:scale-[0.99]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-xl">
                      {t.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-black text-ink-700">{t.trend_title}</div>
                      {ch && (
                        <div className="mt-0.5 text-[10px] font-bold text-coral-600">
                          ↪ {ch.emoji} {ch.title}
                        </div>
                      )}
                      <p className="mt-1 break-keep text-[11px] leading-relaxed text-ink-400">
                        {t.body}
                      </p>
                    </div>
                    <span className="self-center text-coral-500">→</span>
                  </Link>
                </li>
              )
            })}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl bg-ink-50/60 p-3 text-center text-[11px] text-ink-400">
              트렌드 결합 부스는 일정 확정 시 안내됩니다.
            </div>
          )}
        </div>
      )}
    </article>
  )
}
