import type { Region } from '../types'

export interface FestivalTiein {
  challenge_id: string
  trend_title: string
  emoji: string
  body: string
}

export type FestivalSource = 'collab' | 'visitkorea' // 콜라보 시드 vs visitkorea 캘린더 기반

export interface LocalFestival {
  id: string
  region: Region
  city_label: string // "충남 논산" 등 — region 라벨과 다를 수 있음
  name: string
  emoji: string
  cover_gradient: string
  when: string
  base_pitch: string // 원래 축제 정체성
  trend_pitch?: string // 트렌드 결합 마케팅 문구 (콜라보일 때만)
  marketing_partner?: string // 콜라보일 때만 (mock)
  tieins: FestivalTiein[] // 트렌드 결합 부스 (없을 수 있음)
  source: FestivalSource
  highlight?: string // visitkorea: 핵심 한 줄 ("벚꽃 만개 시기" 등)
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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
    source: 'collab',
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

// ── visitkorea 2026 축제 캘린더 기반 ──────────────────────────────────────
// 출처: korean.visitkorea.or.kr/kfes/list/festivalCalendar.do (2026 공식 일정)
LOCAL_FESTIVALS.push(
  {
    id: 'fest-vk-hampyeong-butterfly',
    region: 'gwangju', // 함평은 광주권으로 묶음
    city_label: '전남 함평',
    name: '함평 나비대축제',
    emoji: '🦋',
    cover_gradient: 'from-emerald-300 via-amber-300 to-rose-400',
    when: '2026.04.24 ~ 05.05',
    base_pitch: '함평 엑스포공원 일대에서 열리는 28회차 — “꿈꾸는 나비, 시작하는 여행”',
    source: 'visitkorea',
    highlight: '봄 가족 나들이 명소 · 입장료 성인 7,000원',
    tieins: [
      {
        challenge_id: 'ch-cookie-strawberry',
        trend_title: '나비 정원에서 단면 컷 인증',
        emoji: '🍰',
        body: '꽃밭 배경에서 쿠크다스 딸기샌드 한 조각 — 봄 인생샷 코스로.',
      },
    ],
  },
  {
    id: 'fest-vk-jinhae',
    region: 'busan',
    city_label: '경남 진해',
    name: '진해 군항제',
    emoji: '🌸',
    cover_gradient: 'from-pink-200 via-rose-300 to-coral-400',
    when: '2026.03.28 ~ 04.07 (벚꽃 만개 시기)',
    base_pitch: '64회차 — 충무공 이순신 추모 + 벚꽃 거리 행사',
    source: 'visitkorea',
    highlight: '전국 1위 벚꽃 명소 · 중원로터리 일대',
    tieins: [
      {
        challenge_id: 'ch-baseball-face',
        trend_title: '벚꽃 표정 3컷',
        emoji: '🌸',
        body: '벚꽃 터널에서 환호·놀람·미소 3컷 인증 — 야구 표정 챌린지의 봄 버전.',
      },
    ],
  },
  {
    id: 'fest-vk-boryeong-mud',
    region: 'incheon', // 보령은 충남 — incheon 핀에 묶음
    city_label: '충남 보령',
    name: '보령 머드 축제',
    emoji: '🌊',
    cover_gradient: 'from-stone-400 via-amber-500 to-emerald-600',
    when: '2026.07.18 ~ 08.04',
    base_pitch: '대천해수욕장 — 머드 체험·물놀이·야간 공연·불꽃축제',
    source: 'visitkorea',
    highlight: '여름 글로벌 K-페스티벌 · 가족존 + 일반존',
    tieins: [],
  },
  {
    id: 'fest-vk-haeundae-sand',
    region: 'busan',
    city_label: '부산 해운대',
    name: '해운대 모래축제',
    emoji: '🏖',
    cover_gradient: 'from-sky-300 via-amber-300 to-coral-400',
    when: '2026.05.15 ~ 05.18',
    base_pitch: '해운대해수욕장 일원 — 주제 “모래로 떠나는 부산 시간여행”',
    source: 'visitkorea',
    highlight: '대형 모래 조각 + 야간 빛 페스티벌',
    tieins: [
      {
        challenge_id: 'ch-baseball-face',
        trend_title: '모래 조각 표정 3컷',
        emoji: '⚾️',
        body: '거대 조각 앞에서 사직야구장식 표정 3컷 — 부산 응원 코드와 자연스러운 결합.',
      },
    ],
  },
  {
    id: 'fest-vk-gapado',
    region: 'jeju',
    city_label: '제주 가파도',
    name: '가파도 청보리 축제',
    emoji: '🌾',
    cover_gradient: 'from-emerald-200 via-emerald-400 to-sky-400',
    when: '2026.04.04 ~ 05.10',
    base_pitch: '제주 남쪽 작은 섬 가파도 — 청보리밭 한가운데 길',
    source: 'visitkorea',
    highlight: '4월 말 청보리 만개 + 도보 여행 코스',
    tieins: [
      {
        challenge_id: 'ch-bomdong',
        trend_title: '제주 봄나물 한 그릇',
        emoji: '🥗',
        body: '청보리 + 한라봉 + 봄나물 비빔밥 시식 부스.',
      },
    ],
  },
  {
    id: 'fest-vk-seoul-rose',
    region: 'seoul',
    city_label: '서울 중랑',
    name: '서울장미축제',
    emoji: '🌹',
    cover_gradient: 'from-rose-300 via-coral-400 to-pink-500',
    when: '2026.05.16 ~ 05.25',
    base_pitch: '중랑천 5.5km 장미터널 + 야간 라이트 페스티벌',
    source: 'visitkorea',
    highlight: '서울 봄 산책 1번지 · 무료 입장',
    tieins: [
      {
        challenge_id: 'ch-eton-mess',
        trend_title: '장미 잼 메스 한 컵',
        emoji: '🍓',
        body: '딸기 시럽 자리에 장미 잼 1큰술 — 5월 한정 핑크 메스.',
      },
    ],
  },
  {
    id: 'fest-vk-yeoju-pottery',
    region: 'seoul', // 경기 여주 → 서울권으로 묶음
    city_label: '경기 여주',
    name: '여주 도자기 축제',
    emoji: '🏺',
    cover_gradient: 'from-amber-200 via-stone-400 to-ink-500',
    when: '2026.05.02 ~ 05.18',
    base_pitch: '여주 도예촌 일대 — 직접 빚는 컵·접시 클래스',
    source: 'visitkorea',
    highlight: '체험 부스 200곳 · 가족 클래스',
    tieins: [
      {
        challenge_id: 'ch-changeok',
        trend_title: '내가 빚은 그릇에 창억떡',
        emoji: '🍡',
        body: '직접 만든 접시에 3색 창억떡을 담아 한 컷 — 클래스 + 떡 만들기 묶음 코스.',
      },
    ],
  },
  {
    id: 'fest-vk-changdeok',
    region: 'seoul',
    city_label: '서울 종로',
    name: '고궁음악회 “100인의 태평지악”',
    emoji: '🎻',
    cover_gradient: 'from-indigo-400 via-violet-500 to-rose-500',
    when: '2026.05.01 ~ 05.03 (저녁 7:30)',
    base_pitch: '창덕궁 인정전 — 100인의 국악 합주 정기 연주회',
    source: 'visitkorea',
    highlight: '궁중문화축전 메인 프로그램 · 사전 예약',
    tieins: [],
  },
)

export function festivalsByRegion(region: Region): LocalFestival[] {
  return LOCAL_FESTIVALS.filter((f) => f.region === region)
}

export function festivalsBySource(source: FestivalSource): LocalFestival[] {
  return LOCAL_FESTIVALS.filter((f) => f.source === source)
}
