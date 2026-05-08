import { useMemo, useState } from 'react'
import { CHALLENGES, findChallenge } from '../data/trends'
import { useJoined, useMyStories } from '../lib/social'
import { useToast } from './Toast'

interface Props {
  onClose: () => void
  presetChallengeId?: string
}

const MOODS: Array<'🔥' | '💛' | '🌿' | '😴' | '✨'> = ['🔥', '💛', '🌿', '😴', '✨']
const CAPTION_PROMPTS: Record<string, string[]> = {
  default: [
    '진짜 했어요 — 한 컷만 자랑할게요',
    '엄마랑 같이 처음 해봤어요',
    '단면 컷 보세요 ✨',
    '동네에서 처음 따라했을지도?',
  ],
}

export function BragSheet({ onClose, presetChallengeId }: Props) {
  const [, addStory] = useMyStories()
  const [joined] = useJoined()
  const toast = useToast()

  const joinedChallenges = useMemo(() => {
    const list = CHALLENGES.filter((c) => joined.has(c.id))
    return list.length ? list : CHALLENGES
  }, [joined])

  const [challengeId, setChallengeId] = useState<string>(
    presetChallengeId ?? joinedChallenges[0]?.id ?? CHALLENGES[0].id,
  )
  const [mood, setMood] = useState<typeof MOODS[number]>('🔥')
  const [caption, setCaption] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ch = findChallenge(challengeId)
  if (!ch) return null

  const submit = () => {
    const finalCaption = caption.trim() || CAPTION_PROMPTS.default[0]
    addStory({
      challenge_id: ch.id,
      cover_emoji: ch.emoji,
      cover_gradient: ch.cover_gradient,
      caption: finalCaption,
      mood,
    })
    setSubmitted(true)
    toast.push('내 스토리에 자랑 등록 ✨')
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
          <div
            className={`relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${ch.cover_gradient} text-7xl text-white shadow-card cover-grain`}
          >
            <div className="absolute inset-0 cover-shine" />
            <span className="relative float-breathe drop-shadow">{ch.emoji}</span>
          </div>
          <h3 className="mt-5 text-center text-xl font-black text-ink-700">
            자랑 완료 🎉
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-ink-400">
            오늘의 자랑샷 맨 앞에 추가됐어요. <br />
            친구들이 따라하면 알림으로 알려드릴게요.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-coral-50 p-3 text-center">
              <div className="text-[10px] font-bold text-coral-700">예상 반응</div>
              <div className="mt-0.5 text-base font-black text-coral-600">+38</div>
            </div>
            <div className="rounded-2xl bg-ink-50 p-3 text-center">
              <div className="text-[10px] font-bold text-ink-300">동네 첫 인증</div>
              <div className="mt-0.5 text-base font-black text-ink-700">📍 동네 1호</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-coral-500 py-3 text-sm font-black text-white shadow-card"
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
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-600">
              MY STORY
            </div>
            <h2 className="mt-1 text-lg font-black text-ink-700">자랑샷 한 컷 등록</h2>
          </div>
          <button onClick={onClose} className="text-base text-ink-300">
            ✕
          </button>
        </div>

        {/* preview */}
        <div
          className={`relative mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${ch.cover_gradient} text-white cover-grain`}
        >
          <div className="absolute inset-0 cover-shine" />
          <span className="relative text-7xl drop-shadow-lg float-breathe">{ch.emoji}</span>
          <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] backdrop-blur-sm">
            {mood} {ch.title}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] font-black text-ink-400">어떤 챌린지를 자랑할까요?</label>
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
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition ${
                    mood === m ? 'bg-ink-700 ring-2 ring-coral-400' : 'bg-ink-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-ink-400">한 줄 자랑</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={CAPTION_PROMPTS.default[0]}
              className="mt-1.5 w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {CAPTION_PROMPTS.default.map((p) => (
                <button
                  key={p}
                  onClick={() => setCaption(p)}
                  className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-bold text-ink-400"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-5 w-full rounded-2xl bg-coral-500 py-3 text-sm font-black text-white shadow-card active:bg-coral-600"
        >
          오늘의 자랑샷에 등록하기
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-300">
          내 기기에만 저장돼요. 공개 인증은 따로 선택할 수 있어요.
        </p>
      </div>
    </div>
  )
}
