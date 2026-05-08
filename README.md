# TrenDo

> 숏폼 유행을 전 세대가 함께 사는 K문화 플랫폼.
> *"보는 것에서 하는 것으로."*

`files/trend_todo_full.md`, `files/claude_code_prompt.md` 사양 기반의 동작 가능한 데모입니다.
**완전 클라이언트 데모** — 외부 API 없이 모든 화면이 동작합니다.

## 실행

```bash
cd app
npm install
npm run dev
# → http://localhost:5173
```

빌드/프리뷰:

```bash
npm run build && npm run preview
```

> `server/` 폴더에는 관리자용 AI 운영 API가 구현되어 있습니다.
> `OPENAI_API_KEY`가 있으면 OpenAI LLM/Embedding을 호출하고, 키가 없으면 모든 생성 결과와 데이터에
> `demo_seed` 배지를 붙여 실행됩니다.

## 관리자 AI 운영 서버

### 실행

```bash
cd server
npm install
cp ../.env.example .env
npm run dev
```

다른 터미널에서 프론트:

```bash
cd app
npm install
npm run dev
```

관리자 화면: `/admin`

### 환경변수

`.env.example`에 다음 키를 제공합니다.

| key | 설명 |
|---|---|
| `OPENAI_API_KEY` | 있으면 실제 LLM/Embedding 호출 |
| `OPENAI_MODEL` | 기본 `gpt-4.1-mini` |
| `OPENAI_EMBEDDING_MODEL` | 기본 `text-embedding-3-small` |
| `DATA_GO_KR_API_KEY`, `TOUR_API_KEY`, `CULTURE_API_KEY` | 공공데이터 fetcher 확장용. 현재는 provider 구조와 demo fallback 제공 |
| `CULTURE_API_URL` | 문화시설/행사 JSON API endpoint. `CULTURE_API_KEY`와 함께 있으면 live culture asset provider 사용 |
| `TREND_RSS_URLS` | 쉼표로 구분한 RSS/Atom 트렌드 소스. 있으면 live trend provider 사용 |
| `TREND_CSV_URL` | `title,description,source_url,hashtags,category,views_24h,saves` 헤더를 가진 CSV URL |
| `YOUTUBE_API_KEY` | 있으면 음식/여행/액티비티/숏츠 소비문화 카테고리별 YouTube 영상 신호를 수집 |
| `INSTAGRAM_ACCESS_TOKEN` | 승인된 Instagram Graph API/hashtag source 연결용. 공개 전체 트렌드 탐색은 공식 API 제약상 기본 비활성 |
| `INSTAGRAM_TREND_CSV_URL` | Instagram/Reels 리서치 결과를 CSV로 연결할 때 사용하는 확장용 URL |
| `KAKAO_MAP_API_KEY`, `VITE_KAKAO_MAP_API_KEY` | 관리자 지도용 Kakao JavaScript 키 |
| `DATABASE_URL` | 있으면 향후 DB 연결 기준. 현재 구현은 로컬 JSON store를 SQLite fallback처럼 사용 |

### demo_seed와 real_api 차이

- `real_api`: `OPENAI_API_KEY`로 실제 OpenAI API 호출에 성공한 LLM/Embedding 결과입니다.
- `demo_seed`: API 키가 없거나 외부 데이터 API가 연결되지 않은 상태의 seed/fallback 데이터입니다.
- `mock_data`: 공공데이터 키는 감지됐지만 provider가 아직 실제 endpoint로 완성되지 않은 경우의 명시적 stub 표시입니다.

트렌드 수집은 검색어 급상승어를 기본값으로 쓰지 않습니다. 기본 루프는 `food`, `travel`, `activity`, `shorts_culture` 카테고리별 YouTube provider를 우선 사용하고, 키가 없으면 같은 카테고리 구조의 `demo_seed`를 표시합니다. `TREND_RSS_URLS`는 뉴스/검색 신호를 보조로 보고 싶을 때만 명시적으로 켭니다.

관리자 UI는 모든 데이터와 AI 결과에 provenance badge를 표시합니다. AI 생성 챌린지, 제안 메일, 리포트는 항상 검수 필요 상태로 시작하며 관리자 승인 없이 공개/발송되지 않습니다.

### 관리자 API

