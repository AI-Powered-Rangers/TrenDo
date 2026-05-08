import { useMemo, useState } from 'react'
import {
  POPUP_AREA_LABEL,
  POPUP_STORES,
  popupsByArea,
  type PopupArea,
  type PopupCity,
} from '../data/popupStores'
import { PopupHotspotMap } from './PopupHotspotMap'
import { PopupStoreCard } from './PopupStoreCard'

const AREA_BY_CITY: Record<PopupCity, PopupArea[]> = {
  seoul: ['seongsu', 'hongdae', 'yeonnam'],
  daejeon: ['daejeon'],
  daegu: ['daegu'],
  busan: ['busan'],
}

const AREA_FILTERS: Array<{ id: PopupArea | 'all'; emoji: string; label: string }> = [
  { id: 'all', emoji: '🌐', label: '전체' },
  { id: 'seongsu', emoji: '🏭', label: '성수' },
  { id: 'hongdae', emoji: '🎤', label: '홍대' },
  { id: 'yeonnam', emoji: '🌳', label: '연남' },
  { id: 'daejeon', emoji: '🚄', label: '대전' },
  { id: 'daegu', emoji: '🦁', label: '대구' },
  { id: 'busan', emoji: '🌊', label: '부산' },
]

export function PopupGallery() {
  const [area, setArea] = useState<PopupArea | 'all'>('all')
  const [city, setCity] = useState<PopupCity | 'all'>('all')

  // 지도에서 도시 클릭 시 해당 도시의 첫 area로 area도 동기화
  const onCitySelect = (next: PopupCity | 'all') => {
    setCity(next)
    if (next === 'all') {
      setArea('all')
    } else {
      // 도시에 area가 여러 개면 첫 area만 우선 — area 칩으로 추가 필터 가능
      setArea('all') // 도시 선택은 area를 풀어서 도시 전체 보기
    }
  }

  const visible = useMemo(() => {
    let list = popupsByArea(area)
    if (city !== 'all') list = list.filter((p) => p.city === city)
    return list
  }, [area, city])

  const total = POPUP_STORES.length
  const peakCount = POPUP_STORES.filter((p) => p.hot_score >= 80).length

  return (
    <section className="overflow-hidden rounded-[28px] bg-ink-800 text-white shadow-card">
      <div className="relative aurora-mesh">
        <div className="absolute inset-0 cover-grain opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-800/85" />

        <div className="relative px-5 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-coral-200">
                Hot Popup Stores
              </div>
              <h3 className="mt-1 break-keep text-xl font-black leading-tight">
                지금 줄 서는 팝업 — 어디로 갈까?
              </h3>
              <p className="mt-1 text-[11px] text-white/65">
                성수·홍대·연남·대전·대구·부산. 핀을 누르면 지역 필터가 바뀌어요.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/55">총</div>
              <div className="text-2xl font-black">
                {total}곳 <span className="text-sm text-coral-200">· 🔥 {peakCount} 정점</span>
              </div>
            </div>
          </div>

          <PopupHotspotMap selectedCity={city} onSelect={onCitySelect} />
        </div>
      </div>

      {/* area chips */}
      <div className="border-t border-white/8 bg-ink-800 px-3 py-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {AREA_FILTERS.map((f) => {
            const count =
              f.id === 'all'
                ? POPUP_STORES.length
                : POPUP_STORES.filter((p) => p.area === f.id).length
            const isActive = area === f.id
            const allowed =
              f.id === 'all' || city === 'all' || AREA_BY_CITY[city].includes(f.id as PopupArea)
            return (
              <button
                key={f.id}
                disabled={!allowed}
                onClick={() => {
                  setArea(f.id)
                  if (f.id !== 'all' && city !== 'all') {
                    if (!AREA_BY_CITY[city].includes(f.id as PopupArea)) setCity('all')
                  }
                }}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  isActive
                    ? 'bg-coral-500 text-white'
                    : allowed
                    ? 'bg-white/10 text-white/85 hover:bg-white/15'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.label !== '전체' ? POPUP_AREA_LABEL[f.id as PopupArea] ?? f.label : f.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/30 text-white/85'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* card grid */}
      <div className="space-y-3 bg-[#F7F8FC] p-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300">
            이 필터에는 팝업이 없어요. 다른 지역을 골라보세요.
          </div>
        ) : (
          visible.map((p) => <PopupStoreCard key={p.id} popup={p} />)
        )}
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 bg-coral-50 px-4 py-2.5 text-[11px] text-coral-700">
        <span className="font-bold">📍 출처: 팝가 · 성수동고릴라 · 데이포유</span>
        <a
          href="https://popga.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-black"
        >
          전체 팝업 보기 →
        </a>
      </div>
    </section>
  )
}
