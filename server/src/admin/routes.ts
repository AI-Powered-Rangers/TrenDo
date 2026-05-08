import crypto from 'node:crypto'
import type { Express } from 'express'
import {
  embedText,
  generateAdminBriefing,
  generateAnalyticsDiagnosis,
  generateChallenge,
  generateExperienceCard,
  generateHeritageRemix,
  generateImpactReport,
  generateTrendCardPackage,
  generateLocalMatchExplanation,
  generateProposalEmail,
  generateTrendContext,
  reviewSafety,
  translateByGeneration,
  verifyLocalMatch,
} from './aiClient.js'
import { calculateAnalyticsSnapshot, findChallengeDoctorTargets } from './analytics.js'
import { collectLocalAssetsFromProviders, collectTrendsFromProviders } from './providers.js'
import { writeImpactReportPdf } from './pdf.js'
import { calculateTrendToActionScore, clampScore, cosineSimilarity, deterministicEmbedding, scoreHeritageFit, scoreProfiledLocalMatch, scoreSurge, scoreTrend } from './scoring.js'
import { adminStore } from './store.js'
import type { AdminDb, AiRun, Challenge, LocalMatch, Proposal, SafetyReview, Trend, TrendCluster, UserEvent } from './types.js'

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function clusterTrends(trends = [] as Awaited<ReturnType<typeof adminStore.read>>['trends']): TrendCluster[] {
  const clusters: TrendCluster[] = []
  const threshold = 0.78
  for (const trend of trends) {
    const embedding = trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description}`)
    const match = clusters.find((cluster) => {
      const representative = trends.find((candidate) => candidate.id === cluster.trend_ids[0])
      return cosineSimilarity(embedding, representative?.embedding) >= threshold
    })
    if (match) {
      match.trend_ids.push(trend.id)
      match.representative_keywords = Array.from(new Set([...match.representative_keywords, ...trend.hashtags.map((tag) => tag.replace('#', ''))])).slice(0, 6)
      match.cluster_score = Math.round((match.cluster_score + (trend.action_score?.total ?? scoreTrend(trend).total)) / 2)
    } else {
      clusters.push({
        id: id('cluster'),
        name: `${trend.hashtags[0]?.replace('#', '') ?? trend.category} cluster`,
        representative_keywords: trend.hashtags.map((tag) => tag.replace('#', '')).slice(0, 6),
        trend_ids: [trend.id],
        cluster_score: trend.action_score?.total ?? scoreTrend(trend).total,
        created_at: new Date().toISOString(),
      })
    }
  }
  return clusters
}

function stripForState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (key, item) => {
    if (key === 'embedding') return Array.isArray(item) ? `present:${item.length}d` : item
    if (key === 'raw_payload' && item && typeof item === 'object') {
      return {
        views_24h: item.views_24h,
        saves: item.saves,
        comments: item.comments,
        frequency: item.frequency,
        last_cycle_at: item.last_cycle_at,
        source_quality: item.source_quality,
        culture_trend_fit: item.culture_trend_fit,
        admin_review: item.admin_review,
        trend_origin: item.trend_origin,
      }
    }
    return item
  }))
}

function rawObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function trendAdminReview(trend: Trend) {
  const raw = rawObject(trend.raw_payload)
  const review = raw.admin_review
  return review && typeof review === 'object' && !Array.isArray(review) ? review as Record<string, unknown> : {}
}

function trendPublicationStatus(trend: Trend): string {
  return String(trendAdminReview(trend).publication_status ?? 'pending_review')
}

function buildAdminRoles() {
  return [
    {
      role: '슈퍼 관리자',
      scope: '전체 데이터, 사용자, 콘텐츠, 통계 관리',
      permissions: ['dashboard:read', 'trend:approve', 'card:publish', 'asset:manage', 'moderation:manage', 'roles:manage', 'analytics:read'],
      default_menu: '대시보드',
    },
    {
      role: '콘텐츠 관리자',
      scope: '유행 카드 생성·수정·승인',
      permissions: ['trend:edit', 'trend:approve', 'challenge:edit', 'card:publish'],
      default_menu: '유행 카드 편집',
    },
    {
      role: '문화 검수자',
      scope: '세대별 표현, 전통문화 설명, 문화 왜곡 검토',
      permissions: ['ai_review:read', 'culture:approve', 'generation_guide:review', 'heritage:review'],
      default_menu: 'AI 생성 결과 검수',
    },
    {
      role: '지역 관리자',
      scope: '지역 자산, 축제, 공방, 시장 정보 등록',
      permissions: ['asset:create', 'asset:update', 'festival:manage', 'local_match:review'],
      default_menu: '지역 자산 관리',
    },
    {
      role: '모더레이터',
      scope: '신고 콘텐츠, 부적절 인증 관리',
      permissions: ['submission:review', 'report:resolve', 'safety:review'],
      default_menu: '사용자 인증/신고 관리',
    },
    {
      role: '파트너 관리자',
      scope: '자신이 등록한 지역 행사·공간 정보만 관리',
      permissions: ['own_asset:update', 'own_event:manage', 'proposal:read'],
      default_menu: '지역 자산 관리',
    },
  ]
}

function buildTrendCandidateAudit(db: AdminDb) {
  const recommendations = buildUserFeedRecommendations(db)
  return recommendations.slice(0, 20).map((item) => {
    const trend = db.trends.find((candidate) => candidate.id === item.trend_id)
    const raw = rawObject(trend?.raw_payload)
    const status = trend ? trendPublicationStatus(trend) : 'pending_review'
    const riskFlags = [
      ...(item.recommendation_score < 58 ? ['추천 점수 낮음'] : []),
      ...(item.goalScores.local_traditional_connection < 62 ? ['지역 연결 근거 부족'] : []),
      ...(item.goalScores.digital_to_action < 62 ? ['행동 전환성 부족'] : []),
      ...(String(trend?.description ?? '').match(/조롱|무단|위험|과격|얼굴|좌석/) ? ['안전·초상권 문구 확인'] : []),
      ...(item.linked_assets.length ? [] : ['연결 지역 자산 없음']),
    ]
    return {
      candidate_id: item.trend_id,
      title: item.title,
      category: trend?.category ?? 'unknown',
      source_type: trend?.source ?? 'unknown',
      provenance_label: item.provenance_label,
      status,
      ai_summary: trend?.description ?? '',
      risk_level: riskFlags.length >= 3 ? 'high' : riskFlags.length ? 'medium' : 'low',
      generation_fit: ['10대', '2030', '4050', '60대 이상'],
      local_connection_potential: item.goalScores.local_traditional_connection >= 76 ? 'high' : item.goalScores.local_traditional_connection >= 58 ? 'medium' : 'low',
      traditional_remix_potential: item.problem_axis?.find((axis) => axis.axis === '전통문화 지속가능성')?.score ?? 0,
      recommendation_score: item.recommendation_score,
      decision: item.decision,
      risk_flags: riskFlags,
      review_checklist: [
        '세대별 설명이 특정 세대를 조롱하거나 고정관념화하지 않는가',
        '유래·문화 맥락을 근거 없이 단정하지 않는가',
        '전통문화 요소가 장식처럼 오용되지 않는가',
        '실제 수행 단계와 안전 문구가 충분한가',
        '지역 연결이 이름만 붙인 억지 매칭이 아닌가',
      ],
      evidence: {
        evidence_refs: trend?.evidence_refs ?? [],
        source_url: trend?.source_url,
        source_quality: raw.source_quality ?? raw.culture_trend_fit ?? 'category_provider_or_seed',
        linked_assets: item.linked_assets,
      },
    }
  })
}

function buildUserFeedRecommendations(db: AdminDb) {
  return db.trends
    .map((trend) => {
      const relatedChallenges = db.challenges.filter((challenge) => challenge.trend_id === trend.id)
      const relatedMatches = db.localMatches.filter((match) => match.trend_id === trend.id)
      const relatedReviews = db.safetyReviews.filter((review) => relatedChallenges.some((challenge) => challenge.id === review.challenge_id))
      const highRisk = relatedReviews.some((review) => review.risk_level === 'high')
      const publicationStatus = trendPublicationStatus(trend)
      const action = trend.action_score?.total ?? scoreTrend(trend).total
      const surge = trend.surge_score?.total ?? scoreSurge(trend.raw_payload).total
      const localMatch = relatedMatches.length
        ? Math.max(...relatedMatches.map((match) => match.match_score))
        : inferLocalCultureFit(trend, db)
      const challengeReady = relatedChallenges.some((challenge) => challenge.status === 'approved') ? 88 : relatedChallenges.length ? 72 : 42
      const safety = highRisk ? 18 : relatedReviews.some((review) => review.risk_level === 'medium') ? 62 : 82
      const cultureRetention = clampScore((db.analyticsSnapshots[0]?.completion_rate ?? 0) * 0.55 + (db.analyticsSnapshots[0]?.proof_rate ?? 0) * 0.45)
      const goalScores = {
        cultural_accessibility: clampScore((trend.hashtags.length * 12) + challengeReady * 0.5),
        digital_to_action: clampScore(action * 0.55 + challengeReady * 0.45),
        local_traditional_connection: clampScore(localMatch),
        culture_retention_data: cultureRetention || clampScore((db.userEvents.filter((event) => event.trend_id === trend.id).length / 4) + 45),
      }
      const recommendation_score = clampScore(
        surge * 0.18
        + goalScores.cultural_accessibility * 0.2
        + goalScores.digital_to_action * 0.26
        + goalScores.local_traditional_connection * 0.24
        + goalScores.culture_retention_data * 0.12
        - (highRisk ? 28 : 0),
      )
      const baseDecision = highRisk ? 'do_not_recommend' : recommendation_score >= 76 ? 'recommend' : recommendation_score >= 58 ? 'hold' : 'do_not_recommend'
      const decision = publicationStatus === 'approved_for_user_app'
        ? baseDecision === 'do_not_recommend' ? 'hold' : 'recommend'
        : publicationStatus === 'rejected' || publicationStatus === 'needs_revision'
          ? 'do_not_recommend'
          : baseDecision === 'recommend'
            ? 'hold'
            : baseDecision
      const linkedAssets = db.localAssets
        .map((asset) => ({ asset, score: scoreTrendAssetFit(trend, asset) }))
        .filter(({ score }) => score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ asset, score }) => ({ id: asset.id, name: asset.name, region_code: normalizeAssetRegionCode(asset), asset_type: asset.asset_type, score: clampScore(score) }))
      return {
        trend_id: trend.id,
        title: trend.title,
        decision,
        recommendation_score,
        goalScores,
        problem_axis: [
          {
            axis: '문화 접근 불균형',
            feature: '세대별 번역 가이드, 쉬운 설명, 난이도·비용·소요 시간 표시',
            logic: '유행을 모르는 세대도 이해하고 참여할 수 있게 한다.',
            score: goalScores.cultural_accessibility,
          },
          {
            axis: '문화 산업 양극화',
            feature: '롱테일 트렌드 발굴, 지역/소상공인 연결, 로컬 문화 연결',
            logic: '대형 플랫폼과 인기 콘텐츠에 몰린 관심을 지역·소규모 문화로 분산한다.',
            score: goalScores.local_traditional_connection,
          },
          {
            axis: '디지털 소비 구조 왜곡',
            feature: 'Do-It Now, 현실 참여 챌린지, 문화 잔존율',
            logic: '숏폼을 보는 데서 끝내지 않고 실제 행동으로 전환한다.',
            score: goalScores.digital_to_action,
          },
          {
            axis: '전통문화 지속가능성',
            feature: '전통문화 리믹스 카드, 가족 챌린지, 세대 기억 수집',
            logic: '전통문화를 박물관식 관람이 아니라 오늘의 유행 언어로 재생산한다.',
            score: clampScore((goalScores.local_traditional_connection * 0.62) + (goalScores.culture_retention_data * 0.38)),
          },
        ],
        linked_assets: linkedAssets,
        reasons: [
          `행동 전환 점수 ${action}`,
          `지역·전통 연결 점수 ${goalScores.local_traditional_connection}`,
          `세대 접근성 점수 ${goalScores.cultural_accessibility}`,
          `관리자 배포 상태 ${publicationStatus}`,
          highRisk ? 'high risk 검수 필요' : '자동 공개 차단, 관리자 승인 필요',
        ],
        required_actions: decision === 'recommend'
          ? ['사용자 피드 후보로 검토', '세대별 설명 확인', '지역 연결 카드 노출 검수']
          : decision === 'hold'
            ? ['Safety Gate 또는 Local Match 보강', '챌린지 체크리스트 구체화']
            : ['사용자 피드 제안 보류', '위험/지역 연결/참여 데이터 재검토'],
        provenance_label: trend.provenance_label,
      }
    })
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
}

function inferLocalCultureFit(trend: Trend, db: AdminDb): number {
  const text = `${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`
  const keywordFit = /전통|시장|공방|축제|지역|화채|탈춤|제철|한라봉|봄동|약과|흑임자/.test(text) ? 78 : 52
  const semanticFit = Math.max(0, ...db.localAssets.map((asset) => cosineSimilarity(
    trend.embedding ?? deterministicEmbedding(text),
    asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description}`),
  ) * 100))
  return clampScore(keywordFit * 0.45 + semanticFit * 0.55)
}

