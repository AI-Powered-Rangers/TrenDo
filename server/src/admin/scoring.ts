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
