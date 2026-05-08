import { Link } from 'react-router-dom'
import { COMMUNITY_POSTS } from '../data/community'
import { findChallenge } from '../data/trends'

export function CommunityStrip({ challengeId }: { challengeId?: string }) {
  const items = challengeId
    ? COMMUNITY_POSTS.filter((p) => p.challenge_id === challengeId)
    : COMMUNITY_POSTS.filter((p) => p.is_top)

  if (items.length === 0) return null

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-sm font-bold text-ink-700">
          {challengeId ? '이 챌린지의 커뮤니티' : '오늘 인기 인증'}
        </h2>
        <Link to="/community" className="text-[11px] font-bold text-coral-600">
          전체 보기 →
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto scrollbar-none px-4">
        {items.map((p) => {
          const ch = findChallenge(p.challenge_id)
          return (
            <Link
              key={p.id}
              to={`/c/${p.challenge_id}?from=${p.id}`}
              className="w-[180px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-card"
            >
              <div
                className={`relative flex aspect-[4/5] items-end bg-gradient-to-br ${p.cover_gradient} p-3 text-white`}
              >
                <span className="absolute right-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px]">
                  ❤️ {p.base_likes}
                </span>
                <div className="text-3xl drop-shadow-md">{p.cover_emoji}</div>
              </div>
              <div className="space-y-0.5 p-3">
                <div className="text-[11px] font-bold text-ink-700">{p.author_name}</div>
                <div className="line-clamp-2 text-[11px] text-ink-400">{p.caption}</div>
                {ch && (
                  <div className="pt-1 text-[10px] font-bold text-coral-600">
                    {ch.emoji} {ch.title}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
