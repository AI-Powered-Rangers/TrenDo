import type { RetentionRecord } from '../types'
import { formatPct, formatCount } from '../lib/format'

export function RetentionMeter({ rec }: { rec: RetentionRecord }) {
  const score = Math.max(0, Math.min(100, rec.retention_score))
  const dash = (score / 100) * 264
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24">
          <circle cx="50" cy="50" r="42" stroke="#F2F4FA" strokeWidth="10" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#FF5C2A"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} 999`}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="#172149">
            {score}
          </text>
        </svg>
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-semibold text-ink-300">문화 잔존율</div>
          <div className="text-base font-bold text-ink-700">현실에서 살아남은 정도</div>
          <div className="text-xs text-ink-300">
            누적 참여 {formatCount(rec.participants)}명
          </div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {[
          { k: '완료율', v: formatPct(rec.completion_rate) },
          { k: 'D+7 지속', v: formatPct(rec.day7_retention) },
          { k: 'D+30 지속', v: formatPct(rec.day30_retention) },
          { k: '취미化', v: formatPct(rec.became_hobby) },
          { k: '가족과', v: formatPct(rec.shared_with_family) },
        ].map((it) => (
          <div key={it.k} className="rounded-xl bg-ink-50 px-3 py-2">
            <dt className="text-[11px] text-ink-300">{it.k}</dt>
            <dd className="text-sm font-bold text-ink-700">{it.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
