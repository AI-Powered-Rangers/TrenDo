import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FLOW_MAIN, FLOW_BRANCHES } from '../data/trendFlow'
import type { FlowStatus } from '../data/trendFlow'
import { findChallenge } from '../data/trends'

const statusStyle: Record<FlowStatus, { dot: string; ring: string; label: string; chip: string }> = {
  past: {
    dot: 'bg-ink-300',
    ring: 'ring-ink-100',
    label: '지난 정점',
    chip: 'bg-ink-50 text-ink-400',
  },
  declining: {
    dot: 'bg-amber-400',
    ring: 'ring-amber-200',
    label: '하락 중',
    chip: 'bg-amber-50 text-amber-700',
  },
  rising: {
    dot: 'bg-coral-500',
    ring: 'ring-coral-200',
    label: '상승 중',
    chip: 'bg-coral-50 text-coral-600',
  },
  peak: {
    dot: 'bg-coral-500 glow-coral',
    ring: 'ring-coral-300',
    label: '지금 정점',
    chip: 'bg-coral-500 text-white',
  },
  fizzled: {
    dot: 'bg-stone-400',
    ring: 'ring-stone-200',
    label: '단발 종료',
    chip: 'bg-stone-100 text-stone-500',
  },
}

export function TrendFlow() {
  const [activeId, setActiveId] = useState<string>('flow-5')
  const active = FLOW_MAIN.find((s) => s.id === activeId)
  const activeBranch = FLOW_BRANCHES.find((b) => b.id === activeId)
  const challenge = active
    ? findChallenge(active.challenge_id)
    : activeBranch
    ? findChallenge(activeBranch.challenge_id)
    : null

  const branchOf = (stageId: string) => FLOW_BRANCHES.filter((b) => b.origin_id === stageId)

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-ink-800 text-white shadow-card">
      <div className="absolute inset-0 aurora-mesh opacity-90" />
      <div className="absolute inset-0 cover-grain opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-800/55" />

      <div className="relative p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-coral-200">
              Trend Flow Map
            </div>
            <h2 className="mt-1 break-keep text-xl font-black leading-tight">
              유행은 어떤 코드로 다음 유행을 낳았나
            </h2>
          </div>
          <div className="text-right text-[11px]">
            <div className="text-coral-200">8주 흐름</div>
            <div className="text-white/70">두쫀쿠 → 이튼 메스</div>
          </div>
        </div>

        {/* timeline */}
        <div className="relative mt-6 -mx-1 overflow-x-auto pb-2 scrollbar-none">
          <div className="relative flex min-w-[640px] items-stretch gap-3 px-1">
            {/* connecting line */}
            <svg
              className="pointer-events-none absolute left-0 right-0 top-[28px] h-3 w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 12"
            >
              <defs>
                <linearGradient id="flowline" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#A4ADCC" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#FF7D4F" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FF5C2A" stopOpacity="1" />
                </linearGradient>
              </defs>
              <line
                x1="2"
                y1="6"
                x2="98"
                y2="6"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="6"
                x2="98"
                y2="6"
                stroke="url(#flowline)"
                strokeWidth="2"
                strokeLinecap="round"
                className="flow-dash"
              />
            </svg>

            {FLOW_MAIN.map((stage) => {
              const s = statusStyle[stage.status]
              const isActive = activeId === stage.id
              const branches = branchOf(stage.id)
              return (
                <div
                  key={stage.id}
                  className="relative flex flex-1 flex-col items-stretch"
                >
                  <button
                    onClick={() => setActiveId(stage.id)}
                    className="group relative flex flex-col items-center"
                  >
                    {/* node */}
                    <span
                      className={`relative z-10 mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-card ring-4 ${s.ring} ${
                        isActive ? 'scale-110' : ''
                      } transition`}
                    >
                      {stage.emoji}
                      <span
                        className={`absolute -bottom-1 right-0 inline-block h-3 w-3 rounded-full ${s.dot} ring-2 ring-ink-800`}
                      />
                    </span>

                    <span
                      className={`mt-2 break-keep text-center text-[11px] font-black leading-tight ${
                        isActive ? 'text-white' : 'text-white/85'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span
                      className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.chip}`}
                    >
                      {s.label}
                    </span>
                    <span className="mt-0.5 text-[10px] text-white/55">{stage.era}</span>
                  </button>

                  {/* branch (e.g. pringles) */}
                  {branches.map((b) => {
                    const bs = statusStyle[b.status]
                    const isB = activeId === b.id
                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveId(b.id)}
                        className="relative mt-3 flex flex-col items-center"
                      >
                        <svg
                          width="2"
                          height="22"
                          className="text-white/30"
                          viewBox="0 0 2 22"
                          preserveAspectRatio="none"
                        >
                          <line
                            x1="1"
                            y1="0"
                            x2="1"
                            y2="22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                        </svg>
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base ring-2 ${bs.ring} ${
                            isB ? 'scale-110' : ''
                          } transition`}
                        >
                          {b.emoji}
                          <span
                            className={`absolute -bottom-0.5 right-0 inline-block h-2.5 w-2.5 rounded-full ${bs.dot} ring-2 ring-ink-800`}
                          />
                        </span>
                        <span className="mt-1 break-keep text-center text-[10px] font-bold text-white/75">
                          {b.label}
                        </span>
                        <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${bs.chip}`}>
                          {bs.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* active info */}
        <div className="reveal mt-5 rounded-2xl bg-white/8 p-4 backdrop-blur-sm ring-1 ring-white/10">
          {active && (
            <ActiveCard
              emoji={active.emoji}
              label={active.label}
              era={active.era}
              status={active.status}
              whyThen={active.why_then}
              linkToNext={active.link_to_next}
              challengeId={active.challenge_id}
              challengeTitle={challenge?.title}
            />
          )}
          {activeBranch && (
            <ActiveCard
              emoji={activeBranch.emoji}
              label={activeBranch.label}
              era={activeBranch.era}
              status={activeBranch.status}
              whyThen={activeBranch.note}
              isBranch
              challengeId={activeBranch.challenge_id}
              challengeTitle={challenge?.title}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function ActiveCard({
  emoji,
  label,
  era,
  status,
  whyThen,
  linkToNext,
  isBranch,
  challengeId,
  challengeTitle,
}: {
  emoji: string
  label: string
  era: string
  status: FlowStatus
  whyThen: string
  linkToNext?: string
  isBranch?: boolean
  challengeId: string
  challengeTitle?: string
}) {
  const s = statusStyle[status]
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-base font-black">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.chip}`}>{s.label}</span>
        <span className="ml-auto text-[10px] text-white/60">{era}</span>
      </div>

      <p className="break-keep text-[12px] leading-relaxed text-white/85">
        <span className="font-bold text-coral-200">왜 그때 떴나 · </span>
        {whyThen}
      </p>

      {linkToNext && (
        <div className="rounded-xl bg-coral-500/15 p-3 text-[11px] leading-relaxed text-coral-100">
          <span className="font-bold text-coral-200">다음으로 이어진 코드 · </span>
          {linkToNext}
        </div>
      )}

      {isBranch && (
        <div className="rounded-xl bg-stone-500/20 p-3 text-[11px] leading-relaxed text-white/75">
          <span className="font-bold text-stone-200">분기 · </span>
          본류에 합류하지 못한 단발 챌린지. 흐름선에는 잠깐만 점멸.
        </div>
      )}

      <Link
        to={`/c/${challengeId}`}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink-700 shadow-card"
      >
        {challengeTitle ? `${challengeTitle} 보기` : '챌린지 보기'} →
      </Link>
    </div>
  )
}
