import { useMemo, useState } from 'react'
import { PINS } from '../data/retention'
import { formatCount } from '../lib/format'

const KOREA_PATH =
  'M170 70 C 210 70 240 100 250 130 L 270 160 L 300 175 L 320 200 L 305 225 L 320 260 L 300 290 L 320 320 L 300 360 L 270 400 L 290 430 L 280 460 L 240 470 L 210 455 L 180 445 L 160 430 L 145 400 L 130 360 L 120 320 L 110 280 L 105 240 L 110 200 L 125 160 L 140 120 Z'

// Connection lines: source region → target region (drawn as flow lines)
const FLOWS: Array<[string, string]> = [
  ['seoul', 'jeonju'],
  ['seoul', 'gangneung'],
  ['jeonju', 'gwangju'],
  ['gwangju', 'busan'],
  ['busan', 'jeju'],
  ['daegu', 'busan'],
]

interface CultureMapProps {
  selectedRegion?: string | null
  onSelectRegion?: (region: string | null) => void
}

export function CultureMap({ selectedRegion, onSelectRegion }: CultureMapProps = {}) {
  const [internalActive, setInternalActive] = useState<string | null>(null)
  const active = selectedRegion !== undefined ? selectedRegion : internalActive
  const setActive = (next: string | null) => {
    if (onSelectRegion) onSelectRegion(next)
    else setInternalActive(next)
  }
  const total = useMemo(() => PINS.reduce((s, p) => s + p.count, 0), [])
  const sorted = useMemo(() => [...PINS].sort((a, b) => b.count - a.count), [])

  return (
    <div className="overflow-hidden rounded-[28px] bg-ink-800 text-white shadow-card">
      <div className="relative aurora-mesh">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-800/20 to-ink-800/85" />

        {/* legend / counters */}
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 px-5 pt-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-coral-200">
              K-Culture Flow Map
            </div>
            <h3 className="mt-1 text-xl font-black leading-tight">
              유행이 어떻게 전국으로 퍼졌나
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/60">30일 누적 참여</div>
            <div className="text-2xl font-black">{formatCount(total)}명</div>
          </div>
        </div>

        <svg viewBox="80 50 260 530" className="relative z-10 mx-auto block h-[480px] w-full">
          <defs>
            <linearGradient id="land2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFC0A4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#A4ADCC" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#23305C" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="ridge" cx="40%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="flow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0" />
              <stop offset="50%" stopColor="#FF7D4F" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFC0A4" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="haze" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FF5C2A" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* land */}
          <path d={KOREA_PATH} fill="url(#land2)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d={KOREA_PATH} fill="url(#ridge)" />
          <ellipse cx="160" cy="525" rx="22" ry="14" fill="url(#land2)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

          {/* flow lines */}
          {FLOWS.map(([from, to], i) => {
            const a = PINS.find((p) => p.region === from)
            const b = PINS.find((p) => p.region === to)
            if (!a || !b) return null
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2 - 18
            const d = `M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`
            return (
              <g key={`${from}-${to}`}>
                <path d={d} stroke="rgba(255, 255, 255, 0.10)" strokeWidth="2" fill="none" />
                <path
                  d={d}
                  stroke="url(#flow)"
                  strokeWidth="2.2"
                  fill="none"
                  className="flow-dash"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              </g>
            )
          })}

          {/* pins */}
          {PINS.map((p) => {
            const r = Math.max(6, Math.min(22, Math.log10(p.count) * 4))
            const isActive = active === p.region
            return (
              <g
                key={p.region}
                onClick={() => setActive(isActive ? null : p.region)}
                className="cursor-pointer"
              >
                {/* haze */}
                <circle cx={p.x} cy={p.y} r={r * 2.4} fill="url(#haze)" />
                {/* pulse rings */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill="none"
                  stroke="#FF7D4F"
                  strokeWidth="1.4"
                  className="pin-pulse"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill="none"
                  stroke="#FF7D4F"
                  strokeWidth="1.2"
                  className="pin-pulse pin-pulse-2"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill="none"
                  stroke="#FFC0A4"
                  strokeWidth="1"
                  className="pin-pulse pin-pulse-3"
                />
                {/* pin */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="#FF5C2A"
                  stroke={isActive ? '#FFF3EE' : 'rgba(255,255,255,0.85)'}
                  strokeWidth={isActive ? 3 : 2}
                  filter="url(#softGlow)"
                />
                <circle cx={p.x} cy={p.y} r={r * 0.42} fill="#FFF3EE" opacity="0.85" />
                <text
                  x={p.x}
                  y={p.y - r - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="white"
                  filter="url(#softGlow)"
                >
                  {p.region_label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* top-3 leaderboard */}
        <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-white/10 px-4 py-3">
          {sorted.slice(0, 3).map((p, i) => (
            <div
              key={p.region}
              className="rounded-2xl bg-white/8 px-3 py-2 backdrop-blur-sm"
            >
              <div className="text-[10px] text-coral-200">#{i + 1} {p.region_label}</div>
              <div className="mt-0.5 text-sm font-black text-white">
                {formatCount(p.count)}
              </div>
              <div className="mt-0.5 line-clamp-1 text-[10px] text-white/70">
                {p.top_challenge}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* active info */}
      <div className="bg-white p-4 text-ink-700">
        {active ? (
          <ActivePin region={active} />
        ) : (
          <p className="text-sm text-ink-300">
            핀을 눌러 지역별 챌린지 확산을 살펴보세요.
          </p>
        )}
      </div>
    </div>
  )
}

function ActivePin({ region }: { region: string }) {
  const p = PINS.find((x) => x.region === region)
  if (!p) return null
  return (
    <div className="reveal">
      <div className="text-xs text-ink-300">현재 가장 활발한 챌린지</div>
      <div className="mt-1 text-lg font-black text-ink-700">
        {p.region_label} · {p.top_challenge}
      </div>
      <div className="mt-1 text-xs text-ink-400">
        오늘 참여 {formatCount(p.count)}명
      </div>
    </div>
  )
}
