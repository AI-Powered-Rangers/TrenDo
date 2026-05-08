# TrenDo 기능 명세서

> 숏폼 유행을 전 세대가 함께 사는 K문화 플랫폼.
> *"보는 것에서 하는 것으로."*

본 문서는 현재 구현되어 있는 데모 빌드 기준 기능 명세이다.
사양 원본: [`files/trend_todo_full.md`](files/trend_todo_full.md), [`files/claude_code_prompt.md`](files/claude_code_prompt.md)

---

## 0. 한 줄 요약

| 항목 | 내용 |
|---|---|
| 제품 | TrenDo — 숏폼 유행 → 전 세대 챌린지 번역·기록·확산 플랫폼 |
| 핵심 가치 | 보는 것에서 **하는 것**으로. 복제가 아니라 **번역** |
| 데모 모드 | 외부 API 없이 100% 클라이언트 동작 (Claude/Supabase는 향후 연동 자리) |
| 시연 디바이스 | 모바일 우선 (max-w-md), 데스크톱에서도 정상 동작 |

---

## 1. 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | React 18 + TypeScript 5.6 + Vite 5 |
| 라우팅 | React Router 6 |
| 스타일 | Tailwind CSS 3.4 (코랄 + 딥 네이비 팔레트) |
| 폰트 | Noto Sans KR (Google Fonts) |
| 상태 | React state + localStorage 기반 커스텀 훅 (외부 상태관리 없음) |
| AI 번역 | 클라이언트 시뮬레이션 (`lib/api.ts`) — 외부 호출 0 |
| 지도 | SVG 기반 한국 지도 (Kakao Map 키 없이 시연 가능, 추후 교체 용이) |
| 백엔드 | (선택) Express + `@anthropic-ai/sdk` — 데모엔 사용하지 않음 |

빌드 결과(2026-05-08 기준): `231 KB JS / 75 KB gzip`, 69 modules.

---

## 2. 라우트 구조

| 경로 | 화면 | 진입 경로 |
|---|---|---|
| `/onboarding` | 세대·지역 첫 설정 | `onboarded=false`일 때 자동 리다이렉트 |
| `/` | 홈 피드 | BottomNav 🔥 |
| `/c/:id` | 챌린지 상세 | 트렌드 카드 / 커뮤니티 따라하기 / 셋로그 진입 |
| `/community` | 커뮤니티 피드 | BottomNav 💬 |
| `/setlog` | 셋로그 (오늘의 한 줄) | BottomNav 중앙 ＋ FAB / 챌린지 완료 후 자동 |
| `/saved` | 저장한 챌린지 | 내 피드 허브 |
| `/map` | 문화 순환 지도 | BottomNav 🗺️ / 챌린지 상세 하단 CTA |
| `/retention` | 문화 잔존율 대시보드 | 내 피드 허브 |
| `/me` | 내 피드 허브 | BottomNav 👤 |
| `/admin` | 관리자 XAI 콘솔 | 내 피드 허브 → 관리자 콘솔 카드 |

---

## 3. 화면별 기능 명세

### 3.1 온보딩 `/onboarding`

| 항목 | 내용 |
|---|---|
| 트리거 | 첫 방문 (`localStorage.trendo.prefs.v1.onboarded !== true`) |
| Step 1 | 세대 선택 — 10대 / 30·40대 / 50·60대 / 온 가족 |
| Step 2 | 지역 선택 — 서울 / 인천 / 강릉 / 대구 / 전주 / 광주 / 부산 / 제주 |
| 결과 | localStorage 저장 → `onboarded=true` → `/`로 이동 |
| 비고 | 이후 변경은 `/me`에서 즉시 가능. 화면 폰트 사이즈도 세대에 맞춰 자동 조정 |

### 3.2 홈 피드 `/`

| 영역 | 동작 |
|---|---|
| 검색창 | 키워드 또는 숏폼 URL 입력 → Enter |
| 검색 매칭 | 시드 트렌드 제목 일치 시 해당 챌린지 상세로, 미일치 시 두쫀쿠 상세에 `?seed=...` 로 라우팅(데모 폴백) |
| 세대 스위처 | 4개 세대 칩 — 누르면 즉시 prefs 동기화 + 카드 필터링 |
| 커뮤니티 인기 스트립 | 가로 스크롤로 `is_top=true` 게시물 카드 5장 노출 |
| 트렌드 카드 그리드 | 세대 필터 통과 트렌드 + "이 세대를 위한 추천" 헤더 |

