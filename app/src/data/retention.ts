import type { MapPin, RetentionRecord } from '../types'

export const RETENTION: RetentionRecord[] = [
  {
    challenge_id: 'ch-eton-mess',
    completion_rate: 0.88,
    day7_retention: 0.49,
    day30_retention: 0.21,
    became_hobby: 0.11,
    shared_with_family: 0.66,
    retention_score: 74,
    participants: 184_320,
  },
  {
    challenge_id: 'ch-cookie-strawberry',
    completion_rate: 0.86,
    day7_retention: 0.42,
    day30_retention: 0.18,
    became_hobby: 0.08,
    shared_with_family: 0.71,
    retention_score: 70,
    participants: 296_540,
  },
  {
    challenge_id: 'ch-dujjonku',
    completion_rate: 0.74,
    day7_retention: 0.41,
    day30_retention: 0.18,
    became_hobby: 0.09,
    shared_with_family: 0.62,
    retention_score: 71,
    participants: 232_401,
  },
  {
    challenge_id: 'ch-butter-rice',
    completion_rate: 0.71,
    day7_retention: 0.36,
    day30_retention: 0.21,
    became_hobby: 0.13,
    shared_with_family: 0.68,
    retention_score: 64,
    participants: 121_440,
  },
  {
    challenge_id: 'ch-bomdong',
    completion_rate: 0.81,
    day7_retention: 0.32,
    day30_retention: 0.12,
    became_hobby: 0.06,
    shared_with_family: 0.71,
    retention_score: 64,
    participants: 41_203,
  },
  {
    challenge_id: 'ch-pringles-choco',
    completion_rate: 0.94,
    day7_retention: 0.12,
    day30_retention: 0.03,
    became_hobby: 0.01,
    shared_with_family: 0.31,
    retention_score: 38,
    participants: 22_410,
  },
  {
    challenge_id: 'ch-baseball-face',
    completion_rate: 0.93,
    day7_retention: 0.18,
    day30_retention: 0.05,
    became_hobby: 0.02,
    shared_with_family: 0.55,
    retention_score: 49,
    participants: 122_334,
  },
]

export const PINS: MapPin[] = [
  { region: 'seoul', region_label: '서울', x: 178, y: 200, count: 96_412, top_challenge: '딸기 듬뿍 쿠크다스' },
  { region: 'incheon', region_label: '인천', x: 132, y: 198, count: 21_840, top_challenge: '강화 약쑥 두쫀쿠' },
  { region: 'gangneung', region_label: '강릉', x: 296, y: 178, count: 12_330, top_challenge: '강릉 베리 메스' },
  { region: 'daegu', region_label: '대구', x: 280, y: 308, count: 26_011, top_challenge: '청송 사과 초코블럭' },
  { region: 'jeonju', region_label: '전주', x: 168, y: 348, count: 33_192, top_challenge: '흑임자 두쫀쿠' },
  { region: 'gwangju', region_label: '광주', x: 142, y: 392, count: 16_550, top_challenge: '무화과 메스' },
  { region: 'busan', region_label: '부산', x: 304, y: 416, count: 30_044, top_challenge: '유자 두쫀쿠' },
  { region: 'jeju', region_label: '제주', x: 162, y: 524, count: 18_880, top_challenge: '한라봉 메스' },
]

export function getRetention(challengeId: string) {
  return RETENTION.find((r) => r.challenge_id === challengeId)
}
