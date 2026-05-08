import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { useUserPrefs } from '../store/userPrefs'
import type { Generation, Region } from '../types'

export function Onboarding() {
  const [, setPrefs] = useUserPrefs()
  const [step, setStep] = useState(0)
  const [generation, setGeneration] = useState<Generation>('adult')
  const [region, setRegion] = useState<Region>('seoul')
  const navigate = useNavigate()

  const finish = () => {
    setPrefs({ generation, region, onboarded: true })
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-coral-50 to-white">
      <header className="px-6 pt-12">
        <div className="text-coral-600 text-xs font-extrabold tracking-[0.3em]">TRENDO</div>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink-700">
          숏폼 유행을 <br /> 온 가족 챌린지로
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          보는 것에서 하는 것으로. 두쫀쿠가 K푸드가 된 그 순간을, 모든 유행에서.
        </p>
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
      </main>

      <footer className="space-y-2 px-6 pb-8">
        {step === 0 ? (
          <button
            onClick={() => setStep(1)}
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
            <button
              onClick={() => setStep(0)}
              className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-ink-400"
            >
              이전
            </button>
          </>
        )}
      </footer>
    </div>
  )
}
