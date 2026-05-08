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
    challenge_id: 'ch-eton-mess',
    total: 89,
    trend_direction: 'rising',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 96 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 88 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 79 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 74 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 92 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 74 },
    ],
    confidence: 0.93,
    sample_size: 52310,
    risk_level: 'medium',
    model_trace: [
      'view_growth 96: 쿠크다스 딸기샌드 직후 “부숴 먹는” 디저트로 자연 확산',
      'generation_diversity 88: 10대 인증샷 → 30·40대 주말 디저트 → 가족 단위 확산',
      'family_share 92: “어지럽게 섞기”가 가족 분담 액션과 잘 맞음',
    ],
    evidence: [
      '#한라봉메스 24h +5.1×',
      '쿠크다스 딸기샌드 사용자 41%가 같은 날 이튼메스로 이동',
      '전통 연결(화채) 설명 클릭률 28%',
    ],
    recommended_action:
      '메인 피드 1순위 고정 + “화채 사촌” 전통 카피를 50·60대용 친절 가이드로 A/B 테스트.',
    top_reason:
      '시청 증가율(96)·가족 공유율(92)·세대 다양성(88) 세 축이 동시에 높은 드문 케이스. 쿠크다스 딸기샌드의 후속 디저트로 자연 유입.',
    caveat: '머랭 구매 접근성이 낮은 지역(강원·제주 일부)은 확산 점수 보수적으로.',
  },
  {
    challenge_id: 'ch-cookie-strawberry',
    total: 84,
    trend_direction: 'rising',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 88 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 84 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 77 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 71 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 90 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 70 },
    ],
    confidence: 0.9,
    sample_size: 61220,
    risk_level: 'low',
    model_trace: [
      'view_growth 88: 단면 컷 영상이 검색 유입을 끌어옴',
      'family_share 90: “기다림(냉동 4시간) → 단면 공개”가 가족 활동과 정확히 호환',
      'retention 70: 단순한 재료라 다음 주에도 반복',
    ],
    evidence: [
      '24h 단면 컷 영상 게시 +3.4×',
      '편의점 쿠크다스 매출 동기간 +18% 추정',
      '재시청 비율(D+3) 33%',
    ],
    recommended_action:
      '“냉동 4시간 동안 할 수 있는 일” 콘텐츠를 묶어 노출. 이튼메스로의 이동 경로를 자연스럽게 추천.',
    top_reason:
      '가족 공유율(0.18×90)과 시청 증가율(0.18×88) 동시 상승. 진입 장벽이 낮고 단면 컷이 짧은 영상에 최적화.',
  },
  {
    challenge_id: 'ch-dujjonku',
    total: 81,
    trend_direction: 'stable',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 68 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 89 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 86 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 88 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 91 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 71 },
    ],
    confidence: 0.94,
    sample_size: 84210,
    risk_level: 'low',
    model_trace: [
      'view_growth 68: 정점 이후 안정 단계 진입',
      'tradition_link 88: 찹쌀떡·약과 연결이 외부 검색까지 끌어옴',
      'region_spread 86: 8개 지역 모두 흑임자/한라봉/유자 등 변형 정착',
    ],
    evidence: [
      '#흑임자두쫀쿠 누적 1,342개 — 24h +4.2×',
      '전주·서울 평균 대비 2.6× 저장',
      '찹쌀떡·약과 연결 설명 클릭률 31%',
    ],
    recommended_action:
      '“이튼 메스로 가는 다리” 디저트 라인업에 포함. 새 사용자 유입은 줄이고 잔존 강화에 집중.',
    top_reason:
      '가족 공유율(0.18×91)과 전통 연결(0.14×88)이 안정적인 잔존을 만듦. 정점 이후이지만 클러스터의 “중심 노드” 역할 유지.',
  },
  {
    challenge_id: 'ch-butter-rice',
    total: 68,
    trend_direction: 'declining',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 48 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 78 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 62 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 84 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 73 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 64 },
    ],
    confidence: 0.85,
    sample_size: 31420,
    risk_level: 'medium',
    model_trace: [
      'view_growth 48: 오븐 필요로 인해 진입 장벽 ↑',
      'tradition_link 84: 약과·찹쌀떡 코드와 직접 연결',
      'generation_diversity 78: 50·60대 완성률이 가장 높은 챌린지 중 하나',
    ],
    evidence: [
      '24h 신규 영상 -22%',
      '50·60대 완성률 79% (전체 평균 +12pt)',
      '에어프라이어 검색 유입 비중 41%',
    ],
    recommended_action:
      '에어프라이어 단축 레시피를 메인으로 두고, 흑임자/커피 변형으로 잔존 사용자 유지.',
    top_reason:
      '전통 연결(약과)이 강하지만 시청 증가율은 빠짐. 50·60대에서 완성률이 가장 높은 “세대 회수 챌린지”.',
    caveat: '오븐/에어프라이어 보유율이 지역별 편차가 큼.',
  },
  {
    challenge_id: 'ch-baseball-face',
    total: 64,
    trend_direction: 'stable',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 78 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 62 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 80 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 81 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 58 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 49 },
    ],
    confidence: 0.82,
    sample_size: 36520,
    risk_level: 'high',
    model_trace: [
      'view_growth 78: 경기 일정 직후 10대 중심 검색 급등',
      'retention 49: 같은 사용자의 D+7 재수행이 낮아 단발성 위험',
      'tradition_link 81: 탈춤 표정 연결은 반응 좋지만 저장 전환 약함',
    ],
    evidence: [
      '#야구표정3컷 24h 게시 2,880개',
      '10대 작성자 비중 73%',
      '완료율 93% 대비 D+7 잔존 18%',
    ],
    recommended_action:
      '가족 단체 표정 템플릿을 추가해 세대 다양성을 보강하고, D+3 리마인드 셋로그를 제안합니다.',
    top_reason:
      '시청 증가율은 높지만 잔존율(49)이 낮음 — 지금의 조회수 대부분이 "한 번 따라하고 끝나는" 행동. 전통(탈춤) 연결이 잔존율을 끌어올릴 후보.',
  },
  {
    challenge_id: 'ch-bomdong',
    total: 62,
    trend_direction: 'declining',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 36 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 70 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 58 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 92 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 78 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 64 },
    ],
    confidence: 0.79,
    sample_size: 12904,
    risk_level: 'medium',
    model_trace: [
      'tradition_link 92: 춘분·봄나물 검색 근거가 매우 강함',
      'view_growth 36: 절기 피크 이후 신규 조회가 빠르게 감소',
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
      '전통 연결(춘분)이 92점으로 매우 강함 — 그러나 절기성 트렌드라 시청 증가율이 빠르게 빠짐. 절기 종료 후 재배포 큐로 보낼 후보.',
    caveat: '계절성 강도 높음. 4월 첫째 주 이후 가중 페널티 권장.',
  },
  {
    challenge_id: 'ch-pringles-choco',
    total: 38,
    trend_direction: 'declining',
    features: [
      { key: 'view_growth', label: FEATURE_LABEL.view_growth, weight: FEATURE_WEIGHTS.view_growth, value: 22 },
      { key: 'generation_diversity', label: FEATURE_LABEL.generation_diversity, weight: FEATURE_WEIGHTS.generation_diversity, value: 38 },
      { key: 'region_spread', label: FEATURE_LABEL.region_spread, weight: FEATURE_WEIGHTS.region_spread, value: 41 },
      { key: 'tradition_link', label: FEATURE_LABEL.tradition_link, weight: FEATURE_WEIGHTS.tradition_link, value: 56 },
      { key: 'family_share', label: FEATURE_LABEL.family_share, weight: FEATURE_WEIGHTS.family_share, value: 28 },
      { key: 'retention', label: FEATURE_LABEL.retention, weight: FEATURE_WEIGHTS.retention, value: 12 },
    ],
    confidence: 0.74,
    sample_size: 8420,
    risk_level: 'high',
    model_trace: [
      'retention 12: D+7 재수행 거의 0 — 명확한 단발 챌린지',
      'view_growth 22: 24h 신규 게시물 -61% — 이미 정점을 지남',
      'family_share 28: 단맛이 강해 가족 단위 반복은 어려움',
    ],
    evidence: [
      '“한 번이면 충분” 캡션 빈도 38%',
      '완료 후 셋로그 연결률 6%',
      '“너무 달다” 댓글 비중 24%',
    ],
    recommended_action:
      '랭킹 노출 제외 + “한 번 인증 챌린지”로 별도 카테고리에 보관. 전통(강정) 연결로 아카이브.',
    top_reason:
      '잔존율(12)·가족 공유율(28)이 매우 낮은 명확한 단발성 트렌드. 한 번 만들어 보고 끝나는 “인증 챌린지” 코드.',
    caveat: '단발성 트렌드는 별도 큐로 보관. 메인 점수 체계와 같은 가중치로 비교하지 말 것.',
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
    hashtag: '#한라봉메스',
    posts: 3210,
    engagement_rate: 0.24,
    generation_mix: 0.82,
    candidate_score: 92,
    movement: 'up',
    prediction: '48시간 내 메인 랭킹 1위 안착 가능성 높음',
    risk: '머랭 구매 접근성이 낮은 지역 편차',
    why: '24시간 내 +5.1×. 쿠크다스 딸기샌드 사용자의 41%가 같은 날 이튼 메스로 이동. 가족 단위 게시물 비중 58%.',
  },
  {
    hashtag: '#쿠크다스딸기샌드',
    posts: 2740,
    engagement_rate: 0.21,
    generation_mix: 0.78,
    candidate_score: 88,
    movement: 'up',
    prediction: '단면 컷 영상이 외부 검색 유입을 계속 끌어옴',
    risk: '딸기 단가 상승 시 비용 메시지 재조정 필요',
    why: '단면 컷 영상이 검색 유입의 62%. 편의점 쿠크다스 매출 동기간 +18% 추정.',
  },
  {
    hashtag: '#흑임자두쫀쿠',
    posts: 1342,
    engagement_rate: 0.18,
    generation_mix: 0.74,
    candidate_score: 76,
    movement: 'flat',
    prediction: '정점 이후 잔존 단계 — 지역 변형으로 유지',
    risk: '서울·전주 외 지역 표본 부족',
    why: '전주 지역 + 50대 사용자 유입이 안정적. 가족 단위 게시물 비중 64%.',
  },
  {
    hashtag: '#흑임자버터떡',
    posts: 612,
    engagement_rate: 0.16,
    generation_mix: 0.71,
    candidate_score: 64,
    movement: 'flat',
    prediction: '50·60대 잔존 강함 — 명절·세시 재배포 후보',
    risk: '오븐/에어프라이어 보유율 편차',
    why: '50·60대 완성률 79% — 가장 “세대 회수” 효과가 큰 챌린지 중 하나.',
  },
  {
    hashtag: '#프링글스초코블럭',
    posts: 388,
    engagement_rate: 0.09,
    generation_mix: 0.42,
    candidate_score: 28,
    movement: 'down',
    prediction: '단발성 인증 챌린지로 별도 카테고리 보관',
    risk: 'D+7 재수행 거의 0',
    why: '24시간 신규 게시물 -61%. “한 번이면 충분” 캡션 빈도 38%. 단맛 과잉으로 가족 공유 어려움.',
  },
  {
    hashtag: '#춘분봄동',
    posts: 220,
    engagement_rate: 0.14,
    generation_mix: 0.74,
    candidate_score: 48,
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
    id: 'cl-dessert-fusion',
    label: '부숴 먹는 디저트',
    emoji: '🍓',
    size: 6210,
    growth: 0.62,
    challenge_ids: ['ch-eton-mess', 'ch-cookie-strawberry'],
    method: 'HDBSCAN · cosine distance 0.16',
    signal_strength: 94,
    next_action: '“냉동 → 단면 → 부수기” 동선을 묶어 메인 노출, 한라봉/유자 변형으로 지역 확장.',
    description:
      '냉동·단면·부수기를 공통 언어로 쓰는 신생 클러스터. 이튼 메스가 중심 노드, 쿠크다스 딸기샌드가 진입 노드.',
  },
  {
    id: 'cl-rice-modern',
    label: '쫀득 K-단과자',
    emoji: '🍪',
    size: 4380,
    growth: 0.18,
    challenge_ids: ['ch-dujjonku', 'ch-butter-rice'],
    method: 'HDBSCAN · cosine distance 0.21',
    signal_strength: 87,
    next_action: '50·60대 친절 가이드 + 흑임자/한라봉 지역 변형으로 잔존 강화. 명절 재배포 큐.',
    description:
      '약과·찹쌀떡 코드를 마시멜로/버터로 옮긴 현대화 라인. 진입 장벽은 있지만 가족 공유율 매우 높음.',
  },
  {
    id: 'cl-seasonal',
    label: '제철·세시',
    emoji: '🌱',
    size: 1820,
    growth: -0.08,
    challenge_ids: ['ch-bomdong'],
    method: 'HDBSCAN · cosine distance 0.27',
    signal_strength: 71,
    next_action: '메인 랭킹 노출 줄이고 절기 큐에 보관. 24절기 단위로 자동 재활성화.',
    description:
      '절기 강도가 매우 강한 클러스터. 시즌 외에는 점수 페널티, 시즌 도래 시 자동 재진입.',
  },
  {
    id: 'cl-photo',
    label: '표정·인증샷',
    emoji: '📸',
    size: 2890,
    growth: 0.18,
    challenge_ids: ['ch-baseball-face'],
    method: 'HDBSCAN · cosine distance 0.23',
    signal_strength: 78,
    next_action: 'D+3 리마인드와 가족 단체 템플릿으로 잔존 보정.',
    description:
      '5분 안에 결과물이 나오는 “저복잡도 인증샷”. 잔존율은 낮지만 진입 장벽 0.',
  },
  {
    id: 'cl-flash',
    label: '단발 인증 챌린지',
    emoji: '⚡',
    size: 612,
    growth: -0.42,
    challenge_ids: ['ch-pringles-choco'],
    method: 'HDBSCAN · cosine distance 0.33',
    signal_strength: 41,
    next_action: '메인 점수 체계와 분리 — 별도 “한 번 인증” 카테고리에 보관.',
    description:
      '꺼내는 그 순간이 콘텐츠의 전부인 단발성 챌린지. 잔존율 매우 낮음, 같은 가중치로 비교 금지.',
  },
]
