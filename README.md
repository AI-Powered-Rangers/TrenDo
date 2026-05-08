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

> `server/` 폴더는 향후 Claude API/Supabase 연동을 위한 자리만 잡아 둔 부속이며,
> 데모 시연에는 필요 없습니다. (프론트의 `lib/api.ts`가 클라이언트에서 AI 번역을 시뮬레이션함)

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
