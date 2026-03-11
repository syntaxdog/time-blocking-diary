# Time Blocking Diary — CLAUDE.md

## 프로젝트 개요
드래그 기반 Time Box 시각화 개인 다이어리 웹앱. PostgreSQL(Neon) DB 동기화로 멀티 디바이스 지원.

## 기술 스택
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Zustand (persist → localStorage + DB 백그라운드 동기화)
- Auth.js v5 (next-auth@beta) + Prisma 6 + PostgreSQL (Neon)
- Vercel 배포 (프로덕션)

## 프로젝트 구조
```
app/
  page.tsx                  # 날짜 선택 허브 (대시보드)
  diary/[date]/page.tsx     # 날짜별 다이어리 (3열 레이아웃)
  calendar/page.tsx         # 월간 캘린더
  statistics/page.tsx       # 통계 대시보드
  profile/page.tsx          # 프로필 및 설정 (편집 기능 포함)
  login/page.tsx            # OAuth 로그인 페이지
  api/auth/[...nextauth]/route.ts  # Auth API 핸들러
  api/diary/route.ts        # 다이어리 CRUD API (GET/POST)
  layout.tsx                # SessionProvider + ThemeProvider + HydrationGate
  globals.css
components/
  Header.tsx                # 공통 헤더 (프로필 드롭다운, 로그아웃)
  Sidebar.tsx               # 좌측 네비게이션
  HydrationGate.tsx         # Zustand hydration + DB 초기 로드 게이트
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
  MorningRoutine.tsx
  ThemeProvider.tsx
store/
  diaryStore.ts             # Zustand 전역 상태 + localStorage + DB 동기화
lib/
  utils.ts                  # 슬롯↔시간 변환, 날짜 유틸
  prisma.ts                 # Prisma 클라이언트 싱글톤
auth.ts                     # Auth.js v5 설정 (PrismaAdapter 포함)
auth.config.ts              # Auth.js 공유 설정 (middleware용 경량 버전)
middleware.ts               # 라우트 보호 (미인증 → /login, Prisma 미포함)
prisma/
  schema.prisma             # DB 스키마 (User, Account, Session, Diary)
types/
  diary.ts                  # 타입 정의
  next-auth.d.ts            # Session 타입 확장
```

## 핵심 타입
```ts
type TimeBlock = { id, startSlot, endSlot, label, color, column: 0|1 }
// startSlot 0 = 05:00, 1 = 05:30, ... 총 37슬롯 (05:00~23:30)
type DiaryData = { date, bigThree, brainDump, timeBlocks, feedback, futureViz, futureVizImage, identity, motivation, gratitude, morningRoutine, updatedAt? }
```

## DB 스키마
```prisma
model Diary {
  id        String   @id @default(cuid())
  userId    String
  date      String   // 'YYYY-MM-DD'
  data      Json     // DiaryData 전체를 JSON으로 저장
  updatedAt DateTime @updatedAt
  @@unique([userId, date])
}
```

## 데이터 동기화 아키텍처
- **Zustand store**가 primary (즉각적 UX)
- **localStorage**가 오프라인 fallback
- **PostgreSQL (Neon)**이 source of truth
- 변경 시: Zustand 즉시 반영 → 1초 debounce로 DB POST
- 로그인 시: DB에서 전체 로드 → localStorage와 merge (updatedAt 기준 최신 우선)
- HydrationGate가 localStorage hydration + DB 초기 로드 관리

## 디자인 시스템
CSS 변수로 관리 (globals.css):
- `--color-primary: #EF4444` (레드)
- `--color-bg: #FDFAF7` (따뜻한 화이트)
- `--color-surface: #FFFFFF`
- `--color-border: #FCA5A5`
- `--color-muted: #9CA3AF`

블록 색상: red / blue / green / yellow / purple / orange / gray

## 인증 시스템
- Auth.js v5 + JWT 세션 전략 (Edge Runtime 호환)
- OAuth providers: Google, Kakao, GitHub (현재 GitHub만 활성)
- `auth.config.ts` — 경량 설정 (middleware에서 사용, Prisma 미포함)
- `auth.ts` — 전체 설정 (PrismaAdapter 포함, API/페이지에서 사용)
- `middleware.ts`가 미인증 유저를 `/login`으로 리다이렉트
- 허용 경로: `/login`, `/api/auth/**`, 정적 파일

## 배포
- **Vercel** (프로덕션): https://time-blocking-diary.vercel.app
- **Neon PostgreSQL**: Vercel Storage 연결 (us-east-1)
- 배포 명령: `npx vercel --prod`
- DB 마이그레이션: `npx prisma db push` (Vercel 환경변수 필요)
- 환경변수: Vercel Dashboard → Settings → Environment Variables

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
- [x] Phase 4 — PostgreSQL DB 동기화 (Notion 대신 직접 DB 저장)
- [x] Phase 5 — Vercel 배포 + Neon PostgreSQL + CI/CD
