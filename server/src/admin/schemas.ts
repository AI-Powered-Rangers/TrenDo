import { z } from 'zod'

export const TrendContextSchema = z.object({
  summary: z.string(),
  cultural_meaning: z.string(),
  audience_insights: z.array(z.string()),
  source_limits: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const GenerationTranslationSchema = z.object({
  variants: z.array(
    z.object({
      age_band: z.enum(['teen', '20s_30s', '40s_50s', '60_plus', 'family', 'foreigner']),
      title: z.string(),
      hook: z.string(),
      caution: z.string(),
    }),
  ),
  confidence: z.number().min(0).max(1),
})

export const AdminBriefingSchema = z.object({
  headline: z.string(),
  briefing: z.string(),
  recommended_actions: z.array(z.string()),
  risk_alerts: z.array(z.string()),
  evidence_refs: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const HeritageRemixSchema = z.object({
  heritage_elements: z.array(z.string()),
  connection_graph: z.array(z.object({ from: z.string(), to: z.string(), reason: z.string() })),
  cultural_fit_score: z.number().min(0).max(100),
  cautions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const ChallengeGenerationSchema = z.object({
  title: z.string(),
  description: z.string(),
  target_age_band: z.enum(['teen', '20s_30s', '40s_50s', '60_plus', 'family']),
  estimated_cost: z.number().min(0),
  estimated_minutes: z.number().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  materials: z.array(z.string()),
  steps: z.array(z.object({ title: z.string(), body: z.string() })),
  proof_type: z.string(),
  safety_notice: z.string(),
  score_inputs: z.object({
    execution_ease: z.number().min(0).max(100),
    local_connectivity: z.number().min(0).max(100),
    safety_score: z.number().min(0).max(100),
    generation_expandability: z.number().min(0).max(100),
    cost_accessibility: z.number().min(0).max(100),
    proofability: z.number().min(0).max(100),
  }),
  confidence: z.number().min(0).max(1),
})

export const SafetyReviewSchema = z.object({
  risk_level: z.enum(['low', 'medium', 'high']),
  risk_categories: z.array(
    z.enum([
      'physical_risk',
      'hate',
      'harassment',
      'privacy',
      'copyright',
      'local_inappropriateness',
      'minor_inappropriate',
    ]),
  ),
  flagged_text_spans: z.array(z.string()),
  explanation: z.string(),
  suggested_revision: z.string(),
  approval_recommendation: z.enum(['approve', 'revise', 'reject']),
  confidence: z.number().min(0).max(1),
})

export const LocalMatchExplanationSchema = z.object({
  explanation: z.string(),
  top_reasons: z.array(z.string()),
  limits: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const LocalMatchVerificationSchema = z.object({
  verdict: z.enum(['approve', 'revise', 'reject']),
  explanation: z.string(),
  required_evidence: z.object({
    trend_action: z.string(),
    asset_experience: z.string(),
    local_reason: z.string(),
  }),
  missing_evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const ProposalEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
  expected_effects: z.array(z.string()),
  collaboration_steps: z.array(z.string()),
  required_confirmation: z.array(z.string()),
  risk_or_uncertainty: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

export const AnalyticsDiagnosisSchema = z.object({
  problem_summary: z.string(),
  evidence_metrics: z.array(z.string()),
  likely_causes: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  expected_impact_label: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
})

export const ImpactReportSchema = z.object({
  title: z.string(),
  summary: z.string(),
  metrics: z.array(z.string()),
  recommendations: z.array(z.string()),
  public_value_radar: z.object({
    accessibility: z.number().min(0).max(100),
    local_economy: z.number().min(0).max(100),
    cultural_continuity: z.number().min(0).max(100),
    generation_bridge: z.number().min(0).max(100),
    safety: z.number().min(0).max(100),
  }),
  confidence: z.number().min(0).max(1),
})

export const TrendCardPackageSchema = z.object({
  safety_gate: z.object({
    allow_card_generation: z.boolean(),
    risk_level: z.enum(['low', 'medium', 'high']),
    detected_harmful_elements: z.array(z.string()),
    caution_messages: z.array(z.string()),
    blocked_reason: z.string().nullable(),
  }),
  base_card: z.object({
    title: z.string(),
    one_line_summary: z.string(),
    category: z.array(z.string()),
    cultural_context: z.object({
      origin_or_background: z.string(),
      meaning: z.string(),
      caution: z.string(),
      source_limits: z.array(z.string()),
    }),
    recommended_targets: z.array(z.string()),
    local_connection_idea: z.string(),
    traditional_remix_idea: z.string(),
  }),
  audience_cards: z.array(z.object({
    audience: z.enum(['teen', '20s_30s', '40s_50s', '60_plus', 'family', 'foreigner']),
    card_title: z.string(),
    hook: z.string(),
    explanation: z.string(),
    tone_caution: z.string(),
    accessibility_note: z.string(),
  })),
  todo: z.object({
    title: z.string(),
    estimated_minutes: z.number().min(1),
    estimated_cost: z.number().min(0),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    materials: z.array(z.string()),
    steps: z.array(z.object({ title: z.string(), body: z.string() })).min(1).max(5),
    proof_type: z.string(),
    safety_notice: z.string(),
  }),
  xai: z.object({
    top_reasons: z.array(z.string()),
    deduction_reasons: z.array(z.string()),
    evidence_refs: z.array(z.string()),
    uncertainty: z.array(z.string()),
  }),
  confidence: z.number().min(0).max(1),
})

export const ExperienceCardSchema = z.object({
  card_title: z.string(),
  emoji: z.string(),
  subtitle: z.string(),
  local_story: z.string(),
  region_label: z.string(),
  selected_trends: z.array(z.string()),
  local_keywords: z.array(z.string()),
  safety_notice: z.string(),
  xai: z.object({
    match_score: z.number().min(0).max(100),
    reasons: z.array(z.string()),
    cautions: z.array(z.string()),
    evidence_refs: z.array(z.string()),
  }),
  generation_todos: z.array(z.object({
    generation: z.enum(['teen', 'adult', 'senior', 'family', 'foreign']),
    label: z.string(),
    title: z.string(),
    explanation: z.string(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })).min(1).max(5),
    estimated_minutes: z.number().min(1),
    proof_type: z.string(),
    tone_note: z.string(),
  })),
  admin_gate: z.object({
    status: z.enum(['needs_review', 'blocked']),
    review_points: z.array(z.string()),
  }),
  confidence: z.number().min(0).max(1),
})

export type TrendContextOutput = z.infer<typeof TrendContextSchema>
export type ChallengeGenerationOutput = z.infer<typeof ChallengeGenerationSchema>
export type SafetyReviewOutput = z.infer<typeof SafetyReviewSchema>
export type ProposalEmailOutput = z.infer<typeof ProposalEmailSchema>
export type TrendCardPackageOutput = z.infer<typeof TrendCardPackageSchema>
export type ExperienceCardOutput = z.infer<typeof ExperienceCardSchema>
export type LocalMatchVerificationOutput = z.infer<typeof LocalMatchVerificationSchema>
