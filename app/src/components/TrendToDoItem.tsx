import { useNavigate } from 'react-router-dom'
import type { TrendToDoItem as Item } from '../data/trendToDo'
import { useDoneTrends } from '../lib/social'
import { useToast } from './Toast'
import { formatViews } from '../lib/format'

const movementStyle: Record<string, { label: string; cls: string }> = {
  peak: { label: '🔥 정점', cls: 'bg-coral-500 text-white' },
  rising: { label: '↑ 상승', cls: 'bg-amber-500 text-white' },
  fading: { label: '↓ 한물', cls: 'bg-stone-400 text-white' },
}

export function TrendToDoRow({ item }: { item: Item }) {
  const [, toggleDone, hasDone] = useDoneTrends()
  const toast = useToast()
  const navigate = useNavigate()
  const done = hasDone(item.id)

  const onCheck = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleDone(item.id)
    toast.push(done ? '체크 해제' : '✓ 트렌드 1개 완료!')
  }

  const onRowClick = () => {
    if (item.related_challenge_id) {
      navigate(`/c/${item.related_challenge_id}`)
    } else {
      toggleDone(item.id)
      toast.push(done ? '체크 해제' : '✓ 트렌드 1개 완료!')
    }
  }

  const onExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!item.external_cta) return
    window.open(item.external_cta.href, '_blank', 'noopener,noreferrer')
    toast.push(`${item.external_cta.partner_name}로 이동`)
  }

  return (
    <button
      onClick={onRowClick}
      className={`flex w-full flex-col gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
        done ? 'border-coral-200 bg-coral-50/60' : 'border-ink-100 bg-white shadow-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-7 shrink-0 text-center text-[13px] font-black ${
            done ? 'text-coral-500' : 'text-ink-300'
          }`}
        >
          #{item.rank}
        </span>

        <span
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.cover_gradient} text-2xl text-white shadow-card cover-grain`}
        >
          <span className="relative drop-shadow">{item.emoji}</span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`break-keep text-[14px] font-black ${
                done ? 'text-ink-300 line-through' : 'text-ink-700'
              }`}
            >
              {item.title}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${movementStyle[item.movement].cls}`}
            >
              {movementStyle[item.movement].label}
            </span>
          </div>
          <div className="mt-0.5 break-keep text-[11px] text-ink-400">{item.desc}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-300">
            <span className="rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-400">
              ⏱ {item.duration_label}
            </span>
            <span className="rounded-full bg-ink-50 px-2 py-0.5 font-bold text-ink-400">
              💸 {item.cost_label}
            </span>
            <span className="font-bold text-coral-600">
              {formatViews(item.participants)} 참여 · {Math.round(item.done_ratio * 100)}% 완료
            </span>
          </div>
        </div>

        <button
          onClick={onCheck}
          aria-label={done ? '체크 해제' : '완료 체크'}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base font-black transition ${
            done
              ? 'border-coral-500 bg-coral-500 text-white'
              : 'border-ink-200 bg-white text-ink-300'
          }`}
        >
          {done ? '✓' : ''}
        </button>
      </div>

      {item.external_cta && (
        <button
          onClick={onExternal}
          className="flex w-full items-center justify-between rounded-xl bg-ink-700 px-3 py-2.5 text-[12px] font-black text-white transition active:bg-ink-800"
        >
          <span className="flex items-center gap-2">
            <span>{item.external_cta.partner_emoji}</span>
            <span>{item.external_cta.label}</span>
          </span>
          <span className="text-[11px] text-coral-200">↗</span>
        </button>
      )}
    </button>
  )
}
