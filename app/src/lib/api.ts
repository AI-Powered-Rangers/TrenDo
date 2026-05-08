import type { ChallengeCard, Generation, Region, GenerationVariant } from '../types'
import { findChallenge, CHALLENGES } from '../data/trends'

export interface TranslateInput {
  trend: string
  generation: Generation
  region: Region
  base_challenge_id?: string
}

export interface TranslateResult {
  source: 'mock-ai'
  challenge: ChallengeCard
  rationale: string[]
}

const TONE_LIBRARY: Record<Generation, { tag: string; verbs: string[]; closer: string }> = {
  teen: {
    tag: '트렌디·짧게',
    verbs: ['컷 따기', '바로 올리기', '챌린지 인증', '한 컷 박제'],
    closer: '카메라부터 켜자.',
  },
  adult: {
    tag: '실용·따뜻',
    verbs: ['주말에 같이', '아이랑 한 컷', '집에서 30분', '커피 내리며'],
    closer: '오늘 저녁이면 충분해요.',
  },
  senior: {
    tag: '친절·단계적',
    verbs: ['천천히', '하나씩', '손주와 함께', '사진 한 장'],
    closer: '어렵지 않습니다. 이것만 있으면 돼요.',
  },
  family: {
    tag: '온 가족',
    verbs: ['역할 나눠서', '대결로', '함께 한 컷', '돌아가며'],
    closer: '누구의 한 입이 가장 쫀득할까요?',
  },
}

const REGION_TWIST: Record<Region, string> = {
  seoul: '인사동 쑥 한 큰술을 더해 향을 살려요.',
  incheon: '강화 약쑥 가루를 한 꼬집 더해요.',
  gangneung: '안목해변 커피 한 샷을 반죽에 섞어요.',
  daegu: '청송 사과 한 조각을 박아 굽기.',
  jeonju: '풍남문 시장 흑임자 페이스트로 채우기.',
  gwangju: '무등산 수박 한 큰술을 토핑.',
  busan: '기장 유자청을 1큰술 짜넣기.',
  jeju: '한라봉 잼을 1작은술 함께 짜넣기.',
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

function pickBase(input: TranslateInput): ChallengeCard {
  if (input.base_challenge_id) {
    const exact = findChallenge(input.base_challenge_id)
    if (exact) return exact
  }
  const trend = input.trend.toLowerCase()
  const found = CHALLENGES.find(
    (c) =>
      c.title.toLowerCase().includes(trend) ||
      c.trend_source.toLowerCase().includes(trend) ||
      trend.includes(c.title.toLowerCase()),
  )
  return found ?? CHALLENGES[0]
}

function remixVariants(
  base: GenerationVariant[],
  generation: Generation,
  trend: string,
): GenerationVariant[] {
  const tone = TONE_LIBRARY[generation]
  return base.map((v) => {
    if (v.generation !== generation) return v
    const verb = tone.verbs[Math.floor(Math.random() * tone.verbs.length)]
    return {
      ...v,
      title: `${trend}, ${verb}`,
      hook: `${v.hook.split('.')[0]}. ${tone.closer}`,
      tone_note: tone.tag,
    }
  })
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export async function translateTrend(input: TranslateInput): Promise<TranslateResult> {
  const base = pickBase(input)
  await delay(900) // demo "AI 분석 중" feel

  const trendName = input.trend.trim() || base.trend_source
  const localVariant = base.local_variants.find((l) => l.region === input.region) ?? {
    region: input.region,
    title: `${REGION_LABEL[input.region]}식 ${base.title}`,
    twist: REGION_TWIST[input.region],
    partner_place: '지역 파트너 매장',
  }

  const challenge: ChallengeCard = {
    ...base,
    id: `${base.id}-mock-${input.generation}-${input.region}`,
    trend_source: trendName,
    generation_variants: remixVariants(base.generation_variants, input.generation, trendName),
    local_variants: [
      localVariant,
      ...base.local_variants.filter((l) => l.region !== input.region),
    ],
  }

  const rationale = [
    `세대 톤 적용: ${TONE_LIBRARY[input.generation].tag}`,
    `지역 결합: ${REGION_LABEL[input.region]} → ${localVariant.twist}`,
    challenge.traditional_connection
      ? `전통 연결 유지: ${challenge.traditional_connection.label}`
      : '전통 연결 미발견 — 자연스러운 노출 보류',
  ]

  return { source: 'mock-ai', challenge, rationale }
}
