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
import { AITranslating } from '../components/AITranslating'
import { CulturalContext } from '../components/CulturalContext'
import { LocalEvents } from '../components/LocalEvents'
import { AIModulesStrip } from '../components/AIModulesStrip'
import { MatchExplain } from '../components/MatchExplain'
import { MatchBadge } from '../components/MatchBadge'
import { BragSheet } from '../components/BragSheet'
import { eventsForChallenge } from '../data/localEvents'
import { matchScore, GEN_GUIDE, REGION_LABEL, GENERATION_LABEL } from '../lib/personalize'
import { TRENDS } from '../data/trends'
import { useUserPrefs } from '../store/userPrefs'
import { translateTrend } from '../lib/api'
import { getRetention } from '../data/retention'
import { useJoined } from '../lib/social'
import type { ChallengeCard } from '../types'

const difficultyLabel: Record<string, string> = { easy: '쉬움', medium: '중간', hard: '도전' }
const generationLabel: Record<string, string> = {
  teen: '10~20대',
  adult: '30·40대',
  senior: '50·60대',
  family: '온 가족',
  foreign: '외국인',
}
const proofOptions = [
  { id: 'photo', label: '사진' },
  { id: 'text', label: '텍스트' },
  { id: 'voice', label: '음성' },
  { id: 'private', label: '비공개 체크' },
]
const visibilityOptions = [
  { id: 'public', label: '공개' },
  { id: 'friends', label: '친구 공개' },
  { id: 'private', label: '비공개' },
]

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
  const [showBrag, setShowBrag] = useState(false)
  const [proofType, setProofType] = useState('private')
  const [visibility, setVisibility] = useState('private')
  const [remixNote, setRemixNote] = useState('')
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

  const trendForCard = useMemo(
    () => TRENDS.find((t) => t.challenge_id === (base?.id ?? card.id)),
    [base?.id, card.id],
  )
  const match = useMemo(
    () => (trendForCard ? matchScore(trendForCard, card, prefs) : null),
    [trendForCard, card, prefs],
  )
  const guide = GEN_GUIDE[prefs.generation]

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
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${card.cover_gradient} pb-10 pt-12 text-white cover-grain`}
      >
        <div className="absolute inset-0 cover-shine" />
        <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -left-12 -bottom-10 h-40 w-40 rounded-full bg-black/20 blur-3xl" />
        <Link
          to="/"
          className="absolute left-4 top-4 z-10 rounded-full bg-black/25 px-3 py-1 text-xs font-bold backdrop-blur"
        >
          ← 피드
        </Link>
        <div className="relative px-6">
          {match && (
            <div className="absolute right-6 top-0 z-10 -translate-y-1/2">
              <MatchBadge score={match.score} size="md" />
            </div>
          )}
          <div className="reveal text-[11px] font-extrabold tracking-[0.3em] opacity-85">
            {seed ? `입력: ${seed}` : `유행: ${card.trend_source}`}
          </div>
          <h1 className="reveal reveal-1 mt-2 text-3xl font-black leading-tight drop-shadow-md">
            <span className="inline-block float-breathe">{card.emoji}</span> {genVariant.title}
          </h1>
          <p className="reveal reveal-2 mt-2 max-w-sm text-sm leading-relaxed text-white/90">
            {genVariant.hook}
          </p>
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

        <AITranslating
          show={translating}
          generation={generationLabel[prefs.generation]}
          region={region.label}
        />

        <section className="rounded-[24px] bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-600">
                Today Version
              </div>
              <h2 className="mt-1 break-keep text-xl font-black text-ink-700">
                {localVariant?.title ?? genVariant.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-400">
              {generationLabel[prefs.generation]} · {region.label}
            </span>
          </div>
          <p className="mt-3 break-keep text-sm leading-relaxed text-ink-400">
            {localVariant?.twist ?? genVariant.hook}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Mini label="시간" value={`${card.duration_minutes}분`} />
            <Mini label="비용" value={card.estimated_cost ?? '변동'} />
            <Mini label="난이도" value={difficultyLabel[card.difficulty]} />
          </div>

          <button
            onClick={onTranslate}
            disabled={translating}
            className="mt-4 w-full rounded-2xl bg-ink-700 py-3 text-sm font-black text-white shadow-card active:bg-ink-800 disabled:opacity-50"
          >
            {translating ? 'AI가 오늘 버전 만드는 중...' : 'AI로 오늘 버전 다시 만들기'}
          </button>

          {rationale && (
            <ul className="mt-3 space-y-1 rounded-2xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-500">
              {rationale.map((r, i) => (
                <li key={i}>· {r}</li>
              ))}
            </ul>
          )}
        </section>

        {match && (
          <MatchExplain
            result={match}
            generationLabel={GENERATION_LABEL[prefs.generation]}
            regionLabel={REGION_LABEL[prefs.region]}
          />
        )}

        {card.cultural_context && <CulturalContext ctx={card.cultural_context} />}

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-black text-ink-700">세대 바꾸기</h2>
            <span className="text-[11px] font-bold text-coral-600">
              {generationLabel[prefs.generation]}
            </span>
          </div>
          <GenerationSwitcher
            className="mt-3"
            value={prefs.generation}
            onChange={(g) => setPrefs({ generation: g })}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-black text-ink-700">내 지역 맛 더하기</h2>
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

        <LocalEvents
          events={eventsForChallenge(base?.id ?? '').filter(
            (e) => e.region === prefs.region,
          )}
          subtitle={`${region.label}의 축제·공방·시장·전시 중 이 챌린지와 직접 연결되는 곳.`}
          empty={`${region.label}에 등록된 행사가 아직 없어요. 지도(/local)에서 다른 지역을 골라 보세요.`}
        />

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-black text-ink-700">Do-It Now 실행 조건</h2>
            <span className="text-[11px] font-bold text-coral-600">안전·예절 포함</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoTile label="장소" value={card.recommended_place ?? '집 또는 가까운 공간'} />
            <InfoTile label="예상 비용" value={card.estimated_cost ?? '준비물에 따라 달라요'} />
          </div>

          <div className="mt-3 space-y-2">
            <Notice tone="safe" label="안전" body={card.safety_note ?? '위험한 행동 없이 멈춘 상태에서 수행해요.'} />
            <Notice tone="manner" label="예절" body={card.etiquette_note ?? '촬영 전 주변 사람과 장소 이용 규칙을 확인해요.'} />
          </div>

          <div className="mt-3 grid gap-2">
            {card.quick_alternative && (
              <InfoLine label="시간이 적다면" value={card.quick_alternative} />
            )}
            {card.low_cost_alternative && (
              <InfoLine label="비용을 줄이면" value={card.low_cost_alternative} />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-ink-700">필요한 재료</h2>
            <span className="text-[11px] font-bold text-ink-300">{card.materials.length}개</span>
          </div>
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
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-black text-ink-700">인증과 공개 범위</h2>
            <span className="text-[11px] text-ink-300">공개 인증은 선택</span>
          </div>
          <div className="mt-3 space-y-3">
            <ChoiceRow
              label="인증 방식"
              value={proofType}
              options={proofOptions}
              onChange={setProofType}
            />
            <ChoiceRow
              label="공개 범위"
              value={visibility}
              options={visibilityOptions}
              onChange={setVisibility}
            />
            <div>
              <label className="text-[11px] font-black text-ink-400">우리 버전 기록</label>
              <input
                value={remixNote}
                onChange={(e) => setRemixNote(e.target.value)}
                placeholder="예: 전주 흑임자로 바꿔서 가족이랑 했어요"
                className="mt-2 w-full rounded-2xl border border-ink-100 bg-ink-50 px-3 py-3 text-sm text-ink-700 outline-none focus:border-coral-300"
              />
            </div>
            <p className="rounded-2xl bg-coral-50 p-3 text-[11px] leading-relaxed text-coral-700">
              TrendDo는 공개 인증을 강제하지 않습니다. 비공개 체크도 개인 문화 로그와 익명 집계에만 반영돼요.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div
            key={prefs.generation}
            className="reveal mb-3 flex items-start gap-3 rounded-2xl bg-coral-50 p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-card">
              {guide.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-coral-600">{guide.title}</div>
              <p className="mt-0.5 break-keep text-[12px] leading-relaxed text-coral-700/85">
                {guide.body}
              </p>
            </div>
          </div>

          <ChallengeStepList steps={card.steps} />
          <button
            onClick={() => {
              setCompleted(true)
              setShowSetlog(true)
              setShowBrag(true)
            }}
            disabled={completed}
            className="mt-4 w-full rounded-2xl bg-coral-500 py-3 text-sm font-bold text-white shadow-card active:bg-coral-600 disabled:opacity-60"
          >
            {completed ? '완료 체크 됨 🎉' : '챌린지 완료 체크'}
          </button>
          {completed && (
            <button
              onClick={() => setShowBrag(true)}
              className="mt-2 w-full rounded-2xl bg-ink-700 py-3 text-sm font-black text-white shadow-card active:bg-ink-800"
            >
              ✨ 오늘의 자랑샷에 한 컷 등록하기
            </button>
          )}
          {joined && !completed && (
            <p className="mt-2 text-center text-[11px] text-coral-600">
              참여중 · 완료 체크 시 셋로그·자랑샷이 함께 열려요
            </p>
          )}
        </section>

        {showBrag && base && (
          <BragSheet
            presetChallengeId={base.id}
            onClose={() => setShowBrag(false)}
          />
        )}

        {showSetlog && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-bold text-ink-700">
              오늘 한 일을 셋로그에 남길까요?
            </h2>
            <SetlogComposer onClose={() => setShowSetlog(false)} />
          </section>
        )}

        {card.traditional_connection && <TraditionConnection conn={card.traditional_connection} />}

        <AIModulesStrip />

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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-ink-50 px-3 py-2">
      <div className="text-[10px] font-bold text-ink-300">{label}</div>
      <div className="mt-0.5 truncate text-sm font-black text-ink-700">{value}</div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 p-3">
      <div className="text-[10px] font-black text-ink-300">{label}</div>
      <div className="mt-1 break-keep text-sm font-bold leading-relaxed text-ink-700">{value}</div>
    </div>
  )
}

function Notice({
  tone,
  label,
  body,
}: {
  tone: 'safe' | 'manner'
  label: string
  body: string
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        tone === 'safe'
          ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
          : 'border-amber-100 bg-amber-50 text-amber-800'
      }`}
    >
      <div className="text-[11px] font-black">{label}</div>
      <p className="mt-1 break-keep text-xs leading-relaxed">{body}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink-100">
      <div className="w-20 shrink-0 text-[11px] font-black text-coral-600">{label}</div>
      <p className="break-keep text-xs leading-relaxed text-ink-500">{value}</p>
    </div>
  )
}

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onChange: (next: string) => void
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black text-ink-400">{label}</div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {options.map((option) => {
          const active = option.id === value
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                active
                  ? 'border-coral-500 bg-coral-500 text-white'
                  : 'border-ink-100 bg-white text-ink-400'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