각 트렌드 카드는 4종 시드:
| ID | 카테고리 | 도달 세대 |
|---|---|---|
| `ch-dujjonku` (두바이 쫀득쿠키) | food | 10대, 30·40대 |
| `ch-butter-run` (버터런) | fitness | 10대, 30·40대 |
| `ch-bomdong` (봄동 비빔밥) | food | 30·40대, 50·60대, 온 가족 |
| `ch-baseball-face` (야구 표정) | photo | 10대, 30·40대, 온 가족 |

### 3.3 챌린지 상세 `/c/:id`

페이지 구성 순서(스크롤 순):

1. **헤더 히어로** — 그라데이션 + 이모지, 세대별 제목/후크/난이도/시간/톤 메타.
2. **SocialBar** — 참여 / 좋아요 / 저장 / 공유 (4-button, 토스트 피드백).
3. **세대별 번역 섹션** — 4-칩 스위처. 즉시 반영. 화면 폰트도 변경.
4. **지역 재해석 섹션** — 8지역 칩 + 지역 변형 박스(twist + partner_place).
5. **AI 재번역 섹션** — "AI로 다시 번역" 버튼 → 0.9초 의도된 지연 → mock AI가 카드 리믹스 + **번역 근거 3줄(XAI)** 노출. 재료 그리드 표시.
6. **단계 체크리스트** — 각 단계 토글 가능, "챌린지 완료 체크" 버튼.
7. **셋로그 인라인 컴포저** — 완료 체크 시 자동 등장. 그 자리에서 한 줄 기록 가능.
8. **전통문화 연결** — "사실 이건 OO의 현대판이에요" 접기/펼치기.
9. **잔존율 미터** — 완료 시에만 노출. 0~100 점수 + 5개 보조 지표.
10. **이 챌린지의 커뮤니티 스트립** — 동일 `challenge_id`의 인증 게시물.
11. **문화 지도 CTA** — `/map`으로 이동.

### 3.4 커뮤니티 `/community`

| 영역 | 동작 |
|---|---|
| 탭 | 🔥 인기 (likes desc) / 🆕 최신 (created_minutes_ago asc) |
| 세대 필터 | 전체 / 10대 / 30·40대 / 50·60대 / 온 가족 |
| 게시물 카드 | 그라데이션 커버 + 작성자 + 캡션 + 좋아요 / 댓글 / 공유 + "따라하기" |
| 좋아요 | localStorage `postLikes` — 누르면 +1 즉시 반영 |
| 공유 | `navigator.share` 우선, 미지원 시 클립보드 복사 + 토스트 |
| 따라하기 | 해당 `challenge_id` 상세로 이동 |

시드 게시물: 8개. 도시 5곳, 4개 챌린지, 4개 세대를 골고루 커버.

### 3.5 셋로그 `/setlog`

> Setlog 컨셉: 매일 한 줄로 "오늘 내 set은?"을 기록 → 시간이 지나면 개인의 문화 잔존 패턴이 됨.

| 영역 | 동작 |
|---|---|
| 상단 통계 | 연속 기록 (스트릭) / 총 셋로그 / 자주 쓴 기분 이모지 |
| 컴포저 | (1) 일일 프롬프트(요일별 5종 순환) (2) 기분 이모지 5종 (3) 챌린지 select (4) 자유 태그 (5) 한 줄 메모 |
| 검증 | 메모/챌린지/태그 중 최소 하나 필수 |
| 저장 | localStorage `setlog` (newest first) + 토스트 |
| 기록 리스트 | 카드 형태(커버 그라데이션 + 이모지 + 메모 + 삭제) |
| 진입 경로 | BottomNav 중앙 코랄 ＋ FAB / 챌린지 완료 시 자동 인라인 |

스트릭 계산: 오늘부터 거꾸로 365일까지 같은 날짜 셋로그가 있는지 검사 (`computeStreak`).

