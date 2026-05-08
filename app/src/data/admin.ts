import type { AdminTrendScore } from '../types'

// 가중치는 모든 트렌드에 동일하게 적용 — XAI에서 "왜 이 점수인가" 설명에 그대로 사용.
export const FEATURE_WEIGHTS = {
  view_growth: 0.18,
  generation_diversity: 0.22,
  region_spread: 0.18,
  tradition_link: 0.14,
  family_share: 0.18,
  retention: 0.1,
}

export const FEATURE_LABEL: Record<string, string> = {
  view_growth: '시청 증가율',
  generation_diversity: '세대 다양성',
  region_spread: '지역 확산',
  tradition_link: '전통 연결 강도',
  family_share: '가족 공유율',
  retention: '잔존율',
}

export const FEATURE_DESCRIPTION: Record<string, string> = {
  view_growth: '24시간 신규 시청 대비 어제 대비 변화율',
  generation_diversity: '4개 세대 도달의 균형도 (엔트로피)',
  region_spread: '8개 지역 중 평균 이상 활동이 일어난 비율',
  tradition_link: 'AI가 탐지한 유행 ↔ 전통문화 연결 신뢰도',
  family_share: '챌린지 결과를 가족 단위로 공유한 비율',
  retention: '7일 후 챌린지를 다시 수행한 비율',
}

export interface ModelHealthMetric {
  label: string
  value: string
  detail: string
  tone: 'good' | 'watch' | 'risk'
}

export const MODEL_HEALTH: ModelHealthMetric[] = [
  {
    label: '실시간 신호',
    value: '8.1M',
    detail: '숏폼 조회·커뮤니티 게시·셋로그 이벤트',
    tone: 'good',
  },
  {
    label: '설명 가능 커버리지',
    value: '94%',
    detail: '상위 20개 트렌드 중 근거 3개 이상 보유',
    tone: 'good',
  },
  {
    label: '편향 감시',
    value: '2건',
    detail: '10대 쏠림·지역 표본 부족 경고',
    tone: 'watch',
  },
  {
    label: '운영 큐',
    value: '7개',
    detail: '재번역·로컬 파트너·잔존 팔로업 후보',
    tone: 'watch',
  },
]

export interface AIPipelineStage {
  id: string
  label: string
  tech: string
  output: string
}

export const AI_PIPELINE: AIPipelineStage[] = [
  {
    id: 'ingest',
    label: 'Signal Ingestion',
    tech: 'event stream + feature store',
    output: '조회 급등, 게시 속도, 좋아요·공유 이벤트를 15분 단위 피처로 정규화',
  },
  {
    id: 'embed',
    label: 'Trend Embedding',
    tech: 'multimodal embedding',
    output: '제목·캡션·행동 단계를 같은 벡터 공간에 올려 유행 간 거리를 계산',
  },
  {
    id: 'translate',
    label: 'Generation Translator',
    tech: 'tone policy + rule-constrained LLM',
    output: '세대별 톤, 난이도, 안전 문장을 제약 조건으로 두고 챌린지 문안을 재작성',
  },
  {
    id: 'culture',
    label: 'Culture RAG',
    tech: 'tradition retrieval + grounding score',
    output: '전통문화 연결 후보를 검색하고 근거 신뢰도를 별도 점수로 분리',
  },
  {
    id: 'explain',
    label: 'XAI Attribution',
    tech: 'weighted attribution + counter-signal',
    output: '모델 점수, 최대 기여 피처, 반대 신호, 표본 한계를 관리자에게 노출',
  },
]

export interface XAIGuardrail {
  label: string
  body: string
}

export const XAI_GUARDRAILS: XAIGuardrail[] = [
  {
    label: '표본 크기',
    body: 'n<300 지역은 확산 점수를 보수적으로 표시하고 caveat를 강제 노출합니다.',
  },
  {
    label: '세대 쏠림',
    body: '한 세대 비중이 70%를 넘으면 신규 유행이어도 잔존 추천을 낮춥니다.',
  },
  {
    label: '전통 연결',
    body: '검색 근거가 약한 연결은 점수에 넣지 않고 운영자 검수 큐로 보냅니다.',
  },
  {
    label: '절기성',
    body: '봄동처럼 계절 피크가 있는 챌린지는 종료 시점에 자동 페널티를 제안합니다.',
  },
]

