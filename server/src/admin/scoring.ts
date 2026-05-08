import type { Challenge, LocalAsset, ScoreBreakdown, Trend } from './types.js'

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function cosineSimilarity(a?: number[], b?: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (!normA || !normB) return 0
  return Math.max(0, Math.min(1, dot / (Math.sqrt(normA) * Math.sqrt(normB))))
}

export function deterministicEmbedding(text: string, dimensions = 32): number[] {
  const vector = Array.from({ length: dimensions }, () => 0)
  for (let i = 0; i < text.length; i += 1) {
    const bucket = (text.charCodeAt(i) + i * 17) % dimensions
    vector[bucket] += ((text.charCodeAt(i) % 31) + 1) / 31
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map((value) => Number((value / norm).toFixed(6)))
}

export function calculateLocalMatchScore(input: {
  semantic_similarity: number
  accessibility_score: number
  schedule_score: number
  difficulty_score: number
  proof_score: number
}): ScoreBreakdown {
  const factors = [
    { key: 'semantic_similarity', label: '의미 유사도', weight: 0.3, value: clampScore(input.semantic_similarity) },
    { key: 'accessibility_score', label: '접근성', weight: 0.2, value: clampScore(input.accessibility_score) },
    { key: 'schedule_score', label: '일정 적합성', weight: 0.2, value: clampScore(input.schedule_score) },
    { key: 'difficulty_score', label: '난이도 적합성', weight: 0.15, value: clampScore(input.difficulty_score) },
    { key: 'proof_score', label: '인증 가능성', weight: 0.15, value: clampScore(input.proof_score) },
  ].map((factor) => ({ ...factor, contribution: Number((factor.weight * factor.value).toFixed(2)) }))
  return { total: clampScore(factors.reduce((sum, factor) => sum + factor.contribution, 0)), factors }
}

export interface TrendProfile {
  category: string
  actions: string[]
  materials: string[]
  placeNeeds: string[]
  themes: string[]
  risks: string[]
}

export interface LocalAssetProfile {
  assetType: LocalAsset['asset_type']
  placeTypes: string[]
  experienceTypes: string[]
  materials: string[]
  themes: string[]
  hasSchedule: boolean
  hasCoordinates: boolean
}

export interface ProfiledLocalMatch {
  score: ScoreBreakdown
  hardReject: boolean
  rejectReasons: string[]
  reasons: string[]
  trendProfile: TrendProfile
  assetProfile: LocalAssetProfile
}

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)))

function textHas(text: string, pattern: RegExp) {
  return pattern.test(text)
}

function overlapList(left: string[], right: string[]) {
  const rightSet = new Set(right)
  return left.filter((item) => rightSet.has(item))
}

function weightedScore(factors: Array<{ key: string; label: string; weight: number; value: number; explanation?: string }>): ScoreBreakdown {
  const normalized = factors.map((factor) => ({
    ...factor,
    value: clampScore(factor.value),
    contribution: Number((factor.weight * clampScore(factor.value)).toFixed(2)),
  }))
  return { total: clampScore(normalized.reduce((sum, factor) => sum + factor.contribution, 0)), factors: normalized }
}

