import type { ChallengeCard, TrendCardData } from '../types'

export const TRENDS: TrendCardData[] = [
  {
    id: 'trend-dujjonku',
    title: '두바이 쫀득쿠키',
    emoji: '🍪',
    cover_gradient: 'from-coral-300 via-coral-400 to-coral-600',
    views_24h: 1280000,
    generations_reached: ['teen', 'adult'],
    challenge_id: 'ch-dujjonku',
    short_pitch: '틱톡에서 시작된 쫀득한 한 입. 온 가족 버전으로 다시 만들어보세요.',
    category: 'food',
  },
  {
    id: 'trend-butter-run',
    title: '버터런',
    emoji: '🏃‍♀️',
    cover_gradient: 'from-amber-300 via-amber-500 to-coral-500',
    views_24h: 760000,
    generations_reached: ['teen', 'adult'],
    challenge_id: 'ch-butter-run',
    short_pitch: '아침 버터 한 조각 들고 5분 달리기. 겨울 활력 챌린지.',
    category: 'fitness',
  },
  {
    id: 'trend-bomdong',
    title: '봄동 비빔밥',
    emoji: '🥗',
    cover_gradient: 'from-emerald-300 via-emerald-500 to-ink-500',
    views_24h: 412000,
    generations_reached: ['adult', 'senior', 'family'],
    challenge_id: 'ch-bomdong',
    short_pitch: '24절기 춘분 제철 봄동으로 만드는 5분 비빔밥.',
    category: 'food',
  },
  {
    id: 'trend-baseball-face',
    title: '야구 표정 챌린지',
    emoji: '⚾️',
    cover_gradient: 'from-sky-300 via-indigo-400 to-ink-600',
    views_24h: 980000,
    generations_reached: ['teen', 'adult', 'family'],
    challenge_id: 'ch-baseball-face',
    short_pitch: '야구장 응원 표정 따라 찍기. 사실은 탈춤 표정의 현대판.',
    category: 'photo',
  },
]

