import { Link } from 'react-router-dom'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { useUserPrefs } from '../store/userPrefs'
import {
  computeStreak,
  useDoneTrends,
  useJoined,
  useLikedChallenges,
  useSaved,
  useSetlog,
} from '../lib/social'
import { TrendToDoCard } from '../components/TrendToDoCard'
import { InsiderLeaderboard } from '../components/InsiderLeaderboard'
import type { CostRange, InterestCategory, ParticipationType, TimeBudget } from '../types'

const INTERESTS: { id: InterestCategory; label: string }[] = [
  { id: 'food', label: '음식' },
  { id: 'tradition', label: '전통문화' },
  { id: 'family', label: '가족활동' },
  { id: 'festival', label: '지역축제' },
  { id: 'photo', label: '인증샷' },
  { id: 'fitness', label: '운동' },
]

const TIME_OPTIONS: { id: TimeBudget; label: string }[] = [
  { id: '10m', label: '10분' },
  { id: '30m', label: '30분' },
  { id: '1h', label: '1시간' },
  { id: 'halfday', label: '반나절' },
]

const COST_OPTIONS: { id: CostRange; label: string }[] = [
  { id: 'free', label: '무료' },
  { id: 'under5k', label: '5천 원 이하' },
  { id: 'under10k', label: '1만 원 이하' },
  { id: 'under30k', label: '3만 원 이하' },
]

const PARTICIPATION_OPTIONS: { id: ParticipationType; label: string }[] = [
  { id: 'solo', label: '혼자' },
  { id: 'friends', label: '친구와' },
  { id: 'family', label: '가족과' },
  { id: 'local', label: '지역 모임' },
]

export function MePage() {
  const [prefs, setPrefs] = useUserPrefs()
  const [saved] = useSaved()
  const [liked] = useLikedChallenges()
  const [joined] = useJoined()
  const [entries] = useSetlog()
  const [done] = useDoneTrends()
  const streak = computeStreak(entries)

  return (
    <div className="px-4 pt-6">
      <header className="mb-3">
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">MY TRENDO</div>
        <h1 className="text-2xl font-black text-ink-700">내 피드</h1>
      </header>

      <section className="mb-4 grid grid-cols-4 gap-2">
        <Stat label="To-Do" value={done.size} hi />
        <Stat label="저장" value={saved.size} />
        <Stat label="참여" value={joined.size} />
        <Stat label="셋로그" value={`${streak}일`} />
      </section>

      <div className="mb-4">
        <TrendToDoCard />
      </div>

      <div className="mb-4">
        <InsiderLeaderboard preview />
      </div>

      <nav className="mb-4 grid grid-cols-2 gap-2">
        <NavItem to="/todo" emoji="📋" title="트렌드 To-Do" sub="이번 달 4카테고리" hi />
        <NavItem to="/saved" emoji="🔖" title="저장한 챌린지" sub={`${saved.size}개`} />
        <NavItem to="/setlog" emoji="📓" title="내 셋로그" sub={`${entries.length}개`} />
        <NavItem to="/local" emoji="📍" title="지역 챌린지" sub="축제·공방·시장·전시 연결" />
        <NavItem to="/retention" emoji="📈" title="문화 잔존율" sub="현실 지속성 점수" />
        <NavItem to="/admin" emoji="🛠" title="AI/XAI 관리자 웹" sub="모델 근거·리스크 관제" />
      </nav>

      <section className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold text-ink-700">세대</h2>
        <p className="text-[11px] text-ink-300">
          모든 챌린지가 즉시 이 세대 톤으로 다시 번역됩니다.
        </p>
        <GenerationSwitcher
          value={prefs.generation}
          onChange={(g) => setPrefs({ generation: g })}
        />
      </section>

      <section className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold text-ink-700">지역</h2>
        <RegionSwitcher value={prefs.region} onChange={(r) => setPrefs({ region: r })} />
      </section>

      <section className="mt-4 space-y-4 rounded-2xl bg-white p-4 shadow-card">
        <div>
          <h2 className="text-sm font-bold text-ink-700">참여 조건</h2>
          <p className="mt-1 text-[11px] text-ink-300">
            추천은 조회수보다 내가 실제로 할 수 있는 시간·비용·방식을 우선해요.
          </p>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-black text-ink-400">관심사</div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => {
              const active = prefs.interests.includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const next = active
                      ? prefs.interests.filter((id) => id !== item.id)
                      : [...prefs.interests, item.id]
                    setPrefs({ interests: next.length ? next : [item.id] })
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    active
                      ? 'border-coral-500 bg-coral-500 text-white'
                      : 'border-ink-100 bg-white text-ink-400'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <PreferenceRow
          label="시간"
          value={prefs.time_budget}
          items={TIME_OPTIONS}
          onChange={(time_budget) => setPrefs({ time_budget: time_budget as TimeBudget })}
        />
        <PreferenceRow
          label="비용"
          value={prefs.cost_range}
          items={COST_OPTIONS}
          onChange={(cost_range) => setPrefs({ cost_range: cost_range as CostRange })}
        />
        <PreferenceRow
          label="방식"
          value={prefs.participation_type}
          items={PARTICIPATION_OPTIONS}
          onChange={(participation_type) =>
            setPrefs({ participation_type: participation_type as ParticipationType })
          }
        />
      </section>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-ink-300">
        데모 모드 · AI 번역은 클라이언트에서 시뮬레이션됩니다. 모든 활동은 이 기기 localStorage에만
        저장돼요.
      </p>
    </div>
  )
}

function PreferenceRow({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: string
  items: { id: string; label: string }[]
  onChange: (next: string) => void
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black text-ink-400">{label}</div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {items.map((item) => {
          const active = item.id === value
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                active
                  ? 'border-ink-700 bg-ink-700 text-white'
                  : 'border-ink-100 bg-white text-ink-400'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, hi = false }: { label: string; value: number | string; hi?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 shadow-card ${
        hi ? 'bg-coral-500 text-white' : 'bg-white text-ink-700'
      }`}
    >
      <div className={`text-[10px] ${hi ? 'text-white/80' : 'text-ink-300'}`}>{label}</div>
      <div className="text-base font-black">{value}</div>
    </div>
  )
}

function NavItem({
  to,
  emoji,
  title,
  sub,
  hi = false,
}: {
  to: string
  emoji: string
  title: string
  sub: string
  hi?: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl p-3 shadow-card ${
        hi ? 'bg-ink-700 text-white' : 'bg-white text-ink-700'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <div className="text-sm font-bold">{title}</div>
        <div className={`text-[11px] ${hi ? 'text-coral-200' : 'text-ink-300'}`}>{sub}</div>
      </div>
      <span className={`${hi ? 'text-coral-200' : 'text-ink-300'}`}>→</span>
    </Link>
  )
}