export function profileTrend(trend: Trend): TrendProfile {
  const text = `${trend.title} ${trend.description} ${trend.hashtags.join(' ')} ${trend.category}`.toLowerCase()
  const actions: string[] = []
  const materials: string[] = []
  const placeNeeds: string[] = []
  const themes: string[] = []
  const risks: string[] = []

  if (trend.category === 'food' || textHas(text, /디저트|빵|쿠키|케이크|떡|약과|한과|불닭|라면|냉면|쭈꾸미|젤리|비빔밥|먹방|간식|요리|카페|맛집/)) {
    actions.push('eat', 'make', 'buy')
    materials.push('food', 'dessert')
    placeNeeds.push('market', 'kitchen', 'cafe', 'food_festival')
    themes.push('food_culture')
  }
  if (trend.category === 'craft' || textHas(text, /꾸미기|공방|원데이|자개|한지|민화|서예|도자기|만들기|손글씨|소품|말랑/)) {
    actions.push('make', 'learn')
    materials.push('craft_material')
    placeNeeds.push('workshop', 'culture_facility')
    themes.push('craft', 'heritage_remix')
  }
  if (trend.category === 'activity' || trend.category === 'challenge' || textHas(text, /챌린지|러닝|운동|산책|걷기|투어|방문|직관|체험|스탬프|랜덤|크루|버터런/)) {
    actions.push('move', 'visit', 'participate')
    placeNeeds.push('street', 'park', 'festival', 'market', 'tourism')
    themes.push('participation')
  }
  if (textHas(text, /사진|포토|릴스|쇼츠|영상|직관샷|ai 영상|인증|촬영|브이로그|숏폼/)) {
    actions.push('photo', 'record')
    placeNeeds.push('street', 'heritage', 'festival', 'tourism')
    themes.push('shortform')
    risks.push('portrait_rights')
  }
  if (trend.category === 'media' || textHas(text, /드라마|예능|ott|밈|왕|요리사|환승연애|살목지|기리고|캐릭터|음악|댄스/)) {
    actions.push('watch', 'talk', 'remix')
    placeNeeds.push('exhibition', 'culture_facility', 'heritage', 'festival')
    themes.push('media_context')
  }
  if (textHas(text, /전통|한옥|시장|축제|한복|탈춤|장단|민속|제철|지역|로컬|문화/)) {
    themes.push('local_culture', 'heritage')
    placeNeeds.push('heritage', 'market', 'festival')
  }
  if (textHas(text, /초상권|얼굴|무단|몰래|학교|좌석|개인정보|미성년/)) risks.push('privacy')
  if (textHas(text, /위험|불법|무단침입|화상|추락|과격/)) risks.push('physical_risk')
  if (textHas(text, /조롱|괴롭힘|따라하기|비하|혐오/)) risks.push('harassment')

  return {
    category: trend.category,
    actions: unique(actions.length ? actions : ['visit', 'record']),
    materials: unique(materials.length ? materials : ['context']),
    placeNeeds: unique(placeNeeds.length ? placeNeeds : ['culture_facility', 'festival']),
    themes: unique(themes.length ? themes : ['popular_culture']),
    risks: unique(risks),
  }
}

export function profileLocalAsset(asset: LocalAsset): LocalAssetProfile {
  const text = `${asset.name} ${asset.asset_type} ${asset.address} ${asset.description}`.toLowerCase()
  const placeTypes: string[] = []
  const experienceTypes: string[] = []
  const materials: string[] = []
  const themes: string[] = []

  const byType: Record<LocalAsset['asset_type'], Partial<LocalAssetProfile>> = {
    market: { placeTypes: ['market'], experienceTypes: ['buy', 'eat', 'visit'], materials: ['food', 'local_product'], themes: ['local_culture', 'food_culture'] },
    workshop: { placeTypes: ['workshop'], experienceTypes: ['make', 'learn'], materials: ['craft_material'], themes: ['craft', 'heritage_remix'] },
    festival: { placeTypes: ['festival'], experienceTypes: ['participate', 'watch', 'eat', 'photo', 'visit'], materials: ['food', 'local_product', 'context'], themes: ['local_culture', 'participation'] },
    exhibition: { placeTypes: ['exhibition', 'culture_facility'], experienceTypes: ['watch', 'learn', 'photo'], materials: ['context'], themes: ['media_context', 'heritage'] },
    tourism: { placeTypes: ['tourism', 'street'], experienceTypes: ['visit', 'walk', 'photo'], materials: ['context'], themes: ['local_culture', 'shortform'] },
    heritage: { placeTypes: ['heritage'], experienceTypes: ['learn', 'photo', 'visit'], materials: ['context'], themes: ['heritage', 'local_culture'] },
    culture_facility: { placeTypes: ['culture_facility'], experienceTypes: ['learn', 'watch', 'make'], materials: ['context', 'craft_material'], themes: ['heritage', 'craft', 'media_context'] },
  }

  const seeded = byType[asset.asset_type]
  placeTypes.push(...(seeded.placeTypes ?? []))
  experienceTypes.push(...(seeded.experienceTypes ?? []))
  materials.push(...(seeded.materials ?? []))
  themes.push(...(seeded.themes ?? []))

  if (textHas(text, /시장|야시장|먹거리|맛집|음식|식문화|푸드|떡|한과|약과|비빔밥|빵|카페|디저트|특산|로컬푸드/)) {
    placeTypes.push('market', 'cafe', 'food_festival')
    experienceTypes.push('eat', 'buy')
    materials.push('food', 'dessert', 'local_product')
    themes.push('food_culture')
  }
  if (textHas(text, /공방|체험|만들기|한지|자개|민화|도자기|서예|공예|원데이/)) {
    placeTypes.push('workshop')
    experienceTypes.push('make', 'learn')
    materials.push('craft_material')
    themes.push('craft', 'heritage_remix')
  }
  if (textHas(text, /축제|페스티벌|장터|퍼레이드|공연|유등|단오|머드/)) {
    placeTypes.push('festival')
    experienceTypes.push('participate', 'watch', 'photo', 'visit')
    themes.push('participation', 'local_culture')
  }
  if (textHas(text, /한옥|궁|문화재|유산|전통|탈춤|장단|민속|종가|해녀/)) {
    placeTypes.push('heritage')
    experienceTypes.push('learn', 'photo', 'visit')
    themes.push('heritage')
  }
  if (textHas(text, /골목|거리|공원|해변|산책|러닝|코스|관광|마을/)) {
    placeTypes.push('street', 'park', 'tourism')
    experienceTypes.push('walk', 'visit', 'photo')
    themes.push('shortform', 'local_culture')
  }

  return {
    assetType: asset.asset_type,
    placeTypes: unique(placeTypes),
    experienceTypes: unique(experienceTypes),
    materials: unique(materials),
    themes: unique(themes),
    hasSchedule: Boolean(asset.start_date && asset.end_date),
    hasCoordinates: Boolean(asset.latitude && asset.longitude),
  }
}

