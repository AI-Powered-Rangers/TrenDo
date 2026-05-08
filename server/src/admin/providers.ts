import type { LocalAsset, ProvenanceLabel, Trend } from './types.js'
import { seedLocalAssets, seedTrends } from './seed.js'
import { XMLParser } from 'fast-xml-parser'

export interface CollectionResult<T> {
  items: T[]
  provenance_label: ProvenanceLabel
  provider: string
  note: string
}

export interface TrendProvider {
  name: string
  collect(): Promise<CollectionResult<Trend>>
}

export interface LocalAssetProvider {
  name: string
  collect(): Promise<CollectionResult<LocalAsset>>
}

const now = () => new Date().toISOString()
const REQUEST_TIMEOUT_MS = Number(process.env.ADMIN_API_TIMEOUT_MS ?? 12_000)

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS)
}

function normalizeAssetType(contentTypeId?: string): LocalAsset['asset_type'] {
  const map: Record<string, LocalAsset['asset_type']> = {
    '12': 'tourism',
    '14': 'culture_facility',
    '15': 'festival',
    '28': 'tourism',
    '38': 'market',
    '39': 'tourism',
  }
  return contentTypeId ? map[contentTypeId] ?? 'tourism' : 'culture_facility'
}

function extractTourItems(payload: any): any[] {
  const items = payload?.response?.body?.items?.item
  if (!items) return []
  return Array.isArray(items) ? items : [items]
}

export class SeedTrendProvider implements TrendProvider {
  name = 'shortform_culture_seed_provider'

  async collect(): Promise<CollectionResult<Trend>> {
    return {
      items: [...seedTrends, ...shortformCultureSeedTrends()].map((trend) => ({ ...trend, collected_at: now(), provenance_label: 'demo_seed' })),
      provenance_label: 'demo_seed',
      provider: this.name,
      note: 'YOUTUBE_API_KEY/INSTAGRAM trend source missing; using category-based shortform culture demo_seed trends.',
    }
  }
}

