import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAnalyticsSnapshot } from './analytics.js'
import type { UserEvent } from './types.js'

function event(event_name: string): UserEvent {
  return {
    id: `${event_name}-${Math.random()}`,
    event_name,
    user_id_hash: 'hash',
    session_id: 'session',
    age_band: 'family',
    region_code: 'seoul',
    timestamp: '2026-05-08T00:00:00.000Z',
    metadata: {},
  }
}

test('calculates funnel metrics and avoids division by zero', () => {
  const snapshot = calculateAnalyticsSnapshot(
    [event('trend_card_view'), event('trend_card_view'), event('challenge_start'), event('challenge_complete')],
    '2026-05-01T00:00:00.000Z',
    '2026-05-09T00:00:00.000Z',
  )
  assert.equal(snapshot.start_rate, 50)
  assert.equal(snapshot.completion_rate, 100)
  assert.equal(snapshot.proof_rate, 0)
  assert.equal(snapshot.place_click_rate, 0)
})

test('returns zero metrics when there are no denominators', () => {
  const snapshot = calculateAnalyticsSnapshot([event('map_open')], '2026-05-01T00:00:00.000Z', '2026-05-09T00:00:00.000Z')
  assert.equal(snapshot.start_rate, 0)
  assert.equal(snapshot.completion_rate, 0)
  assert.equal(snapshot.visit_conversion_rate, 0)
})
