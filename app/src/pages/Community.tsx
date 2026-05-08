import { useMemo, useState } from 'react'
import { COMMUNITY_POSTS } from '../data/community'
import { CommunityPostCard } from '../components/CommunityPost'
import type { Generation } from '../types'

const FILTERS: Array<{ id: 'all' | Generation; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'teen', label: '10대' },
  { id: 'adult', label: '30·40대' },
  { id: 'senior', label: '50·60대' },
  { id: 'family', label: '온 가족' },
]

export function Community() {
  const [filter, setFilter] = useState<'all' | Generation>('all')
  const [tab, setTab] = useState<'hot' | 'new'>('hot')

  const list = useMemo(() => {
    let posts = [...COMMUNITY_POSTS]
    if (filter !== 'all') posts = posts.filter((p) => p.generation === filter)
    if (tab === 'hot') posts.sort((a, b) => b.base_likes - a.base_likes)
    else posts.sort((a, b) => a.created_minutes_ago - b.created_minutes_ago)
    return posts
  }, [filter, tab])

  return (
    <div className="px-4 pt-6">
      <header className="mb-3">
        <div className="text-coral-600 text-[11px] font-extrabold tracking-[0.3em]">COMMUNITY</div>
        <h1 className="text-2xl font-black text-ink-700">함께 만든 챌린지</h1>
        <p className="mt-1 text-xs text-ink-300">
          숏폼 한 번 보고 끝나지 않게. 다른 가족·세대가 어떻게 한국식으로 다시 만들었는지.
        </p>
      </header>

      <div className="mb-3 flex gap-1.5 rounded-full bg-white p-1 shadow-card">
        {(['hot', 'new'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              tab === t ? 'bg-ink-700 text-white' : 'text-ink-300'
            }`}
          >
            {t === 'hot' ? '🔥 인기' : '🆕 최신'}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => {
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

      <div className="space-y-4">
        {list.map((p) => (
          <CommunityPostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  )
}