### 3.6 저장 `/saved`

| 영역 | 동작 |
|---|---|
| 출처 | localStorage `saved` (challenge id 배열) |
| 표시 | 저장 순서대로 트렌드 카드 |
| 빈 상태 | "피드로 가기" 링크 |

### 3.7 문화 순환 지도 `/map`

| 영역 | 동작 |
|---|---|
| 누적 카운터 | 8개 지역 핀의 합 × 시간 슬라이더 비율(0~100%) |
| 시간 슬라이더 | D-30 ↔ 지금. 드래그 시 카운터 즉시 업데이트 |
| 지도 | SVG 한국 지도 (본토 path + 제주 별도 ellipse) |
| 핀 | 8개 도시. 반지름은 `log10(count) × 4`로 시각적 강조 |
| 핀 클릭 | 하단 인포 박스에 "지역 · 톱 챌린지 · 오늘 참여 N명" 표시 |
| 향후 교체 | Kakao Map SDK로 컴포넌트 단위 교체 가능 |

### 3.8 잔존율 `/retention`

| 영역 | 동작 |
|---|---|
| 정렬 | retention_score desc |
| 카드 | 챌린지 이모지·이름 + RetentionMeter (원형 게이지 + 5개 보조 지표 grid) |
| 보조 지표 | 완료율 / D+7 / D+30 / 취미化 / 가족과 |
| 클릭 | 챌린지 상세로 이동 |

### 3.9 내 피드 `/me`

| 영역 | 동작 |
|---|---|
| 상단 통계 | 저장 / 참여 / 좋아요 / 셋로그 스트릭 (4 stat) |
| 네비 카드 | 저장한 챌린지 / 내 셋로그 / 문화 잔존율 / 관리자 콘솔(코랄 강조) |
| 세대 / 지역 변경 | 인라인 스위처 — 즉시 모든 화면에 반영 |
| 안내 문구 | 데모 모드 · 모든 활동은 이 기기 localStorage에만 저장 |

---

## 4. 핵심 기능 (사양 원본 6개)

### F1. 숏폼 → 챌린지 변환 엔진

| 항목 | 구현 |
|---|---|
| 입력 | 검색창 키워드 / URL 또는 트렌드 카드 클릭 |
| 변환 | 시드 매칭 + `lib/api.ts` mock AI가 세대·지역에 맞춰 변형 |
| 출력 | 제목 / 후크 / 난이도 / 시간 / 재료 / 단계 / 지역 변형 / 전통 연결 |
| XAI | 번역 근거 3줄 (세대 톤 / 지역 결합 / 전통 유지 여부) |
| 재호출 | "AI로 다시 번역" 버튼으로 무한 변형 가능 |

### F2. 유행 번역 시스템 (세대별)

| 세대 | 톤 라이브러리 |
|---|---|
| `teen` | 트렌디·짧게. verbs: ['컷 따기','바로 올리기','챌린지 인증','한 컷 박제'] |
| `adult` | 실용·따뜻. verbs: ['주말에 같이','아이랑 한 컷','집에서 30분','커피 내리며'] |
| `senior` | 친절·단계적. verbs: ['천천히','하나씩','손주와 함께','사진 한 장'] |
| `family` | 온 가족. verbs: ['역할 나눠서','대결로','함께 한 컷','돌아가며'] |

번역 시 제목 = `{trend} {랜덤 verb}`, 후크 = `{원본 첫 문장}. {세대 closer}`, 폰트 사이즈도 `data-gen` 속성으로 자동 조정 (senior=17px, 그 외=15px).

### F3. 지역 재해석 엔진

| 지역 | 트위스트 (모든 챌린지에 일반화) |
|---|---|
| 서울 | 인사동 쑥 한 큰술 |
| 인천 | 강화 약쑥 가루 |
| 강릉 | 안목해변 커피 1샷 |
| 대구 | 청송 사과 한 조각 |
| 전주 | 풍남문 시장 흑임자 페이스트 |
| 광주 | 무등산 수박 한 큰술 |
| 부산 | 기장 유자청 1큰술 |
| 제주 | 한라봉 잼 1작은술 |

