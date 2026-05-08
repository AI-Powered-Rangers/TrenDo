import type { Express } from 'express'
import {
  embedText,
  generateAdminBriefing,
  generateAnalyticsDiagnosis,
  generateChallenge,
  generateHeritageRemix,
  generateImpactReport,
  generateLocalMatchExplanation,
  generateProposalEmail,
  generateTrendContext,
  reviewSafety,
  translateByGeneration,
} from './aiClient.js'
import { calculateAnalyticsSnapshot, findChallengeDoctorTargets } from './analytics.js'
import { collectLocalAssetsFromProviders, collectTrendsFromProviders } from './providers.js'
import { writeImpactReportPdf } from './pdf.js'
import { calculateLocalMatchScore, cosineSimilarity, deterministicEmbedding, scoreHeritageFit, scoreSurge, scoreTrend } from './scoring.js'
import { adminStore } from './store.js'
import type { Challenge, LocalMatch, Proposal, SafetyReview, TrendCluster } from './types.js'

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
      }
    }
    return item
  }))
}

export function registerAdminRoutes(app: Express) {
  app.get('/api/admin/state', async (_req, res) => {
    const db = await adminStore.read()
    const periodEnd = new Date().toISOString()
    const periodStart = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
    const analytics = calculateAnalyticsSnapshot(db.userEvents, periodStart, periodEnd)
    const hasRealApi = db.trends.some((item) => item.provenance_label === 'real_api') || db.localAssets.some((item) => item.provenance_label === 'real_api')
    res.json({
      ...stripForState(db),
      analytics,
      doctorTargets: findChallengeDoctorTargets(db.userEvents),
      runtime: {
        llm: process.env.OPENAI_API_KEY ? 'real_api' : 'demo_seed',
        dataApis:
          process.env.DATA_GO_KR_API_KEY || process.env.TOUR_API_KEY || process.env.CULTURE_API_KEY
            ? 'configured'
            : 'demo_seed',
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
      provenance_label: result.provenance_label,
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
      provenance_label: result.provenance_label,
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
        provenance_label: trendCollection.provenance_label,
      }))
      const assets = assetCollection.items.map((asset) => ({
        ...asset,
        embedding: asset.embedding ?? deterministicEmbedding(`${asset.name} ${asset.description} ${asset.region_code}`),
        provenance_label: assetCollection.provenance_label,
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
    for (const asset of db.localAssets.slice(0, 8)) {
      const semantic = cosineSimilarity(
        topTrend.embedding ?? deterministicEmbedding(topTrend.title),
        asset.embedding ?? deterministicEmbedding(asset.name),
      ) * 100
      const score = calculateLocalMatchScore({
        semantic_similarity: semantic,
        accessibility_score: asset.latitude && asset.longitude ? 82 : 45,
        schedule_score: asset.start_date && asset.end_date ? 86 : 68,
        difficulty_score: challenge.difficulty === 'easy' ? 88 : challenge.difficulty === 'medium' ? 74 : 58,
        proof_score: /사진|방문|인증/.test(challenge.proof_type) ? 86 : 64,
      })
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
        explanation: explanation.data.explanation,
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
    for (const asset of db.localAssets) {
      const semantic = cosineSimilarity(
        trend.embedding ?? deterministicEmbedding(trend.title),
        asset.embedding ?? deterministicEmbedding(asset.name),
      ) * 100
      const score = calculateLocalMatchScore({
        semantic_similarity: semantic,
        accessibility_score: asset.latitude && asset.longitude ? 82 : 45,
        schedule_score: asset.start_date && asset.end_date ? 86 : 68,
        difficulty_score: challenge.difficulty === 'easy' ? 88 : challenge.difficulty === 'medium' ? 74 : 58,
        proof_score: /사진|방문|인증/.test(challenge.proof_type) ? 86 : 64,
      })
      const explanation = await generateLocalMatchExplanation(trend, challenge, asset, score)
      matches.push({
        id: id('match'),
        trend_id: trend.id,
        challenge_id: challenge.id,
        local_asset_id: asset.id,
        match_score: score.total,
        semantic_similarity: score.factors[0].value,
        accessibility_score: score.factors[1].value,
        schedule_score: score.factors[2].value,
        difficulty_score: score.factors[3].value,
        proof_score: score.factors[4].value,
        explanation: explanation.data.explanation,
        created_at: new Date().toISOString(),
        score_breakdown: score,
        created_by_ai_run_id: explanation.aiRun.id,
      })
    }
    matches.sort((a, b) => b.match_score - a.match_score)
    await adminStore.mutate((draft) => {
      draft.localMatches = dedupeBy([...matches, ...draft.localMatches], (match) => `${match.challenge_id}|${match.local_asset_id}`)
    })
    res.json({ matches, provenance_label: 'derived' })
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
