import { Link } from 'react-router-dom'
import type { SetlogEntry as Entry } from '../types'
import { findChallenge } from '../data/trends'
import { useSetlog } from '../lib/social'
import { useToast } from './Toast'

export function SetlogEntryCard({ entry }: { entry: Entry }) {
  const ch = entry.challenge_id ? findChallenge(entry.challenge_id) : null
  const [, , removeEntry] = useSetlog()
  const toast = useToast()
  const cover = entry.cover_gradient ?? 'from-coral-200 via-coral-300 to-coral-500'
  const emoji = entry.cover_emoji ?? '✨'

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div
        className={`relative flex aspect-[16/8] items-center justify-between bg-gradient-to-br ${cover} px-4 text-white`}
      >
        <div>
          <div className="text-[11px] opacity-80">{entry.date}</div>
          <div className="text-2xl font-black">{entry.mood}</div>
        </div>
        <div className="text-5xl drop-shadow-md">{emoji}</div>
      </div>
      <div className="space-y-2 p-4">
        {ch ? (
          <Link to={`/c/${ch.id}`} className="text-sm font-bold text-coral-600">
            {ch.emoji} {ch.title}
          </Link>
        ) : entry.free_tag ? (
          <div className="text-sm font-bold text-ink-700">{entry.free_tag}</div>
        ) : null}
        {entry.note && <p className="text-sm leading-relaxed text-ink-500">{entry.note}</p>}
        <button
          onClick={() => {
            removeEntry(entry.id)
            toast.push('셋로그 삭제됨')
          }}
          className="text-[11px] font-semibold text-ink-300 hover:text-coral-500"
        >
          삭제
        </button>
      </div>
    </article>
  )
}
