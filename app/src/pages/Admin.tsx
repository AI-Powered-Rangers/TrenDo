import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TRENDS as USER_APP_TRENDS } from '../data/trends'
import { adminApi, AdminState, AiRun, Challenge, LocalMatch, ScoreFactor, Trend } from '../lib/adminApi'
import { formatCount } from '../lib/format'

const KOREA_PATH =
  'M170 70 C 210 70 240 100 250 130 L 270 160 L 300 175 L 320 200 L 305 225 L 320 260 L 300 290 L 320 320 L 300 360 L 270 400 L 290 430 L 280 460 L 240 470 L 210 455 L 180 445 L 160 430 L 145 400 L 130 360 L 120 320 L 110 280 L 105 240 L 110 200 L 125 160 L 140 120 Z'

const MENUS = [
  'Home Dashboard',
  'Trend Control Tower',
  'Trend Intelligence',
  'Challenge Studio',
  'Safety & Ethics Gate',
  'Local Asset Matching',
  'Proposal Studio',
  'User Analytics',
  'Impact Report Center',
  'AI Ops / Model Run Log',
] as const

type Menu = (typeof MENUS)[number]

export function AdminPage() {
  const [state, setState] = useState<AdminState | null>(null)
  const [menu, setMenu] = useState<Menu>('Home Dashboard')
  const [loading, setLoading] = useState('초기화 중')
  const [error, setError] = useState('')
  const [selectedTrendId, setSelectedTrendId] = useState('')
  const [selectedChallengeId, setSelectedChallengeId] = useState('')
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [briefing, setBriefing] = useState<any>(null)
  const [translations, setTranslations] = useState<any>(null)
  const [autoCollect, setAutoCollect] = useState(false)
  const [cycleLog, setCycleLog] = useState<any[]>([])
  const [collectionResult, setCollectionResult] = useState<any>(null)
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [pipelineResult, setPipelineResult] = useState<any>(null)
  const [cardPackageResult, setCardPackageResult] = useState<any>(null)
  const [selectedRegionCode, setSelectedRegionCode] = useState('jeonju')
  const cycleRunningRef = useRef(false)

  const refresh = async () => {
    setError('')
    const next = await adminApi.state()
    setState(next)
    setSelectedTrendId((current) => current || next.trends[0]?.id || '')
    setSelectedChallengeId((current) => current || next.challenges[0]?.id || '')
    setLoading('')
  }

  useEffect(() => {
    refresh().catch((e) => {
      setError(String(e))
      setLoading('')
    })
  }, [])

  useEffect(() => {
    if (!autoCollect) return
    executeCollectionCycle(true)
    const timer = window.setInterval(() => executeCollectionCycle(true), 12_000)
    return () => window.clearInterval(timer)
  }, [autoCollect])

  const selectedTrend = state?.trends.find((trend) => trend.id === selectedTrendId) ?? state?.trends[0]
  const selectedChallenge = state?.challenges.find((challenge) => challenge.id === selectedChallengeId) ?? state?.challenges[0]
  const latestSafety = state?.safetyReviews.find((review) => review.challenge_id === selectedChallenge?.id)
  const selectedMatch = state?.localMatches[0]

  async function run(label: string, action: () => Promise<unknown>) {
    setLoading(label)
    setError('')
    try {
      const result = await action()
      if (label.includes('진단')) setDiagnosis((result as any).diagnosis)
      if (label.includes('브리핑')) setBriefing((result as any).briefing)
      if (label.includes('세대별')) setTranslations((result as any).translations)
      if (label.includes('찐 문화 전환') || label.includes('하이브리드 문화 전환')) setPipelineResult(result)
      if (label.includes('유행 카드 생성')) setCardPackageResult(result)
      await refresh()
    } catch (e) {
      setError(String(e))
      setLoading('')
    }
  }

  async function collectTrendsNow() {
    setLoading('실제 트렌드 수집 중')
    setError('')
    setCollectionProgress(6)
    const timer = window.setInterval(() => {
      setCollectionProgress((current) => {
        if (current < 36) return current + 9
        if (current < 72) return current + 6
        if (current < 91) return current + 3
        return current
      })
    }, 420)
    try {
      const result = await adminApi.collectTrends()
      window.clearInterval(timer)
      setCollectionProgress(100)
      setCollectionResult(result)
      await refresh()
    } catch (e) {
      window.clearInterval(timer)
      setError(String(e))
      setLoading('')
    }
  }

  async function executeCollectionCycle(silent = false) {
    if (cycleRunningRef.current) return
    cycleRunningRef.current = true
    if (!silent) setLoading('실시간 수집 사이클 실행 중')
    setError('')
    try {
      const result = await adminApi.collectCycle()
      setCycleLog((current) => [result.cycle, ...current].slice(0, 8))
      await refresh()
    } catch (e) {
      setError(String(e))
      setLoading('')
    } finally {
      cycleRunningRef.current = false
    }
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1020] text-white">
        <div>
          <div className="text-sm font-bold text-coral-300">TrendDo Admin</div>
          <div className="mt-2 text-2xl font-black">{loading || '관리자 관제실 연결 중'}</div>
          {error && <p className="mt-3 max-w-xl text-sm text-red-200">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070E] text-ink-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,92,42,0.22),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(180deg,#05070E_0%,#0D1020_44%,#F4F7FB_44%,#F4F7FB_100%)]" />
      <div className="grid min-h-screen md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[284px_minmax(0,1fr)]">
        <aside className="relative z-10 border-r border-white/10 bg-[#080A10] p-5 text-white shadow-[18px_0_60px_rgba(0,0,0,0.26)] md:min-h-screen">
          <Link to="/" className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/84">← 사용자 화면</Link>
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.08] p-4 shadow-card">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-200">AI Culture Ops</div>
            <h1 className="mt-2 text-2xl font-black leading-tight">TrendDo Admin<br />운영 관제실</h1>
            <p className="mt-3 text-xs leading-relaxed text-white/54">사용자 피드의 유행을 수집, 해석, 검수, 지역 매칭까지 이어보는 관리자 모드.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <Badge label={`LLM ${state.runtime.llm}`} tone={state.runtime.llm === 'real_api' ? 'good' : 'demo'} />
            <Badge label={`TREND ${state.runtime.trendApis ?? 'demo_seed'}`} tone={state.runtime.trendApis === 'configured' ? 'good' : 'demo'} />
            <Badge label={`DATA ${state.runtime.dataApis}`} tone={state.runtime.dataApis === 'configured' ? 'good' : 'demo'} />
            <Badge label={`MAP ${state.runtime.mapApi}`} tone={state.runtime.mapApi === 'configured' ? 'good' : 'demo'} />
          </div>
          <nav className="mt-7 space-y-1">
            {MENUS.map((item) => (
              <button
                key={item}
                onClick={() => setMenu(item)}
                className={`w-full rounded-2xl px-3 py-2.5 text-left text-sm font-black transition ${
                  menu === item ? 'bg-white text-ink-800 shadow-card' : 'text-white/62 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="relative z-10 min-w-0 p-4 sm:p-6 lg:p-8">
          <header className="rounded-[30px] border border-white/10 bg-white/10 p-5 text-white shadow-card backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-200">{menu}</div>
              <h2 className="mt-1 text-3xl font-black text-white">AI 문화 운영 관제실</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
                첫 단계는 실제 유행 수집입니다. 아래 큰 버튼을 누르면 트렌드 수집이 실행되고, 진행 상황이 퍼센트와 막대로 표시됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {menu !== 'Home Dashboard' && <button onClick={collectTrendsNow} className="rounded-2xl bg-[#F8FAFC] px-5 py-3 text-sm font-black leading-snug text-[#05070E] shadow-card ring-1 ring-black/10 transition hover:bg-white active:scale-[0.98]">
                트렌드 수집 시작
              </button>}
              {menu === 'Trend Control Tower' && <Action onClick={() => executeCollectionCycle(false)}>수집+분석 1회 실행</Action>}
            </div>
            </div>
          </header>

          {loading && <div className="mt-4 rounded-lg bg-ink-800 px-4 py-3 text-sm font-bold text-white">{loading}</div>}
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          <section className="mt-6">
            {menu === 'Home Dashboard' && (
              <HomeDashboard
                state={state}
                autoCollect={autoCollect}
                cycleLog={cycleLog}
                pipelineResult={pipelineResult}
                selectedRegionCode={selectedRegionCode}
                collectionResult={collectionResult}
                collectionProgress={collectionProgress}
                loading={loading}
                onCollectTrends={collectTrendsNow}
                onToggleAuto={() => setAutoCollect((current) => !current)}
                onCycle={() => executeCollectionCycle(false)}
                onSelectRegion={setSelectedRegionCode}
                onTrendDecision={(trendId, status, role, comment) => run('유행 카드 배포 게이트 저장 중', () => adminApi.decideTrendPublication(trendId, status, role, comment))}
                onGenerateCard={(trendId) => run('유행 카드 생성 중', () => adminApi.generateTrendCardPackage(trendId))}
                cardPackageResult={cardPackageResult}
              />
            )}
            {menu === 'Trend Control Tower' && (
              <TrendControl
                state={state}
                selectedTrend={selectedTrend}
                cycleLog={cycleLog}
                autoCollect={autoCollect}
                onSelectTrend={setSelectedTrendId}
                onToggleAuto={() => setAutoCollect((current) => !current)}
                onCycle={() => executeCollectionCycle(false)}
              />
            )}
            {menu === 'Trend Intelligence' && (
              <TrendIntelligence
                state={state}
                selectedTrend={selectedTrend}
                translations={translations}
                onTranslate={() => selectedTrend && run('세대별 번역 생성 중', () => adminApi.translateByGeneration(selectedTrend.id))}
              />
            )}
            {menu === 'Challenge Studio' && (
              <ChallengeStudio
                state={state}
                selectedTrend={selectedTrend}
                selectedChallenge={selectedChallenge}
                onSelectChallenge={setSelectedChallengeId}
                onGenerate={() => selectedTrend && run('LLM 챌린지 생성 중', () => adminApi.generateChallenge(selectedTrend.id))}
                onHeritage={() => selectedChallenge && run('Heritage Remix 생성 중', () => adminApi.heritageRemix(selectedChallenge.id, selectedChallenge.trend_id))}
              />
            )}
            {menu === 'Safety & Ethics Gate' && (
              <SafetyGate
                challenge={selectedChallenge}
                review={latestSafety}
                onReview={() => selectedChallenge && run('Safety Gate 실행 중', () => adminApi.reviewSafety(selectedChallenge.id))}
                onDecision={(status) => selectedChallenge && run(`관리자 ${status} 처리 중`, () => adminApi.decideChallenge(selectedChallenge.id, status))}
              />
            )}
            {menu === 'Local Asset Matching' && (
              <LocalMatching
                state={state}
                challenge={selectedChallenge}
                selectedRegionCode={selectedRegionCode}
                onSelectRegion={setSelectedRegionCode}
                onMatch={() => selectedChallenge && run('지역 매칭 계산 중', () => adminApi.matchLocalAssets(selectedChallenge.id, selectedChallenge.trend_id))}
              />
            )}
            {menu === 'Proposal Studio' && (
              <ProposalStudio
                state={state}
                match={selectedMatch}
                onGenerate={() => selectedMatch && run('제안 메일 초안 생성 중', () => adminApi.generateProposal(selectedMatch.id))}
              />
            )}
            {menu === 'User Analytics' && (
              <UserAnalytics
                state={state}
                diagnosis={diagnosis}
                onDiagnose={() => run('Challenge Doctor 진단 중', adminApi.diagnose)}
                onSimulate={() => run('사용자 로그 학습 데이터 생성 중', () => adminApi.simulateEvents(96))}
              />
            )}
            {menu === 'Impact Report Center' && <ImpactReports state={state} onGenerate={() => run('성과 리포트 생성 중', adminApi.generateReport)} />}
            {menu === 'AI Ops / Model Run Log' && <AiOps runs={state.aiRuns} />}
          </section>
        </main>
      </div>
    </div>
  )
}

function HomeDashboard({
  state,
  autoCollect,
  cycleLog,
  pipelineResult,
  selectedRegionCode,
  collectionResult,
  collectionProgress,
  loading,
  onCollectTrends,
  onToggleAuto,
  onCycle,
  onSelectRegion,
  onTrendDecision,
  onGenerateCard,
  cardPackageResult,
}: {
  state: AdminState
  autoCollect: boolean
  cycleLog: any[]
  pipelineResult: any
  selectedRegionCode: string
  collectionResult: any
  collectionProgress: number
  loading: string
  onCollectTrends: () => void
  onToggleAuto: () => void
  onCycle: () => void
  onSelectRegion: (regionCode: string) => void
  onTrendDecision: (trendId: string, status: 'approved_for_user_app' | 'needs_revision' | 'rejected' | 'pending_review', role: string, comment: string) => void
  onGenerateCard: (trendId: string) => void
  cardPackageResult: any
}) {
  return (
    <div className="space-y-6">
      <TrendCollectionConsole
        state={state}
        collectionResult={collectionResult}
        collectionProgress={collectionProgress}
        loading={loading}
        onCollectTrends={onCollectTrends}
        autoCollect={autoCollect}
        cycleLog={cycleLog}
        onToggleAuto={onToggleAuto}
        onCycle={onCycle}
      />
      <TrendDoGenerator state={state} selectedRegionCode={selectedRegionCode} onSelectRegion={onSelectRegion} />
      <SimpleNextSteps
        state={state}
        selectedRegionCode={selectedRegionCode}
        onSelectRegion={onSelectRegion}
        onTrendDecision={onTrendDecision}
        onGenerateCard={onGenerateCard}
        cardPackageResult={cardPackageResult}
        pipelineResult={pipelineResult}
      />
    </div>
  )
}

function TrendCollectionConsole({
  state,
  collectionResult,
  collectionProgress,
  loading,
  onCollectTrends,
  autoCollect,
  cycleLog,
  onToggleAuto,
  onCycle,
}: {
  state: AdminState
  collectionResult: any
  collectionProgress: number
  loading: string
  onCollectTrends: () => void
  autoCollect: boolean
  cycleLog: any[]
  onToggleAuto: () => void
  onCycle: () => void
}) {
  const total = state.trends.length
  const realTrends = state.trends.filter((trend) => trend.provenance_label === 'real_api')
  const progress = loading.includes('트렌드 수집') ? collectionProgress : collectionResult ? 100 : 0
  const latest = [...state.trends].sort((a, b) => +new Date(b.collected_at) - +new Date(a.collected_at)).slice(0, 8)
  const isCollecting = loading.includes('트렌드 수집')
  const progressLabel = isCollecting ? progress < 35 ? '유행 후보를 찾는 중' : progress < 72 ? '키워드를 정리하는 중' : '관리자 화면에 반영하는 중' : collectionResult ? '수집 완료' : '수집 대기'

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="overflow-hidden rounded-[34px] bg-black text-white shadow-card">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-coral-200">Step 1. Trend Collection</div>
              <h3 className="mt-3 text-4xl font-black leading-tight md:text-5xl">실제 유행 수집</h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">
                이 버튼 하나만 누르면 됩니다. 음식, 액티비티, 여행, 챌린지, 미디어 유행을 수집하고 바로 선택지에 반영합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onCollectTrends}
            disabled={isCollecting}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-[26px] bg-[#F8FAFC] px-6 py-6 text-xl font-black leading-snug text-[#05070E] shadow-card ring-2 ring-white/70 transition hover:bg-white active:scale-[0.99] disabled:cursor-wait disabled:bg-[#E5E7EB] disabled:text-[#111827]"
          >
            {isCollecting && <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-coral-500" />}
            {isCollecting ? '실제 트렌드 수집 중...' : '트렌드 수집 시작'}
          </button>

          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-black text-white/46">수집 진행률</div>
                <div className="mt-1 text-5xl font-black">{progress}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white/46">현재 상태</div>
                <div className="mt-1 max-w-[220px] text-2xl font-black leading-tight">{progressLabel}</div>
              </div>
            </div>
            <div className="mt-4 h-5 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-coral-500 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/38">이번 수집 결과</div>
              <div className="mt-2 text-sm font-bold leading-relaxed text-white/62">
                {collectionResult
                  ? `새로 반영된 유행 ${collectionResult.inserted ?? 0}개를 선택지에 업데이트했습니다.`
                  : '버튼을 누르면 유행 후보를 수집하고, 아래 Generator 선택지에 바로 반영합니다.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="xl:col-span-2 rounded-[34px] border border-ink-100 bg-white p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-300">수집된 유행</div>
            <h3 className="mt-1 text-2xl font-black text-ink-900">최근 수집된 유행/트렌드</h3>
          </div>
          <Badge label={`${total}개 반영됨`} tone={realTrends.length ? 'good' : 'demo'} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {latest.map((trend) => (
            <article key={trend.id} className="rounded-[24px] border border-ink-100 bg-ink-50 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge label={trend.category} tone="demo" />
              </div>
              <h4 className="mt-3 min-h-[2.5rem] break-keep text-base font-black leading-snug text-ink-900">
                {trend.provenance_label === 'real_api' ? collectedTrendKeyword(trend) : trend.title}
              </h4>
              <p className="mt-2 line-clamp-3 text-xs font-bold leading-relaxed text-ink-400">{trend.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SimpleNextSteps({
  state,
  selectedRegionCode,
  onSelectRegion,
  onTrendDecision,
  onGenerateCard,
  cardPackageResult,
  pipelineResult,
}: {
  state: AdminState
  selectedRegionCode: string
  onSelectRegion: (regionCode: string) => void
  onTrendDecision: (trendId: string, status: 'approved_for_user_app' | 'needs_revision' | 'rejected' | 'pending_review', role: string, comment: string) => void
  onGenerateCard: (trendId: string) => void
  cardPackageResult: any
  pipelineResult: any
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <TrendCandidateGovernance state={state} onDecision={onTrendDecision} onGenerateCard={onGenerateCard} cardPackageResult={cardPackageResult} />
      <div className="space-y-5">
        <RegionMiniPanel state={state} selectedRegionCode={selectedRegionCode} onSelectRegion={onSelectRegion} />
        <CulturalPipelinePanel result={pipelineResult} />
      </div>
    </div>
  )
}

function RegionMiniPanel({ state, selectedRegionCode, onSelectRegion }: { state: AdminState; selectedRegionCode: string; onSelectRegion: (regionCode: string) => void }) {
  const regions = state.regionIntelligence.filter((region) => region.region_code !== 'kr').slice(0, 6)
  const selected = regions.find((region) => region.region_code === selectedRegionCode) ?? regions[0]
  return (
    <Panel title="다음 단계: 지역 조합">
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <button key={region.region_code} onClick={() => onSelectRegion(region.region_code)} className={`rounded-full px-3 py-2 text-xs font-black ${selected?.region_code === region.region_code ? 'bg-black text-white' : 'bg-ink-50 text-ink-500'}`}>
            {regionEmoji(region.region_code)} {region.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 rounded-[24px] bg-ink-50 p-4">
          <div className="text-2xl font-black text-ink-900">{selected.label}</div>
          <div className="mt-3 grid gap-2">
            <MiniTagRow label="특산품" items={selected.specialties.slice(0, 3)} />
            <MiniTagRow label="전통문화" items={selected.traditional_culture.slice(0, 3)} />
            <MiniTagRow label="행사" items={selected.festivals.slice(0, 2).map((festival) => festival.name)} />
          </div>
        </div>
      )}
    </Panel>
  )
}

function MiniTagRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase text-ink-300">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.map((item) => <span key={item} className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-ink-500">{item}</span>)}
      </div>
    </div>
  )
}

function sourceLabel(source: string) {
  if (source.includes('youtube')) return 'YouTube Data API'
  if (source.includes('naver')) return 'Naver DataLab'
  if (source.includes('seed')) return 'Demo Seed'
  if (source.includes('rss')) return 'RSS'
  if (source.includes('csv')) return 'CSV'
  return source
}

function TrendCandidateGovernance({
  state,
  onDecision,
  onGenerateCard,
  cardPackageResult,
}: {
  state: AdminState
  onDecision: (trendId: string, status: 'approved_for_user_app' | 'needs_revision' | 'rejected' | 'pending_review', role: string, comment: string) => void
  onGenerateCard: (trendId: string) => void
  cardPackageResult: any
}) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const candidates = state.trendCandidateAudits?.slice(0, 6) ?? []
  const latestPackage = cardPackageResult?.cardPackage
  const latestChallenge = cardPackageResult?.challenge
  return (
    <Panel title="트렌드 후보 관리 / 유행 카드 배포 게이트">
      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="rounded-[28px] bg-black p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Publish Governance</div>
          <h3 className="mt-2 text-2xl font-black leading-tight">위험 감지 → 카드 생성 확인 → ToDo 초안 생성</h3>
          <p className="mt-3 text-xs leading-relaxed text-white/54">
            OpenAI structured output으로 초상권, 개인정보, 조롱, 미성년자, 문화 왜곡 가능성을 먼저 확인합니다. 유해도가 높으면 유행 카드 생성이 차단됩니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <MiniDarkMetric label="후보" value={candidates.length} />
            <MiniDarkMetric label="승인됨" value={candidates.filter((item) => item.status === 'approved_for_user_app').length} />
          </div>
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs leading-relaxed text-white/58">
            카드 생성 결과는 `generated_needs_review`로 저장되고, 사용자 앱 공개는 별도 승인 버튼을 눌러야 합니다.
          </div>
        </div>
        <div className="grid gap-3">
          {candidates.map((candidate) => (
            <div key={candidate.candidate_id} className="rounded-[24px] border border-ink-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-ink-800">{candidate.title}</h3>
                    <Badge label={candidate.category} tone="demo" />
                    <Badge label={candidate.provenance_label} tone={candidate.provenance_label === 'real_api' ? 'good' : 'demo'} />
                    <Badge label={candidate.status} tone={candidate.status === 'approved_for_user_app' ? 'good' : 'demo'} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{candidate.ai_summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-coral-600">{candidate.recommendation_score}</div>
                  <div className="text-[11px] font-black text-ink-300">추천 점수</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <GateMini label="위험도" value={candidate.risk_level} good={candidate.risk_level === 'low'} />
                <GateMini label="지역 연결 가능성" value={candidate.local_connection_potential} good={candidate.local_connection_potential === 'high'} />
                <GateMini label="전통 리믹스" value={candidate.traditional_remix_potential} good={candidate.traditional_remix_potential >= 70} />
              </div>
              <SafetyNotice candidate={candidate} />
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <List title="주의/필터링" items={candidate.risk_flags.length ? candidate.risk_flags : ['중대한 위험 신호 없음']} />
                <List title="검수 체크리스트" items={candidate.review_checklist.slice(0, 3)} />
              </div>
              <div className="mt-4 rounded-[22px] border border-dashed border-ink-200 bg-ink-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Generate User Card</div>
                    <h4 className="mt-1 text-lg font-black text-ink-800">유행 카드를 생성할까요?</h4>
                    <p className="mt-1 text-xs font-bold text-ink-400">Yes를 누르면 OpenAI가 세대/분류별 카드와 ToDo 초안을 생성합니다.</p>
                  </div>
                  {confirming === candidate.candidate_id ? (
                    <div className="flex flex-wrap gap-2">
                      <Action onClick={() => { setConfirming(null); onGenerateCard(candidate.candidate_id) }}>Yes, 생성</Action>
                      <Action onClick={() => setConfirming(null)}>취소</Action>
                    </div>
                  ) : (
                    <Action onClick={() => setConfirming(candidate.candidate_id)}>카드 생성하기</Action>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Action onClick={() => onDecision(candidate.candidate_id, 'approved_for_user_app', '콘텐츠 관리자', '카드/ToDo 검수 후 사용자 앱 공개 승인')}>사용자 앱 배포 승인</Action>
                <Action onClick={() => onDecision(candidate.candidate_id, 'needs_revision', '콘텐츠 관리자', '세대별 설명/지역 연결/안전 문구 수정 필요')}>수정 요청</Action>
                <Action onClick={() => onDecision(candidate.candidate_id, 'rejected', '콘텐츠 관리자', '문화 왜곡 또는 지역 매칭 근거 부족으로 반려')}>반려</Action>
              </div>
              <div className="mt-3 text-[11px] font-bold text-ink-300">
                출처 품질: {candidate.evidence.source_quality ?? 'category_provider'} · 연결 자산 {candidate.evidence.linked_assets.length}개
              </div>
            </div>
          ))}
          {latestPackage && (
            <GeneratedCardPreview cardPackage={latestPackage} challenge={latestChallenge} blocked={Boolean(cardPackageResult?.blocked)} />
          )}
        </div>
      </div>
    </Panel>
  )
}

function SafetyNotice({ candidate }: { candidate: AdminState['trendCandidateAudits'][number] }) {
  const isHarmful = candidate.risk_level === 'high' || candidate.risk_flags.some((flag) => /유해|위험|초상권|개인정보|조롱|안전/.test(flag))
  return (
    <div className={`mt-4 rounded-[22px] p-4 ${isHarmful ? 'bg-red-50' : 'bg-amber-50'}`}>
      <div className={`text-sm font-black ${isHarmful ? 'text-red-700' : 'text-amber-700'}`}>
        {isHarmful ? '유해하거나 민감한 요소가 감지되었습니다' : '주의 사항을 확인하세요'}
      </div>
      <p className="mt-1 text-xs font-bold leading-relaxed text-ink-500">
        {isHarmful
          ? '카드 생성 전 초상권, 개인정보, 미성년자 노출, 조롱성 표현을 반드시 제거해야 합니다.'
          : '명확한 유해 요소는 낮지만, 유래 단정과 지역 문화 왜곡 여부는 관리자 검수 후 공개하세요.'}
      </p>
    </div>
  )
}

function GeneratedCardPreview({ cardPackage, challenge, blocked }: { cardPackage: any; challenge?: any; blocked: boolean }) {
  const gate = cardPackage.safety_gate
  return (
    <div className={`rounded-[30px] border p-5 ${blocked ? 'border-red-100 bg-red-50' : 'border-coral-100 bg-coral-50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.14em] text-coral-700">Generated Card Package</div>
          <h3 className="mt-1 text-3xl font-black text-ink-900">
            {blocked ? '유해한 요소가 감지되어 카드 생성이 차단되었습니다' : cardPackage.base_card.title}
          </h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-ink-500">{cardPackage.base_card.one_line_summary}</p>
        </div>
        <Badge label={gate.risk_level} tone={gate.risk_level === 'low' ? 'good' : 'demo'} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <GateMini label="카드 생성 허용" value={gate.allow_card_generation ? 'yes' : 'blocked'} good={gate.allow_card_generation} />
        <GateMini label="ToDo 생성" value={challenge?.title ? 'created' : 'not created'} good={Boolean(challenge?.title)} />
        <GateMini label="신뢰도" value={Math.round((cardPackage.confidence ?? 0) * 100)} good={(cardPackage.confidence ?? 0) >= 0.6} />
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] bg-white p-4">
          <h4 className="font-black text-ink-800">분류별/세대별 전용 카드</h4>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {(cardPackage.audience_cards ?? []).map((card: any) => (
              <div key={card.audience} className="rounded-2xl bg-ink-50 p-3">
                <div className="text-[10px] font-black uppercase text-coral-600">{audienceLabel(card.audience)}</div>
                <div className="mt-1 font-black text-ink-800">{card.card_title}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{card.hook}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-300">{card.tone_caution}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] bg-white p-4">
          <h4 className="font-black text-ink-800">ToDo 초안</h4>
          <div className="mt-2 text-sm font-black text-coral-600">{cardPackage.todo.title}</div>
          <div className="mt-2 text-xs font-bold text-ink-300">{cardPackage.todo.estimated_minutes}분 · {cardPackage.todo.estimated_cost.toLocaleString()}원 · {cardPackage.todo.difficulty}</div>
          <List title="단계" items={(cardPackage.todo.steps ?? []).map((step: any) => `${step.title}: ${step.body}`)} />
          <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-relaxed text-amber-700">{cardPackage.todo.safety_notice}</div>
        </div>
      </div>
      <div className="mt-4 rounded-[22px] bg-white p-4">
        <h4 className="font-black text-ink-800">XAI / 근거</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <List title="상위 기여 요인" items={cardPackage.xai.top_reasons ?? []} />
          <List title="감점/불확실성" items={[...(cardPackage.xai.deduction_reasons ?? []), ...(cardPackage.xai.uncertainty ?? [])]} />
        </div>
      </div>
    </div>
  )
}

function audienceLabel(audience: string) {
  return ({
    teen: '10대',
    '20s_30s': '2030',
    '40s_50s': '4050',
    '60_plus': '60대 이상',
    family: '가족',
    foreigner: '외국인',
  } as Record<string, string>)[audience] ?? audience
}

function GateMini({ label, value, good }: { label: string; value: string | number; good: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${good ? 'bg-emerald-50' : 'bg-amber-50'}`}>
      <div className="text-[10px] font-black uppercase text-ink-300">{label}</div>
      <div className={`mt-1 text-lg font-black ${good ? 'text-emerald-700' : 'text-amber-700'}`}>{value}</div>
    </div>
  )
}

function AdminRoleMatrix({ state }: { state: AdminState }) {
  return (
    <Panel title="계정/권한 관리 설계">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(state.adminRoles ?? []).map((role) => (
          <div key={role.role} className="rounded-[24px] border border-ink-100 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-black text-ink-800">{role.role}</h3>
              <Badge label={role.default_menu} tone="demo" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{role.scope}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {role.permissions.map((permission) => (
                <span key={permission} className="rounded-full bg-ink-50 px-2 py-1 text-[10px] font-black text-ink-500">{permission}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const GENERATOR_TRENDS = [
  { group: '디저트 / 베이커리', emoji: '🥐', items: [['🥨', '소금빵'], ['🍪', '두쫀쿠'], ['🥬', '봄동 디저트'], ['🧈', '버터떡'], ['🍓', '쿠쿠다스 디저트'], ['🍰', '이튼메스'], ['🍠', '우베치즈케이크'], ['🍡', '창억떡']] },
  { group: '편의점 / SNS 바이럴 음식', emoji: '🍜', items: [['🔥', '불닭미역탕면'], ['🧊', '젤리 얼먹'], ['🍣', '연어 젤리'], ['🌶️', '불닭 냉면'], ['🐙', '알쭈꾸미'], ['🍫', '초코 프링글스'], ['🧀', '칠리스 치즈스틱']] },
  { group: 'SNS 밈 / 챌린지', emoji: '🎭', items: [['🙋', '윤정아왜요쌤'], ['📝', '셋로그'], ['🫧', '말랑이'], ['⚾', '왁뿌볼'], ['🚓', '경찰과 도둑 챌린지'], ['🍚', '랜덤 비빔밥']] },
  { group: '운동 / 오프라인 참여형', emoji: '🏃', items: [['👟', '러닝크루'], ['🧈', '버터런']] },
  { group: '체험형 / 바이럴 콘텐츠', emoji: '📸', items: [['⚾', '야구장 직관 AI 영상'], ['🧳', '상하이 왕홍 체험']] },
  { group: '예능 / 드라마 / OTT', emoji: '🎬', items: [['👨‍🍳', '흑백요리사'], ['💌', '환승연애'], ['👑', '왕과 사는 남자'], ['🕯️', '살목지'], ['🎤', '기리고']] },
]

type TrendChoice = { emoji: string; name: string; group: string; key: string; provenance?: string; source?: string }
type TrendChoiceGroup = { group: string; emoji: string; items: TrendChoice[]; provenance?: string }

function categoryLabel(category: string) {
  return ({
    food: '유행 음식',
    activity: '액티비티 / 체험',
    travel: '여행 / 지역 방문',
    challenge: '챌린지 / 참여형',
    shorts_culture: '숏폼 소비문화',
    media: '영상 / OTT 밈',
    fitness: '운동 / 오프라인',
    culture: '문화 유행',
    photo: '포토 챌린지',
  } as Record<string, string>)[category] ?? category
}

function categoryEmoji(category: string) {
  return ({
    food: '🍜',
    activity: '🎨',
    travel: '🧳',
    challenge: '🎭',
    shorts_culture: '📱',
    media: '🎬',
    fitness: '🏃',
    culture: '🏮',
    photo: '📸',
  } as Record<string, string>)[category] ?? '✨'
}

function trendEmojiFromTitle(trend: Trend) {
  const text = `${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`
  if (/소금빵|빵|베이커리/.test(text)) return '🥐'
  if (/쿠키|두바이|두쫀쿠/.test(text)) return '🍪'
  if (/떡|약과|한과|전통 간식|창억/.test(text)) return '🍡'
  if (/불닭|라면|냉면|매운/.test(text)) return '🔥'
  if (/젤리|얼먹/.test(text)) return '🧊'
  if (/비빔밥|요리|플레이팅|먹방|음식|디저트|카페/.test(text)) return '🍽️'
  if (/러닝|달리|크루/.test(text)) return '🏃'
  if (/공방|원데이|클래스|체험/.test(text)) return '🎨'
  if (/시장|야시장|축제|투어|여행|핫플|골목/.test(text)) return '🧳'
  if (/한옥|포토|사진|샷/.test(text)) return '📸'
  if (/챌린지|밈|릴스|쇼츠|전환/.test(text)) return '🎭'
  if (/드라마|OTT|예능|대사|흑백요리사/.test(text)) return '🎬'
  return categoryEmoji(trend.category)
}

function cleanTrendName(title: string) {
  return title
    .replace(/#[^\s#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 34)
}

function collectedTrendKeyword(trend: Trend) {
  const text = `${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`
  const candidates = [
    '소금빵',
    '두바이쫀득쿠키',
    '두쫀쿠',
    '약과·떡 디저트',
    '편의점 바이럴 음식',
    '불닭냉면',
    '젤리 얼먹',
    '프링글스 먹는 법',
    '러닝크루',
    '버터런',
    '원데이 공방',
    '전통시장 먹거리 투어',
    '한옥 포토 챌린지',
    '랜덤 비빔밥',
    '3초 전환 릴스',
    '요리 예능 따라하기',
    '드라마 대사 밈',
    '카페 디저트 투어',
    '케이크 컷팅',
    '라면 튜닝',
    '산리오 케이크',
  ]
  const found = candidates.find((keyword) => text.replace(/\s/g, '').includes(keyword.replace(/\s/g, '')))
  if (found) return found
  const hashtag = trend.hashtags.map((tag) => tag.replace(/^#/, '').trim()).find((tag) => tag.length >= 2 && tag.length <= 12)
  if (hashtag) return hashtag
  return cleanTrendName(trend.title)
    .replace(/요즘|유행하는|유행중인|먹방|ㅋㅋ+|진짜|신상|종류별로|싹다|방법|이거/g, '')
    .replace(/[^\p{L}\p{N}\s·]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 14) || categoryLabel(trend.category)
}

function buildCollectedTrendGroups(trends: Trend[]): TrendChoiceGroup[] {
  const seen = new Set<string>()
  const choices = trends
    .filter((trend) => !trend.source.includes('cultural_conversion_pipeline') && !trend.source_url?.startsWith('derived://'))
    .sort((a, b) => {
      const realWeight = (b.provenance_label === 'real_api' ? 1000 : 0) - (a.provenance_label === 'real_api' ? 1000 : 0)
      if (realWeight) return realWeight
      return (b.surge_score?.total ?? 0) - (a.surge_score?.total ?? 0)
    })
    .filter((trend) => {
      const normalized = (trend.provenance_label === 'real_api' ? collectedTrendKeyword(trend) : cleanTrendName(trend.title)).toLowerCase()
      if (!normalized || seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .slice(0, 72)
    .map((trend) => ({
      emoji: trendEmojiFromTitle(trend),
      name: trend.provenance_label === 'real_api' ? collectedTrendKeyword(trend) : cleanTrendName(trend.title),
      group: categoryLabel(trend.category),
      key: `collected:${trend.id}`,
      provenance: trend.provenance_label,
      source: sourceLabel(trend.source),
    }))

  const grouped = new Map<string, TrendChoice[]>()
  choices.forEach((choice) => {
    grouped.set(choice.group, [...(grouped.get(choice.group) ?? []), choice])
  })
  return Array.from(grouped.entries()).map(([group, items]) => ({
    group,
    emoji: categoryEmoji(trends.find((trend) => categoryLabel(trend.category) === group)?.category ?? group),
    items,
    provenance: 'collected',
  }))
}

function TrendChoiceGrid({
  groups,
  selectedTrendKeys,
  onToggle,
  readonly = false,
}: {
  groups: TrendChoiceGroup[]
  selectedTrendKeys: string[]
  onToggle: (key: string) => void
  readonly?: boolean
}) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge label="트렌드 선택지" tone="good" />
        <span className="text-xs font-bold text-ink-300">수집된 트렌드와 기본 샘플을 한 번에 보여줍니다. 원하는 키워드를 눌러주세요.</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <TrendChoiceGroupCard key={`${group.provenance}-${group.group}`} group={group} selectedTrendKeys={selectedTrendKeys} onToggle={onToggle} readonly={readonly} />
        ))}
      </div>
    </div>
  )
}

function mergeTrendChoiceGroups(groups: TrendChoiceGroup[]): TrendChoiceGroup[] {
  const merged = new Map<string, TrendChoiceGroup>()
  groups.forEach((group) => {
    const current = merged.get(group.group)
    if (!current) {
      merged.set(group.group, { group: group.group, emoji: group.emoji, items: [...group.items] })
      return
    }
    current.items = [...current.items, ...group.items]
  })
  return Array.from(merged.values()).map((group) => ({
    ...group,
    items: group.items.slice(0, 20),
  }))
}

function TrendChoiceGroupCard({
  group,
  selectedTrendKeys,
  onToggle,
  readonly,
}: {
  group: TrendChoiceGroup
  selectedTrendKeys: string[]
  onToggle: (key: string) => void
  readonly: boolean
}) {
  return (
    <div className="rounded-[26px] bg-white p-4 shadow-[0_14px_40px_-30px_rgba(7,13,36,0.8)]">
      <div className="flex items-center gap-2">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-2xl">{group.emoji}</span>
        <div className="min-w-0">
          <strong className="block break-keep text-base leading-snug text-ink-800">{group.group}</strong>
          {group.provenance && <span className="text-[10px] font-black uppercase text-ink-300">{group.provenance}</span>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.items.map((item) => {
          const isSelected = selectedTrendKeys.includes(item.key)
          const className = `inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-2 text-left text-xs font-black leading-snug transition active:scale-[0.98] ${
            isSelected ? 'bg-black text-white shadow-card' : 'bg-ink-50 text-ink-600 hover:bg-coral-50 hover:text-coral-700'
          }`
          const content = (
            <>
              <span className="text-base">{item.emoji}</span>
              <span className="break-keep">{item.name}</span>
              {!readonly && <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? 'bg-white/18 text-white/80' : 'bg-white text-ink-300'}`}>{isSelected ? '선택됨' : '클릭하기'}</span>}
            </>
          )
          return readonly ? (
            <span key={item.key} className={className}>
              {content}
            </span>
          ) : (
            <button key={item.key} onClick={() => onToggle(item.key)} className={className}>
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TrendDoGenerator({
  state,
  selectedRegionCode,
  onSelectRegion,
}: {
  state: AdminState
  selectedRegionCode: string
  onSelectRegion: (regionCode: string) => void
}) {
  const [period, setPeriod] = useState('최근 7일')
  const [stage, setStage] = useState<'idle' | 'trendLoading' | 'trendsDone' | 'regionLoading' | 'regionDone' | 'combining' | 'recommended'>('idle')
  const [proposalReady, setProposalReady] = useState(false)
  const [experienceCard, setExperienceCard] = useState<any>(null)
  const [experienceLoading, setExperienceLoading] = useState(false)
  const [selectedTrendKeys, setSelectedTrendKeys] = useState<string[]>([])
  const regions = state.regionIntelligence.filter((region) => region.region_code !== 'kr').slice(0, 10)
  const region = regions.find((item) => item.region_code === selectedRegionCode) ?? regions[0]
  const collectedTrendGroups = useMemo(() => buildCollectedTrendGroups(state.trends), [state.trends])
  const seedTrendGroups: TrendChoiceGroup[] = GENERATOR_TRENDS.map((group) => ({
    group: group.group,
    emoji: group.emoji,
    provenance: 'demo_seed',
    items: group.items.map(([emoji, name]) => ({
      emoji,
      name,
      group: group.group,
      key: `seed:${group.group}:${name}`,
      provenance: 'demo_seed',
      source: '기본 샘플',
    })),
  }))
  const allTrendGroups = [...collectedTrendGroups, ...seedTrendGroups]
  const mergedTrendGroups = useMemo(() => mergeTrendChoiceGroups(allTrendGroups), [allTrendGroups])
  const trendOptions = mergedTrendGroups.flatMap((group) => group.items)
  const selectedTrends = trendOptions.filter((trend) => selectedTrendKeys.includes(trend.key))
  const pickedKeyword = selectedTrends.map((trend) => trend.name).join(' + ') || '선택한 트렌드'
  const pickedKeywordEmoji = selectedTrends[0]?.emoji ?? '✨'
  const canAnalyzeRegion = selectedTrends.length >= 1 && selectedTrends.length <= 3
  const pickedFestival = region?.festivals[0]?.name ?? '지역 축제'
  const pickedAsset = region?.assets[0]?.name ?? '전통시장'
  const fusionIdea = region ? buildFusionIdea(selectedTrends, region) : null
  const recommendation = fusionIdea?.title ?? `${pickedKeyword} 지역 리믹스 챌린지`

  async function start() {
    setProposalReady(false)
    setSelectedTrendKeys([])
    setStage('trendLoading')
    await delay(1100)
    setStage('trendsDone')
  }

  async function analyzeRegion(regionCode: string) {
    if (!canAnalyzeRegion) return
    onSelectRegion(regionCode)
    setProposalReady(false)
    setExperienceCard(null)
    setStage('regionLoading')
    await delay(950)
    setStage('regionDone')
    await delay(450)
    setStage('combining')
    await delay(1150)
    setStage('recommended')
  }

  function toggleTrend(key: string) {
    setProposalReady(false)
    setExperienceCard(null)
    setStage((current) => current === 'idle' || current === 'recommended' || current === 'combining' || current === 'regionDone' ? 'trendsDone' : current)
    setSelectedTrendKeys((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key)
      if (current.length >= 3) return current
      return [...current, key]
    })
  }

  async function generateExperience() {
    if (!region || !canAnalyzeRegion) return
    setExperienceLoading(true)
    setExperienceCard(null)
    setStage('combining')
    try {
      const result = await adminApi.generateExperienceCard(selectedTrends.map((trend) => trend.name), region.region_code)
      setExperienceCard({ ...result.card, matchContext: result.matchContext })
      setStage('recommended')
    } catch {
      setExperienceCard(buildLocalExperienceFallback(selectedTrends, region))
      setStage('recommended')
    } finally {
      setExperienceLoading(false)
    }
  }

  return (
    <Panel title="Trend - Do Generator">
      <div className="space-y-5">
        <div className="rounded-[32px] bg-black p-6 text-white md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-coral-200">Generator Loop</div>
              <h3 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Trend를 Do로 바꾸는<br />문화 경험 생성기</h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">
                기간을 선택하면 실제 수집 트렌드와 기본 샘플을 카테고리별로 보여주고, 선택한 1~3개 유행을 지역 특산품·전통·행사와 연결합니다.
              </p>
            </div>
            <div className="min-w-[280px] flex-1 md:max-w-md">
              <div className="grid grid-cols-3 gap-2">
                {['최근 7일', '최근 30일', '이번 시즌'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`rounded-2xl px-3 py-3 text-xs font-black transition ${period === item ? 'bg-coral-500 text-white' : 'bg-white/10 text-white/62 hover:bg-white/16'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button onClick={start} className="mt-3 w-full rounded-2xl bg-white px-4 py-4 text-base font-black leading-tight text-ink-900 transition active:scale-[0.98]">
                트렌드 조사 시작
              </button>
              <div className="mt-3">
                <Badge label={collectedTrendGroups.length ? 'collected + sample' : 'sample ready'} tone={collectedTrendGroups.length ? 'good' : 'demo'} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-ink-100 bg-white p-5 md:p-6">
          {stage === 'idle' && (
            <div className="rounded-[28px] bg-ink-50 p-5 md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-black text-4xl text-white">✨</div>
                  <h3 className="mt-5 text-4xl font-black text-ink-800">기간을 선택하고 트렌드를 조사하세요</h3>
                  <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-ink-400">
                    방금 수집된 유행과 기본 샘플 유행을 함께 선택할 수 있습니다. 1개에서 3개를 고른 뒤 지역을 선택하세요.
                  </p>
                </div>
                <Badge label={`${collectedTrendGroups.reduce((sum, group) => sum + group.items.length, 0)} real choices`} tone={collectedTrendGroups.length ? 'good' : 'demo'} />
              </div>
              <TrendChoiceGrid groups={mergedTrendGroups} selectedTrendKeys={selectedTrendKeys} onToggle={toggleTrend} />
            </div>
          )}

          {stage === 'trendLoading' && <GeneratorLoading title={`${period} 기준 트렌드를 조사합니다`} subtitle="SNS, Shorts, Reels, 커뮤니티 기반 유행 키워드를 분류 중입니다." />}

          {stage !== 'idle' && stage !== 'trendLoading' && (
            <div className="space-y-4">
              <div className="rounded-[28px] bg-ink-50 p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Trend Survey Complete</div>
                    <h3 className="mt-1 text-3xl font-black text-ink-800">트렌드가 조사되었습니다</h3>
                  </div>
                  <Badge label={period} tone="good" />
                </div>
                <TrendChoiceGrid groups={mergedTrendGroups} selectedTrendKeys={selectedTrendKeys} onToggle={toggleTrend} />
                <div className="mt-5 rounded-[24px] border border-dashed border-ink-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Step 1. Select Trends</div>
                      <h4 className="mt-1 text-xl font-black text-ink-800">조합할 트렌드를 1개에서 3개까지 선택하세요</h4>
                    </div>
                    <Badge label={`${selectedTrends.length}/3 selected`} tone={canAnalyzeRegion ? 'good' : 'demo'} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTrends.length ? selectedTrends.map((trend) => (
                      <span key={trend.key} className="rounded-full bg-black px-4 py-2 text-sm font-black leading-snug text-white">
                        <span className="mr-1.5">{trend.emoji}</span>{trend.name}
                      </span>
                    )) : <span className="text-sm font-bold text-ink-300">아직 선택된 트렌드가 없습니다. 위 키워드를 눌러주세요.</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-ink-100 p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Select Region</div>
                    <h3 className="mt-1 text-2xl font-black text-ink-800">지역을 선택해서 트렌드와 조합하세요</h3>
                    <p className="mt-2 text-sm font-bold text-ink-300">
                      {canAnalyzeRegion ? `${pickedKeyword}를 지역 특산품·전통·행사와 연결합니다.` : '먼저 트렌드를 1개 이상 선택하면 지역 분석을 시작할 수 있습니다.'}
                    </p>
                  </div>
                  {stage === 'regionLoading' && <SpinnerLabel text="지역 분석 중" />}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {regions.map((item) => (
                    <button
                      key={item.region_code}
                      onClick={() => analyzeRegion(item.region_code)}
                      disabled={!canAnalyzeRegion}
                      className={`rounded-full px-4 py-3 text-sm font-black transition ${!canAnalyzeRegion ? 'cursor-not-allowed bg-ink-50 text-ink-200' : region?.region_code === item.region_code ? 'bg-black text-white' : 'bg-ink-50 text-ink-500 hover:bg-coral-50 hover:text-coral-700'}`}
                    >
                      {regionEmoji(item.region_code)} {item.label}
                    </button>
                  ))}
                </div>
                {canAnalyzeRegion && (
                  <button
                    onClick={generateExperience}
                    disabled={experienceLoading}
                    className="mt-4 w-full rounded-2xl bg-black px-4 py-4 text-sm font-black text-white shadow-card transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    {experienceLoading ? 'LLM 카드 생성 중...' : `${region?.label ?? '선택 지역'} 조합으로 LLM ToDo 카드 생성`}
                  </button>
                )}
              </div>
              {experienceLoading && region && (
                <CombiningExperienceLoader
                  selectedTrends={selectedTrends}
                  regionLabel={region.label}
                  regionEmojiText={regionEmoji(region.region_code)}
                />
              )}
              {experienceCard && <ExperiencePokemonCard card={experienceCard} />}

              {(stage === 'regionDone' || stage === 'combining' || stage === 'recommended') && region && (
                <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                  <div className="rounded-[28px] bg-ink-950 p-5 text-white md:p-6">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-coral-200">Region Analysis Complete</div>
                    <h3 className="mt-1 text-3xl font-black">{region.label} 분석 완료</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <EmojiChip emoji="🍱" title="특산품" items={region.specialties} />
                      <EmojiChip emoji="🏮" title="전통" items={region.traditional_culture} />
                      <EmojiChip emoji="🎪" title="진행 행사" items={region.festivals.map((festival) => festival.name)} />
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-ink-100 bg-white p-5">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Combination</div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-6xl">
                      {selectedTrends.map((trend, index) => (
                        <span key={trend.key} className={stage === 'combining' ? 'animate-bounce' : ''} style={{ animationDelay: `${index * 90}ms` }}>{trend.emoji}</span>
                      ))}
                      <span className="text-xl font-black text-ink-300">+</span>
                      <span className={stage === 'combining' ? 'animate-bounce [animation-delay:120ms]' : ''}>{regionEmoji(region.region_code)}</span>
                      <span className="text-xl font-black text-ink-300">+</span>
                      <span className={stage === 'combining' ? 'animate-bounce [animation-delay:240ms]' : ''}>🏮</span>
                    </div>
                    <p className="mt-5 text-center text-base font-black text-ink-700">
                      {stage === 'combining' ? '조합을 연결하고 있습니다' : recommendation}
                    </p>
                  </div>
                </div>
              )}

              {stage === 'recommended' && region && (
                <div className="rounded-[30px] border border-coral-100 bg-coral-50 p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.14em] text-coral-700">Recommended Trend-Do</div>
                      <h3 className="mt-1 text-3xl font-black text-ink-900">{recommendation}</h3>
                      <p className="mt-3 text-base leading-relaxed text-ink-500">
                        {fusionIdea?.story ?? `${pickedKeyword} 유행을 ${region.label}의 특산품/전통시장/행사 경험으로 바꿔, 보는 콘텐츠를 실제 참여형 문화로 전환합니다.`}
                      </p>
                    </div>
                    <Badge label="검수 필요" tone="demo" />
                  </div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
                    <AttentionGraph trend={`${pickedKeywordEmoji} ${pickedKeyword}`} region={region.label} asset={pickedAsset} festival={pickedFestival} />
                    <div className="rounded-[22px] bg-white p-4">
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">XAI Score</div>
                      <ScoreBars items={[['의미 유사도', 91], ['지역 연결성', 86], ['참여 쉬움', 82], ['전통 리믹스', 88], ['안전성', 74]]} />
                      <button
                        onClick={generateExperience}
                        disabled={experienceLoading}
                        className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-sm font-black text-white transition active:scale-[0.98]"
                      >
                        {experienceLoading ? 'LLM 카드 생성 중...' : 'LLM으로 ToDo 카드 만들기'}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setProposalReady(true)}
                    className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-ink-800 shadow-sm ring-1 ring-ink-100 transition active:scale-[0.98]"
                  >
                    지자체 제안 초안도 보기
                  </button>
                  {proposalReady && (
                    <div className="mt-4 rounded-[22px] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">Proposal Draft</div>
                          <h4 className="mt-1 font-black text-ink-800">{region.label} 문화운영팀 제안 메일 초안</h4>
                        </div>
                        <Badge label="ready_to_send 전 단계" tone="demo" />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-500">
                        안녕하세요. TrendDo는 최근 {pickedKeyword} 유행을 {region.label}의 {pickedAsset}와 연결해, 지역 방문과 전통문화 체험으로 전환하는 참여형 챌린지를 제안드립니다.
                        관리자 최종 검수 후 발송 가능한 초안입니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

function CombiningExperienceLoader({
  selectedTrends,
  regionLabel,
  regionEmojiText,
}: {
  selectedTrends: TrendChoice[]
  regionLabel: string
  regionEmojiText: string
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-[30px] bg-black p-5 text-white shadow-card md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-200">LLM Combining</div>
          <h3 className="mt-2 text-3xl font-black leading-tight">선택한 유행과 지역을 조합 중입니다</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/52">
            세대별 설명, 지역 맥락, 전통문화 요소, 안전 문구를 함께 엮어 ToDo 카드로 만들고 있어요.
          </p>
        </div>
        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/70">structured output</div>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-6xl">
        {selectedTrends.map((trend, index) => (
          <div key={trend.key} className="flex flex-col items-center gap-2">
            <span className="animate-bounce" style={{ animationDelay: `${index * 110}ms` }}>{trend.emoji}</span>
            <span className="max-w-[120px] break-keep text-center text-[11px] font-black leading-tight text-white/60">{trend.name}</span>
          </div>
        ))}
        <span className="text-2xl font-black text-white/32">+</span>
        <div className="flex flex-col items-center gap-2">
          <span className="animate-bounce [animation-delay:180ms]">{regionEmojiText}</span>
          <span className="max-w-[120px] break-keep text-center text-[11px] font-black leading-tight text-white/60">{regionLabel}</span>
        </div>
        <span className="text-2xl font-black text-white/32">+</span>
        <div className="flex flex-col items-center gap-2">
          <span className="animate-bounce [animation-delay:300ms]">🏮</span>
          <span className="max-w-[120px] break-keep text-center text-[11px] font-black leading-tight text-white/60">전통문화</span>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-coral-500" />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black text-white/62 sm:grid-cols-4">
        {['세대별 번역', '지역 연결', '안전 검수', 'ToDo 설계'].map((item) => (
          <div key={item} className="rounded-2xl bg-white/10 px-3 py-2 text-center">{item}</div>
        ))}
      </div>
    </div>
  )
}

function buildLocalExperienceFallback(selectedTrends: TrendChoice[], region: AdminState['regionIntelligence'][number]) {
  const trends = selectedTrends.map((trend) => trend.name)
  const fusion = buildFusionIdea(selectedTrends, region)
  return {
    card_title: fusion.title,
    emoji: selectedTrends[0]?.emoji ?? '🏮',
    subtitle: '유행과 지역 소재를 하나의 새 행동으로 융합한 관리자 검수용 카드입니다.',
    local_story: fusion.story,
    region_label: region.label,
    selected_trends: trends,
    local_keywords: [...region.specialties, ...region.traditional_culture, ...region.festivals.map((festival) => festival.name)].slice(0, 5),
    safety_notice: '초상권, 위치정보, 미성년자 개인정보를 노출하지 않고 비공개 인증도 허용하세요.',
    xai: {
      match_score: 82,
      reasons: ['선택한 유행을 짧은 행동으로 바꾸기 쉬움', '지역 키워드와 연결 가능한 인증 포인트가 있음', '세대별 설명으로 접근성 개선 가능'],
      cautions: ['유래를 단정하지 말 것', '지역 문화 요소를 장식처럼만 쓰지 말 것'],
      evidence_refs: ['selected_trends', 'region_keywords'],
    },
    generation_todos: [
      { generation: 'teen', label: '10대', title: `${fusion.title} 쇼츠`, explanation: '핵심 장면만 빠르게 이해하도록 설명합니다.', steps: [{ title: '융합 포인트 보기', body: fusion.action }, { title: '한 컷 실행', body: '완성된 모양이나 장소 분위기를 짧게 기록합니다.' }], estimated_minutes: 15, proof_type: '사진 또는 짧은 문장', tone_note: '짧고 직접적인 말투' },
      { generation: 'adult', label: '30·40대', title: `${fusion.title} 30분 ToDo`, explanation: '시간과 비용이 부담되지 않게 실용적으로 제안합니다.', steps: [{ title: '재료/장소 정하기', body: fusion.action }, { title: '30분 체험', body: '구매, 방문, 제작 중 하나만 실행합니다.' }], estimated_minutes: 30, proof_type: '체크리스트', tone_note: '실용적이고 따뜻한 말투' },
      { generation: 'senior', label: '50·60대', title: `${fusion.title} 쉽게 이해하기`, explanation: '낯선 유행어를 풀어서 설명하고 익숙한 지역 소재와 연결합니다.', steps: [{ title: '유행 뜻 읽기', body: `${trends[0] ?? '이 유행'}이 무엇인지 쉬운 설명을 먼저 읽습니다.` }, { title: '익숙한 소재로 바꾸기', body: fusion.action }], estimated_minutes: 25, proof_type: '비공개 완료 체크', tone_note: '자세하고 친절한 말투' },
      { generation: 'family', label: '온 가족', title: '역할 나눠 함께하기', explanation: '세대가 함께 이해하고 참여하도록 역할을 나눕니다.', steps: [{ title: '역할 정하기', body: '설명 담당, 준비 담당, 기록 담당을 나눕니다.' }, { title: '같이 인증', body: '얼굴 공개 없이 결과물 중심으로 기록합니다.' }], estimated_minutes: 35, proof_type: '가족 기록 카드', tone_note: '공동체 중심 말투' },
      { generation: 'foreign', label: '외국인', title: 'Local K-culture Tryout', explanation: 'K-culture context is explained simply without assuming prior knowledge.', steps: [{ title: 'Read context', body: 'Check what the trend means in simple language.' }, { title: 'Try locally', body: 'Connect it with one local food, place, or festival.' }], estimated_minutes: 30, proof_type: 'photo or short note', tone_note: 'simple English-friendly tone' },
    ],
    admin_gate: { status: 'needs_review', review_points: ['세대별 설명에 고정관념이 없는지 확인', '지역 연결이 억지스럽지 않은지 확인', '안전 문구 확인'] },
    confidence: 0.62,
  }
}

function buildFusionIdea(selectedTrends: TrendChoice[], region: AdminState['regionIntelligence'][number]) {
  const trendNames = selectedTrends.map((trend) => trend.name)
  const trendText = trendNames.join(' ')
  const specialty = region.specialties[0] ?? '지역 특산품'
  const tradition = region.traditional_culture[0] ?? '지역 전통문화'
  const festival = region.festivals[0]?.name ?? '지역 축제'
  const asset = region.assets[0]?.name ?? '지역 공간'
  const dessertBase = /두쫀쿠|두바이|쿠키|디저트|케이크|빵|떡|젤리|소금빵|버터/.test(trendText)
  const spicyFood = /불닭|냉면|쭈꾸미|비빔밥|음식|먹방/.test(trendText)
  const movement = /러닝|운동|크루|버터런|산책|투어|직관/.test(trendText)
  const photo = /사진|포토|릴스|쇼츠|영상|직관샷|ai/.test(trendText)
  const craft = /꾸미기|말랑|공방|자개|한지|민화|손글씨|만들기/.test(trendText)

  if (dessertBase) {
    return {
      title: `${specialty} 쫀득 디저트 챌린지`,
      story: `${trendNames.join(', ')}를 그대로 소개하지 않고, ${region.label}의 ${specialty} 식감·맛·색을 쿠키/디저트 형태에 녹여 새 간식 만들기 경험으로 바꿉니다. 수행 장소는 ${asset}처럼 먹거리나 재료 구매 근거가 있는 공간을 우선 사용합니다.`,
      action: `${specialty}의 맛이나 식감을 쿠키, 떡, 크림, 토핑 중 하나로 바꿔 직접 만들어봅니다.`,
    }
  }
  if (spicyFood) {
    return {
      title: `${specialty} 로컬 한입 리믹스`,
      story: `${trendNames.join(', ')}의 자극적이고 따라 하기 쉬운 음식 놀이를 ${region.label}의 ${specialty}와 연결해, 지역 재료를 한입 레시피나 시장 미션으로 재해석합니다.`,
      action: `${specialty}를 한입 레시피, 시장 구매 미션, 맛 비교 기록 중 하나로 바꿔봅니다.`,
    }
  }
  if (movement) {
    return {
      title: `${tradition} 로컬 무브 코스`,
      story: `${trendNames.join(', ')}의 움직임과 참여성을 ${region.label}의 ${tradition}, ${festival} 동선에 녹여 보는 운동이 아니라 걷고 기록하는 문화 코스로 바꿉니다.`,
      action: `${tradition}과 연결된 장소를 짧게 걷고, 코스의 한 장면이나 체크리스트를 인증합니다.`,
    }
  }
  if (photo) {
    return {
      title: `${tradition} 한 컷 리믹스`,
      story: `${trendNames.join(', ')}의 촬영/기록 문법을 ${region.label}의 ${tradition}와 결합해, 장소를 배경으로 소비하지 않고 지역 이야기를 담는 한 컷 미션으로 바꿉니다.`,
      action: `${tradition}의 색, 문양, 장소감 중 하나를 사진 구도나 짧은 영상 장면에 반영합니다.`,
    }
  }
  if (craft) {
    return {
      title: `${tradition} 손작업 리믹스`,
      story: `${trendNames.join(', ')}의 만들기/꾸미기 감각을 ${region.label}의 ${tradition}와 연결해, 지역 공예나 전통 색채를 직접 손으로 재해석하는 체험으로 바꿉니다.`,
      action: `${tradition}에서 온 색, 문양, 소재 중 하나를 작은 소품이나 기록 카드에 적용합니다.`,
    }
  }
  return {
    title: `${tradition} 트렌드 리믹스`,
    story: `${trendNames.join(', ')}를 단순히 ${region.label}에 붙이지 않고, ${tradition}와 ${specialty}를 행동 규칙과 인증 방식 안에 녹여 새로운 지역 참여형 문화 경험으로 바꿉니다.`,
    action: `${tradition}나 ${specialty} 중 하나를 선택해 유행의 행동 방식 안에 직접 넣어봅니다.`,
  }
}

function generationEmoji(generation: string) {
  return ({ teen: '🧑‍🎤', adult: '☕', senior: '🌿', family: '👨‍👩‍👧', foreign: '🌐' } as Record<string, string>)[generation] ?? '✨'
}

function ExperiencePokemonCard({ card }: { card: any }) {
  return (
    <div className="mt-5 rounded-[34px] bg-[#111111] p-3 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.9)]">
      <div className="rounded-[28px] border-[3px] border-[#F7D56B] bg-gradient-to-br from-[#FFF8D8] via-white to-[#FFE0D2] p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">AI Experience Card · 검수 필요</div>
            <h3 className="mt-2 max-w-3xl break-keep text-3xl font-black leading-tight text-ink-950 md:text-4xl">
              <span className="mr-2">{card.emoji}</span>{card.card_title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-ink-500">{card.subtitle}</p>
          </div>
          <div className="rounded-2xl bg-black px-4 py-3 text-right text-white">
            <div className="text-[10px] font-black uppercase text-white/45">Match</div>
            <div className="text-3xl font-black">{card.xai?.match_score ?? 0}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
          <div className="rounded-[24px] bg-black p-4 text-white">
            <div className="flex flex-wrap gap-2">
              {(card.selected_trends ?? []).map((trend: string) => <span key={trend} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">{trend}</span>)}
            </div>
            <p className="mt-4 text-sm font-bold leading-relaxed text-white/68">{card.local_story}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(card.local_keywords ?? []).map((keyword: string) => <span key={keyword} className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-ink-900">🏷 {keyword}</span>)}
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs font-bold leading-relaxed text-white/62">{card.safety_notice}</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(card.generation_todos ?? []).map((todo: any) => (
              <div key={todo.generation} className="rounded-[24px] border border-amber-200 bg-white p-4 shadow-[0_14px_40px_-34px_rgba(7,13,36,0.9)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.12em] text-coral-600">{generationEmoji(todo.generation)} {todo.label}</div>
                    <h4 className="mt-1 break-keep text-lg font-black leading-tight text-ink-900">{todo.title}</h4>
                  </div>
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-black text-ink-500">{todo.estimated_minutes}분</span>
                </div>
                <p className="mt-2 text-xs font-bold leading-relaxed text-ink-500">{todo.explanation}</p>
                <div className="mt-3 space-y-2">
                  {(todo.steps ?? []).map((step: any, index: number) => (
                    <div key={`${todo.generation}-${step.title}`} className="rounded-2xl bg-ink-50 p-3">
                      <div className="text-[11px] font-black text-ink-900">{index + 1}. {step.title}</div>
                      <div className="mt-0.5 text-[11px] font-bold leading-relaxed text-ink-400">{step.body}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] font-black text-coral-600">인증: {todo.proof_type}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <List title="AI가 연결한 이유" items={card.xai?.reasons ?? []} />
          <List title="검수 포인트" items={[...(card.xai?.cautions ?? []), ...(card.admin_gate?.review_points ?? [])]} />
        </div>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function regionEmoji(code: string) {
  return ({
    seoul: '🏙️',
    suwon: '🏯',
    gangneung: '🌊',
    jeonju: '🍚',
    busan: '🌉',
    jeju: '🍊',
    andong: '🎭',
    jinju: '🏮',
    boryeong: '🌊',
    gwangju: '🎨',
  } as Record<string, string>)[code] ?? '📍'
}

function GeneratorLoading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[28px] bg-ink-950 p-6 text-center text-white">
      <div>
        <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-white/20 border-t-coral-400" />
        <h3 className="mt-6 text-4xl font-black">{title}</h3>
        <p className="mt-3 text-base font-bold text-white/54">{subtitle}</p>
      </div>
    </div>
  )
}

function SpinnerLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-black text-white">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-coral-300" />
      {text}
    </span>
  )
}

function EmojiChip({ emoji, title, items }: { emoji: string; title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] bg-white/10 p-4">
      <div className="text-4xl">{emoji}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/42">{title}</div>
      <div className="mt-2 text-sm font-bold leading-relaxed text-white/82">{items.slice(0, 3).join(', ') || '데이터 수집 중'}</div>
    </div>
  )
}

function AttentionGraph({ trend, region, asset, festival }: { trend: string; region: string; asset: string; festival: string }) {
  const nodes = [
    ['🍪', trend, 'left-[7%] top-[18%]'],
    ['📍', region, 'right-[9%] top-[18%]'],
    ['🏪', asset, 'left-[13%] bottom-[16%]'],
    ['🎪', festival, 'right-[7%] bottom-[16%]'],
  ]
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[26px] bg-white p-4">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 250" preserveAspectRatio="none">
        <path d="M100 55 C210 70 300 70 420 55" stroke="#FF7D4F" strokeWidth="3" strokeDasharray="8 8" fill="none" opacity="0.7" />
        <path d="M110 190 C210 120 305 120 410 190" stroke="#111827" strokeWidth="3" strokeDasharray="8 8" fill="none" opacity="0.55" />
        <path d="M100 55 C130 110 130 150 110 190" stroke="#FF7D4F" strokeWidth="3" fill="none" opacity="0.35" />
        <path d="M420 55 C390 112 390 150 410 190" stroke="#FF7D4F" strokeWidth="3" fill="none" opacity="0.35" />
      </svg>
      {nodes.map(([emoji, label, pos]) => (
        <div key={label} className={`absolute ${pos} max-w-[280px] rounded-[22px] border border-ink-100 bg-white px-4 py-3 shadow-card`}>
          <div className="text-4xl">{emoji}</div>
          <div className="mt-2 text-sm font-black text-ink-800">{label}</div>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white shadow-card">
        attention<br />link
      </div>
    </div>
  )
}

function ScoreBars({ items }: { items: [string, number][] }) {
  return (
    <div className="mt-3 space-y-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="flex justify-between text-[11px] font-black text-ink-400"><span>{label}</span><span>{value}</span></div>
          <div className="mt-1 h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full bg-black" style={{ width: `${value}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

function LiveCollectionLoop({
  state,
  autoCollect,
  cycleLog,
  onToggleAuto,
  onCycle,
}: {
  state: AdminState
  autoCollect: boolean
  cycleLog: any[]
  onToggleAuto: () => void
  onCycle: () => void
}) {
  const latestRun = state.aiRuns.find((run) => run.module_name === 'continuousCollectionCycle')
  const topSignals = [...state.trends]
    .sort((a, b) => (b.surge_score?.total ?? 0) - (a.surge_score?.total ?? 0))
    .slice(0, 5)
  const stream: any[] = cycleLog.length ? cycleLog : latestRun ? [latestRun.output_json] : []

  return (
    <Panel title="실시간 수집 루프">
      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="rounded-[28px] bg-black p-5 text-white">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Collector</div>
              <div className="mt-2 text-2xl font-black">{autoCollect ? 'LIVE' : 'READY'}</div>
            </div>
            <span className={`h-4 w-4 rounded-full ${autoCollect ? 'animate-pulse bg-coral-500 shadow-[0_0_24px_rgba(255,92,42,0.9)]' : 'bg-white/22'}`} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/54">
            12초마다 provider 수집, 중복 제거, 점수 재계산, 클러스터 갱신, Analytics Snapshot, AI Ops 기록을 수행합니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Action onClick={onToggleAuto}>{autoCollect ? '루프 중지' : '루프 시작'}</Action>
            <Action onClick={onCycle}>한 번 실행</Action>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="font-black text-white/42">Trends</div>
              <div className="mt-1 text-xl font-black">{state.trends.length}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="font-black text-white/42">Clusters</div>
              <div className="mt-1 text-xl font-black">{state.trendClusters.length}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-ink-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-ink-800">Live Trend Signals</h3>
              <Badge label={state.runtime.hasRealApi ? 'real+demo' : 'demo/mock'} tone={state.runtime.hasRealApi ? 'good' : 'demo'} />
            </div>
            <div className="mt-4 space-y-3">
              {topSignals.map((trend) => (
                <div key={trend.id}>
                  <div className="flex justify-between gap-3 text-xs font-bold text-ink-400">
                    <span className="truncate">{trend.title}</span>
                    <span>{trend.surge_score?.total ?? 0}</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-3 rounded-full bg-black transition-all duration-700" style={{ width: `${Math.max(6, trend.surge_score?.total ?? 0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-ink-100 bg-ink-50 p-4">
            <h3 className="text-sm font-black text-ink-800">Update Stream</h3>
            <div className="mt-4 space-y-2">
              {stream.length ? stream.slice(0, 5).map((cycle, index) => (
                <div key={`${cycle.collected_at ?? index}-${index}`} className="rounded-2xl bg-white p-3 text-xs shadow-[0_10px_30px_-26px_rgba(7,13,36,0.7)]">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-ink-800">cycle #{stream.length - index}</strong>
                    <Badge label={cycle.provenance_label ?? 'derived'} tone={cycle.provenance_label === 'real_api' ? 'good' : 'demo'} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-ink-400">
                    <span>+T {cycle.inserted_trends ?? 0}</span>
                    <span>+A {cycle.inserted_assets ?? 0}</span>
                    <span>C {cycle.clusters ?? 0}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-ink-300">{cycle.collected_at ? new Date(cycle.collected_at).toLocaleTimeString() : 'latest AI Ops'}</div>
                </div>
              )) : <Empty text="루프 시작을 누르면 수집/업데이트 로그가 여기에 쌓입니다." />}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function CulturalPipelinePanel({ result }: { result: any }) {
  return (
    <Panel title="하이브리드 문화 전환 파이프라인">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="rounded-[28px] bg-black p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Real Ops Pipeline</div>
          <h3 className="mt-2 text-2xl font-black leading-tight">수집 → 지역 조합<br />→ 위험 탐지 → 카드/ToDo</h3>
          <p className="mt-3 text-xs leading-relaxed text-white/54">
            TourAPI/공공데이터/OpenAI 키가 있으면 실제 API를 호출하고, 없으면 demo/mock 표시를 유지한 채 같은 운영 루프를 실행합니다.
          </p>
          <div className="mt-4">
            <Badge label={result?.provenance_label ?? 'not run'} tone={result?.provenance_label === 'real_api' ? 'good' : 'demo'} />
          </div>
        </div>
        {result ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="rounded-[24px] border border-ink-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">Target Trend</div>
                  <h3 className="mt-1 text-xl font-black text-ink-800">{result.targetTrend?.title}</h3>
                </div>
                <Badge label={result.safetyReview?.risk_level ?? 'safety'} tone={result.safetyReview?.risk_level === 'low' ? 'good' : 'demo'} />
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <Metric label="생성 챌린지" value={result.challenge?.title ?? '-'} sub="needs_review로 시작" />
                <Metric label="지역 매칭" value={result.matches?.length ?? 0} sub="Local Match candidates" />
                <Metric label="카드 생성" value={result.cardPackage?.safety_gate?.allow_card_generation ? '허용' : '차단/검수'} sub={result.cardPackage?.safety_gate?.risk_level ?? 'safety gate'} />
                <Metric label="세대별 카드" value={result.cardPackage?.audience_cards?.length ?? 0} sub="age-band variants" />
              </div>
              {result.cardPackage && (
                <div className="mt-4 rounded-[22px] bg-coral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black text-ink-800">{result.cardPackage.base_card?.title}</h3>
                    <Badge label={result.cardPackage.safety_gate?.risk_level ?? 'safety'} tone={result.cardPackage.safety_gate?.risk_level === 'low' ? 'good' : 'demo'} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{result.cardPackage.base_card?.one_line_summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(result.cardPackage.audience_cards ?? []).map((card: any) => (
                      <span key={card.audience} className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink-500">{audienceLabel(card.audience)}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <List title="실행 단계" items={result.steps ?? []} />
              </div>
            </div>
            <div className="rounded-[24px] border border-ink-100 bg-ink-50 p-4">
              <h3 className="text-sm font-black text-ink-800">사용자 피드 추천 Top</h3>
              <div className="mt-3 space-y-2">
                {(result.recommendations ?? []).slice(0, 4).map((item: any) => (
                  <div key={item.trend_id} className="rounded-2xl bg-white p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="truncate text-ink-800">{item.title}</strong>
                      <span className="font-black text-coral-600">{item.recommendation_score}</span>
                    </div>
                    <div className="mt-1 font-bold text-ink-300">{decisionLabel(item.decision)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : <Empty text="상단의 하이브리드 파이프라인 버튼을 누르면 seed+real API 수집, 지역 조합, 위험 탐지, 카드/ToDo 생성 결과가 여기에 표시됩니다." />}
      </div>
    </Panel>
  )
}

function RegionMapIntelligence({
  state,
  selectedRegionCode,
  onSelectRegion,
}: {
  state: AdminState
  selectedRegionCode: string
  onSelectRegion: (regionCode: string) => void
}) {
  const regions = state.regionIntelligence ?? []
  const selected = regions.find((region) => region.region_code === selectedRegionCode) ?? regions[0]

  return (
    <Panel title="지역 문화 지도 / 트렌드 연결">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-ink-100 bg-[#F7F8FB] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Interactive Culture Map</div>
              <h3 className="mt-1 text-xl font-black text-ink-800">지역을 클릭해 특산품·전통문화·축제·트렌드 연결 보기</h3>
            </div>
            <Badge label="user-map svg" tone="good" />
          </div>
          <AdminCultureFlowMap regions={regions} selected={selected} onSelectRegion={onSelectRegion} />
        </div>
        <RegionDetailCard region={selected} />
      </div>
    </Panel>
  )
}

function AdminCultureFlowMap({
  regions,
  selected,
  onSelectRegion,
}: {
  regions: AdminState['regionIntelligence']
  selected?: AdminState['regionIntelligence'][number]
  onSelectRegion: (regionCode: string) => void
}) {
  const markerRegions = regions
    .filter((region) => region.region_code && region.label && region.region_code !== 'kr')
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 14)
  const flows = markerRegions.slice(0, 7).map((region, index) => [markerRegions[index + 1] ?? markerRegions[0], region] as const)

  return (
    <div className="mt-4 overflow-hidden rounded-[28px] bg-ink-800 text-white shadow-card">
      <div className="relative aurora-mesh">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-800/20 to-ink-800/85" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 px-5 pt-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-coral-200">K-Culture Ops Flow Map</div>
            <h3 className="mt-1 text-xl font-black leading-tight">유행이 지역 문화로 연결되는 길</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/60">지역 자산·축제·트렌드</div>
            <div className="text-2xl font-black">{formatCount(regions.reduce((sum, region) => sum + region.assets.length + region.festivals.length, 0))}</div>
          </div>
        </div>

        <svg viewBox="80 50 260 530" className="relative z-10 mx-auto block h-[480px] w-full">
          <defs>
            <linearGradient id="adminLand" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFC0A4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#A4ADCC" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#23305C" stopOpacity="0.72" />
            </linearGradient>
            <radialGradient id="adminRidge" cx="40%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="adminFlow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0" />
              <stop offset="50%" stopColor="#FF7D4F" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFC0A4" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="adminHaze" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7D4F" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FF5C2A" stopOpacity="0" />
            </radialGradient>
            <filter id="adminSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={KOREA_PATH} fill="url(#adminLand)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d={KOREA_PATH} fill="url(#adminRidge)" />
          <ellipse cx="160" cy="525" rx="22" ry="14" fill="url(#adminLand)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

          {flows.map(([from, to], index) => {
            if (!from || !to) return null
            const ax = 80 + (from.map_position.x / 100) * 260
            const ay = 70 + (from.map_position.y / 100) * 460
            const bx = 80 + (to.map_position.x / 100) * 260
            const by = 70 + (to.map_position.y / 100) * 460
            const d = `M${ax} ${ay} Q ${(ax + bx) / 2} ${(ay + by) / 2 - 22} ${bx} ${by}`
            return (
              <g key={`${from.region_code}-${to.region_code}`}>
                <path d={d} stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
                <path d={d} stroke="url(#adminFlow)" strokeWidth="2.2" fill="none" className="flow-dash" style={{ animationDelay: `${index * 0.2}s` }} />
              </g>
            )
          })}

          {markerRegions.map((region) => {
            const x = 80 + (region.map_position.x / 100) * 260
            const y = 70 + (region.map_position.y / 100) * 460
            const r = Math.max(7, Math.min(23, Math.log10(region.opportunity_score + 10) * 9))
            const isActive = selected?.region_code === region.region_code
            return (
              <g key={region.region_code} onClick={() => onSelectRegion(region.region_code)} className="cursor-pointer">
                <circle cx={x} cy={y} r={r * 2.4} fill="url(#adminHaze)" />
                <circle cx={x} cy={y} r={6} fill="none" stroke="#FF7D4F" strokeWidth="1.4" className="pin-pulse" />
                <circle cx={x} cy={y} r={6} fill="none" stroke="#FF7D4F" strokeWidth="1.2" className="pin-pulse pin-pulse-2" />
                <circle cx={x} cy={y} r={6} fill="none" stroke="#FFC0A4" strokeWidth="1" className="pin-pulse pin-pulse-3" />
                <circle cx={x} cy={y} r={r} fill={isActive ? '#FF5C2A' : '#111827'} stroke={isActive ? '#FFF3EE' : 'rgba(255,255,255,0.85)'} strokeWidth={isActive ? 3 : 2} filter="url(#adminSoftGlow)" />
                <circle cx={x} cy={y} r={r * 0.42} fill="#FFF3EE" opacity="0.85" />
                <text x={x} y={y - r - 8} textAnchor="middle" fontSize="11" fontWeight="800" fill="white" filter="url(#adminSoftGlow)">
                  {region.label}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-white/10 px-4 py-3">
          {markerRegions.slice(0, 3).map((region, index) => (
            <button key={region.region_code} onClick={() => onSelectRegion(region.region_code)} className="rounded-2xl bg-white/8 px-3 py-2 text-left backdrop-blur-sm">
              <div className="text-[10px] text-coral-200">#{index + 1} {region.label}</div>
              <div className="mt-0.5 text-sm font-black text-white">기회 {region.opportunity_score}</div>
              <div className="mt-0.5 text-[10px] leading-snug text-white/70">{region.linked_trends[0]?.title ?? '연결 트렌드 수집 중'}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 text-sm font-bold text-ink-400">
        핀을 누르면 오른쪽에 특산품, 전통 문화, 진행 축제, 최신 트렌드 연결이 표시됩니다.
      </div>
    </div>
  )
}

function RegionDetailCard({ region }: { region?: AdminState['regionIntelligence'][number] }) {
  if (!region) return <Empty text="지역 데이터가 아직 없습니다. 지역 자산 수집 또는 찐 파이프라인을 실행하세요." />
  return (
    <div className="rounded-[28px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Region Intelligence</div>
          <h3 className="mt-1 text-2xl font-black text-ink-800">{region.label}</h3>
          <p className="mt-1 text-xs font-bold text-ink-300">기회 점수 {region.opportunity_score} · {region.region_code}</p>
        </div>
        <Badge label={region.provenance_label} tone={region.provenance_label === 'real_api' ? 'good' : 'demo'} />
      </div>
      <div className="mt-4 grid gap-3">
        <TagSection title="특산품" items={region.specialties} dark />
        <TagSection title="전통 문화" items={region.traditional_culture} />
        <List title="현재/예정 지역 축제" items={region.festivals.map((festival) => `${festival.name} (${festival.start_date ?? '날짜 미정'}~${festival.end_date ?? '상시'})`)} />
        <List title="문화 자산" items={region.assets.map((asset) => `${asset.name} · ${asset.asset_type}`)} />
      </div>
      <div className="mt-4">
        <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">최신 트렌드 연결</div>
        <div className="mt-2 space-y-2">
          {region.linked_trends.map((trend) => (
            <div key={trend.trend_id} className="rounded-2xl bg-ink-50 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <strong className="truncate text-ink-800">{trend.title}</strong>
                <span className="font-black text-coral-600">{trend.score}</span>
              </div>
              <div className="mt-1 text-[11px] font-bold text-ink-300">{decisionLabel(trend.decision)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TagSection({ title, items, dark }: { title: string; items: string[]; dark?: boolean }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-2 py-1 text-[11px] font-black ${dark ? 'bg-black text-white' : 'bg-coral-50 text-coral-700'}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function CultureRemixBridgeOps({ state }: { state: AdminState }) {
  const cultureCategories = ['food', 'photo', 'craft', 'challenge', 'activity', 'shorts_culture', 'media']
  const trendPool = state.trends.filter((trend) => cultureCategories.includes(trend.category)).slice(0, 8)
  const festivalAssets = state.localAssets.filter((asset) => asset.asset_type === 'festival').length
  const marketAssets = state.localAssets.filter((asset) => asset.asset_type === 'market').length
  const workshopAssets = state.localAssets.filter((asset) => asset.asset_type === 'workshop' || asset.asset_type === 'culture_facility').length
  const heritageAssets = state.localAssets.filter((asset) => asset.asset_type === 'heritage').length
  const remixRows = [
    ['유행 디저트 만들기', '약과, 떡, 전통 차와 결합', '전통시장 재료 구매 + 가족 레시피 인증'],
    ['포토 챌린지', '한옥, 시장, 지역 명소와 결합', '타인 초상권 검수 후 장소 방문 인증'],
    ['패션 챌린지', '한복 소품, 자개, 전통 문양과 결합', '공방/소상공인 체험 패키지 연결'],
    ['손글씨·꾸미기 유행', '민화, 서예, 전통 색채와 결합', '독립서점·전시·원데이 클래스 연결'],
    ['댄스 챌린지', '지역 축제, 전통 장단, 생활 체조와 결합', '축제장 안전 동선 + 세대별 난이도 조절'],
  ]
  const kCultureMetrics = [
    ['지역별 참여 수', state.analytics.total_place_clicks + state.analytics.total_map_opens],
    ['세대별 참여 비율', Object.keys(state.analytics.segment_breakdown_json ?? {}).length || 5],
    ['전통문화 리믹스 수', state.challenges.filter((challenge) => challenge.heritage_remix).length],
    ['지역 상권 연결 수', state.localMatches.length],
    ['문화 잔존율', `${state.analytics.completion_rate}%`],
  ]

  return (
    <Panel title="전통문화 리믹스 / 지역 문화 연결 / K-Culture Map">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-[26px] border border-ink-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Heritage Remix Card</div>
                <h3 className="mt-1 text-lg font-black text-ink-800">오늘의 유행 안에 전통문화 넣기</h3>
              </div>
              <Badge label="needs admin review" tone="demo" />
            </div>
            <div className="mt-3 overflow-hidden rounded-[20px] border border-ink-100">
              <div className="grid grid-cols-[0.8fr_1fr_1.1fr] bg-ink-900 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-white/62">
                <span>기존 유행</span>
                <span>전통문화 리믹스</span>
                <span>운영 연결</span>
              </div>
              {remixRows.map(([trend, remix, operation]) => (
                <div key={trend} className="grid grid-cols-[0.8fr_1fr_1.1fr] gap-3 border-t border-ink-100 px-3 py-3 text-xs leading-relaxed">
                  <strong className="text-ink-800">{trend}</strong>
                  <span className="text-ink-500">{remix}</span>
                  <span className="text-ink-400">{operation}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-ink-100 bg-white p-4">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Real-Time Trend → Next Culture Experience</div>
            <h3 className="mt-1 text-lg font-black text-ink-800">실시간 유행을 다음 문화 경험으로 전환</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {trendPool.slice(0, 6).map((trend) => (
                <div key={trend.id} className="rounded-2xl bg-ink-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm text-ink-800">{trend.title}</strong>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-coral-600">{trend.category}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-400">{trend.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(state.userFeedRecommendations.find((item) => item.trend_id === trend.id)?.linked_assets ?? []).slice(0, 2).map((asset) => (
                      <span key={asset.id} className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink-500">{asset.region_code} · {asset.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[26px] bg-black p-5 text-white">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Local Bridge Inventory</div>
            <h3 className="mt-2 text-2xl font-black leading-tight">지역 공간을<br />참여형 유행으로</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniDarkMetric label="전통시장" value={marketAssets} />
              <MiniDarkMetric label="공방/시설" value={workshopAssets} />
              <MiniDarkMetric label="지역 축제" value={festivalAssets} />
              <MiniDarkMetric label="전통 자산" value={heritageAssets} />
            </div>
          </div>
          <div className="rounded-[26px] border border-ink-100 bg-white p-4">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">K-Culture Map Metrics</div>
            <div className="mt-3 space-y-2">
              {kCultureMetrics.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-ink-50 px-3 py-2">
                  <span className="text-xs font-black text-ink-400">{label}</span>
                  <span className="text-sm font-black text-ink-800">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              조회수 대신 지역 방문, 세대 참여, 전통 요소 재해석, 문화 잔존율을 운영 지표로 봅니다.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function MiniDarkMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="text-[10px] font-black text-white/42">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  )
}

function CultureConversionGate({ state }: { state: AdminState }) {
  const top = state.userFeedRecommendations?.slice(0, 5) ?? []
  const recommended = top.filter((item) => item.decision === 'recommend').length
  const festivals = state.localAssets.filter((asset) => asset.asset_type === 'festival')
  const cultureCategories = ['food', 'travel', 'activity', 'shorts_culture', 'challenge', 'media']
  const latestRealTrends = state.trends
    .filter((trend) => trend.provenance_label === 'real_api' && cultureCategories.includes(trend.category))
    .slice(0, 4)
  const latestCultureTrends = (latestRealTrends.length ? latestRealTrends : state.trends.filter((trend) => cultureCategories.includes(trend.category))).slice(0, 4)
  return (
    <Panel title="문화 전환 게이트 / 사용자 피드 추천">
      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="rounded-[28px] bg-black p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">TrendDo Mission</div>
          <h3 className="mt-2 text-2xl font-black leading-tight">보는 유행을<br />해보는 문화로</h3>
          <p className="mt-3 text-xs leading-relaxed text-white/54">
            세대별 접근성, 행동 전환성, 지역·전통 연결성, 문화 잔존 데이터를 합쳐 사용자 화면 제안 여부를 추천합니다.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="text-[10px] font-black text-white/42">추천 후보</div>
              <div className="mt-1 text-2xl font-black">{recommended}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="text-[10px] font-black text-white/42">축제 자산</div>
              <div className="mt-1 text-2xl font-black">{festivals.length}</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/10 p-3">
            <div className="text-[10px] font-black text-white/42">실시간 트렌드 소스</div>
            <div className="mt-1 text-sm font-black">YouTube · Naver DataLab · Seed Corpus</div>
            <div className="mt-1 text-[11px] text-white/52">영상 발견 신호와 검색 관심도 검증을 결합해 문화 전환형 유행만 선별</div>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-[24px] border border-ink-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.14em] text-ink-300">Latest Live Trends</div>
                <h3 className="mt-1 text-lg font-black text-ink-800">카테고리별 최신 유행 → 문화 전환 후보</h3>
              </div>
              <Badge label={latestRealTrends.length ? `${latestRealTrends.length} real_api` : 'demo_seed category'} tone={latestRealTrends.length ? 'good' : 'demo'} />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {latestCultureTrends.length ? latestCultureTrends.map((trend) => (
                <div key={trend.id} className="rounded-2xl bg-ink-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm text-ink-800">{trend.title}</strong>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-coral-600">{trend.category}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-400">{trend.description}</p>
                </div>
              )) : <Empty text="트렌드 수집 버튼을 누르면 음식/여행/액티비티/숏츠 소비문화 카테고리별 유행을 가져옵니다." />}
            </div>
          </div>
          {top.map((item) => (
            <div key={item.trend_id} className="rounded-[24px] border border-ink-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-ink-800">{item.title}</h3>
                    <Badge label={decisionLabel(item.decision)} tone={item.decision === 'recommend' ? 'good' : 'demo'} />
                    <Badge label={item.provenance_label} tone={item.provenance_label === 'real_api' ? 'good' : 'demo'} />
                  </div>
                  <div className="mt-1 text-xs font-bold text-ink-300">사용자 피드 추천 점수 {item.recommendation_score}</div>
                </div>
                <div className="text-3xl font-black text-coral-600">{item.recommendation_score}</div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                {Object.entries(item.goalScores).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[10px] font-black uppercase text-ink-300">{goalLabel(key)}</div>
                    <div className="mt-1 h-2 rounded-full bg-ink-100">
                      <div className="h-2 rounded-full bg-black" style={{ width: `${value}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-ink-400">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs font-black text-ink-300">연결 지역·전통문화 자산</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.linked_assets.map((asset) => (
                      <span key={asset.id} className="rounded-full bg-ink-50 px-2 py-1 text-[11px] font-black text-ink-500">{asset.region_code} · {asset.name}</span>
                    ))}
                  </div>
                </div>
                <List title="관리자 액션" items={item.required_actions} />
              </div>
              <ProblemAxisTable axes={item.problem_axis ?? []} />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function ProblemAxisTable({ axes }: { axes: { axis: string; feature: string; logic: string; score: number }[] }) {
  if (!axes.length) return null
  return (
    <div className="mt-4 overflow-hidden rounded-[22px] border border-ink-100">
      <div className="grid grid-cols-[0.85fr_1.1fr_1.2fr_64px] bg-ink-900 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-white/62">
        <span>발제문 문제 축</span>
        <span>TrendDo 대응 기능</span>
        <span>해결 논리</span>
        <span className="text-right">점수</span>
      </div>
      {axes.map((axis) => (
        <div key={axis.axis} className="grid grid-cols-[0.85fr_1.1fr_1.2fr_64px] gap-3 border-t border-ink-100 bg-white px-3 py-3 text-[11px] leading-relaxed">
          <strong className="text-ink-800">{axis.axis}</strong>
          <span className="text-ink-500">{axis.feature}</span>
          <span className="text-ink-400">{axis.logic}</span>
          <span className="text-right text-sm font-black text-coral-600">{axis.score}</span>
        </div>
      ))}
    </div>
  )
}

function FestivalCalendarOps({ state }: { state: AdminState }) {
  const festivals = state.localAssets
    .filter((asset) => asset.asset_type === 'festival')
    .slice()
    .sort((a, b) => String(a.start_date ?? '').localeCompare(String(b.start_date ?? '')))
  const activeLike = festivals.filter((asset) => isFestivalActive(asset.start_date, asset.end_date)).length
  return (
    <Panel title="대한민국 구석구석 축제 달력 기반">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="rounded-[26px] bg-black p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">VisitKorea Ref</div>
          <div className="mt-2 text-3xl font-black">{festivals.length}</div>
          <p className="mt-2 text-xs leading-relaxed text-white/54">
            월별 축제 달력 구조를 참고해 진행 중/예정 축제를 지역 문화 자산으로 수집하고 트렌드 매칭에 사용합니다.
          </p>
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs">
            <div className="font-black text-white/42">진행/시즌 후보</div>
            <div className="mt-1 text-xl font-black">{activeLike}</div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {festivals.slice(0, 6).map((festival) => (
            <div key={festival.id} className="rounded-[22px] border border-ink-100 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-ink-800">{festival.name}</h3>
                  <div className="mt-1 text-xs font-bold text-ink-300">{festival.region_code} · {festival.start_date ?? '날짜 미정'} ~ {festival.end_date ?? '상시'}</div>
                </div>
                <Badge label={festival.provenance_label} tone={festival.provenance_label === 'real_api' ? 'good' : 'demo'} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-400">{festival.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function isFestivalActive(start?: string, end?: string) {
  const now = new Date()
  const s = start ? new Date(start) : undefined
  const e = end ? new Date(end) : undefined
  if (s && e) return s <= now && now <= e
  if (s) return s >= new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return false
}

function decisionLabel(decision: string) {
  if (decision === 'recommend') return '사용자 제안 추천'
  if (decision === 'hold') return '보류'
  return '제안 비추천'
}

function goalLabel(key: string) {
  return ({
    cultural_accessibility: '문화 접근성',
    digital_to_action: '행동 전환',
    local_traditional_connection: '지역·전통 연결',
    culture_retention_data: '문화 잔존 데이터',
  } as Record<string, string>)[key] ?? key
}

function OpsReadiness({ state }: { state: AdminState }) {
  const checks = [
    { label: '트렌드 수집', done: state.trends.length >= USER_APP_TRENDS.length, value: `${state.trends.length}건` },
    { label: 'AI Run 기록', done: state.aiRuns.length > 0, value: `${state.aiRuns.length}건` },
    { label: '안전 검수', done: state.safetyReviews.length > 0, value: `${state.safetyReviews.length}건` },
    { label: '지역 매칭', done: state.localMatches.length > 0, value: `${state.localMatches.length}건` },
    { label: '사용자 로그', done: state.analytics.total_views > 0, value: `${state.analytics.total_views} views` },
    { label: '성과 리포트', done: state.impactReports.length > 0, value: `${state.impactReports.length}건` },
  ]
  const readiness = Math.round((checks.filter((item) => item.done).length / checks.length) * 100)
  return (
    <Panel title="운영 준비도 / AI 루프 상태">
      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="rounded-[26px] bg-black p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Readiness</div>
          <div className="mt-3 text-5xl font-black">{readiness}</div>
          <div className="mt-1 text-xs font-bold text-white/48">/ 100 ops score</div>
          <div className="mt-4 h-2 rounded-full bg-white/12">
            <div className="h-2 rounded-full bg-coral-500" style={{ width: `${readiness}%` }} />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {checks.map((check, index) => (
            <div key={check.label} className={`rounded-[20px] border p-3 ${check.done ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-black text-ink-800">{index + 1}. {check.label}</div>
                <Badge label={check.done ? 'ready' : 'todo'} tone={check.done ? 'good' : 'demo'} />
              </div>
              <div className="mt-2 text-xs font-bold text-ink-300">{check.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function UserAppSyncPanel({ state }: { state: AdminState }) {
  const adminTrendIds = new Set(state.trends.map((trend) => trend.id))
  const syncedCount = USER_APP_TRENDS.filter((trend) => adminTrendIds.has(trend.id)).length
  const topTrends = USER_APP_TRENDS.slice().sort((a, b) => b.views_24h - a.views_24h)

  return (
    <Panel title="사용자 앱 트렌드 동기화">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-300">User Feed Source</div>
          <div className="mt-1 text-3xl font-black text-ink-800">{syncedCount}/{USER_APP_TRENDS.length}</div>
        </div>
        <Badge label={syncedCount === USER_APP_TRENDS.length ? 'feed synced' : 'sync needed'} tone={syncedCount === USER_APP_TRENDS.length ? 'good' : 'demo'} />
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {topTrends.map((trend) => {
          const adminTrend = state.trends.find((item) => item.id === trend.id)
          return (
            <div key={trend.id} className="rounded-[20px] border border-ink-100 bg-gradient-to-br from-white to-ink-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-ink-800">{trend.emoji} {trend.title}</div>
                  <div className="mt-0.5 text-[11px] font-bold text-ink-300">{formatCount(trend.views_24h)} views · {trend.category}</div>
                </div>
                <Badge label={adminTrend ? adminTrend.provenance_label : 'missing'} tone={adminTrend ? (adminTrend.provenance_label === 'real_api' ? 'good' : 'demo') : 'demo'} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {trend.generations_reached.map((generation) => <span key={generation} className="rounded-full bg-black px-2 py-1 text-[10px] font-black text-white">{generation}</span>)}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function UserSurfaceOps({ state }: { state: AdminState }) {
  const hotKeywords = Array.from(new Set(state.trends.flatMap((trend) => trend.hashtags).slice(0, 10)))
  const journey = [
    ['Home Feed', `${USER_APP_TRENDS.length}개 최신 트렌드`, '관리자 Trend 테이블과 동기화'],
    ['Story Strip', `${hotKeywords.length}개 해시태그`, '급상승 키워드 운영 감시'],
    ['Trend To-Do', `${state.challenges.length}개 챌린지`, '검수 전 공개 차단'],
    ['Local Collab', `${state.localMatches.length}개 매칭`, '지역 자산 연결 후보'],
  ] as const

  return (
    <Panel title="사용자 여정 운영 미러">
      <div className="grid gap-3 md:grid-cols-4">
        {journey.map(([label, value, description]) => (
          <div key={label} className="rounded-[22px] border border-black/10 bg-black p-4 text-white">
            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/42">{label}</div>
            <div className="mt-2 text-lg font-black">{value}</div>
            <p className="mt-2 text-xs leading-relaxed text-white/54">{description}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function TrendControl({
  state,
  selectedTrend,
  onSelectTrend,
}: {
  state: AdminState
  selectedTrend?: Trend
  cycleLog?: any[]
  autoCollect?: boolean
  onSelectTrend: (id: string) => void
  onToggleAuto?: () => void
  onCycle?: () => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Panel title="트렌드 클러스터 맵">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MiniChart title="급상승 점수" items={state.trends.map((trend) => [trend.title, trend.surge_score?.total ?? 0])} />
          <MiniChart title="행동 전환 점수" items={state.trends.map((trend) => [trend.title, trend.action_score?.total ?? 0])} />
          <MiniChart title="안전/실행 후보" items={state.trends.map((trend) => [trend.category, trend.action_score?.factors.find((factor) => factor.key === 'safety_score')?.value ?? 0])} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {state.trendClusters.length ? state.trendClusters.map((cluster, index) => (
            <button key={cluster.id} className="rounded-lg border border-ink-100 bg-white p-4 text-left">
              <div className="flex items-center justify-between">
                <strong>{cluster.name}</strong>
                <span className="text-xl font-black text-coral-600">{cluster.cluster_score}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {cluster.representative_keywords.map((keyword) => <span key={keyword} className="rounded bg-coral-50 px-2 py-1 text-xs font-bold text-coral-700">#{keyword}</span>)}
              </div>
              <div className="mt-4 h-2 rounded-full bg-ink-100">
                <div className="h-2 rounded-full bg-coral-500" style={{ width: `${Math.min(100, 24 + index * 18)}%` }} />
              </div>
            </button>
          )) : <Empty text="클러스터링 버튼을 눌러 TrendCluster를 생성하세요." />}
        </div>
      </Panel>
      <Panel title="Trend-to-Action Score">
        <SelectList items={state.trends} selected={selectedTrend?.id} onSelect={onSelectTrend} />
        {selectedTrend?.surge_score && <ScoreBreakdown breakdown={selectedTrend.surge_score} compact />}
        {selectedTrend?.action_score && <ScoreBreakdown breakdown={selectedTrend.action_score} />}
        {selectedTrend && <ExplanationCard title={selectedTrend.title} provenance={selectedTrend.provenance_label} model="Trend Radar AI · feature contribution" generatedAt={selectedTrend.collected_at} sources={[selectedTrend.source, ...(selectedTrend.evidence_refs ?? [])]} limits={['점수 모델은 SHAP 대체용 feature contribution이며, LLM 자기 설명이 아닙니다.']} />}
      </Panel>
    </div>
  )
}

function TrendIntelligence({ state, selectedTrend, translations, onTranslate }: { state: AdminState; selectedTrend?: Trend; translations: any; onTranslate: () => void }) {
  const latest = state.aiRuns.find((run) => run.module_name === 'generateTrendContext')
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="수집된 트렌드">
        <div className="space-y-3">
          {state.trends.map((trend) => <TrendRow key={trend.id} trend={trend} active={trend.id === selectedTrend?.id} />)}
        </div>
      </Panel>
      <Panel title="LLM Trend Context">
        <Action onClick={onTranslate}>세대별 번역 생성</Action>
        {latest ? <JsonBlock value={latest.output_json} /> : <Empty text="Challenge Studio에서 챌린지를 생성하면 trend context AI Run이 남습니다." />}
        {latest && <ExplanationFromRun run={latest} />}
        {translations && (
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-black">세대별 설명 비교표</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {(translations.variants ?? []).map((variant: any) => (
                <div key={variant.age_band} className="rounded-lg border border-ink-100 bg-white p-3">
                  <div className="text-xs font-black text-coral-600">{variant.age_band}</div>
                  <div className="mt-1 font-black">{variant.title}</div>
                  <p className="mt-1 text-xs text-ink-400">{variant.hook}</p>
                  <p className="mt-2 text-[11px] font-bold text-amber-700">주의: {variant.caution}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}

function ChallengeStudio({ state, selectedTrend, selectedChallenge, onSelectChallenge, onGenerate, onHeritage }: { state: AdminState; selectedTrend?: Trend; selectedChallenge?: Challenge; onSelectChallenge: (id: string) => void; onGenerate: () => void; onHeritage: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Panel title="AI 챌린지 생성">
        <p className="text-sm text-ink-400">선택 트렌드: <strong>{selectedTrend?.title ?? '없음'}</strong></p>
        <Action onClick={onGenerate} wide>LLM 챌린지 초안 생성</Action>
        <Action onClick={onHeritage} wide>Heritage Remix 생성</Action>
        <div className="mt-4 space-y-2">
          {state.challenges.map((challenge) => (
            <button key={challenge.id} onClick={() => onSelectChallenge(challenge.id)} className={`w-full rounded-lg border p-3 text-left ${selectedChallenge?.id === challenge.id ? 'border-coral-400 bg-coral-50' : 'border-ink-100 bg-white'}`}>
              <div className="font-black">{challenge.title}</div>
              <div className="mt-1 flex gap-2 text-xs"><Badge label={challenge.status} tone="demo" /><Badge label={challenge.provenance_label} tone={challenge.provenance_label === 'real_api' ? 'good' : 'demo'} /></div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="검수 대기 초안">
        {selectedChallenge ? (
          <>
            <div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black">{selectedChallenge.title}</h3><Badge label="검수 필요" tone="demo" /></div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{selectedChallenge.description}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="비용" value={`${formatCount(selectedChallenge.estimated_cost)}원`} sub={selectedChallenge.difficulty} />
              <Metric label="시간" value={`${selectedChallenge.estimated_minutes}분`} sub={selectedChallenge.target_age_band} />
              <Metric label="공개 버튼" value="승인 전 비활성" sub="human gate" />
            </div>
            {selectedChallenge.score_breakdown && <ScoreBreakdown breakdown={selectedChallenge.score_breakdown} />}
            {selectedChallenge.generation_variants?.length ? (
              <div className="mt-5">
                <h3 className="text-sm font-black">1인/가족/외국인 버전</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {selectedChallenge.generation_variants.map((variant) => (
                    <div key={variant.age_band} className="rounded-lg bg-ink-50 p-3">
                      <div className="text-xs font-black text-coral-600">{variant.age_band}</div>
                      <div className="mt-1 text-sm font-black">{variant.title}</div>
                      <p className="mt-1 text-xs text-ink-400">{variant.hook}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedChallenge.heritage_remix && (
              <div className="mt-5 rounded-lg border border-ink-100 bg-white p-4">
                <h3 className="text-sm font-black">Heritage Remix AI</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedChallenge.heritage_remix.heritage_elements.map((item) => <span key={item} className="rounded bg-coral-50 px-2 py-1 text-xs font-bold text-coral-700">{item}</span>)}
                </div>
                <ScoreBreakdown breakdown={selectedChallenge.heritage_remix.appropriateness_score} compact />
                <List title="문화 적합성 주의" items={selectedChallenge.heritage_remix.cautions} />
              </div>
            )}
          </>
        ) : <Empty text="생성된 챌린지가 없습니다." />}
      </Panel>
    </div>
  )
}

function SafetyGate({ challenge, review, onReview, onDecision }: { challenge?: Challenge; review?: any; onReview: () => void; onDecision: (status: 'approved' | 'rejected' | 'needs_review') => void }) {
  const highRisk = review?.risk_level === 'high'
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Safety & Ethics Gate">
        <Action onClick={onReview} wide>Safety Review 실행</Action>
        {review ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['physical', 'privacy', 'copyright'].map((risk, i) => <RiskBar key={risk} label={risk} value={review.risk_level === 'high' ? 90 - i * 8 : review.risk_level === 'medium' ? 58 - i * 7 : 22 + i * 4} />)}
            </div>
            <div className="mt-4"><Badge label={`risk: ${review.risk_level}`} tone={review.risk_level === 'low' ? 'good' : 'demo'} /></div>
            <p className="mt-3 text-sm leading-relaxed">{review.explanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onDecision('approved')} disabled={highRisk} className={`rounded-lg px-4 py-2 text-sm font-black ${highRisk ? 'bg-ink-100 text-ink-300' : 'bg-emerald-600 text-white'}`}>승인</button>
              <button onClick={() => onDecision('needs_review')} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-black text-white">수정 후 재검수</button>
              <button onClick={() => onDecision('rejected')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white">반려</button>
            </div>
          </>
        ) : <Empty text="아직 안전 검토가 없습니다." />}
      </Panel>
      <Panel title="위험 문구 하이라이트 / Diff">
        {challenge && <p className="rounded-lg bg-ink-50 p-4 text-sm leading-relaxed">{highlightText(challenge.description, review?.flagged_text_spans ?? [])}</p>}
        {review && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DiffBox title="수정 전" text={`${challenge?.description ?? ''}\n${challenge?.safety_notice ?? ''}`} />
            <DiffBox title="수정 후" text={review.suggested_revision} good />
          </div>
        )}
      </Panel>
    </div>
  )
}

function LocalMatching({
  state,
  challenge,
  selectedRegionCode,
  onSelectRegion,
  onMatch,
}: {
  state: AdminState
  challenge?: Challenge
  selectedRegionCode: string
  onSelectRegion: (regionCode: string) => void
  onMatch: () => void
}) {
  const festivals = state.localAssets.filter((asset) => asset.asset_type === 'festival')
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <Panel title="지도 기반 LocalAsset">
        <Action onClick={onMatch}>Local Match Score 계산</Action>
        <div className="mt-4">
          <RegionMapIntelligence state={state} selectedRegionCode={selectedRegionCode} onSelectRegion={onSelectRegion} />
        </div>
        <div className="mt-4 rounded-[22px] border border-ink-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-ink-800">축제 달력 자산</h3>
            <Badge label={`${festivals.length} festivals`} tone="demo" />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {festivals.slice(0, 6).map((festival) => (
              <div key={festival.id} className="rounded-2xl bg-ink-50 p-3 text-xs">
                <div className="font-black text-ink-800">{festival.name}</div>
                <div className="mt-1 font-bold text-ink-300">{festival.region_code} · {festival.start_date ?? '날짜 미정'}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="추천 이유">
        <div className="mb-4 rounded-[22px] border border-ink-100 bg-ink-50 p-4 text-xs leading-relaxed text-ink-500">
          <div className="font-black text-ink-800">정확도 강화 매칭</div>
          <p className="mt-1">
            이제 단순 키워드가 아니라 유행의 행동(먹기·만들기·찍기), 장소 논리, 소재·전통문화 맥락을 먼저 검증합니다.
            맞지 않는 조합은 점수를 낮추거나 탈락시켜 사용자 카드 배포 전 검수 후보에서 제외합니다.
          </p>
        </div>
        {state.localMatches.length ? state.localMatches.slice(0, 4).map((match) => {
          const asset = state.localAssets.find((item) => item.id === match.local_asset_id)
          return (
            <div key={match.id} className="mb-4 rounded-lg border border-ink-100 bg-white p-4">
              <div className="flex items-center justify-between"><strong>{asset?.name}</strong><span className="text-2xl font-black text-coral-600">{match.match_score}</span></div>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{match.explanation}</p>
              <ScoreBreakdown breakdown={match.score_breakdown} compact />
            </div>
          )
        }) : <Empty text={`${challenge?.title ?? '챌린지'}에 대해 매칭 버튼을 눌러보세요.`} />}
      </Panel>
    </div>
  )
}

function ProposalStudio({ state, match, onGenerate }: { state: AdminState; match?: LocalMatch; onGenerate: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Panel title="제안 생성">
        <p className="text-sm text-ink-400">실제 발송은 SMTP 설정과 관리자 승인 전까지 차단됩니다.</p>
        <Action onClick={onGenerate} wide>제안 메일 초안 생성</Action>
        <div className="mt-4 text-xs text-ink-300">선택 매치: {match?.id ?? '없음'}</div>
      </Panel>
      <Panel title="Proposal Drafts">
        {state.proposals.length ? state.proposals.map((proposal) => (
          <article key={proposal.id} className="mb-4 rounded-lg border border-ink-100 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{proposal.subject}</h3><Badge label={proposal.status} tone="demo" /></div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-500">{proposal.body}</p>
            <div className="mt-3 text-xs font-bold text-ink-300">관리자 승인 전 자동 발송 없음</div>
          </article>
        )) : <Empty text="LocalMatch 생성 후 제안 초안을 만들 수 있습니다." />}
      </Panel>
    </div>
  )
}

function UserAnalytics({ state, diagnosis, onDiagnose, onSimulate }: { state: AdminState; diagnosis: any; onDiagnose: () => void; onSimulate: () => void }) {
  const a = state.analytics
  const funnel = [
    ['view', a.total_views, 'trend_card_view'],
    ['start', a.total_starts, 'challenge_start / trend_card_view * 100'],
    ['complete', a.total_completions, 'challenge_complete / challenge_start * 100'],
    ['proof', a.total_proofs, 'proof_upload / challenge_complete * 100'],
  ] as const
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <Panel title="KPI / Funnel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[22px] border border-ink-100 bg-ink-50 p-3">
          <div>
            <div className="text-sm font-black text-ink-800">사용자 앱 로그 학습 루프</div>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">Home Feed, Trend To-Do, Local Collab 표면에서 발생한 것처럼 해시 처리된 mock user events를 생성합니다.</p>
          </div>
          <Action onClick={onSimulate}>로그 96건 생성</Action>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="총 사용자" value={a.segment_breakdown_json.unique_users ?? 0} sub="distinct user_id_hash" />
          <Metric label="저장률" value={`${a.segment_breakdown_json.save_rate ?? 0}%`} sub="save / view * 100" />
          <Metric label="시작률" value={`${a.start_rate}%`} sub="start / view * 100" />
          <Metric label="완료율" value={`${a.completion_rate}%`} sub="complete / start * 100" />
          <Metric label="인증률" value={`${a.proof_rate}%`} sub="proof / complete * 100" />
          <Metric label="장소 클릭률" value={`${a.place_click_rate}%`} sub="place_click / view * 100" />
          <Metric label="지도 열람률" value={`${a.map_open_rate ?? 0}%`} sub="map_open / place_click * 100" />
          <Metric label="방문 인증 전환율" value={`${a.visit_conversion_rate}%`} sub="location_verified_proof / place_click * 100" />
        </div>
        <div className="mt-6 space-y-3">
          {funnel.map(([label, value, formula], index) => (
            <div key={label} title={formula}>
              <div className="flex justify-between text-xs font-bold text-ink-400"><span>{label}</span><span>{value}</span></div>
              <div className="mt-1 h-7 rounded bg-ink-100"><div className="h-7 rounded bg-coral-500" style={{ width: `${Math.max(8, (value / Math.max(1, a.total_views)) * 100)}%`, opacity: 1 - index * 0.13 }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <MiniChart title="세대별 코호트" items={Object.entries(a.segment_breakdown_json.by_age_band ?? {}) as [string, number][]} />
          <MiniChart title="지역별 히트맵" items={Object.entries(a.segment_breakdown_json.by_region ?? {}) as [string, number][]} />
          <MiniChart title="단계별 이탈률" items={Object.entries(a.segment_breakdown_json.step_drop_off_rate ?? {}) as [string, number][]} />
        </div>
      </Panel>
      <Panel title="Challenge Doctor">
        <Action onClick={onDiagnose} wide>분석 진단 생성</Action>
        {diagnosis ? <JsonBlock value={diagnosis} /> : <div className="mt-4 space-y-2">{state.doctorTargets.map((target) => <StatusRow key={target.challenge_id} label={target.challenge_id} value={`${target.completion_rate}% 완료`} tone="demo" />)}</div>}
      </Panel>
    </div>
  )
}

function ImpactReports({ state, onGenerate }: { state: AdminState; onGenerate: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Panel title="기관 제출용 리포트">
        <Action onClick={onGenerate} wide>Impact Report 생성</Action>
        <p className="mt-4 text-xs leading-relaxed text-ink-400">성과 수치와 계산 근거를 묶어 PDF 리포트로 생성합니다. 외부 데이터가 섞이면 보조 추세 지표로 표시합니다.</p>
      </Panel>
      <Panel title="Reports">
        {state.impactReports.length ? state.impactReports.map((report) => (
          <article key={report.id} className="mb-4 rounded-lg border border-ink-100 bg-white p-4">
            <h3 className="font-black">{report.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{report.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.pdf_url && <a className="rounded-lg bg-ink-800 px-3 py-2 text-xs font-black text-white" href={report.pdf_url}>PDF 다운로드</a>}
              <span className="rounded bg-ink-50 p-3 text-xs">HTML/PDF export ready</span>
            </div>
          </article>
        )) : <Empty text="아직 생성된 리포트가 없습니다." />}
      </Panel>
    </div>
  )
}

function AiOps({ runs }: { runs: AiRun[] }) {
  const [selected, setSelected] = useState<AiRun | undefined>(runs[0])
  useEffect(() => setSelected(runs[0]), [runs])
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Panel title="AI Run Log">
        <div className="space-y-2">
          {runs.map((run) => (
            <button key={run.id} onClick={() => setSelected(run)} className={`w-full rounded-lg border p-3 text-left ${selected?.id === run.id ? 'border-coral-400 bg-coral-50' : 'border-ink-100 bg-white'}`}>
              <div className="flex items-center justify-between gap-3"><strong>{run.module_name}</strong><Badge label={run.provenance_label} tone={run.provenance_label === 'real_api' ? 'good' : 'demo'} /></div>
              <div className="mt-1 text-xs text-ink-300">{run.model_name} · {run.latency_ms}ms · {run.prompt_version}</div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Run Detail">
        {selected ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <JsonBlock title="input_json" value={selected.input_json} />
            <JsonBlock title="output_json" value={selected.output_json} />
            <JsonBlock title="token_usage_json" value={selected.token_usage_json ?? { note: 'not available for demo_seed' }} />
            <ExplanationFromRun run={selected} />
          </div>
        ) : <Empty text="AI Run이 아직 없습니다." />}
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-card backdrop-blur">
      <h2 className="text-base font-black text-ink-800">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Action({ children, onClick, wide }: { children: React.ReactNode; onClick: () => void; wide?: boolean }) {
  return <button type="button" onClick={onClick} className={`min-h-10 rounded-2xl border border-white/10 bg-black px-4 py-2 text-center text-sm font-black leading-snug text-white shadow-card transition hover:bg-coral-600 active:scale-[0.98] ${wide ? 'mt-4 w-full' : ''}`}>{children}</button>
}

function Badge({ label, tone }: { label: string; tone: 'good' | 'demo' }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tone === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{label}</span>
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return <div className="rounded-[24px] border border-ink-100 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(7,13,36,0.55)]"><div className="text-xs font-bold text-ink-300" title={sub}>{label}</div><div className="mt-2 text-2xl font-black text-ink-800">{value}</div><div className="mt-1 text-[11px] text-ink-300">{sub}</div></div>
}

function ScoreBreakdown({ breakdown, compact }: { breakdown: { total: number; factors: ScoreFactor[] }; compact?: boolean }) {
  return (
    <div className={compact ? 'mt-3 space-y-2' : 'mt-5 space-y-3'}>
      <div className="flex items-center justify-between"><strong className="text-sm">Score Breakdown</strong><span className="text-xl font-black text-coral-600">{breakdown.total}</span></div>
      {breakdown.factors.map((factor) => (
        <div key={factor.key}>
          <div className="flex justify-between text-[11px] font-bold text-ink-400"><span>{factor.label} · w {factor.weight}</span><span>{factor.value} → {factor.contribution}</span></div>
          <div className="mt-1 h-2 rounded bg-ink-100"><div className="h-2 rounded bg-coral-500" style={{ width: `${factor.value}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

function ExplanationCard({ title, provenance, model, generatedAt, sources, limits }: { title: string; provenance: string; model: string; generatedAt: string; sources: string[]; limits: string[] }) {
  return (
    <div className="mt-4 rounded-lg border border-ink-100 bg-ink-50 p-4">
      <div className="flex items-center gap-2"><strong>{title}</strong><Badge label={provenance} tone={provenance === 'real_api' ? 'good' : 'demo'} /></div>
      <div className="mt-2 grid gap-2 text-xs text-ink-400">
        <div>모델: {model}</div><div>생성 시간: {generatedAt}</div><div>출처: {sources.join(', ')}</div><div>제한: {limits.join(', ')}</div>
      </div>
    </div>
  )
}

function ExplanationFromRun({ run }: { run: AiRun }) {
  return <ExplanationCard title={run.module_name} provenance={run.provenance_label} model={run.model_name} generatedAt={run.created_at} sources={[run.prompt_version]} limits={[run.error ?? '관리자 검수 필요', `human_override=${run.human_override}`]} />
}

function SelectList({ items, selected, onSelect }: { items: Trend[]; selected?: string; onSelect: (id: string) => void }) {
  return <div className="mb-4 space-y-2">{items.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full rounded-2xl border p-3 text-left text-sm font-bold ${selected === item.id ? 'border-black bg-black text-white' : 'border-ink-100 bg-white'}`}>{item.title}</button>)}</div>
}

function TrendRow({ trend, active }: { trend: Trend; active: boolean }) {
  return <article className={`rounded-[22px] border p-4 transition ${active ? 'border-black bg-black text-white shadow-card' : 'border-ink-100 bg-white'}`}><div className="flex flex-wrap items-center gap-2"><strong>{trend.title}</strong><Badge label={trend.provenance_label} tone={trend.provenance_label === 'real_api' ? 'good' : 'demo'} /></div><p className={`mt-2 text-sm leading-relaxed ${active ? 'text-white/62' : 'text-ink-400'}`}>{trend.description}</p></article>
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: 'good' | 'demo' }) {
  return <div className="flex items-center justify-between border-b border-ink-100 py-3 text-sm"><span className="font-bold text-ink-500">{label}</span><Badge label={value} tone={tone} /></div>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[22px] border border-dashed border-ink-100 bg-ink-50 p-6 text-sm font-bold text-ink-300">{text}</div>
}

function JsonBlock({ value, title }: { value: unknown; title?: string }) {
  return <pre className="max-h-[420px] overflow-auto rounded-lg bg-[#071126] p-4 text-xs leading-relaxed text-coral-50">{title ? `${title}\n` : ''}{JSON.stringify(value, null, 2)}</pre>
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div className="mt-3">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-ink-300">{title}</div>
      <ul className="mt-2 space-y-1 text-sm text-ink-500">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  )
}

function MiniChart({ title, items }: { title: string; items: [string, number][] }) {
  const max = Math.max(1, ...items.map(([, value]) => Number(value) || 0))
  return (
    <div className="rounded-[22px] border border-ink-100 bg-white p-4">
      <div className="text-xs font-black text-ink-500">{title}</div>
      <div className="mt-3 space-y-2">
        {items.slice(0, 6).map(([label, raw]) => {
          const value = Number(raw) || 0
          return (
            <div key={label}>
              <div className="flex justify-between text-[11px] font-bold text-ink-300"><span className="truncate">{label}</span><span>{Math.round(value)}</span></div>
              <div className="mt-1 h-2 rounded bg-ink-100"><div className="h-2 rounded bg-coral-500" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RiskBar({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-ink-50 p-3"><div className="text-[11px] font-black text-ink-400">{label}</div><div className="mt-2 h-20 w-full rounded bg-white"><div className="rounded bg-red-400" style={{ height: `${value}%`, width: '100%', transform: 'translateY(' + (100 - value) + '%)' }} /></div></div>
}

function DiffBox({ title, text, good }: { title: string; text: string; good?: boolean }) {
  return <div className={`rounded-lg p-3 text-sm leading-relaxed ${good ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}><div className="mb-2 text-xs font-black">{title}</div>{text}</div>
}

function highlightText(text: string, spans: string[]) {
  if (!spans.length) return text
  return `${text}\n\n⚠ flagged: ${spans.join(', ')}`
}
