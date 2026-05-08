export type ProvenanceLabel = 'real_api' | 'demo_seed' | 'mock_data' | 'derived'
export type AgeBand = 'teen' | '20s_30s' | '40s_50s' | '60_plus' | 'family'
export type RiskLevel = 'low' | 'medium' | 'high'
export type ReviewStatus = 'needs_review' | 'approved' | 'revise' | 'rejected'
export type ChallengeStatus = 'draft_ai' | 'needs_review' | 'approved' | 'published' | 'rejected'
export type AiRunStatus = 'success' | 'fallback' | 'failed'

export interface ScoreFactor {
  key: string
  label: string
  weight: number
  value: number
  contribution: number
  explanation?: string
}

export interface ScoreBreakdown {
  total: number
  factors: ScoreFactor[]
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
  raw_payload: unknown
  embedding?: number[]
  provenance_label: ProvenanceLabel
  action_score?: ScoreBreakdown
  surge_score?: ScoreBreakdown
  evidence_refs?: string[]
}

export interface TrendCluster {
  id: string
  name: string
  representative_keywords: string[]
  trend_ids: string[]
  cluster_score: number
  created_at: string
}

export interface LocalAsset {
  id: string
  name: string
  asset_type: 'festival' | 'market' | 'workshop' | 'exhibition' | 'tourism' | 'heritage' | 'culture_facility'
  region_code: string
  address: string
  latitude: number
  longitude: number
  start_date?: string
  end_date?: string
  description: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  source: string
  source_url?: string
  embedding?: number[]
  provenance_label: ProvenanceLabel
}

export interface Challenge {
  id: string
  trend_id: string
  title: string
  description: string
  target_age_band: AgeBand
  estimated_cost: number
  estimated_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  materials: string[]
  steps: { id: string; title: string; body: string }[]
  proof_type: string
  safety_notice: string
  status: ChallengeStatus
  created_by_ai_run_id?: string
  created_at: string
  updated_at: string
  score_breakdown?: ScoreBreakdown
  provenance_label: ProvenanceLabel
  generation_variants?: { age_band: AgeBand | 'foreigner'; title: string; hook: string; caution: string }[]
  heritage_remix?: {
    heritage_elements: string[]
    connection_graph: { from: string; to: string; reason: string }[]
    appropriateness_score: ScoreBreakdown
    cautions: string[]
  }
}

export interface SafetyReview {
  id: string
  challenge_id: string
  risk_level: RiskLevel
  risk_categories: string[]
  flagged_text_spans: string[]
  explanation: string
  suggested_revision: string
  approval_recommendation: 'approve' | 'revise' | 'reject'
  reviewer_status: ReviewStatus
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
  created_at: string
  score_breakdown: ScoreBreakdown
  created_by_ai_run_id?: string
}

export interface Proposal {
  id: string
  local_asset_id: string
  challenge_id: string
  organization_name: string
  contact_email?: string
  subject: string
  body: string
  expected_effects: string[]
  collaboration_steps: string[]
  required_confirmation: string[]
  risk_or_uncertainty: string[]
  status: 'draft_ai' | 'needs_review' | 'ready_to_send' | 'sent'
  created_by_ai_run_id?: string
  created_at: string
  sent_at?: string
}

export interface UserEvent {
  id: string
  event_name: string
  user_id_hash: string
  session_id: string
  age_band: AgeBand
  region_code: string
  trend_id?: string
  challenge_id?: string
  local_asset_id?: string
  step_id?: string
  variant_id?: string
  timestamp: string
  metadata: Record<string, unknown>
}

export interface AnalyticsSnapshot {
  id: string
  period_start: string
  period_end: string
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
  segment_breakdown_json: Record<string, unknown>
  created_at: string
}

export interface ImpactReport {
  id: string
  title: string
  period_start: string
  period_end: string
  summary: string
  metrics_json: Record<string, unknown>
  recommendations: string[]
  pdf_url?: string
  html_report?: string
  created_by_ai_run_id?: string
  created_at: string
}

export interface AiRun {
  id: string
  module_name: string
  model_name: string
  prompt_version: string
  input_ref_type?: string
  input_ref_id?: string
  input_json: unknown
  output_json: unknown
  confidence?: number
  latency_ms: number
  token_usage_json?: unknown
  cost_estimate?: number
  status: AiRunStatus
  human_override: boolean
  created_at: string
  provenance_label: ProvenanceLabel
  error?: string
}

export interface AdminDb {
  trends: Trend[]
  trendClusters: TrendCluster[]
  localAssets: LocalAsset[]
  challenges: Challenge[]
  safetyReviews: SafetyReview[]
  localMatches: LocalMatch[]
  proposals: Proposal[]
  userEvents: UserEvent[]
  analyticsSnapshots: AnalyticsSnapshot[]
  impactReports: ImpactReport[]
  aiRuns: AiRun[]
}
