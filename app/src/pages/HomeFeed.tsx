import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRENDS } from '../data/trends'
import { TrendCard } from '../components/TrendCard'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { CommunityStrip } from '../components/CommunityStrip'
import { useUserPrefs } from '../store/userPrefs'
import type { Generation } from '../types'

export function HomeFeed() {
  const [prefs, setPrefs] = useUserPrefs()
  const [filter, setFilter] = useState<Generation>(prefs.generation)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const visible = useMemo(() => {
    return TRENDS.filter((t) => {
      const genOk = t.generations_reached.includes(filter) || filter === 'family'
      const qOk = !query || t.title.includes(query) || t.short_pitch.includes(query)
      return genOk && qOk
    })
  }, [filter, query])

  const submitTrend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const matched = TRENDS.find((t) => t.title.includes(query.trim()))
    if (matched) navigate(`/c/${matched.challenge_id}`)
    else navigate(`/c/ch-dujjonku?seed=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="space-y-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.3em] text-coral-600">TRENDO</div>
          <h1 className="text-2xl font-black text-ink-700">지금 뜨는 유행</h1>
        </div>
        <button
          onClick={() => navigate('/me')}
          className="rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-400"
        >
          내 피드
        </button>
      </header>

      <form onSubmit={submitTrend} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="유행 키워드나 숏폼 URL 붙여넣기"
          className="flex-1 rounded-2xl border border-ink-100 bg-white px-4 py-2.5 text-sm shadow-card outline-none focus:border-coral-300"
        />
        <button
          type="submit"
          className="rounded-2xl bg-ink-700 px-4 py-2.5 text-sm font-bold text-white"
        >
          번역
        </button>
      </form>

      <GenerationSwitcher
        value={filter}
        onChange={(g) => {
          setFilter(g)
          setPrefs({ generation: g })
        }}
      />

      <CommunityStrip />

      <section className="space-y-4">
        <h2 className="px-1 text-sm font-bold text-ink-700">이 세대를 위한 추천</h2>
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-300 shadow-card">
            이 세대 필터에는 아직 유행이 없어요. 다른 세대로 바꿔보세요.
          </div>
        ) : (
          visible.map((t) => <TrendCard key={t.id} trend={t} />)
        )}
      </section>
    </div>
  )
}
