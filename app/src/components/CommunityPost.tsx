import { Link } from 'react-router-dom'
import type { CommunityPost as Post } from '../types'
import { findChallenge } from '../data/trends'
import { findRegion } from '../data/regions'
import { useLikedPosts, shareLink } from '../lib/social'
import { useToast } from './Toast'

const genLabel: Record<string, string> = {
  teen: '10~20대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
}

function formatAgo(min: number) {
  if (min < 60) return `${min}분 전`
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`
  return `${Math.floor(min / 60 / 24)}일 전`
}

export function CommunityPostCard({ post }: { post: Post }) {
  const ch = findChallenge(post.challenge_id)
  const region = findRegion(post.region)
  const [, toggleLike, hasLiked] = useLikedPosts()
  const liked = hasLiked(post.id)
  const likes = post.base_likes + (liked ? 1 : 0)
  const toast = useToast()

  const onShare = async () => {
    const url = `${window.location.origin}/c/${post.challenge_id}?from=${post.id}`
    const mode = await shareLink(url, `${post.author_name} · ${post.caption}`)
    toast.push(mode === 'native' ? '공유 시트 열림' : '링크가 복사됐어요')
  }

  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-card transition active:scale-[0.995]">
      <div
        className={`relative aspect-[16/12] overflow-hidden bg-gradient-to-br ${post.cover_gradient} flex items-end p-4 text-white cover-grain`}
      >
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/35 blur-3xl" />
        {post.is_top && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-coral-600 shadow">
            🔥 TOP
          </span>
        )}
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] backdrop-blur-sm">
          {region.label} · {genLabel[post.generation]}
        </span>
        <div className="relative z-10 text-6xl drop-shadow-lg float-breathe">{post.cover_emoji}</div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-base">
            {post.author_emoji}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-ink-700">{post.author_name}</div>
            <div className="text-[10px] text-ink-300">
              {ch ? `${ch.emoji} ${ch.title}` : ''} · {formatAgo(post.created_minutes_ago)}
            </div>
          </div>
          {ch && (
            <Link
              to={`/c/${ch.id}`}
              className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600"
            >
              따라하기
            </Link>
          )}
        </div>

        <p className="text-sm leading-relaxed text-ink-500">{post.caption}</p>

        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => {
              toggleLike(post.id)
              toast.push(liked ? '좋아요 취소' : '좋아요 ❤️')
            }}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              liked ? 'bg-coral-50 text-coral-600' : 'bg-ink-50 text-ink-400'
            }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likes.toLocaleString()}</span>
          </button>
          <button className="flex items-center gap-1 rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-400">
            <span>💬</span>
            <span>{post.base_comments}</span>
          </button>
          <button
            onClick={onShare}
            className="ml-auto rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-400"
          >
            📤 공유
          </button>
        </div>
      </div>
    </article>
  )
}
