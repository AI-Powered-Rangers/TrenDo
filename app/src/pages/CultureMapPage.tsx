import { useMemo, useState } from 'react'
import { CultureMap } from '../components/CultureMap'
import { PINS } from '../data/retention'
import { formatCount } from '../lib/format'

export function CultureMapPage() {
  const [t, setT] = useState(100) // 0..100 = 시간 슬라이더
  const total = useMemo(() => PINS.reduce((s, p) => s + p.count, 0), [])
  const scaled = Math.round((total * t) / 100)

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <div className="text-coral-600 text-[11px] font-extrabold tracking-[0.3em]">
          K-CULTURE FLOW MAP
        </div>
        <h1 className="text-2xl font-black text-ink-700">문화 순환 지도</h1>
        <p className="mt-1 text-xs text-ink-300">
          유행이 어디로 흘러갔는지, 어떤 지역·전통과 만났는지 실시간으로.
        </p>
      </header>

      <div className="mb-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-ink-300">
            지난 30일 누적 참여
          </span>
          <span className="text-xl font-black text-coral-600">
            {formatCount(scaled)}명
          </span>
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
    </div>
  )
}
