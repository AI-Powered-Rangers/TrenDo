import assert from 'node:assert/strict'
import test from 'node:test'
import { SafetyReviewSchema } from './schemas.js'

test('safety review schema rejects invalid LLM JSON', () => {
  const result = SafetyReviewSchema.safeParse({
    risk_level: 'severe',
    risk_categories: ['privacy'],
    flagged_text_spans: [],
    explanation: 'bad enum should fail',
    suggested_revision: 'revise',
    approval_recommendation: 'approve',
    confidence: 0.5,
  })
  assert.equal(result.success, false)
})
