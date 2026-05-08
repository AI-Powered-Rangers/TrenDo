import { useMemo, useRef, useState } from 'react'
import { CHALLENGES, findChallenge } from '../data/trends'
import { useJoined, useMyStories } from '../lib/social'
import { fileToCompressedDataURL } from '../lib/image'
import { useToast } from './Toast'

interface Props {
  onClose: () => void
  presetChallengeId?: string
}

const MOODS: Array<'🔥' | '💛' | '🌿' | '😴' | '✨'> = ['🔥', '💛', '🌿', '😴', '✨']

export function BragSheet({ onClose, presetChallengeId }: Props) {
  const [, addStory] = useMyStories()
  const [joined] = useJoined()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement | null>(null)

  const joinedChallenges = useMemo(() => {
    const list = CHALLENGES.filter((c) => joined.has(c.id))
    return list.length ? list : CHALLENGES
  }, [joined])

  const [challengeId, setChallengeId] = useState<string>(
    presetChallengeId ?? joinedChallenges[0]?.id ?? CHALLENGES[0].id,
  )
  const [mood, setMood] = useState<typeof MOODS[number]>('🔥')
  const [caption, setCaption] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const ch = findChallenge(challengeId)
  if (!ch) return null

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await fileToCompressedDataURL(file)
      setImageDataUrl(compressed)
    } catch (err: any) {
      toast.push(err?.message ?? '이미지 첨부 실패')
    } finally {
      e.target.value = ''
    }
  }

  const submit = () => {
    if (!caption.trim() && !imageDataUrl) {
      toast.push('한 줄 메모나 사진 중 하나는 필요해요')
      return
    }
    addStory({
      challenge_id: ch.id,
      cover_emoji: ch.emoji,
      cover_gradient: ch.cover_gradient,
      caption: caption.trim() || `${ch.emoji} ${ch.title}`,
      mood,
      image_data_url: imageDataUrl ?? undefined,
    })
    setSubmitted(true)
    toast.push('스토리 업로드 완료')
  }

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="reveal w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-card"
          onClick={(e) => e.stopPropagation()}
        >
          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt=""
              className="mx-auto h-32 w-32 rounded-3xl object-cover shadow-card"
            />
          ) : (
            <div
              className={`mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br ${ch.cover_gradient} text-7xl text-white shadow-card`}
            >
              {ch.emoji}
            </div>
          )}
          <h3 className="mt-4 text-center text-lg font-black text-ink-700">업로드 완료</h3>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-coral-500 py-3 text-sm font-black text-white"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="reveal w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-black text-ink-700">스토리 업로드</h2>
          <button onClick={onClose} className="text-base text-ink-300" aria-label="닫기">
            ✕
          </button>
        </div>

        {/* preview */}
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-ink-50">
          {imageDataUrl ? (
            <>
              <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setImageDataUrl(null)}
                className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
              >
                삭제
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInput.current?.click()}
              className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${ch.cover_gradient} text-white`}
            >
              <div className="absolute inset-0 cover-shine" />
              <div className="relative flex flex-col items-center gap-1">
                <span className="text-5xl drop-shadow">{ch.emoji}</span>
                <span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
                  📷 사진 첨부
                </span>
              </div>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] font-black text-ink-400">챌린지</label>
            <div className="mt-1.5 flex gap-2 overflow-x-auto scrollbar-none">
              {(joinedChallenges.length ? joinedChallenges : CHALLENGES).map((c) => {
                const active = c.id === challengeId
                return (
                  <button
                    key={c.id}
                    onClick={() => setChallengeId(c.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                      active
                        ? 'border-coral-500 bg-coral-500 text-white'
                        : 'border-ink-100 bg-white text-ink-500'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-ink-400">기분</label>
            <div className="mt-1.5 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
                    mood === m ? 'bg-ink-700 ring-2 ring-coral-400' : 'bg-ink-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-ink-400">한 줄</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="한 줄로 자랑해보세요"
              className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-5 w-full rounded-2xl bg-coral-500 py-3 text-sm font-black text-white"
        >
          업로드
        </button>
      </div>
    </div>
  )
}
