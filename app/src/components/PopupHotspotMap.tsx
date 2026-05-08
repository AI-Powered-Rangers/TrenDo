import {
  POPUP_CITY_PIN,
  POPUP_STORES,
  type PopupCity,
} from '../data/popupStores'

const KOREA_PATH =
  'M170 70 C 210 70 240 100 250 130 L 270 160 L 300 175 L 320 200 L 305 225 L 320 260 L 300 290 L 320 320 L 300 360 L 270 400 L 290 430 L 280 460 L 240 470 L 210 455 L 180 445 L 160 430 L 145 400 L 130 360 L 120 320 L 110 280 L 105 240 L 110 200 L 125 160 L 140 120 Z'

interface Props {
  selectedCity: PopupCity | 'all'
  onSelect: (city: PopupCity | 'all') => void
}

export function PopupHotspotMap({ selectedCity, onSelect }: Props) {
  // 도시별 인기 합산
  const cityScore = (city: PopupCity) =>
    POPUP_STORES.filter((p) => p.city === city).reduce((s, p) => s + p.hot_score, 0)

  return (
    <div className="relative">
      <svg viewBox="80 50 260 470" className="block h-[300px] w-full">
        <defs>
          <linearGradient id="pp-land" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFC0A4" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#A4ADCC" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#23305C" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="pp-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF5C2A" stopOpacity="0" />
          </radialGradient>
          <filter id="pp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={KOREA_PATH} fill="url(#pp-land)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <ellipse
          cx="160"
          cy="525"
          rx="22"
          ry="14"
          fill="url(#pp-land)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.8"
        />

        {(Object.keys(POPUP_CITY_PIN) as PopupCity[]).map((city) => {
          const pin = POPUP_CITY_PIN[city]
          const score = cityScore(city)
          const r = Math.max(6, Math.min(22, Math.log10(Math.max(1, score)) * 5.5))
          const isActive = selectedCity === city

          return (
            <g key={city} onClick={() => onSelect(isActive ? 'all' : city)} className="cursor-pointer">
              <circle cx={pin.x} cy={pin.y} r={r * 2.2} fill="url(#pp-haze)" />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={6}
                fill="none"
                stroke="#FF7D4F"
                strokeWidth="1.4"
                className="pin-pulse"
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={6}
                fill="none"
                stroke="#FFC0A4"
                strokeWidth="1.2"
                className="pin-pulse pin-pulse-2"
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={r}
                fill={isActive ? '#FFF3EE' : '#FF5C2A'}
                stroke="white"
                strokeWidth={isActive ? 3 : 2}
                filter="url(#pp-glow)"
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={r * 0.42}
                fill={isActive ? '#FF5C2A' : '#FFF3EE'}
              />
              <text
                x={pin.x}
                y={pin.y - r - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="white"
                filter="url(#pp-glow)"
              >
                {pin.label}
              </text>
              <text
                x={pin.x}
                y={pin.y + r + 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="rgba(255,255,255,0.85)"
              >
                {POPUP_STORES.filter((p) => p.city === city).length}곳
              </text>
            </g>
          )
        })}
      </svg>

      <button
        onClick={() => onSelect('all')}
        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-black transition ${
          selectedCity === 'all'
            ? 'bg-coral-500 text-white shadow-card'
            : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
        }`}
      >
        전체 보기
      </button>
    </div>
  )
}
