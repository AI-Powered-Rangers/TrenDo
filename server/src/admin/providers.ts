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
  name = 'seed_csv'

  async collect(): Promise<CollectionResult<Trend>> {
    return {
      items: seedTrends.map((trend) => ({ ...trend, collected_at: now(), provenance_label: 'demo_seed' })),
      provenance_label: 'demo_seed',
      provider: this.name,
      note: 'No supported live social trend provider key is configured; using seed trend CSV equivalent.',
    }
  }
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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

    const parser = new XMLParser({ ignoreAttributes: false })
    const items: Trend[] = []
    for (const sourceUrl of this.urls) {
      const response = await fetch(sourceUrl)
      if (!response.ok) throw new Error(`RSS trend provider failed ${sourceUrl}: ${response.status}`)
      const xml = await response.text()
      const parsed = parser.parse(xml)
      const rssItems = asArray(parsed?.rss?.channel?.item ?? parsed?.feed?.entry)
      for (const item of rssItems.slice(0, 40)) {
        const title = stripHtml(String(item.title?.['#text'] ?? item.title ?? 'Untitled trend'))
        const link = String(item.link?.['@_href'] ?? item.link ?? item.guid ?? sourceUrl)
        const description = stripHtml(String(item.description ?? item.summary ?? item.content ?? title))
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
          raw_payload: { sourceUrl, published: item.pubDate ?? item.published, frequency: 70 },
          provenance_label: 'real_api',
          evidence_refs: [sourceUrl, link],
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

export class CsvTrendProvider implements TrendProvider {
  name = 'csv_trend_provider'

  constructor(private readonly csvUrl = process.env.TREND_CSV_URL) {}

  async collect(): Promise<CollectionResult<Trend>> {
    if (!this.csvUrl) {
      return { items: [], provenance_label: 'demo_seed', provider: this.name, note: 'TREND_CSV_URL missing; skipped CSV provider.' }
    }
    const response = await fetch(this.csvUrl)
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

      const response = await fetch(url)
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
    const response = await fetch(url)
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

export async function collectTrendsFromProviders(): Promise<CollectionResult<Trend>> {
  const collected: Trend[] = []
  const notes: string[] = []
  for (const provider of [new RssTrendProvider(), new CsvTrendProvider()]) {
    const result = await provider.collect()
    collected.push(...result.items)
    notes.push(`${result.provider}: ${result.note}`)
  }
  if (collected.length) {
    return {
      items: collected,
      provenance_label: 'real_api',
      provider: 'live_trend_providers',
      note: notes.join(' | '),
    }
  }
  return new SeedTrendProvider().collect()
}

export async function collectLocalAssetsFromProviders(): Promise<CollectionResult<LocalAsset>> {
  const tour = await new TourApiLocalAssetProvider().collect()
  const culture = await new CultureApiLocalAssetProvider().collect()
  const realItems = [...tour.items.filter((item) => item.provenance_label === 'real_api'), ...culture.items.filter((item) => item.provenance_label === 'real_api')]
  if (realItems.length) {
    return {
      items: realItems,
      provenance_label: 'real_api',
      provider: 'live_local_asset_providers',
      note: `${tour.note} | ${culture.note}`,
    }
  }
  return tour.items.length ? tour : culture
}
