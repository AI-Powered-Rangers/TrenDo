import { useState } from 'react'

interface ModuleEntry {
  id: string
  emoji: string
  label: string
  role: string
}

const MODULES: ModuleEntry[] = [
  {
    id: 'cluster',
    emoji: '🧬',
    label: '트렌드 클러스터링',
    role: '비슷한 식감·미학·동작을 묶어 다음 챌린지 후보를 추천합니다.',
  },
  {
    id: 'translator',
    emoji: '🌍',
    label: '세대별 번역',
    role: '같은 챌린지를 10대 / 30·40대 / 50·60대 / 온 가족 / 외국인 톤으로 다시 씁니다.',
  },
  {
    id: 'context',
    emoji: '📚',
    label: '문화 맥락 요약',
    role: '유행의 시작·의미·재미 포인트·주의사항을 4단으로 정리합니다.',
  },
  {
    id: 'planner',
    emoji: '🛠',
    label: 'Do-It Planner',
    role: '재료·시간·비용·난이도·단계로 변환해 실제로 할 수 있게 만듭니다.',
  },
  {
    id: 'local',
    emoji: '📍',
    label: 'Local Remix',
    role: '내 주변 축제·공방·시장·전시와 챌린지를 자동 연결합니다.',
  },
  {
    id: 'tradition',
    emoji: '🪡',
    label: 'Tradition Remix',
    role: '챌린지 안에 전통문화 코드를 강요 없이 연결합니다.',
  },
  {
    id: 'safety',
    emoji: '✅',
    label: '안전성 검토',
    role: '위험·혐오·조롱 요소를 사전 필터링하고 필요한 안전·예의 문구를 붙입니다.',
  },
]

export function AIModulesStrip() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = MODULES.find((m) => m.id === openId)

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-black text-ink-700">이 카드를 만든 AI 모듈</h2>
          <p className="mt-0.5 text-[11px] text-ink-300">
            칩을 누르면 각 모듈이 어떤 역할을 했는지 확인할 수 있어요.
          </p>
        </div>
        <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-bold text-ink-300">
          XAI · 모듈 투명성
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {MODULES.map((m) => {
          const isOpen = openId === m.id
          return (
            <button
              key={m.id}
              onClick={() => setOpenId(isOpen ? null : m.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                isOpen
                  ? 'border-coral-500 bg-coral-500 text-white'
                  : 'border-ink-100 bg-white text-ink-500 hover:border-coral-300'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>

      {open && (
        <div className="reveal mt-3 rounded-xl bg-ink-50 p-3 text-[12px] leading-relaxed text-ink-500">
          <span className="font-bold text-coral-600">{open.emoji} {open.label} · </span>
          {open.role}
        </div>
      )}
    </section>
  )
}