function scoreTrendAssetFit(trend: Trend, asset: AdminDb['localAssets'][number]): number {
  const semantic = cosineSimilarity(
    trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description}`),
    asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description}`),
  ) * 100
  const profiled = scoreProfiledLocalMatch(trend, asset)
  if (profiled.hardReject) return Math.min(profiled.score.total, 36)
  return clampScore(semantic * 0.18 + profiled.score.total * 0.82)
}

const regionCultureMeta: Record<string, { label: string; specialties: string[]; traditional_culture: string[]; x: number; y: number; latitude: number; longitude: number }> = {
  seoul: { label: '서울', specialties: ['궁중음식', '약과', '한과'], traditional_culture: ['궁궐 문화', '한옥 골목', '도시형 공방'], x: 45, y: 22, latitude: 37.5665, longitude: 126.978 },
  suwon: { label: '경기·수원권', specialties: ['수원 갈비', '전통시장 간식'], traditional_culture: ['화성행궁', '한옥거리', '공방 골목'], x: 42, y: 30, latitude: 37.2636, longitude: 127.0286 },
  gangneung: { label: '강원권', specialties: ['초당두부', '감자떡', '커피 디저트'], traditional_culture: ['단오제', '관노가면극', '해안 마을 문화'], x: 67, y: 26, latitude: 37.7519, longitude: 128.8761 },
  jeonju: { label: '전북·전주권', specialties: ['비빔밥', '한과', '흑임자 간식'], traditional_culture: ['한옥마을', '전통시장', '한지 공예'], x: 42, y: 58, latitude: 35.8242, longitude: 127.148 },
  busan: { label: '부산', specialties: ['어묵', '유자 디저트', '밀면'], traditional_culture: ['해양 문화', '야시장', '지역 마켓'], x: 67, y: 75, latitude: 35.1796, longitude: 129.0756 },
  jeju: { label: '제주', specialties: ['한라봉', '감귤청', '오메기떡'], traditional_culture: ['해녀 문화', '감귤 농장', '돌문화'], x: 34, y: 88, latitude: 33.4996, longitude: 126.5312 },
  andong: { label: '안동', specialties: ['찜닭', '안동소주', '전통 한과'], traditional_culture: ['하회탈춤', '종가문화', '유교문화'], x: 60, y: 52, latitude: 36.5684, longitude: 128.7294 },
  jinju: { label: '경남·진주권', specialties: ['진주비빔밥', '유등빵'], traditional_culture: ['유등축제', '남강 야간문화'], x: 55, y: 70, latitude: 35.1802, longitude: 128.1076 },
  boryeong: { label: '충남·보령권', specialties: ['해산물', '머드 체험 상품'], traditional_culture: ['머드축제', '해양 체험'], x: 31, y: 49, latitude: 36.3334, longitude: 126.6128 },
  gwangju: { label: '광주·전남권', specialties: ['무화과', '떡갈비', '김치'], traditional_culture: ['미디어아트', '민속 음식문화'], x: 38, y: 68, latitude: 35.1595, longitude: 126.8526 },
  kr: { label: '전국', specialties: ['지역 특산품'], traditional_culture: ['전국 문화 자산'], x: 50, y: 50, latitude: 36.5, longitude: 127.8 },
}

function normalizeAssetRegionCode(asset: AdminDb['localAssets'][number]): string {
  if (regionCultureMeta[asset.region_code]) return asset.region_code
  const text = `${asset.address} ${asset.name} ${asset.description}`
  if (/서울/.test(text)) return 'seoul'
  if (/수원|경기|경기도/.test(text)) return 'suwon'
  if (/강릉|강원/.test(text)) return 'gangneung'
  if (/전주|전북|전라북도|완주|군산/.test(text)) return 'jeonju'
  if (/부산|기장/.test(text)) return 'busan'
  if (/제주/.test(text)) return 'jeju'
  if (/안동|경북|경상북도/.test(text)) return 'andong'
  if (/진주|경남|경상남도/.test(text)) return 'jinju'
  if (/보령|충남|충청남도|아산/.test(text)) return 'boryeong'
  if (/광주|전남|전라남도|함평|완도|나주/.test(text)) return 'gwangju'
  return 'kr'
}

