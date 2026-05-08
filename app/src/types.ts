export type Generation = 'teen' | 'adult' | 'senior' | 'family'
export type Region =
  | 'seoul'
  | 'jeonju'
  | 'jeju'
  | 'busan'
  | 'gangneung'
  | 'daegu'
  | 'gwangju'
  | 'incheon'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Material {
  name: string
  amount: string
  buyLink?: string
}

export interface Step {
  order: number
  title: string
  body: string
  duration_minutes?: number
}

export interface GenerationVariant {
  generation: Generation
  title: string
  hook: string
  tone_note: string
}

export interface LocalVariant {
  region: Region
  title: string
  twist: string
  partner_place?: string
}

export interface TraditionConnection {
  label: string
  body: string
}

export interface ChallengeCard {
  id: string
  title: string
  trend_source: string
  emoji: string
  cover_gradient: string
  difficulty: Difficulty
  duration_minutes: number
  materials: Material[]
  steps: Step[]
  generation_variants: GenerationVariant[]
  local_variants: LocalVariant[]
  traditional_connection?: TraditionConnection
}

export interface TrendCardData {
  id: string
  title: string
  emoji: string
  cover_gradient: string
  views_24h: number
  generations_reached: Generation[]
  challenge_id: string
  short_pitch: string
  category: 'food' | 'fitness' | 'photo' | 'craft'
}

export interface RetentionRecord {
  challenge_id: string
  completion_rate: number
  day7_retention: number
  day30_retention: number
  became_hobby: number
  shared_with_family: number
  retention_score: number
  participants: number
}

export interface MapPin {
  region: Region
  region_label: string
  x: number
  y: number
  count: number
  top_challenge: string
}

export interface UserPrefs {
  generation: Generation
  region: Region
  onboarded: boolean
}

export interface CommunityPost {
  id: string
  challenge_id: string
  author_name: string
  author_emoji: string
  generation: Generation
  region: Region
  caption: string
  cover_gradient: string
  cover_emoji: string
  created_minutes_ago: number
  base_likes: number
  base_comments: number
  is_top: boolean
}

export interface SetlogEntry {
  id: string
  date: string // YYYY-MM-DD
  challenge_id?: string
  free_tag?: string
  mood: '🔥' | '💛' | '🌿' | '😴' | '✨'
  note: string
  cover_gradient?: string
  cover_emoji?: string
}

export interface XAIFeature {
  key: string
  label: string
  weight: number
  value: number // 0..100
}

export interface AdminTrendScore {
  challenge_id: string
  total: number
  trend_direction: 'rising' | 'stable' | 'declining'
  features: XAIFeature[]
  confidence: number
  sample_size: number
  risk_level: 'low' | 'medium' | 'high'
  model_trace: string[]
  evidence: string[]
  recommended_action: string
  top_reason: string
  caveat?: string
}