각 챌린지에는 시드 단계의 `local_variants`가 있고, 미정의 지역은 mock AI가 일반 트위스트로 채움.

### F4. 전통문화 자연 삽입

| 챌린지 | 연결 라벨 |
|---|---|
| 두쫀쿠 | "사실 이건 찹쌀떡·약과의 현대판이에요" |
| 버터런 | "조선의 아침 산책(조보) 문화와 닮았어요" |
| 봄동 비빔밥 | "24절기 춘분의 제철 음식이에요" |
| 야구 표정 | "사실 이건 탈춤 표정의 현대판이에요" |

UX 원칙: 강요하지 않음. 챌린지 카드 하단에 접힌 상태로 노출, 펼치면 본문 표시.

### F5. 문화 잔존율 (Cultural Retention Score)

| 지표 | 시드 (두쫀쿠 기준) |
|---|---|
| `completion_rate` | 0.74 |
| `day7_retention` | 0.41 |
| `day30_retention` | 0.18 |
| `became_hobby` | 0.09 |
| `shared_with_family` | 0.62 |
| `retention_score` | 71 (0~100) |
| `participants` | 232,401명 |

UI: 원형 게이지(264 dasharray) + 5-stat grid. 챌린지 완료 시 인라인 등장.

### F6. 문화 순환 지도 (K-Culture Flow Map)

| 항목 | 구현 |
|---|---|
| 8개 지역 핀 | 서울 81K · 인천 18K · 강릉 9K · 대구 22K · 전주 30K · 광주 14K · 부산 27K · 제주 12K |
| 시간 슬라이더 | 0(D-30) ~ 100(현재). 누적 카운터 비례 표시 |
| 핀 클릭 | 톱 챌린지 + 오늘 참여 수 |
| 지도 데이터 | SVG path 시드. Kakao Map 교체 시 핀 좌표만 위경도로 옮기면 됨 |

---

## 5. 능동 참여 레이어

### A1. SocialBar (저장 / 좋아요 / 참여 / 공유)

| 액션 | 저장소 | UI |
|---|---|---|
| 참여 | `localStorage.trendo.joined.v1` | 코랄 → 흰 배경 토글, 토스트 "오늘 챌린지에 참여했어요!" |
| 좋아요 | `localStorage.trendo.liked.v1` | ❤️/🤍 토글 |
| 저장 | `localStorage.trendo.saved.v1` | 🔖 → /saved에 즉시 누적 |
| 공유 | (저장 없음) | `navigator.share` 우선, 폴백 클립보드 복사 |

위치: 챌린지 상세 헤더 직하단 4-grid.

### A2. 셋로그 (Setlog)

[3.5 셋로그 참조]. 추가 운영 정의:

- **일일 프롬프트** 5종 (DateNumber % 5 순환):
  1. 오늘 너의 set은?
  2. 오늘 가장 "현실에서 살아남은" 유행은?
  3. 오늘 가족이랑 같이 한 챌린지가 있다면?
  4. 오늘 처음 본 유행 한 줄 평?
  5. 오늘 다시 해본 챌린지가 있나요?
- **자동 연결**: 챌린지 완료 체크 시 컴포저가 인라인 등장 → 챌린지가 자동 선택된 상태에서 한 줄만 쓰면 끝.
- **데이터 모델**: `{ id, date, challenge_id?, free_tag?, mood, note, cover_gradient?, cover_emoji? }`.

### A3. 커뮤니티 피드

[3.4 커뮤니티 참조]. 운영 원칙:

- 인증 사진 대신 그라데이션 + 이모지 (데모 단계 — 백엔드/스토리지 없이 시각화).
- 게시물에는 **실제 인터랙션 가능**: 좋아요 즉시 +1 반영, 공유 동작, 따라하기 라우팅.
- "is_top" 플래그가 있는 게시물만 홈 피드 인기 스트립에 노출.

### A4. 토스트 시스템

| 항목 | 구현 |
|---|---|
| 위치 | 화면 하단(BottomNav 위) 중앙, fixed |
| 라이프타임 | 1.8초 |
| 트리거 | SocialBar / Setlog / 공유 / 게시물 좋아요 |
| API | `useToast()` 훅 → `toast.push(text)` |

