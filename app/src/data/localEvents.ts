import type { LocalEvent } from '../types'

export const LOCAL_EVENTS: LocalEvent[] = [
  // 서울
  {
    id: 'ev-seoul-insadong-tea',
    region: 'seoul',
    type: 'workshop',
    name: '인사동 전통 한과·차 공방',
    when: '연중 · 주말 오후 클래스',
    body: '약과·다식·전통차를 직접 만들어 보는 1시간 클래스. 두쫀쿠·버터떡의 전통 뿌리를 직접 손으로 경험할 수 있어요.',
    matches: ['ch-dujjonku', 'ch-butter-rice'],
  },
  {
    id: 'ev-seoul-namdaemun-strawberry',
    region: 'seoul',
    type: 'market',
    name: '남대문 시장 딸기 코너',
    when: '12월~5월 제철',
    body: '논산·담양 산지 딸기를 그날 들어온 가격으로 구매. 쿠크다스 딸기샌드·이튼 메스 재료 한 번에.',
    matches: ['ch-cookie-strawberry', 'ch-eton-mess'],
  },
  // 인천
  {
    id: 'ev-incheon-ganghwa-mug',
    region: 'incheon',
    type: 'festival',
    name: '강화 약쑥 봄 페스티벌',
    when: '4~5월',
    body: '강화 약쑥을 활용한 한과·떡 시연 + 농가 체험. 두쫀쿠 쑥 변형의 산지 학습 기회.',
    matches: ['ch-dujjonku'],
  },
  // 강릉
  {
    id: 'ev-gangneung-coffee',
    region: 'gangneung',
    type: 'festival',
    name: '강릉 커피축제',
    when: '10월',
    body: '안목해변 커피거리 일대에서 열리는 전국 단위 축제. 커피 두쫀쿠/버터떡 변형의 본거지.',
    matches: ['ch-dujjonku', 'ch-butter-rice'],
  },
  {
    id: 'ev-gangneung-berry',
    region: 'gangneung',
    type: 'market',
    name: '주문진 산지 베리 마켓',
    when: '6~9월',
    body: '강릉 인근 산지 블루베리·블랙베리·라즈베리 직거래. 강릉 베리 메스의 핵심 재료.',
    matches: ['ch-eton-mess'],
  },
  // 대구
  {
    id: 'ev-daegu-apple',
    region: 'daegu',
    type: 'festival',
    name: '청송 사과축제',
    when: '11월',
    body: '청송 산지 사과 시식·즙·말린 사과 칩 코너. 사과 초코블럭/버터떡 사과 변형 가능.',
    matches: ['ch-pringles-choco', 'ch-butter-rice'],
  },
  {
    id: 'ev-daegu-baseball',
    region: 'daegu',
    type: 'workshop',
    name: '대구 라이온즈파크 응원 워크숍',
    when: '시즌 중 · 홈경기 직전',
    body: '응원봉/풍선 만들기 + 응원 표정 코칭. 야구 표정 챌린지 단체 인증샷에 최적.',
    matches: ['ch-baseball-face'],
  },
  // 전주
  {
    id: 'ev-jeonju-hanok',
    region: 'jeonju',
    type: 'workshop',
    name: '한옥마을 흑임자 떡 공방',
    when: '연중',
    body: '풍남문 시장 흑임자를 직접 갈아 떡과 페이스트를 만드는 1.5시간 클래스. 흑임자 두쫀쿠·버터떡 변형 직결.',
    matches: ['ch-dujjonku', 'ch-butter-rice', 'ch-cookie-strawberry'],
  },
  {
    id: 'ev-jeonju-pungnam',
    region: 'jeonju',
    type: 'market',
    name: '풍남문 시장 흑임자 좌판',
    when: '연중',
    body: '국산 흑임자를 그 자리에서 갈아주는 좌판. 봄동·콩나물도 함께 구매 가능.',
    matches: ['ch-cookie-strawberry', 'ch-bomdong'],
  },
  // 광주
  {
    id: 'ev-gwangju-fig',
    region: 'gwangju',
    type: 'festival',
    name: '담양 무화과 마켓',
    when: '8~9월',
    body: '담양 무화과 농장 직거래 + 잼 클래스. 무화과 메스의 시즌 한정 재료.',
    matches: ['ch-eton-mess'],
  },
  {
    id: 'ev-gwangju-yangrim',
    region: 'gwangju',
    type: 'exhibit',
    name: '양림동 펭귄마을 골목 전시',
    when: '연중',
    body: '근대 골목과 옛 동네 사진 전시. 야구 표정 챌린지 등 “표정·인증샷” 카테고리 배경 명소.',
    matches: ['ch-baseball-face'],
  },
  // 부산
  {
    id: 'ev-busan-yuja',
    region: 'busan',
    type: 'festival',
    name: '기장 유자 축제',
    when: '11월',
    body: '기장 유자청·유자청차 시음 + 농장 체험. 유자 두쫀쿠/메스의 산지 결합.',
    matches: ['ch-dujjonku', 'ch-eton-mess'],
  },
  {
    id: 'ev-busan-sajik',
    region: 'busan',
    type: 'workshop',
    name: '사직야구장 응원 표정 워크숍',
    when: '시즌 중',
    body: '주황 봉지 응원 도구 사용법 + 단체 표정 3컷 코치. 가족 단체 표정 인증에 적합.',
    matches: ['ch-baseball-face'],
  },
  // 제주
  {
    id: 'ev-jeju-citrus',
    region: 'jeju',
    type: 'workshop',
    name: '제주 감귤 농장 체험',
    when: '11~3월',
    body: '한라봉·천혜향 직접 따고 잼 만들기. 한라봉 두쫀쿠/메스/버터떡 핵심 산지.',
    matches: ['ch-dujjonku', 'ch-eton-mess', 'ch-butter-rice'],
  },
  {
    id: 'ev-jeju-osulloc',
    region: 'jeju',
    type: 'exhibit',
    name: '오설록 차밭',
    when: '연중',
    body: '말차·녹차 체험 코스. 말차 변형 디저트 도전에 영감을 주는 산지 전시.',
    matches: ['ch-eton-mess', 'ch-cookie-strawberry'],
  },
]

export function eventsForRegion(region: string): LocalEvent[] {
  return LOCAL_EVENTS.filter((e) => e.region === region)
}

export function eventsForChallenge(challengeId: string): LocalEvent[] {
  return LOCAL_EVENTS.filter((e) => e.matches.includes(challengeId))
}

export const EVENT_TYPE_LABEL: Record<string, string> = {
  festival: '축제',
  workshop: '공방',
  market: '시장',
  exhibit: '전시',
}

export const EVENT_TYPE_EMOJI: Record<string, string> = {
  festival: '🎪',
  workshop: '🪡',
  market: '🛒',
  exhibit: '🖼',
}
