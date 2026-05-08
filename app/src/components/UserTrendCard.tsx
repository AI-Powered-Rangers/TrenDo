import {
  PROMOTE_THRESHOLD,
  USER_TREND_CATEGORY_LABEL,
  type UserTrend,
} from '../data/userTrends'
import { useLikedUserTrends, shareLink } from '../lib/social'
import { useToast } from './Toast'

function formatAgo(min: number) {
  if (min === 0) return '방금'
  if (min < 60) return `${min}분 전`
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`
  return `${Math.floor(min / 60 / 24)}일 전`
}

export function UserTrendCard({ trend }: { trend: UserTrend }) {
  const [, toggleLike, hasLiked] = useLikedUserTrends()
  const liked = hasLiked(trend.id)
  const likes = trend.base_likes + (liked ? 1 : 0)
  const promoted = likes >= PROMOTE_THRESHOLD
  const toast = useToast()

  const onShare = async () => {
    const url = `${window.location.origin}/community?trend=${trend.id}`
    const mode = await shareLink(url, trend.title)
    toast.push(mode === 'native' ? '공유' : '링크 복사됨')
  }

  return (
    <article className="overflow-hidden rounded-[20px] bg-white shadow-card">
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${trend.cover_gradient} cover-grain`}
      >
        {trend.image_data_url ? (
          <img
            src={trend.image_data_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 cover-shine" />
            <div className="relative flex h-full items-center justify-center">
              <span className="text-6xl drop-shadow">{trend.emoji}</span>
            </div>
          </>
        )}

        {promoted && (
          <span className="absolute left-3 top-3 rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-black text-white shadow-card">
            🔥 떠오르는 트렌드
          </span>
        )}
        {trend.source === 'mine' && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black text-coral-600 shadow">
            내 트렌드
          </span>
        )}
        <span className="absolute left-3 bottom-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          {USER_TREND_CATEGORY_LABEL[trend.category]}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="break-keep text-[15px] font-black text-ink-700">{trend.title}</h3>
        <p className="break-keep text-[12px] leading-relaxed text-ink-500">{trend.desc}</p>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-ink-300">
          <span className="font-bold text-ink-500">{trend.author_emoji} {trend.author_name}</span>
          <span>·</span>
          <span>{formatAgo(trend.created_minutes_ago)}</span>
          {trend.region_label && (
            <>
              <span>·</span>
              <span>📍 {trend.region_label}</span>
            </>
          )}
          {trend.hashtag && (
            <span className="rounded-full bg-coral-50 px-2 py-0.5 font-bold text-coral-600">
              {trend.hashtag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => {
              toggleLike(trend.id)
              toast.push(liked ? '좋아요 취소' : '❤️')
            }}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-black transition ${
              liked ? 'bg-coral-500 text-white' : 'bg-ink-50 text-ink-500'
            }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likes.toLocaleString()}</span>
          </button>
          <button className="flex items-center gap-1 rounded-full bg-ink-50 px-3 py-1.5 text-[11px] font-bold text-ink-400">
            💬 {trend.base_comments}
          </button>
          <button
            onClick={onShare}
            className="ml-auto rounded-full bg-ink-50 px-3 py-1.5 text-[11px] font-bold text-ink-400"
          >
            📤
          </button>
        </div>
      </div>
    </article>
  )
}
