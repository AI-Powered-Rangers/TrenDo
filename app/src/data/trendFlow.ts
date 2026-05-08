// 시간축 유행 흐름 — 두쫀쿠 → 버터떡 → 봄동 → 쿠크다스 딸기샌드 → 이튼 메스
// + 분기로 잠깐 유행한 프링글스 초코블럭

export type FlowStatus = 'past' | 'declining' | 'rising' | 'peak' | 'fizzled'

export interface FlowStage {
  id: string
  challenge_id: string
  emoji: string
  label: string
  era: string
  status: FlowStatus
  why_then: string // 그때 왜 떴나
  link_to_next?: string // 다음으로 이어진 코드
}

export interface FlowBranch {
  id: string
  challenge_id: string
  emoji: string
  label: string
  era: string
  status: FlowStatus
  origin_id: string // 분기점 stage id
  note: string
}

export const FLOW_MAIN: FlowStage[] = [
  {
    id: 'flow-1',
    challenge_id: 'ch-dujjonku',
    emoji: '🍪',
    label: '두바이 쫀득쿠키',
    era: '8주 전 정점',
    status: 'past',
    why_then: '카다이프·피스타치오·마시멜로 — 이국적 재료 + 쫀득 단면.',
    link_to_next: '쫀득함이라는 식감 코드를 한국식으로 옮긴 것이 다음 단계.',
  },
  {
    id: 'flow-2',
    challenge_id: 'ch-butter-rice',
    emoji: '🧈',
    label: '버터떡',
    era: '6주 전 정점',
    status: 'past',
    why_then: '두쫀쿠의 “쫀득”을 찹쌀가루+버터로 한국식 단떡에 안착.',
    link_to_next: '쫀득에서 “제철·계절감”으로 시선이 이동.',
  },
  {
    id: 'flow-3',
    challenge_id: 'ch-bomdong',
    emoji: '🥗',
    label: '봄동 비빔밥',
    era: '4주 전 정점',
    status: 'declining',
    why_then: '24절기 춘분 + 봄나물 한 그릇이라는 절기 코드.',
    link_to_next: '계절 음식이 끝나고 “기다림 + 단면 컷” 디저트로 전환.',
  },
  {
    id: 'flow-4',
    challenge_id: 'ch-cookie-strawberry',
    emoji: '🍰',
    label: '쿠크다스 딸기샌드',
    era: '2주 전부터 상승',
    status: 'rising',
    why_then: '냉동 4시간 후 단면 컷 — 짧은 영상에 최적화된 “기다림 디저트”.',
    link_to_next: '단면 컷 → “부숴 먹는” 디저트로 미학이 한 번 더 진화.',
  },
  {
    id: 'flow-5',
    challenge_id: 'ch-eton-mess',
    emoji: '🍓',
    label: '이튼 메스',
    era: '지금 정점',
    status: 'peak',
    why_then: '딸기·머랭·휘핑크림을 어지럽게 부수기. 가족 분담과 정확히 호환.',
  },
]

export const FLOW_BRANCHES: FlowBranch[] = [
  {
    id: 'branch-pringles',
    challenge_id: 'ch-pringles-choco',
    emoji: '🥫',
    label: '프링글스 초코블럭',
    era: '3주 전 일시 유행',
    status: 'fizzled',
    origin_id: 'flow-3',
    note:
      '봄동 시기에 잠깐 튀어 올라온 단발 인증 챌린지. 꺼내는 한 컷이 매력이었지만 D+7 잔존이 거의 0이라 본류로 합류하지 못함.',
  },
]