---

## 6. 관리자 XAI 콘솔 `/admin`

> 관리자가 "지금 무엇이 유행이고, **왜** 그런지"를 모델 가중치 수준에서 본다.

### 6.1 모델 카드

```
TrenDo Score · v0.3
score = Σ(wᵢ × featureᵢ)
6개 피처, 0~100 스케일, 가중치 합 = 1
```

| key | weight | 설명 |
|---|---:|---|
| view_growth | 0.18 | 24h 신규 시청 변화율 |
| generation_diversity | 0.22 | 4개 세대 도달의 균형도 (엔트로피) |
| region_spread | 0.18 | 8개 지역 중 평균 이상 활동 비율 |
| tradition_link | 0.14 | AI 탐지 유행↔전통 연결 신뢰도 |
| family_share | 0.18 | 가족 단위 공유 비율 |
| retention | 0.10 | 7일 후 재수행 비율 |

### 6.2 트렌드 랭킹 탭

각 챌린지 행:
- 순위 / 이모지 / 제목 / 트렌드 방향 화살표(↑→↓) / **AI 점수**
- 펼치면 6개 피처 막대 (label · weight · value · contribution=w×v)
- 최대 기여 피처는 코랄로 강조
- 자연어 설명 ("왜 이 점수인가")
- 모델 한계(caveat) — 표본 부족, 절기성 등 (있을 때만)

시드 4건:

| 챌린지 | 점수 | 방향 | 톱 기여 |
|---|---:|---|---|
| 두쫀쿠 | 87 | ↑ rising | 가족 공유율 95 + 세대 다양성 89 |
| 야구 표정 | 78 | ↑ rising | 시청 증가율 96, but 잔존율 49 |
| 버터런 | 71 | → stable | 잔존율 88 (루틴화 중) |
| 봄동 | 66 | ↓ declining | 전통 연결 92, 절기 종료 임박 |

### 6.3 클러스터 탭

유행 임베딩 → HDBSCAN 군집(가정). 각 클러스터:

| 클러스터 | 이모지 | 사이즈 | 성장률 | 핵심 노드 |
|---|---|---:|---:|---|
| 한 입 K푸드 | 🍪 | 4,128 | +42% | 두쫀쿠, 봄동 |
| 표정·인증샷 | 📸 | 2,890 | +61% | 야구 표정 |
| 5분 루틴 | 🏃‍♀️ | 1,530 | +18% | 버터런 |

각 카드에 클러스터 설명("저복잡도 인증샷이 진입 장벽 0", "계절성 강도 높음" 등) 포함.

### 6.4 커뮤니티 트렌딩 탭

24h 활성 해시태그 + AI "신규 트렌드 후보" 분류.

| 해시태그 | 게시물 | 참여율 | 세대 균형 | 움직임 | XAI 한 줄 |
|---|---:|---:|---:|---|---|
| #흑임자두쫀쿠 | 1,342 | 18% | 0.78 | ↑ | 전주+50대 24h 4.2× 유입, 가족 단위 64% |
| #야구표정3컷 | 2,880 | 22% | 0.41 | ↑ | 10대 쏠림 — 단발성 가능성 ↑ |
| #한강버터런 | 612 | 11% | 0.69 | → | 게시물 정체이지만 7일+ 반복 게시자 다수 |
| #춘분봄동 | 388 | 14% | 0.74 | ↓ | 24h 신규 -34% — 절기 종료 직전 |

### 6.5 XAIBar 컴포넌트

각 피처 한 줄:
```
[label] w=0.22                    89  기여 19.6
▮▮▮▮▮▮▮▮▯▯ ▮ (89% 채움)
```
최대 기여 피처는 막대를 코랄(`bg-coral-500`), 그 외 딥 네이비(`bg-ink-700`).

---

## 7. 데이터 모델

### 7.1 핵심 타입 ([`app/src/types.ts`](app/src/types.ts))

