interface Props {
  show: boolean
  generation: string
  region: string
}

const STAGES = [
  '입력 신호 토큰화',
  '세대 톤 정책 적용',
  '지역 컨텍스트 결합',
  '전통 연결 검색',
  '안전·예의 가드레일 통과',
]

export function AITranslating({ show, generation, region }: Props) {
  if (!show) return null
  return (
    <div className="relative overflow-hidden rounded-[24px] aurora-mesh p-5 text-white shadow-card">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-800/60" />

      <div className="relative flex items-center gap-5">
        {/* orb */}
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full ai-orb" />
          <div className="absolute inset-2 rounded-full bg-ink-800/70 backdrop-blur" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>

          {/* orbiting tokens */}
          <span className="ai-token" style={{ ['--tx' as any]: '34px', ['--ty' as any]: '-22px' }} />
          <span className="ai-token ai-token-2" style={{ ['--tx' as any]: '-32px', ['--ty' as any]: '-20px' }} />
          <span className="ai-token ai-token-3" style={{ ['--tx' as any]: '-30px', ['--ty' as any]: '28px' }} />
          <span className="ai-token ai-token-4" style={{ ['--tx' as any]: '34px', ['--ty' as any]: '24px' }} />
          <span className="ai-token ai-token-5" style={{ ['--tx' as any]: '0px', ['--ty' as any]: '-40px' }} />
          <span className="ai-token ai-token-6" style={{ ['--tx' as any]: '0px', ['--ty' as any]: '40px' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-coral-200">
            AI Translating
          </div>
          <div className="mt-1 break-keep text-base font-black">
            {generation} · {region} 버전 다시 만들고 있어요
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/70">
            6피처 가중치를 같은 방식으로 다시 계산하고, 톤·지역·전통 근거를 동시에 묶고 있습니다.
          </p>
        </div>
      </div>

      {/* stages */}
      <ul className="relative mt-4 grid grid-cols-5 gap-1.5">
        {STAGES.map((s, i) => (
          <li
            key={s}
            className="rounded-xl border border-white/10 bg-white/8 px-2 py-2 text-center backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-coral-200">
              S{i + 1}
            </div>
            <div className="mt-0.5 text-[10px] font-bold leading-tight text-white/80">{s}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
