import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PROMOTE_THRESHOLD, USER_TRENDS_SEED } from '../data/userTrends'
import { useLikedUserTrends, useUserTrends } from '../lib/social'

export function EmergingTrendStrip() {
  const [myTrends] = useUserTrends()
  const [likedTrends] = useLikedUserTrends()

  const top = useMemo(() => {
    const all = [...myTrends, ...USER_TRENDS_SEED]
    return all
      .map((t) => ({
        trend: t,
        effective_likes: t.base_likes + (likedTrends.has(t.id) ? 1 : 0),
      }))
      .sort((a, b) => b.effective_likes - a.effective_likes)
      .slice(0, 5)
  }, [myTrends, likedTrends])

  if (top.length === 0) return null

  return (
    <section className="rounded-[20px] bg-white shadow-card">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="text-sm font-black text-ink-700">🚀 떠오르는 트렌드</div>
        <Link to="/community" className="text-[11px] font-bold text-coral-600">
          전체 →
        </Link>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {top.map(({ trend, effective_likes }) => {
          const promoted = effective_likes >= PROMOTE_THRESHOLD
          return (
            <Link
              key={trend.id}
              to="/community"
              className="w-[160px] shrink-0 overflow-hidden rounded-2xl border border-ink-100 bg-white"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${trend.cover_gradient}`}
              >
                {trend.image_data_url ? (
                  <img
                    src={trend.image_data_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative flex h-full items-center justify-center text-4xl drop-shadow">
                    {trend.emoji}
                  </div>
                )}
                {promoted && (
                  <span className="absolute left-2 top-2 rounded-full bg-coral-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
                    🔥
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <div className="line-clamp-1 text-[12px] font-black text-ink-700">
                  {trend.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-300">
                  <span>❤️ {effective_likes.toLocaleString()}</span>
                  <span>·</span>
                  <span className="line-clamp-1">{trend.author_name}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
