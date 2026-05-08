// 카테고리는 행동 분기를 위한 메타데이터일 뿐, UI는 단일 인기순 리스트로 다룸.
export type TodoKind = 'food' | 'restaurant' | 'dance' | 'ai'
export type TodoMovement = 'rising' | 'peak' | 'fading'

export interface ExternalCTA {
  label: string // "캐치테이블에서 보기"
  href: string
  partner_name: string // "캐치테이블"
  partner_emoji: string
}

export interface TrendToDoItem {
  id: string
  kind: TodoKind
  emoji: string
  title: string
  desc: string
  rank: number // 글로벌 인기 순위 (참여자 기준 자동 산정)
  participants: number
  done_ratio: number // 0..1
  movement: TodoMovement
  cover_gradient: string
  hashtag: string
  related_challenge_id?: string
  duration_label: string
  cost_label: string
  external_cta?: ExternalCTA
}

// 전체 항목을 참여자 기준으로 정렬해 글로벌 rank 자동 부여
const RAW: Omit<TrendToDoItem, 'rank'>[] = [
  // 음식
  {
    id: 'td-food-eton',
    kind: 'food',
    emoji: '🍓',
    title: '이튼 메스 부수기',
    desc: '딸기·머랭·휘핑크림 어지럽게 섞기',
    participants: 1_280_000,
    done_ratio: 0.82,
    movement: 'peak',
    cover_gradient: 'from-rose-300 via-pink-400 to-coral-500',
    hashtag: '#한라봉메스',
    related_challenge_id: 'ch-eton-mess',
    duration_label: '15분',
    cost_label: '1만 원 이하',
  },
  {
    id: 'td-food-cookie',
    kind: 'food',
    emoji: '🍰',
    title: '쿠크다스 딸기샌드',
    desc: '냉동 4시간 → 단면 컷 한 번',
    participants: 1_120_000,
    done_ratio: 0.76,
    movement: 'peak',
    cover_gradient: 'from-pink-200 via-rose-300 to-coral-400',
    hashtag: '#쿠크다스딸기샌드',
    related_challenge_id: 'ch-cookie-strawberry',
    duration_label: '15분 + 냉동',
    cost_label: '1만 원 이하',
  },
  {
    id: 'td-food-dujjonku',
    kind: 'food',
    emoji: '🍪',
    title: '두쫀쿠 만들기',
    desc: '카다이프 + 마시멜로 합체',
    participants: 980_000,
    done_ratio: 0.64,
    movement: 'rising',
    cover_gradient: 'from-coral-300 via-coral-400 to-coral-600',
    hashtag: '#흑임자두쫀쿠',
    related_challenge_id: 'ch-dujjonku',
    duration_label: '90분',
    cost_label: '3만 원 이하',
  },
  {
    id: 'td-food-butter',
    kind: 'food',
    emoji: '🧈',
    title: '버터떡 굽기',
    desc: '찹쌀가루 + 버터 = 약과 사촌',
    participants: 580_000,
    done_ratio: 0.41,
    movement: 'fading',
    cover_gradient: 'from-amber-300 via-amber-400 to-coral-400',
    hashtag: '#흑임자버터떡',
    related_challenge_id: 'ch-butter-rice',
    duration_label: '45분',
    cost_label: '1만 원 이하',
  },
  {
    id: 'td-food-bomdong',
    kind: 'food',
    emoji: '🥗',
    title: '봄동 비빔밥',
    desc: '24절기 춘분 한 그릇',
    participants: 280_000,
    done_ratio: 0.22,
    movement: 'fading',
    cover_gradient: 'from-emerald-300 via-emerald-500 to-ink-500',
    hashtag: '#춘분봄동',
    related_challenge_id: 'ch-bomdong',
    duration_label: '10분',
    cost_label: '5천 원 이하',
  },

  // 식당
  {
    id: 'td-rest-domsan',
    kind: 'restaurant',
    emoji: '🥐',
    title: '도산 누데이크',
    desc: '인스타 핫플 디저트, 줄서기 필수',
    participants: 642_000,
    done_ratio: 0.34,
    movement: 'peak',
    cover_gradient: 'from-stone-300 via-amber-200 to-rose-200',
    hashtag: '#도산누데이크',
    duration_label: '대기 30~60분',
    cost_label: '1~2만 원',
    external_cta: {
      label: '캐치테이블에서 보기',
      href: 'https://app.catchtable.co.kr/',
      partner_name: '캐치테이블',
      partner_emoji: '🍴',
    },
  },
  {
    id: 'td-rest-melting',
    kind: 'restaurant',
    emoji: '🫕',
    title: '망원 멜팅포트',
    desc: '치즈 폭포 SNS 핫플',
    participants: 412_000,
    done_ratio: 0.28,
    movement: 'rising',
    cover_gradient: 'from-amber-300 via-orange-400 to-rose-400',
    hashtag: '#망원멜팅포트',
    duration_label: '대기 30분~',
    cost_label: '2~3만 원',
    external_cta: {
      label: '캐치테이블에서 보기',
      href: 'https://app.catchtable.co.kr/',
      partner_name: '캐치테이블',
      partner_emoji: '🍴',
    },
  },
  {
    id: 'td-rest-omok',
    kind: 'restaurant',
    emoji: '🍡',
    title: '망원 또옥',
    desc: '한국식 떡 디저트 카페',
    participants: 318_000,
    done_ratio: 0.21,
    movement: 'rising',
    cover_gradient: 'from-emerald-200 via-teal-300 to-ink-400',
    hashtag: '#또옥떡',
    duration_label: '대기 15분~',
    cost_label: '1~2만 원',
    external_cta: {
      label: '캐치테이블에서 보기',
      href: 'https://app.catchtable.co.kr/',
      partner_name: '캐치테이블',
      partner_emoji: '🍴',
    },
  },
  {
    id: 'td-rest-momos',
    kind: 'restaurant',
    emoji: '☕',
    title: '부산 모모스 본점',
    desc: '강릉 라이벌, 바리스타 챔피언',
    participants: 224_000,
    done_ratio: 0.16,
    movement: 'rising',
    cover_gradient: 'from-amber-700 via-stone-600 to-ink-700',
    hashtag: '#모모스커피',
    duration_label: '대기 20분~',
    cost_label: '1~2만 원',
    external_cta: {
      label: '캐치테이블에서 보기',
      href: 'https://app.catchtable.co.kr/',
      partner_name: '캐치테이블',
      partner_emoji: '🍴',
    },
  },
  {
    id: 'td-rest-ulji',
    kind: 'restaurant',
    emoji: '🍜',
    title: '을지로 4세대 핫플',
    desc: '골목 노포 + 인더스트리얼',
    participants: 188_000,
    done_ratio: 0.14,
    movement: 'fading',
    cover_gradient: 'from-stone-400 via-ink-500 to-ink-700',
    hashtag: '#을지로골목',
    duration_label: '대기 15~40분',
    cost_label: '1~3만 원',
    external_cta: {
      label: '캐치테이블에서 보기',
      href: 'https://app.catchtable.co.kr/',
      partner_name: '캐치테이블',
      partner_emoji: '🍴',
    },
  },

  // 춤
  {
    id: 'td-dance-whiplash',
    kind: 'dance',
    emoji: '💥',
    title: '위플래쉬 챌린지',
    desc: '에스파 · 30초 안무 한 컷',
    participants: 1_440_000,
    done_ratio: 0.58,
    movement: 'peak',
    cover_gradient: 'from-fuchsia-400 via-purple-500 to-ink-700',
    hashtag: '#위플래쉬챌린지',
    duration_label: '30초',
    cost_label: '무료',
  },
  {
    id: 'td-dance-apt',
    kind: 'dance',
    emoji: '🍎',
    title: 'APT 챌린지',
    desc: '로제 × 브루노마스 — 한 박자',
    participants: 1_220_000,
    done_ratio: 0.52,
    movement: 'peak',
    cover_gradient: 'from-rose-400 via-pink-500 to-coral-500',
    hashtag: '#APT챌린지',
    duration_label: '30초',
    cost_label: '무료',
  },
  {
    id: 'td-dance-supernova',
    kind: 'dance',
    emoji: '🌟',
    title: '슈퍼노바 챌린지',
    desc: '에스파 · 손동작 1초 컷',
    participants: 880_000,
    done_ratio: 0.41,
    movement: 'rising',
    cover_gradient: 'from-sky-400 via-indigo-500 to-ink-700',
    hashtag: '#슈퍼노바챌린지',
    duration_label: '15초',
    cost_label: '무료',
  },
  {
    id: 'td-dance-power',
    kind: 'dance',
    emoji: '🔥',
    title: '파워 챌린지',
    desc: '(여자)아이들 · 풀바디 동작',
    participants: 612_000,
    done_ratio: 0.32,
    movement: 'rising',
    cover_gradient: 'from-coral-400 via-rose-500 to-fuchsia-700',
    hashtag: '#파워챌린지',
    duration_label: '30초',
    cost_label: '무료',
  },
  {
    id: 'td-dance-mach',
    kind: 'dance',
    emoji: '🚀',
    title: '마하 챌린지',
    desc: '르세라핌 · 친구 1명 더',
    participants: 388_000,
    done_ratio: 0.18,
    movement: 'fading',
    cover_gradient: 'from-cyan-400 via-sky-500 to-indigo-700',
    hashtag: '#마하챌린지',
    duration_label: '30초',
    cost_label: '무료',
  },

  // AI
  {
    id: 'td-ai-chef',
    kind: 'ai',
    emoji: '🤖',
    title: 'ChatGPT 셰프',
    desc: '냉장고 사진 → 오늘 저녁 메뉴',
    participants: 920_000,
    done_ratio: 0.61,
    movement: 'peak',
    cover_gradient: 'from-emerald-400 via-teal-500 to-ink-700',
    hashtag: '#AI셰프',
    duration_label: '5분',
    cost_label: '무료',
  },
  {
    id: 'td-ai-ghibli',
    kind: 'ai',
    emoji: '🌳',
    title: '지브리 변환',
    desc: '내 사진을 지브리 스타일로',
    participants: 814_000,
    done_ratio: 0.54,
    movement: 'rising',
    cover_gradient: 'from-emerald-300 via-sky-400 to-indigo-500',
    hashtag: '#지브리AI',
    duration_label: '3분',
    cost_label: '무료~5천 원',
  },
  {
    id: 'td-ai-suno',
    kind: 'ai',
    emoji: '🎵',
    title: 'Suno 30초 노래',
    desc: '한 줄 가사 → 즉시 노래',
    participants: 612_000,
    done_ratio: 0.42,
    movement: 'rising',
    cover_gradient: 'from-purple-400 via-fuchsia-500 to-rose-500',
    hashtag: '#Suno30초노래',
    duration_label: '5분',
    cost_label: '무료~5천 원',
  },
  {
    id: 'td-ai-selfie',
    kind: 'ai',
    emoji: '📸',
    title: 'AI 인생샷',
    desc: '미드저니/노벨라 셀카 변환',
    participants: 488_000,
    done_ratio: 0.35,
    movement: 'rising',
    cover_gradient: 'from-amber-300 via-rose-400 to-fuchsia-600',
    hashtag: '#AI인생샷',
    duration_label: '5분',
    cost_label: '5천 원',
  },
  {
    id: 'td-ai-baby',
    kind: 'ai',
    emoji: '👶',
    title: 'AI 어렸을 때 사진',
    desc: '가족 사진 → 1980년대 톤',
    participants: 312_000,
    done_ratio: 0.28,
    movement: 'fading',
    cover_gradient: 'from-amber-200 via-amber-400 to-rose-300',
    hashtag: '#AI어린시절',
    duration_label: '5분',
    cost_label: '무료',
  },
]