function shortformCultureSeedTrends(): Trend[] {
  const collected_at = now()
  return [
    {
      id: 'trend-seed-lowcost-cafe-tour',
      title: '동네 카페 영수증 투어',
      description: '카페 2~3곳을 돌며 시그니처 음료, 영수증, 동네 산책 루트를 기록하는 숏폼형 로컬 투어 유행. 소상공인 연결과 저비용 참여가 쉽다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/activity/local-cafe-receipt-tour',
      hashtags: ['#동네카페투어', '#영수증투어', '#로컬산책', '#만원챌린지'],
      category: 'activity',
      collected_at,
      raw_payload: { platform: ['instagram', 'youtube_shorts'], category: 'activity', signals: ['place_visit', 'receipt_photo', 'local_walk'], views_24h: 420000, saves: 24800, comments: 1800, frequency: 76 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/activity/local-cafe-receipt-tour'],
    },
    {
      id: 'trend-seed-zero-waste-market',
      title: '장바구니 리필 장보기',
      description: '전통시장이나 제로웨이스트 상점에서 개인 용기와 장바구니로 장을 보고 인증하는 생활형 숏폼 유행. 전통시장, 지역 먹거리, 환경 실천을 연결한다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/activity/refill-market',
      hashtags: ['#리필장보기', '#전통시장', '#제로웨이스트', '#장바구니챌린지'],
      category: 'activity',
      collected_at,
      raw_payload: { platform: ['instagram', 'youtube_shorts'], category: 'activity', signals: ['checklist', 'market_visit', 'proof_upload'], views_24h: 310000, saves: 19400, comments: 1200, frequency: 71 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/activity/refill-market'],
    },
    {
      id: 'trend-seed-one-day-craft',
      title: '원데이 공방 결과물 공개',
      description: '도자기, 향수, 가죽, 한지 등 원데이클래스 결과물을 전후 비교로 보여주는 숏폼 소비문화. 지역 공방과 직접 연결하기 좋다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/activity/oneday-craft',
      hashtags: ['#원데이클래스', '#공방체험', '#전후비교', '#로컬공방'],
      category: 'activity',
      collected_at,
      raw_payload: { platform: ['instagram_reels', 'youtube_shorts'], category: 'activity', signals: ['before_after', 'workshop', 'craft'], views_24h: 530000, saves: 37200, comments: 2900, frequency: 82 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/activity/oneday-craft'],
    },
    {
      id: 'trend-seed-night-market-trip',
      title: '야시장 먹거리 3컷 여행',
      description: '야시장이나 축제에서 먹거리 세 가지를 짧은 컷으로 기록하는 여행형 숏폼 유행. 지역 축제와 전통시장 방문 전환에 적합하다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/travel/night-market-three-cuts',
      hashtags: ['#야시장투어', '#먹거리3컷', '#지역축제', '#전통시장'],
      category: 'travel',
      collected_at,
      raw_payload: { platform: ['youtube_shorts', 'instagram_reels'], category: 'travel', signals: ['food_clip', 'festival', 'market'], views_24h: 610000, saves: 43800, comments: 3400, frequency: 86 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/travel/night-market-three-cuts'],
    },
    {
      id: 'trend-seed-stamp-walk',
      title: '골목 스탬프 산책',
      description: '한옥거리, 벽화마을, 시장 골목의 작은 포인트를 체크리스트처럼 찍으며 걷는 여행 유행. 지도 기반 지역 문화 동선으로 전환된다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/travel/alley-stamp-walk',
      hashtags: ['#골목산책', '#스탬프투어', '#한옥거리', '#지도챌린지'],
      category: 'travel',
      collected_at,
      raw_payload: { platform: ['instagram_reels', 'blog_shortform'], category: 'travel', signals: ['map_open', 'place_click', 'checklist'], views_24h: 455000, saves: 31800, comments: 2100, frequency: 79 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/travel/alley-stamp-walk'],
    },
    {
      id: 'trend-seed-seasonal-fruit-dessert',
      title: '제철 과일 컵 디저트',
      description: '딸기, 한라봉, 참외 등 제철 과일을 컵 디저트로 쌓아 인증하는 음식 숏폼 유행. 지역 특산품과 가족형 레시피로 확장 가능하다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/food/seasonal-fruit-cup',
      hashtags: ['#제철과일', '#컵디저트', '#한라봉', '#가족레시피'],
      category: 'food',
      collected_at,
      raw_payload: { platform: ['youtube_shorts', 'instagram_reels'], category: 'food', signals: ['recipe', 'local_specialty', 'family'], views_24h: 790000, saves: 61200, comments: 5200, frequency: 91 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/food/seasonal-fruit-cup'],
    },
    {
      id: 'trend-seed-traditional-snack-remix',
      title: '약과·떡 디저트 리믹스',
      description: '약과, 찹쌀떡, 한과를 아이스크림이나 크림과 섞어 새 디저트로 만드는 음식 숏폼 유행. 전통 간식을 오늘의 언어로 재생산한다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/food/traditional-snack-remix',
      hashtags: ['#약과리믹스', '#떡디저트', '#한과', '#전통간식'],
      category: 'food',
      collected_at,
      raw_payload: { platform: ['youtube_shorts', 'instagram_reels'], category: 'food', signals: ['recipe', 'heritage_remix', 'proof_photo'], views_24h: 880000, saves: 73400, comments: 6800, frequency: 94 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/food/traditional-snack-remix'],
    },
    {
      id: 'trend-seed-three-second-transition',
      title: '3초 전환 릴스',
      description: '같은 장소에서 손짓이나 점프로 장면을 전환하는 숏츠 편집 문화. 축제장, 전통시장, 공방 결과물 before/after 인증에 적용하기 좋다.',
      source: 'shortform_culture_seed',
      source_url: 'demo://shortform-culture/shorts/three-second-transition',
      hashtags: ['#3초전환', '#릴스전환', '#숏츠편집', '#비포애프터'],
      category: 'shorts_culture',
      collected_at,
      raw_payload: { platform: ['youtube_shorts', 'instagram_reels'], category: 'shorts_culture', signals: ['transition', 'before_after', 'proof_video'], views_24h: 670000, saves: 38900, comments: 3000, frequency: 88 },
      provenance_label: 'demo_seed',
      evidence_refs: ['demo://signals/shortform/shorts/three-second-transition'],
    },
    ...sampleRecentCultureTrends(collected_at),
  ]
}

function sampleRecentCultureTrends(collected_at: string): Trend[] {
  const rows = [
    ['food', '소금빵', '겉은 바삭하고 속은 버터 풍미가 있는 베이커리 유행. 동네 빵집 투어, 전통시장 베이커리 지도, 지역 버터/소금 특산품 연결이 가능하다.', ['#소금빵', '#베이커리투어', '#동네빵집']],
    ['food', '봄동 디저트', '제철 봄동을 색다른 디저트나 음료로 재해석하는 계절형 음식 유행. 제철 장보기와 전통시장 방문 챌린지로 전환하기 좋다.', ['#봄동디저트', '#제철식재료', '#전통시장']],
    ['food', '우베치즈케이크', '보라색 우베와 치즈케이크 비주얼이 결합된 SNS 디저트 유행. 지역 카페, 베이커리, 사진 인증형 챌린지와 맞다.', ['#우베치즈케이크', '#디저트릴스', '#카페투어']],
    ['food', '창억떡', '떡 브랜드와 전통 간식이 젊은 세대 사이에서 재발견되는 유행. 떡 디저트 리믹스와 가족 간식 기록으로 연결 가능하다.', ['#창억떡', '#떡디저트', '#전통간식']],
    ['food', '불닭미역탕면', '매운 라면과 미역탕 콘셉트가 결합된 편의점/SNS 바이럴 음식. 저비용 리뷰와 세대별 매운맛 설명 챌린지로 전환할 수 있다.', ['#불닭미역탕면', '#편의점신상', '#매운맛챌린지']],
    ['food', '젤리 얼먹', '젤리를 얼려 식감 변화를 즐기는 간단한 편의점 음식 유행. 비용이 낮고 가족/친구 비교 인증이 쉽다.', ['#젤리얼먹', '#편의점간식', '#식감챌린지']],
    ['food', '연어 젤리', '연어 모양 또는 해산물 비주얼 젤리처럼 낯선 모양과 식감을 리뷰하는 바이럴 음식 유행. 호기심은 높지만 과장/오인 표현 검수가 필요하다.', ['#연어젤리', '#바이럴간식', '#리뷰쇼츠']],
    ['food', '불닭 냉면', '불닭 소스와 차가운 면 조합으로 매운맛을 재해석하는 여름형 음식 유행. 지역 냉면/국수 문화와 연결할 수 있다.', ['#불닭냉면', '#여름면요리', '#매운맛']],
    ['food', '알쭈꾸미', '알과 쭈꾸미 식감/비주얼을 강조한 매운 음식 바이럴 유행. 지역 수산시장, 야시장 먹거리와 연결 가능하다.', ['#알쭈꾸미', '#매운음식', '#야시장']],
    ['food', '초코 프링글스', '감자칩 통과 초콜릿 비주얼을 활용한 실험형 간식 유행. 안전한 소형 디저트 실험 챌린지로 검수 후 전환한다.', ['#초코프링글스', '#초코블럭', '#실험디저트']],
    ['food', '칠리스 치즈스틱', '치즈가 늘어나는 비주얼 중심의 SNS 음식 유행. 지역 분식집/푸드트럭 탐방과 연결하기 좋다.', ['#칠리스치즈스틱', '#치즈늘어남', '#분식투어']],
    ['challenge', '윤정아왜요쌤', '특정 말투나 상황극을 따라 하는 밈형 챌린지. 세대별 오해 방지 설명과 조롱/괴롭힘 검수가 필요하다.', ['#윤정아왜요쌤', '#상황극밈', '#말투챌린지']],
    ['challenge', '셋로그', '하루의 행동과 감정을 짧게 기록하는 참여형 루틴 유행. 문화 잔존율, 가족 기록, 지역 방문 기록으로 확장 가능하다.', ['#셋로그', '#기록챌린지', '#루틴']],
    ['challenge', '말랑이', '말랑한 장난감이나 촉감 콘텐츠를 공유하는 힐링형 밈 유행. 세대별 설명과 공방/소품샵 연결에 적합하다.', ['#말랑이', '#촉감콘텐츠', '#힐링쇼츠']],
    ['challenge', '왁뿌볼', '짧고 반복적인 소리/동작 중심의 밈형 숏폼 유행. 원본 맥락 설명과 안전한 참여 방식으로 변환해야 한다.', ['#왁뿌볼', '#밈챌린지', '#숏폼밈']],
    ['challenge', '경찰과 도둑 챌린지', '역할놀이와 추격 구도를 짧게 연출하는 챌린지. 공공장소 안전, 무단촬영, 미성년자 노출 검수가 필요하다.', ['#경찰과도둑챌린지', '#역할놀이', '#안전검수']],
    ['challenge', '랜덤 비빔밥', '무작위 재료를 조합해 비빔밥을 만드는 음식 참여형 챌린지. 지역 특산품과 전통 식문화 리믹스로 전환하기 좋다.', ['#랜덤비빔밥', '#비빔문화', '#전통음식']],
    ['activity', '러닝크루', '동네나 강변을 함께 달리는 오프라인 참여형 유행. 지역 코스, 안전 가이드, 세대별 난이도 조절이 핵심이다.', ['#러닝크루', '#동네러닝', '#오프라인참여']],
    ['activity', '버터런', '버터색 의상/소품 또는 달리기 인증을 결합한 러닝 밈. 지역 코스와 저강도 참여형 챌린지로 바꾸기 쉽다.', ['#버터런', '#러닝챌린지', '#코스인증']],
    ['activity', '야구장 직관 AI 영상', '야구장 직관 장면을 AI 스타일 영상이나 직관샷으로 편집하는 체험형 유행. 초상권과 좌석 정보 노출 검수가 필요하다.', ['#AI직관샷', '#야구장직관', '#응원문화']],
    ['activity', '상하이 왕홍 체험', '중국식 왕홍 거리 촬영/맛집/쇼핑 동선을 체험하는 여행형 바이럴 콘텐츠. 국내 로컬 거리 체험으로 변환 가능하다.', ['#상하이왕홍체험', '#여행릴스', '#거리체험']],
    ['media', '흑백요리사', '요리 서바이벌 콘텐츠를 계기로 재료, 셰프, 플레이팅을 따라 해보는 미디어 기반 음식 유행. 지역 식재료 챌린지와 연결된다.', ['#흑백요리사', '#요리예능', '#플레이팅']],
    ['media', '환승연애', '관계 서사와 감정 대화가 밈/리액션 콘텐츠로 재생산되는 OTT 유행. 세대별 설명과 안전한 감정 기록 콘텐츠로 전환할 수 있다.', ['#환승연애', '#OTT유행', '#리액션']],
    ['media', '왕과 사는 남자', '드라마/콘텐츠 속 세계관과 대사를 따라 말하는 미디어 유행. 전통 복식·궁궐 문화 설명 카드와 연결 가능하다.', ['#왕과사는남자', '#드라마밈', '#궁궐문화']],
    ['media', '살목지', '짧은 제목/대사 중심으로 회자되는 영상 콘텐츠 유행. 원본 맥락 카드와 오해 가능성 검수가 필요하다.', ['#살목지', '#영상콘텐츠', '#밈맥락']],
    ['media', '기리고', '짧은 음절이나 대사 반복으로 확산되는 미디어 밈. 세대별 번역과 따라 하기 난이도 조절이 필요하다.', ['#기리고', '#대사밈', '#숏폼소비']],
  ] as const

  return rows.map(([category, title, description, hashtags], index) => ({
    id: `trend-sample-${Buffer.from(`${category}|${title}`).toString('base64url').slice(0, 16)}`,
    title,
    description,
    source: 'recent_culture_sample_seed',
    source_url: `demo://recent-culture-sample/${category}/${Buffer.from(title).toString('base64url').slice(0, 14)}`,
    hashtags: [...hashtags],
    category,
    collected_at,
    raw_payload: {
      platform: category === 'media' ? ['ott', 'youtube_shorts', 'community'] : ['instagram_reels', 'youtube_shorts', 'community'],
      category,
      sample_source: 'user_provided_recent_sns_shorts_reels_community_keywords',
      views_24h: 220000 + index * 23000,
      saves: 9000 + index * 1300,
      comments: 700 + index * 95,
      frequency: Math.min(96, 60 + index),
    },
    provenance_label: 'demo_seed',
    evidence_refs: ['user-provided-recent-trend-sample', `demo://recent-culture-sample/${category}`],
  }))
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseTraffic(value: unknown): number {
  const text = String(value ?? '').toLowerCase().replace(/,/g, '').trim()
  const match = text.match(/([\d.]+)\s*([km])?\+?/)
  if (!match) return 0
  const base = Number(match[1])
  const multiplier = match[2] === 'm' ? 1_000_000 : match[2] === 'k' ? 1_000 : 1
  return Math.round(base * multiplier)
}

export class RssTrendProvider implements TrendProvider {
  name = 'rss_trend_provider'

  constructor(private readonly urls = (process.env.TREND_RSS_URLS ?? '').split(',').map((url) => url.trim()).filter(Boolean)) {}

  async collect(): Promise<CollectionResult<Trend>> {
    if (!this.urls.length) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'TREND_RSS_URLS missing; skipped RSS trend provider.',
      }
    }

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true })
    const items: Trend[] = []
    for (const sourceUrl of this.urls) {
      const response = await fetch(sourceUrl, { signal: timeoutSignal() })
      if (!response.ok) throw new Error(`RSS trend provider failed ${sourceUrl}: ${response.status}`)
      const xml = await response.text()
      const parsed = parser.parse(xml)
      const rssItems = asArray(parsed?.rss?.channel?.item ?? parsed?.feed?.entry)
      for (const item of rssItems.slice(0, 40)) {
        const title = stripHtml(String(item.title?.['#text'] ?? item.title ?? 'Untitled trend'))
        const link = String(item.link?.['@_href'] ?? item.link ?? item.guid ?? sourceUrl)
        const traffic = parseTraffic(item.approx_traffic)
        const newsItems = asArray(item.news_item).slice(0, 3)
        const newsSummary = newsItems
          .map((news: any) => stripHtml(String(news.news_item_title ?? news.title ?? news.news_item_source ?? '')))
          .filter(Boolean)
          .join(' / ')
        const description = stripHtml(String(item.description || item.summary || item.content || newsSummary || title))
        const hashtags = Array.from(new Set((`${title} ${description}`.match(/#[\p{L}\p{N}_-]+/gu) ?? []).slice(0, 8)))
        items.push({
          id: `trend-rss-${Buffer.from(`${title}|${link}`).toString('base64url').slice(0, 16)}`,
          title,
          description: description.slice(0, 600),
          source: this.name,
          source_url: link,
          hashtags: hashtags.length ? hashtags : ['#rss_trend'],
          category: /food|맛|쿠키|먹|recipe|cook/i.test(`${title} ${description}`) ? 'food' : /photo|사진|샷/i.test(`${title} ${description}`) ? 'photo' : 'culture',
          collected_at: new Date().toISOString(),
          raw_payload: {
            sourceUrl,
            published: item.pubDate ?? item.published,
            approx_traffic: item.approx_traffic,
            views_24h: traffic,
            frequency: Math.min(100, Math.max(45, Math.round(traffic / 50))),
            news_items: newsItems,
            picture: item.picture,
            picture_source: item.picture_source,
          },
          provenance_label: 'real_api',
          evidence_refs: [sourceUrl, link, ...newsItems.map((news: any) => news.news_item_url).filter(Boolean).slice(0, 3)],
        })
      }
    }
    return {
      items,
      provenance_label: items.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: items.length ? `Collected ${items.length} RSS trend items.` : 'RSS feeds returned no usable items.',
    }
  }
}

const cultureTrendCategories = [
  {
    category: 'food',
    queries: ['요즘 유행 음식 쇼츠', '편의점 신상 먹방 쇼츠', '디저트 레시피 쇼츠', '전통 간식 디저트 릴스'],
    hashtags: ['#음식유행', '#먹방쇼츠', '#디저트', '#레시피'],
  },
  {
    category: 'travel',
    queries: ['국내 여행 쇼츠 핫플', '서울 부산 제주 여행 릴스', '전통시장 여행 쇼츠', '지역 축제 브이로그 쇼츠'],
    hashtags: ['#국내여행', '#핫플', '#지역축제', '#전통시장'],
  },
  {
    category: 'activity',
    queries: ['원데이클래스 쇼츠', '공방 체험 릴스', '데이트 코스 쇼츠', '주말 액티비티 브이로그'],
    hashtags: ['#액티비티', '#원데이클래스', '#공방체험', '#주말챌린지'],
  },
  {
    category: 'shorts_culture',
    queries: ['요즘 쇼츠 챌린지', '릴스 전환 챌린지', '사진 포즈 챌린지 쇼츠', '가족 챌린지 쇼츠'],
    hashtags: ['#쇼츠챌린지', '#릴스', '#전환챌린지', '#포즈챌린지'],
  },
  {
    category: 'challenge',
    queries: ['SNS 밈 챌린지 쇼츠', '요즘 참여형 챌린지', '러닝크루 쇼츠', '오프라인 챌린지 릴스'],
    hashtags: ['#밈챌린지', '#참여형유행', '#오프라인챌린지', '#러닝크루'],
  },
  {
    category: 'media',
    queries: ['요즘 OTT 예능 밈 쇼츠', '드라마 대사 밈 릴스', '예능 리액션 쇼츠', '요리 예능 챌린지'],
    hashtags: ['#OTT유행', '#예능밈', '#드라마밈', '#리액션쇼츠'],
  },
]

function isCultureTrendSignal(text: string): boolean {
  return /쇼츠|릴스|챌린지|유행|요즘|핫플|먹방|디저트|레시피|여행|축제|전통시장|공방|원데이|러닝|밈|OTT|예능|드라마|브이로그|체험|투어|신상|카페|로컬/.test(text)
}

type NaverKeywordGroup = {
  category: string
  title: string
  keywords: string[]
  hashtags: string[]
  description: string
}

const naverDataLabKeywordGroups: NaverKeywordGroup[] = [
  {
    category: 'food',
    title: '소금빵',
    keywords: ['소금빵', '소금빵 맛집', '소금빵 카페'],
    hashtags: ['#소금빵', '#베이커리투어', '#동네빵집'],
    description: 'SNS와 검색 관심도가 함께 확인되는 베이커리 유행. 지역 빵집, 시장 베이커리, 로컬 카페 투어로 전환하기 좋다.',
  },
  {
    category: 'food',
    title: '두바이쫀득쿠키',
    keywords: ['두바이쫀득쿠키', '두쫀쿠', '두바이 쿠키'],
    hashtags: ['#두쫀쿠', '#디저트릴스', '#쿠키챌린지'],
    description: '쫀득한 식감과 비주얼이 강한 디저트 유행. 지역 디저트샵, 전통 간식 리믹스, 소량 제작 챌린지로 바꾸기 좋다.',
  },
  {
    category: 'food',
    title: '약과·떡 디저트 리믹스',
    keywords: ['약과 디저트', '떡 디저트', '전통 디저트 카페'],
    hashtags: ['#약과리믹스', '#떡디저트', '#전통간식'],
    description: '전통 간식을 오늘의 디저트 언어로 재해석하는 음식 유행. 전통시장, 떡집, 가족형 레시피와 논리적으로 연결된다.',
  },
  {
    category: 'food',
    title: '편의점 바이럴 음식',
    keywords: ['편의점 신상', '불닭 냉면', '젤리 얼먹'],
    hashtags: ['#편의점신상', '#바이럴음식', '#저비용챌린지'],
    description: '저비용으로 쉽게 따라 하는 SNS 음식 리뷰 유행. 과장 표현 검수 후 세대별 맛 비교와 동네 상권 탐방으로 전환할 수 있다.',
  },
  {
    category: 'activity',
    title: '러닝크루',
    keywords: ['러닝크루', '동네 러닝', '러닝 챌린지'],
    hashtags: ['#러닝크루', '#동네러닝', '#오프라인참여'],
    description: '숏폼 인증과 오프라인 모임이 함께 커지는 참여형 유행. 지역 산책로, 축제 코스, 안전 가이드와 연결하기 적합하다.',
  },
  {
    category: 'activity',
    title: '원데이 공방 체험',
    keywords: ['원데이클래스', '공방 체험', '데이트 공방'],
    hashtags: ['#원데이클래스', '#공방체험', '#로컬공방'],
    description: '결과물 전후 비교가 쉬운 오프라인 체험 유행. 도자기, 한지, 자개, 목공 등 지역 공방과 직접 매칭된다.',
  },
  {
    category: 'travel',
    title: '전통시장 먹거리 투어',
    keywords: ['전통시장 먹거리', '시장 투어', '야시장 먹거리'],
    hashtags: ['#전통시장', '#먹거리투어', '#야시장'],
    description: '지역 음식과 동선이 함께 소비되는 여행형 유행. 특산품, 축제, 소상공인 연결에 가장 적합한 트렌드다.',
  },
  {
    category: 'travel',
    title: '한옥·골목 포토 챌린지',
    keywords: ['한옥 포토존', '골목 산책', '사진 포즈 챌린지'],
    hashtags: ['#한옥거리', '#골목산책', '#포토챌린지'],
    description: '사진 인증과 지역 공간 방문이 결합된 포토형 유행. 초상권 안내와 지역 이미지 왜곡 검수가 필요하다.',
  },
  {
    category: 'challenge',
    title: '랜덤 비빔밥',
    keywords: ['랜덤 비빔밥', '비빔밥 챌린지', '랜덤 재료 요리'],
    hashtags: ['#랜덤비빔밥', '#비빔문화', '#전통음식'],
    description: '무작위 재료를 섞는 재미를 전통 식문화와 연결할 수 있는 참여형 음식 챌린지. 지역 특산품 매칭에 강하다.',
  },
  {
    category: 'shorts_culture',
    title: '3초 전환 릴스',
    keywords: ['전환 릴스', '쇼츠 전환', '비포애프터 챌린지'],
    hashtags: ['#전환릴스', '#숏츠편집', '#비포애프터'],
    description: '장소나 결과물의 변화를 짧게 보여주는 편집 문화. 축제장, 공방 결과물, 시장 동선 인증에 활용할 수 있다.',
  },
  {
    category: 'media',
    title: '요리 예능 따라하기',
    keywords: ['흑백요리사', '요리 예능', '플레이팅 챌린지'],
    hashtags: ['#흑백요리사', '#요리예능', '#플레이팅'],
    description: '미디어 콘텐츠를 계기로 재료와 플레이팅을 직접 따라 해보는 유행. 지역 식재료와 시장 장보기로 전환 가능하다.',
  },
  {
    category: 'media',
    title: '드라마 대사 밈',
    keywords: ['드라마 대사 밈', 'OTT 밈', '요즘 밈'],
    hashtags: ['#OTT유행', '#대사밈', '#세대번역'],
    description: '대사와 상황극이 빠르게 소비되는 미디어 밈. 조롱·따라하기 위험을 검수하고 세대별 맥락 카드로 번역해야 한다.',
  },
]

function formatNaverDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function scoreNaverDataLabSeries(data: any[]): { latestRatio: number; avgRatio: number; peakRatio: number; growth: number; frequency: number } {
  const ratios = data.map((item) => Number(item?.ratio ?? 0)).filter((value) => Number.isFinite(value))
  if (!ratios.length) return { latestRatio: 0, avgRatio: 0, peakRatio: 0, growth: 0, frequency: 45 }
  const latestRatio = ratios.at(-1) ?? 0
  const avgRatio = ratios.reduce((sum, value) => sum + value, 0) / ratios.length
  const recentBase = ratios.slice(Math.max(0, ratios.length - 8), Math.max(0, ratios.length - 1))
  const recentAvg = recentBase.length ? recentBase.reduce((sum, value) => sum + value, 0) / recentBase.length : avgRatio
  const peakRatio = Math.max(...ratios)
  const growth = latestRatio - recentAvg
  const frequency = Math.round(clampNumber(45 + latestRatio * 0.42 + Math.max(0, growth) * 0.28 + peakRatio * 0.12, 45, 100))
  return { latestRatio, avgRatio, peakRatio, growth, frequency }
}

export class NaverDataLabTrendProvider implements TrendProvider {
  name = 'naver_datalab_trend_provider'

  constructor(
    private readonly clientId = process.env.NAVER_CLIENT_ID,
    private readonly clientSecret = process.env.NAVER_CLIENT_SECRET,
  ) {}

  async collect(): Promise<CollectionResult<Trend>> {
    if (!this.clientId || !this.clientSecret) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET missing; skipped Naver DataLab search trend provider.',
      }
    }

    const end = new Date()
    const start = new Date(Date.now() - 29 * 24 * 3600_000)
    const collected: Trend[] = []

    for (const groupChunk of chunkItems(naverDataLabKeywordGroups, 5)) {
      const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
        },
        body: JSON.stringify({
          startDate: formatNaverDate(start),
          endDate: formatNaverDate(end),
          timeUnit: 'date',
          keywordGroups: groupChunk.map((group) => ({ groupName: group.title, keywords: group.keywords })),
        }),
        signal: timeoutSignal(),
      })
      if (!response.ok) throw new Error(`Naver DataLab trend provider failed: ${response.status} ${await response.text()}`)
      const payload = await response.json() as any
      for (const result of asArray<any>(payload.results)) {
        const group = groupChunk.find((item) => item.title === result?.title)
        if (!group) continue
        const score = scoreNaverDataLabSeries(asArray<any>(result.data))
        if (score.peakRatio < 8 && score.latestRatio < 5) continue
        collected.push({
          id: `trend-naver-${Buffer.from(`${group.category}|${group.title}`).toString('base64url').slice(0, 18)}`,
          title: group.title,
          description: group.description,
          source: this.name,
          source_url: 'https://datalab.naver.com/keyword/trendSearch.naver',
          hashtags: group.hashtags,
          category: group.category,
          collected_at: now(),
          raw_payload: {
            platform: 'naver_search',
            category: group.category,
            keyword_group: group.keywords,
            latest_ratio: Number(score.latestRatio.toFixed(2)),
            avg_ratio: Number(score.avgRatio.toFixed(2)),
            peak_ratio: Number(score.peakRatio.toFixed(2)),
            growth_ratio: Number(score.growth.toFixed(2)),
            frequency: score.frequency,
            views_24h: Math.round(80_000 + score.latestRatio * 9_000 + Math.max(0, score.growth) * 12_000),
            saves: Math.round(4_500 + score.latestRatio * 420),
            comments: Math.round(380 + score.latestRatio * 28),
            source_quality: 'naver_datalab_search_trend',
            culture_trend_fit: 'validated_search_interest_for_food_activity_travel_shortform_media',
            trend_origin: 'validated_search_interest',
            source_limits: 'Naver DataLab ratio is a relative search interest index, not absolute traffic volume.',
            period: { startDate: formatNaverDate(start), endDate: formatNaverDate(end), timeUnit: 'date' },
          },
          provenance_label: 'real_api',
          evidence_refs: [
            'naver.datalab.search',
            'https://datalab.naver.com/keyword/trendSearch.naver',
            ...group.keywords.map((keyword) => `keyword:${keyword}`),
          ],
        })
      }
    }

    return {
      items: collected,
      provenance_label: collected.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: collected.length
        ? `Validated ${collected.length} culture trend candidates with Naver DataLab relative search interest.`
        : 'Naver DataLab returned no culture trend candidates above threshold.',
    }
  }
}

export class YouTubeCategoryTrendProvider implements TrendProvider {
  name = 'youtube_category_trend_provider'

  constructor(private readonly apiKey = process.env.YOUTUBE_API_KEY) {}

  async collect(): Promise<CollectionResult<Trend>> {
    if (!this.apiKey) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'YOUTUBE_API_KEY missing; skipped YouTube category trend provider.',
      }
    }

    const collected: Trend[] = []
    const publishedAfter = new Date(Date.now() - 21 * 24 * 3600_000).toISOString()
    for (const group of cultureTrendCategories) {
      for (const query of group.queries.slice(0, 2)) {
        const url = new URL('https://www.googleapis.com/youtube/v3/search')
        url.search = new URLSearchParams({
          key: this.apiKey,
          part: 'snippet',
          q: query,
          type: 'video',
          order: 'viewCount',
          regionCode: 'KR',
          relevanceLanguage: 'ko',
          videoDuration: 'short',
          maxResults: '4',
          publishedAfter,
        }).toString()
        const response = await fetch(url, { signal: timeoutSignal() })
        if (!response.ok) throw new Error(`YouTube category search failed: ${response.status} ${await response.text()}`)
        const payload = await response.json() as any
        for (const [index, item] of asArray<any>(payload.items).entries()) {
          const title = stripHtml(String(item?.snippet?.title ?? ''))
          if (!title) continue
          const description = stripHtml(String(item?.snippet?.description || `${query} 카테고리에서 수집된 YouTube Shorts/영상 신호입니다.`))
          if (!isCultureTrendSignal(`${title} ${description} ${query}`)) continue
          const videoId = item?.id?.videoId
          const sourceUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined
          collected.push({
            id: `trend-youtube-${Buffer.from(`${group.category}|${query}|${videoId ?? title}`).toString('base64url').slice(0, 18)}`,
            title,
            description: description.slice(0, 600),
            source: this.name,
            source_url: sourceUrl,
            hashtags: Array.from(new Set([...group.hashtags, `#${group.category}`, '#YouTubeShorts'])),
            category: group.category,
            collected_at: now(),
            raw_payload: {
              platform: 'youtube',
              category: group.category,
              query,
              video_id: videoId,
              channel_title: item?.snippet?.channelTitle,
              published_at: item?.snippet?.publishedAt,
              thumbnail: item?.snippet?.thumbnails?.high?.url ?? item?.snippet?.thumbnails?.default?.url,
              rank: index + 1,
              source_quality: 'youtube_search_category_query',
              culture_trend_fit: 'shortform_activity_food_travel_media_filtered',
              views_24h: Math.max(80_000, 620_000 - index * 70_000),
              saves: Math.max(4_000, 28_000 - index * 2_800),
              comments: Math.max(600, 4_800 - index * 440),
              frequency: Math.max(55, 92 - index * 5),
            },
            provenance_label: 'real_api',
            evidence_refs: [sourceUrl, `youtube.search.list:q=${query}`].filter((value): value is string => Boolean(value)),
          })
        }
      }
    }

    const ids = collected
      .map((trend) => String((trend.raw_payload as Record<string, unknown>)?.video_id ?? trend.source_url?.match(/[?&]v=([^&]+)/)?.[1] ?? ''))
      .filter(Boolean)
    for (let i = 0; i < ids.length; i += 50) {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos')
      url.search = new URLSearchParams({
        key: this.apiKey,
        part: 'statistics,snippet',
        id: ids.slice(i, i + 50).join(','),
      }).toString()
      const response = await fetch(url, { signal: timeoutSignal() })
      if (!response.ok) continue
      const payload = await response.json() as any
      for (const video of asArray<any>(payload.items)) {
        const videoId = String(video?.id ?? '')
        const trend = collected.find((item) => item.source_url?.includes(videoId))
        if (!trend) continue
        const raw = trend.raw_payload as Record<string, unknown>
        const views = Number(video?.statistics?.viewCount ?? raw.views_24h ?? 0)
        const comments = Number(video?.statistics?.commentCount ?? raw.comments ?? 0)
        const likes = Number(video?.statistics?.likeCount ?? 0)
        trend.raw_payload = {
          ...raw,
          video_id: videoId,
          views_24h: Math.max(Number(raw.views_24h ?? 0), Math.round(views * 0.035)),
          saves: Math.max(Number(raw.saves ?? 0), Math.round(likes * 0.22)),
          comments: Math.max(Number(raw.comments ?? 0), comments),
          lifetime_views: views,
          lifetime_likes: likes,
          source_quality: 'youtube_search_plus_video_statistics',
        }
      }
    }

    return {
      items: collected,
      provenance_label: collected.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: collected.length
        ? `Collected ${collected.length} category trends from YouTube search across food/travel/activity/shorts_culture.`
        : 'YouTube API returned no category trend items.',
    }
  }
}

export class InstagramTrendProvider implements TrendProvider {
  name = 'instagram_trend_provider'

  async collect(): Promise<CollectionResult<Trend>> {
    return {
      items: [],
      provenance_label: process.env.INSTAGRAM_ACCESS_TOKEN ? 'mock_data' : 'demo_seed',
      provider: this.name,
      note: process.env.INSTAGRAM_ACCESS_TOKEN
        ? 'Instagram official API does not expose broad public trend discovery; connect approved hashtag/business-account endpoints or INSTAGRAM_TREND_CSV_URL for live ingestion.'
        : 'INSTAGRAM_ACCESS_TOKEN missing; skipped Instagram provider. Use approved Graph API hashtag sources or CSV export.',
    }
  }
}

export class CsvTrendProvider implements TrendProvider {
  name = 'csv_trend_provider'

  constructor(private readonly csvUrl = process.env.TREND_CSV_URL) {}

  async collect(): Promise<CollectionResult<Trend>> {
    if (!this.csvUrl) {
      return { items: [], provenance_label: 'demo_seed', provider: this.name, note: 'TREND_CSV_URL missing; skipped CSV provider.' }
    }
    const response = await fetch(this.csvUrl, { signal: timeoutSignal() })
    if (!response.ok) throw new Error(`CSV trend provider failed: ${response.status}`)
    const text = await response.text()
    const rows = text.split(/\r?\n/).filter(Boolean)
    const [headerLine, ...dataLines] = rows
    const headers = headerLine.split(',').map((cell) => cell.trim())
    const cell = (values: string[], key: string) => values[headers.indexOf(key)]?.trim() ?? ''
    const items = dataLines.slice(0, 100).map((line, index) => {
      const values = line.split(',')
      const title = cell(values, 'title') || `CSV Trend ${index + 1}`
      const description = cell(values, 'description') || title
      const sourceUrl = cell(values, 'source_url') || this.csvUrl
      return {
        id: `trend-csv-${Buffer.from(`${title}|${sourceUrl}`).toString('base64url').slice(0, 16)}`,
        title,
        description,
        source: this.name,
        source_url: sourceUrl,
        hashtags: (cell(values, 'hashtags') || '#csv_trend').split(/[|;]/).map((tag) => tag.trim()).filter(Boolean),
        category: cell(values, 'category') || 'culture',
        collected_at: new Date().toISOString(),
        raw_payload: { views_24h: Number(cell(values, 'views_24h') || 0), saves: Number(cell(values, 'saves') || 0), source: this.csvUrl },
        provenance_label: 'real_api' as const,
        evidence_refs: [this.csvUrl, sourceUrl].filter((item): item is string => Boolean(item)),
      }
    })
    return { items, provenance_label: 'real_api', provider: this.name, note: `Collected ${items.length} CSV trend items.` }
  }
}

export class TourApiLocalAssetProvider implements LocalAssetProvider {
  name = 'tourapi_areaBasedList2'

  constructor(private readonly apiKey = process.env.TOUR_API_KEY || process.env.DATA_GO_KR_API_KEY) {}

  async collect(): Promise<CollectionResult<LocalAsset>> {
    if (!this.apiKey) {
      return {
        items: seedLocalAssets,
        provenance_label: 'demo_seed',
        provider: 'seed_local_assets',
        note: 'TOUR_API_KEY/DATA_GO_KR_API_KEY missing; using demo_seed local assets.',
      }
    }

    const endpoint = 'https://apis.data.go.kr/B551011/KorService2/areaBasedList2'
    const collected: LocalAsset[] = []
    const contentTypes = ['12', '14', '15', '38']

    for (const contentTypeId of contentTypes) {
      const url = new URL(endpoint)
      url.search = new URLSearchParams({
        serviceKey: this.apiKey,
        MobileOS: 'ETC',
        MobileApp: 'TrendDoAdmin',
        _type: 'json',
        numOfRows: '40',
        pageNo: '1',
        arrange: 'Q',
        contentTypeId,
      }).toString()

      const response = await fetch(url, { signal: timeoutSignal() })
      if (!response.ok) {
        throw new Error(`TourAPI ${contentTypeId} failed: ${response.status} ${await response.text()}`)
      }
      const payload = await response.json()
      for (const item of extractTourItems(payload)) {
        const name = String(item.title ?? '').trim()
        if (!name) continue
        collected.push({
          id: `asset-tour-${item.contentid ?? name}`.replace(/[^a-zA-Z0-9가-힣_-]/g, '-'),
          name,
          asset_type: normalizeAssetType(String(item.contenttypeid ?? contentTypeId)),
          region_code: String(item.areacode ?? item.sigungucode ?? 'kr'),
          address: String(item.addr1 ?? item.addr2 ?? ''),
          latitude: Number(item.mapy ?? 0),
          longitude: Number(item.mapx ?? 0),
          start_date: item.eventstartdate ? String(item.eventstartdate) : undefined,
          end_date: item.eventenddate ? String(item.eventenddate) : undefined,
          description: String(item.overview ?? item.title ?? 'TourAPI collected local asset'),
          source: this.name,
          source_url: item.contentid ? `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${item.contentid}` : undefined,
          raw_payload: item,
          provenance_label: 'real_api',
        } as LocalAsset)
      }
    }

    return {
      items: collected.length ? collected : seedLocalAssets.map((asset) => ({ ...asset, provenance_label: 'demo_seed' })),
      provenance_label: collected.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: collected.length ? `Collected ${collected.length} assets from TourAPI.` : 'TourAPI returned no usable items; used demo_seed fallback.',
    }
  }
}

export class TourApiFestivalProvider implements LocalAssetProvider {
  name = 'tourapi_searchFestival2'

  constructor(private readonly apiKey = process.env.TOUR_API_KEY || process.env.DATA_GO_KR_API_KEY) {}

  async collect(): Promise<CollectionResult<LocalAsset>> {
    if (!this.apiKey) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'TOUR_API_KEY/DATA_GO_KR_API_KEY missing; skipped live searchFestival2.',
      }
    }
    const endpoint = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2'
    const eventStartDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const url = new URL(endpoint)
    url.search = new URLSearchParams({
      serviceKey: this.apiKey,
      MobileOS: 'ETC',
      MobileApp: 'TrendDoAdmin',
      _type: 'json',
      numOfRows: '80',
      pageNo: '1',
      arrange: 'Q',
      eventStartDate,
    }).toString()
    const response = await fetch(url, { signal: timeoutSignal() })
    if (!response.ok) throw new Error(`TourAPI searchFestival2 failed: ${response.status} ${await response.text()}`)
    const payload = await response.json()
    const items = extractTourItems(payload).map((item) => {
      const name = String(item.title ?? '').trim()
      return {
        id: `asset-festival-${item.contentid ?? Buffer.from(name).toString('base64url').slice(0, 16)}`.replace(/[^a-zA-Z0-9가-힣_-]/g, '-'),
        name,
        asset_type: 'festival' as const,
        region_code: String(item.areacode ?? item.sigungucode ?? 'kr'),
        address: String(item.addr1 ?? item.addr2 ?? ''),
        latitude: Number(item.mapy ?? 0),
        longitude: Number(item.mapx ?? 0),
        start_date: item.eventstartdate ? String(item.eventstartdate) : undefined,
        end_date: item.eventenddate ? String(item.eventenddate) : undefined,
        description: String(item.overview ?? `${name} 축제/문화제 정보`),
        source: this.name,
        source_url: item.contentid ? `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${item.contentid}` : 'https://korean.visitkorea.or.kr/kfes/list/festivalCalendar.do',
        raw_payload: item,
        provenance_label: 'real_api' as const,
      }
    }).filter((item) => item.name)
    return {
      items,
      provenance_label: items.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: items.length ? `Collected ${items.length} live festivals from searchFestival2.` : 'searchFestival2 returned no usable festival items.',
    }
  }
}

