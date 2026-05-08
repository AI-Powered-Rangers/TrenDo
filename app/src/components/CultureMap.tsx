import { useState } from 'react'
import { PINS } from '../data/retention'
import { formatCount } from '../lib/format'

const KOREA_PATH =
  'M170 70 C 210 70 240 100 250 130 L 270 160 L 300 175 L 320 200 L 305 225 L 320 260 L 300 290 L 320 320 L 300 360 L 270 400 L 290 430 L 280 460 L 240 470 L 210 455 L 180 445 L 160 430 L 145 400 L 130 360 L 120 320 L 110 280 L 105 240 L 110 200 L 125 160 L 140 120 Z'

export function CultureMap() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="relative rounded-2xl bg-white p-3 shadow-card">
      <svg viewBox="80 50 260 600" className="h-[560px] w-full">
        <defs>
          <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFE2D4" />
            <stop offset="100%" stopColor="#F2F4FA" />
          </linearGradient>
          <radialGradient id="pin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF5C2A" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        <path d={KOREA_PATH} fill="url(#land)" stroke="#A4ADCC" strokeWidth="1.2" />

        <ellipse cx="160" cy="525" rx="22" ry="14" fill="url(#land)" stroke="#A4ADCC" strokeWidth="1" />

        {PINS.map((p) => {
          const r = Math.max(6, Math.min(22, Math.log10(p.count) * 4))
          const isActive = active === p.region
          return (
            <g
              key={p.region}
              onClick={() => setActive(isActive ? null : p.region)}
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r={r * 1.8} fill="url(#pin)" />
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill="#FF5C2A"
                stroke="white"
                strokeWidth="2"
                opacity={isActive ? 1 : 0.85}
              />
              <text
                x={p.x}
                y={p.y - r - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#172149"
              >
                {p.region_label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm">
        {active ? (
          <ActivePin region={active} />
        ) : (
          <p className="text-ink-300">핀을 눌러 지역별 챌린지 확산을 살펴보세요.</p>
        )}
      </div>
    </div>
  )
}

function ActivePin({ region }: { region: string }) {
  const p = PINS.find((x) => x.region === region)
  if (!p) return null
  return (
    <div>
      <div className="text-xs text-ink-300">현재 가장 활발한 챌린지</div>
      <div className="text-base font-bold text-ink-700">
        {p.region_label} · {p.top_challenge}
      </div>
      <div className="text-xs text-ink-400">
        오늘 참여 {formatCount(p.count)}명
      </div>
    </div>
  )
}