| method | route |
|---|---|
| `GET` | `/api/admin/state` |
| `POST` | `/api/admin/collect/trends` |
| `POST` | `/api/admin/collect/local-assets` |
| `POST` | `/api/admin/ai/embed` |
| `POST` | `/api/admin/ai/cluster-trends` |
| `POST` | `/api/admin/ai/run-learning-loop` |
| `POST` | `/api/admin/ai/generate-trend-context` |
| `POST` | `/api/admin/ai/translate-by-generation` |
| `POST` | `/api/admin/ai/generate-challenge` |
| `POST` | `/api/admin/ai/review-safety` |
| `POST` | `/api/admin/ai/match-local-assets` |
| `POST` | `/api/admin/ai/generate-proposal` |
| `GET` | `/api/admin/analytics/summary` |
| `POST` | `/api/admin/analytics/diagnose` |
| `POST` | `/api/admin/reports/generate` |
| `GET` | `/api/admin/reports/:id/pdf` |
| `GET` | `/api/admin/ai-runs` |

### LLM schema 검증

서버의 [`server/src/admin/schemas.ts`](server/src/admin/schemas.ts)는 Zod schema로 다음 structured output을 검증합니다.

- `TrendContextSchema`
- `GenerationTranslationSchema`
- `ChallengeGenerationSchema`
- `SafetyReviewSchema`
- `LocalMatchExplanationSchema`
- `ProposalEmailSchema`
- `AnalyticsDiagnosisSchema`
- `ImpactReportSchema`

검증 실패 또는 API 키 부재 시 `demo_seed_fallback` 결과를 저장하고 `AiRun.status=fallback`, `provenance_label=demo_seed`로 기록합니다.

### 테스트

```bash
cd server
npm test
```

테스트 범위:

- Local Match Score, Trend-to-Action Score 계산
- analytics metric의 0 나누기 방지
- LLM JSON schema validation 실패 감지

## 구현된 기능

### 핵심 (사양 6개 기능)
- **숏폼 → 챌린지 변환** (`HomeFeed`, `ChallengeDetail`) — 검색창에 키워드 → 챌린지 카드. "AI로 다시 번역" 클릭 시 클라이언트 mock AI가 세대·지역에 맞춰 카드를 즉석 리믹스 + **번역 근거 3줄 표시**(XAI).
- **세대별 번역** — 4개 세대 스위치, 화면 폰트도 세대에 맞춰 조정.
- **지역 재해석** — 8개 지역 + 지역별 변형 (쑥/흑임자/한라봉/유자/커피 두쫀쿠 등).
- **전통문화 자연 삽입** — "사실 이건 OO의 현대판이에요" 접기/펼치기.
- **문화 잔존율** — 0~100 점수 + D+7/D+30/취미化/가족공유 지표.
- **문화 순환 지도** — SVG 한국 지도 + 시간 슬라이더 리플레이.

### 능동 참여 레이어 (이번 추가)
- **셋로그 (Setlog)** `/setlog` — 매일 한 줄 기록, 기분 이모지, 챌린지·자유 태그, **연속 기록 스트릭**. 하단 ＋ 버튼으로 어디서든 작성.
- **저장 / 좋아요 / 참여 / 공유** — 모든 챌린지 카드에 4-버튼 SocialBar. 저장은 [`/saved`](app/src/pages/Saved.tsx)에 누적, 좋아요·참여는 카운터 즉시 반영, 공유는 `navigator.share` → 클립보드 폴백.
- **커뮤니티 피드** `/community` — 다른 가족·세대가 만든 인증 게시물. 인기/최신 + 세대 필터, 게시물 좋아요·공유·"따라하기" 액션. 챌린지 상세에도 미리보기 스트립 포함.
- **내 피드 허브** `/me` — 저장·참여·좋아요·셋로그 스트릭을 한 화면. 잔존율·관리자 콘솔·세대/지역 설정 진입점.

### 관리자용 XAI 콘솔 `/admin`
관리자는 "지금 무엇이 유행이고, **왜** 그런지"를 모델 가중치 수준에서 볼 수 있습니다.

- **트렌드 랭킹** — 6개 피처의 가중합으로 산출한 AI 점수 + 상승/정체/하락 화살표.
- **기여도 분해** — 각 트렌드 행을 펼치면 6개 피처별 가중치(w<sub>i</sub>) × 값(v<sub>i</sub>) 막대. 가장 큰 기여 피처는 코랄로 강조.
- **자연어 설명** — "왜 이 점수인가" + 모델 한계(caveat) — 표본 부족, 절기성 등.
- **클러스터 뷰** — 유행 임베딩 군집, 핵심 노드 챌린지와 성장률.
- **커뮤니티 트렌딩** — 24h 활성 해시태그, 게시물·참여율·세대 균형도 + XAI 한 줄 설명.

