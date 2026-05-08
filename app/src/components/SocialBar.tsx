import { useToast } from './Toast'
import { useSaved, useLikedChallenges, shareLink, useJoined } from '../lib/social'

interface Props {
  challengeId: string
  title: string
}

export function SocialBar({ challengeId, title }: Props) {
  const [, toggleSaved, hasSaved] = useSaved()
  const [, toggleLike, hasLiked] = useLikedChallenges()
  const [, toggleJoined, hasJoined] = useJoined()
  const toast = useToast()

  const saved = hasSaved(challengeId)
  const liked = hasLiked(challengeId)
  const joined = hasJoined(challengeId)

  const onShare = async () => {
    const url =
      typeof window !== 'undefined' ? `${window.location.origin}/c/${challengeId}` : ''
    const mode = await shareLink(url, `TrenDo · ${title}`)
    toast.push(mode === 'native' ? '공유 시트 열림' : '링크가 클립보드에 복사됐어요')
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <button
        onClick={() => {
          toggleJoined(challengeId)
          toast.push(joined ? '참여 취소' : '오늘 챌린지에 참여했어요!')
        }}
        className={`flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-black transition ${
          joined ? 'bg-coral-500 text-white' : 'bg-white text-ink-400 shadow-card'
        }`}
      >
        <span className="text-lg">{joined ? '✅' : '🙋'}</span>
        <span>{joined ? '참여중' : '참여'}</span>
      </button>
      <button
        onClick={() => {
          toggleLike(challengeId)
          toast.push(liked ? '좋아요 취소' : '좋아요 ❤️')
        }}
        className={`flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-black transition ${
          liked ? 'bg-coral-50 text-coral-600 ring-1 ring-coral-200' : 'bg-white text-ink-400 shadow-card'
        }`}
      >
        <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
        <span>좋아요</span>
      </button>
      <button
        onClick={() => {
          toggleSaved(challengeId)
          toast.push(saved ? '저장 해제' : '내 피드에 저장됨')
        }}
        className={`flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-black transition ${
          saved ? 'bg-ink-700 text-white' : 'bg-white text-ink-400 shadow-card'
        }`}
      >
        <span className="text-lg">{saved ? '🔖' : '📑'}</span>
        <span>저장</span>
      </button>
      <button
        onClick={onShare}
        className="flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl bg-white py-2.5 text-[11px] font-black text-ink-400 shadow-card"
      >
        <span className="text-lg">📤</span>
        <span>공유</span>
      </button>
    </div>
  )
}
