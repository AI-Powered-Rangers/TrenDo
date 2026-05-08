import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { useUserPrefs } from '../store/userPrefs'
import type { CostRange, Generation, InterestCategory, ParticipationType, Region, TimeBudget } from '../types'

const INTERESTS: { id: InterestCategory; label: string; sub: string }[] = [
  { id: 'food', label: '음식', sub: '간식·레시피' },
  { id: 'tradition', label: '전통문화', sub: '리믹스 맥락' },
  { id: 'family', label: '가족활동', sub: '함께 하기' },
  { id: 'festival', label: '지역축제', sub: '동네 연결' },
  { id: 'photo', label: '인증샷', sub: '사진·표정' },
  { id: 'fitness', label: '운동', sub: '짧은 루틴' },
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

const PARTICIPATION_OPTIONS: { id: ParticipationType; label: string; sub: string }[] = [
  { id: 'solo', label: '혼자', sub: '조용히 기록' },
  { id: 'friends', label: '친구와', sub: '같이 인증' },
  { id: 'family', label: '가족과', sub: '세대 연결' },
  { id: 'local', label: '지역 모임', sub: '동네 공간' },
]

export function Onboarding() {
  const [, setPrefs] = useUserPrefs()
  const [step, setStep] = useState(0)
  const [generation, setGeneration] = useState<Generation>('adult')
  const [region, setRegion] = useState<Region>('seoul')
  const [interests, setInterests] = useState<InterestCategory[]>(['food', 'tradition', 'family'])
  const [timeBudget, setTimeBudget] = useState<TimeBudget>('30m')
  const [costRange, setCostRange] = useState<CostRange>('under10k')
  const [participationType, setParticipationType] = useState<ParticipationType>('family')
  const navigate = useNavigate()

  const finish = () => {
    setPrefs({
      generation,
      region,
      interests,
      time_budget: timeBudget,
      cost_range: costRange,
      participation_type: participationType,
      onboarded: true,
    })
    navigate('/', { replace: true })
  }

  const toggleInterest = (interest: InterestCategory) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }

  const isLast = step === 3

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-coral-50 to-white">
      <header className="px-6 pt-12">
        <div className="text-coral-600 text-xs font-extrabold tracking-[0.3em]">TRENDO</div>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink-700">
          숏폼 유행을 <br /> 온 가족 챌린지로
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          보는 것에서 하는 것으로. 내가 할 수 있는 시간·비용·방식에 맞춰 추천해드릴게요.
        </p>
        <div className="mt-5 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-coral-500' : 'bg-coral-100'}`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        {step === 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-ink-700">어느 세대의 언어로 보여드릴까요?</h2>
            <p className="text-xs text-ink-300">
              같은 챌린지를 세대별 언어·폰트·톤으로 다르게 번역해 드립니다.
            </p>
            <GenerationSwitcher value={generation} onChange={setGeneration} />
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-ink-700">어느 지역과 연결할까요?</h2>
            <p className="text-xs text-ink-300">
              지역 특산물·공방·전통문화를 챌린지 안에 함께 묶어드립니다.
            </p>
            <RegionSwitcher value={region} onChange={setRegion} />
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-ink-700">어떤 유행을 해보고 싶나요?</h2>
            <p className="text-xs text-ink-300">
              관심사를 고르면 인기 유행만이 아니라 지역·전통·가족형 챌린지도 함께 보여드려요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map((item) => {
                const active = interests.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      active
                        ? 'border-coral-500 bg-coral-500 text-white shadow-card'
                        : 'border-ink-100 bg-white text-ink-500'
                    }`}
                  >
                    <div className="text-sm font-black">{item.label}</div>
                    <div className={`mt-0.5 text-[11px] ${active ? 'text-coral-100' : 'text-ink-300'}`}>
                      {item.sub}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-ink-700">실제로 가능한 범위를 알려주세요</h2>
              <p className="mt-1 text-xs text-ink-300">
                TrendDo는 취향보다 먼저 시간·비용·참여 방식을 맞춥니다.
              </p>
            </div>

            <OptionGroup
              title="참여 가능 시간"
              value={timeBudget}
              items={TIME_OPTIONS}
              onChange={(v) => setTimeBudget(v as TimeBudget)}
            />
            <OptionGroup
              title="비용 범위"
              value={costRange}
              items={COST_OPTIONS}
              onChange={(v) => setCostRange(v as CostRange)}
            />

            <div className="space-y-2">
              <h3 className="text-sm font-black text-ink-700">참여 방식</h3>
              <div className="grid grid-cols-2 gap-2">
                {PARTICIPATION_OPTIONS.map((item) => {
                  const active = item.id === participationType
                  return (
                    <button
                      key={item.id}
                      onClick={() => setParticipationType(item.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-ink-700 bg-ink-700 text-white shadow-card'
                          : 'border-ink-100 bg-white text-ink-500'
                      }`}
                    >
                      <div className="text-sm font-black">{item.label}</div>
                      <div className={`mt-0.5 text-[11px] ${active ? 'text-coral-200' : 'text-ink-300'}`}>
                        {item.sub}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="space-y-2 px-6 pb-8">
        {!isLast ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={step === 2 && interests.length === 0}
            className="w-full rounded-2xl bg-coral-500 py-3 text-sm font-bold text-white shadow-card active:bg-coral-600"
          >
            다음
          </button>
        ) : (
          <>
            <button
              onClick={finish}
              className="w-full rounded-2xl bg-coral-500 py-3 text-sm font-bold text-white shadow-card active:bg-coral-600"
            >
              시작하기
            </button>
          </>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-ink-400"
          >
            이전
          </button>
        )}
      </footer>
    </div>
  )
}

function OptionGroup({
  title,
  value,
  items,
  onChange,
}: {
  title: string
  value: string
  items: { id: string; label: string }[]
  onChange: (next: string) => void
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-black text-ink-700">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const active = item.id === value
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`rounded-2xl border px-3 py-2.5 text-sm font-black transition ${
                active
                  ? 'border-coral-500 bg-coral-50 text-coral-600'
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
