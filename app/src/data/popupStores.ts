// 실제 운영/예고 중인 팝업 정보를 시드로 사용 (2026 5월 기준).
// 출처: 팝가 popga.co.kr, 성수동고릴라, 데이포유 등.

export type PopupArea =
  | 'seongsu'
  | 'hongdae'
  | 'yeonnam'
  | 'daejeon'
  | 'daegu'
  | 'busan'

export type PopupCity = 'seoul' | 'daejeon' | 'daegu' | 'busan'

export type PopupCategory = 'character' | 'ip' | 'beauty' | 'food' | 'fashion'
export type PopupStatus = 'opening' | 'open' | 'closing'

export interface PopupStore {
  id: string
  name: string
  brand: string
  area: PopupArea
  city: PopupCity
  area_label: string // "서울 성수동"
  venue: string // "성수 일대 / 더현대 대구 B2" 등
  category: PopupCategory
  emoji: string
  cover_gradient: string
  when: string
  status: PopupStatus
  hot_score: number // 0-100
  is_oprun: boolean
  hashtag: string
  desc: string
  trend_tiein?: { challenge_id: string; note: string } // TrenDo 챌린지와의 연결 (있을 때)
  external_link?: string // 팝가/공식 등
}

export const POPUP_AREA_LABEL: Record<PopupArea, string> = {
  seongsu: '서울 성수',
  hongdae: '서울 홍대',
  yeonnam: '서울 연남',
  daejeon: '대전',
  daegu: '대구',
  busan: '부산',
}

// 도시별 한국 지도 핀 좌표 (CultureMap viewBox와 동일)
export const POPUP_CITY_PIN: Record<PopupCity, { x: number; y: number; label: string }> = {
  seoul: { x: 178, y: 200, label: '서울 권역' },
  daejeon: { x: 215, y: 268, label: '대전' },
  daegu: { x: 280, y: 308, label: '대구' },
  busan: { x: 304, y: 416, label: '부산' },
}

export const POPUP_CATEGORY_LABEL: Record<PopupCategory, string> = {
  character: '캐릭터',
  ip: 'IP·애니',
  beauty: '뷰티',
  food: '푸드',
  fashion: '패션',
}

export const POPUP_STATUS_LABEL: Record<PopupStatus, { label: string; cls: string }> = {
  opening: { label: '오픈 예정', cls: 'bg-amber-500 text-white' },
  open: { label: '진행 중', cls: 'bg-coral-500 text-white' },
  closing: { label: '마감 임박', cls: 'bg-rose-500 text-white' },
}