export const ADMIN_TREND_SCORES: AdminTrendScore[] = [
  {
    challenge_id: 'ch-dujjonku',
    total: 87,
    trend_direction: 'rising',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 92 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 89 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 81 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 86 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 95 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 71 },
    ],
    confidence: 0.91,
    sample_size: 48231,
    risk_level: 'medium',
    model_trace: [
      '24h view_growth 92: TikTok·Reels 유입과 커뮤니티 재게시가 동시에 상승',
      'generation_diversity 89: 10대 시작 후 30·40대, 가족 계정으로 빠르게 확산',
      'family_share 95: 인증 게시물의 가족 동반 캡션 비중이 최상위',
    ],
    evidence: [
      '#흑임자두쫀쿠 게시물 24h +4.2×',
      '전주·서울 지역에서 평균 대비 2.6× 저장',
      '찹쌀떡·약과 연결 설명 클릭률 31%',
    ],
    recommended_action:
      '전주 흑임자 버전을 홈 상단에 48시간 고정하고, 50·60대 친절 단계 문안을 A/B 테스트합니다.',
    top_reason:
      '가족 공유율(0.18×95)과 세대 다양성(0.22×89) 기여가 압도적. 전통 연결(찹쌀떡)이 외부 검색 유입을 만들어 시청 증가율을 끌어올림.',
    caveat: '서울·전주 외 지역의 신뢰도가 낮음 (n<300). 지역 확산 점수는 추가 표본이 필요.',
  },
  {
    challenge_id: 'ch-baseball-face',
    total: 78,
    trend_direction: 'rising',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 96 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 72 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 84 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 81 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 64 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 49 },
    ],
    confidence: 0.84,
    sample_size: 36520,
    risk_level: 'high',
    model_trace: [
      'view_growth 96: 경기 일정 직후 10대 중심 검색과 공유가 급등',
      'retention 49: 같은 사용자의 D+7 재수행이 낮아 단발성 위험',
      'tradition_link 81: 탈춤 표정 연결은 반응이 좋지만 아직 저장 전환은 약함',
    ],
    evidence: [
      '#야구표정3컷 24h 게시 2,880개',
      '10대 작성자 비중 73%',
      '완료율 93% 대비 D+7 잔존 18%',
    ],
    recommended_action:
      '가족 단체 표정 템플릿을 추가해 세대 다양성을 보강하고, D+3 리마인드 셋로그를 제안합니다.',
    top_reason:
      '시청 증가율(96)이 1위지만 잔존율(49)이 낮음 — 지금의 조회수 대부분이 "한 번 따라하고 끝나는" 행동. 전통(탈춤) 연결이 잔존율을 끌어올릴 후보.',
  },
  {
    challenge_id: 'ch-butter-run',
    total: 71,
    trend_direction: 'stable',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 64 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 76 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 68 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 58 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 62 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 88 },
    ],
    confidence: 0.88,
    sample_size: 22194,
    risk_level: 'low',
    model_trace: [
      'retention 88: 반복 수행과 셋로그 연결이 가장 강함',
      'view_growth 64: 신규 유입은 안정권이지만 폭발 신호는 제한적',
      'generation_diversity 76: 30·40대와 가족 세그먼트에서 루틴화',
    ],
    evidence: [
      '7일 이상 반복 게시자 비중 38%',
      '#한강버터런 게시물은 정체지만 저장 취소율 낮음',
      '아침 시간대 셋로그 연결률 27%',
    ],
    recommended_action:
      '조회수 캠페인보다 주간 루틴 배지를 붙이고, 지도에서는 한강·해변 코스를 묶어 추천합니다.',
    top_reason:
      '잔존율(88)이 압도적 — 한 번 시작한 사람이 계속 함. "한 줄 영상" 보다 "주간 루틴"으로 자리잡는 중.',
  },
  {
    challenge_id: 'ch-bomdong',
    total: 66,
    trend_direction: 'declining',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 41 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 70 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 58 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 92 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 78 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 66 },
    ],
    confidence: 0.79,
    sample_size: 12904,
    risk_level: 'medium',
    model_trace: [
      'tradition_link 92: 춘분·봄나물 검색 근거가 매우 강함',
      'view_growth 41: 절기 피크 이후 신규 조회가 빠르게 감소',
      'family_share 78: 가족 식사 맥락에서는 여전히 확산 가능',
    ],
    evidence: [
      '24h 신규 게시물 -34%',
      '전통 연결 설명 저장률 29%',
      '50·60대 완성률 81%',
    ],
    recommended_action:
      '메인 랭킹 노출은 줄이고, 내년 춘분 재활성화 큐와 지역 제철 음식 묶음으로 보관합니다.',
    top_reason:
      '전통 연결(춘분)이 92점으로 매우 강함 — 그러나 절기성 트렌드라 시청 증가율(41)이 빠르게 빠짐. 절기 종료 후 재배포 큐로 보낼 후보.',
    caveat: '계절성 강도 높음. 4월 첫째 주 이후 가중 페널티 권장.',
  },
]

