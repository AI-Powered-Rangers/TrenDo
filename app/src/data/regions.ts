import type { Region } from '../types'

export interface RegionInfo {
  id: Region
  label: string
  short: string
  specialties: string[]
  partner_places: string[]
  x: number
  y: number
}

export const REGIONS: RegionInfo[] = [
  {
    id: 'seoul',
    label: '서울',
    short: '쑥·인사동·전통차',
    specialties: ['쑥', '한과', '전통차'],
    partner_places: ['인사동 쑥 카페', '북촌 한옥 공방'],
    x: 178,
    y: 200,
  },
  {
    id: 'incheon',
    label: '인천',
    short: '강화 약쑥·근대 빵집',
    specialties: ['강화 약쑥', '꽃게'],
    partner_places: ['차이나타운 빵집', '강화 약쑥 농장'],
    x: 132,
    y: 198,
  },
  {
    id: 'gangneung',
    label: '강릉',
    short: '커피·초당두부',
    specialties: ['커피', '초당두부', '오징어'],
    partner_places: ['안목해변 커피거리', '초당두부마을'],
    x: 296,
    y: 178,
  },
  {
    id: 'daegu',
    label: '대구',
    short: '사과·납작만두',
    specialties: ['사과', '납작만두'],
    partner_places: ['김광석 거리', '서문시장'],
    x: 280,
    y: 308,
  },
  {
    id: 'jeonju',
    label: '전주',
    short: '흑임자·한옥마을',
    specialties: ['흑임자', '콩나물', '비빔밥'],
    partner_places: ['전주 한옥마을 공방', '풍남문 시장'],
    x: 168,
    y: 348,
  },
  {
    id: 'gwangju',
    label: '광주',
    short: '무등산·떡갈비',
    specialties: ['무등산 수박', '떡갈비'],
    partner_places: ['양림동 펭귄마을', '1913 송정역시장'],
    x: 142,
    y: 392,
  },
  {
    id: 'busan',
    label: '부산',
    short: '유자·기장 미역',
    specialties: ['유자', '기장 미역', '돼지국밥'],
    partner_places: ['감천문화마을', '기장 유자 농장'],
    x: 304,
    y: 416,
  },
  {
    id: 'jeju',
    label: '제주',
    short: '한라봉·오메기떡',
    specialties: ['한라봉', '오메기떡', '말차'],
    partner_places: ['감귤 농장 체험', '오설록 차밭'],
    x: 162,
    y: 524,
  },
]

export function findRegion(id: Region): RegionInfo {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0]
}