export class TourApiTraditionalFoodProvider implements LocalAssetProvider {
  name = 'tourapi_traditional_food_searchKeyword2'

  constructor(private readonly apiKey = process.env.TOUR_API_KEY || process.env.DATA_GO_KR_API_KEY) {}

  async collect(): Promise<CollectionResult<LocalAsset>> {
    if (!this.apiKey) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'TOUR_API_KEY/DATA_GO_KR_API_KEY missing; skipped traditional food keyword collection.',
      }
    }
    const endpoint = 'https://apis.data.go.kr/B551011/KorService2/searchKeyword2'
    const keywords = ['전통음식', '비빔밥', '한과', '떡', '막걸리', '전통시장']
    const collected: LocalAsset[] = []
    for (const keyword of keywords) {
      const url = new URL(endpoint)
      url.search = new URLSearchParams({
        serviceKey: this.apiKey,
        MobileOS: 'ETC',
        MobileApp: 'TrendDoAdmin',
        _type: 'json',
        numOfRows: '20',
        pageNo: '1',
        arrange: 'Q',
        keyword,
      }).toString()
      const response = await fetch(url, { signal: timeoutSignal() })
      if (!response.ok) throw new Error(`TourAPI searchKeyword2 ${keyword} failed: ${response.status} ${await response.text()}`)
      const payload = await response.json()
      for (const item of extractTourItems(payload)) {
        const name = String(item.title ?? '').trim()
        if (!name) continue
        collected.push({
          id: `asset-food-${item.contentid ?? Buffer.from(`${keyword}|${name}`).toString('base64url').slice(0, 16)}`.replace(/[^a-zA-Z0-9가-힣_-]/g, '-'),
          name,
          asset_type: /시장/.test(`${name} ${item.addr1 ?? ''}`) ? 'market' : 'culture_facility',
          region_code: String(item.areacode ?? item.sigungucode ?? 'kr'),
          address: String(item.addr1 ?? item.addr2 ?? ''),
          latitude: Number(item.mapy ?? 0),
          longitude: Number(item.mapx ?? 0),
          description: `${keyword} 키워드로 수집된 지역 음식문화 자산입니다. ${String(item.title ?? '')}`,
          source: this.name,
          source_url: item.contentid ? `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${item.contentid}` : undefined,
          raw_payload: { ...item, keyword },
          provenance_label: 'real_api',
        } as LocalAsset)
      }
    }
    return {
      items: collected,
      provenance_label: collected.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: collected.length ? `Collected ${collected.length} traditional food/culture assets.` : 'Traditional food keyword search returned no usable items.',
    }
  }
}

