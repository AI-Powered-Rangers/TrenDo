import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import '../env.js'
import type { z } from 'zod'
import type { AiRun, Challenge, LocalAsset, ProvenanceLabel, Trend } from './types.js'
import {
  AnalyticsDiagnosisSchema,
  AdminBriefingSchema,
  ChallengeGenerationSchema,
  ExperienceCardSchema,
  GenerationTranslationSchema,
  HeritageRemixSchema,
  ImpactReportSchema,
  LocalMatchExplanationSchema,
  LocalMatchVerificationSchema,
  ProposalEmailSchema,
  SafetyReviewSchema,
  TrendCardPackageSchema,
  TrendContextSchema,
} from './schemas.js'
import { adminStore } from './store.js'
import { calculateTrendToActionScore, deterministicEmbedding } from './scoring.js'

const PROMPT_VERSION = 'trendo-admin-v1.0.0'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 1 })
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
  if (moduleName === 'generateTrendCardPackage') {
    const inputObject = input as { trend?: Trend; candidate?: any; localAssets?: LocalAsset[] }
    const trend = inputObject.trend ?? input as Trend
    const risky = /초상권|얼굴|무단|위험|괴롭힘|조롱|미성년|개인정보|좌석/.test(`${trend.title} ${trend.description}`)
    return {
      safety_gate: {
        allow_card_generation: !/괴롭힘|불법|혐오/.test(`${trend.title} ${trend.description}`),
        risk_level: risky ? 'medium' : 'low',
        detected_harmful_elements: risky ? ['초상권/개인정보 또는 안전 주의 필요'] : [],
        caution_messages: risky
          ? ['타인 얼굴, 학교명, 좌석번호, 실시간 위치가 노출되지 않도록 안내하세요.']
          : ['관리자 검수 후 사용자 앱 공개가 가능합니다.'],
        blocked_reason: null,
      },
      base_card: {
        title: trend.title,
        one_line_summary: `${trend.title}를 실제로 해볼 수 있는 지역·전통문화 참여 카드로 바꿉니다.`,
        category: [trend.category, '지역문화', '참여형'],
        cultural_context: {
          origin_or_background: 'SNS/Shorts/Reels/커뮤니티 기반 유행 신호를 바탕으로 한 운영용 요약입니다.',
          meaning: '빠르게 소비되는 유행을 세대별 이해와 실제 행동으로 전환합니다.',
          caution: risky ? '초상권, 개인정보, 조롱성 따라 하기 여부를 검수해야 합니다.' : '유래를 단정하지 않고 확인된 맥락만 설명합니다.',
          source_limits: ['demo_seed fallback 또는 제한된 API 신호일 수 있음'],
        },
        recommended_targets: ['10대', '2030', '4050', '60대 이상', '가족'],
        local_connection_idea: '전통시장, 공방, 축제, 지역 식재료 중 하나와 연결합니다.',
        traditional_remix_idea: '전통 음식, 공예, 의복, 놀이 요소를 오늘의 언어로 설명합니다.',
      },
      audience_cards: [
        { audience: 'teen', card_title: `${trend.title} 한 컷 챌린지`, hook: '짧게 찍고 안전하게 인증해요.', explanation: '핵심 장면만 남기고 개인정보는 가립니다.', tone_caution: '친구나 선생님을 조롱하는 표현은 제외합니다.', accessibility_note: '준비물은 1~2개로 줄입니다.' },
        { audience: '20s_30s', card_title: `${trend.title} 퇴근 후 로컬 버전`, hook: '근처 시장이나 카페와 연결해요.', explanation: '소비에서 끝내지 않고 짧은 방문 경험으로 바꿉니다.', tone_caution: '상업적 과장 표현을 피합니다.', accessibility_note: '30분 이내 코스로 제안합니다.' },
        { audience: '40s_50s', card_title: `${trend.title} 가족 대화 카드`, hook: '왜 유행인지 쉽게 풀어봅니다.', explanation: '세대가 같이 이해하고 해볼 수 있게 맥락을 제공합니다.', tone_caution: '젊은 세대 비하 표현을 피합니다.', accessibility_note: '비용과 이동 부담을 낮춥니다.' },
        { audience: '60_plus', card_title: `${trend.title} 천천히 따라하기`, hook: '낯선 유행을 쉬운 말로 설명합니다.', explanation: '유래보다 의미와 해볼 수 있는 행동에 집중합니다.', tone_caution: '인터넷 은어는 풀어서 설명합니다.', accessibility_note: '단계를 작게 나눕니다.' },
        { audience: 'family', card_title: `${trend.title} 온가족 기록`, hook: '각자 역할을 나눠 함께 완성해요.', explanation: '세대별 기억과 오늘의 유행을 연결합니다.', tone_caution: '미성년자 얼굴 공개는 선택으로 둡니다.', accessibility_note: '집/지역공간 두 버전을 둡니다.' },
        { audience: 'foreigner', card_title: `${trend.title} K-culture tryout`, hook: 'Try the trend with local context.', explanation: 'Explain cultural sources respectfully and simply.', tone_caution: 'Avoid claiming unverified origins.', accessibility_note: 'Use simple materials and optional photos.' },
      ],
      todo: {
        title: `${trend.title} 지역 문화 ToDo`,
        estimated_minutes: 30,
        estimated_cost: 10000,
        difficulty: 'easy',
        materials: ['스마트폰', '선택한 지역 재료/장소', '기록 문장'],
        steps: [
          { title: '유행 이해하기', body: '카드의 세대별 설명을 읽고 핵심 행동을 확인합니다.' },
          { title: '지역 요소 고르기', body: '시장, 축제, 공방, 전통문화 요소 중 하나를 선택합니다.' },
          { title: '작게 실행하기', body: '10~30분 안에 가능한 방식으로 직접 해봅니다.' },
          { title: '안전하게 인증하기', body: '타인 얼굴과 개인정보를 제외하고 사진 또는 한 줄 기록을 남깁니다.' },
        ],
        proof_type: '사진 또는 비공개 체크',
        safety_notice: '초상권, 위치정보, 미성년자 개인정보를 노출하지 마세요.',
      },
      xai: {
        top_reasons: ['행동으로 전환 가능', '지역 자산과 연결 가능', '세대별 설명으로 접근성 개선'],
        deduction_reasons: risky ? ['초상권/개인정보 검수 필요'] : ['실제 확산 데이터가 제한적일 수 있음'],
        evidence_refs: trend.evidence_refs ?? [trend.source_url ?? trend.source],
        uncertainty: ['관리자 최종 승인 전 사용자 앱에 공개하지 않음'],
      },
      confidence: 0.64,
    }
  }
  if (moduleName === 'generateExperienceCard') {
    const inputObject = input as {
      selected_trends?: string[]
      region?: { label?: string; specialties?: string[]; traditional_culture?: string[]; festivals?: { name: string }[]; assets?: { name: string }[] }
    }
    const trends = inputObject.selected_trends?.length ? inputObject.selected_trends : ['선택한 유행']
    const regionLabel = inputObject.region?.label ?? '선택 지역'
    const localKeywords = [
      ...(inputObject.region?.specialties ?? []).slice(0, 2),
      ...(inputObject.region?.traditional_culture ?? []).slice(0, 2),
      ...(inputObject.region?.festivals ?? []).slice(0, 1).map((festival) => festival.name),
    ].filter(Boolean)
    const trendText = trends.join(' ')
    const signature = localKeywords[0] ?? '지역 문화'
    const fusionName = /쿠키|두쫀쿠|디저트|빵|케이크/.test(trendText)
      ? `${signature} 쫀득 디저트 챌린지`
      : /러닝|운동|크루|버터런/.test(trendText)
        ? `${signature} 로컬 무브 챌린지`
        : /사진|직관|영상|릴스|쇼츠/.test(trendText)
          ? `${signature} 한 컷 기록 챌린지`
          : `${signature} 트렌드 리믹스 챌린지`
    return {
      card_title: fusionName,
      emoji: /디저트|빵|쿠키|불닭|음식|비빔밥/.test(trends.join(' ')) ? '🍽️' : /러닝|운동/.test(trends.join(' ')) ? '🏃' : '🏮',
      subtitle: '유행 키워드와 지역 소재를 하나의 새 체험 방식으로 융합한 관리자 검수용 카드입니다.',
      local_story: `${trends.join(', ')}를 그대로 붙이지 않고 ${regionLabel}의 ${localKeywords.join(', ') || '지역 문화 자산'}을 재료·장소·스토리로 녹여 ${fusionName}로 전환합니다.`,
      region_label: regionLabel,
      selected_trends: trends,
      local_keywords: localKeywords,
      safety_notice: '초상권, 위치정보, 미성년자 개인정보를 노출하지 않고 비공개 인증도 허용하세요.',
      xai: {
        match_score: 84,
        reasons: ['선택한 유행이 짧은 행동으로 전환 가능', '지역 키워드와 인증 장소를 만들기 쉬움', '세대별 설명으로 문화 접근성을 높일 수 있음'],
        cautions: ['유래를 단정하지 말 것', '상업적 과장 표현을 피할 것'],
        evidence_refs: ['selected_trends', 'region_intelligence', 'generation_policy'],
      },
      generation_todos: [
        { generation: 'teen', label: '10대', title: `${fusionName} 쇼츠 미션`, explanation: '지역 소재를 유행의 모양, 식감, 포즈, 기록 방식 안에 녹여 짧게 시도합니다.', steps: [{ title: '융합 포인트 고르기', body: `${signature}의 맛, 색, 장소감 중 하나를 유행 방식에 섞습니다.` }, { title: '한 컷 실행', body: '완성 장면만 짧게 기록하고 개인정보는 가립니다.' }], estimated_minutes: 15, proof_type: '사진 또는 짧은 문장', tone_note: '짧고 직접적인 말투' },
        { generation: 'adult', label: '30·40대', title: `${fusionName} 퇴근 후 버전`, explanation: '시간과 비용이 부담되지 않게 지역 소재를 실제 구매, 방문, 제작 행동으로 바꿉니다.', steps: [{ title: '지역 소재 정하기', body: `${signature}를 맛, 재료, 장소 중 하나로 활용합니다.` }, { title: '30분 체험', body: '구매/방문/기록 중 하나만 실행합니다.' }], estimated_minutes: 30, proof_type: '체크리스트', tone_note: '실용적이고 따뜻한 말투' },
        { generation: 'senior', label: '50·60대', title: `${fusionName} 천천히 이해하기`, explanation: '낯선 유행을 먼저 쉬운 말로 풀고, 익숙한 지역 음식·장소·전통과 이어 설명합니다.', steps: [{ title: '유행 뜻 읽기', body: `${trends[0]}가 왜 유행인지 쉬운 설명을 먼저 읽습니다.` }, { title: '익숙한 소재로 바꾸기', body: `${signature}처럼 아는 지역 요소를 넣어 직접 해볼 수 있는 형태로 바꿉니다.` }], estimated_minutes: 25, proof_type: '비공개 완료 체크', tone_note: '자세하고 친절한 말투' },
        { generation: 'family', label: '온 가족', title: '역할 나눠 함께하기', explanation: '세대가 함께 이해하고 참여하도록 역할을 나눕니다.', steps: [{ title: '역할 정하기', body: '설명 담당, 준비 담당, 기록 담당을 나눕니다.' }, { title: '같이 인증', body: '얼굴 공개 없이 결과물 중심으로 기록합니다.' }], estimated_minutes: 35, proof_type: '가족 기록 카드', tone_note: '공동체 중심 말투' },
        { generation: 'foreign', label: '외국인', title: 'Local K-culture Tryout', explanation: 'K-culture context is explained simply without assuming prior knowledge.', steps: [{ title: 'Read context', body: 'Check what the trend means in simple language.' }, { title: 'Try locally', body: 'Connect it with one local food, place, or festival.' }], estimated_minutes: 30, proof_type: 'photo or short note', tone_note: 'simple English-friendly tone' },
      ],
      admin_gate: { status: 'needs_review', review_points: ['지역 연결이 억지스럽지 않은지 확인', '세대별 설명에 고정관념이 없는지 확인', '안전 문구 포함 여부 확인'] },
      confidence: 0.68,
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
  if (moduleName === 'verifyLocalMatch') {
    const inputObject = input as {
      trend?: Trend
      localAsset?: LocalAsset
      profiledScore?: { hardReject?: boolean; rejectReasons?: string[]; reasons?: string[] }
    }
    const rejected = Boolean(inputObject.profiledScore?.hardReject)
    return {
      verdict: rejected ? 'reject' : 'approve',
      explanation: rejected
        ? `프로필 기반 점수에서 ${inputObject.profiledScore?.rejectReasons?.[0] ?? '핵심 근거 부족'}이 감지되어 사용자 카드 연결 전 재검토가 필요합니다.`
        : `${inputObject.trend?.title ?? '선택 유행'}과 ${inputObject.localAsset?.name ?? '지역 자산'}은 행동, 장소, 문화 맥락 근거가 있어 관리자 검수 후보로 적합합니다.`,
      required_evidence: {
        trend_action: inputObject.profiledScore?.reasons?.[0] ?? '유행의 핵심 행동이 추출되었습니다.',
        asset_experience: inputObject.localAsset?.description ?? '지역 자산 체험 설명',
        local_reason: inputObject.profiledScore?.reasons?.join(' / ') ?? '지역 연결 근거',
      },
      missing_evidence: rejected ? inputObject.profiledScore?.rejectReasons ?? ['매칭 근거 부족'] : [],
      confidence: rejected ? 0.72 : 0.78,
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

export const generateTrendCardPackage = (input: { trend: Trend; candidate?: unknown; localAssets?: LocalAsset[] }) =>
  runStructured({
    moduleName: 'generateTrendCardPackage',
    schema: TrendCardPackageSchema,
    input,
    system: `You are TrendDo's senior Korean culture operations AI.
Generate a user-facing trend card package from a trend candidate.
Strict rules:
- Do not invent a historical origin. If uncertain, say it is an observed social/shortform signal.
- If the trend can cause portrait rights, privacy, harassment, minor safety, illegal action, copyright, or cultural distortion risk, warn clearly.
- If harmful content is severe, set allow_card_generation=false and explain blocked_reason.
- Create audience-specific cards for teen, 20s_30s, 40s_50s, 60_plus, family, foreigner.
- Create a Do-It todo with <=5 steps, low-cost materials, proof type, and safety notice.
- The output is an admin draft only and must require human approval before publication.`,
  })

export const generateExperienceCard = (input: unknown) =>
  runStructured({
    moduleName: 'generateExperienceCard',
    schema: ExperienceCardSchema,
    input,
    system: `You are TrendDo's culture conversion AI.
Create one beautiful admin-review experience card from selected trend keywords and a selected Korean region.
Do not merely concatenate "trend + region/place". Invent a fused cultural experience.
Example: If input is "두바이쫀득쿠키" and Gangwon/Gangneung has "감자떡", output an idea like "감자떡 쫀득쿠키 챌린지" or "초당두부 크림 쫀득쿠키" with steps that actually blend texture, ingredient, place, and story.
The card_title must be a new fused idea name, not "A + B" and not "A × region".
The local_story must explain exactly which local ingredient/place/tradition is transformed into which action.
Each generation_todo must include concrete fusion actions, not generic "choose a local element".
Reflect the user app generations exactly: teen, adult, senior, family, foreign.
For senior users, explain the trend more slowly and clearly.
For teen users, keep it short and action-oriented.
For family users, split roles across generations.
Never publish automatically. Return admin-review JSON only.`,
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

export const verifyLocalMatch = (trend: Trend, challenge: Challenge, localAsset: LocalAsset, scoreBreakdown: unknown, profiledScore: unknown) =>
  runStructured({
    moduleName: 'verifyLocalMatch',
    schema: LocalMatchVerificationSchema,
    input: { trend, challenge, localAsset, scoreBreakdown, profiledScore },
    system: `You are TrendDo's strict local culture matching verifier.
Approve only when the trend's core action can realistically happen through the local asset.
Reject food trends matched to places with no food, market, festival, cafe, recipe, or ingredient evidence.
Reject making/craft trends matched to places with no workshop, material, learning, or hands-on evidence.
Reject media/meme trends unless there is a clear exhibition, performance, heritage, festival, or local storytelling reason.
Return concise JSON for admin review; never invent evidence.`,
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