export function scoreProfiledLocalMatch(trend: Trend, asset: LocalAsset, challenge?: Challenge): ProfiledLocalMatch {
  const trendProfile = profileTrend(trend)
  const assetProfile = profileLocalAsset(asset)
  const trendText = `${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`.toLowerCase()
  const assetText = `${asset.name} ${asset.description} ${asset.address}`.toLowerCase()
  const rejectReasons: string[] = []

  const categoryFood = trend.category === 'food' || trendProfile.materials.includes('food') || trendProfile.materials.includes('dessert')
  const assetFoodReady = assetProfile.materials.some((item) => ['food', 'dessert', 'local_product'].includes(item)) || assetProfile.placeTypes.some((item) => ['market', 'cafe', 'food_festival'].includes(item))
  if (categoryFood && !assetFoodReady) {
    rejectReasons.push('음식/디저트 유행인데 먹거리, 시장, 식문화, 축제 근거가 부족합니다.')
  }

  const makeTrend = trendProfile.actions.includes('make')
  const makeReady = assetProfile.experienceTypes.includes('make') || assetProfile.placeTypes.includes('workshop') || /체험|만들기|공방|교육/.test(assetText)
  if (makeTrend && !makeReady && !categoryFood) {
    rejectReasons.push('만들기형 유행인데 공방, 체험, 재료 구매 근거가 부족합니다.')
  }

  const movementTrend = trendProfile.actions.includes('move') || /러닝|산책|걷기|투어|크루/.test(trendText)
  const movementReady = assetProfile.experienceTypes.some((item) => ['walk', 'visit', 'participate'].includes(item)) || assetProfile.placeTypes.some((item) => ['street', 'park', 'festival', 'tourism'].includes(item))
  if (movementTrend && !movementReady) {
    rejectReasons.push('이동/참여형 유행인데 실제 방문 동선이나 야외 참여 근거가 부족합니다.')
  }

  if (trend.category === 'media' && !overlapList(trendProfile.themes, assetProfile.themes).length && !/전시|공연|문화|축제|한옥|궁|시장/.test(assetText)) {
    rejectReasons.push('미디어/밈 유행을 지역 경험으로 바꿀 문화 맥락 근거가 부족합니다.')
  }

  const actionOverlap = overlapList(trendProfile.actions, assetProfile.experienceTypes)
  const placeOverlap = overlapList(trendProfile.placeNeeds, assetProfile.placeTypes)
  const materialOverlap = overlapList(trendProfile.materials, assetProfile.materials)
  const themeOverlap = overlapList(trendProfile.themes, assetProfile.themes)

  const categoryFit = categoryFood
    ? assetFoodReady ? 92 : 22
    : trend.category === 'craft'
      ? makeReady ? 88 : 38
      : trend.category === 'activity' || trend.category === 'challenge'
        ? movementReady ? 86 : 34
        : clampScore(58 + themeOverlap.length * 16 + placeOverlap.length * 8)
  const actionFit = clampScore(42 + actionOverlap.length * 22 + (makeTrend && makeReady ? 12 : 0) + (movementTrend && movementReady ? 12 : 0))
  const materialThemeFit = clampScore(36 + materialOverlap.length * 18 + themeOverlap.length * 16)
  const placeFit = clampScore(34 + placeOverlap.length * 20 + (assetProfile.hasCoordinates ? 8 : 0))
  const seasonalFit = assetProfile.hasSchedule ? 84 : asset.asset_type === 'festival' ? 70 : 62
  const safetyFit = clampScore(88 - trendProfile.risks.length * 12 - (/미성년|초상권|개인정보/.test(`${challenge?.safety_notice ?? ''} ${challenge?.description ?? ''}`) ? 8 : 0))

  const reasons = [
    actionOverlap.length ? `행동 매칭: ${actionOverlap.join(', ')}` : '',
    placeOverlap.length ? `장소 매칭: ${placeOverlap.join(', ')}` : '',
    materialOverlap.length ? `재료/소재 매칭: ${materialOverlap.join(', ')}` : '',
    themeOverlap.length ? `문화 맥락 매칭: ${themeOverlap.join(', ')}` : '',
    assetProfile.hasSchedule ? '행사 일정 데이터가 있어 기간형 챌린지로 운영 가능합니다.' : '',
  ].filter(Boolean)

  const score = weightedScore([
    { key: 'category_fit', label: '카테고리 적합성', weight: 0.25, value: categoryFit, explanation: '음식은 먹거리/시장/축제, 만들기는 공방/체험처럼 기본 용도부터 맞춥니다.' },
    { key: 'action_fit', label: '행동 적합성', weight: 0.2, value: actionFit, explanation: '유행의 핵심 행동과 지역 자산에서 가능한 체험을 비교합니다.' },
    { key: 'material_theme_fit', label: '소재·문화 맥락', weight: 0.2, value: materialThemeFit, explanation: '재료, 전통 요소, 문화 키워드가 겹치는지 봅니다.' },
    { key: 'place_fit', label: '장소 논리성', weight: 0.15, value: placeFit, explanation: '실제로 어디서 수행해야 자연스러운지 검토합니다.' },
    { key: 'seasonal_fit', label: '일정/운영성', weight: 0.1, value: seasonalFit, explanation: '진행 중 행사나 상시 운영 여부를 반영합니다.' },
    { key: 'safety_fit', label: '안전/검수 부담', weight: 0.1, value: safetyFit, explanation: '초상권, 개인정보, 위험 행동 가능성을 감점합니다.' },
  ])

  const hardReject = rejectReasons.length > 0 && score.total < 68
  return {
    score: hardReject ? { ...score, total: Math.min(score.total, 46) } : score,
    hardReject,
    rejectReasons,
    reasons: reasons.length ? reasons : ['텍스트 유사도보다 행동·장소·소재 논리를 기준으로 연결했습니다.'],
    trendProfile,
    assetProfile,
  }
}