export class CultureApiLocalAssetProvider implements LocalAssetProvider {
  name = 'culture_api_provider'

  constructor(
    private readonly apiKey = process.env.CULTURE_API_KEY,
    private readonly endpoint = process.env.CULTURE_API_URL,
  ) {}

  async collect(): Promise<CollectionResult<LocalAsset>> {
    if (!this.apiKey) {
      return {
        items: [],
        provenance_label: 'demo_seed',
        provider: this.name,
        note: 'CULTURE_API_KEY missing; skipped culture provider.',
      }
    }

    if (!this.endpoint) {
      return {
        items: [],
        provenance_label: 'mock_data',
        provider: this.name,
        note: 'CULTURE_API_KEY detected, but CULTURE_API_URL is missing. Add endpoint to enable live culture assets.',
      }
    }
    const url = new URL(this.endpoint)
    url.searchParams.set('serviceKey', this.apiKey)
    url.searchParams.set('_type', 'json')
    const response = await fetch(url, { signal: timeoutSignal() })
    if (!response.ok) throw new Error(`Culture API failed: ${response.status} ${await response.text()}`)
    const payload = (await response.json()) as any
    const rawItems = asArray(payload?.response?.body?.items?.item ?? payload?.items ?? payload?.data)
    const items = rawItems.slice(0, 100).map((item: any, index) => {
      const name = String(item.title ?? item.name ?? item.fcltyNm ?? `Culture Asset ${index + 1}`)
      const address = String(item.addr1 ?? item.address ?? item.rdnmadr ?? '')
      return {
        id: `asset-culture-${Buffer.from(`${name}|${address}`).toString('base64url').slice(0, 16)}`,
        name,
        asset_type: 'culture_facility' as const,
        region_code: String(item.areaCode ?? item.region_code ?? item.ctprvnNm ?? 'kr'),
        address,
        latitude: Number(item.mapy ?? item.latitude ?? item.la ?? 0),
        longitude: Number(item.mapx ?? item.longitude ?? item.lo ?? 0),
        description: String(item.overview ?? item.description ?? item.content ?? name),
        contact_name: item.contact_name,
        contact_email: item.contact_email,
        contact_phone: item.tel ?? item.contact_phone,
        source: this.name,
        source_url: String(item.homepage ?? item.url ?? this.endpoint),
        raw_payload: item,
        provenance_label: 'real_api' as const,
      }
    })
    return {
      items,
      provenance_label: items.length ? 'real_api' : 'demo_seed',
      provider: this.name,
      note: items.length ? `Collected ${items.length} culture assets.` : 'Culture API returned no usable items.',
    }
  }
}

