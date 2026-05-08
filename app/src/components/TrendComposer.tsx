import { useRef, useState } from 'react'
import { useUserTrends } from '../lib/social'
import { fileToCompressedDataURL } from '../lib/image'
import { useToast } from './Toast'
import {
  USER_TREND_CATEGORY_LABEL,
  type UserTrendCategory,
} from '../data/userTrends'

interface Props {
  onClose: () => void
}

const CATEGORIES: Array<{ id: UserTrendCategory; emoji: string }> = [
  { id: 'food', emoji: '🍳' },
  { id: 'restaurant', emoji: '🍽' },
  { id: 'challenge', emoji: '🎬' },
  { id: 'media', emoji: '📺' },
  { id: 'other', emoji: '✨' },
]

const GRADIENTS = [
  'from-coral-300 via-coral-400 to-coral-600',
  'from-violet-300 via-purple-400 to-coral-500',
  'from-emerald-300 via-teal-400 to-sky-500',
  'from-amber-300 via-rose-400 to-fuchsia-600',
  'from-cyan-300 via-sky-400 to-indigo-500',
  'from-rose-500 via-coral-500 to-amber-400',
]

const EMOJI_PRESETS = ['🍆', '🥛', '🌶', '🍞', '🙃', '🤖', '📺', '🔥', '🍜', '🍰', '🍓', '🥢']

export function TrendComposer({ onClose }: Props) {
  const [, addTrend] = useUserTrends()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState<UserTrendCategory>('food')
  const [emoji, setEmoji] = useState('🍆')
  const [gradientIdx, setGradientIdx] = useState(0)
  const [hashtag, setHashtag] = useState('')
  const [regionLabel, setRegionLabel] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

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
    if (!title.trim()) {
      toast.push('제목을 적어주세요')
      return
    }
    if (!desc.trim()) {
      toast.push('한 줄 소개를 적어주세요')
      return
    }
    addTrend({
      title: title.trim(),
      desc: desc.trim(),
      category,
      emoji,
      cover_gradient: GRADIENTS[gradientIdx],
      hashtag: hashtag.trim() || undefined,
      region_label: regionLabel.trim() || undefined,
      image_data_url: imageDataUrl ?? undefined,
    })
    toast.push('새 트렌드 등록됨 🚀')
    onClose()
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
          <h2 className="text-lg font-black text-ink-700">새 트렌드 올리기</h2>
          <button onClick={onClose} className="text-base text-ink-300" aria-label="닫기">
            ✕
          </button>
        </div>

        {/* preview */}
        <div
          className={`relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[gradientIdx]} text-white cover-grain`}
        >
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 cover-shine" />
          )}
          <button
            onClick={() => fileInput.current?.click()}
            className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
          >
            📷 사진
          </button>
          {imageDataUrl && (
            <button
              onClick={() => setImageDataUrl(null)}
              className="absolute right-3 bottom-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
            >
              사진 제거
            </button>
          )}
          {!imageDataUrl && (
            <div className="relative flex h-full items-center justify-center">
              <span className="text-7xl drop-shadow">{emoji}</span>
            </div>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />

        {/* form */}
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="트렌드 제목"
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm font-bold"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="이게 왜 뜨는지 한 줄로 — 어디서 봤고, 뭐가 매력인지"
            rows={3}
            className="w-full resize-none rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
          />

          <div>
            <div className="mb-1.5 text-[11px] font-black text-ink-400">카테고리</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-bold ${
                      active
                        ? 'border-coral-500 bg-coral-500 text-white'
                        : 'border-ink-100 bg-white text-ink-500'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{USER_TREND_CATEGORY_LABEL[c.id]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-black text-ink-400">이모지</div>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_PRESETS.map((e) => {
                const active = e === emoji
                return (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                      active ? 'bg-ink-700 ring-2 ring-coral-400' : 'bg-ink-50'
                    }`}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-black text-ink-400">컬러</div>
            <div className="flex gap-1.5">
              {GRADIENTS.map((g, i) => (
                <button
                  key={g}
                  onClick={() => setGradientIdx(i)}
                  className={`h-8 flex-1 rounded-lg bg-gradient-to-br ${g} transition ${
                    gradientIdx === i ? 'ring-2 ring-ink-700 scale-105' : 'opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <input
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="#해시태그 (선택)"
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
          />

          <input
            value={regionLabel}
            onChange={(e) => setRegionLabel(e.target.value)}
            placeholder="지역 (예: 서울 망원, 대구 동성로)"
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm"
          />
        </div>

        <button
          onClick={submit}
          className="mt-5 w-full rounded-2xl bg-coral-500 py-3 text-sm font-black text-white"
        >
          올리기
        </button>
      </div>
    </div>
  )
}
