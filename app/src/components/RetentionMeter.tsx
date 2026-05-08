import type { RetentionRecord } from '../types'
import { formatPct, formatCount } from '../lib/format'

interface RingDef {
  key: keyof RetentionRecord
  label: string
  color: string
  trackColor: string
}

const RINGS: RingDef[] = [
  { key: 'completion_rate', label: '완료율', color: '#FF5C2A', trackColor: 'rgba(255, 92, 42, 0.12)' },
  { key: 'day7_retention', label: 'D+7', color: '#FF7D4F', trackColor: 'rgba(255, 124, 79, 0.10)' },
  { key: 'day30_retention', label: 'D+30', color: '#FFC0A4', trackColor: 'rgba(255, 192, 164, 0.12)' },
]

export function RetentionMeter({ rec }: { rec: RetentionRecord }) {
  const score = Math.max(0, Math.min(100, rec.retention_score))
  const cx = 90
  const cy = 90
  const radii = [76, 60, 44]
  const arcsFor = (idx: number) => {
    const r = radii[idx]
    const circ = 2 * Math.PI * r
    const ring = RINGS[idx]
    const value = Number(rec[ring.key]) // 0..1
    const pct = Math.max(0, Math.min(1, value))
    return { r, circ, dash: pct * circ, ring, value }
  }

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-card">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-50 via-white to-ink-50" />
        <div className="absolute -left-10 -top-12 h-48 w-48 rounded-full bg-coral-200 opacity-40 blur-3xl" />
        <div className="absolute -right-12 -bottom-14 h-48 w-48 rounded-full bg-indigo-200 opacity-40 blur-3xl" />

        <div className="relative flex items-center gap-5 p-5">
          {/* multi-ring radial chart */}
          <div className="relative shrink-0">
            <svg width="180" height="180" viewBox="0 0 180 180" className="block">
              <defs>
                <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="scoreFill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FFC0A4" />
                  <stop offset="100%" stopColor="#FF5C2A" />
                </linearGradient>
              </defs>

              {/* tracks */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={`t${i}`}
                  cx={cx}
                  cy={cy}
                  r={radii[i]}
                  stroke={RINGS[i].trackColor}
                  strokeWidth="10"
                  fill="none"
                />
              ))}

              {/* fills */}
              {[0, 1, 2].map((i) => {
                const { r, circ, dash, ring } = arcsFor(i)
                return (
                  <circle
                    key={`f${i}`}
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke={ring.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${dash} ${circ}`}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#ringGlow)"
                    className="ring-sweep"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                )
              })}

              {/* center score */}
              <circle cx={cx} cy={cy} r="30" fill="url(#scoreFill)" filter="url(#ringGlow)" />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="22"
                fontWeight="900"
                fill="white"
              >
                {score}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                fontSize="8"
                fontWeight="800"
                fill="white"
                opacity="0.85"
              >
                SCORE
              </text>
            </svg>
          </div>

          {/* description */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-coral-600">
              CULTURAL RETENTION
            </div>
            <div className="break-keep text-base font-black text-ink-700">
              현실에서 살아남은 정도
            </div>
            <div className="text-xs text-ink-400">
              누적 참여 <span className="font-bold text-ink-700">{formatCount(rec.participants)}</span>명
            </div>

            <ul className="mt-2 space-y-1">
              {RINGS.map((ring) => {
                const v = Number(rec[ring.key])
                return (
                  <li key={ring.key} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: ring.color }}
                    />
                    <span className="text-ink-400">{ring.label}</span>
                    <span className="ml-auto font-black text-ink-700">{formatPct(v)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* secondary stats */}
      <dl className="grid grid-cols-2 gap-px bg-ink-100 px-px">
        {[
          { k: '취미化', v: formatPct(rec.became_hobby), emoji: '🎯' },
          { k: '가족과', v: formatPct(rec.shared_with_family), emoji: '👨‍👩‍👧' },
        ].map((it) => (
          <div key={it.k} className="bg-white px-4 py-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold text-ink-300">
              <span>{it.emoji}</span>
              <span>{it.k}</span>
            </dt>
            <dd className="mt-0.5 text-base font-black text-ink-700">{it.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