```ts
type Generation = 'teen' | 'adult' | 'senior' | 'family'
type Region = 'seoul' | 'jeonju' | 'jeju' | 'busan' | 'gangneung' | 'daegu' | 'gwangju' | 'incheon'
type Difficulty = 'easy' | 'medium' | 'hard'

interface ChallengeCard {
  id, title, trend_source, emoji, cover_gradient,
  difficulty, duration_minutes,
  materials: Material[], steps: Step[],
  generation_variants: GenerationVariant[],
  local_variants: LocalVariant[],
  traditional_connection?: TraditionConnection,
}

interface CommunityPost {
  id, challenge_id, author_name, author_emoji,
  generation, region, caption,
  cover_gradient, cover_emoji,
  created_minutes_ago, base_likes, base_comments,
  is_top: boolean,
}

interface SetlogEntry {
  id, date,                          // YYYY-MM-DD
  challenge_id?, free_tag?,
  mood: '🔥' | '💛' | '🌿' | '😴' | '✨',
  note,
  cover_gradient?, cover_emoji?,
}

interface AdminTrendScore {
  challenge_id, total,
  trend_direction: 'rising' | 'stable' | 'declining',
  features: XAIFeature[],            // { key, label, weight, value }
  top_reason, caveat?,
}
```

### 7.2 시드 위치

| 데이터 | 파일 |
|---|---|
| 트렌드/챌린지 | [`app/src/data/trends.ts`](app/src/data/trends.ts) |
| 지역 정보 | [`app/src/data/regions.ts`](app/src/data/regions.ts) |
| 잔존율/지도 핀 | [`app/src/data/retention.ts`](app/src/data/retention.ts) |
| 커뮤니티 게시물 | [`app/src/data/community.ts`](app/src/data/community.ts) |
| 관리자 XAI 점수 | [`app/src/data/admin.ts`](app/src/data/admin.ts) |

---

## 8. 상태 관리

### 8.1 사용자 설정 ([`store/userPrefs.ts`](app/src/store/userPrefs.ts))

| 키 | 내용 |
|---|---|
| `trendo.prefs.v1` | `{ generation, region, onboarded }` |
| 동기화 | `window` 커스텀 이벤트로 같은 탭 내 즉시 동기화 |

### 8.2 소셜 상태 ([`lib/social.ts`](app/src/lib/social.ts))

| 키 | 타입 |
|---|---|
| `trendo.saved.v1` | `string[]` (challenge id) |
| `trendo.liked.v1` | `string[]` (challenge id) |
| `trendo.joined.v1` | `string[]` (challenge id) |
| `trendo.postLikes.v1` | `string[]` (post id) |
| `trendo.setlog.v1` | `SetlogEntry[]` |

각각 `useSaved` / `useLiked...` / `useSetlog` 훅으로 접근. 같은 키를 보는 컴포넌트끼리 즉시 동기화 (모듈 내 listener Set).

---

## 9. 디자인 시스템

### 9.1 색상

| 역할 | 토큰 | hex |
|---|---|---|
| 코랄 500 (브랜드) | `coral-500` | `#FF5C2A` |
| 코랄 600 (강조) | `coral-600` | `#E84412` |
| 코랄 50 (배경) | `coral-50` | `#FFF3EE` |
| 잉크 700 (본문) | `ink-700` | `#0E1738` |
| 잉크 400 (서브) | `ink-400` | `#3F4A77` |
| 잉크 50 (배경) | `ink-50` | `#F2F4FA` |

### 9.2 타이포그래피

| 세대 | 본문 폰트 사이즈 |
|---|---|
| `teen` | 15px |
| `adult` | 15px |
| `senior` | 17px |
| `family` | 15px |

`<div data-gen={prefs.generation}>` 래퍼 → CSS 셀렉터로 자동 적용.

### 9.3 레이아웃

| 항목 | 값 |
|---|---|
| 컨테이너 | `max-w-md mx-auto` (모바일 우선) |
| 카드 | `rounded-2xl bg-white shadow-card` |
| 카드 그림자 | `0 6px 28px -10px rgba(23,33,73,0.25)` |
| 본문 패딩 | `px-4 pt-6 pb-28` (BottomNav 공간 확보) |

### 9.4 BottomNav

