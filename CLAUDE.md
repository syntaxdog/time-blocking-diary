# Time Blocking Diary — CLAUDE.md

## 프로젝트 개요
드래그 기반 Time Box 시각화 + Notion DB 연동 개인 다이어리 웹앱.

## 기술 스택
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Zustand (persist → localStorage)
- Auth.js v5 (next-auth@beta) + Prisma 6 + SQLite
- Notion API (`@notionhq/client`) — Phase 4에서 연동 예정

## 프로젝트 구조
```
app/
  page.tsx                  # 날짜 선택 허브
  diary/[date]/page.tsx     # 날짜별 다이어리 (3열 레이아웃)
  calendar/page.tsx         # 월간 캘린더
  statistics/page.tsx       # 통계 대시보드
  profile/page.tsx          # 프로필 및 설정
  login/page.tsx            # OAuth 로그인 페이지
  api/auth/[...nextauth]/route.ts  # Auth API 핸들러
  layout.tsx                # SessionProvider 래핑
  globals.css
components/
  Header.tsx                # 공통 헤더 (프로필 드롭다운, 로그아웃)
  Sidebar.tsx               # 좌측 네비게이션
  TimeBox/
    TimeBox.tsx             # 드래그 Time Box (핵심)
    EventModal.tsx          # 일정 등록/수정/삭제 모달
  BigThree.tsx
  BrainDump.tsx
  Feedback.tsx
  FutureViz.tsx
  Identity.tsx
  Motivation.tsx
  Gratitude.tsx
store/
  diaryStore.ts             # Zustand 전역 상태 + localStorage 자동저장
lib/
  utils.ts                  # 슬롯↔시간 변환, 날짜 유틸
  prisma.ts                 # Prisma 클라이언트 싱글톤
auth.ts                     # Auth.js v5 설정 (프로젝트 루트)
middleware.ts               # 라우트 보호 (미인증 → /login)
prisma/
  schema.prisma             # DB 스키마 (User, Account, Session)
types/
  diary.ts                  # 타입 정의
  next-auth.d.ts            # Session 타입 확장
```

## 핵심 타입
```ts
type TimeBlock = { id, startSlot, endSlot, label, color, column: 0|1 }
// startSlot 0 = 05:00, 1 = 05:30, ... 총 37슬롯 (05:00~23:30)
type DiaryData = { date, bigThree, brainDump, timeBlocks, feedback, futureViz, identity, motivation, gratitude }
```

## 디자인 시스템
CSS 변수로 관리 (globals.css):
- `--color-primary: #EF4444` (레드)
- `--color-bg: #FDFAF7` (따뜻한 화이트)
- `--color-surface: #FFFFFF`
- `--color-border: #FCA5A5`
- `--color-muted: #9CA3AF`

블록 색상: red / blue / green / yellow / purple

## 인증 시스템
- Auth.js v5 + JWT 세션 전략 (Edge Runtime 호환)
- OAuth providers: Google, Kakao, GitHub
- Prisma 6 + SQLite — 유저/계정 영속화 (추후 PostgreSQL 전환 가능)
- `middleware.ts`가 미인증 유저를 `/login`으로 리다이렉트
- 허용 경로: `/login`, `/api/auth/**`, 정적 파일
- `layout.tsx`에서 `SessionProvider` 래핑 (async Server Component)
- 환경 변수: `.env.local` (AUTH_SECRET, OAuth 키, DATABASE_URL)

## 개발 규칙
- 컴포넌트는 모두 `'use client'`
- 날짜 키는 항상 `YYYY-MM-DD` 문자열
- localStorage 키: `time-blocking-diary`
- 폰트: Pretendard (CDN)
- 경로 alias: `@/` → 프로젝트 루트

## 개발 단계 현황
- [x] Phase 1 — UI 뼈대
- [x] Phase 2 — Time Box 드래그 구현
- [x] Phase 3 — Zustand + localStorage
- [x] Phase 3.5 — OAuth 로그인 (Google, Kakao, GitHub)
- [ ] Phase 4 — Notion API 연동
- [ ] Phase 5 — Vercel 배포
