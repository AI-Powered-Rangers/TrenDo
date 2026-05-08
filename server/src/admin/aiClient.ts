import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import '../env.js'
import type { z } from 'zod'
import type { AiRun, Challenge, LocalAsset, ProvenanceLabel, Trend } from './types.js'
import {
  AnalyticsDiagnosisSchema,
  AdminBriefingSchema,
  ChallengeGenerationSchema,
  GenerationTranslationSchema,
  HeritageRemixSchema,
  ImpactReportSchema,
  LocalMatchExplanationSchema,
  ProposalEmailSchema,
  SafetyReviewSchema,
  TrendContextSchema,
} from './schemas.js'
import { adminStore } from './store.js'
import { calculateTrendToActionScore, deterministicEmbedding } from './scoring.js'

const PROMPT_VERSION = 'trendo-admin-v1.0.0'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 25_000, maxRetries: 1 })
  : null
const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function fallbackFor(moduleName: string, input: unknown): unknown {
  if (moduleName === 'generateTrendContext') {
    const trend = input as Trend
    return {
      summary: `${trend.title}는 ${trend.category} 카테고리에서 행동형 챌린지로 전환 가능한 트렌드입니다.`,
      cultural_meaning: 'demo_seed 기반 분석입니다. 실제 SNS/공공데이터 키가 없어서 제한된 근거만 사용했습니다.',
      audience_insights: ['가족 참여형 문안이 적합', '지역 재료 또는 장소를 붙이면 전환 가능'],
      source_limits: ['demo_seed 데이터', '실시간 외부 API 미연동'],
      confidence: 0.62,
    }
  }
  if (moduleName === 'generateAdminBriefing') {
    return {
      headline: '오늘은 지역 연결형 가족 챌린지를 우선 검수하세요.',
      briefing: 'demo_seed 기준으로 식문화 트렌드의 행동 전환 가능성과 지역 매칭 가능성이 높습니다. 다만 실시간 SNS 원본과 공공데이터가 제한적이므로 확산 점수는 참고 지표입니다.',
      recommended_actions: ['두쫀쿠 계열 챌린지 Safety Gate 검수', '전주 시장형 Local Match 우선 제안', '완료율보다 시작률 개선 문구 A/B 테스트'],
      risk_alerts: ['미성년자 얼굴·위치정보가 인증 사진에 노출되지 않도록 안내 필요'],
      evidence_refs: ['trend-dujjonku raw_payload', 'analytics snapshot', 'local match score breakdown'],
      confidence: 0.62,
    }
  }
  if (moduleName === 'generateChallenge') {
    const trend = input as Trend
    return {
      title: `${trend.title} 체험 챌린지`,
      description: `${trend.description} 운영자가 검수한 뒤 공개할 수 있는 AI 초안입니다.`,
      target_age_band: 'family',
      estimated_cost: 10000,
      estimated_minutes: 30,
      difficulty: 'easy',
      materials: ['스마트폰', '지역 재료 또는 방문 장소', '기록 카드'],
      steps: [
        { title: '관찰하기', body: '유행의 핵심 행동을 가족 또는 친구와 함께 살펴봅니다.' },
        { title: '지역 요소 붙이기', body: '가까운 시장, 공방, 문화시설 중 하나를 연결합니다.' },
        { title: '인증하기', body: '개인정보가 드러나지 않는 사진 또는 한 줄 기록을 남깁니다.' },
      ],
      proof_type: '사진 또는 텍스트 인증',
      safety_notice: '초상권, 위치정보, 미성년자 개인정보가 노출되지 않게 검수하세요.',
      score_inputs: {
        execution_ease: 78,
        local_connectivity: 74,
        safety_score: 82,
        generation_expandability: 76,
        cost_accessibility: 80,
        proofability: 72,
      },
      confidence: 0.61,
    }
  }
  if (moduleName === 'reviewSafety') {
    const challenge = input as Challenge
    const risky = /불꽃|위험|노출|개인정보|미성년/.test(`${challenge.description} ${challenge.safety_notice}`)
    return {
      risk_level: risky ? 'medium' : 'low',
      risk_categories: risky ? ['privacy'] : [],
      flagged_text_spans: risky ? ['개인정보 또는 미성년자 관련 표현'] : [],
      explanation: 'demo_seed 안전 검토입니다. 실제 LLM 키가 있으면 더 세밀한 문구 단위 검토를 수행합니다.',
      suggested_revision: `${challenge.description}\n\n개인정보와 위치정보를 제외하고 인증하도록 안내합니다.`,
      approval_recommendation: risky ? 'revise' : 'approve',
      confidence: 0.64,
    }
  }
  if (moduleName === 'translateByGeneration') {
    return {
      variants: [
        { age_band: 'teen', title: '짧게 찍고 바로 인증', hook: '핵심 장면만 빠르게 남겨요.', caution: '얼굴과 학교 정보는 가립니다.' },
        { age_band: '20s_30s', title: '퇴근 후 30분 로컬 체험', hook: '가까운 장소와 연결해 부담 없이 시도해요.', caution: '위치 공유는 선택으로 둡니다.' },
        { age_band: '40s_50s', title: '가족과 같이 하는 주말 챌린지', hook: '역할을 나눠 완성 경험을 만듭니다.', caution: '알레르기와 안전 도구를 확인합니다.' },
        { age_band: '60_plus', title: '천천히 따라하는 문화 체험', hook: '준비물과 단계를 작게 나눕니다.', caution: '무리한 이동을 피합니다.' },
        { age_band: 'family', title: '온 가족 한 장 기록', hook: '각자 맡은 역할과 후기를 남깁니다.', caution: '미성년자 개인정보를 제외합니다.' },
        { age_band: 'foreigner', title: 'K-snack fusion tryout', hook: 'Try a local snack remix with simple proof.', caution: 'Explain cultural sources respectfully.' },
      ],
      confidence: 0.62,
    }
  }
  if (moduleName === 'generateHeritageRemix') {
    return {
      heritage_elements: ['찹쌀떡', '약과', '흑임자'],
      connection_graph: [
        { from: '두바이 쫀득쿠키', to: '찹쌀떡', reason: '쫀득한 식감이라는 공통 행동 감각이 있음' },
        { from: '가족 베이킹', to: '약과', reason: '전통 간식의 현대적 재해석으로 설명 가능' },
      ],
      cultural_fit_score: 78,
      cautions: ['전통문화 요소를 장식처럼만 소비하지 않도록 원천 설명을 함께 제공'],
      confidence: 0.65,
    }
  }
  if (moduleName === 'generateLocalMatchExplanation') {
    return {
      explanation: '트렌드 행동과 지역 자산 설명의 의미 유사도, 접근성, 인증 가능성을 종합한 demo_seed 추천입니다.',
      top_reasons: ['지역 자산 설명과 챌린지 행동이 유사함', '방문 인증 또는 사진 인증이 가능함'],
      limits: ['외부 방문객 수 API 미연동', '실제 운영 일정 확인 필요'],
      confidence: 0.6,
    }
  }
  if (moduleName === 'generateProposalEmail') {
    return {
      subject: '[검수 필요] TrendDo 지역 챌린지 협업 제안',
      body: '안녕하세요. TrendDo 관리자 검수 전 AI 초안입니다. 지역 자산과 챌린지를 연결한 공동 운영 가능성을 제안드립니다.',
      expected_effects: ['지역 방문 클릭 증가', '세대 참여형 문화 체험 확장'],
      collaboration_steps: ['운영 일정 확인', '안전 문구 검수', '공개 승인 후 링크 공유'],
      required_confirmation: ['담당자 승인', '장소 운영 가능 시간', '개인정보 처리 문구'],
      risk_or_uncertainty: ['성과 수치는 demo_seed 추정입니다.'],
      confidence: 0.58,
    }
  }
  if (moduleName === 'generateAnalyticsDiagnosis') {
    return {
      problem_summary: '완료율 또는 단계 이탈이 기준보다 낮은 챌린지가 있습니다.',
      evidence_metrics: ['completion_rate < 45%', 'drop_off_step 이벤트가 완료보다 많음'],
      likely_causes: ['단계 설명이 길거나 준비물이 많음', '인증 방식이 번거로움'],
      recommended_actions: ['첫 단계를 5분 이하로 줄이기', '사진 인증 대신 한 줄 기록 허용'],
      expected_impact_label: 'medium',
      confidence: 0.63,
    }
  }
  return {
    title: 'TrendDo 문화 운영 성과 리포트',
    summary: '선택 기간의 참여, 완료, 지역 연결 성과를 집계했습니다. demo_seed 데이터는 실제 성과로 해석하면 안 됩니다.',
    metrics: ['조회, 시작, 완료, 인증 이벤트 기반 산출', '외부 보조 추세 지표 없음'],
    recommendations: ['실제 API 키 연결 후 지표 재생성', '완료율 낮은 챌린지 개선'],
    public_value_radar: {
      accessibility: 72,
      local_economy: 66,
      cultural_continuity: 74,
      generation_bridge: 79,
      safety: 82,
    },
    confidence: 0.6,
  }
}

