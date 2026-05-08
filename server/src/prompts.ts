export interface TranslateRequestBody {
  trend: string
  generation: 'teen' | 'adult' | 'senior' | 'family'
  region: string
  base_challenge_id?: string
}

const GENERATION_TONE: Record<string, string> = {
  teen: '트렌디하고 빠른 언어. 짧은 호흡. "이미 알지? 더 잘 만드는 법"',
  adult: '실용적이고 따뜻한 언어. "주말에 아이랑 같이 해봐요"',
  senior: '친절하고 단계적인 언어. 큰 단위 + 손에 잡히는 비유. "어렵지 않아요. 이것만 있으면 돼요"',
  family: '온 가족이 함께 하는 공동체 언어. 역할 분담을 자연스럽게 제안.',
}

export function buildSystemPrompt(): string {
  return [
    '당신은 한국의 대중문화 유행을 전 세대가 직접 체험할 수 있는 챌린지로 변환하는 전문가입니다.',
    '핵심 철학: 보는 것에서 하는 것으로. 복제가 아니라 번역.',
    '- 세대별 언어와 톤을 정확히 분리해서 사용하세요.',
    '- 지역 특산물·공방·전통문화를 강요 없이 자연스럽게 연결하세요.',
    '- 결과는 반드시 단일 JSON 객체로만 출력하세요. JSON 외의 텍스트, 설명, 코드펜스 금지.',
  ].join('\n')
}

export function buildUserPrompt(input: TranslateRequestBody): string {
  return `입력 유행: ${input.trend}
사용자 세대: ${input.generation} (${GENERATION_TONE[input.generation] ?? ''})
사용자 지역: ${input.region}
${input.base_challenge_id ? `참고 챌린지 ID: ${input.base_challenge_id}` : ''}

다음 스키마의 JSON으로만 답하세요:

{
  "id": "ch-<slug>",
  "title": "<세대 톤이 반영된 챌린지 제목>",
  "trend_source": "${input.trend}",
  "emoji": "<상징 이모지 1개>",
  "cover_gradient": "from-coral-300 via-coral-400 to-coral-600",
  "difficulty": "easy" | "medium" | "hard",
  "duration_minutes": <정수 5~60>,
  "materials": [{"name": "...", "amount": "...", "buyLink": "https://..."}],
  "steps": [{"order": 1, "title": "...", "body": "...", "duration_minutes": 5}],
  "generation_variants": [
    {"generation": "teen", "title": "...", "hook": "...", "tone_note": "..."},
    {"generation": "adult", "title": "...", "hook": "...", "tone_note": "..."},
    {"generation": "senior", "title": "...", "hook": "...", "tone_note": "..."},
    {"generation": "family", "title": "...", "hook": "...", "tone_note": "..."}
  ],
  "local_variants": [
    {"region": "${input.region}", "title": "...", "twist": "...", "partner_place": "..."}
  ],
  "traditional_connection": {"label": "사실 이건 OO의 현대판이에요", "body": "..."}
}

규칙:
- materials는 3~5개. 단계(steps)는 3~5개.
- generation_variants는 4개 세대 모두 채우세요.
- traditional_connection은 강요하지 말고 한국 전통 음식·놀이·세시풍속·공예 중 자연스러운 것 하나로 연결하세요.
- 챌린지의 메인 title과 hook은 반드시 사용자 세대(${input.generation})의 톤으로 작성합니다.`
}
