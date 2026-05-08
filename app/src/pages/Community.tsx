import { useMemo, useState } from 'react'
import { COMMUNITY_POSTS } from '../data/community'
import { CommunityPostCard } from '../components/CommunityPost'
import { UserTrendCard } from '../components/UserTrendCard'
import { TrendComposer } from '../components/TrendComposer'
import { USER_TRENDS_SEED, PROMOTE_THRESHOLD } from '../data/userTrends'
import { useUserTrends, useLikedUserTrends } from '../lib/social'
import type { Generation } from '../types'

const GEN_FILTERS: Array<{ id: 'all' | Generation; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'teen', label: '10~20대' },
  { id: 'adult', label: '30·40대' },
  { id: 'senior', label: '50·60대' },
  { id: 'family', label: '온 가족' },
]

type TopTab = 'cert' | 'new'
type SortTab = 'hot' | 'new'

export function Community() {
  const [topTab, setTopTab] = useState<TopTab>('cert')
  const [sort, setSort] = useState<SortTab>('hot')
  const [filter, setFilter] = useState<'all' | Generation>('all')
  const [showComposer, setShowComposer] = useState(false)
  const [myTrends] = useUserTrends()
  const [likedTrends] = useLikedUserTrends()

  const certList = useMemo(() => {
    let posts = [...COMMUNITY_POSTS]
    if (filter !== 'all') posts = posts.filter((p) => p.generation === filter)
    if (sort === 'hot') posts.sort((a, b) => b.base_likes - a.base_likes)
    else posts.sort((a, b) => a.created_minutes_ago - b.created_minutes_ago)
    return posts
  }, [filter, sort])

  const trendList = useMemo(() => {
    const all = [...myTrends, ...USER_TRENDS_SEED]
    const decorated = all.map((t) => ({
      trend: t,
      effective_likes: t.base_likes + (likedTrends.has(t.id) ? 1 : 0),
    }))
    if (sort === 'hot') decorated.sort((a, b) => b.effective_likes - a.effective_likes)
    else decorated.sort((a, b) => a.trend.created_minutes_ago - b.trend.created_minutes_ago)
    return decorated
  }, [myTrends, likedTrends, sort])

  const promotedCount = trendList.filter((t) => t.effective_likes >= PROMOTE_THRESHOLD).length

  return (
    <div className="px-4 pt-6">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">
            COMMUNITY
          </div>
          <h1 className="text-2xl font-black text-ink-700">커뮤니티</h1>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="rounded-full bg-coral-500 px-3 py-1.5 text-[11px] font-black text-white shadow-card"
        >
          + 트렌드 올리기
        </button>
      </header>

      {/* top tabs */}
      <div className="mb-3 flex gap-1.5 rounded-full bg-white p-1 shadow-card">
        <button
          onClick={() => setTopTab('cert')}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${
            topTab === 'cert' ? 'bg-ink-700 text-white' : 'text-ink-400'
          }`}
        >
          📸 인증샷
        </button>
        <button
          onClick={() => setTopTab('new')}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${
            topTab === 'new' ? 'bg-ink-700 text-white' : 'text-ink-400'
          }`}
        >
          🚀 새 트렌드
          {promotedCount > 0 && (
            <span className="ml-1 rounded-full bg-coral-500 px-1.5 py-0.5 text-[9px] font-black text-white">
              {promotedCount}
            </span>
          )}
        </button>
      </div>

      {/* sort */}
      <div className="mb-3 flex gap-1.5 rounded-full bg-ink-50 p-1">
        {(['hot', 'new'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`flex-1 rounded-full px-3 py-1 text-[11px] font-bold ${
              sort === s ? 'bg-white text-ink-700 shadow-card' : 'text-ink-400'
            }`}
          >
            {s === 'hot' ? '🔥 인기' : '🆕 최신'}
          </button>
        ))}
      </div>

      {/* generation filter (only for cert tab) */}
      {topTab === 'cert' && (
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {GEN_FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border-coral-500 bg-coral-500 text-white'
                    : 'border-ink-100 bg-white text-ink-400'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {topTab === 'cert' ? (
        <div className="space-y-4">
          {certList.map((p) => (
            <CommunityPostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <>
          {promotedCount > 0 && (
            <p className="mb-3 px-1 text-[11px] font-bold text-coral-600">
              🔥 좋아요 {PROMOTE_THRESHOLD}+ 받은 트렌드는 위로 떠올라요
            </p>
          )}
          <div className="space-y-4">
            {trendList.map((entry) => (
              <UserTrendCard key={entry.trend.id} trend={entry.trend} />
            ))}
          </div>
        </>
      )}

      {showComposer && <TrendComposer onClose={() => setShowComposer(false)} />}
    </div>
  )
}
