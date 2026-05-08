import type {
  ChallengeCard,
  CostRange,
  Generation,
  InterestCategory,
  Region,
  TimeBudget,
  TrendCardData,
  UserPrefs,
} from '../types'

export interface MatchContribution {
  key: string
  label: string
  emoji: string
  points: number
  detail: string
}

export interface MatchResult {
  score: number
  contributions: MatchContribution[]
}

const TIME_MIN: Record<TimeBudget, number> = {
  '10m': 10,
  '30m': 30,
  '1h': 60,
  halfday: 240,
}

const COST_KRW: Record<CostRange, number> = {
  free: 0,
  under5k: 5000,
  under10k: 10000,
  under30k: 30000,
}

const COST_LABEL: Record<CostRange, string> = {
  free: '무료',
  under5k: '5천 원',
  under10k: '1만 원',
  under30k: '3만 원',
}

const COST_STR_TO_KRW: Record<string, number> = {
  무료: 0,
  '5천 원 이하': 5000,
  '1만 원 이하': 10000,
  '3만 원 이하': 30000,
}

const CATEGORY_TO_INTEREST: Partial<Record<TrendCardData['category'], InterestCategory>> = {
  food: 'food',
  fitness: 'fitness',
  photo: 'photo',
  craft: 'tradition',
}

const GENERATION_LABEL: Record<Generation, string> = {
  teen: '10대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
  foreign: '외국인',
}

const REGION_LABEL: Record<Region, string> = {
  seoul: '서울',
  incheon: '인천',
  gangneung: '강릉',
  daegu: '대구',
  jeonju: '전주',
  gwangju: '광주',
  busan: '부산',
  jeju: '제주',
}

export function matchScore(
  trend: TrendCardData,
  challenge: ChallengeCard,
  prefs: UserPrefs,
): MatchResult {
  const contribs: MatchContribution[] = []
  let score = 30

  contribs.push({
    key: 'base',
    label: '기본',
    emoji: '🪴',
    points: 30,
    detail: '모든 챌린지에 부여된 기본 점수.',
  })

  // 1) 세대 톤 — variant 존재
  const variant = challenge.generation_variants.find((v) => v.generation === prefs.generation)
  if (variant) {
    score += 18
    contribs.push({
      key: 'gen-tone',
      label: '세대 톤',
      emoji: '🌍',
      points: 18,
      detail: `${GENERATION_LABEL[prefs.generation]} 톤(${variant.tone_note})으로 다시 쓰여 있어요.`,
    })
  }

  // 2) 세대 도달
  const reached =
    trend.generations_reached.includes(prefs.generation) ||
    prefs.generation === 'family' ||
    prefs.generation === 'foreign'
  if (reached) {
    score += 10
    contribs.push({
      key: 'gen-reach',
      label: '세대 도달',
      emoji: '👥',
      points: 10,
      detail: `이 트렌드는 ${GENERATION_LABEL[prefs.generation]}에 이미 도달한 흐름이에요.`,
    })
  }

  // 3) 지역 연결
  const local = challenge.local_variants.find((l) => l.region === prefs.region)
  if (local) {
    score += 20
    contribs.push({
      key: 'region',
      label: '지역 연결',
      emoji: '📍',
      points: 20,
      detail: `${REGION_LABEL[prefs.region]} 변형 “${local.title}”이 준비돼 있어요.`,
    })
  } else {
    score += 5
    contribs.push({
      key: 'region-base',
      label: '지역 기본',
      emoji: '📍',
      points: 5,
      detail: `${REGION_LABEL[prefs.region]} 전용 변형은 없지만 어디서나 가능해요.`,
    })
  }

  // 4) 관심사
  const tCat = CATEGORY_TO_INTEREST[trend.category]
  if (tCat && prefs.interests.includes(tCat)) {
    score += 12
    contribs.push({
      key: 'interest',
      label: '관심사',
      emoji: '🎯',
      points: 12,
      detail: `관심사 “${tCat}”와 정확히 일치합니다.`,
    })
  }

  // 5) 시간
  const userMin = TIME_MIN[prefs.time_budget]
  if (challenge.duration_minutes <= userMin) {
    score += 8
    contribs.push({
      key: 'time',
      label: '시간 여유',
      emoji: '⏱',
      points: 8,
      detail: `소요 ${challenge.duration_minutes}분 ≤ 가용 ${userMin}분.`,
    })
  } else if (challenge.duration_minutes <= userMin * 1.5) {
    score += 4
    contribs.push({
      key: 'time-tight',
      label: '시간 살짝 초과',
      emoji: '⏱',
      points: 4,
      detail: `소요 ${challenge.duration_minutes}분 (가용 ${userMin}분의 1.5배 이내).`,
    })
  }

  // 6) 비용
  const userKrw = COST_KRW[prefs.cost_range]
  const estStr = challenge.estimated_cost
  const estKrw = estStr ? COST_STR_TO_KRW[estStr] ?? 30000 : 30000
  if (estKrw <= userKrw) {
    score += 8
    contribs.push({
      key: 'cost',
      label: '예산 적합',
      emoji: '💸',
      points: 8,
      detail: `${estStr ?? '비용 변동'} ≤ ${COST_LABEL[prefs.cost_range]}.`,
    })
  } else if (estKrw <= userKrw + 10000) {
    score += 4
    contribs.push({
      key: 'cost-near',
      label: '예산 근접',
      emoji: '💸',
      points: 4,
      detail: `${estStr ?? '비용 변동'} (예산보다 살짝 위).`,
    })
  }

  // 7) 참여 방식
  if (challenge.participation_modes?.includes(prefs.participation_type)) {
    score += 6
    contribs.push({
      key: 'mode',
      label: '참여 방식',
      emoji: '🤝',
      points: 6,
      detail: `${prefs.participation_type} 모드를 지원합니다.`,
    })
  }

  return { score: Math.min(100, score), contributions: contribs }
}

