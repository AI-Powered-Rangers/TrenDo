import { useMemo, useState } from 'react'
import { CultureMap } from '../components/CultureMap'
import { TrendFlow } from '../components/TrendFlow'
import { FestivalTrendCard } from '../components/FestivalTrendCard'
import { PINS } from '../data/retention'
import { LOCAL_FESTIVALS } from '../data/localFestivals'
import { formatCount } from '../lib/format'

export function CultureMapPage() {
  const [t, setT] = useState(100)
  const total = useMemo(() => PINS.reduce((s, p) => s + p.count, 0), [])
  const scaled = Math.round((total * t) / 100)

  return (
    <div className="space-y-5 px-4 pt-6">
      <header>
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
          FLOW MAPS
        </div>
        <h1 className="text-2xl font-black text-ink-700">유행이 흐른 길과 닿은 곳</h1>
        <p className="mt-1 text-xs text-ink-300">
          시간축 흐름과 지역 확산, 그리고 지자체가 만든 트렌드 콜라보까지 함께.
        </p>
      </header>

      <TrendFlow />

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-ink-300">지난 30일 누적 참여</span>
          <span className="text-xl font-black text-coral-600">{formatCount(scaled)}명</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="mt-3 w-full accent-coral-500"
        />
        <div className="flex justify-between text-[11px] text-ink-300">
          <span>D-30</span>
          <span>지금</span>
        </div>
      </div>

      <CultureMap />

      {/* 지자체 × 트렌드 콜라보 페스티벌 */}
      <section className="space-y-3">
        <div className="px-1">
          <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
            CITY × TREND COLLAB
          </div>
          <h2 className="text-xl font-black text-ink-700">
            지자체가 만든 트렌드 콜라보 페스티벌
          </h2>
          <p className="mt-1 text-xs text-ink-300">
            논산 딸기 + 두쫀쿠, 전주 비빔밥 + 봄동 비빔밥, 강릉 커피 + 메스 …
            <br />
            지역 축제가 직접 트렌드 부스를 운영하는 콜라보. 지자체는 빠른 마케팅, 사용자는
            새로운 호기심.
          </p>
        </div>

        <div className="space-y-4">
          {LOCAL_FESTIVALS.map((f) => (
            <FestivalTrendCard key={f.id} festival={f} />
          ))}
        </div>
      </section>
    </div>
  )
}
