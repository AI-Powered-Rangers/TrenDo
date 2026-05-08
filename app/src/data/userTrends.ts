// 사용자가 직접 올린 트렌드 제안 (mock seed).
// 좋아요가 PROMOTE_THRESHOLD 이상이면 상위 노출 (떠오르는 트렌드 배지).

export type UserTrendCategory = 'food' | 'restaurant' | 'challenge' | 'media' | 'other'

export const USER_TREND_CATEGORY_LABEL: Record<UserTrendCategory, string> = {
  food: '음식',
  restaurant: '맛집',
  challenge: '챌린지',
  media: '영상',
  other: '기타',
}

export interface UserTrend {
  id: string
  author_name: string
  author_emoji: string
  title: string
  desc: string
  category: UserTrendCategory
  emoji: string
  cover_gradient: string
  image_data_url?: string
  hashtag?: string
  region_label?: string
  base_likes: number
  base_comments: number
  created_minutes_ago: number
  source: 'seed' | 'mine'
}

export const PROMOTE_THRESHOLD = 100

export const USER_TRENDS_SEED: UserTrend[] = [
  {
    id: 'ut-1',
    author_name: '먹잘알 jihye',
    author_emoji: '🍆',
    title: '가지튀김 열풍',
    desc: '가지를 통썰어 튀기고 간장+꿀에 찍어 먹는 거. 동네 술집 메뉴인데 SNS에서 막 뜨고 있음.',
    category: 'food',
    emoji: '🍆',
    cover_gradient: 'from-violet-300 via-purple-400 to-coral-500',
    hashtag: '#가지튀김',
    region_label: '서울 망원',
    base_likes: 312,
    base_comments: 48,
    created_minutes_ago: 22,
    source: 'seed',
  },
  {
    id: 'ut-2',
    author_name: '성수러버',
    author_emoji: '🥛',
    title: '성수 리얼파 라떼',
    desc: '진짜 파를 갈아 넣은 라떼. 호불호 갈리지만 단면 컷이 진짜 인생샷.',
    category: 'restaurant',
    emoji: '🌿',
    cover_gradient: 'from-emerald-300 via-teal-400 to-sky-500',
    hashtag: '#성수파라떼',
    region_label: '서울 성수',
    base_likes: 198,
    base_comments: 31,
    created_minutes_ago: 88,
    source: 'seed',
  },
  {
    id: 'ut-3',
    author_name: '마라사랑',
    author_emoji: '🌶',
    title: '마라탕 + 탕후루',
    desc: '매운 마라탕 → 단 탕후루. 한 끼 코스로 SNS에서 폭발 중.',
    category: 'food',
    emoji: '🥢',
    cover_gradient: 'from-rose-500 via-coral-500 to-amber-400',
    hashtag: '#마라탕후루',
    region_label: '서울 건대',
    base_likes: 142,
    base_comments: 24,
    created_minutes_ago: 140,
    source: 'seed',
  },
  {
    id: 'ut-4',
    author_name: '냉동러',
    author_emoji: '🧊',
    title: '냉동 우유잼',
    desc: '연유 + 식빵 → 냉동 8시간. 자르면 잼처럼 갈라짐.',
    category: 'food',
    emoji: '🍞',
    cover_gradient: 'from-amber-200 via-rose-200 to-pink-300',
    hashtag: '#냉동우유잼',
    base_likes: 84,
    base_comments: 12,
    created_minutes_ago: 230,
    source: 'seed',
  },
  {
    id: 'ut-5',
    author_name: '챌린지러',
    author_emoji: '🙃',
    title: '거꾸로 한 입 챌린지',
    desc: '음식을 거꾸로 든 채로 한 입. 어떤 음식이든 OK, 망한 컷이 매력.',
    category: 'challenge',
    emoji: '🙃',
    cover_gradient: 'from-cyan-300 via-sky-400 to-indigo-500',
    hashtag: '#거꾸로한입',
    base_likes: 58,
    base_comments: 9,
    created_minutes_ago: 320,
    source: 'seed',
  },
  {
    id: 'ut-6',
    author_name: 'AI애호가',
    author_emoji: '🤖',
    title: 'AI 어린시절 사진',
    desc: '내 셀카 + Remini로 1990년대 어린이 사진 변환. 부모 사진이랑 비교 컷.',
    category: 'challenge',
    emoji: '👶',
    cover_gradient: 'from-amber-200 via-amber-300 to-rose-300',
    hashtag: '#AI어린시절',
    base_likes: 41,
    base_comments: 5,
    created_minutes_ago: 380,
    source: 'seed',
  },
  {
    id: 'ut-7',
    author_name: '드라마중독',
    author_emoji: '📺',
    title: '환승연애 시즌4 시작',
    desc: '오늘 첫 화 공개. 친구들이랑 보고 단톡방 폭발.',
    category: 'media',
    emoji: '💔',
    cover_gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    hashtag: '#환승연애',
    base_likes: 220,
    base_comments: 76,
    created_minutes_ago: 56,
    source: 'seed',
  },
  {
    id: 'ut-8',
    author_name: '핵매니아',
    author_emoji: '🔥',
    title: '핵불닭 라면사라다',
    desc: '핵불닭 라면 + 시판 사라다 + 마요. 매단 + 새콤 = 진짜 중독.',
    category: 'food',
    emoji: '🍝',
    cover_gradient: 'from-rose-600 via-coral-500 to-amber-400',
    hashtag: '#핵불닭사라다',
    base_likes: 22,
    base_comments: 4,
    created_minutes_ago: 480,
    source: 'seed',
  },
]
