import crypto from 'node:crypto'
import type { AdminDb, Challenge, LocalAsset, Trend, UserEvent } from './types.js'
import { calculateTrendToActionScore, deterministicEmbedding, scoreSurge, scoreTrend } from './scoring.js'

const now = () => new Date().toISOString()

export function makeId(prefix: string, value: string): string {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 10)}`
}

export const seedTrends: Trend[] = [
  {
    id: 'trend-eton-mess',
    title: '이튼 메스',
    description: '딸기, 머랭, 휘핑크림을 어지럽게 부숴 섞는 디저트 트렌드. 한국 화채와 연결해 가족형 지역 과일 챌린지로 전환할 수 있다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-eton-mess',
    hashtags: ['#이튼메스', '#딸기디저트', '#부숴먹는디저트', '#화채리믹스'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 1620000, saves: 61200, comments: 12800, generations_reached: ['teen', 'adult', 'family'], challenge_id: 'ch-eton-mess' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-eton-mess', 'raw_payload.views_24h', 'raw_payload.generations_reached'],
  },
  {
    id: 'trend-cookie-strawberry',
    title: '쿠크다스 딸기샌드',
    description: '쿠크다스 사이에 딸기 크림을 넣고 냉동해 만드는 5분 디저트. 낮은 비용과 쉬운 인증으로 사용자 피드 전환에 적합하다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-cookie-strawberry',
    hashtags: ['#쿠크다스딸기샌드', '#냉동디저트', '#단면컷', '#5분디저트'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 1340000, saves: 52400, comments: 9200, generations_reached: ['teen', 'adult', 'family'], challenge_id: 'ch-cookie-strawberry' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-cookie-strawberry', 'raw_payload.views_24h', 'raw_payload.generations_reached'],
  },
  {
    id: 'trend-dujjonku',
    title: '두바이 쫀득쿠키',
    description: '카다이프와 피스타치오 필링을 마시멜로 반죽으로 감싸는 한 입 디저트. 흑임자, 약과, 찹쌀떡 등 전통 간식과 자연스럽게 연결된다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-dujjonku',
    hashtags: ['#두쫀쿠', '#두바이쫀득쿠키', '#흑임자리믹스', '#가족챌린지'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 1020000, saves: 42000, comments: 7300, generations_reached: ['teen', 'adult', 'family'], challenge_id: 'ch-dujjonku' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-dujjonku', 'raw_payload.views_24h', 'raw_payload.saves'],
  },
  {
    id: 'trend-butter-rice',
    title: '버터떡',
    description: '찹쌀가루와 버터로 굽는 쫀득한 떡 트렌드. 약과와 찹쌀떡의 현대판으로 전통시장·공방 체험과 연결 가능하다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-butter-rice',
    hashtags: ['#버터떡', '#찹쌀디저트', '#약과리믹스', '#전통간식'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 580000, saves: 26100, comments: 4100, generations_reached: ['adult', 'senior', 'family'], challenge_id: 'ch-butter-rice' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-butter-rice', 'raw_payload.views_24h', 'raw_payload.generations_reached'],
  },
  {
    id: 'trend-bomdong',
    title: '봄동 비빔밥',
    description: '24절기 춘분의 제철 봄동으로 만드는 5분 비빔밥. 로컬 장보기, 전통시장 방문, 세대 간 레시피 공유로 확장된다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-bomdong',
    hashtags: ['#봄동비빔밥', '#제철밥상', '#춘분', '#전통시장장보기'],
    category: 'food',
    collected_at: now(),
    raw_payload: { views_24h: 280000, saves: 16800, comments: 2300, generations_reached: ['adult', 'senior', 'family'], challenge_id: 'ch-bomdong' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-bomdong', 'raw_payload.views_24h', 'raw_payload.generations_reached'],
  },
  {
    id: 'trend-pringles-choco',
    title: '프링글스 초코블럭',
    description: '프링글스 통에 녹인 초콜릿을 부어 블럭처럼 꺼내 먹는 일시 유행. 재미는 크지만 식품 안전과 과소비 안내가 필요하다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-pringles-choco',
    hashtags: ['#프링글스초코블럭', '#초코공예', '#일시유행', '#안전검수필요'],
    category: 'craft',
    collected_at: now(),
    raw_payload: { views_24h: 112000, saves: 4200, comments: 980, generations_reached: ['teen', 'adult'], challenge_id: 'ch-pringles-choco' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-pringles-choco', 'raw_payload.views_24h', 'raw_payload.generations_reached'],
  },
  {
    id: 'trend-baseball-face',
    title: '야구 표정 챌린지',
    description: '응원 표정 세 장으로 경기 감정을 기록하는 숏폼. 탈춤 표정과 응원 문화로 확장 가능하지만 청소년 초상권 주의가 필요하다.',
    source: 'user_app_seed',
    source_url: 'demo://user-app/trends/trend-baseball-face',
    hashtags: ['#야구표정챌린지', '#응원릴스', '#탈춤표정', '#초상권주의'],
    category: 'photo',
    collected_at: now(),
    raw_payload: { views_24h: 760000, saves: 28300, comments: 6400, generations_reached: ['teen', 'adult', 'family'], challenge_id: 'ch-baseball-face' },
    provenance_label: 'demo_seed',
    evidence_refs: ['app/src/data/trends.ts:trend-baseball-face', 'raw_payload.views_24h', 'raw_payload.saves'],
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
  {
    id: 'asset-jeju-hallabong',
    name: '제주 한라봉 농장 디저트 체험',
    asset_type: 'culture_facility',
    region_code: 'jeju',
    address: '제주특별자치도 서귀포시 감귤 체험로',
    latitude: 33.254,
    longitude: 126.56,
    start_date: '2026-05-01',
    end_date: '2026-08-31',
    description: '한라봉, 감귤청, 과일 화채 만들기를 체험할 수 있는 지역 농산물 기반 문화 프로그램.',
    contact_name: '제주 감귤문화 데모팀',
    contact_email: 'demo-jeju@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/jeju-hallabong',
    provenance_label: 'demo_seed',
  },
  {
    id: 'asset-gangneung-dano',
    name: '강릉 단오제 전통 놀이마당',
    asset_type: 'festival',
    region_code: 'gangneung',
    address: '강원특별자치도 강릉시 단오장길',
    latitude: 37.754,
    longitude: 128.896,
    start_date: '2026-06-15',
    end_date: '2026-06-22',
    description: '단오 음식, 전통놀이, 탈춤 표정 체험을 결합한 지역 대표 문화제.',
    contact_name: '강릉단오 운영 데모팀',
    contact_email: 'demo-gangneung@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/gangneung-dano',
    provenance_label: 'demo_seed',
  },
  {
    id: 'asset-suwon-haenggung',
    name: '수원 행궁동 전통시장 골목',
    asset_type: 'heritage',
    region_code: 'suwon',
    address: '경기도 수원시 팔달구 행궁동 일대',
    latitude: 37.282,
    longitude: 127.014,
    start_date: '2026-05-01',
    end_date: '2026-12-31',
    description: '한옥거리, 공방, 전통시장 먹거리가 밀집한 골목형 문화 자산.',
    contact_name: '수원문화 데모 센터',
    contact_email: 'demo-suwon@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/suwon-haenggung',
    provenance_label: 'demo_seed',
  },
  {
    id: 'asset-andong-mask',
    name: '안동 하회탈춤 전수관',
    asset_type: 'heritage',
    region_code: 'andong',
    address: '경북 안동시 풍천면 하회종가길',
    latitude: 36.539,
    longitude: 128.518,
    start_date: '2026-05-01',
    end_date: '2026-12-31',
    description: '탈춤 표정, 전통 가면, 세대별 몸짓 언어를 체험할 수 있는 전통문화 공간.',
    contact_name: '안동문화 데모팀',
    contact_email: 'demo-andong@example.org',
    source: 'seed_local_assets',
    source_url: 'demo://seed/assets/andong-mask',
    provenance_label: 'demo_seed',
  },
]

export function seedChallenges(): Challenge[] {
  const created = now()
  const challengeSeeds = [
    ['challenge-eton-mess-ai', 'trend-eton-mess', '이튼 메스 화채 컵', '딸기와 머랭을 큰 그릇 안에서 부숴 한국 화채식 컵 디저트로 인증하는 챌린지.', 'family', 9000, 15, ['딸기', '머랭', '생크림 또는 요거트'], '사진 인증 + 한 줄 맛 표현'],
    ['challenge-cookie-strawberry-ai', 'trend-cookie-strawberry', '쿠크다스 딸기샌드 냉동 컷', '쿠크다스와 딸기 크림을 샌드해 냉동 후 단면 컷을 남기는 초저비용 디저트 챌린지.', 'teen', 6000, 10, ['쿠크다스', '딸기잼', '크림치즈'], '단면 사진 인증'],
    ['challenge-dujjonku-ai', 'trend-dujjonku', '흑임자 두쫀쿠 가족 베이크', '전통 간식 재료로 두쫀쿠를 만들고 가족별 한 줄 후기를 남기는 챌린지.', 'family', 12000, 35, ['찹쌀가루', '흑임자 페이스트', '초콜릿', '약과 조각'], '사진 인증 + 가족 후기'],
    ['challenge-butter-rice-ai', 'trend-butter-rice', '전통시장 버터떡 굽기', '전통시장에서 산 찹쌀가루나 떡을 버터에 구워 약과풍 토핑으로 완성하는 챌린지.', '40s_50s', 8000, 20, ['찹쌀떡', '버터', '꿀 또는 조청'], '조리 전후 사진 인증'],
    ['challenge-bomdong-ai', 'trend-bomdong', '춘분 봄동 5분 밥상', '제철 봄동을 구매해 5분 비빔밥을 만들고 장보기 장소를 함께 기록하는 챌린지.', '60_plus', 7000, 12, ['봄동', '밥', '고추장', '참기름'], '완성 사진 + 장보기 장소 클릭'],
    ['challenge-pringles-choco-ai', 'trend-pringles-choco', '안전한 초코블럭 실험', '뜨거운 초콜릿 대신 중탕 안전 가이드를 지켜 미니 초코블럭을 만드는 검수 필요 챌린지.', '20s_30s', 10000, 25, ['초콜릿', '종이컵 몰드', '과자 토핑'], '과정 사진 + 안전 체크리스트'],
    ['challenge-baseball-face-ai', 'trend-baseball-face', '탈춤 표정 응원 3컷', '타인을 촬영하지 않고 본인 표정 3컷으로 응원 감정을 기록한 뒤 탈춤 표정과 연결하는 챌린지.', 'teen', 0, 8, ['카메라', '응원 소품'], '본인 얼굴 또는 스티커 처리 사진 인증'],
  ] as const

  return challengeSeeds.map(([id, trend_id, title, description, target_age_band, estimated_cost, estimated_minutes, materials, proof_type], index) => ({
    id,
    trend_id,
    title,
    description,
    target_age_band,
    estimated_cost,
    estimated_minutes,
    difficulty: index === 5 ? 'medium' : 'easy',
    materials: [...materials],
    steps: [
      { id: 's1', title: '준비', body: '재료와 촬영 공간을 준비하고 개인정보 노출이 없는지 확인합니다.' },
      { id: 's2', title: '실행', body: '챌린지 핵심 행동을 짧게 수행하고 과정을 기록합니다.' },
      { id: 's3', title: '인증', body: '완성 사진, 후기, 장소 클릭 중 해당 인증을 남깁니다.' },
    ],
    proof_type,
    safety_notice: index === 6
      ? '타인 얼굴, 좌석번호, 미성년자 개인정보가 노출되지 않게 스티커 처리하세요.'
      : index === 5
        ? '중탕과 뜨거운 초콜릿 사용 시 화상 위험을 표시하고 어린이는 보호자와 함께하세요.'
        : '알레르기 재료를 표시하고 조리 도구 사용 시 보호자 확인이 필요합니다.',
    status: 'needs_review',
    created_at: created,
    updated_at: created,
    score_breakdown: calculateTrendToActionScore({
      execution_ease: index === 5 ? 68 : 86 - index * 2,
      local_connectivity: [82, 70, 92, 88, 94, 55, 76][index],
      safety_score: index === 5 ? 62 : index === 6 ? 70 : 84,
      generation_expandability: [90, 84, 88, 82, 76, 68, 86][index],
      cost_accessibility: [84, 92, 78, 86, 90, 72, 98][index],
      proofability: [92, 94, 91, 88, 82, 78, 90][index],
    }),
    provenance_label: 'demo_seed',
  }))
}

export function seedEvents(): UserEvent[] {
  const events: UserEvent[] = []
  const eventNames = ['trend_card_view', 'trend_card_save', 'challenge_start', 'challenge_step_complete', 'challenge_complete', 'proof_upload', 'place_click', 'map_open', 'drop_off_step']
  const challenges = seedChallenges()
  for (let i = 0; i < 180; i += 1) {
    const name = i < 82 ? 'trend_card_view' : eventNames[i % eventNames.length]
    const trend = seedTrends[i % seedTrends.length]
    const challenge = challenges.find((item) => item.trend_id === trend.id) ?? challenges[i % challenges.length]
    events.push({
      id: `evt-${i}`,
      event_name: name,
      user_id_hash: crypto.createHash('sha256').update(`demo-user-${i % 44}`).digest('hex'),
      session_id: `sess-${i % 58}`,
      age_band: (['teen', '20s_30s', '40s_50s', '60_plus', 'family'] as const)[i % 5],
      region_code: (['seoul', 'jeonju', 'busan', 'jeju', 'gangneung'] as const)[i % 5],
      trend_id: trend.id,
      challenge_id: i % 3 === 0 ? challenge.id : undefined,
      local_asset_id: i % 4 === 0 ? seedLocalAssets[i % seedLocalAssets.length].id : undefined,
      step_id: name === 'challenge_step_complete' ? `s${(i % 3) + 1}` : undefined,
      timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
      metadata: { location_verified: i % 7 === 0, provenance_label: 'demo_seed' },
    })
  }
  return events
}

export function hydrateSeed(db: AdminDb): AdminDb {
  const preparedSeedTrends = seedTrends.map((trend) => ({
    ...trend,
    embedding: deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
    action_score: scoreTrend(trend),
    surge_score: scoreSurge(trend.raw_payload),
  }))
  const preparedSeedAssets = seedLocalAssets.map((asset) => ({
    ...asset,
    embedding: deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
  }))
  const trends = mergeMissingById(db.trends, preparedSeedTrends)
  const localAssets = mergeMissingById(db.localAssets, preparedSeedAssets)
  return {
    ...db,
    trends,
    localAssets,
    challenges: mergeMissingById(db.challenges, seedChallenges()),
    userEvents: db.userEvents.length ? db.userEvents : seedEvents(),
  }
}

function mergeMissingById<T extends { id: string }>(current: T[], seeds: T[]): T[] {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...seeds.filter((item) => !seen.has(item.id))]
}
