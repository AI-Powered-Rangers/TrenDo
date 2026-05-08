import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_TREND_SCORES,
  AI_PIPELINE,
  CLUSTERS,
  COMMUNITY_TRENDING,
  FEATURE_DESCRIPTION,
  MODEL_HEALTH,
  XAI_GUARDRAILS,
} from '../data/admin'
import { TRENDS, findChallenge } from '../data/trends'
import { XAIBar } from '../components/XAIBar'
import { formatCount, formatPct, formatViews } from '../lib/format'
import type { AdminTrendScore, XAIFeature } from '../types'

const TABS = [
  { id: 'rank', label: '트렌드 XAI', eyebrow: 'Score Ledger' },
  { id: 'cluster', label: 'AI 클러스터', eyebrow: 'Embeddings' },
  { id: 'community', label: '커뮤니티 신호', eyebrow: 'Trend Candidates' },
] as const

type Tab = (typeof TABS)[number]['id']

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('rank')
  const [selectedId, setSelectedId] = useState<string>(
    ADMIN_TREND_SCORES[0]?.challenge_id ?? '',
  )

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-ink-700">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <AdminSidebar tab={tab} setTab={setTab} />

        <main className="min-w-0 flex-1 space-y-6">
          <AdminHero />

          <div className="grid grid-cols-3 gap-2 lg:hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-2xl px-3 py-3 text-left transition ${
                  tab === t.id
                    ? 'bg-ink-700 text-white shadow-card'
                    : 'bg-white text-ink-400 shadow-card'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {t.eyebrow}
                </div>
                <div className="mt-1 text-xs font-black">{t.label}</div>
              </button>
            ))}
          </div>

          <PipelineStrip />

          {tab === 'rank' && (
            <RankTab selectedId={selectedId} setSelectedId={setSelectedId} />
          )}
          {tab === 'cluster' && <ClusterTab />}
          {tab === 'community' && <CommunityTab />}
        </main>
      </div>
    </div>
  )
}

