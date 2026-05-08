import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { REGIONS, findRegion } from '../data/regions'
import { eventsForRegion, EVENT_TYPE_EMOJI, EVENT_TYPE_LABEL } from '../data/localEvents'
import { festivalsByRegion } from '../data/localFestivals'
import { FestivalTrendCard } from '../components/FestivalTrendCard'
import { findChallenge } from '../data/trends'
import { useUserPrefs } from '../store/userPrefs'
import type { Region, LocalEventType } from '../types'

const TYPE_ORDER: LocalEventType[] = ['festival', 'workshop', 'market', 'exhibit']

export function LocalChallenges() {
  const [prefs, setPrefs] = useUserPrefs()
  const [region, setRegion] = useState<Region>(prefs.region)
  const events = useMemo(() => eventsForRegion(region), [region])
  const festivals = useMemo(() => festivalsByRegion(region), [region])
  const info = findRegion(region)

  const matchedChallenges = useMemo(() => {
    const ids = new Set<string>()
    events.forEach((e) => e.matches.forEach((id) => ids.add(id)))
    return [...ids].map((id) => findChallenge(id)).filter((x): x is NonNullable<typeof x> => !!x)
  }, [events])

  return (
    <div className="space-y-5 px-4 pt-6">
      <header>
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
          LOCAL CHALLENGES
        </div>
        <h1 className="text-2xl font-black text-ink-700">내 주변에서 직접 해보기</h1>
        <p className="mt-1 text-xs text-ink-300">
          지금 뜨는 유행을 우리 동네 축제·공방·시장·전시와 연결해 드립니다.
        </p>
      </header>

      {/* region picker */}
      <section className="rounded-2xl bg-white p-3 shadow-card">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-ink-700">지역 선택</h2>
          <button
            onClick={() => setPrefs({ region })}
            className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600"
          >
            기본 지역으로 저장
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {REGIONS.map((r) => {
            const active = r.id === region
            return (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border-coral-500 bg-coral-500 text-white'
                    : 'border-ink-100 bg-white text-ink-400'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* region hero */}
      <section className="overflow-hidden rounded-[24px] bg-ink-700 text-white shadow-card">
        <div className="relative cover-grain">
          <div className="absolute inset-0 aurora-mesh opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-800/60" />
          <div className="relative p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-200">
              {info.label}
            </div>
            <h2 className="mt-1 break-keep text-xl font-black leading-tight">
              {info.label}에서 해볼 수 있는 챌린지
            </h2>
            <p className="mt-1 text-[11px] text-white/70">
              특산물 · {info.specialties.join(' / ')}
            </p>
          </div>
        </div>
      </section>

      {/* 지자체 × 트렌드 콜라보 페스티벌 */}
      {festivals.length > 0 && (
        <section className="space-y-3">
          <div className="px-1">
            <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
              CITY × TREND COLLAB
            </div>
            <h2 className="text-base font-black text-ink-700">
              {info.label} 지자체가 만든 트렌드 콜라보
            </h2>
            <p className="mt-1 text-[11px] text-ink-300">
              지역 축제가 직접 트렌드 부스를 운영해요. 호기심으로 한 번 가면 인증샷이 자동으로 따라옵니다.
            </p>
          </div>
          <div className="space-y-4">
            {festivals.map((f) => (
              <FestivalTrendCard key={f.id} festival={f} />
            ))}
          </div>
        </section>
      )}

      {/* events grouped by type */}
      <section className="space-y-3">
        {TYPE_ORDER.map((type) => {
          const subset = events.filter((e) => e.type === type)
          if (subset.length === 0) return null
          return (
            <div key={type} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-black text-ink-700">
                  {EVENT_TYPE_EMOJI[type]} {EVENT_TYPE_LABEL[type]}
                </h3>
                <span className="text-[11px] font-bold text-ink-300">{subset.length}곳</span>
              </div>

              <ul className="mt-3 space-y-2">
                {subset.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border border-ink-100 bg-white p-3"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-black text-ink-700">{e.name}</span>
                      <span className="text-[10px] text-ink-300">{e.when}</span>
                    </div>
                    <p className="mt-1 break-keep text-[12px] leading-relaxed text-ink-500">
                      {e.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.matches.map((id) => {
                        const ch = findChallenge(id)
                        if (!ch) return null
                        return (
                          <Link
                            key={id}
                            to={`/c/${id}`}
                            className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600"
                          >
                            {ch.emoji} {ch.title}
                          </Link>
                        )
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {events.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
            이 지역의 행사가 아직 등록되지 않았어요. 다른 지역을 골라 보세요.
          </div>
        )}
      </section>

      {/* connected challenges */}
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-black text-ink-700">이 지역과 잘 맞는 챌린지</h2>
        <p className="mt-0.5 text-[11px] text-ink-300">위 행사들과 자연스럽게 묶이는 챌린지.</p>
        {matchedChallenges.length === 0 ? (
          <div className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
            연결된 챌린지가 아직 없어요.
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {matchedChallenges.map((ch) => (
              <li key={ch.id}>
                <Link
                  to={`/c/${ch.id}`}
                  className="block rounded-xl bg-ink-50 p-3 transition active:scale-[0.99]"
                >
                  <div className="text-2xl">{ch.emoji}</div>
                  <div className="mt-1 text-sm font-black text-ink-700">{ch.title}</div>
                  <div className="text-[10px] text-ink-300">{ch.duration_minutes}분 · {ch.estimated_cost ?? '비용 변동'}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