export const POPUP_STORES: PopupStore[] = [
  // ── 성수 ─────────────────────────────────────────
  {
    id: 'pp-seongsu-metamon',
    name: '메타몽 놀이터',
    brand: '포켓몬코리아',
    area: 'seongsu',
    city: 'seoul',
    area_label: '서울 성수',
    venue: '성수 일대',
    category: 'character',
    emoji: '🟣',
    cover_gradient: 'from-fuchsia-300 via-purple-400 to-indigo-600',
    when: '2026.05.01 ~ 06.21',
    status: 'open',
    hot_score: 96,
    is_oprun: true,
    hashtag: '#메타몽놀이터',
    desc: '포켓몬 IP의 새 캐릭터 팝업. 5월 황금연휴 동안 가장 긴 줄.',
    external_link: 'https://popga.co.kr/',
  },
  {
    id: 'pp-seongsu-tinypings',
    name: '더티니핑 브랜드스토어',
    brand: 'SAMG엔터테인먼트',
    area: 'seongsu',
    city: 'seoul',
    area_label: '서울 성수',
    venue: '성수 더티니핑 브랜드스토어',
    category: 'character',
    emoji: '💖',
    cover_gradient: 'from-pink-300 via-rose-400 to-coral-500',
    when: '연중 (체험형 상시)',
    status: 'open',
    hot_score: 84,
    is_oprun: false,
    hashtag: '#더티니핑',
    desc: '추리 게임 “하츄시그널” 체험 + 방문 인증 시 키링·에코백 굿즈.',
    external_link: 'https://m.seongsudonggorilla.com/article/476',
  },
  {
    id: 'pp-seongsu-lush',
    name: '러쉬 씨어터 팝업',
    brand: 'LUSH',
    area: 'seongsu',
    city: 'seoul',
    area_label: '서울 성수',
    venue: '성수 일대',
    category: 'beauty',
    emoji: '🛁',
    cover_gradient: 'from-emerald-300 via-teal-400 to-sky-500',
    when: '봄 시즌 한정',
    status: 'closing',
    hot_score: 78,
    is_oprun: true,
    hashtag: '#러쉬씨어터',
    desc: '제품 체험형 시어터 — 거품·향·색을 한 번에 즐기는 감각형 팝업.',
    external_link: 'https://popga.co.kr/',
  },
  {
    id: 'pp-seongsu-balloon',
    name: '벌룬프렌즈 팝업',
    brand: '벌룬프렌즈',
    area: 'seongsu',
    city: 'seoul',
    area_label: '서울 성수',
    venue: '성수 일대',
    category: 'character',
    emoji: '🎈',
    cover_gradient: 'from-sky-300 via-cyan-400 to-rose-300',
    when: '시즌 한정',
    status: 'open',
    hot_score: 70,
    is_oprun: false,
    hashtag: '#벌룬프렌즈',
    desc: '풍선 캐릭터 굿즈 + 포토존. 가족 단위 인증샷 명소.',
    external_link: 'https://popga.co.kr/',
  },
  {
    id: 'pp-seongsu-romand',
    name: '롬앤 × 누즈 미니 팝업',
    brand: 'rom&nd × NOOSE',
    area: 'seongsu',
    city: 'seoul',
    area_label: '서울 성수',
    venue: '성수 일대',
    category: 'beauty',
    emoji: '💄',
    cover_gradient: 'from-rose-300 via-coral-400 to-amber-300',
    when: '5월 한정',
    status: 'open',
    hot_score: 73,
    is_oprun: false,
    hashtag: '#롬앤누즈',
    desc: '컬러 코디 미니 팝업 — 한정 컬렉션과 화보 부스.',
    external_link: 'https://popga.co.kr/',
  },

  // ── 홍대 ─────────────────────────────────────────
  {
    id: 'pp-hongdae-clamp',
    name: 'CLAMP 전시',
    brand: 'CLAMP',
    area: 'hongdae',
    city: 'seoul',
    area_label: '서울 홍대',
    venue: 'AK& 홍대 4층 오뮤지엄',
    category: 'ip',
    emoji: '🪶',
    cover_gradient: 'from-violet-300 via-fuchsia-500 to-rose-500',
    when: '2026.04.16 ~ 07.19',
    status: 'open',
    hot_score: 91,
    is_oprun: true,
    hashtag: '#CLAMP전시',
    desc: 'X·카드캡터 사쿠라 등 CLAMP의 대표 IP를 한 곳에 모은 대형 전시.',
    external_link: 'https://popga.co.kr/content/magazine/210',
  },
  {
    id: 'pp-hongdae-chainsaw',
    name: '체인소맨 팝업',
    brand: '체인소맨',
    area: 'hongdae',
    city: 'seoul',
    area_label: '서울 홍대',
    venue: '홍대 일대',
    category: 'ip',
    emoji: '⚙️',
    cover_gradient: 'from-rose-500 via-amber-500 to-stone-700',
    when: '2026.04.17 ~ 05.19',
    status: 'closing',
    hot_score: 88,
    is_oprun: true,
    hashtag: '#체인소맨팝업',
    desc: '인기 애니 IP 팝업 — 한정 굿즈와 시즌 1·2 비주얼 포토존.',
    external_link: 'https://popga.co.kr/content/magazine/210',
  },
  {
    id: 'pp-hongdae-3z',
    name: '3학년Z반 긴파치선생 × 애니메이트 카페',
    brand: '애니메이트 카페',
    area: 'hongdae',
    city: 'seoul',
    area_label: '서울 홍대',
    venue: '애니메이트 카페 홍대',
    category: 'ip',
    emoji: '🎒',
    cover_gradient: 'from-amber-300 via-rose-300 to-indigo-400',
    when: '2026.05.01 ~ 06.03',
    status: 'open',
    hot_score: 74,
    is_oprun: false,
    hashtag: '#3학년Z반',
    desc: '컬래버 카페 — 메뉴 주문 시 캐릭터 코스터/굿즈 증정.',
    external_link: 'https://popga.co.kr/content/magazine/210',
  },

  // ── 연남 ─────────────────────────────────────────
  {
    id: 'pp-yeonnam-orv',
    name: '전지적 독자 시점 [spot] 팝업',
    brand: '전지적 독자 시점',
    area: 'yeonnam',
    city: 'seoul',
    area_label: '서울 연남',
    venue: '서울 마포구 성미산로 151-1, 4층',
    category: 'ip',
    emoji: '📖',
    cover_gradient: 'from-indigo-400 via-violet-500 to-coral-500',
    when: '2026 봄~여름 한정',
    status: 'open',
    hot_score: 93,
    is_oprun: true,
    hashtag: '#전지적독자시점',
    desc: '“김독자·유중혁 성지”라는 별명. 사전 예약 서버 터진 IP 팝업.',
    external_link: 'https://www.thetrippick.com/news/articleView.html?idxno=2655',
  },

  // ── 대구 ─────────────────────────────────────────
  {
    id: 'pp-daegu-uldd',
    name: 'ULDD 팝업스토어',
    brand: 'ULDD',
    area: 'daegu',
    city: 'daegu',
    area_label: '대구',
    venue: '더현대 대구 지하 2층 크리에이티브 그라운드',
    category: 'character',
    emoji: '🐻',
    cover_gradient: 'from-amber-200 via-rose-300 to-coral-400',
    when: '시즌 한정',
    status: 'open',
    hot_score: 76,
    is_oprun: false,
    hashtag: '#ULDD',
    desc: '캐릭터 굿즈 + 한정 일러스트 상품. 아이들 줄세우기 좋은 코스.',
    external_link: 'https://daeguwhere.com/대구-팝업스토어-총정리/',
  },
  {
    id: 'pp-daegu-pantsy',
    name: '빤쮸토끼 팝업',
    brand: '빤쮸토끼',
    area: 'daegu',
    city: 'daegu',
    area_label: '대구',
    venue: '더현대 대구 지하 2층',
    category: 'character',
    emoji: '🐰',
    cover_gradient: 'from-pink-200 via-rose-300 to-amber-200',
    when: '2026.04.24 ~ 05.07',
    status: 'closing',
    hot_score: 81,
    is_oprun: true,
    hashtag: '#빤쮸토끼',
    desc: '신규 일러스트 상품 한정 공개 — 마감 직전 줄이 가장 길어요.',
    external_link: 'https://daeguwhere.com/대구-팝업스토어-총정리/',
  },
  {
    id: 'pp-daegu-namgano',
    name: '담곰이 나가노 마켓',
    brand: '담곰이 × 나가노 마켓',
    area: 'daegu',
    city: 'daegu',
    area_label: '대구',
    venue: '더현대 대구 지하 2층',
    category: 'character',
    emoji: '🍙',
    cover_gradient: 'from-emerald-300 via-amber-300 to-rose-300',
    when: '시즌 한정',
    status: 'open',
    hot_score: 86,
    is_oprun: true,
    hashtag: '#담곰이나가노마켓',
    desc: '서울·부산에서 큰 인기 후 대구 상륙. 일본 스트리트 마켓 분위기.',
    external_link: 'https://daeguwhere.com/대구-팝업스토어-총정리/',
  },
  {
    id: 'pp-daegu-haidilao',
    name: '하이디라오 훠궈 팝업',
    brand: '하이디라오',
    area: 'daegu',
    city: 'daegu',
    area_label: '대구',
    venue: '더현대 대구 지하 1층',
    category: 'food',
    emoji: '🍲',
    cover_gradient: 'from-rose-400 via-coral-500 to-amber-500',
    when: '시즌 한정',
    status: 'open',
    hot_score: 72,
    is_oprun: false,
    hashtag: '#하이디라오팝업',
    desc: '집에서 즐기는 정통 훠궈 — 간편식 라인 + 시식 코너.',
    external_link: 'https://daeguwhere.com/대구-팝업스토어-총정리/',
    trend_tiein: {
      challenge_id: 'ch-eton-mess',
      note: '매콤한 메인 후 디저트로 산뜻한 “이튼 메스” 한 컵을 묶어 추천',
    },
  },

  // ── 부산 ─────────────────────────────────────────
  {
    id: 'pp-busan-namgano',
    name: '담곰이 나가노 마켓 부산점',
    brand: '담곰이 × 나가노 마켓',
    area: 'busan',
    city: 'busan',
    area_label: '부산',
    venue: '신세계 센텀시티 일대',
    category: 'character',
    emoji: '🍙',
    cover_gradient: 'from-amber-300 via-coral-400 to-fuchsia-500',
    when: '시즌 한정',
    status: 'open',
    hot_score: 82,
    is_oprun: true,
    hashtag: '#나가노부산',
    desc: '부산 상륙 후 광안리·해운대 일대까지 줄이 이어진 팝업.',
    external_link: 'https://www.instagram.com/popup.in.busan/',
  },
  {
    id: 'pp-busan-character',
    name: '센텀 캐릭터 페어',
    brand: '신세계 센텀시티',
    area: 'busan',
    city: 'busan',
    area_label: '부산',
    venue: '신세계 센텀시티',
    category: 'character',
    emoji: '🎀',
    cover_gradient: 'from-rose-300 via-pink-400 to-purple-500',
    when: '월간 로테이션',
    status: 'open',
    hot_score: 64,
    is_oprun: false,
    hashtag: '#센텀팝업',
    desc: '월마다 캐릭터 IP가 바뀌는 로테이션 팝업존.',
    external_link: 'https://www.instagram.com/popup.in.busan/',
  },

  // ── 대전 ─────────────────────────────────────────
  {
    id: 'pp-daejeon-shinsegae',
    name: '신세계 대전 캐릭터 팝업',
    brand: '신세계 대전',
    area: 'daejeon',
    city: 'daejeon',
    area_label: '대전',
    venue: '신세계 대전 아트앤사이언스',
    category: 'character',
    emoji: '🛍',
    cover_gradient: 'from-sky-300 via-indigo-400 to-violet-500',
    when: '월간 로테이션',
    status: 'open',
    hot_score: 58,
    is_oprun: false,
    hashtag: '#신세계대전팝업',
    desc: '대전 첫 대형 캐릭터 팝업존 — 가족 단위 방문 코스.',
    external_link: 'https://popga.co.kr/',
  },
]

export function popupsByArea(area: PopupArea | 'all'): PopupStore[] {
  const list = area === 'all' ? POPUP_STORES : POPUP_STORES.filter((p) => p.area === area)
  return [...list].sort((a, b) => b.hot_score - a.hot_score)
}

export function popupsByCity(city: PopupCity): PopupStore[] {
  return POPUP_STORES.filter((p) => p.city === city)
}
