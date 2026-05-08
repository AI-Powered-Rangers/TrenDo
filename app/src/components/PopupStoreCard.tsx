import { useState } from 'react'
import {
  POPUP_CATEGORY_LABEL,
  POPUP_STATUS_LABEL,
  type PopupStore,
} from '../data/popupStores'
import { findChallenge } from '../data/trends'
import { useToast } from './Toast'

const HOT_TONE = (s: number) =>
  s >= 90
    ? 'from-coral-400 to-rose-600'
    : s >= 75
    ? 'from-amber-400 to-coral-500'
    : s >= 60
    ? 'from-indigo-400 to-fuchsia-500'
    : 'from-ink-400 to-ink-700'

interface Props {
  popup: PopupStore
  /** 헤더만 표시 후 클릭으로 펼침 (기본 true) */
  collapsible?: boolean
}

export function PopupStoreCard({ popup, collapsible = true }: Props) {
  const tiein = popup.trend_tiein ? findChallenge(popup.trend_tiein.challenge_id) : null
  const status = POPUP_STATUS_LABEL[popup.status]
  const toast = useToast()
  const [open, setOpen] = useState(!collapsible)

  const onExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!popup.external_link) return
    window.open(popup.external_link, '_blank', 'noopener,noreferrer')
    toast.push('외부 페이지 이동')
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`relative block w-full overflow-hidden bg-gradient-to-br ${popup.cover_gradient} p-3 text-left text-white cover-grain ${
          collapsible ? 'transition active:scale-[0.99]' : ''
        }`}
      >
        <div className="absolute inset-0 cover-shine" />
        <div className="relative flex items-center gap-3">
          <span className="text-2xl drop-shadow">{popup.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/85">
              <span>{popup.area_label}</span>
              <span>·</span>
              <span>{popup.when}</span>
            </div>
            <h3 className="mt-0.5 truncate text-sm font-black leading-tight">{popup.name}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${status.cls}`}>
            {status.label}
          </span>
          <span
            className={`shrink-0 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-br ${HOT_TONE(popup.hot_score)} px-1.5 py-0.5 text-[10px] font-black text-white shadow-card`}
          >
            🔥 {popup.hot_score}
          </span>
          {collapsible && (
            <span className={`text-white/70 transition ${open ? 'rotate-180' : ''}`}>⌄</span>
          )}
        </div>
      </button>

      {open && (
        <div className="space-y-2 p-4">
          <div className="text-[11px] text-ink-400">
            <span className="font-bold text-coral-600">{popup.brand}</span>
            <span className="mx-1.5 text-ink-200">·</span>
            <span>{popup.venue}</span>
          </div>
          <p className="break-keep text-[12px] leading-relaxed text-ink-500">{popup.desc}</p>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-ink-300">
            <span className="rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-400">
              {POPUP_CATEGORY_LABEL[popup.category]}
            </span>
            {popup.is_oprun && (
              <span className="rounded-full bg-coral-50 px-2 py-0.5 font-bold text-coral-600">
                ⏰ 오픈런
              </span>
            )}
            <span className="rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-400">
              {popup.hashtag}
            </span>
          </div>

          {tiein && popup.trend_tiein && (
            <div className="rounded-xl bg-coral-50 p-2.5 text-[11px] leading-relaxed text-coral-700">
              ↪ {tiein.emoji} {tiein.title} — {popup.trend_tiein.note}
            </div>
          )}

          {popup.external_link && (
            <button
              onClick={onExternal}
              className="mt-1 flex w-full items-center justify-between rounded-xl bg-ink-700 px-3 py-2.5 text-[12px] font-black text-white"
            >
              <span>📌 자세히 보기</span>
              <span className="text-[11px] text-coral-200">↗</span>
            </button>
          )}
        </div>
      )}
    </article>
  )
}
