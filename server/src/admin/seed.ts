import crypto from 'node:crypto'
import type { AdminDb, Challenge, LocalAsset, Trend, UserEvent } from './types.js'
import { calculateTrendToActionScore, deterministicEmbedding, scoreSurge, scoreTrend } from './scoring.js'

const now = () => new Date().toISOString()

export function makeId(prefix: string, value: string): string {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 10)}`
}

export const seedTrends: Trend[] = [
  {
    id: 'trend-dujjonku',
    title: '두바이 쫀득쿠키 변형',
    description: '두바이 초콜릿 밈에서 출발한 쫀득 쿠키 만들기. 흑임자, 약과, 찹쌀떡 등 전통 간식과 자연스럽게 연결된다.',
    source: 'seed_csv',
    source_url: 'demo://seed/trends/dujjonku',
    hashtags: ['#두쫀쿠', '#흑임자두쫀쿠', '#가족챌린지'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 1280000, saves: 42000 },
    provenance_label: 'demo_seed',
    evidence_refs: ['demo://seed/trends/dujjonku', 'raw_payload.views_24h', 'raw_payload.saves'],
  },
  {
    id: 'trend-baseball-face',
    title: '야구장 표정 3컷',
    description: '응원 표정 세 장으로 경기 감정을 기록하는 숏폼. 탈춤 표정과 응원 문화로 확장 가능하지만 청소년 초상권 주의가 필요하다.',
    source: 'seed_csv',
    source_url: 'demo://seed/trends/baseball-face',
    hashtags: ['#야구표정3컷', '#응원릴스'],
    category: 'photo',
    collected_at: now(),
    raw_payload: { views_24h: 920000, saves: 18000 },
    provenance_label: 'demo_seed',
    evidence_refs: ['demo://seed/trends/baseball-face', 'raw_payload.views_24h', 'raw_payload.saves'],
  },
  {
    id: 'trend-butter-run',
    title: '한강 버터런',
    description: '가벼운 조깅 뒤 동네 빵집에서 버터빵을 인증하는 루틴형 챌린지. 지역 상권 방문과 지도 클릭 전환이 좋다.',
    source: 'seed_csv',
    source_url: 'demo://seed/trends/butter-run',
    hashtags: ['#버터런', '#한강루틴', '#동네빵집'],
    category: 'fitness',
    collected_at: now(),
    raw_payload: { views_24h: 560000, saves: 25000 },
    provenance_label: 'demo_seed',
    evidence_refs: ['demo://seed/trends/butter-run', 'raw_payload.views_24h', 'raw_payload.saves'],
  },
]

export const seedLocalAssets: LocalAsset[] = [
  {
    id: 'asset-jeonju-market',
    name: '전주 풍남문 시장 흑임자 공방',
    asset_type: 'market',
    region_code: 'jeonju',
    address: '전북 전주시 완산구 풍남문 일대',
    latitude: 35.814,
    longitude: 127.149,
    start_date: '2026-05-01',
    end_date: '2026-12-31',
    description: '흑임자, 약과, 찹쌀 간식 체험이 가능한 전통시장 기반 식문화 공간.',
    contact_name: '전주문화운영팀',
    contact_email: 'demo-jeonju@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/jeonju-market',
    provenance_label: 'demo_seed',
  },
  {
    id: 'asset-seoul-hangang',
    name: '한강 시민공원 러닝 코스',
    asset_type: 'tourism',
    region_code: 'seoul',
    address: '서울특별시 영등포구 여의동로 330',
    latitude: 37.528,
    longitude: 126.933,
    description: '초보자도 접근 가능한 산책·러닝 코스와 주변 로컬 베이커리 동선.',
    contact_name: '서울관광 데모 담당',
    contact_email: 'demo-seoul@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/seoul-hangang',
    provenance_label: 'demo_seed',
  },
  {
    id: 'asset-busan-culture',
    name: '부산 기장 유자 문화마켓',
    asset_type: 'festival',
    region_code: 'busan',
    address: '부산광역시 기장군 일대',
    latitude: 35.244,
    longitude: 129.222,
    start_date: '2026-06-01',
    end_date: '2026-06-30',
    description: '지역 농산물과 체험 부스가 결합된 가족형 문화마켓.',
    contact_name: '기장문화 데모 센터',
    contact_email: 'demo-busan@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/busan-yuja',
    provenance_label: 'demo_seed',
  },
]

export function seedChallenges(): Challenge[] {
  const created = now()
  return [
    {
      id: 'challenge-dujjonku-ai',
      trend_id: 'trend-dujjonku',
      title: '흑임자 두쫀쿠 가족 베이크',
      description: '전통 간식 재료로 두쫀쿠를 만들고 가족별 한 줄 후기를 남기는 챌린지.',
      target_age_band: 'family',
      estimated_cost: 12000,
      estimated_minutes: 35,
      difficulty: 'easy',
      materials: ['찹쌀가루', '흑임자 페이스트', '초콜릿', '약과 조각'],
      steps: [
        { id: 's1', title: '재료 나누기', body: '가족별로 반죽, 속재료, 토핑 역할을 나눕니다.' },
        { id: 's2', title: '굽기', body: '낮은 온도로 천천히 구워 쫀득한 식감을 살립니다.' },
        { id: 's3', title: '인증', body: '완성 사진과 맛 표현 한 줄을 남깁니다.' },
      ],
      proof_type: '사진 인증 + 가족 후기',
      safety_notice: '오븐 사용 시 보호자가 확인하고 알레르기 재료를 표시하세요.',
      status: 'needs_review',
      created_at: created,
      updated_at: created,
      score_breakdown: calculateTrendToActionScore({
        execution_ease: 86,
        local_connectivity: 92,
        safety_score: 84,
        generation_expandability: 88,
        cost_accessibility: 78,
        proofability: 91,
      }),
      provenance_label: 'demo_seed',
    },
  ]
}

export function seedEvents(): UserEvent[] {
  const events: UserEvent[] = []
  const eventNames = ['trend_card_view', 'trend_card_save', 'challenge_start', 'challenge_step_complete', 'challenge_complete', 'proof_upload', 'place_click', 'map_open', 'drop_off_step']
  for (let i = 0; i < 180; i += 1) {
    const name = i < 82 ? 'trend_card_view' : eventNames[i % eventNames.length]
    events.push({
      id: `evt-${i}`,
      event_name: name,
      user_id_hash: crypto.createHash('sha256').update(`demo-user-${i % 44}`).digest('hex'),
      session_id: `sess-${i % 58}`,
      age_band: (['teen', '20s_30s', '40s_50s', '60_plus', 'family'] as const)[i % 5],
      region_code: (['seoul', 'jeonju', 'busan', 'jeju', 'gangneung'] as const)[i % 5],
      trend_id: seedTrends[i % seedTrends.length].id,
      challenge_id: i % 3 === 0 ? 'challenge-dujjonku-ai' : undefined,
      local_asset_id: i % 4 === 0 ? seedLocalAssets[i % seedLocalAssets.length].id : undefined,
      step_id: name === 'challenge_step_complete' ? `s${(i % 3) + 1}` : undefined,
      timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
      metadata: { location_verified: i % 7 === 0, provenance_label: 'demo_seed' },
    })
  }
  return events
}

export function hydrateSeed(db: AdminDb): AdminDb {
  const trends = db.trends.length ? db.trends : seedTrends.map((trend) => ({
    ...trend,
    embedding: deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
    action_score: scoreTrend(trend),
    surge_score: scoreSurge(trend.raw_payload),
  }))
  const localAssets = db.localAssets.length ? db.localAssets : seedLocalAssets.map((asset) => ({
    ...asset,
    embedding: deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
  }))
  return {
    ...db,
    trends,
    localAssets,
    challenges: db.challenges.length ? db.challenges : seedChallenges(),
    userEvents: db.userEvents.length ? db.userEvents : seedEvents(),
  }
}
