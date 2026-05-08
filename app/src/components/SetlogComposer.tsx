import { useState } from 'react'
import { CHALLENGES } from '../data/trends'
import { useSetlog } from '../lib/social'
import { useToast } from './Toast'
import type { SetlogEntry } from '../types'

const MOODS: SetlogEntry['mood'][] = ['🔥', '💛', '🌿', '😴', '✨']
const PROMPTS = [
  '오늘 너의 set은?',
  '오늘 가장 “현실에서 살아남은” 유행은?',
  '오늘 가족이랑 같이 한 챌린지가 있다면?',
  '오늘 처음 본 유행 한 줄 평?',
  '오늘 다시 해본 챌린지가 있나요?',
]

export function SetlogComposer({ onClose }: { onClose?: () => void }) {
  const [, addEntry] = useSetlog()
  const toast = useToast()
  const [challengeId, setChallengeId] = useState<string>('')
  const [freeTag, setFreeTag] = useState('')
  const [mood, setMood] = useState<SetlogEntry['mood']>('🔥')
  const [note, setNote] = useState('')
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length]

  const submit = () => {
    if (!note.trim() && !challengeId && !freeTag.trim()) {
      toast.push('한 줄 메모나 챌린지/태그 중 하나는 필요해요')
      return
    }
    const ch = CHALLENGES.find((c) => c.id === challengeId)
    addEntry({
      date: new Date().toISOString().slice(0, 10),
      challenge_id: challengeId || undefined,
      free_tag: freeTag.trim() || undefined,
      mood,
      note: note.trim(),
      cover_gradient: ch?.cover_gradient,
      cover_emoji: ch?.emoji,
    })
    toast.push('오늘의 셋로그 저장 ✨')
    setChallengeId('')
    setFreeTag('')
    setNote('')
    onClose?.()
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
      <div>
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">TODAY · SET</div>
        <h2 className="mt-1 text-base font-bold text-ink-700">{prompt}</h2>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-ink-400">기분</label>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition ${
                mood === m ? 'bg-ink-700 ring-2 ring-coral-400' : 'bg-ink-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-ink-400">참여한 챌린지 (선택)</label>
        <select
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">선택 안 함</option>
          {CHALLENGES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-ink-400">자유 태그 (선택)</label>
        <input
          value={freeTag}
          onChange={(e) => setFreeTag(e.target.value)}
          placeholder="#두쫀쿠 #춘분 #한라봉 …"
          className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-ink-400">한 줄 메모</label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="엄마랑 처음 같이 만들어봤다. 손이 까매져도 즐거웠음."
          className="w-full resize-none rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <button
        onClick={submit}
        className="w-full rounded-2xl bg-coral-500 py-3 text-sm font-bold text-white shadow-card active:bg-coral-600"
      >
        오늘의 셋로그 저장
      </button>
    </div>
  )
}
