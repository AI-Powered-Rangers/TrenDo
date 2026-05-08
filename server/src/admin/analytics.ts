import type { AnalyticsSnapshot, UserEvent } from './types.js'

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}

export function calculateAnalyticsSnapshot(events: UserEvent[], periodStart: string, periodEnd: string): AnalyticsSnapshot {
  const inPeriod = events.filter((event) => event.timestamp >= periodStart && event.timestamp <= periodEnd)
  const count = (name: string) => inPeriod.filter((event) => event.event_name === name).length
  const total_views = count('trend_card_view')
  const total_saves = count('trend_card_save')
  const total_starts = count('challenge_start')
  const total_completions = count('challenge_complete')
  const total_proofs = count('proof_upload')
  const total_place_clicks = count('place_click')
  const total_map_opens = count('map_open')
  const locationVerifiedProofs = inPeriod.filter(
    (event) => event.event_name === 'proof_upload' && event.metadata.location_verified === true,
  ).length

  const byAgeBand = inPeriod.reduce<Record<string, number>>((acc, event) => {
    acc[event.age_band] = (acc[event.age_band] ?? 0) + 1
    return acc
  }, {})
  const byRegion = inPeriod.reduce<Record<string, number>>((acc, event) => {
    acc[event.region_code] = (acc[event.region_code] ?? 0) + 1
    return acc
  }, {})
  const stepCounts = inPeriod
    .filter((event) => event.event_name === 'challenge_step_complete' && event.step_id)
    .reduce<Record<string, number>>((acc, event) => {
      acc[event.step_id as string] = (acc[event.step_id as string] ?? 0) + 1
      return acc
    }, {})

  return {
    id: `snap-${Date.now()}`,
    period_start: periodStart,
    period_end: periodEnd,
    total_views,
    total_saves,
    total_starts,
    total_completions,
    total_proofs,
    total_place_clicks,
    total_map_opens,
    start_rate: pct(total_starts, total_views),
    completion_rate: pct(total_completions, total_starts),
    proof_rate: pct(total_proofs, total_completions),
    place_click_rate: pct(total_place_clicks, total_views),
    visit_conversion_rate: pct(locationVerifiedProofs, total_place_clicks),
    map_open_rate: pct(total_map_opens, total_place_clicks),
    segment_breakdown_json: {
      by_age_band: byAgeBand,
      by_region: byRegion,
      step_counts: stepCounts,
      formulas: {
        save_rate: 'trend_card_save / trend_card_view * 100',
        start_rate: 'challenge_start / trend_card_view * 100',
        completion_rate: 'challenge_complete / challenge_start * 100',
        proof_rate: 'proof_upload / challenge_complete * 100',
        place_click_rate: 'place_click / trend_card_view * 100',
        visit_conversion_rate: 'location_verified_proof / place_click * 100',
      },
      save_rate: pct(total_saves, total_views),
      unique_users: new Set(inPeriod.map((event) => event.user_id_hash)).size,
      step_drop_off_rate: Object.fromEntries(
        Object.entries(stepCounts).map(([step, current], index, arr) => {
          const next = arr[index + 1]?.[1] ?? total_completions
          return [step, pct(current - next, current)]
        }),
      ),
    },
    created_at: new Date().toISOString(),
  }
}

export function findChallengeDoctorTargets(events: UserEvent[]) {
  const starts = events.filter((event) => event.event_name === 'challenge_start')
  const completes = events.filter((event) => event.event_name === 'challenge_complete')
  const byChallenge = new Map<string, { starts: number; completes: number; dropOffs: number }>()
  for (const event of starts) {
    if (!event.challenge_id) continue
    byChallenge.set(event.challenge_id, {
      starts: (byChallenge.get(event.challenge_id)?.starts ?? 0) + 1,
      completes: byChallenge.get(event.challenge_id)?.completes ?? 0,
      dropOffs: byChallenge.get(event.challenge_id)?.dropOffs ?? 0,
    })
  }
  for (const event of completes) {
    if (!event.challenge_id) continue
    byChallenge.set(event.challenge_id, {
      starts: byChallenge.get(event.challenge_id)?.starts ?? 0,
      completes: (byChallenge.get(event.challenge_id)?.completes ?? 0) + 1,
      dropOffs: byChallenge.get(event.challenge_id)?.dropOffs ?? 0,
    })
  }
  for (const event of events.filter((candidate) => candidate.event_name === 'drop_off_step')) {
    if (!event.challenge_id) continue
    byChallenge.set(event.challenge_id, {
      starts: byChallenge.get(event.challenge_id)?.starts ?? 0,
      completes: byChallenge.get(event.challenge_id)?.completes ?? 0,
      dropOffs: (byChallenge.get(event.challenge_id)?.dropOffs ?? 0) + 1,
    })
  }

  return Array.from(byChallenge.entries())
    .map(([challenge_id, stats]) => ({
      challenge_id,
      ...stats,
      completion_rate: pct(stats.completes, stats.starts),
      needs_doctor: pct(stats.completes, stats.starts) < 45 || stats.dropOffs > stats.completes,
    }))
    .filter((row) => row.needs_doctor)
}
