import { Link } from 'react-router-dom'
import { RETENTION } from '../data/retention'
import { findChallenge } from '../data/trends'
import { RetentionMeter } from '../components/RetentionMeter'

export function RetentionPage() {
  const sorted = [...RETENTION].sort((a, b) => b.retention_score - a.retention_score)

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <div className="text-coral-600 text-[11px] font-extrabold tracking-[0.3em]">
          CULTURAL RETENTION
        </div>
        <h1 className="text-2xl font-black text-ink-700">문화 잔존율</h1>
        <p className="mt-1 text-xs text-ink-300">
          조회수 대신 “현실에서 얼마나 살아남았나”를 측정합니다.
        </p>
      </header>

      <div className="space-y-4">
        {sorted.map((rec) => {
          const ch = findChallenge(rec.challenge_id)
          if (!ch) return null
          return (
            <Link
              key={rec.challenge_id}
              to={`/c/${rec.challenge_id}`}
              className="block space-y-2"
            >
              <div className="flex items-center gap-2 px-1 text-sm font-bold text-ink-700">
                <span>{ch.emoji}</span>
                <span>{ch.title}</span>
                <span className="ml-auto text-xs font-normal text-ink-300">자세히 →</span>
              </div>
              <RetentionMeter rec={rec} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
