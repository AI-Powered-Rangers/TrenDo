import { NavLink, useNavigate } from 'react-router-dom'

const left = [
  { to: '/', label: '피드', icon: '🔥' },
  { to: '/community', label: '커뮤니티', icon: '💬' },
]
const right = [
  { to: '/map', label: '지도', icon: '🗺️' },
  { to: '/me', label: '내 피드', icon: '👤' },
]

export function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 mx-auto max-w-md">
      <div className="m-3 flex items-center gap-1 rounded-2xl border border-ink-100 bg-white/95 px-2 py-2 shadow-card backdrop-blur">
        {left.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} className={navItemClass}>
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => navigate('/setlog')}
          className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral-500 text-2xl text-white shadow-card ring-4 ring-white"
          aria-label="오늘의 셋로그 작성"
        >
          ＋
        </button>

        {right.map((it) => (
          <NavLink key={it.to} to={it.to} className={navItemClass}>
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] ${
    isActive ? 'text-coral-600 font-bold' : 'text-ink-300'
  }`