function buildRegionIntelligence(db: AdminDb, recommendations = buildUserFeedRecommendations(db)) {
  const regionCodes = Array.from(new Set([...Object.keys(regionCultureMeta), ...db.localAssets.map((asset) => normalizeAssetRegionCode(asset))]))
  const recommendationByTrend = new Map(recommendations.map((item) => [item.trend_id, item]))
  const scoredTrends = db.trends
    .slice(0, 90)
    .map((trend) => ({ trend, recommendation: recommendationByTrend.get(trend.id) }))
  return regionCodes.map((region_code) => {
    const meta = regionCultureMeta[region_code] ?? {
      label: region_code,
      specialties: ['지역 특산품 데이터 수집 필요'],
      traditional_culture: ['지역 전통문화 데이터 수집 필요'],
      x: 50 + (region_code.length * 7) % 30,
      y: 35 + (region_code.length * 11) % 45,
      latitude: 36.5,
      longitude: 127.8,
    }
    const assets = db.localAssets.filter((asset) => normalizeAssetRegionCode(asset) === region_code)
    const festivals = assets.filter((asset) => asset.asset_type === 'festival')
    const typePriority: Record<string, number> = { market: 1, workshop: 2, culture_facility: 3, heritage: 4, exhibition: 5, tourism: 6 }
    const cultureAssets = assets
      .filter((asset) => asset.asset_type !== 'festival')
      .sort((a, b) => (typePriority[a.asset_type] ?? 9) - (typePriority[b.asset_type] ?? 9))
    const linkedTrends = scoredTrends
      .map(({ trend, recommendation }) => {
        const bestAssetScore = assets.length
          ? Math.max(...assets.slice(0, 18).map((asset) => scoreTrendAssetFit(trend, asset)))
          : (recommendation?.goalScores.local_traditional_connection ?? inferLocalCultureFit(trend, db)) * 0.7
        return {
          trend_id: trend.id,
          title: trend.title,
          score: clampScore(bestAssetScore * 0.6 + (recommendation?.recommendation_score ?? 55) * 0.4),
          decision: recommendation?.decision ?? 'hold',
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    return {
      region_code,
      label: meta.label,
      map_position: { x: meta.x, y: meta.y },
      latitude: meta.latitude,
      longitude: meta.longitude,
      specialties: meta.specialties,
      traditional_culture: meta.traditional_culture,
      festivals: festivals.slice(0, 6).map((asset) => ({
        id: asset.id,
        name: asset.name,
        start_date: asset.start_date,
        end_date: asset.end_date,
        provenance_label: asset.provenance_label,
      })),
      assets: cultureAssets.slice(0, 6).map((asset) => ({
        id: asset.id,
        name: asset.name,
        asset_type: asset.asset_type,
        provenance_label: asset.provenance_label,
      })),
      linked_trends: linkedTrends,
      opportunity_score: clampScore(
        Math.min(100, assets.length * 9)
        + Math.min(30, festivals.length * 8)
        + (linkedTrends[0]?.score ?? 40) * 0.45,
      ),
      provenance_label: assets.some((asset) => asset.provenance_label === 'real_api') ? 'real_api' : assets.length ? 'mock_data' : 'derived',
    }
  }).sort((a, b) => b.opportunity_score - a.opportunity_score)
}

export function registerAdminRoutes(app: Express) {
  app.get('/api/admin/state', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const analytics = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const hasRealApi = db.trends.some((item) => item.provenance_label === 'real_api') || db.localAssets.some((item) => item.provenance_label === 'real_api')
    const userFeedRecommendations = buildUserFeedRecommendations(db)
    res.json({
      ...stripForState(db),
      analytics,
      userFeedRecommendations,
      trendCandidateAudits: buildTrendCandidateAudit(db),
      adminRoles: buildAdminRoles(),
      regionIntelligence: buildRegionIntelligence(db, userFeedRecommendations),
      doctorTargets: findChallengeDoctorTargets(db.userEvents),
      runtime: {
        llm: process.env.OPENAI_API_KEY ? 'real_api' : 'demo_seed',
        trendApis:
          process.env.YOUTUBE_API_KEY || process.env.NAVER_CLIENT_ID || process.env.NAVER_CLIENT_SECRET
            ? 'configured'
            : 'demo_seed',
        dataApis:
          process.env.DATA_GO_KR_API_KEY || process.env.TOUR_API_KEY || process.env.CULTURE_API_KEY
            ? 'configured'
            : 'demo_seed',
        mapApi: process.env.KAKAO_MAP_API_KEY || process.env.MAPBOX_TOKEN ? 'configured' : 'fallback_svg',
        database: process.env.DATABASE_URL ? process.env.DATABASE_URL : 'file_json_sqlite_fallback',
        hasRealApi,
      },
    })
  })

  app.post('/api/admin/collect/trends', async (_req, res) => {
    const result = await collectTrendsFromProviders()
    const collected = result.items.map((trend) => ({
      ...trend,
      collected_at: new Date().toISOString(),
      embedding: trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
      action_score: scoreTrend(trend),
      surge_score: scoreSurge(trend.raw_payload),
      provenance_label: trend.provenance_label ?? result.provenance_label,
    }))
    const db = await adminStore.mutate((draft) => {
      draft.trends = dedupeBy([...collected, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.trends.forEach((trend) => {
        trend.action_score = trend.action_score ?? scoreTrend(trend)
        trend.surge_score = trend.surge_score ?? scoreSurge(trend.raw_payload)
      })
    })
    res.json({ inserted: collected.length, provenance_label: result.provenance_label, provider: result.provider, note: result.note, trends: db.trends })
  })

  app.post('/api/admin/collect/local-assets', async (_req, res) => {
    const result = await collectLocalAssetsFromProviders()
    const collected = result.items.map((asset) => ({
      ...asset,
      embedding: asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
      provenance_label: asset.provenance_label ?? result.provenance_label,
    }))
    const db = await adminStore.mutate((draft) => {
      draft.localAssets = dedupeBy([...collected, ...draft.localAssets], (asset) => `${asset.name}|${asset.address || asset.source_url}`)
    })
    res.json({
      inserted: collected.length,
      provenance_label: result.provenance_label,
      provider: result.provider,
      note: result.note,
      localAssets: db.localAssets,
    })
  })

  app.post('/api/admin/collect/cycle', async (_req, res) => {
    const started = Date.now()
    const trendCollection = await collectTrendsFromProviders()
    const assetCollection = await collectLocalAssetsFromProviders()
    const now = new Date().toISOString()
    let insertedTrends = 0
    let insertedAssets = 0

    const db = await adminStore.mutate((draft) => {
      const trendKeysBefore = new Set(draft.trends.map((trend) => `${trend.title}|${trend.source_url}`))
      const assetKeysBefore = new Set(draft.localAssets.map((asset) => `${asset.name}|${asset.address || asset.source_url}`))
      const collectedTrends = trendCollection.items.map((trend) => ({
        ...trend,
        collected_at: now,
        embedding: trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
        action_score: scoreTrend(trend),
        surge_score: scoreSurge(trend.raw_payload),
        provenance_label: trend.provenance_label ?? trendCollection.provenance_label,
      }))
      const collectedAssets = assetCollection.items.map((asset) => ({
        ...asset,
        embedding: asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
        provenance_label: asset.provenance_label ?? assetCollection.provenance_label,
      }))
      draft.trends = dedupeBy([...collectedTrends, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.localAssets = dedupeBy([...collectedAssets, ...draft.localAssets], (asset) => `${asset.name}|${asset.address || asset.source_url}`)
      insertedTrends = draft.trends.filter((trend) => !trendKeysBefore.has(`${trend.title}|${trend.source_url}`)).length
      insertedAssets = draft.localAssets.filter((asset) => !assetKeysBefore.has(`${asset.name}|${asset.address || asset.source_url}`)).length

      draft.trends.slice(0, 10).forEach((trend, index) => {
        const raw = (trend.raw_payload ?? {}) as Record<string, unknown>
        const viewBump = 1200 + ((Date.now() + index * 997) % 7400)
        trend.raw_payload = {
          ...raw,
          views_24h: Number(raw.views_24h ?? 0) + viewBump,
          saves: Number(raw.saves ?? 0) + Math.round(viewBump * 0.035),
          comments: Number(raw.comments ?? 0) + Math.round(viewBump * 0.008),
          frequency: Math.min(100, Number(raw.frequency ?? 64) + 1),
          last_cycle_at: now,
        }
        trend.collected_at = now
        trend.action_score = scoreTrend(trend)
        trend.surge_score = scoreSurge(trend.raw_payload)
      })
      draft.trendClusters = clusterTrends(draft.trends)

      const periodEnd = now
      const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
      draft.analyticsSnapshots.unshift(calculateAnalyticsSnapshot(draft.userEvents, periodStart, periodEnd))
      draft.analyticsSnapshots = draft.analyticsSnapshots.slice(0, 40)

      const aiRun: AiRun = {
        id: id('airun'),
        module_name: 'continuousCollectionCycle',
        model_name: 'provider-interface+rules',
        prompt_version: 'collect_cycle_v1',
        input_ref_type: 'admin_cycle',
        input_ref_id: now,
        input_json: {
          providers: [trendCollection.provider, assetCollection.provider],
          trend_provenance: trendCollection.provenance_label,
          asset_provenance: assetCollection.provenance_label,
        },
        output_json: {
          inserted_trends: insertedTrends,
          inserted_assets: insertedAssets,
          scored_trends: Math.min(10, draft.trends.length),
          clusters: draft.trendClusters.length,
          note: 'Lightweight loop: no autonomous publish, email, or report confirmation.',
        },
        confidence: 0.78,
        latency_ms: Date.now() - started,
        token_usage_json: { llm_tokens: 0, reason: 'collection cycle does not call LLM' },
        cost_estimate: 0,
        status: 'success',
        human_override: false,
        created_at: now,
        provenance_label: trendCollection.provenance_label === 'real_api' || assetCollection.provenance_label === 'real_api' ? 'real_api' : 'derived',
      }
      draft.aiRuns.unshift(aiRun)
      draft.aiRuns = draft.aiRuns.slice(0, 120)
    })

    res.json({
      ok: true,
      cycle: {
        inserted_trends: insertedTrends,
        inserted_assets: insertedAssets,
        trends: db.trends.length,
        local_assets: db.localAssets.length,
        clusters: db.trendClusters.length,
        ai_runs: db.aiRuns.length,
        collected_at: now,
        provenance_label: trendCollection.provenance_label === 'real_api' || assetCollection.provenance_label === 'real_api' ? 'real_api' : 'derived',
      },
    })
  })

  app.post('/api/admin/ai/embed', async (_req, res) => {
    const db = await adminStore.read()
    for (const trend of db.trends) {
      if (!trend.embedding) {
        const result = await embedText(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`)
        trend.embedding = result.embedding
        trend.provenance_label = result.provenance_label === 'real_api' ? 'real_api' : trend.provenance_label
      }
    }
    for (const asset of db.localAssets) {
      if (!asset.embedding) {
        const result = await embedText(`${asset.name} ${asset.description} ${asset.region_code}`)
        asset.embedding = result.embedding
        asset.provenance_label = result.provenance_label === 'real_api' ? 'real_api' : asset.provenance_label
      }
    }
    await adminStore.write(db)
    res.json({ ok: true, trends: db.trends.length, localAssets: db.localAssets.length })
  })

  app.post('/api/admin/ai/cluster-trends', async (_req, res) => {
    const db = await adminStore.mutate((draft) => {
      draft.trendClusters = clusterTrends(draft.trends)
    })
    res.json({ clusters: db.trendClusters, provenance_label: 'derived' })
  })

  app.post('/api/admin/ai/generate-local-trend-candidates', async (_req, res) => {
    const now = new Date().toISOString()
    const db = await adminStore.read()
    const baseTrends = [...db.trends]
      .sort((a, b) => (b.action_score?.total ?? 0) - (a.action_score?.total ?? 0))
      .slice(0, 5)
    const assets = db.localAssets
      .filter((asset) => ['festival', 'market', 'workshop', 'heritage', 'culture_facility'].includes(asset.asset_type))
      .slice(0, 8)
    const candidates: Trend[] = []
    for (const asset of assets) {
      const base = baseTrends.find((trend) => cosineSimilarity(
        trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description}`),
        asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description}`),
      ) > 0.62) ?? baseTrends[0]
      if (!base) continue
      const title = `${base.title} × ${asset.region_code} 문화 연결`
      const trend: Trend = {
        id: id('trend-local'),
        title,
        description: `${base.title} 유행을 ${asset.name}의 지역·전통문화 맥락으로 전환한 사용자 피드 후보입니다. ${asset.description}`,
        source: 'local_culture_trend_generator',
        source_url: `derived://local-culture/${base.id}/${asset.id}`,
        hashtags: Array.from(new Set([...base.hashtags.slice(0, 3), `#${asset.region_code}`, `#${asset.asset_type}`, '#지역문화전환'])),
        category: base.category,
        collected_at: now,
        raw_payload: {
          views_24h: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.views_24h ?? 120000) * 0.18),
          saves: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.saves ?? 3000) * 0.22),
          comments: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.comments ?? 800) * 0.2),
          frequency: 58,
          generated_from_trend_id: base.id,
          linked_local_asset_id: asset.id,
        },
        embedding: deterministicEmbedding(`${title} ${asset.description} ${base.description}`),
        provenance_label: 'derived',
        evidence_refs: [base.id, asset.id, asset.source_url ?? asset.source],
      }
      trend.action_score = scoreTrend(trend)
      trend.surge_score = scoreSurge(trend.raw_payload)
      candidates.push(trend)
    }
    const next = await adminStore.mutate((draft) => {
      draft.trends = dedupeBy([...candidates, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.trendClusters = clusterTrends(draft.trends)
      const aiRun: AiRun = {
        id: id('airun'),
        module_name: 'generateLocalTrendCandidates',
        model_name: 'rules+embedding',
        prompt_version: 'local_trend_candidate_v1',
        input_json: { base_trends: baseTrends.map((trend) => trend.id), local_assets: assets.map((asset) => asset.id) },
        output_json: { generated: candidates.map((trend) => ({ id: trend.id, title: trend.title, source_url: trend.source_url })) },
        confidence: 0.74,
        latency_ms: 0,
        token_usage_json: { llm_tokens: 0, reason: 'derived local culture candidate generator' },
        cost_estimate: 0,
        status: 'success',
        human_override: false,
        created_at: now,
        provenance_label: 'derived',
      }
      draft.aiRuns.unshift(aiRun)
    })
    res.json({ generated: candidates.length, candidates, recommendations: buildUserFeedRecommendations(next).slice(0, 8), provenance_label: 'derived' })
  })

  app.post('/api/admin/ai/generate-trend-context', async (req, res) => {
    const db = await adminStore.read()
    const trend = db.trends.find((item) => item.id === req.body?.trend_id) ?? db.trends[0]
    if (!trend) return res.status(404).json({ error: 'trend not found' })
    const result = await generateTrendContext(trend)
    res.json(result)
  })

  app.post('/api/admin/ai/briefing', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const analytics = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const result = await generateAdminBriefing({
      analytics,
      topTrends: db.trends.slice(0, 5),
      pendingChallenges: db.challenges.filter((challenge) => challenge.status === 'needs_review').slice(0, 5),
      riskAlerts: db.safetyReviews.filter((review) => review.risk_level !== 'low').slice(0, 5),
      localMatches: db.localMatches.slice(0, 5),
    })
    res.json({ briefing: result.data, aiRun: result.aiRun })
  })

  app.post('/api/admin/ai/generate-challenge', async (req, res) => {
    const db = await adminStore.read()
    const trend = db.trends.find((item) => item.id === req.body?.trend_id) ?? db.trends[0]
    if (!trend) return res.status(404).json({ error: 'trend not found' })
    const context = await generateTrendContext(trend)
    const generated = await generateChallenge(trend, context.data)
    const now = new Date().toISOString()
    const challenge: Challenge = {
      id: id('challenge'),
      trend_id: trend.id,
      title: generated.data.title,
      description: generated.data.description,
      target_age_band: generated.data.target_age_band,
      estimated_cost: generated.data.estimated_cost,
      estimated_minutes: generated.data.estimated_minutes,
      difficulty: generated.data.difficulty,
      materials: generated.data.materials,
      steps: generated.data.steps.map((step, index) => ({ id: `s${index + 1}`, ...step })),
      proof_type: generated.data.proof_type,
      safety_notice: generated.data.safety_notice,
      status: 'needs_review',
      created_by_ai_run_id: generated.aiRun.id,
      created_at: now,
      updated_at: now,
      score_breakdown: scoreTrend(trend),
      provenance_label: generated.aiRun.provenance_label,
    }
    await adminStore.mutate((draft) => {
      draft.challenges.unshift(challenge)
    })
    res.json({ challenge, trendContext: context.data, aiRun: generated.aiRun })
  })

  app.post('/api/admin/ai/run-learning-loop', async (_req, res) => {
    const steps: string[] = []

    const trendCollection = await collectTrendsFromProviders()
    const assetCollection = await collectLocalAssetsFromProviders()
    steps.push(`collected trends: ${trendCollection.items.length} (${trendCollection.provenance_label})`)
    steps.push(`collected local assets: ${assetCollection.items.length} (${assetCollection.provenance_label})`)

    let db = await adminStore.mutate((draft) => {
      const trends = trendCollection.items.map((trend) => ({
        ...trend,
        embedding: trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
        action_score: scoreTrend(trend),
        surge_score: scoreSurge(trend.raw_payload),
        provenance_label: trend.provenance_label ?? trendCollection.provenance_label,
      }))
      const assets = assetCollection.items.map((asset) => ({
        ...asset,
        embedding: asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
        provenance_label: asset.provenance_label ?? assetCollection.provenance_label,
      }))
      draft.trends = dedupeBy([...trends, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.localAssets = dedupeBy([...assets, ...draft.localAssets], (asset) => `${asset.name}|${asset.address || asset.source_url}`)
      draft.trendClusters = clusterTrends(draft.trends)
    })
    steps.push(`clustered trends: ${db.trendClusters.length}`)

    for (const trend of db.trends.slice(0, 3)) {
      if (!trend.embedding || trend.provenance_label !== 'real_api') {
        const embedded = await embedText(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`)
        trend.embedding = embedded.embedding
        if (embedded.provenance_label === 'real_api') trend.provenance_label = 'real_api'
      }
      trend.action_score = scoreTrend(trend)
      trend.surge_score = scoreSurge(trend.raw_payload)
    }
    for (const asset of db.localAssets.slice(0, 12)) {
      if (!asset.embedding || asset.provenance_label !== 'real_api') {
        const embedded = await embedText(`${asset.name} ${asset.description} ${asset.region_code}`)
        asset.embedding = embedded.embedding
        if (embedded.provenance_label === 'real_api') asset.provenance_label = 'real_api'
      }
    }
    await adminStore.write(db)
    steps.push('generated embeddings for top trends/assets')

    const topTrend = db.trends.sort((a, b) => (b.action_score?.total ?? 0) - (a.action_score?.total ?? 0))[0]
    if (!topTrend) return res.status(422).json({ error: 'no trend available after collection', steps })

    const context = await generateTrendContext(topTrend)
    const translations = await translateByGeneration(context.data)
    const generated = await generateChallenge(topTrend, { context: context.data, translations: translations.data })
    const now = new Date().toISOString()
    const challenge: Challenge = {
      id: id('challenge'),
      trend_id: topTrend.id,
      title: generated.data.title,
      description: generated.data.description,
      target_age_band: generated.data.target_age_band,
      estimated_cost: generated.data.estimated_cost,
      estimated_minutes: generated.data.estimated_minutes,
      difficulty: generated.data.difficulty,
      materials: generated.data.materials,
      steps: generated.data.steps.map((step, index) => ({ id: `s${index + 1}`, ...step })),
      proof_type: generated.data.proof_type,
      safety_notice: generated.data.safety_notice,
      status: 'needs_review',
      created_by_ai_run_id: generated.aiRun.id,
      created_at: now,
      updated_at: now,
      score_breakdown: scoreTrend(topTrend),
      provenance_label: generated.aiRun.provenance_label,
      generation_variants: translations.data.variants,
    }
    db = await adminStore.mutate((draft) => {
      draft.challenges.unshift(challenge)
    })
    steps.push(`generated challenge: ${challenge.id}`)

    const heritage = await generateHeritageRemix({ trend: topTrend, challenge, localAssets: db.localAssets.slice(0, 5) })
    const remix = {
      heritage_elements: heritage.data.heritage_elements,
      connection_graph: heritage.data.connection_graph,
      appropriateness_score: scoreHeritageFit({
        semantic: heritage.data.cultural_fit_score,
        respect: 84,
        locality: topTrend.action_score?.factors.find((factor) => factor.key === 'local_connectivity')?.value ?? 70,
        participation: topTrend.action_score?.factors.find((factor) => factor.key === 'proofability')?.value ?? 70,
      }),
      cautions: heritage.data.cautions,
    }
    db = await adminStore.mutate((draft) => {
      const target = draft.challenges.find((item) => item.id === challenge.id)
      if (target) target.heritage_remix = remix
    })
    steps.push('generated heritage remix')

    const safety = await reviewSafety(challenge)
    const review: SafetyReview = {
      id: id('safety'),
      challenge_id: challenge.id,
      risk_level: safety.data.risk_level,
      risk_categories: safety.data.risk_categories,
      flagged_text_spans: safety.data.flagged_text_spans,
      explanation: safety.data.explanation,
      suggested_revision: safety.data.suggested_revision,
      approval_recommendation: safety.data.approval_recommendation,
      reviewer_status: 'needs_review',
      created_by_ai_run_id: safety.aiRun.id,
      created_at: new Date().toISOString(),
    }
    db = await adminStore.mutate((draft) => {
      draft.safetyReviews.unshift(review)
    })
    steps.push(`safety reviewed: ${review.risk_level}`)

    const matches: LocalMatch[] = []
    const profiledAssets = db.localAssets
      .map((asset) => ({ asset, profiled: scoreProfiledLocalMatch(topTrend, asset, challenge) }))
      .filter(({ profiled }) => !profiled.hardReject && profiled.score.total >= 55)
      .sort((a, b) => b.profiled.score.total - a.profiled.score.total)
      .slice(0, 8)
    for (const { asset, profiled } of profiledAssets) {
      const score = profiled.score
      const explanation = await generateLocalMatchExplanation(topTrend, challenge, asset, score)
      matches.push({
        id: id('match'),
        trend_id: topTrend.id,
        challenge_id: challenge.id,
        local_asset_id: asset.id,
        match_score: score.total,
        semantic_similarity: score.factors[0].value,
        accessibility_score: score.factors[1].value,
        schedule_score: score.factors[2].value,
        difficulty_score: score.factors[3].value,
        proof_score: score.factors[4].value,
        explanation: `${profiled.reasons.slice(0, 2).join(' / ')} ${explanation.data.explanation}`,
        created_at: new Date().toISOString(),
        score_breakdown: score,
        created_by_ai_run_id: explanation.aiRun.id,
      })
    }
    matches.sort((a, b) => b.match_score - a.match_score)
    db = await adminStore.mutate((draft) => {
      draft.localMatches = dedupeBy([...matches, ...draft.localMatches], (match) => `${match.challenge_id}|${match.local_asset_id}`)
    })
    steps.push(`matched local assets: ${matches.length}`)

    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const snapshot = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const diagnosis = await generateAnalyticsDiagnosis({
      metrics: snapshot,
      doctorTargets: findChallengeDoctorTargets(db.userEvents),
      latestChallenge: challenge,
      latestMatches: matches.slice(0, 3),
    })
    db = await adminStore.mutate((draft) => {
      draft.analyticsSnapshots.unshift(snapshot)
    })
    steps.push('analytics snapshot + diagnosis generated')

    res.json({
      ok: true,
      steps,
      challenge,
      safetyReview: review,
      heritageRemix: remix,
      matches: matches.slice(0, 5),
      diagnosis: diagnosis.data,
      provenance_label: generated.aiRun.provenance_label,
      ai_run_ids: [context.aiRun.id, translations.aiRun.id, generated.aiRun.id, heritage.aiRun.id, safety.aiRun.id, diagnosis.aiRun.id],
    })
  })

  app.post('/api/admin/ai/generate-experience-card', async (req, res) => {
    const db = await adminStore.read()
    const regionCode = String(req.body?.region_code ?? 'jeonju')
    const region = buildRegionIntelligence(db, buildUserFeedRecommendations(db)).find((item) => item.region_code === regionCode)
    const selected_trends: string[] = Array.isArray(req.body?.selected_trends)
      ? req.body.selected_trends.map((item: unknown) => String(item)).filter(Boolean).slice(0, 3)
      : []
    if (!selected_trends.length) return res.status(400).json({ error: 'selected_trends required' })
    const selectedTrendObjects: Trend[] = selected_trends
      .map((keyword) => {
        const lower = keyword.toLowerCase()
        return db.trends.find((trend) => `${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`.toLowerCase().includes(lower))
          ?? {
            id: id('virtual-trend'),
            title: keyword,
            description: `${keyword} 유행을 실제 행동형 문화 경험으로 전환하기 위한 관리자 선택 키워드입니다.`,
            source: 'admin_generator_selection',
            hashtags: [keyword],
            category: /쿠키|디저트|빵|떡|불닭|냉면|젤리|비빔밥|쭈꾸미|치즈|음식/.test(keyword) ? 'food' : /러닝|챌린지|직관|체험|크루|버터런/.test(keyword) ? 'activity' : /드라마|예능|ott|요리사|환승/.test(keyword) ? 'media' : 'challenge',
            collected_at: new Date().toISOString(),
            raw_payload: {},
            provenance_label: 'derived' as const,
          }
      })
    const regionAssets = db.localAssets.filter((asset) => normalizeAssetRegionCode(asset) === regionCode)
    const candidateMatches = selectedTrendObjects
      .flatMap((trend: Trend) => regionAssets.map((asset) => ({ trend, asset, profiled: scoreProfiledLocalMatch(trend, asset) })))
      .sort((a, b) => b.profiled.score.total - a.profiled.score.total)
    const approvedMatches = candidateMatches
      .filter((item) => !item.profiled.hardReject && item.profiled.score.total >= 58)
      .slice(0, 5)
      .map((item) => ({
        trend_title: item.trend.title,
        local_asset_id: item.asset.id,
        local_asset_name: item.asset.name,
        asset_type: item.asset.asset_type,
        match_score: item.profiled.score.total,
        reasons: item.profiled.reasons,
        score_breakdown: item.profiled.score,
      }))
    const rejectedMatches = candidateMatches
      .filter((item) => item.profiled.hardReject)
      .slice(0, 5)
      .map((item) => ({
        trend_title: item.trend.title,
        local_asset_name: item.asset.name,
        reasons: item.profiled.rejectReasons,
        score: item.profiled.score.total,
      }))
    const strictRegion = {
      ...region,
      assets: approvedMatches.length
        ? approvedMatches.map((match) => {
          const asset = db.localAssets.find((item) => item.id === match.local_asset_id)
          return asset
            ? { id: asset.id, name: asset.name, asset_type: asset.asset_type, provenance_label: asset.provenance_label }
            : { id: match.local_asset_id, name: match.local_asset_name, asset_type: match.asset_type, provenance_label: 'derived' }
        })
        : region?.assets ?? [],
      linked_trends: approvedMatches.map((match) => ({
        trend_id: match.local_asset_id,
        title: `${match.trend_title} × ${match.local_asset_name}`,
        score: match.match_score,
        decision: 'hold',
      })),
    }
    const generated = await generateExperienceCard({
      selected_trends,
      region: strictRegion,
      approved_local_matches: approvedMatches,
      rejected_local_matches: rejectedMatches,
      matching_policy: {
        score_engine: 'profiled_action_place_material_match_v2',
        rule: 'Use only approved_local_matches for concrete places. Never use rejected_local_matches in the card.',
        warning: 'Do not connect food trends to museums/exhibitions unless the asset has food, market, festival, cafe, recipe, or ingredient evidence.',
      },
      user_generations: ['teen', 'adult', 'senior', 'family', 'foreign'],
      generation_policy: {
        teen: 'short, action-first',
        adult: 'practical for 30s/40s',
        senior: 'slow, detailed, avoids slang',
        family: 'role-splitting across generations',
        foreign: 'simple English-friendly explanation',
      },
      no_auto_publish: true,
    })
    res.json({ card: generated.data, aiRun: generated.aiRun, matchContext: { approvedMatches, rejectedMatches } })
  })

  app.post('/api/admin/ops/cultural-conversion-pipeline', async (_req, res) => {
    const started = Date.now()
    const steps: string[] = []
    const trendCollection = await collectTrendsFromProviders()
    const assetCollection = await collectLocalAssetsFromProviders()
    steps.push(`트렌드 수집: ${trendCollection.items.length}건 (${trendCollection.provenance_label})`)
    steps.push(`지역/축제/전통음식 자산 수집: ${assetCollection.items.length}건 (${assetCollection.provenance_label})`)

    let db = await adminStore.mutate((draft) => {
      const trends = trendCollection.items.map((trend) => ({
        ...trend,
        embedding: trend.embedding ?? deterministicEmbedding(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`),
        action_score: scoreTrend(trend),
        surge_score: scoreSurge(trend.raw_payload),
        provenance_label: trend.provenance_label ?? trendCollection.provenance_label,
      }))
      const assets = assetCollection.items.map((asset) => ({
        ...asset,
        embedding: asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
        provenance_label: asset.provenance_label === 'real_api' ? 'real_api' : assetCollection.provenance_label,
      }))
      draft.trends = dedupeBy([...trends, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.localAssets = dedupeBy([...assets, ...draft.localAssets], (asset) => `${asset.name}|${asset.address || asset.source_url}`)
    })

    for (const trend of db.trends.slice(0, 5)) {
      const embedded = trend.embedding?.length
        ? { embedding: trend.embedding, provenance_label: trend.provenance_label }
        : await embedText(`${trend.title} ${trend.description} ${trend.hashtags.join(' ')}`)
      trend.embedding = embedded.embedding
      if (embedded.provenance_label === 'real_api') trend.provenance_label = trend.provenance_label === 'real_api' ? 'real_api' : 'derived'
      trend.action_score = scoreTrend(trend)
      trend.surge_score = scoreSurge(trend.raw_payload)
    }
    for (const asset of db.localAssets.slice(0, 10)) {
      const embedded = asset.embedding?.length
        ? { embedding: asset.embedding, provenance_label: asset.provenance_label }
        : await embedText(`${asset.name} ${asset.description} ${asset.region_code} ${asset.asset_type}`)
      asset.embedding = embedded.embedding
      if (embedded.provenance_label === 'real_api' && asset.provenance_label !== 'mock_data') asset.provenance_label = 'real_api'
    }
    db.trendClusters = clusterTrends(db.trends)
    await adminStore.write(db)
    steps.push(`임베딩/점수/클러스터 갱신: cluster ${db.trendClusters.length}개`)

    const baseTrends = [...db.trends].sort((a, b) => (b.action_score?.total ?? 0) - (a.action_score?.total ?? 0)).slice(0, 4)
    const localCultureAssets = db.localAssets
      .filter((asset) => ['festival', 'market', 'heritage', 'culture_facility'].includes(asset.asset_type))
      .slice(0, 10)
    const generatedCandidates: Trend[] = []
    for (const asset of localCultureAssets.slice(0, 3)) {
      const base = baseTrends.find((trend) => cosineSimilarity(
        trend.embedding ?? deterministicEmbedding(trend.title),
        asset.embedding ?? deterministicEmbedding(asset.name),
      ) > 0.58) ?? baseTrends[0]
      if (!base) continue
      const title = `${base.title} × ${asset.name}`
      const trend: Trend = {
        id: id('trend-ai-local'),
        title,
        description: `${base.title} 유행을 ${asset.region_code} 지역의 ${asset.name} 자산과 연결한 문화 참여형 트렌드 후보입니다. ${asset.description}`,
        source: 'cultural_conversion_pipeline',
        source_url: `derived://pipeline/${base.id}/${asset.id}`,
        hashtags: Array.from(new Set([...base.hashtags.slice(0, 3), `#${asset.region_code}`, `#${asset.asset_type}`, '#보는유행을하는문화로'])),
        category: base.category,
        collected_at: new Date().toISOString(),
        raw_payload: {
          views_24h: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.views_24h ?? 100000) * 0.24),
          saves: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.saves ?? 2500) * 0.3),
          comments: Math.round(Number((base.raw_payload as Record<string, unknown> | undefined)?.comments ?? 700) * 0.25),
          frequency: 72,
          generated_from_trend_id: base.id,
          linked_local_asset_id: asset.id,
        },
        embedding: deterministicEmbedding(`${title} ${base.description} ${asset.description}`),
        provenance_label: 'derived',
        evidence_refs: [base.id, asset.id, asset.source_url ?? asset.source],
      }
      trend.action_score = scoreTrend(trend)
      trend.surge_score = scoreSurge(trend.raw_payload)
      generatedCandidates.push(trend)
    }
    db = await adminStore.mutate((draft) => {
      draft.trends = dedupeBy([...generatedCandidates, ...draft.trends], (trend) => `${trend.title}|${trend.source_url}`)
      draft.trendClusters = clusterTrends(draft.trends)
    })
    steps.push(`지역·전통문화 트렌드 후보 생성: ${generatedCandidates.length}건`)

    const targetTrend = [...generatedCandidates, ...baseTrends].sort((a, b) => (b.action_score?.total ?? 0) - (a.action_score?.total ?? 0))[0]
    if (!targetTrend) return res.status(422).json({ error: 'no target trend', steps })
    const cardPackage = await generateTrendCardPackage({
      trend: targetTrend,
      candidate: buildTrendCandidateAudit(db).find((item) => item.candidate_id === targetTrend.id),
      localAssets: localCultureAssets.slice(0, 5),
    })
    steps.push(
      cardPackage.data.safety_gate.allow_card_generation
        ? `유행 카드/위험 탐지/ToDo 패키지 생성: ${cardPackage.data.safety_gate.risk_level}`
        : `유행 카드 생성 차단: ${cardPackage.data.safety_gate.blocked_reason ?? cardPackage.data.safety_gate.risk_level}`,
    )
    const context = await generateTrendContext(targetTrend)
    const translations = await translateByGeneration(context.data)
    const generated = await generateChallenge(targetTrend, { context: context.data, translations: translations.data, localAssets: localCultureAssets.slice(0, 5) })
    const now = new Date().toISOString()
    const challenge: Challenge = {
      id: id('challenge-pipeline'),
      trend_id: targetTrend.id,
      title: generated.data.title,
      description: generated.data.description,
      target_age_band: generated.data.target_age_band,
      estimated_cost: generated.data.estimated_cost,
      estimated_minutes: generated.data.estimated_minutes,
      difficulty: generated.data.difficulty,
      materials: generated.data.materials,
      steps: generated.data.steps.map((step, index) => ({ id: `s${index + 1}`, ...step })),
      proof_type: generated.data.proof_type,
      safety_notice: generated.data.safety_notice,
      status: 'needs_review',
      created_by_ai_run_id: generated.aiRun.id,
      created_at: now,
      updated_at: now,
      score_breakdown: calculateTrendToActionScore(generated.data.score_inputs),
      provenance_label: generated.aiRun.provenance_label,
      generation_variants: translations.data.variants,
    }
    db = await adminStore.mutate((draft) => {
      draft.challenges.unshift(challenge)
    })
    steps.push(`LLM 챌린지/세대별 번역 생성: ${challenge.id}`)

    const safety = await reviewSafety(challenge)
    const review: SafetyReview = {
      id: id('safety-pipeline'),
      challenge_id: challenge.id,
      risk_level: safety.data.risk_level,
      risk_categories: safety.data.risk_categories,
      flagged_text_spans: safety.data.flagged_text_spans,
      explanation: safety.data.explanation,
      suggested_revision: safety.data.suggested_revision,
      approval_recommendation: safety.data.approval_recommendation,
      reviewer_status: 'needs_review',
      created_by_ai_run_id: safety.aiRun.id,
      created_at: new Date().toISOString(),
    }
    db = await adminStore.mutate((draft) => {
      draft.safetyReviews.unshift(review)
    })
    steps.push(`Safety Gate 검수: ${review.risk_level}`)

    const matches: LocalMatch[] = []
    const profiledAssets = localCultureAssets
      .map((asset) => ({ asset, profiled: scoreProfiledLocalMatch(targetTrend, asset, challenge) }))
      .filter(({ profiled }) => !profiled.hardReject && profiled.score.total >= 55)
      .sort((a, b) => b.profiled.score.total - a.profiled.score.total)
      .slice(0, 6)
    for (const { asset, profiled } of profiledAssets) {
      const score = profiled.score
      const explanation = await generateLocalMatchExplanation(targetTrend, challenge, asset, score)
      matches.push({
        id: id('match-pipeline'),
        trend_id: targetTrend.id,
        challenge_id: challenge.id,
        local_asset_id: asset.id,
        match_score: score.total,
        semantic_similarity: score.factors[0].value,
        accessibility_score: score.factors[1].value,
        schedule_score: score.factors[2].value,
        difficulty_score: score.factors[3].value,
        proof_score: score.factors[4].value,
        explanation: `${profiled.reasons.slice(0, 2).join(' / ')} ${explanation.data.explanation}`,
        created_at: new Date().toISOString(),
        score_breakdown: score,
        created_by_ai_run_id: explanation.aiRun.id,
      })
    }
    matches.sort((a, b) => b.match_score - a.match_score)
    db = await adminStore.mutate((draft) => {
      draft.localMatches = dedupeBy([...matches, ...draft.localMatches], (match) => `${match.challenge_id}|${match.local_asset_id}`)
      const aiRun: AiRun = {
        id: id('airun-pipeline'),
        module_name: 'culturalConversionPipeline',
        model_name: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
        prompt_version: 'cultural_conversion_pipeline_v1',
        input_json: { trend_provider: trendCollection.provider, asset_provider: assetCollection.provider, target_trend_id: targetTrend.id },
        output_json: { steps, generated_candidates: generatedCandidates.length, card_generation_allowed: cardPackage.data.safety_gate.allow_card_generation, challenge_id: challenge.id, safety: review.risk_level, matches: matches.length },
        confidence: 0.82,
        latency_ms: Date.now() - started,
        token_usage_json: { note: 'See child AiRuns for LLM token usage.' },
        cost_estimate: 0,
        status: 'success',
        human_override: false,
        created_at: new Date().toISOString(),
        provenance_label: generated.aiRun.provenance_label === 'real_api' || trendCollection.provenance_label === 'real_api' || assetCollection.provenance_label === 'real_api' ? 'real_api' : 'derived',
      }
      draft.aiRuns.unshift(aiRun)
    })
    steps.push(`지역 매칭 및 사용자 피드 추천 갱신: ${matches.length}건`)

    res.json({
      ok: true,
      steps,
      targetTrend,
      cardPackage: cardPackage.data,
      challenge,
      safetyReview: review,
      matches: matches.slice(0, 5),
      recommendations: buildUserFeedRecommendations(db).slice(0, 8),
      provenance_label: generated.aiRun.provenance_label === 'real_api' || trendCollection.provenance_label === 'real_api' || assetCollection.provenance_label === 'real_api' ? 'real_api' : 'derived',
    })
  })

  app.post('/api/admin/ai/translate-by-generation', async (req, res) => {
    const db = await adminStore.read()
    const trend = db.trends.find((item) => item.id === req.body?.trend_id) ?? db.trends[0]
    if (!trend) return res.status(404).json({ error: 'trend not found' })
    const context = await generateTrendContext(trend)
    const result = await translateByGeneration(context.data)
    res.json({ translations: result.data, trendContext: context.data, aiRun: result.aiRun })
  })

  app.post('/api/admin/ai/heritage-remix', async (req, res) => {
    const db = await adminStore.read()
    const challenge = db.challenges.find((item) => item.id === req.body?.challenge_id) ?? db.challenges[0]
    const trend = db.trends.find((item) => item.id === (req.body?.trend_id ?? challenge?.trend_id)) ?? db.trends[0]
    if (!challenge || !trend) return res.status(404).json({ error: 'challenge or trend not found' })
    const result = await generateHeritageRemix({ trend, challenge, localAssets: db.localAssets.slice(0, 5) })
    const remix = {
      heritage_elements: result.data.heritage_elements,
      connection_graph: result.data.connection_graph,
      appropriateness_score: scoreHeritageFit({
        semantic: result.data.cultural_fit_score,
        respect: 84,
        locality: trend.action_score?.factors.find((factor) => factor.key === 'local_connectivity')?.value ?? 70,
        participation: trend.action_score?.factors.find((factor) => factor.key === 'proofability')?.value ?? 70,
      }),
      cautions: result.data.cautions,
    }
    await adminStore.mutate((draft) => {
      const target = draft.challenges.find((item) => item.id === challenge.id)
      if (target) target.heritage_remix = remix
    })
    res.json({ remix, aiRun: result.aiRun })
  })

  app.post('/api/admin/ai/review-safety', async (req, res) => {
    const db = await adminStore.read()
    const challenge = db.challenges.find((item) => item.id === req.body?.challenge_id) ?? db.challenges[0]
    if (!challenge) return res.status(404).json({ error: 'challenge not found' })
    const result = await reviewSafety(challenge)
    const review: SafetyReview = {
      id: id('safety'),
      challenge_id: challenge.id,
      risk_level: result.data.risk_level,
      risk_categories: result.data.risk_categories,
      flagged_text_spans: result.data.flagged_text_spans,
      explanation: result.data.explanation,
      suggested_revision: result.data.suggested_revision,
      approval_recommendation: result.data.approval_recommendation,
      reviewer_status: 'needs_review',
      created_by_ai_run_id: result.aiRun.id,
      created_at: new Date().toISOString(),
    }
    await adminStore.mutate((draft) => {
      draft.safetyReviews.unshift(review)
    })
    res.json({ review, aiRun: result.aiRun })
  })

  app.post('/api/admin/ai/match-local-assets', async (req, res) => {
    const db = await adminStore.read()
    const challenge = db.challenges.find((item) => item.id === req.body?.challenge_id) ?? db.challenges[0]
    const trend = db.trends.find((item) => item.id === (req.body?.trend_id ?? challenge?.trend_id)) ?? db.trends[0]
    if (!challenge || !trend) return res.status(404).json({ error: 'challenge or trend not found' })
    const matches: LocalMatch[] = []
    const rejected: Array<{ local_asset_id: string; name: string; reasons: string[]; score: number }> = []
    const candidateAssets = db.localAssets
      .map((asset) => ({ asset, profiled: scoreProfiledLocalMatch(trend, asset, challenge) }))
      .sort((a, b) => b.profiled.score.total - a.profiled.score.total)
    for (const { asset, profiled } of candidateAssets) {
      if (profiled.hardReject || profiled.score.total < 55) {
        if (rejected.length < 8) {
          rejected.push({
            local_asset_id: asset.id,
            name: asset.name,
            reasons: profiled.rejectReasons.length ? profiled.rejectReasons : ['행동·장소·소재 매칭 점수가 낮습니다.'],
            score: profiled.score.total,
          })
        }
        continue
      }
      if (matches.length >= 10) break
      const score = profiled.score
      const verification = matches.length < 3
        ? await verifyLocalMatch(trend, challenge, asset, score, profiled)
        : null
      if (verification?.data.verdict === 'reject') {
        rejected.push({
          local_asset_id: asset.id,
          name: asset.name,
          reasons: verification.data.missing_evidence.length ? verification.data.missing_evidence : [verification.data.explanation],
          score: score.total,
        })
        continue
      }
      const finalScore = verification?.data.verdict === 'revise' ? clampScore(score.total - 8) : score.total
      matches.push({
        id: id('match'),
        trend_id: trend.id,
        challenge_id: challenge.id,
        local_asset_id: asset.id,
        match_score: finalScore,
        semantic_similarity: score.factors[0].value,
        accessibility_score: score.factors[1].value,
        schedule_score: score.factors[2].value,
        difficulty_score: score.factors[3].value,
        proof_score: score.factors[4].value,
        explanation: [
          verification ? `LLM 검증: ${verification.data.verdict} - ${verification.data.explanation}` : '',
          `규칙 근거: ${profiled.reasons.slice(0, 3).join(' / ')}`,
          profiled.rejectReasons.length ? `주의: ${profiled.rejectReasons.join(' / ')}` : '관리자 검수 후 사용자 앱 지역 연결 카드로 전환할 수 있습니다.',
        ].filter(Boolean).join(' '),
        created_at: new Date().toISOString(),
        score_breakdown: finalScore === score.total ? score : { ...score, total: finalScore },
        created_by_ai_run_id: verification?.aiRun.id,
      })
    }
    matches.sort((a, b) => b.match_score - a.match_score)
    await adminStore.mutate((draft) => {
      draft.localMatches = dedupeBy([...matches, ...draft.localMatches], (match) => `${match.challenge_id}|${match.local_asset_id}`)
    })
    res.json({ matches, rejected, provenance_label: 'derived' })
  })

  app.post('/api/admin/ai/generate-proposal', async (req, res) => {
    const db = await adminStore.read()
    const match = db.localMatches.find((item) => item.id === req.body?.local_match_id) ?? db.localMatches[0]
    if (!match) return res.status(404).json({ error: 'local match not found' })
    const challenge = db.challenges.find((item) => item.id === match.challenge_id)
    const asset = db.localAssets.find((item) => item.id === match.local_asset_id)
    if (!challenge || !asset) return res.status(404).json({ error: 'challenge or local asset not found' })
    const result = await generateProposalEmail(challenge, asset, req.body?.organization_name ?? asset.name)
    const proposal: Proposal = {
      id: id('proposal'),
      local_asset_id: asset.id,
      challenge_id: challenge.id,
      organization_name: req.body?.organization_name ?? asset.name,
      contact_email: asset.contact_email,
      subject: result.data.subject,
      body: result.data.body,
      expected_effects: result.data.expected_effects,
      collaboration_steps: result.data.collaboration_steps,
      required_confirmation: result.data.required_confirmation,
      risk_or_uncertainty: result.data.risk_or_uncertainty,
      status: 'needs_review',
      created_by_ai_run_id: result.aiRun.id,
      created_at: new Date().toISOString(),
    }
    await adminStore.mutate((draft) => {
      draft.proposals.unshift(proposal)
    })
    res.json({ proposal, aiRun: result.aiRun })
  })

  app.get('/api/admin/analytics/summary', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const snapshot = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    await adminStore.mutate((draft) => {
      draft.analyticsSnapshots.unshift(snapshot)
    })
    res.json({ snapshot, doctorTargets: findChallengeDoctorTargets(db.userEvents) })
  })

  app.post('/api/admin/analytics/diagnose', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const metrics = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const result = await generateAnalyticsDiagnosis({ metrics, doctorTargets: findChallengeDoctorTargets(db.userEvents) })
    res.json({ diagnosis: result.data, aiRun: result.aiRun })
  })

  app.post('/api/admin/analytics/simulate-events', async (req, res) => {
    const count = Math.max(10, Math.min(300, Number(req.body?.count ?? 80)))
    const eventPlan = [
      'trend_card_view',
      'trend_card_view',
      'trend_card_view',
      'trend_card_save',
      'challenge_start',
      'challenge_step_complete',
      'challenge_step_complete',
      'challenge_complete',
      'proof_upload',
      'place_click',
      'map_open',
      'drop_off_step',
    ]
    const now = Date.now()
    const events: UserEvent[] = []
    const db = await adminStore.mutate((draft) => {
      const rankedTrends = [...draft.trends].sort((a, b) => (b.surge_score?.total ?? 0) - (a.surge_score?.total ?? 0))
      const challenges = draft.challenges.length ? draft.challenges : []
      const assets = draft.localAssets.length ? draft.localAssets : []
      for (let i = 0; i < count; i += 1) {
        const trend = rankedTrends[i % Math.max(1, rankedTrends.length)]
        const challenge = challenges.find((item) => item.trend_id === trend?.id) ?? challenges[i % Math.max(1, challenges.length)]
        const asset = assets[i % Math.max(1, assets.length)]
        const eventName = eventPlan[i % eventPlan.length]
        const event: UserEvent = {
          id: id('evt-live'),
          event_name: eventName,
          user_id_hash: cryptoHash(`simulated-user-${i % 57}-${trend?.id ?? 'unknown'}`),
          session_id: `sim-session-${Date.now()}-${i % 31}`,
          age_band: (['teen', '20s_30s', '40s_50s', '60_plus', 'family'] as const)[i % 5],
          region_code: (['seoul', 'jeonju', 'busan', 'jeju', 'gangneung', 'gwangju'] as const)[i % 6],
          trend_id: trend?.id,
          challenge_id: challenge?.id,
          local_asset_id: eventName === 'place_click' || eventName === 'map_open' ? asset?.id : undefined,
          step_id: eventName === 'challenge_step_complete' || eventName === 'drop_off_step' ? `s${(i % 3) + 1}` : undefined,
          variant_id: `variant-${(['teen', 'adult', 'family', 'local'] as const)[i % 4]}`,
          timestamp: new Date(now - i * 11 * 60_000).toISOString(),
          metadata: {
            provenance_label: 'mock_data',
            generated_from: 'admin_simulate_events',
            location_verified: eventName === 'proof_upload' && i % 4 === 0,
            user_app_surface: i % 3 === 0 ? 'home_feed' : i % 3 === 1 ? 'trend_todo' : 'local_collab',
          },
        }
        events.push(event)
      }
      draft.userEvents = [...events, ...draft.userEvents]
    })
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const snapshot = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    res.json({ inserted: events.length, provenance_label: 'mock_data', snapshot })
  })

  app.post('/api/admin/reports/generate', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const metrics = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const result = await generateImpactReport({
      metrics,
      topChallenges: db.challenges.slice(0, 5),
      localMatches: db.localMatches.slice(0, 5),
      external_indicator_label: db.localAssets.some((asset) => asset.provenance_label === 'real_api') ? '외부 보조 추세 지표' : 'demo_seed only',
    })
    const report = {
      id: id('report'),
      title: result.data.title,
      period_start: periodStart,
      period_end: periodEnd,
      summary: result.data.summary,
      metrics_json: { metrics, report_metrics: result.data.metrics, public_value_radar: result.data.public_value_radar },
      recommendations: result.data.recommendations,
      html_report: `<article><h1>${result.data.title}</h1><p>${result.data.summary}</p></article>`,
      created_by_ai_run_id: result.aiRun.id,
      created_at: new Date().toISOString(),
    }
    const pdfPath = await writeImpactReportPdf(report)
    ;(report as typeof report & { pdf_url: string }).pdf_url = `/api/admin/reports/${report.id}/pdf`
    await adminStore.mutate((draft) => {
      draft.impactReports.unshift(report)
    })
    res.json({ report, aiRun: result.aiRun, pdfPath })
  })

  app.get('/api/admin/reports/:id/pdf', async (req, res) => {
    res.download(`data/reports/${req.params.id}.pdf`, `${req.params.id}.pdf`)
  })

  app.get('/api/admin/ai-runs', async (_req, res) => {
    const db = await adminStore.read()
    res.json({ aiRuns: db.aiRuns })
  })

  app.get('/api/admin/trend-candidates', async (_req, res) => {
    const db = await adminStore.read()
    res.json({ candidates: buildTrendCandidateAudit(db), roles: buildAdminRoles(), provenance_label: 'derived' })
  })

  app.post('/api/admin/trends/:id/publication-decision', async (req, res) => {
    const status = String(req.body?.status ?? '')
    if (!['approved_for_user_app', 'needs_revision', 'rejected', 'pending_review'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved_for_user_app, needs_revision, rejected, or pending_review' })
    }
    const reviewer_role = String(req.body?.reviewer_role ?? '콘텐츠 관리자')
    const comment = String(req.body?.comment ?? '')
    const decided_at = new Date().toISOString()
    const db = await adminStore.mutate((draft) => {
      const trend = draft.trends.find((item) => item.id === req.params.id)
      if (!trend) return
      const raw = rawObject(trend.raw_payload)
      trend.raw_payload = {
        ...raw,
        admin_review: {
          ...(raw.admin_review && typeof raw.admin_review === 'object' ? raw.admin_review : {}),
          publication_status: status,
          reviewer_role,
          comment,
          decided_at,
          requires_final_admin_approval: status !== 'approved_for_user_app',
        },
      }
      draft.aiRuns.unshift({
        id: id('airun'),
        module_name: 'trendPublicationDecision',
        model_name: 'human-admin-gate',
        prompt_version: 'publication_gate_v1',
        input_ref_type: 'trend',
        input_ref_id: trend.id,
        input_json: { trend_id: trend.id, title: trend.title, reviewer_role, comment },
        output_json: { publication_status: status, no_auto_publish: true },
        confidence: 1,
        latency_ms: 0,
        token_usage_json: { llm_tokens: 0, reason: 'human governance action' },
        cost_estimate: 0,
        status: 'success',
        human_override: true,
        created_at: decided_at,
        provenance_label: 'derived',
      })
    })
    const trend = db.trends.find((item) => item.id === req.params.id)
    if (!trend) return res.status(404).json({ error: 'trend not found' })
    res.json({ trend, candidates: buildTrendCandidateAudit(db), recommendations: buildUserFeedRecommendations(db).slice(0, 8) })
  })

  app.post('/api/admin/trends/:id/generate-card-package', async (req, res) => {
    const db = await adminStore.read()
    const trend = db.trends.find((item) => item.id === req.params.id)
    if (!trend) return res.status(404).json({ error: 'trend not found' })
    const candidate = buildTrendCandidateAudit(db).find((item) => item.candidate_id === trend.id)
    const localAssets = db.localAssets
      .map((asset) => ({ asset, score: scoreTrendAssetFit(trend, asset) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.asset)
    const generated = await generateTrendCardPackage({ trend, candidate, localAssets })
    if (!generated.data.safety_gate.allow_card_generation) {
      return res.json({
        blocked: true,
        trend,
        cardPackage: generated.data,
        aiRun: generated.aiRun,
        message: generated.data.safety_gate.blocked_reason ?? '유해한 요소가 감지되었습니다. 유행 카드 생성을 중단했습니다.',
      })
    }
    const now = new Date().toISOString()
    const challenge: Challenge = {
      id: id('challenge-card'),
      trend_id: trend.id,
      title: generated.data.todo.title,
      description: generated.data.base_card.one_line_summary,
      target_age_band: 'family',
      estimated_cost: generated.data.todo.estimated_cost,
      estimated_minutes: generated.data.todo.estimated_minutes,
      difficulty: generated.data.todo.difficulty,
      materials: generated.data.todo.materials,
      steps: generated.data.todo.steps.map((step, index) => ({ id: `s${index + 1}`, ...step })),
      proof_type: generated.data.todo.proof_type,
      safety_notice: generated.data.todo.safety_notice,
      status: 'needs_review',
      created_by_ai_run_id: generated.aiRun.id,
      created_at: now,
      updated_at: now,
      score_breakdown: scoreTrend(trend),
      provenance_label: generated.aiRun.provenance_label,
      generation_variants: generated.data.audience_cards.map((card) => ({
        age_band: card.audience,
        title: card.card_title,
        hook: card.hook,
        caution: card.tone_caution,
      })),
    }
    const next = await adminStore.mutate((draft) => {
      const target = draft.trends.find((item) => item.id === trend.id)
      if (target) {
        const raw = rawObject(target.raw_payload)
        target.raw_payload = {
          ...raw,
          generated_card_package: generated.data,
          admin_review: {
            ...(raw.admin_review && typeof raw.admin_review === 'object' ? raw.admin_review : {}),
            publication_status: 'pending_review',
            card_generation_status: 'generated_needs_review',
            generated_by_ai_run_id: generated.aiRun.id,
            generated_at: now,
            requires_final_admin_approval: true,
          },
        }
      }
      draft.challenges.unshift(challenge)
      draft.challenges = dedupeBy(draft.challenges, (item) => item.id)
    })
    res.json({
      blocked: false,
      trend: next.trends.find((item) => item.id === trend.id),
      challenge,
      cardPackage: generated.data,
      aiRun: generated.aiRun,
      candidates: buildTrendCandidateAudit(next),
      recommendations: buildUserFeedRecommendations(next).slice(0, 8),
    })
  })

  app.post('/api/admin/challenges/:id/decision', async (req, res) => {
    const status = req.body?.status
    if (!['approved', 'rejected', 'needs_review'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved, rejected, or needs_review' })
    }
    const db = await adminStore.mutate((draft) => {
      const challenge = draft.challenges.find((item) => item.id === req.params.id)
      if (challenge) {
        challenge.status = status
        challenge.updated_at = new Date().toISOString()
      }
      const run = draft.aiRuns.find((item) => item.id === challenge?.created_by_ai_run_id)
      if (run) run.human_override = true
    })
    res.json({ challenge: db.challenges.find((item) => item.id === req.params.id) })
  })

  app.post('/api/admin/proposals/:id/ready', async (req, res) => {
    const db = await adminStore.mutate((draft) => {
      const proposal = draft.proposals.find((item) => item.id === req.params.id)
      if (proposal) proposal.status = 'ready_to_send'
    })
    res.json({ proposal: db.proposals.find((item) => item.id === req.params.id) })
  })
}

function cryptoHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}
