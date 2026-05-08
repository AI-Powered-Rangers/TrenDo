// 시간축 유행 흐름 — 가장 최근 유행이 왼쪽 첫 자리.
// 오른쪽으로 갈수록 과거 유행. 각 노드는 "이건 어디서 왔나(evolved_from)"를 보여준다.

export type FlowStatus = 'past' | 'declining' | 'rising' | 'peak' | 'fizzled'

export interface FlowStage {
  id: string
  challenge_id: string
  emoji: string
  label: string
  era: string
  status: FlowStatus
  why_now: string // 왜 지금 (또는 그 시점에) 이걸 보고 있나
  evolved_from?: string // 이건 직전 유행에서 어떤 코드를 가져왔나 (마지막 노드는 origin이라 없음)
}

export interface FlowBranch {
  id: string
  challenge_id: string
  emoji: string
  label: string
  era: string
  status: FlowStatus
  origin_id: string
  note: string
}

// 가장 최근 → 과거 순서
export const FLOW_MAIN: FlowStage[] = [
  {
    id: 'flow-1',
    challenge_id: 'ch-ube',
    emoji: '💜',
    label: '우베 치즈케이크',
    era: '지금 정점',
    status: 'peak',
    why_now: '필리핀 보라색 얌(우베) + 치즈케이크. 보라빛 단면 컷 한 컷이 SNS의 메인 영상.',
    evolved_from:
      '“이국 식재료를 한국식 디저트로 옮긴” 코드는 두쫀쿠가 만들었고, 단면 컷 미학은 쿠크다스 딸기샌드와 이튼 메스 라인에서 그대로 이어졌어요.',
  },
  {
    id: 'flow-2',
    challenge_id: 'ch-changeok',
    emoji: '🍡',
    label: '창억떡',
    era: '2주 전부터 상승',
    status: 'rising',
    why_now: '한국 전통 단떡을 옷만 갈아입혀 다시 띄운 흐름. 모찌·찹쌀떡 코드 + 컬러 단면.',
    evolved_from:
      '버터떡이 만든 “쫀득한 한국 단떡” 카테고리에서 분기. 같은 식감 코드를 다른 비주얼로 옮긴 후속.',
  },
  {
    id: 'flow-3',
    challenge_id: 'ch-eton-mess',
    emoji: '🍓',
    label: '이튼 메스',
    era: '4주 전 정점',
    status: 'declining',
    why_now: '딸기·머랭·휘핑크림 어지럽게 부수기. 가족 분담 액션과 정확히 호환.',
    evolved_from:
      '쿠크다스 딸기샌드가 만든 “기다림 → 단면 공개” 영상 포맷에서 “부숴 먹는” 미학으로 한 번 더 진화.',
  },
  {
    id: 'flow-4',
    challenge_id: 'ch-cookie-strawberry',
    emoji: '🍰',
    label: '쿠크다스 딸기샌드',
    era: '6주 전 정점',
    status: 'declining',
    why_now: '냉동 4시간 후 단면 컷 — 짧은 영상에 최적화된 “기다림 디저트”.',
    evolved_from:
      '두쫀쿠가 보여준 “단면 컷이 매력의 전부”라는 영상 포맷이 한국 편의점 재료로 옮겨진 후속.',
  },
  {
    id: 'flow-5',
    challenge_id: 'ch-dujjonku',
    emoji: '🍪',
    label: '두바이 쫀득쿠키',
    era: '12주 전 흐름의 시작',
    status: 'past',
    why_now: '카다이프·피스타치오·마시멜로 — 이국적 재료 + 쫀득 단면. 이 흐름의 기원.',
  },
]

export const FLOW_BRANCHES: FlowBranch[] = [
  {
    id: 'branch-pringles',
    challenge_id: 'ch-pringles-choco',
    emoji: '🥫',
    label: '프링글스 초코블럭',
    era: '5주 전 일시 유행',
    status: 'fizzled',
    origin_id: 'flow-3',
    note:
      '이튼 메스 시기에 잠깐 튀어 올라온 단발 인증 챌린지. 꺼내는 한 컷이 매력이었지만 D+7 잔존이 거의 0이라 본류로 합류하지 못함.',
  },
  {
    id: 'branch-bomdong',
    challenge_id: 'ch-bomdong',
    emoji: '🥗',
    label: '봄동 비빔밥',
    era: '8주 전 절기 유행',
    status: 'fizzled',
    origin_id: 'flow-4',
    note:
      '쿠크다스 시기 옆에서 24절기 춘분 절기 유행으로 잠깐 떠올랐어요. 절기 종료 후 본류와 합류하지 못하고 내년 큐로.',
  },
]