// 참여자 desc 로 정렬 후 1..N rank 부여 — 카테고리 무관 인기순
export const TREND_TODO: TrendToDoItem[] = [...RAW]
  .sort((a, b) => b.participants - a.participants)
  .map((it, idx) => ({ ...it, rank: idx + 1 }))

export const TOTAL_TODOS = TREND_TODO.length

// ── 등급 ───────────────────────────────────────────
export type InsiderTier = 'rookie' | 'follower' | 'insider' | 'today_insider'

export interface TierInfo {
  id: InsiderTier
  label: string
  threshold: number
  emoji: string
  ringClass: string
}

export const TIERS: TierInfo[] = [
  { id: 'rookie', label: '트렌드 입문', threshold: 0, emoji: '🌱', ringClass: 'ring-ink-200 text-ink-500' },
  { id: 'follower', label: '트렌드 따라쟁이', threshold: 3, emoji: '🥉', ringClass: 'ring-amber-300 text-amber-700' },
  { id: 'insider', label: '트렌드 인싸', threshold: 8, emoji: '🥈', ringClass: 'ring-stone-300 text-stone-700' },
  { id: 'today_insider', label: '오늘의 인싸', threshold: 14, emoji: '🥇', ringClass: 'ring-coral-300 text-coral-700' },
]