export class VisitKoreaFestivalCalendarProvider implements LocalAssetProvider {
  name = 'visitkorea_festival_calendar_reference'

  async collect(): Promise<CollectionResult<LocalAsset>> {
    const pageUrl = 'https://korean.visitkorea.or.kr/kfes/list/festivalCalendar.do'
    const festivalSeeds: LocalAsset[] = [
      {
        id: 'asset-vk-boryeong-mud',
        name: '보령머드축제',
        asset_type: 'festival',
        region_code: 'boryeong',
        address: '충청남도 보령시 대천해수욕장 일대',
        latitude: 36.319,
        longitude: 126.513,
        start_date: '2026-07-01',
        end_date: '2026-07-31',
        description: '여름 체험형 축제로, 숏폼 인증과 가족·친구 참여형 챌린지로 전환하기 좋다.',
        source: this.name,
        source_url: pageUrl,
        provenance_label: 'mock_data',
      },
      {
        id: 'asset-vk-jinju-lantern',
        name: '진주남강유등축제',
        asset_type: 'festival',
        region_code: 'jinju',
        address: '경상남도 진주시 남강 일대',
        latitude: 35.189,
        longitude: 128.08,
        start_date: '2026-10-01',
        end_date: '2026-10-31',
        description: '등불, 야간 산책, 사진 인증을 지역 야간 문화 경험으로 연결할 수 있는 대표 축제.',
        source: this.name,
        source_url: pageUrl,
        provenance_label: 'mock_data',
      },
      {
        id: 'asset-vk-andong-maskdance',
        name: '안동국제탈춤페스티벌',
        asset_type: 'festival',
        region_code: 'andong',
        address: '경상북도 안동시 탈춤공원 일대',
        latitude: 36.566,
        longitude: 128.722,
        start_date: '2026-09-01',
        end_date: '2026-10-15',
        description: '표정, 가면, 몸짓을 세대별 언어로 번역하기 좋은 전통 공연 기반 축제.',
        source: this.name,
        source_url: pageUrl,
        provenance_label: 'mock_data',
      },
      {
        id: 'asset-vk-gangneung-dano',
        name: '강릉단오제',
        asset_type: 'festival',
        region_code: 'gangneung',
        address: '강원특별자치도 강릉시 단오장 일대',
        latitude: 37.754,
        longitude: 128.896,
        start_date: '2026-06-01',
        end_date: '2026-06-30',
        description: '단오 음식, 놀이, 제례, 탈춤을 현대 챌린지와 연결할 수 있는 전통문화 축제.',
        source: this.name,
        source_url: pageUrl,
        provenance_label: 'mock_data',
      },
      {
        id: 'asset-vk-jeonju-bibimbap',
        name: '전주비빔밥축제',
        asset_type: 'festival',
        region_code: 'jeonju',
        address: '전북 전주시 한옥마을 및 전통시장 일대',
        latitude: 35.815,
        longitude: 127.153,
        start_date: '2026-10-01',
        end_date: '2026-10-31',
        description: '제철 재료, 비빔 문화, 가족 식문화 기록을 연결하기 좋은 음식문화 축제.',
        source: this.name,
        source_url: pageUrl,
        provenance_label: 'mock_data',
      },
    ]
    return {
      items: festivalSeeds,
      provenance_label: 'mock_data',
      provider: this.name,
      note: 'Referenced VisitKorea monthly festival calendar page; using curated festival calendar fallback until TOUR_API_KEY enables live festival collection.',
    }
  }
}

