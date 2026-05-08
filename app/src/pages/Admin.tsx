import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, AdminState, AiRun, Challenge, LocalMatch, ScoreFactor, Trend } from '../lib/adminApi'
import { formatCount } from '../lib/format'

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
      await refresh()
    } catch (e) {
      setError(String(e))
      setLoading('')
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
    <div className="min-h-screen bg-[#F4F7FB] text-ink-700">
      <div className="grid min-h-screen lg:grid-cols-[284px_minmax(0,1fr)]">
        <aside className="bg-[#081126] p-5 text-white">
          <Link to="/" className="text-xs font-bold text-coral-200">← 사용자 화면</Link>
          <div className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-coral-200">
            AI Culture Ops
          </div>
          <h1 className="mt-2 text-2xl font-black leading-tight">TrendDo Admin<br />운영 관제실</h1>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <Badge label={`LLM ${state.runtime.llm}`} tone={state.runtime.llm === 'real_api' ? 'good' : 'demo'} />
            <Badge label={`DATA ${state.runtime.dataApis}`} tone={state.runtime.dataApis === 'configured' ? 'good' : 'demo'} />
          </div>
          <nav className="mt-7 space-y-1">
            {MENUS.map((item) => (
              <button
                key={item}
                onClick={() => setMenu(item)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
                  menu === item ? 'bg-coral-500 text-white' : 'text-white/68 hover:bg-white/8 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-600">{menu}</div>
              <h2 className="mt-1 text-3xl font-black text-ink-800">AI 문화 운영 관제실</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-400">
                수집, 임베딩, LLM 생성, 점수화, 안전 검수, 지역 매칭, 사용자 로그 분석이 모두 AI Run으로 기록됩니다.
                API 키가 없으면 모든 결과는 명시적으로 demo_seed 배지를 달고 표시됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Action onClick={() => run('트렌드 수집 중', adminApi.collectTrends)}>트렌드 수집</Action>
              <Action onClick={() => run('지역 자산 수집 중', adminApi.collectLocalAssets)}>지역 자산 수집</Action>
              <Action onClick={() => run('임베딩 생성 중', adminApi.embed)}>임베딩 생성</Action>
              <Action onClick={() => run('클러스터링 중', adminApi.clusterTrends)}>클러스터링</Action>
              <Action onClick={() => run('AI learning loop 실행 중', adminApi.runLearningLoop)}>AI 루프 실행</Action>
            </div>
          </header>

          {loading && <div className="mt-4 rounded-lg bg-ink-800 px-4 py-3 text-sm font-bold text-white">{loading}</div>}
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          <section className="mt-6">
            {menu === 'Home Dashboard' && <HomeDashboard state={state} briefing={briefing} onBriefing={() => run('AI 오늘의 브리핑 생성 중', adminApi.briefing)} />}
            {menu === 'Trend Control Tower' && <TrendControl state={state} selectedTrend={selectedTrend} onSelectTrend={setSelectedTrendId} />}
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
              <UserAnalytics state={state} diagnosis={diagnosis} onDiagnose={() => run('Challenge Doctor 진단 중', adminApi.diagnose)} />
            )}
            {menu === 'Impact Report Center' && <ImpactReports state={state} onGenerate={() => run('성과 리포트 생성 중', adminApi.generateReport)} />}
            {menu === 'AI Ops / Model Run Log' && <AiOps runs={state.aiRuns} />}
          </section>
        </main>
      </div>
    </div>
  )
}

function HomeDashboard({ state, briefing, onBriefing }: { state: AdminState; briefing: any; onBriefing: () => void }) {
  const latestRun = state.aiRuns[0]
  const mediumOrHigh = state.safetyReviews.filter((review) => review.risk_level !== 'low').length
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="수집 트렌드" value={state.trends.length} sub="Trend table" />
        <Metric label="지역 자산" value={state.localAssets.length} sub="LocalAsset table" />
        <Metric label="검수 대기 챌린지" value={state.challenges.filter((c) => c.status !== 'published').length} sub="No auto publish" />
        <Metric label="시작률" value={`${state.analytics.start_rate}%`} sub="challenge_start / view" />
        <Metric label="완료율" value={`${state.analytics.completion_rate}%`} sub="complete / start" />
        <Metric label="AI Run" value={state.aiRuns.length} sub={latestRun?.model_name ?? 'not yet'} />
        <Metric label="위험 알림" value={mediumOrHigh} sub="medium/high safety" />
        <Metric label="지역 매칭 후보" value={state.localMatches.length} sub="Local Bridge AI" />
      </div>
      <Panel title="운영 원칙 상태">
        <StatusRow label="자동 공개" value="차단됨" tone="good" />
        <StatusRow label="자동 이메일 발송" value="차단됨" tone="good" />
        <StatusRow label="개인정보" value="user_id_hash + age_band" tone="good" />
        <StatusRow label="데이터 출처" value={state.runtime.llm === 'real_api' ? 'real_api 포함' : 'demo_seed 표시'} tone={state.runtime.llm === 'real_api' ? 'good' : 'demo'} />
      </Panel>
      <Panel title="AI 오늘의 브리핑">
        <Action onClick={onBriefing}>수치 기반 브리핑 생성</Action>
        {briefing ? (
          <div className="mt-4 space-y-3">
            <h3 className="text-xl font-black">{briefing.headline}</h3>
            <p className="text-sm leading-relaxed text-ink-500">{briefing.briefing}</p>
            <List title="추천 액션" items={briefing.recommended_actions ?? []} />
            <List title="위험 알림" items={briefing.risk_alerts ?? []} />
          </div>
        ) : <Empty text="조회·시작·완료·위험·지역 매칭 데이터를 바탕으로 운영 브리핑을 생성합니다." />}
      </Panel>
    </div>
  )
}

