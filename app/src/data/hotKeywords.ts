export type Movement = 'up' | 'flat' | 'down'
export type HotHighlight = 'new' | 'hot' | 'family' | 'fading' | null

export interface HotKeyword {
  rank: number
  hashtag: string
  challenge_id: string
  emoji: string
  growth: string // "+5.1×" or "-12%"
  movement: Movement
  highlight: HotHighlight
  participants_label: string // "8.4만명 도전중"
}

export const HOT_KEYWORDS: HotKeyword[] = [
  {
    rank: 1,
    hashtag: '#한라봉메스',
    challenge_id: 'ch-eton-mess',
    emoji: '🍓',
    growth: '+5.1×',
    movement: 'up',
    highlight: 'new',
    participants_label: '12.4만명 도전중',
  },
  {
    rank: 2,
    hashtag: '#쿠크다스딸기샌드',
    challenge_id: 'ch-cookie-strawberry',
    emoji: '🍰',
    growth: '+3.4×',
    movement: 'up',
    highlight: 'hot',
    participants_label: '9.8만명 도전중',
  },
  {
    rank: 3,
    hashtag: '#흑임자두쫀쿠',
    challenge_id: 'ch-dujjonku',
    emoji: '🍪',
    growth: '+2.6×',
    movement: 'up',
    highlight: 'family',
    participants_label: '6.1만명 도전중',
  },
  {
    rank: 4,
    hashtag: '#유자두쫀쿠',
    challenge_id: 'ch-dujjonku',
    emoji: '🍋',
    growth: '+1.8×',
    movement: 'up',
    highlight: null,
    participants_label: '3.2만명 도전중',
  },
  {
    rank: 5,
    hashtag: '#흑임자버터떡',
    challenge_id: 'ch-butter-rice',
    emoji: '🧈',
    growth: '+1.4×',
    movement: 'up',
    highlight: 'family',
    participants_label: '2.7만명 도전중',
  },
  {
    rank: 6,
    hashtag: '#야구표정3컷',
    challenge_id: 'ch-baseball-face',
    emoji: '⚾️',
    growth: '+1.2×',
    movement: 'up',
    highlight: null,
    participants_label: '1.9만명 도전중',
  },
  {
    rank: 7,
    hashtag: '#춘분봄동',
    challenge_id: 'ch-bomdong',
    emoji: '🥗',
    growth: '-22%',
    movement: 'down',
    highlight: 'fading',
    participants_label: '4.1천명 마무리중',
  },
  {
    rank: 8,
    hashtag: '#프링글스초코블럭',
    challenge_id: 'ch-pringles-choco',
    emoji: '🥫',
    growth: '-61%',
    movement: 'down',
    highlight: 'fading',
    participants_label: '단발 종료 직전',
  },
]