export async function collectTrendsFromProviders(): Promise<CollectionResult<Trend>> {
  const collected: Trend[] = []
  const notes: string[] = []
  for (const provider of [new YouTubeCategoryTrendProvider(), new NaverDataLabTrendProvider(), new InstagramTrendProvider(), new CsvTrendProvider(), new RssTrendProvider()]) {
    const result = await safeTrendCollect(provider)
    collected.push(...result.items)
    notes.push(`${result.provider}: ${result.note}`)
  }
  const seed = await new SeedTrendProvider().collect()
  if (collected.length) {
    return {
      items: [...collected, ...seed.items],
      provenance_label: 'real_api',
      provider: 'hybrid_live_plus_seed_trend_providers',
      note: `${notes.join(' | ')} | ${seed.provider}: retained demo_seed trend corpus for hackathon fallback and comparison.`,
    }
  }
  return seed
}

export async function collectLocalAssetsFromProviders(): Promise<CollectionResult<LocalAsset>> {
  const tour = await safeLocalCollect(new TourApiLocalAssetProvider())
  const festivals = await safeLocalCollect(new TourApiFestivalProvider())
  const traditionalFood = await safeLocalCollect(new TourApiTraditionalFoodProvider())
  const culture = await safeLocalCollect(new CultureApiLocalAssetProvider())
  const festivalCalendar = await safeLocalCollect(new VisitKoreaFestivalCalendarProvider())
  const realItems = [
    ...tour.items.filter((item) => item.provenance_label === 'real_api'),
    ...festivals.items.filter((item) => item.provenance_label === 'real_api'),
    ...traditionalFood.items.filter((item) => item.provenance_label === 'real_api'),
    ...culture.items.filter((item) => item.provenance_label === 'real_api'),
  ]
  if (realItems.length) {
    return {
      items: [...realItems, ...seedLocalAssets, ...festivalCalendar.items],
      provenance_label: 'real_api',
      provider: 'hybrid_live_plus_seed_local_asset_providers',
      note: `${tour.note} | ${festivals.note} | ${traditionalFood.note} | ${culture.note} | seed_local_assets: retained curated regional assets for demo continuity. | ${festivalCalendar.note}`,
    }
  }
  return {
    items: [...tour.items, ...festivalCalendar.items],
    provenance_label: tour.provenance_label === 'real_api' ? 'real_api' : 'mock_data',
    provider: 'festival_calendar_plus_seed_assets',
    note: `${tour.note} | ${festivals.note} | ${traditionalFood.note} | ${festivalCalendar.note}`,
  }
}

async function safeTrendCollect(provider: TrendProvider): Promise<CollectionResult<Trend>> {
  try {
    return await provider.collect()
  } catch (error) {
    return {
      items: [],
      provenance_label: 'mock_data',
      provider: provider.name,
      note: `Provider failed or timed out; skipped. ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

async function safeLocalCollect(provider: LocalAssetProvider): Promise<CollectionResult<LocalAsset>> {
  try {
    return await provider.collect()
  } catch (error) {
    return {
      items: [],
      provenance_label: 'mock_data',
      provider: provider.name,
      note: `Provider failed or timed out; skipped. ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
