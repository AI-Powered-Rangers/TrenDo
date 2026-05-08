import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TRENDS, findChallenge } from '../data/trends'
import { TrendCard } from '../components/TrendCard'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { CommunityStrip } from '../components/CommunityStrip'
import { TrendFlow } from '../components/TrendFlow'
import { PersonalizedHero } from '../components/PersonalizedHero'
import { HotKeywords } from '../components/HotKeywords'
import { StoryStrip } from '../components/StoryStrip'
import { TrendToDoCard } from '../components/TrendToDoCard'
import { useUserPrefs } from '../store/userPrefs'
import { matchScore } from '../lib/personalize'
import type { Generation, InterestCategory, TrendCardData, UserPrefs } from '../types'

const generationLabel: Record<Generation, string> = {
  teen: '10~20대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
  foreign: '외국인',
}

const timeLabel = { '10m': '10분', '30m': '30분', '1h': '1시간', halfday: '반나절' }
const costLabel = { free: '무료', under5k: '5천 원↓', under10k: '1만 원↓', under30k: '3만 원↓' }
const participationLabel = { solo: '혼자', friends: '친구와', family: '가족과', local: '지역 모임' }

export function HomeFeed() {
  const [prefs, setPrefs] = useUserPrefs()
  const [filter, setFilter] = useState<Generation>(prefs.generation)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const visible = useMemo(() => {
    const filtered = TRENDS.filter((t) => {
      const genOk =
        t.generations_reached.includes(filter) || filter === 'family' || filter === 'foreign'
      const interestOk = matchesInterest(t, prefs.interests)
      const qOk = !query || t.title.includes(query) || t.short_pitch.includes(query)
      return genOk && interestOk && qOk
    })
    const livePrefs: UserPrefs = { ...prefs, generation: filter }
    return filtered
      .map((trend) => {
        const ch = findChallenge(trend.challenge_id)
        const score = ch ? matchScore(trend, ch, livePrefs).score : 50
        return { trend, score }
      })
      .sort((a, b) => b.score - a.score)
  }, [filter, prefs, query])

  const radar = useMemo(() => {
    const byQuery = (trend: TrendCardData) =>
      !query || trend.title.includes(query) || trend.short_pitch.includes(query)
    const livePrefs: UserPrefs = { ...prefs, generation: filter }
    const score = (trend: TrendCardData) => {
      const ch = findChallenge(trend.challenge_id)
      return ch ? matchScore(trend, ch, livePrefs).score : 50
    }
    const filtered = TRENDS.filter(byQuery)
    const decorate = (items: TrendCardData[]) =>
      items
        .map((trend) => ({ trend, score: score(trend) }))
        .sort((a, b) => b.score - a.score)
    return [
      { title: '오늘의 유행', sub: '지금 가장 많이 보는 카드', items: decorate(filtered) },
      {
        title: '지역에서 해보기',
        sub: `${prefs.region} 지역 맥락과 연결되는 챌린지`,
        items: decorate(
          filtered.filter((trend) =>
            findChallenge(trend.challenge_id)?.local_variants.some((v) => v.region === prefs.region),
          ),
        ),
      },
      {
        title: '가족과 하기',
        sub: '세대가 달라도 같이 할 수 있는 버전',
        items: decorate(
          filtered.filter((trend) => {
            const challenge = findChallenge(trend.challenge_id)
            return (
              trend.generations_reached.includes('family') ||
              challenge?.participation_modes?.includes('family')
            )
          }),
        ),
      },
      {
        title: '전통문화 리믹스',
        sub: '유행 속에 전통 맥락을 붙인 카드',
        items: decorate(
          filtered.filter((trend) => !!findChallenge(trend.challenge_id)?.traditional_connection),
        ),
      },
      {
        title: '쉬운 난이도',
        sub: '오늘 바로 시작하기 좋은 챌린지',
        items: decorate(
          filtered.filter((trend) => findChallenge(trend.challenge_id)?.difficulty === 'easy'),
        ),
      },
    ].filter((section) => section.items.length > 0)
  }, [prefs, filter, query])

  const submitTrend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const matched = TRENDS.find((t) => t.title.includes(query.trim()))
    if (matched) navigate(`/c/${matched.challenge_id}`)
    else navigate(`/c/ch-dujjonku?seed=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="space-y-5 px-4 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">TRENDO</div>
          <h1 className="text-2xl font-black text-ink-700">오늘의 챌린지 피드</h1>
        </div>
        <button
          onClick={() => navigate('/me')}
          className="rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-400"
        >
          내 피드
        </button>
      </header>

      <StoryStrip />

      <TrendToDoCard />

      <HotKeywords />

      <PersonalizedHero />

      <section className="rounded-2xl bg-white p-3 shadow-card">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-ink-700">세대 · 지역</h2>
          <span className="rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-bold text-coral-600">
            {generationLabel[filter]} · {prefs.region}
          </span>
        </div>
        <GenerationSwitcher
          value={filter}
          onChange={(g) => {
            setFilter(g)
            setPrefs({ generation: g })
          }}
        />
        <div className="mt-3">
          <RegionSwitcher value={prefs.region} onChange={(r) => setPrefs({ region: r })} />
        </div>
      </section>

      <TrendFlow />

      <section className="space-y-4">
        <h2 className="px-1 text-base font-black text-ink-700">Trend Radar</h2>
        <div className="space-y-5">
          {radar.map((section) => (
            <RadarRail key={section.title} {...section} />
          ))}
        </div>
      </section>

      <CommunityStrip />

      <Link
        to="/local"
        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-xl">
          📍
        </span>
        <span className="flex-1 text-sm font-black text-ink-700">내 주변</span>
        <span className="text-coral-500">→</span>
      </Link>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-base font-black text-ink-700">{generationLabel[filter]} 추천 챌린지</h2>
            <p className="mt-0.5 text-[11px] text-ink-300">지금 바로 해볼 수 있는 유행만 모았어요.</p>
          </div>
          <span className="text-[11px] font-bold text-ink-300">{visible.length}개</span>
        </div>
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
            이 세대 필터에는 아직 유행이 없어요. 다른 세대로 바꿔보세요.
          </div>
        ) : (
          visible.map((entry) => (
            <TrendCard key={entry.trend.id} trend={entry.trend} matchScore={entry.score} />
          ))
        )}
      </section>
    </div>
  )
}

function RadarRail({
  title,
  items,
}: {
  title: string
  sub?: string
  items: { trend: TrendCardData; score: number }[]
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-black text-ink-700">{title}</h3>
        <span className="text-[10px] font-bold text-ink-300">{items.length}</span>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 scrollbar-none">
        {items.map((entry) => (
          <div key={`${title}-${entry.trend.id}`} className="w-[286px] shrink-0">
            <TrendCard trend={entry.trend} matchScore={entry.score} />
          </div>
        ))}
      </div>
    </section>
  )
}

function matchesInterest(trend: TrendCardData, interests: InterestCategory[]) {
  if (interests.length === 0) return true
  const challenge = findChallenge(trend.challenge_id)
  if (interests.includes(trend.category as InterestCategory)) return true
  if (interests.includes('tradition') && challenge?.traditional_connection) return true
  if (interests.includes('family') && challenge?.participation_modes?.includes('family')) return true
  if (interests.includes('festival') && challenge?.participation_modes?.includes('local')) return true
  return false
}