export function calculateTrendToActionScore(input: {
  execution_ease: number
  local_connectivity: number
  safety_score: number
  generation_expandability: number
  cost_accessibility: number
  proofability: number
}): ScoreBreakdown {
  const factors = [
    { key: 'execution_ease', label: '실행 쉬움', weight: 0.25, value: clampScore(input.execution_ease) },
    { key: 'local_connectivity', label: '지역 연결성', weight: 0.2, value: clampScore(input.local_connectivity) },
    { key: 'safety_score', label: '안전성', weight: 0.2, value: clampScore(input.safety_score) },
    { key: 'generation_expandability', label: '세대 확장성', weight: 0.15, value: clampScore(input.generation_expandability) },
    { key: 'cost_accessibility', label: '비용 접근성', weight: 0.1, value: clampScore(input.cost_accessibility) },
    { key: 'proofability', label: '인증 가능성', weight: 0.1, value: clampScore(input.proofability) },
  ].map((factor) => ({ ...factor, contribution: Number((factor.weight * factor.value).toFixed(2)) }))
  return { total: clampScore(factors.reduce((sum, factor) => sum + factor.contribution, 0)), factors }
}

export function scoreTrend(trend: Trend): ScoreBreakdown {
  const hashtagBoost = Math.min(100, 45 + trend.hashtags.length * 10)
  const textSize = Math.min(100, 45 + trend.description.length / 3)
  return calculateTrendToActionScore({
    execution_ease: trend.category === 'food' || trend.category === 'craft' ? 84 : 68,
    local_connectivity: /전통|시장|지역|축제|공방|문화/.test(trend.description) ? 88 : 62,
    safety_score: /위험|불꽃|과격/.test(trend.description) ? 55 : 86,
    generation_expandability: hashtagBoost,
    cost_accessibility: trend.category === 'tourism' ? 62 : 82,
    proofability: textSize,
  })
}

