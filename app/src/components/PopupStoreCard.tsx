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

export function PopupStoreCard({ popup }: { popup: PopupStore }) {
  const tiein = popup.trend_tiein ? findChallenge(popup.trend_tiein.challenge_id) : null
  const status = POPUP_STATUS_LABEL[popup.status]
  const toast = useToast()

  const onExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!popup.external_link) return
    window.open(popup.external_link, '_blank', 'noopener,noreferrer')
    toast.push('팝업 정보 페이지로 이동')
  }

  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-card">
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${popup.cover_gradient} cover-grain`}
      >
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-3xl" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${status.cls}`}>
            {status.label}
          </span>
          {popup.is_oprun && (
            <span className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              ⏰ 오픈런
            </span>
          )}
          <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-ink-700">
            {POPUP_CATEGORY_LABEL[popup.category]}
          </span>
        </div>

        <div
          className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-br ${HOT_TONE(popup.hot_score)} px-2 py-0.5 text-[10px] font-black text-white shadow-card`}
        >
          <span>🔥</span>
          <span>{popup.hot_score}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="text-6xl drop-shadow-lg float-breathe">{popup.emoji}</div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="break-keep text-[15px] font-black text-ink-700">{popup.name}</h3>
          <span className="shrink-0 text-[10px] font-bold text-ink-300">{popup.area_label}</span>
        </div>
        <div className="text-[11px] text-ink-400">
          <span className="font-bold text-coral-600">{popup.brand}</span>
          <span className="mx-1.5 text-ink-200">·</span>
          <span>{popup.venue}</span>
        </div>
        <p className="break-keep text-[12px] leading-relaxed text-ink-500">{popup.desc}</p>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-ink-300">
          <span className="rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-400">
            🗓 {popup.when}
          </span>
          <span className="rounded-full bg-coral-50 px-2 py-0.5 font-bold text-coral-600">
            {popup.hashtag}
          </span>
        </div>

        {tiein && popup.trend_tiein && (
          <div className="rounded-xl bg-coral-50 p-2.5 text-[11px] leading-relaxed text-coral-700">
            <span className="font-black">↪ TrenDo 트렌드 결합 · </span>
            {tiein.emoji} {tiein.title} — {popup.trend_tiein.note}
          </div>
        )}

        {popup.external_link && (
          <button
            onClick={onExternal}
            className="mt-1 flex w-full items-center justify-between rounded-xl bg-ink-700 px-3 py-2.5 text-[12px] font-black text-white transition active:bg-ink-800"
          >
            <span>📌 팝업 정보 보기</span>
            <span className="text-[11px] text-coral-200">↗</span>
          </button>
        )}
      </div>
    </article>
  )
}
