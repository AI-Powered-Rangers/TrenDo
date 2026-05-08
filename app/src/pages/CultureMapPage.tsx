import { useMemo, useState } from 'react'
import { CultureMap } from '../components/CultureMap'
import { TrendFlow } from '../components/TrendFlow'
import { FestivalTrendCard } from '../components/FestivalTrendCard'
import { PopupStoreCard } from '../components/PopupStoreCard'
import {
  LOCAL_FESTIVALS,
  festivalsByRegion,
} from '../data/localFestivals'
import { POPUP_STORES, popupsByCity, type PopupCity } from '../data/popupStores'
import { useUserPrefs } from '../store/userPrefs'
import { REGION_LABEL } from '../lib/personalize'
import type { Region } from '../types'

const REGION_TO_POPUP_CITY: Partial<Record<Region, PopupCity>> = {
  seoul: 'seoul',
  daegu: 'daegu',
  busan: 'busan',
}

export function CultureMapPage() {
  const [prefs] = useUserPrefs()
  const [regionFilter, setRegionFilter] = useState<Region | null>(null)

  // 추천: 사용자 지역 매칭
  const myFestivals = useMemo(() => festivalsByRegion(prefs.region).slice(0, 2), [prefs.region])
  const myPopups = useMemo(() => {
    const city = REGION_TO_POPUP_CITY[prefs.region]
    if (!city) return []
    return popupsByCity(city)
      .sort((a, b) => b.hot_score - a.hot_score)
      .slice(0, 2)
  }, [prefs.region])

  // 필터된 리스트
  const visibleFestivals = useMemo(() => {
    if (!regionFilter) return LOCAL_FESTIVALS
    return festivalsByRegion(regionFilter)
  }, [regionFilter])

  const visiblePopups = useMemo(() => {
    if (!regionFilter) return [...POPUP_STORES].sort((a, b) => b.hot_score - a.hot_score)
    const city = REGION_TO_POPUP_CITY[regionFilter]
    if (!city) return []
    return popupsByCity(city).sort((a, b) => b.hot_score - a.hot_score)
  }, [regionFilter])

  return (
    <div className="space-y-5 px-4 pt-6">
      <header>
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">MAP</div>
        <h1 className="text-2xl font-black text-ink-700">지도</h1>
      </header>

      {/* 흐름 지도 — 컴팩트 */}
      <TrendFlow />

      {/* 사용자 추천 */}
      {(myFestivals.length > 0 || myPopups.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-base font-black text-ink-700">
              {REGION_LABEL[prefs.region]} 추천
            </h2>
            <span className="text-[10px] font-bold text-ink-300">맞춤</span>
          </div>
          <div className="space-y-2">
            {myFestivals.map((f) => (
              <FestivalTrendCard key={f.id} festival={f} />
            ))}
            {myPopups.map((p) => (
              <PopupStoreCard key={p.id} popup={p} />
            ))}
          </div>
        </section>
      )}

      {/* 지도 — 핀 클릭으로 아래 리스트 필터 */}
      <CultureMap
        selectedRegion={regionFilter}
        onSelectRegion={(r) => setRegionFilter((r as Region) ?? null)}
      />

      {/* 필터 상태 */}
      {regionFilter && (
        <div className="flex items-center justify-between rounded-2xl bg-coral-50 px-4 py-2.5">
          <span className="text-[12px] font-bold text-coral-700">
            📍 {REGION_LABEL[regionFilter]}만 보기
          </span>
          <button
            onClick={() => setRegionFilter(null)}
            className="rounded-full bg-coral-500 px-3 py-1 text-[11px] font-black text-white"
          >
            전체 보기
          </button>
        </div>
      )}

      {/* 축제 — 컴팩트 리스트 */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-base font-black text-ink-700">축제</h2>
          <span className="text-[10px] font-bold text-ink-300">{visibleFestivals.length}곳</span>
        </div>
        {visibleFestivals.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-300 shadow-card">
            이 지역에 등록된 축제가 없어요.
          </div>
        ) : (
          visibleFestivals.map((f) => <FestivalTrendCard key={f.id} festival={f} />)
        )}
      </section>

      {/* 팝업 — 컴팩트 리스트 */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-base font-black text-ink-700">팝업</h2>
          <span className="text-[10px] font-bold text-ink-300">{visiblePopups.length}곳</span>
        </div>
        {visiblePopups.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-300 shadow-card">
            이 지역에 등록된 팝업이 없어요.
          </div>
        ) : (
          visiblePopups.map((p) => <PopupStoreCard key={p.id} popup={p} />)
        )}
      </section>
    </div>
  )
}