export function scoreSurge(rawPayload: unknown): ScoreBreakdown {
  const raw = (rawPayload ?? {}) as Record<string, unknown>
  const views = Number(raw.views_24h ?? 0)
  const saves = Number(raw.saves ?? 0)
  const comments = Number(raw.comments ?? 0)
  const frequency = Number(raw.frequency ?? 0)
  const factors = [
    { key: 'view_velocity', label: '조회 속도', weight: 0.35, value: clampScore(Math.log10(views + 1) * 15) },
    { key: 'save_intent', label: '저장 의도', weight: 0.25, value: clampScore((saves / Math.max(1, views)) * 2500) },
    { key: 'conversation', label: '댓글/대화량', weight: 0.2, value: clampScore(Math.log10(comments + 1) * 20) },
    { key: 'appearance_frequency', label: '등장 빈도', weight: 0.2, value: clampScore(frequency || 64) },
  ].map((factor) => ({ ...factor, contribution: Number((factor.weight * factor.value).toFixed(2)) }))
  return { total: clampScore(factors.reduce((sum, factor) => sum + factor.contribution, 0)), factors }
}

export function scoreHeritageFit(input: { semantic: number; respect: number; locality: number; participation: number }): ScoreBreakdown {
  const factors = [
    { key: 'semantic_fit', label: '의미 연결성', weight: 0.3, value: clampScore(input.semantic) },
    { key: 'cultural_respect', label: '문화 존중성', weight: 0.25, value: clampScore(input.respect) },
    { key: 'locality', label: '지역성', weight: 0.25, value: clampScore(input.locality) },
    { key: 'participation_fit', label: '참여 적합성', weight: 0.2, value: clampScore(input.participation) },
  ].map((factor) => ({ ...factor, contribution: Number((factor.weight * factor.value).toFixed(2)) }))
  return { total: clampScore(factors.reduce((sum, factor) => sum + factor.contribution, 0)), factors }
}

export function scoreAssetForChallenge(asset: LocalAsset, challenge: Challenge): Omit<ReturnType<typeof calculateLocalMatchScore>, 'factors'> & ScoreBreakdown {
  const semantic = cosineSimilarity(asset.embedding, deterministicEmbedding(`${challenge.title} ${challenge.description}`)) * 100
  const accessibility = asset.latitude && asset.longitude ? 82 : 45
  const schedule = asset.start_date && asset.end_date ? 86 : 68
  const difficulty = challenge.difficulty === 'easy' ? 88 : challenge.difficulty === 'medium' ? 74 : 58
  const proof = /사진|인증|방문|영수증|스탬프/.test(challenge.proof_type) ? 86 : 64
  return calculateLocalMatchScore({
    semantic_similarity: semantic,
    accessibility_score: accessibility,
    schedule_score: schedule,
    difficulty_score: difficulty,
    proof_score: proof,
  })
}
