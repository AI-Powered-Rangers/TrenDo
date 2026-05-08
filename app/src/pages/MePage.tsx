import { Link } from 'react-router-dom'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { useUserPrefs } from '../store/userPrefs'
import {
  computeStreak,
  useJoined,
  useLikedChallenges,
  useSaved,
  useSetlog,
} from '../lib/social'

export function MePage() {
  const [prefs, setPrefs] = useUserPrefs()
  const [saved] = useSaved()
  const [liked] = useLikedChallenges()
  const [joined] = useJoined()
  const [entries] = useSetlog()
  const streak = computeStreak(entries)

  return (
    <div className="px-4 pt-6">
      <header className="mb-3">
        <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">MY TRENDO</div>
        <h1 className="text-2xl font-black text-ink-700">내 피드</h1>
      </header>

      <section className="mb-4 grid grid-cols-4 gap-2">
        <Stat label="저장" value={saved.size} />
        <Stat label="참여" value={joined.size} />
        <Stat label="좋아요" value={liked.size} />
        <Stat label="셋로그" value={`${streak}일`} hi />
      </section>

      <nav className="mb-4 grid grid-cols-2 gap-2">
        <NavItem to="/saved" emoji="🔖" title="저장한 챌린지" sub={`${saved.size}개`} />
        <NavItem to="/setlog" emoji="📓" title="내 셋로그" sub={`${entries.length}개`} />
        <NavItem to="/retention" emoji="📈" title="문화 잔존율" sub="현실 지속성 점수" />
        <NavItem to="/admin" emoji="🛠" title="AI/XAI 관리자 웹" sub="모델 근거·리스크 관제" hi />
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

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-ink-300">
        데모 모드 · AI 번역은 클라이언트에서 시뮬레이션됩니다. 모든 활동은 이 기기 localStorage에만
        저장돼요.
      </p>
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