function sanitizeForAi(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForAi)
  if (!value || typeof value !== 'object') return value
  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'embedding') {
      output.embedding_state = Array.isArray(item) ? `present:${item.length}d` : 'missing'
      continue
    }
    if (key === 'raw_payload') {
      const raw = (item ?? {}) as Record<string, unknown>
      output.raw_payload_summary = {
        views_24h: raw.views_24h,
        saves: raw.saves,
        comments: raw.comments,
        frequency: raw.frequency,
      }
      continue
    }
    output[key] = sanitizeForAi(item)
  }
  return output
}

async function runStructured<T>({
  moduleName,
  schema,
  input,
  system,
}: {
  moduleName: string
  schema: z.ZodType<T>
  input: unknown
  system: string
}): Promise<{ data: T; aiRun: AiRun }> {
  const started = Date.now()
  let output: unknown
  let status: AiRun['status'] = 'fallback'
  let provenance: ProvenanceLabel = 'demo_seed'
  let tokenUsage: unknown
  let error: string | undefined

  try {
    if (!openai) throw new Error('OPENAI_API_KEY missing; using demo_seed fallback')
    const sanitizedInput = sanitizeForAi(input)
    const response = await openai.responses.parse({
      model,
      input: [
        { role: 'system', content: `${system}\nReturn JSON only. Prompt version: ${PROMPT_VERSION}` },
        { role: 'user', content: JSON.stringify(sanitizedInput) },
      ],
      text: {
        format: zodTextFormat(schema, moduleName.replace(/[^a-zA-Z0-9_-]/g, '_')),
      },
    })
    output = response.output_parsed
    tokenUsage = response.usage
    status = 'success'
    provenance = 'real_api'
  } catch (e) {
    output = fallbackFor(moduleName, input)
    error = e instanceof Error ? e.message : String(e)
  }

  const parsed = schema.safeParse(output)
  const data = parsed.success ? parsed.data : schema.parse(fallbackFor(moduleName, input))
  if (!parsed.success) {
    status = 'fallback'
    provenance = 'demo_seed'
    error = `schema_validation_failed: ${parsed.error.message}`
  }

  const aiRun: AiRun = {
    id: id('airun'),
    module_name: moduleName,
    model_name: openai && status === 'success' ? model : 'demo_seed_fallback',
    prompt_version: PROMPT_VERSION,
    input_ref_type: typeof input === 'object' && input && 'id' in input ? 'object' : undefined,
    input_ref_id: typeof input === 'object' && input && 'id' in input ? String((input as { id: unknown }).id) : undefined,
    input_json: sanitizeForAi(input),
    output_json: data,
    confidence: typeof data === 'object' && data && 'confidence' in data ? Number((data as { confidence: unknown }).confidence) : undefined,
    latency_ms: Date.now() - started,
    token_usage_json: tokenUsage,
    status,
    human_override: false,
    created_at: new Date().toISOString(),
    provenance_label: provenance,
    error,
  }
  await adminStore.mutate((db) => {
    db.aiRuns.unshift(aiRun)
  })
  return { data, aiRun }
}