function AdminSidebar({
  tab,
  setTab,
}: {
  tab: Tab
  setTab: (tab: Tab) => void
}) {
  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-5 space-y-4">
        <div className="rounded-3xl bg-ink-800 p-5 text-white shadow-card">
          <Link to="/" className="text-xs font-bold text-coral-200">
            ← 사용자 화면으로
          </Link>
          <div className="mt-7 text-[11px] font-black uppercase tracking-[0.28em] text-coral-200">
            TrenDo Admin
          </div>
          <h1 className="mt-2 text-2xl font-black leading-tight">
            AI 유행 관제
            <br />
            XAI 콘솔
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-white/70">
            숏폼 조회수만 보는 화면이 아니라, 세대 번역·지역 확산·전통 연결·잔존 신호가
            어떤 근거로 점수가 됐는지 추적합니다.
          </p>
        </div>

        <nav className="space-y-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                tab === t.id
                  ? 'bg-coral-500 text-white shadow-card'
                  : 'bg-white text-ink-500 shadow-card hover:text-ink-700'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                {t.eyebrow}
              </div>
              <div className="mt-1 text-sm font-black">{t.label}</div>
            </button>
          ))}
        </nav>

        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-300">
            Model Health
          </div>
          <div className="mt-3 space-y-3">
            {MODEL_HEALTH.map((m) => (
              <div key={m.label} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-ink-700">{m.label}</div>
                  <div className="mt-0.5 text-[10px] leading-relaxed text-ink-300">
                    {m.detail}
                  </div>
                </div>
                <span className={`text-sm font-black ${healthToneClass(m.tone)}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function AdminHero() {
  const totalViews = TRENDS.reduce((sum, trend) => sum + trend.views_24h, 0)
  const avgConfidence =
    ADMIN_TREND_SCORES.reduce((sum, row) => sum + row.confidence, 0) /
    ADMIN_TREND_SCORES.length
  const watchCount = ADMIN_TREND_SCORES.filter((row) => row.risk_level !== 'low').length

  return (
    <header className="overflow-hidden rounded-[28px] bg-ink-800 text-white shadow-card">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-coral-500 px-3 py-1 text-[11px] font-black">
              TrenDo Score v0.3
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/80">
              XAI Attribution · 15분 갱신
            </span>
          </div>
          <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
            관리자는 “무엇이 떴나”보다
            <br />
            “왜 뜨고, 무엇을 해야 하나”를 봅니다.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72">
            조회 성장, 세대 다양성, 지역 확산, 전통 연결, 가족 공유, 잔존율을 같은
            점수 체계로 정규화하고 모든 랭킹에 설명 가능한 근거 로그를 붙였습니다.
          </p>

          <div className="mt-7 grid overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-4">
            <HeroMetric label="24h 조회 신호" value={formatViews(totalViews)} />
            <HeroMetric label="평균 신뢰도" value={formatPct(avgConfidence)} />
            <HeroMetric label="감시 필요" value={`${watchCount}건`} />
            <HeroMetric label="활성 모델" value="6피처" />
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.06] p-4 sm:p-6 lg:border-l lg:border-t-0">
          <AIFusionVisual />
        </div>
      </div>
    </header>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-white/10 p-4 last:border-r-0 sm:border-b-0">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function PipelineStrip() {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-600">
            AI Technology Stack
          </div>
          <h2 className="text-xl font-black text-ink-700">유행을 챌린지로 번역하는 모델 흐름</h2>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-ink-300">
          실제 데모는 클라이언트 시뮬레이션이지만, 관리자 화면은 향후 백엔드 모델이
          붙었을 때 그대로 보여줄 판단 체계를 먼저 제품화했습니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {AI_PIPELINE.map((stage, index) => (
          <article key={stage.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="rounded-full bg-coral-50 px-2 py-1 text-[10px] font-bold text-coral-600">
                {stage.tech}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-black text-ink-700">{stage.label}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">{stage.output}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AIFusionVisual() {
  const modules = [
    { label: 'Signal AI', sub: '실시간 유행 감지' },
    { label: 'Embedding AI', sub: '멀티모달 유사도' },
    { label: 'Translator AI', sub: '세대별 말투 변환' },
    { label: 'Culture RAG', sub: '전통 근거 검색' },
  ]
  const outputs = ['챌린지 번역', '근거 로그', '운영 액션']

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-800/70 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-coral-200">
            AI Fusion Lab
          </div>
          <h3 className="mt-1 break-keep text-base font-black leading-snug text-white sm:text-lg">
            여러 AI가 모여 하나의 판단으로 융합
          </h3>
        </div>
        <div className="hidden rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/65 sm:block">
          live simulation
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-3xl bg-[#0A102C] p-4">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 420 360"
          role="img"
          aria-label="다섯 개의 AI 모듈이 중앙 TrenDo Fusion Core로 모여 점수와 설명을 만드는 시각화"
        >
          <defs>
            <linearGradient id="fusionStream" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFC0A4" />
              <stop offset="52%" stopColor="#FF5C2A" />
              <stop offset="100%" stopColor="#8EE7D2" />
            </linearGradient>
            <filter id="fusionGlow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path className="fusion-stream fusion-delay-0" d="M90 70 C132 96 166 118 198 156" />
          <path className="fusion-stream fusion-delay-1" d="M330 70 C288 96 254 118 222 156" />
          <path className="fusion-stream fusion-delay-2" d="M90 148 C132 154 166 160 190 172" />
          <path className="fusion-stream fusion-delay-3" d="M330 148 C288 154 254 160 230 172" />
          <path className="fusion-stream fusion-delay-4" d="M210 226 C210 246 210 266 210 292" />

          <g filter="url(#fusionGlow)">
            <circle className="fusion-ring fusion-ring-a" cx="210" cy="178" r="72" />
            <circle className="fusion-ring fusion-ring-b" cx="210" cy="178" r="51" />
            <circle className="fusion-core-pulse" cx="210" cy="178" r="34" />
          </g>

          <g className="fusion-packet fusion-delay-0">
            <circle r="4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M90 70 C132 96 166 118 198 156" />
            </circle>
          </g>
          <g className="fusion-packet fusion-delay-1">
            <circle r="4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M330 70 C288 96 254 118 222 156" />
            </circle>
          </g>
          <g className="fusion-packet fusion-delay-2">
            <circle r="4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M90 148 C132 154 166 160 190 172" />
            </circle>
          </g>
          <g className="fusion-packet fusion-delay-3">
            <circle r="4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M330 148 C288 154 254 160 230 172" />
            </circle>
          </g>
          <g className="fusion-packet fusion-delay-4">
            <circle r="4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M210 226 C210 246 210 266 210 292" />
            </circle>
          </g>
        </svg>

        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-2">
            {modules.map((m, index) => (
              <div
                key={m.label}
                className="fusion-node"
                style={{ animationDelay: `${index * 0.22}s` }}
              >
                <div className="truncate text-[11px] font-black text-white">{m.label}</div>
                <div className="mt-0.5 truncate text-[10px] text-white/55">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto my-7 w-40 text-center">
            <div className="fusion-core-card rounded-2xl border border-coral-200/40 bg-coral-500/95 px-4 py-3 shadow-card">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-coral-100">
              Core
            </div>
            <div className="mt-1 text-sm font-black leading-tight text-white">
              TrenDo Fusion
            </div>
            <div className="mt-1 font-mono text-[10px] text-white/75">Σ AI → XAI</div>
            </div>
          </div>

          <div className="fusion-judge mx-auto mb-4 max-w-[240px] rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-center">
            <div className="text-xs font-black text-white">XAI Judge</div>
            <div className="mt-1 text-[10px] text-white/55">기여도·리스크 판정</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {outputs.map((output, index) => (
            <div
              key={output}
              className="fusion-output rounded-2xl border border-white/10 bg-white/10 px-2 py-2 text-center text-[10px] font-bold leading-tight text-white sm:text-[11px]"
              style={{ animationDelay: `${0.4 + index * 0.2}s` }}
            >
              {output}
            </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {XAI_GUARDRAILS.slice(0, 3).map((g) => (
          <div key={g.label} className="rounded-2xl bg-white/7 px-3 py-2">
            <div className="flex items-start gap-3">
              <div className="w-16 shrink-0 text-[11px] font-black text-white">{g.label}</div>
              <p className="break-keep text-[10px] leading-relaxed text-white/58">{g.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RankTab({
  selectedId,
  setSelectedId,
}: {
  selectedId: string
  setSelectedId: (id: string) => void
}) {
  const sorted = useMemo(
    () => [...ADMIN_TREND_SCORES].sort((a, b) => b.total - a.total),
    [],
  )
  const selected = sorted.find((row) => row.challenge_id === selectedId) ?? sorted[0]
  const strongest = getTopFeature(selected)
  const weakest = getWeakestFeature(selected)

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <InsightTile
          label="랭킹 1위 판단"
          value={findChallenge(sorted[0].challenge_id)?.title ?? '트렌드'}
          detail={`AI 점수 ${sorted[0].total} · ${getTopFeature(sorted[0])?.label ?? '핵심 피처'} 기여`}
        />
        <InsightTile
          label="가장 강한 설명 피처"
          value={strongest?.label ?? '분석 중'}
          detail={strongest ? `${strongest.weight.toFixed(2)} × ${strongest.value} = ${getContribution(strongest).toFixed(1)}` : ''}
        />
        <InsightTile
          label="보정이 필요한 신호"
          value={weakest?.label ?? '분석 중'}
          detail={weakest ? `${weakest.value}점 · 운영 액션에서 보완 권장` : ''}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(390px,0.98fr)]">
        <section className="space-y-3">
          {sorted.map((row, idx) => (
            <RankingRow
              key={row.challenge_id}
              row={row}
              rank={idx + 1}
              selected={selected.challenge_id === row.challenge_id}
              onSelect={() => setSelectedId(row.challenge_id)}
            />
          ))}
        </section>

        <section className="space-y-4 xl:sticky xl:top-5 xl:self-start">
          <ScoreBreakdown row={selected} />
          <EvidencePanel row={selected} />
        </section>
      </div>
    </div>
  )
}

function RankingRow({
  row,
  rank,
  selected,
  onSelect,
}: {
  row: AdminTrendScore
  rank: number
  selected: boolean
  onSelect: () => void
}) {
  const challenge = findChallenge(row.challenge_id)
  const top = getTopFeature(row)
  const trend = TRENDS.find((t) => t.challenge_id === row.challenge_id)
  const direction = directionMeta(row.trend_direction)
  const risk = riskMeta(row.risk_level)

  if (!challenge || !top) return null

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-coral-300 bg-white shadow-card ring-2 ring-coral-100'
          : 'border-transparent bg-white shadow-card hover:border-ink-100'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-50 text-xl">
          {challenge.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-ink-300">#{rank}</span>
            <h3 className="text-base font-black text-ink-700">{challenge.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${direction.className}`}>
              {direction.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${risk.className}`}>
              {risk.label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-400">
            최대 기여: {top.label} · {top.weight.toFixed(2)} × {top.value} =
            {' '}
            {getContribution(top).toFixed(1)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-3xl font-black text-coral-600">{row.total}</div>
          <div className="text-[10px] font-bold text-ink-300">AI SCORE</div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-50">
        <div className="h-full rounded-full bg-coral-500" style={{ width: `${row.total}%` }} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Mini label="신뢰도" value={formatPct(row.confidence)} />
        <Mini label="표본" value={formatCount(row.sample_size)} />
        <Mini label="24h 조회" value={trend ? formatViews(trend.views_24h) : '-'} />
      </div>
    </button>
  )
}

function ScoreBreakdown({ row }: { row: AdminTrendScore }) {
  const challenge = findChallenge(row.challenge_id)
  const top = getTopFeature(row)
  const computed = row.features.reduce((sum, feature) => sum + getContribution(feature), 0)

  if (!challenge || !top) return null

  return (
    <article className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-600">
            XAI Score Decomposition
          </div>
          <h3 className="mt-1 text-xl font-black text-ink-700">
            {challenge.emoji} {challenge.title}
          </h3>
        </div>
        <Link
          to={`/c/${row.challenge_id}`}
          className="rounded-full bg-ink-700 px-3 py-1.5 text-xs font-bold text-white"
        >
          상세 보기
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-ink-100 py-4">
        <Metric label="AI 점수" value={row.total} />
        <Metric label="계산값" value={computed.toFixed(1)} />
        <Metric label="신뢰도" value={formatPct(row.confidence)} />
      </div>

      <div className="mt-5 space-y-4">
        {row.features.map((feature) => (
          <XAIBar
            key={feature.key}
            feature={feature}
            highlight={feature.key === top.key}
            description={FEATURE_DESCRIPTION[feature.key]}
            showFormula
          />
        ))}
      </div>

      <div className="mt-5 border-t border-ink-100 pt-4">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-300">
          Natural Language Explanation
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{row.top_reason}</p>
        {row.caveat && (
          <p className="mt-3 border-l-4 border-coral-500 pl-3 text-xs leading-relaxed text-coral-700">
            {row.caveat}
          </p>
        )}
      </div>
    </article>
  )
}

function EvidencePanel({ row }: { row: AdminTrendScore }) {
  const risk = riskMeta(row.risk_level)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      <article className="rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-ink-700">근거 로그</h3>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${risk.className}`}>
            {risk.label}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {row.model_trace.map((trace, idx) => (
            <div key={trace} className="flex gap-3 border-t border-ink-50 pt-3 first:border-t-0 first:pt-0">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-700 text-[10px] font-black text-white">
                {idx + 1}
              </span>
              <p className="text-xs leading-relaxed text-ink-500">{trace}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl bg-white p-5 shadow-card">
        <h3 className="text-base font-black text-ink-700">운영 액션</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{row.recommended_action}</p>
        <div className="mt-4 space-y-2 border-t border-ink-100 pt-4">
          {row.evidence.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-ink-500">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function ClusterTab() {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <InsightTile label="클러스터링" value="HDBSCAN" detail="임베딩 거리 기반 유행 묶음" />
        <InsightTile label="핵심 노드" value="두쫀쿠" detail="한 입 K푸드 중심 트렌드" />
        <InsightTile label="성장 1위" value="표정·인증샷" detail="+61% · 진입 장벽 0" />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        {CLUSTERS.map((cluster) => (
          <article key={cluster.id} className="rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-3xl">{cluster.emoji}</div>
                <h3 className="mt-3 text-xl font-black text-ink-700">{cluster.label}</h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  cluster.growth > 0.3
                    ? 'bg-coral-50 text-coral-600'
                    : cluster.growth > 0.1
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-ink-50 text-ink-400'
                }`}
              >
                +{Math.round(cluster.growth * 100)}%
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink-500">{cluster.description}</p>

            <div className="mt-5 border-y border-ink-100 py-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-ink-400">신호 강도</span>
                <span className="font-black text-ink-700">{cluster.signal_strength}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-50">
                <div
                  className="h-full rounded-full bg-ink-700"
                  style={{ width: `${cluster.signal_strength}%` }}
                />
              </div>
              <div className="mt-3 text-[11px] leading-relaxed text-ink-300">
                {cluster.method}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {cluster.challenge_ids.map((id) => {
                const challenge = findChallenge(id)
                if (!challenge) return null
                return (
                  <Link
                    key={id}
                    to={`/c/${id}`}
                    className="rounded-full bg-ink-50 px-3 py-1.5 text-[11px] font-bold text-ink-500"
                  >
                    {challenge.emoji} {challenge.title}
                  </Link>
                )
              })}
            </div>

            <div className="mt-5 border-t border-ink-100 pt-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-coral-600">
                Next Action
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{cluster.next_action}</p>
              <div className="mt-3 text-[11px] text-ink-300">
                포스트 {formatCount(cluster.size)}개
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function CommunityTab() {
  const total = COMMUNITY_TRENDING.reduce((sum, trend) => sum + trend.posts, 0)
  const topCandidate = [...COMMUNITY_TRENDING].sort(
    (a, b) => b.candidate_score - a.candidate_score,
  )[0]

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <InsightTile label="24h 활성 게시물" value={`${formatCount(total)}개`} detail="AI 후보 해시태그만 집계" />
        <InsightTile label="최우선 후보" value={topCandidate.hashtag} detail={`후보 점수 ${topCandidate.candidate_score}`} />
        <InsightTile label="운영 경고" value="세대·절기 편향" detail="쏠림 신호는 XAI에 별도 표기" />
      </section>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr] gap-4 border-b border-ink-100 px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-ink-300 max-md:hidden">
          <span>Hashtag</span>
          <span>Signals</span>
          <span>AI Score</span>
          <span>XAI Reason</span>
        </div>

        <div className="divide-y divide-ink-100">
          {COMMUNITY_TRENDING.map((trend) => {
            const movement = movementMeta(trend.movement)
            return (
              <article
                key={trend.hashtag}
                className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-coral-600">{trend.hashtag}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${movement.className}`}>
                      {movement.label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-400">
                    {trend.prediction}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:block md:space-y-2">
                  <Mini label="게시물" value={formatCount(trend.posts)} />
                  <Mini label="참여율" value={formatPct(trend.engagement_rate)} />
                  <Mini label="세대 균형" value={trend.generation_mix.toFixed(2)} />
                </div>

                <div>
                  <div className="text-3xl font-black text-ink-700">{trend.candidate_score}</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-50">
                    <div
                      className="h-full rounded-full bg-coral-500"
                      style={{ width: `${trend.candidate_score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ink-300">{trend.risk}</p>
                </div>

                <p className="text-xs leading-relaxed text-ink-500">
                  <span className="font-black text-coral-600">XAI · </span>
                  {trend.why}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function InsightTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-card">
      <div className="text-[11px] font-bold text-ink-300">{label}</div>
      <div className="mt-1 text-lg font-black text-ink-700">{value}</div>
      <p className="mt-2 text-xs leading-relaxed text-ink-400">{detail}</p>
    </article>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2">
      <div className="text-[10px] text-ink-300">{label}</div>
      <div className="text-sm font-bold text-ink-700">{value}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-ink-300">{label}</div>
      <div className="mt-1 text-xl font-black text-ink-700">{value}</div>
    </div>
  )
}

function getContribution(feature: XAIFeature) {
  return feature.weight * feature.value
}

function getTopFeature(row: AdminTrendScore) {
  return [...row.features].sort((a, b) => getContribution(b) - getContribution(a))[0]
}

function getWeakestFeature(row: AdminTrendScore) {
  return [...row.features].sort((a, b) => getContribution(a) - getContribution(b))[0]
}

function directionMeta(direction: AdminTrendScore['trend_direction']) {
  if (direction === 'rising') {
    return { label: '↑ 상승', className: 'bg-emerald-50 text-emerald-700' }
  }
  if (direction === 'declining') {
    return { label: '↓ 하락', className: 'bg-coral-50 text-coral-600' }
  }
  return { label: '→ 안정', className: 'bg-sky-50 text-sky-700' }
}

function riskMeta(risk: AdminTrendScore['risk_level']) {
  if (risk === 'high') return { label: 'High Risk', className: 'bg-coral-50 text-coral-600' }
  if (risk === 'medium') return { label: 'Watch', className: 'bg-amber-50 text-amber-700' }
  return { label: 'Low Risk', className: 'bg-emerald-50 text-emerald-700' }
}

function movementMeta(movement: 'up' | 'flat' | 'down') {
  if (movement === 'up') return { label: '↑ 상승', className: 'bg-emerald-50 text-emerald-700' }
  if (movement === 'down') return { label: '↓ 하락', className: 'bg-coral-50 text-coral-600' }
  return { label: '→ 정체', className: 'bg-sky-50 text-sky-700' }
}

function healthToneClass(tone: 'good' | 'watch' | 'risk') {
  if (tone === 'good') return 'text-emerald-600'
  if (tone === 'risk') return 'text-coral-600'
  return 'text-amber-600'
}
