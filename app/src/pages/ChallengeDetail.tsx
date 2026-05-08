import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { findChallenge } from '../data/trends'
import { findRegion } from '../data/regions'
import { GenerationSwitcher } from '../components/GenerationSwitcher'
import { RegionSwitcher } from '../components/RegionSwitcher'
import { TraditionConnection } from '../components/TraditionConnection'
import { ChallengeStepList } from '../components/ChallengeStep'
import { RetentionMeter } from '../components/RetentionMeter'
import { SocialBar } from '../components/SocialBar'
import { CommunityStrip } from '../components/CommunityStrip'
import { SetlogComposer } from '../components/SetlogComposer'
import { useUserPrefs } from '../store/userPrefs'
import { translateTrend } from '../lib/api'
import { getRetention } from '../data/retention'
import { useJoined } from '../lib/social'
import type { ChallengeCard } from '../types'

const difficultyLabel: Record<string, string> = { easy: '쉬움', medium: '중간', hard: '도전' }

export function ChallengeDetail() {
  const { id = '' } = useParams()
  const [search] = useSearchParams()
  const seed = search.get('seed') ?? ''
  const [prefs, setPrefs] = useUserPrefs()
  const base = useMemo(() => findChallenge(id), [id])
  const [card, setCard] = useState<ChallengeCard | null>(base ?? null)
  const [translating, setTranslating] = useState(false)
  const [rationale, setRationale] = useState<string[] | null>(null)
  const [completed, setCompleted] = useState(false)
  const [showSetlog, setShowSetlog] = useState(false)
  const [, , hasJoined] = useJoined()

  useEffect(() => {
    setCard(base ?? null)
    setRationale(null)
  }, [base])

  if (!card) {
    return (
      <div className="px-6 py-12 text-center text-ink-300">
        챌린지를 찾을 수 없어요.{' '}
        <Link to="/" className="font-bold text-coral-500">
          피드로 돌아가기
        </Link>
      </div>
    )
  }

  const genVariant =
    card.generation_variants.find((v) => v.generation === prefs.generation) ??
    card.generation_variants[0]
  const region = findRegion(prefs.region)
  const localVariant = card.local_variants.find((v) => v.region === prefs.region)
  const retention = getRetention(base?.id ?? '')
  const joined = hasJoined(base?.id ?? '')

  const onTranslate = async () => {
    setTranslating(true)
    try {
      const r = await translateTrend({
        trend: seed || card.trend_source,
        generation: prefs.generation,
        region: prefs.region,
        base_challenge_id: base?.id,
      })
      setCard(r.challenge)
      setRationale(r.rationale)
    } finally {
      setTranslating(false)
    }
  }

  return (
    <div>
      <div className={`relative bg-gradient-to-br ${card.cover_gradient} pb-8 pt-12 text-white`}>
        <Link
          to="/"
          className="absolute left-4 top-4 rounded-full bg-black/25 px-3 py-1 text-xs"
        >
          ← 피드
        </Link>
        <div className="px-6">
          <div className="text-[11px] font-extrabold tracking-[0.3em] opacity-80">
            {seed ? `입력: ${seed}` : `유행: ${card.trend_source}`}
          </div>
          <h1 className="mt-2 text-3xl font-black leading-tight drop-shadow-md">
            {card.emoji} {genVariant.title}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90">{genVariant.hook}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-black/25 px-2.5 py-1">
              난이도 {difficultyLabel[card.difficulty]}
            </span>
            <span className="rounded-full bg-black/25 px-2.5 py-1">
              ⏱ {card.duration_minutes}분
            </span>
            <span className="rounded-full bg-black/25 px-2.5 py-1">톤 · {genVariant.tone_note}</span>
          </div>
        </div>
      </div>

      <div className="-mt-6 space-y-5 px-4">
        <SocialBar challengeId={base?.id ?? card.id} title={card.title} />

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="text-sm font-bold text-ink-700">세대별 번역</h2>
          <p className="mt-1 text-xs text-ink-300">
            같은 챌린지를 4개 세대 언어로 다시 씁니다. 화면 폰트도 함께 바뀌어요.
          </p>
          <GenerationSwitcher
            className="mt-3"
            value={prefs.generation}
            onChange={(g) => setPrefs({ generation: g })}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-ink-700">지역 재해석</h2>
            <span className="text-[11px] text-ink-300">
              {region.label} · {region.short}
            </span>
          </div>
          <RegionSwitcher
            className="mt-3"
            value={prefs.region}
            onChange={(r) => setPrefs({ region: r })}
          />
          {localVariant ? (
            <div className="mt-3 rounded-xl bg-coral-50 p-3 text-sm">
              <div className="font-bold text-coral-700">{localVariant.title}</div>
              <div className="mt-1 text-coral-700/80">{localVariant.twist}</div>
              {localVariant.partner_place && (
                <div className="mt-2 text-[11px] text-coral-700/70">
                  연결 장소 · {localVariant.partner_place}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
              이 지역 버전은 아직 준비 중이에요. 다른 지역을 골라 보세요.
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-700">필요한 재료</h2>
            <button
              onClick={onTranslate}
              disabled={translating}
              className="rounded-full bg-ink-700 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-50"
            >
              {translating ? 'AI가 번역 중…' : 'AI로 다시 번역'}
            </button>
          </div>
          {rationale && (
            <ul className="mt-2 space-y-1 rounded-xl bg-ink-50 p-2 text-[11px] text-ink-500">
              {rationale.map((r, i) => (
                <li key={i}>· {r}</li>
              ))}
            </ul>
          )}
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {card.materials.map((m) => (
              <li key={m.name} className="rounded-xl bg-ink-50 p-3">
                <div className="text-sm font-bold text-ink-700">{m.name}</div>
                <div className="text-[11px] text-ink-300">{m.amount}</div>
                {m.buyLink && (
                  <a
                    href={m.buyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[11px] font-semibold text-coral-600"
                  >
                    구매 링크
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <ChallengeStepList steps={card.steps} />
          <button
            onClick={() => {
              setCompleted(true)
              setShowSetlog(true)
            }}
            disabled={completed}
            className="mt-4 w-full rounded-2xl bg-coral-500 py-3 text-sm font-bold text-white shadow-card active:bg-coral-600 disabled:opacity-60"
          >
            {completed ? '완료 체크 됨 🎉' : '챌린지 완료 체크'}
          </button>
          {joined && !completed && (
            <p className="mt-2 text-center text-[11px] text-coral-600">
              참여중 · 완료 체크 시 셋로그에도 자동 기록할 수 있어요
            </p>
          )}
        </section>

        {showSetlog && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-bold text-ink-700">
              오늘 한 일을 셋로그에 남길까요?
            </h2>
            <SetlogComposer onClose={() => setShowSetlog(false)} />
          </section>
        )}

        {card.traditional_connection && <TraditionConnection conn={card.traditional_connection} />}

        {retention && completed && (
          <section className="space-y-2">
            <h2 className="px-1 text-sm font-bold text-ink-700">이번 챌린지의 문화 잔존율</h2>
            <RetentionMeter rec={retention} />
          </section>
        )}

        <CommunityStrip challengeId={base?.id} />

        <Link
          to="/map"
          className="block rounded-2xl bg-ink-700 p-4 text-center text-white shadow-card"
        >
          🗺 전국 어디까지 퍼졌는지 보기
        </Link>
      </div>
    </div>
  )
}