```
[ 🔥 피드 ] [ 💬 커뮤니티 ] [ ＋ FAB ] [ 🗺️ 지도 ] [ 👤 내 ]
```
중앙 ＋는 코랄 원형 버튼, BottomNav 위로 살짝 튀어나옴, 누르면 `/setlog`로 이동.

---

## 10. 데모 시연 시나리오 (8단계)

| # | 화면 | 행동 | 보여줄 포인트 |
|--:|---|---|---|
| 1 | 홈 피드 | "두바이 쫀득쿠키" 카드 클릭 | 상단 커뮤니티 인기 스트립 동시 노출 |
| 2 | 챌린지 상세 | 세대 → 50·60대 | 제목·후크·폰트가 부드럽게 변경 |
| 3 | 챌린지 상세 | 지역 → 전주 | "흑임자 두쫀쿠" + 풍남문 시장 연결 |
| 4 | 챌린지 상세 | "AI로 다시 번역" | 0.9초 후 카드 리믹스 + XAI 근거 3줄 |
| 5 | SocialBar | 참여 / 저장 / 공유 | 토스트 즉시 피드백, /saved에 누적 |
| 6 | 단계 + 셋로그 | 모두 체크 → 완료 | 잔존율 71점 + 셋로그 컴포저 자동 등장 → 한 줄 기록 |
| 7 | 커뮤니티 | 흑임자·한강 버터런 인증 | 따라하기 / 좋아요 / 공유 |
| 8 | `/admin` | 두쫀쿠 #1 행 펼치기 | "가족공유 0.18×95 + 세대다양성 0.22×89가 1위 만든 이유" + 표본 부족 caveat → 커뮤니티 탭에서 #흑임자두쫀쿠 24h 4.2× 상승 |

---

## 11. 향후 확장 (미구현)

| 영역 | 내용 |
|---|---|
| AI 백엔드 | `server/`에 Express + `@anthropic-ai/sdk` 자리만 잡혀 있음. 데모엔 비활성. |
| Supabase | 사용자/게시물/셋로그 영속 저장 — 현재 시드+localStorage |
| Kakao Map | 키 발급 후 `CultureMap.tsx`만 교체 가능하도록 설계됨 |
| 인증샷 업로드 | 현재 그라데이션 + 이모지로 시각화 |
| 푸시 알림 | D+7 / D+30 잔존율 팔로업 |
| 댓글 / 답글 | 게시물 카운트만 표시, 상세 미구현 |
| 다국어 | 한국어 only, 영문 토큰 일부 산발 사용 |

---

## 12. 파일 구조

```
TrenDo/
├── README.md
├── SPEC.md                       (본 문서)
├── files/
│   ├── trend_todo_full.md        (사양 원본)
│   └── claude_code_prompt.md
├── app/                          (프론트엔드 — 데모 본체)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types.ts
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
│       │   └── Admin.tsx
│       ├── components/
│       │   ├── AppShell.tsx
│       │   ├── BottomNav.tsx
│       │   ├── Toast.tsx
│       │   ├── TrendCard.tsx
│       │   ├── ChallengeStep.tsx
│       │   ├── GenerationSwitcher.tsx
│       │   ├── RegionSwitcher.tsx
│       │   ├── SocialBar.tsx
│       │   ├── TraditionConnection.tsx
│       │   ├── RetentionMeter.tsx
│       │   ├── CultureMap.tsx
│       │   ├── CommunityPost.tsx
│       │   ├── CommunityStrip.tsx
│       │   ├── SetlogComposer.tsx
│       │   ├── SetlogEntry.tsx
│       │   └── XAIBar.tsx
│       ├── data/
│       │   ├── trends.ts
│       │   ├── regions.ts
│       │   ├── retention.ts
│       │   ├── community.ts
│       │   └── admin.ts
│       ├── lib/
│       │   ├── api.ts             (mock AI 번역, 외부 호출 없음)
│       │   ├── social.ts          (저장·좋아요·참여·셋로그·게시물 좋아요)
│       │   └── format.ts
│       └── store/
│           └── userPrefs.ts
└── server/                        (선택 — 데모엔 사용 X)
    ├── package.json
    └── src/
        ├── index.ts
        └── prompts.ts
```
