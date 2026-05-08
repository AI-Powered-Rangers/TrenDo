import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findChallenge } from '../data/trends'
import { useLikedPosts, useStoriesSeen } from '../lib/social'
import { useToast } from './Toast'

export interface StoryItem {
  id: string
  author_name: string
  author_emoji: string
  cover_emoji: string
  cover_gradient: string
  caption: string
  challenge_id: string
  mood?: string
  mine?: boolean
}

interface Props {
  stories: StoryItem[]
  startIndex: number
  onClose: () => void
}

const STORY_MS = 6000

export function StoryViewer({ stories, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0) // re-trigger animation
  const [, toggleLike, hasLiked] = useLikedPosts()
  const [, markSeen] = useStoriesSeen()
  const toast = useToast()
  const navigate = useNavigate()

  const story = stories[index]
  const ch = story ? findChallenge(story.challenge_id) : null
  const liked = story ? hasLiked(story.id) : false

  useEffect(() => {
    if (story) markSeen(story.id)
  }, [story, markSeen])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => {
      setIndex((i) => (i + 1 < stories.length ? i + 1 : i))
      setTick((x) => x + 1)
    }, STORY_MS)
    return () => clearTimeout(t)
  }, [index, paused, stories.length, tick])

  if (!story) return null

  const goPrev = () => {
    if (index === 0) return
    setIndex((i) => i - 1)
    setTick((x) => x + 1)
  }
  const goNext = () => {
    if (index + 1 >= stories.length) {
      onClose()
      return
    }
    setIndex((i) => i + 1)
    setTick((x) => x + 1)
  }

  const onFollow = () => {
    onClose()
    navigate(`/c/${story.challenge_id}?from=${story.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <div
        className="relative h-full max-h-[820px] w-full max-w-md overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${story.cover_gradient} cover-grain`}
        />
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        {/* progress bars */}
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
          {stories.map((_, i) => (
            <div
              key={i}
              className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
            >
              {i < index && <div className="h-full w-full bg-white" />}
              {i === index && (
                <div
                  key={tick}
                  className="absolute inset-y-0 left-0 bg-white"
                  style={{
                    animation: `story-progress ${STORY_MS}ms linear forwards`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* author */}
        <div className="absolute inset-x-4 top-7 z-20 flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg backdrop-blur-sm">
            {story.author_emoji}
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-black">{story.author_name}</div>
            {ch && <div className="text-[10px] text-white/70">{ch.emoji} {ch.title}</div>}
          </div>
          {story.mood && <span className="text-lg">{story.mood}</span>}
          <button
            onClick={onClose}
            className="text-base text-white/80 hover:text-white"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* big cover emoji center */}
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-[180px] drop-shadow-2xl float-breathe">{story.cover_emoji}</div>
        </div>

        {/* caption */}
        <div className="pointer-events-none absolute inset-x-4 bottom-24 z-20 text-white">
          <p className="break-keep text-base font-bold leading-snug drop-shadow">
            {story.caption}
          </p>
        </div>

        {/* bottom CTAs */}
        <div className="absolute inset-x-4 bottom-5 z-20 flex items-center gap-2">
          <button
            onClick={() => {
              toggleLike(story.id)
              toast.push(liked ? '좋아요 취소' : '좋아요 ❤️')
            }}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl text-white backdrop-blur-sm"
            aria-label="좋아요"
          >
            {liked ? '❤️' : '🤍'}
          </button>
          <button
            onClick={onFollow}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-black text-ink-800 shadow-card"
          >
            <span>나도 따라하기</span>
            <span className="text-coral-500">→</span>
          </button>
        </div>

        {/* tap zones */}
        <button
          onClick={goPrev}
          className="absolute inset-y-0 left-0 z-10 w-[28%]"
          aria-label="이전"
        />
        <button
          onClick={goNext}
          className="absolute inset-y-0 right-0 z-10 w-[28%]"
          aria-label="다음"
        />
      </div>

      <style>{`@keyframes story-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  )
}