피처 6종 (모두 0~100, 가중치 합 1):
| key | weight | 의미 |
|---|---:|---|
| view_growth | 0.18 | 24h 신규 시청 변화율 |
| generation_diversity | 0.22 | 4개 세대 도달의 균형도 |
| region_spread | 0.18 | 8개 지역 중 평균 이상 활동 비율 |
| tradition_link | 0.14 | AI 탐지 유행↔전통 연결 신뢰도 |
| family_share | 0.18 | 가족 단위 공유 비율 |
| retention | 0.10 | 7일 후 재수행 비율 |

> 이 값들은 [`app/src/data/admin.ts`](app/src/data/admin.ts)에 시드되어 있고,
> 실서비스에선 동일 스키마로 백엔드 모델 출력으로 대체할 수 있게 두었습니다.

## 라우트

| 경로 | 화면 |
|---|---|
| `/` | 홈 피드 (트렌드 카드 + 커뮤니티 인기 스트립) |
| `/c/:id` | 챌린지 상세 (세대·지역 번역, SocialBar, 전통, 단계, 잔존율, 커뮤니티) |
| `/community` | 커뮤니티 피드 (인기/최신, 세대 필터) |
| `/setlog` | 셋로그 (오늘의 한 줄 + 스트릭) |
| `/saved` | 저장한 챌린지 |
| `/map` | 문화 순환 지도 |
| `/retention` | 문화 잔존율 |
| `/me` | 내 피드 허브 |
| `/admin` | 관리자 XAI 콘솔 |

## 데이터·상태

- AI 번역: [`app/src/lib/api.ts`](app/src/lib/api.ts) — 클라이언트 시뮬레이션. 외부 호출 없음.
- 사용자 활동(저장·좋아요·참여·셋로그·게시물 좋아요): [`app/src/lib/social.ts`](app/src/lib/social.ts) — `localStorage` 기반, 같은 키를 구독하는 컴포넌트끼리 즉시 동기화.
- 시드: [`app/src/data/`](app/src/data/) — `trends`, `regions`, `community`, `retention`, `admin`.

## 발표 시연 시나리오 (8단계)

1. **홈 피드** → 두바이 쫀득쿠키 카드 클릭. 상단에 "오늘 인기 인증" 가로 스트립도 같이 노출.
2. **세대 50·60대로 전환** → 제목·후크·폰트가 부드럽게 바뀜.
3. **지역 전주로 전환** → "흑임자 두쫀쿠" 변형 + 풍남문 시장 연결.
4. **AI로 다시 번역** 클릭 → 0.9초 후 카드 리믹스 + XAI 근거 3줄.
5. **참여·저장·공유** → SocialBar에서 한 번에. 토스트 즉시 피드백.
6. **단계 체크 모두 완료** → 잔존율 71점 등장 + 셋로그 컴포저 자동 노출 → 한 줄 기록.
7. **커뮤니티** 탭 → 흑임자·한강 버터런 등 다른 가족의 인증 + 따라하기.
8. **관리자(`/admin`)** → 두쫀쿠 #1 행 펼치기 → "가족 공유율 0.18×95 + 세대 다양성 0.22×89가 1위 만든 이유" + 표본 부족 caveat → 커뮤니티 탭에서 #흑임자두쫀쿠 24h 4.2× 상승.

## 구조

```
TrenDo/
├── app/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       │   ├── Onboarding.tsx
│       │   ├── HomeFeed.tsx
│       │   ├── ChallengeDetail.tsx
│       │   ├── Community.tsx
│       │   ├── Setlog.tsx
│       │   ├── Saved.tsx
│       │   ├── CultureMapPage.tsx
│       │   ├── RetentionPage.tsx
│       │   ├── MePage.tsx
│       │   └── Admin.tsx       ← XAI 콘솔
│       ├── components/
│       │   ├── BottomNav.tsx        (＋ FAB로 셋로그 컴포저 진입)
│       │   ├── SocialBar.tsx        (참여·좋아요·저장·공유)
│       │   ├── CommunityPost.tsx
│       │   ├── CommunityStrip.tsx
│       │   ├── SetlogComposer.tsx
│       │   ├── SetlogEntry.tsx
│       │   ├── XAIBar.tsx           (피처 가중치×값 시각화)
│       │   ├── Toast.tsx
│       │   └── …
│       ├── data/
│       │   ├── trends.ts
│       │   ├── regions.ts
│       │   ├── retention.ts
│       │   ├── community.ts
│       │   └── admin.ts             (XAI 점수·클러스터·해시태그)
│       └── lib/
│           ├── api.ts               (mock AI · 외부 호출 없음)
│           ├── social.ts            (저장·좋아요·셋로그 localStorage)
│           └── format.ts
└── server/                           (선택 — 데모엔 사용 X)
```
