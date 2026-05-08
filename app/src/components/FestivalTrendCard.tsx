import { Link } from 'react-router-dom'
import type { LocalFestival } from '../data/localFestivals'
import { findChallenge } from '../data/trends'

export function FestivalTrendCard({ festival }: { festival: LocalFestival }) {
  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-card">
      {/* hero */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${festival.cover_gradient} p-5 text-white cover-grain`}
      >
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/30 blur-3xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/85">
              <span>📍 {festival.city_label}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
                {festival.when}
              </span>
            </div>
            <h3 className="mt-2 break-keep text-xl font-black leading-tight drop-shadow">
              {festival.emoji} {festival.name}
            </h3>
            <p className="mt-1.5 break-keep text-[12px] leading-relaxed text-white/85">
              {festival.base_pitch}
            </p>
          </div>
        </div>

        <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          <span>🤝</span>
          <span>{festival.marketing_partner}</span>
        </div>
      </div>

      {/* trend pitch */}
      <div className="px-5 py-4">
        <div className="rounded-2xl bg-coral-50 p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-coral-600">
            Trend Collab Pitch
          </div>
          <p className="mt-1 break-keep text-[13px] leading-relaxed text-coral-700">
            {festival.trend_pitch}
          </p>
        </div>
      </div>

      {/* tieins */}
      <div className="border-t border-ink-50 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-black text-ink-700">트렌드 결합 부스 / 클래스</h4>
          <span className="text-[11px] font-bold text-ink-300">{festival.tieins.length}개</span>
        </div>
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
    </article>
  )
}
