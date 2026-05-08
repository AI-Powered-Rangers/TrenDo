import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateLocalMatchScore, calculateTrendToActionScore, cosineSimilarity } from './scoring.js'

test('calculates local match score with required weights', () => {
  const score = calculateLocalMatchScore({
    semantic_similarity: 100,
    accessibility_score: 80,
    schedule_score: 60,
    difficulty_score: 40,
    proof_score: 20,
  })
  assert.equal(score.total, 67)
  assert.equal(score.factors[0].weight, 0.3)
  assert.equal(score.factors.at(-1)?.weight, 0.15)
})

test('calculates trend-to-action score with required weights', () => {
  const score = calculateTrendToActionScore({
    execution_ease: 80,
    local_connectivity: 70,
    safety_score: 90,
    generation_expandability: 60,
    cost_accessibility: 50,
    proofability: 40,
  })
  assert.equal(score.total, 70)
  assert.equal(score.factors.reduce((sum, factor) => sum + factor.weight, 0).toFixed(2), '1.00')
})

test('cosine similarity handles missing or mismatched embeddings safely', () => {
  assert.equal(cosineSimilarity(undefined, [1, 2]), 0)
  assert.equal(cosineSimilarity([1], [1, 2]), 0)
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1)
})
