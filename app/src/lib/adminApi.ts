export interface ScoreFactor {
  key: string
  label: string
  weight: number
  value: number
  contribution: number
}

export interface Trend {
  id: string
  title: string
  description: string
  source: string
  source_url?: string
  hashtags: string[]
  category: string
  collected_at: string
  provenance_label: string
  action_score?: { total: number; factors: ScoreFactor[] }
  surge_score?: { total: number; factors: ScoreFactor[] }
  evidence_refs?: string[]
}

export interface LocalAsset {
  id: string
  name: string
  asset_type: string
  region_code: string
  address: string
  latitude: number
  longitude: number
  description: string
  contact_email?: string
  provenance_label: string
}

export interface Challenge {
  id: string
  trend_id: string
  title: string
  description: string
  target_age_band: string
  estimated_cost: number
  estimated_minutes: number
  difficulty: string
  materials: string[]
  steps: { id: string; title: string; body: string }[]
  proof_type: string
  safety_notice: string
  status: string
  created_by_ai_run_id?: string
  score_breakdown?: { total: number; factors: ScoreFactor[] }
  provenance_label: string
  generation_variants?: { age_band: string; title: string; hook: string; caution: string }[]
  heritage_remix?: {
    heritage_elements: string[]
    connection_graph: { from: string; to: string; reason: string }[]
    appropriateness_score: { total: number; factors: ScoreFactor[] }
    cautions: string[]
  }
}

export interface SafetyReview {
  id: string
  challenge_id: string
  risk_level: 'low' | 'medium' | 'high'
  risk_categories: string[]
  flagged_text_spans: string[]
  explanation: string
  suggested_revision: string
  approval_recommendation: string
  reviewer_status: string
  created_by_ai_run_id?: string
  created_at: string
}

export interface LocalMatch {
  id: string
  trend_id: string
  challenge_id: string
  local_asset_id: string
  match_score: number
  semantic_similarity: number
  accessibility_score: number
  schedule_score: number
  difficulty_score: number
  proof_score: number
  explanation: string
  score_breakdown: { total: number; factors: ScoreFactor[] }
  created_by_ai_run_id?: string
}

export interface Proposal {
  id: string
  organization_name: string
  subject: string
  body: string
  expected_effects: string[]
  status: string
  created_by_ai_run_id?: string
}

export interface AiRun {
  id: string
  module_name: string
  model_name: string
  prompt_version: string
  input_json: unknown
  output_json: unknown
  confidence?: number
  latency_ms: number
  token_usage_json?: unknown
  status: string
  human_override: boolean
  created_at: string
  provenance_label: string
  error?: string
}

export interface Analytics {
  total_views: number
  total_saves: number
  total_starts: number
  total_completions: number
  total_proofs: number
  total_place_clicks: number
  total_map_opens: number
  start_rate: number
  completion_rate: number
  proof_rate: number
  place_click_rate: number
  visit_conversion_rate: number
  map_open_rate: number
  segment_breakdown_json: Record<string, any>
}

export interface AdminState {
  trends: Trend[]
  trendClusters: { id: string; name: string; representative_keywords: string[]; trend_ids: string[]; cluster_score: number }[]
  localAssets: LocalAsset[]
  challenges: Challenge[]
  safetyReviews: SafetyReview[]
  localMatches: LocalMatch[]
  proposals: Proposal[]
  analytics: Analytics
  impactReports: any[]
  aiRuns: AiRun[]
  doctorTargets: any[]
  runtime: { llm: string; dataApis: string; database: string; hasRealApi: boolean }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const adminApi = {
  state: () => request<AdminState>('/api/admin/state'),
  collectTrends: () => request('/api/admin/collect/trends', { method: 'POST', body: '{}' }),
  collectLocalAssets: () => request('/api/admin/collect/local-assets', { method: 'POST', body: '{}' }),
  embed: () => request('/api/admin/ai/embed', { method: 'POST', body: '{}' }),
  clusterTrends: () => request('/api/admin/ai/cluster-trends', { method: 'POST', body: '{}' }),
  runLearningLoop: () => request('/api/admin/ai/run-learning-loop', { method: 'POST', body: '{}' }),
  briefing: () => request('/api/admin/ai/briefing', { method: 'POST', body: '{}' }),
  translateByGeneration: (trend_id: string) => request('/api/admin/ai/translate-by-generation', { method: 'POST', body: JSON.stringify({ trend_id }) }),
  generateChallenge: (trend_id: string) => request('/api/admin/ai/generate-challenge', { method: 'POST', body: JSON.stringify({ trend_id }) }),
  heritageRemix: (challenge_id: string, trend_id: string) => request('/api/admin/ai/heritage-remix', { method: 'POST', body: JSON.stringify({ challenge_id, trend_id }) }),
  reviewSafety: (challenge_id: string) => request('/api/admin/ai/review-safety', { method: 'POST', body: JSON.stringify({ challenge_id }) }),
  matchLocalAssets: (challenge_id: string, trend_id: string) => request('/api/admin/ai/match-local-assets', { method: 'POST', body: JSON.stringify({ challenge_id, trend_id }) }),
  generateProposal: (local_match_id: string) => request('/api/admin/ai/generate-proposal', { method: 'POST', body: JSON.stringify({ local_match_id }) }),
  diagnose: () => request('/api/admin/analytics/diagnose', { method: 'POST', body: '{}' }),
  generateReport: () => request('/api/admin/reports/generate', { method: 'POST', body: '{}' }),
  decideChallenge: (challenge_id: string, status: 'approved' | 'rejected' | 'needs_review') => request(`/api/admin/challenges/${challenge_id}/decision`, { method: 'POST', body: JSON.stringify({ status }) }),
}
