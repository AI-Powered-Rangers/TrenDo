import type { MapPin, RetentionRecord } from '../types'

export const RETENTION: RetentionRecord[] = [
  {
    challenge_id: 'ch-dujjonku',
    completion_rate: 0.74,
    day7_retention: 0.41,
    day30_retention: 0.18,
    became_hobby: 0.09,
    shared_with_family: 0.62,
    retention_score: 71,
    participants: 232401,
  },
  {
    challenge_id: 'ch-butter-run',
    completion_rate: 0.58,
    day7_retention: 0.46,
    day30_retention: 0.27,
    became_hobby: 0.21,
    shared_with_family: 0.34,
    retention_score: 68,
    participants: 88210,
  },
  {
    challenge_id: 'ch-bomdong',
    completion_rate: 0.81,
    day7_retention: 0.32,
    day30_retention: 0.12,
    became_hobby: 0.06,
    shared_with_family: 0.71,
    retention_score: 64,
    participants: 41203,
  },
  {
    challenge_id: 'ch-baseball-face',
    completion_rate: 0.93,
    day7_retention: 0.18,
    day30_retention: 0.05,
    became_hobby: 0.02,
    shared_with_family: 0.55,
    retention_score: 49,
    participants: 122334,
  },
]

export const PINS: MapPin[] = [
  { region: 'seoul', region_label: '서울', x: 178, y: 200, count: 81223, top_challenge: '쑥 두쫀쿠' },
  { region: 'incheon', region_label: '인천', x: 132, y: 198, count: 18420, top_challenge: '강화 약쑥 두쫀쿠' },
  { region: 'gangneung', region_label: '강릉', x: 296, y: 178, count: 9830, top_challenge: '커피 두쫀쿠' },
  { region: 'daegu', region_label: '대구', x: 280, y: 308, count: 22011, top_challenge: '사과 두쫀쿠' },
  { region: 'jeonju', region_label: '전주', x: 168, y: 348, count: 30192, top_challenge: '흑임자 두쫀쿠' },
  { region: 'gwangju', region_label: '광주', x: 142, y: 392, count: 14550, top_challenge: '봄동 비빔밥' },
  { region: 'busan', region_label: '부산', x: 304, y: 416, count: 27044, top_challenge: '유자 두쫀쿠' },
  { region: 'jeju', region_label: '제주', x: 162, y: 524, count: 12880, top_challenge: '한라봉 두쫀쿠' },
]

export function getRetention(challengeId: string) {
  return RETENTION.find((r) => r.challenge_id === challengeId)
}