export async function embedText(text: string): Promise<{ embedding: number[]; provenance_label: ProvenanceLabel; aiRun?: AiRun }> {
  const started = Date.now()
  if (!openai) return { embedding: deterministicEmbedding(text), provenance_label: 'demo_seed' }
  try {
    const response = await openai.embeddings.create({ model: embeddingModel, input: text })
    const aiRun: AiRun = {
      id: id('airun'),
      module_name: 'embedText',
      model_name: embeddingModel,
      prompt_version: PROMPT_VERSION,
      input_json: { text },
      output_json: { dimensions: response.data[0].embedding.length },
      latency_ms: Date.now() - started,
      token_usage_json: response.usage,
      status: 'success',
      human_override: false,
      created_at: new Date().toISOString(),
      provenance_label: 'real_api',
    }
    await adminStore.mutate((db) => {
      db.aiRuns.unshift(aiRun)
    })
    return { embedding: response.data[0].embedding, provenance_label: 'real_api', aiRun }
  } catch {
    return { embedding: deterministicEmbedding(text), provenance_label: 'demo_seed' }
  }
}

export const generateTrendContext = (trend: Trend) =>
  runStructured({
    moduleName: 'generateTrendContext',
    schema: TrendContextSchema,
    input: trend,
    system: 'You analyze Korean trend signals for a cultural operations control room.',
  })