export const CHALLENGES: ChallengeCard[] = [
  {
    id: 'ch-dujjonku',
    title: '두쫀쿠 만들기',
    trend_source: '두바이 쫀득쿠키',
    emoji: '🍪',
    cover_gradient: 'from-coral-300 via-coral-400 to-coral-600',
    difficulty: 'easy',
    duration_minutes: 30,
    materials: [
      { name: '쫀득쿠키 믹스', amount: '300g', buyLink: 'https://example.shop/duj-mix' },
      { name: '버터', amount: '50g' },
      { name: '계란', amount: '1개' },
      { name: '피스타치오 크림', amount: '4큰술' },
    ],
    steps: [
      { order: 1, title: '재료 계량', body: '믹스·버터·계란을 그릇에 한꺼번에 넣어요.', duration_minutes: 5 },
      { order: 2, title: '반죽', body: '주걱으로 30번만 섞어 쫀득함을 살려요.', duration_minutes: 5 },
      { order: 3, title: '굽기', body: '180도 오븐에서 12분. 가장자리가 살짝 갈색이 될 때까지.', duration_minutes: 12 },
      { order: 4, title: '크림 채우기', body: '식힌 쿠키 사이에 피스타치오 크림 1큰술을 발라요.', duration_minutes: 8 },
    ],
    generation_variants: [
      {
        generation: 'teen',
        title: '두쫀쿠, 더 잘 만드는 법',
        hook: '이미 알지? 카메라 켜고 30번 반죽 컷만 따도 영상 각.',
        tone_note: '트렌디·짧은 호흡',
      },
      {
        generation: 'adult',
        title: '주말에 아이랑 두쫀쿠 굽기',
        hook: '버터 향과 피스타치오 크림. 아이 손도 다칠 일 없는 30분 코스.',
        tone_note: '실용·따뜻',
      },
      {
        generation: 'senior',
        title: '손주와 함께, 두쫀쿠',
        hook: '어렵지 않아요. 믹스에 계란 하나, 버터 한 조각이면 충분합니다.',
        tone_note: '친절·단계적',
      },
      {
        generation: 'family',
        title: '온 가족 두쫀쿠 대결',
        hook: '세 팀으로 나눠 가장 쫀득한 한 입을 가려보세요.',
        tone_note: '공동체',
      },
    ],
    local_variants: [
      { region: 'seoul', title: '쑥 두쫀쿠', twist: '믹스에 데친 쑥 1큰술을 더해 향을 살려요.', partner_place: '인사동 쑥 카페' },
      { region: 'jeonju', title: '흑임자 두쫀쿠', twist: '크림 대신 흑임자 페이스트를 채워요.', partner_place: '전주 한옥마을 공방' },
      { region: 'jeju', title: '한라봉 두쫀쿠', twist: '한라봉 잼을 1작은술 함께 짜넣어요.', partner_place: '제주 감귤 농장' },
      { region: 'busan', title: '유자 두쫀쿠', twist: '피스타치오 대신 기장 유자청 1큰술.', partner_place: '기장 유자 농장' },
      { region: 'gangneung', title: '커피 두쫀쿠', twist: '반죽에 에스프레소 1샷을 섞어요.', partner_place: '안목해변 커피거리' },
    ],
    traditional_connection: {
      label: '사실 이건 찹쌀떡·약과의 현대판이에요',
      body: '쫀득함 + 단 크림 조합은 조선 후기 약과·찹쌀 모찌의 핵심 식감과 같습니다. 글루텐을 적게 치고 30번만 섞는 건 떡 반죽의 손맛과 닮아 있어요.',
    },
  },
  {
    id: 'ch-butter-run',
    title: '아침 버터런',
    trend_source: '버터런',
    emoji: '🏃‍♀️',
    cover_gradient: 'from-amber-300 via-amber-500 to-coral-500',
    difficulty: 'easy',
    duration_minutes: 15,
    materials: [
      { name: '버터 한 조각', amount: '5g' },
      { name: '식빵 또는 통밀빵', amount: '1쪽' },
      { name: '운동화', amount: '편한 것' },
    ],
    steps: [
      { order: 1, title: '버터 토스트 한 입', body: '갓 구운 토스트에 버터를 얇게 발라 한 입.', duration_minutes: 3 },
      { order: 2, title: '동네 5분 달리기', body: '집 근처 한 블록을 가볍게 달려요.', duration_minutes: 5 },
      { order: 3, title: '걷기 5분', body: '심박이 가라앉을 때까지 천천히.', duration_minutes: 5 },
      { order: 4, title: '인증샷', body: '오늘의 토스트와 운동화를 한 컷.', duration_minutes: 2 },
    ],
    generation_variants: [
      { generation: 'teen', title: '버터런, 5분만', hook: '아침에 늦잠 자도 OK. 버터 한 조각 + 5분.', tone_note: '짧고 빠른' },
      { generation: 'adult', title: '출근 전 버터런', hook: '커피 내리는 동안 5분 달리기. 하루가 가벼워져요.', tone_note: '루틴 중심' },
      { generation: 'senior', title: '아침 산책 버터런', hook: '뛰지 않아도 괜찮아요. 가볍게 걷기 + 버터 토스트.', tone_note: '안전·천천히' },
      { generation: 'family', title: '주말 가족 버터런', hook: '아이와 함께 동네 한 바퀴, 돌아와서 토스트 한 조각.', tone_note: '가족' },
    ],
    local_variants: [
      { region: 'seoul', title: '한강 버터런', twist: '한강 산책로 5분 코스로.', partner_place: '뚝섬 한강공원' },
      { region: 'busan', title: '바닷가 버터런', twist: '광안리 모래사장 5분 러닝.', partner_place: '광안리 해수욕장' },
      { region: 'gangneung', title: '안목해변 버터런', twist: '커피 한 잔과 해변 5분.', partner_place: '안목해변 커피거리' },
    ],
    traditional_connection: {
      label: '조선의 아침 산책 문화와 닮았어요',
      body: '조선 사대부의 “조보(朝步)”는 해 뜨기 전 가벼운 산책으로 하루를 여는 습관이었습니다. 빠르지 않게, 그러나 매일 — 그 리듬이 버터런과 닮아 있어요.',
    },
  },
  {
    id: 'ch-bomdong',
    title: '봄동 비빔밥',
    trend_source: '봄동 비빔밥',
    emoji: '🥗',
    cover_gradient: 'from-emerald-300 via-emerald-500 to-ink-500',
    difficulty: 'easy',
    duration_minutes: 10,
    materials: [
      { name: '봄동', amount: '한 줌' },
      { name: '밥', amount: '1공기' },
      { name: '고추장', amount: '1큰술' },
      { name: '참기름', amount: '1작은술' },
      { name: '계란 후라이', amount: '1개' },
    ],
    steps: [
      { order: 1, title: '봄동 손질', body: '잎을 한 입 크기로 찢고 찬물에 헹궈요.', duration_minutes: 3 },
      { order: 2, title: '비비기', body: '밥 + 봄동 + 고추장 + 참기름을 30번 비벼요.', duration_minutes: 4 },
      { order: 3, title: '계란 올리기', body: '반숙 후라이를 위에 얹어요.', duration_minutes: 3 },
    ],
    generation_variants: [
      { generation: 'teen', title: '봄동 비빔밥, 10분 컷', hook: '편의점 밥에 봄동만 더해도 진짜 봄.', tone_note: '간단' },
      { generation: 'adult', title: '봄동 비빔밥, 평일 저녁', hook: '한 그릇으로 끝나는 제철 한 끼.', tone_note: '실용' },
      { generation: 'senior', title: '춘분 봄동 비빔밥', hook: '봄동은 데치지 않아도 부드러워요. 고추장 한 술이면 됩니다.', tone_note: '친절' },
      { generation: 'family', title: '온 가족 봄동 한 그릇', hook: '아이는 계란, 엄마는 봄동, 아빠는 고추장 담당.', tone_note: '분담' },
    ],
    local_variants: [
      { region: 'jeonju', title: '전주식 콩나물 봄동', twist: '콩나물국 한 술과 함께 비벼요.', partner_place: '풍남문 시장' },
      { region: 'gangneung', title: '초당두부 봄동', twist: '초당두부 한 모를 으깨 올려요.', partner_place: '초당두부마을' },
      { region: 'jeju', title: '한라봉 봄동', twist: '한라봉 즙 1작은술을 양념에 더해요.', partner_place: '감귤 농장' },
    ],
    traditional_connection: {
      label: '24절기 춘분의 제철 음식이에요',
      body: '봄동은 춘분 즈음 노지에서 가장 단맛이 오릅니다. 세시풍속에서 “봄나물 한 그릇”은 한 해의 입맛을 여는 의식이었어요.',
    },
  },
  {
    id: 'ch-baseball-face',
    title: '야구 표정 챌린지',
    trend_source: '야구 표정 챌린지',
    emoji: '⚾️',
    cover_gradient: 'from-sky-300 via-indigo-400 to-ink-600',
    difficulty: 'medium',
    duration_minutes: 5,
    materials: [
      { name: '스마트폰 카메라', amount: '1대' },
      { name: '응원 도구(있다면)', amount: '자유' },
    ],
    steps: [
      { order: 1, title: '표정 3종 정하기', body: '환호 / 절망 / 의심 — 세 표정을 골라요.', duration_minutes: 1 },
      { order: 2, title: '연속 촬영', body: '같은 자리에서 표정만 바꿔 3컷.', duration_minutes: 2 },
      { order: 3, title: '이어붙이기', body: '템플릿에 맞춰 슬라이드로 합쳐요.', duration_minutes: 2 },
    ],
    generation_variants: [
      { generation: 'teen', title: '표정 3컷, 한 번에', hook: '진짜 진심으로 표정 짓기. 어색할수록 잘됨.', tone_note: '캐주얼' },
      { generation: 'adult', title: '아이와 함께, 표정 3컷', hook: '식탁에서 5분이면 끝. 집에 있는 모자만 있어도 충분.', tone_note: '가족' },
      { generation: 'senior', title: '손주와 표정 사진', hook: '환호·놀람·웃음 — 손주가 시키는 대로 따라해보세요.', tone_note: '친절' },
      { generation: 'family', title: '가족 단체 표정', hook: '4인 한 컷. 누구의 표정이 가장 진짜일까요?', tone_note: '함께' },
    ],
    local_variants: [
      { region: 'busan', title: '롯데 응원 표정', twist: '주황 봉지 응원 도구로.', partner_place: '사직야구장' },
      { region: 'daegu', title: '삼성 응원 표정', twist: '파란 풍선 들고 한 컷.', partner_place: '대구 라이온즈파크' },
      { region: 'gwangju', title: '기아 응원 표정', twist: '빨간 응원 막대로.', partner_place: '광주 챔피언스필드' },
    ],
    traditional_connection: {
      label: '사실 이건 탈춤 표정의 현대판이에요',
      body: '봉산탈춤·하회별신굿의 양반·말뚝이 캐릭터는 한 가지 표정으로 “과장된 감정”을 전달합니다. 야구 응원 표정도 똑같은 코드를 씁니다 — 진심을 과장해서 보여주기.',
    },
  },
]

export function findChallenge(id: string) {
  return CHALLENGES.find((c) => c.id === id)
}
