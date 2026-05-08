import { Link } from 'react-router-dom'
import { TRENDS } from '../data/trends'
import { TrendCard } from '../components/TrendCard'
import { useSaved } from '../lib/social'

export function SavedPage() {
  const [saved] = useSaved()
  const list = TRENDS.filter((t) => saved.has(t.challenge_id))

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <div className="text-coral-600 text-[11px] font-extrabold tracking-[0.3em]">SAVED</div>
        <h1 className="text-2xl font-black text-ink-700">내가 저장한 챌린지</h1>
        <p className="mt-1 text-xs text-ink-300">언제든 다시 꺼내 가족과 함께 만들어 보세요.</p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
          저장한 챌린지가 없어요. {' '}
          <Link to="/" className="font-bold text-coral-500">
            피드로 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((t) => (
            <TrendCard key={t.id} trend={t} />
          ))}
        </div>
      )}
    </div>
  )
}