export const generateAdminBriefing = (input: unknown) =>
  runStructured({
    moduleName: 'generateAdminBriefing',
    schema: AdminBriefingSchema,
    input,
    system: 'Write a concise operations briefing for TrendDo Admin using only supplied metrics and evidence.',
  })

export const generateChallenge = (trend: Trend, trendContext: unknown) =>
  runStructured({
    moduleName: 'generateChallenge',
    schema: ChallengeGenerationSchema,
    input: { ...trend, trendContext },
    system: 'Create a safe, locally actionable challenge. It must begin as needs_review and require human approval.',
  })

export const translateByGeneration = (trendContext: unknown) =>
  runStructured({
    moduleName: 'translateByGeneration',
    schema: GenerationTranslationSchema,
    input: trendContext,
    system: 'Translate a trend context into age-band specific challenge hooks with safety caveats.',
  })

export const generateHeritageRemix = (input: unknown) =>
  runStructured({
    moduleName: 'generateHeritageRemix',
    schema: HeritageRemixSchema,
    input,
    system: 'Connect a trend challenge to Korean heritage respectfully. Include graph edges, cautions, and uncertainty.',
  })

export const reviewSafety = (challenge: Challenge) =>
  runStructured({
    moduleName: 'reviewSafety',
    schema: SafetyReviewSchema,
    input: challenge,
    system: 'Review physical, privacy, copyright, local appropriateness, harassment, hate, and minor safety risks.',
  })

export const generateLocalMatchExplanation = (trend: Trend, challenge: Challenge, localAsset: LocalAsset, scoreBreakdown: unknown) =>
  runStructured({
    moduleName: 'generateLocalMatchExplanation',
    schema: LocalMatchExplanationSchema,
    input: { trend, challenge, localAsset, scoreBreakdown },
    system: 'Explain why a local asset matches a trend challenge, including limits.',
  })

export const generateProposalEmail = (challenge: Challenge, localAsset: LocalAsset, organization: string) =>
  runStructured({
    moduleName: 'generateProposalEmail',
    schema: ProposalEmailSchema,
    input: { challenge, localAsset, organization },
    system: 'Draft a proposal email. Never send it. Make required confirmations explicit.',
  })

export const generateAnalyticsDiagnosis = (input: unknown) =>
  runStructured({
    moduleName: 'generateAnalyticsDiagnosis',
    schema: AnalyticsDiagnosisSchema,
    input,
    system: 'Diagnose funnel and cohort problems using only supplied metrics.',
  })

export const generateImpactReport = (input: unknown) =>
  runStructured({
    moduleName: 'generateImpactReport',
    schema: ImpactReportSchema,
    input,
    system: 'Write an institution-ready public value impact report with metric basis and caveats.',
  })

export { calculateTrendToActionScore }