export function tierFor(count: number): TierInfo {
  return [...TIERS].reverse().find((t) => count >= t.threshold) ?? TIERS[0]
}

export function nextTier(count: number): TierInfo | null {
  const sorted = [...TIERS].sort((a, b) => a.threshold - b.threshold)
  return sorted.find((t) => count < t.threshold) ?? null
}

// ── 인싸 리더보드 (mock) ────────────────────────────
export interface InsiderEntry {
  id: string
  name: string
  emoji: string
  region: string
  generation: string
  done_count: number
}

export const INSIDER_LEADERBOARD: InsiderEntry[] = [
  { id: 'in-1', name: 'soyo_22', emoji: '🐰', region: '서울', generation: '10대', done_count: 18 },
  { id: 'in-2', name: '두딸 엄마', emoji: '👩‍👧‍👧', region: '부산', generation: '30·40대', done_count: 16 },
  { id: 'in-3', name: '강릉베리', emoji: '🫐', region: '강릉', generation: '30·40대', done_count: 14 },
  { id: 'in-4', name: '우리 엄마 손', emoji: '👵', region: '전주', generation: '50·60대', done_count: 13 },
  { id: 'in-5', name: '한라봉메스', emoji: '🍊', region: '제주', generation: '30·40대', done_count: 11 },
  { id: 'in-6', name: '지수네 가족', emoji: '👨‍👩‍👧', region: '전주', generation: '온 가족', done_count: 9 },
  { id: 'in-7', name: '대구 라이온', emoji: '🦁', region: '대구', generation: '10대', done_count: 8 },
  { id: 'in-8', name: '커피 버터떡', emoji: '☕', region: '강릉', generation: '30·40대', done_count: 7 },
  { id: 'in-9', name: 'jihoo_kor', emoji: '🌐', region: '제주', generation: '외국인', done_count: 6 },
  { id: 'in-10', name: '한 번만 만들어 봄', emoji: '🥫', region: '서울', generation: '10대', done_count: 5 },
]
