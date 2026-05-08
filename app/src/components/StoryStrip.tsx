import { useMemo, useState } from 'react'
import { COMMUNITY_POSTS } from '../data/community'
import { useMyStories, useStoriesSeen } from '../lib/social'
import { findChallenge } from '../data/trends'
import { StoryViewer, type StoryItem } from './StoryViewer'
import { BragSheet } from './BragSheet'

export function StoryStrip() {
  const [myStories] = useMyStories()
  const [seen] = useStoriesSeen()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showBrag, setShowBrag] = useState(false)

  const items: StoryItem[] = useMemo(() => {
    const mine: StoryItem[] = myStories.map((s) => ({
      id: s.id,
      author_name: '나',
      author_emoji: '😀',
      cover_emoji: s.cover_emoji,
      cover_gradient: s.cover_gradient,
      caption: s.caption,
      challenge_id: s.challenge_id,
      mood: s.mood,
      mine: true,
      image_data_url: s.image_data_url,
    }))
    const others: StoryItem[] = COMMUNITY_POSTS.map((p) => ({
      id: p.id,
      author_name: p.author_name,
      author_emoji: p.author_emoji,
      cover_emoji: p.cover_emoji,
      cover_gradient: p.cover_gradient,
      caption: p.caption,
      challenge_id: p.challenge_id,
    }))
    return [...mine, ...others]
  }, [myStories])

  const open = (idx: number) => setOpenIndex(idx)

  return (
    <section className="rounded-[24px] bg-white shadow-card">
      <div className="flex items-baseline justify-between px-4 pt-3">
        <div className="text-sm font-black text-ink-700">오늘의 자랑샷</div>
        <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral-600">
          {items.length}개
        </span>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-4 py-3 scrollbar-none">
        <button
          onClick={() => setShowBrag(true)}
          className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
        >
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 ring-2 ring-dashed ring-coral-300 transition group-active:scale-95">
            <span className="text-2xl">＋</span>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[11px] font-black text-white shadow-card">
              !
            </span>
          </span>
          <span className="text-[10px] font-black text-ink-700">내 인증</span>
        </button>

        {items.map((s, idx) => {
          const isSeen = seen.has(s.id) && !s.mine
          const ringCls = s.mine
            ? 'ring-2 ring-coral-500'
            : isSeen
            ? 'ring-2 ring-ink-100'
            : 'p-[2px] bg-gradient-to-tr from-coral-500 via-rose-400 to-amber-400'
          const ch = findChallenge(s.challenge_id)
          return (
            <button
              key={s.id}
              onClick={() => open(idx)}
              className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${ringCls} transition group-active:scale-95`}>
                {s.image_data_url ? (
                  <img
                    src={s.image_data_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover shadow-card"
                  />
                ) : (
                  <span
                    className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${s.cover_gradient} text-2xl text-white shadow-card`}
                  >
                    {s.cover_emoji}
                  </span>
                )}
                {s.mine && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[10px] font-black text-white">
                    ★
                  </span>
                )}
              </span>
              <span className="line-clamp-1 max-w-[64px] text-[10px] font-bold text-ink-600">
                {s.author_name}
              </span>
              {ch && (
                <span className="line-clamp-1 max-w-[64px] text-[9px] text-ink-300">
                  {ch.emoji}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setShowBrag(true)}
        className="flex w-full items-center justify-center gap-2 border-t border-ink-50 bg-coral-50 px-4 py-2.5 text-[12px] font-black text-coral-700"
      >
        📷 사진 한 장 올리기
      </button>

      {openIndex !== null && (
        <StoryViewer
          stories={items}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}

      {showBrag && <BragSheet onClose={() => setShowBrag(false)} />}
    </section>
  )
}