function TrendControl({ state, selectedTrend, onSelectTrend }: { state: AdminState; selectedTrend?: Trend; onSelectTrend: (id: string) => void }) {
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

function LocalMatching({ state, challenge, onMatch }: { state: AdminState; challenge?: Challenge; onMatch: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <Panel title="지도 기반 LocalAsset">
        <Action onClick={onMatch}>Local Match Score 계산</Action>
        <div className="relative mt-4 h-[390px] overflow-hidden rounded-lg bg-[#E9F4EF]">
          {state.localAssets.map((asset, index) => (
            <div key={asset.id} className="absolute rounded-full bg-coral-500 px-3 py-1 text-xs font-black text-white shadow-card" style={{ left: `${18 + (index * 27) % 62}%`, top: `${20 + (index * 19) % 55}%` }}>
              {asset.region_code}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="추천 이유">
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

function UserAnalytics({ state, diagnosis, onDiagnose }: { state: AdminState; diagnosis: any; onDiagnose: () => void }) {
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
        <p className="mt-4 text-xs leading-relaxed text-ink-400">PDF 다운로드는 HTML export로 우선 구현되어 있으며, PDF 렌더링은 TODO로 남겼습니다.</p>
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
  return <section className="rounded-lg bg-white p-5 shadow-card"><h2 className="text-base font-black text-ink-800">{title}</h2><div className="mt-4">{children}</div></section>
}

function Action({ children, onClick, wide }: { children: React.ReactNode; onClick: () => void; wide?: boolean }) {
  return <button onClick={onClick} className={`rounded-lg bg-ink-800 px-4 py-2 text-sm font-black text-white hover:bg-coral-600 ${wide ? 'mt-4 w-full' : ''}`}>{children}</button>
}

function Badge({ label, tone }: { label: string; tone: 'good' | 'demo' }) {
  return <span className={`inline-flex rounded px-2 py-1 text-[10px] font-black uppercase ${tone === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{label}</span>
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return <div className="rounded-lg border border-ink-100 bg-white p-4"><div className="text-xs font-bold text-ink-300" title={sub}>{label}</div><div className="mt-2 text-2xl font-black text-ink-800">{value}</div><div className="mt-1 text-[11px] text-ink-300">{sub}</div></div>
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
  return <div className="mb-4 space-y-2">{items.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full rounded-lg border p-3 text-left text-sm font-bold ${selected === item.id ? 'border-coral-400 bg-coral-50' : 'border-ink-100'}`}>{item.title}</button>)}</div>
}

function TrendRow({ trend, active }: { trend: Trend; active: boolean }) {
  return <article className={`rounded-lg border p-4 ${active ? 'border-coral-300 bg-coral-50' : 'border-ink-100 bg-white'}`}><div className="flex flex-wrap items-center gap-2"><strong>{trend.title}</strong><Badge label={trend.provenance_label} tone={trend.provenance_label === 'real_api' ? 'good' : 'demo'} /></div><p className="mt-2 text-sm leading-relaxed text-ink-400">{trend.description}</p></article>
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: 'good' | 'demo' }) {
  return <div className="flex items-center justify-between border-b border-ink-100 py-3 text-sm"><span className="font-bold text-ink-500">{label}</span><Badge label={value} tone={tone} /></div>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-ink-100 bg-ink-50 p-6 text-sm font-bold text-ink-300">{text}</div>
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
    <div className="rounded-lg border border-ink-100 bg-white p-4">
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