export const REGION_TINT: Record<Region, { hero: string; chipBg: string; chipText: string; orb: string }> = {
  seoul: {
    hero: 'from-indigo-400 via-indigo-600 to-ink-800',
    chipBg: 'bg-indigo-400/25',
    chipText: 'text-indigo-100',
    orb: 'bg-indigo-300',
  },
  incheon: {
    hero: 'from-teal-400 via-teal-600 to-ink-800',
    chipBg: 'bg-teal-400/25',
    chipText: 'text-teal-100',
    orb: 'bg-teal-300',
  },
  gangneung: {
    hero: 'from-sky-400 via-sky-600 to-ink-800',
    chipBg: 'bg-sky-400/25',
    chipText: 'text-sky-100',
    orb: 'bg-sky-300',
  },
  daegu: {
    hero: 'from-rose-400 via-rose-600 to-ink-800',
    chipBg: 'bg-rose-400/25',
    chipText: 'text-rose-100',
    orb: 'bg-rose-300',
  },
  jeonju: {
    hero: 'from-amber-400 via-amber-600 to-ink-800',
    chipBg: 'bg-amber-400/25',
    chipText: 'text-amber-100',
    orb: 'bg-amber-300',
  },
  gwangju: {
    hero: 'from-violet-400 via-violet-600 to-ink-800',
    chipBg: 'bg-violet-400/25',
    chipText: 'text-violet-100',
    orb: 'bg-violet-300',
  },
  busan: {
    hero: 'from-cyan-400 via-cyan-600 to-ink-800',
    chipBg: 'bg-cyan-400/25',
    chipText: 'text-cyan-100',
    orb: 'bg-cyan-300',
  },
  jeju: {
    hero: 'from-emerald-400 via-emerald-600 to-ink-800',
    chipBg: 'bg-emerald-400/25',
    chipText: 'text-emerald-100',
    orb: 'bg-emerald-300',
  },
}

export const GEN_GUIDE: Record<Generation, { emoji: string; title: string; body: string }> = {
  teen: {
    emoji: '🎬',
    title: '10대 가이드',
    body: '단면 컷·ASMR 컷 따기 좋은 순간을 짧은 호흡으로 안내해드려요.',
  },
  adult: {
    emoji: '🍳',
    title: '30·40대 가이드',
    body: '아이와 분담할 수 있는 단계와 30분 안팎 동선을 우선 표시해드려요.',
  },
  senior: {
    emoji: '🌿',
    title: '50·60대 친절 가이드',
    body: '시간은 권장이에요. 천천히 하셔도 됩니다. 위험 단계는 어른이 맡아주세요.',
  },
  family: {
    emoji: '👨‍👩‍👧',
    title: '온 가족 분담 가이드',
    body: '각 단계 옆에 부모/아이/공동 추천 분담을 표시해드려요.',
  },
  foreign: {
    emoji: '🌐',
    title: 'EN-friendly Guide',
    body: 'Korean ingredients use both Korean and English names. Substitutions noted in materials.',
  },
}

export { GENERATION_LABEL, REGION_LABEL }