export interface CommunityTrending {
  hashtag: string
  posts: number
  engagement_rate: number // 0..1
  generation_mix: number // 0..1 (1 = 균형, 0 = 한 세대 쏠림)
  candidate_score: number
  movement: 'up' | 'flat' | 'down'
  prediction: string
  risk: string
  why: string
}

export const COMMUNITY_TRENDING: CommunityTrending[] = [
  {
    hashtag: '#흑임자두쫀쿠',
    posts: 1342,
    engagement_rate: 0.18,
    generation_mix: 0.78,
    candidate_score: 86,
    movement: 'up',
    prediction: '48시간 내 지역 확산 가능성 높음',
    risk: '전주 외 지역 표본 부족',
    why: '전주 지역 + 50대 사용자 유입이 24시간 내 4.2배. 가족 단위 게시물 비중 64%.',
  },
  {
    hashtag: '#야구표정3컷',
    posts: 2880,
    engagement_rate: 0.22,
    generation_mix: 0.41,
    candidate_score: 73,
    movement: 'up',
    prediction: '24시간 급등 후 빠르게 식을 가능성',
    risk: '10대 세그먼트 쏠림',
    why: '10대 쏠림(생성 다양성 0.41). 절반 이상 24시간 내 신규. 단발성 가능성 ↑.',
  },
  {
    hashtag: '#한강버터런',
    posts: 612,
    engagement_rate: 0.11,
    generation_mix: 0.69,
    candidate_score: 68,
    movement: 'flat',
    prediction: '조회 폭발보다 루틴 잔존이 강함',
    risk: '신규 유입 둔화',
    why: '게시물 수는 정체이지만 같은 사용자가 7일 이상 반복 게시. 잔존 강함.',
  },
  {
    hashtag: '#춘분봄동',
    posts: 388,
    engagement_rate: 0.14,
    generation_mix: 0.74,
    candidate_score: 52,
    movement: 'down',
    prediction: '시즌 종료 후 아카이브 전환 적합',
    risk: '절기성 감소',
    why: '24시간 신규 게시물 -34%. 절기 종료 직전 — 세시풍속 재배포 후보로 큐잉 권장.',
  },
]

export interface ClusterCard {
  id: string
  label: string
  emoji: string
  size: number
  growth: number
  challenge_ids: string[]
  method: string
  signal_strength: number
  next_action: string
  description: string
}

export const CLUSTERS: ClusterCard[] = [
  {
    id: 'cl-food',
    label: '한 입 K푸드',
    emoji: '🍪',
    size: 4128,
    growth: 0.42,
    challenge_ids: ['ch-dujjonku', 'ch-bomdong'],
    method: 'HDBSCAN · cosine distance 0.18',
    signal_strength: 91,
    next_action: '로컬 식재료 변형을 늘리고 가족 공유 CTA를 강화',
    description:
      '쫀득·달콤·짠 단순 조합 + 즉시 가족 단위 재현 가능. 두쫀쿠가 클러스터 중심 노드.',
  },
  {
    id: 'cl-photo',
    label: '표정·인증샷',
    emoji: '📸',
    size: 2890,
    growth: 0.61,
    challenge_ids: ['ch-baseball-face'],
    method: 'HDBSCAN · cosine distance 0.23',
    signal_strength: 84,
    next_action: 'D+3 리마인드와 가족 단체 템플릿으로 잔존 보정',
    description:
      '5분 안에 결과물이 나오는 “저복잡도 인증샷”. 잔존율은 낮지만 진입 장벽 0.',
  },
  {
    id: 'cl-fitness',
    label: '5분 루틴',
    emoji: '🏃‍♀️',
    size: 1530,
    growth: 0.18,
    challenge_ids: ['ch-butter-run'],
    method: 'HDBSCAN · cosine distance 0.31',
    signal_strength: 76,
    next_action: '신규 조회 캠페인보다 루틴 배지와 지도 코스 연결',
    description:
      '짧고 매일 하는 루틴화 가능 챌린지. 잔존율 ↑, 신규 유입 ↓ — 슬로건 재설계 후보.',
  },
]
