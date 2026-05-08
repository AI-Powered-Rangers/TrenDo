import type { Region } from '../types'

export interface FestivalTiein {
  challenge_id: string
  trend_title: string
  emoji: string
  body: string
}

export interface LocalFestival {
  id: string
  region: Region
  city_label: string // "충남 논산" 등 — region 라벨과 다를 수 있음
  name: string
  emoji: string
  cover_gradient: string
  when: string
  base_pitch: string // 원래 축제 정체성
  trend_pitch: string // 트렌드 결합 마케팅 문구
  marketing_partner: string // "논산시청 관광과" 등 (mock)
  tieins: FestivalTiein[]
}

export const LOCAL_FESTIVALS: LocalFestival[] = [
  {
    id: 'fest-nonsan-strawberry',
    region: 'incheon', // 충남 논산은 매핑 가능한 region이 없으므로 가까운 incheon 핀에 묶음 (지도 표시는 별도 처리)
    city_label: '충남 논산',
    name: '논산 딸기 축제',
    emoji: '🍓',
    cover_gradient: 'from-rose-300 via-pink-400 to-coral-500',
    when: '4월 12 ~ 21일',
    base_pitch: '논산 딸기 60년 산지 직거래 + 딸기 시식관',
    trend_pitch:
      '올해는 SNS에서 뜬 “딸기 + 두쫀쿠 / 이튼 메스 / 쿠크다스 딸기샌드”를 그 자리에서 — 산지 딸기로 트렌드 디저트 3종.',
    marketing_partner: '논산시 관광진흥과 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '딸기 두쫀쿠 만들기 부스',
        emoji: '🍪',
        body: '논산 산지 딸기 잼을 카다이프 필링에 함께 넣는 한정 변형. 마시멜로 반죽도 현장에서.',
      },
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '딸기 이튼 메스 한 컵',
        emoji: '🍓',
        body: '메스 부스 — 딸기·머랭·휘핑크림 무한 토핑. 가족 단위 단체 한 컷 인증샷 명소.',
      },
      {
        challenge_id: 'ch-cookie-strawberry',
        trend_title: '딸기 쿠크다스 샌드 워크숍',
        emoji: '🍰',
        body: '냉동 4시간 후 단면 컷 공개. 그날 아침에 만들어 저녁에 가져가는 형식.',
      },
    ],
  },
  {
    id: 'fest-jeonju-bibimbap',
    region: 'jeonju',
    city_label: '전북 전주',
    name: '전주 비빔밥 축제',
    emoji: '🥄',
    cover_gradient: 'from-emerald-300 via-emerald-500 to-ink-500',
    when: '5월 둘째 주말',
    base_pitch: '전주 비빔밥 정통 한 그릇 — 콩나물·황포묵·육회',
    trend_pitch:
      'SNS에서 뜬 봄동 비빔밥, 흑임자 두쫀쿠, 흑임자 버터떡까지 — 전주 미식이 디저트 트렌드와 만남.',
    marketing_partner: '전주시 관광·문화 진흥과 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-bomdong',
        trend_title: '봄동 비빔밥 부스',
        emoji: '🥗',
        body: '풍남문 시장 콩나물 + 봄동을 그 자리에서 비비기. 24절기 춘분 메뉴 한정.',
      },
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '흑임자 두쫀쿠 디저트관',
        emoji: '🍪',
        body: '한옥마을 공방과 협업 — 직접 빻은 흑임자 페이스트로 두쫀쿠 한 입.',
      },
      {
        challenge_id: 'ch-butter-rice',
        trend_title: '흑임자 버터떡 시연',
        emoji: '🧈',
        body: '풍남문 시장 떡집 5곳이 함께 굽는 흑임자 버터떡 시식 코너.',
      },
    ],
  },
  {
    id: 'fest-busan-yuja',
    region: 'busan',
    city_label: '부산 기장',
    name: '기장 유자 축제',
    emoji: '🍋',
    cover_gradient: 'from-amber-300 via-orange-400 to-coral-500',
    when: '11월 첫째 주',
    base_pitch: '100년 유자 산지 — 유자청·유자차 시연·시음',
    trend_pitch:
      '유자 두쫀쿠·유자 메스로 다시 만나는 유자 디저트. 인스타에서 본 그 단면을 산지에서 바로.',
    marketing_partner: '기장군 관광과 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '유자 두쫀쿠 만들기',
        emoji: '🍪',
        body: '기장 유자청 1큰술을 두쫀쿠 필링에 — 산지 한정 유자 향이 살아있는 변형.',
      },
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '유자 메스 한 컵',
        emoji: '🍓',
        body: '딸기 시럽 자리에 유자청을 부어 산뜻한 가을 메스로.',
      },
    ],
  },
  {
    id: 'fest-gangneung-coffee',
    region: 'gangneung',
    city_label: '강원 강릉',
    name: '강릉 커피축제',
    emoji: '☕',
    cover_gradient: 'from-amber-700 via-stone-600 to-ink-700',
    when: '10월 둘째 주말',
    base_pitch: '안목해변 커피거리 1번지 — 한국 1세대 커피 도시',
    trend_pitch:
      '커피 + 두쫀쿠/버터떡/베리 메스 — 강릉 커피가 디저트 트렌드 3종과 만나는 프리미엄 콜라보 에디션.',
    marketing_partner: '강릉시 관광개발과 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '커피 두쫀쿠 부스',
        emoji: '🍪',
        body: '안목해변 커피거리 5개 로스터리가 함께 만드는 에스프레소 마시멜로 반죽 두쫀쿠.',
      },
      {
        challenge_id: 'ch-butter-rice',
        trend_title: '커피 버터떡 클래스',
        emoji: '🧈',
        body: '우유 30%를 진한 에스프레소로 — 어른 디저트 버터떡 한정 시연.',
      },
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '안목 베리 메스',
        emoji: '🫐',
        body: '주문진 산지 베리 3종 + 머랭 + 강릉 우유 휘핑크림.',
      },
    ],
  },
  {
    id: 'fest-jeju-citrus',
    region: 'jeju',
    city_label: '제주',
    name: '제주 감귤축제',
    emoji: '🍊',
    cover_gradient: 'from-amber-300 via-orange-400 to-emerald-500',
    when: '11월 ~ 다음 해 3월',
    base_pitch: '한라봉·천혜향·레드향 산지 직거래 + 농장 체험',
    trend_pitch:
      '한라봉 두쫀쿠·메스·버터떡까지 — 제주 시즌 한정 “감귤 디저트 트렌드 3종 풀세트”.',
    marketing_partner: '제주관광공사 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '한라봉 두쫀쿠',
        emoji: '🍪',
        body: '한라봉 잼을 1작은술 함께 짜넣는 한정 두쫀쿠 — 부스에서 5분 만에 한 입.',
      },
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '한라봉 메스',
        emoji: '🍓',
        body: '딸기 시럽 자리에 한라봉 즙 + 잼. 가족 단위 단체 한 컵 부스.',
      },
      {
        challenge_id: 'ch-butter-rice',
        trend_title: '한라봉 버터떡',
        emoji: '🧈',
        body: '한라봉 제스트 1작은술 + 즙 1큰술이 들어간 시즌 한정 버터떡.',
      },
    ],
  },
  {
    id: 'fest-cheongsong-apple',
    region: 'daegu',
    city_label: '경북 청송',
    name: '청송 사과축제',
    emoji: '🍎',
    cover_gradient: 'from-rose-400 via-amber-500 to-coral-600',
    when: '11월 첫째 주말',
    base_pitch: '청송 사과 60년 — 산지 직거래·사과청·말린 사과칩',
    trend_pitch:
      '사과 + 트렌드 디저트. 단발 인증 챌린지인 “사과 초코블럭”까지 한 자리에서 — 한 번 인증하면 잠깐 유행도 즐길거리.',
    marketing_partner: '청송군 농업기술센터 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-pringles-choco',
        trend_title: '청송 사과 초코블럭',
        emoji: '🥫',
        body: '말린 사과칩 사이사이 박은 사과 초코블럭 — 단발 챌린지지만 산지에서 한 번 즐기기 좋음.',
      },
      {
        challenge_id: 'ch-butter-rice',
        trend_title: '사과 버터떡',
        emoji: '🧈',
        body: '청송 사과를 넣은 가을 버터떡 — 사과청 1큰술이 비밀.',
      },
    ],
  },
  {
    id: 'fest-damyang-fig',
    region: 'gwangju',
    city_label: '전남 담양',
    name: '담양 무화과 마켓',
    emoji: '🟣',
    cover_gradient: 'from-violet-300 via-rose-400 to-emerald-500',
    when: '8월 ~ 9월',
    base_pitch: '담양 무화과 농장 직거래 + 잼·청 클래스',
    trend_pitch:
      '무화과 메스 — 시즌 한정 클래스. 인스타에서 본 그 자줏빛 단면을 산지 무화과로.',
    marketing_partner: '담양군 관광과 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '무화과 메스 클래스',
        emoji: '🍓',
        body: '제철 무화과를 손으로 으깨 머랭 + 휘핑크림과 한 컵 — 산지 한정 자줏빛 메스.',
      },
    ],
  },
  {
    id: 'fest-incheon-mug',
    region: 'incheon',
    city_label: '인천 강화',
    name: '강화 약쑥 봄 페스티벌',
    emoji: '🌿',
    cover_gradient: 'from-emerald-300 via-teal-500 to-ink-600',
    when: '4월 ~ 5월',
    base_pitch: '강화 약쑥 800년 전통 — 농가 시연·시식',
    trend_pitch:
      '약쑥 두쫀쿠 — 강화 산지 쑥 한 큰술이 카다이프 필링과 만나는 봄 한정 변형.',
    marketing_partner: '강화군청 농업기술센터 × TrenDo',
    tieins: [
      {
        challenge_id: 'ch-dujjonku',
        trend_title: '강화 약쑥 두쫀쿠',
        emoji: '🍪',
        body: '데친 강화 약쑥 1큰술을 카다이프 필링에 — 봄 한정 향과 색의 두쫀쿠.',
      },
    ],
  },
]

export function festivalsByRegion(region: Region): LocalFestival[] {
  return LOCAL_FESTIVALS.filter((f) => f.region === region)
}
