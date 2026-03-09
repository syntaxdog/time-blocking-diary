# Time Blocking Diary — CLAUDE.md

## 프로젝트 개요
드래그 기반 Time Box 시각화 + Notion DB 연동 개인 다이어리 웹앱.

## 기술 스택
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Zustand (persist → localStorage)
- Notion API (`@notionhq/client`) — Phase 4에서 연동 예정

## 프로젝트 구조
```
app/
  page.tsx                  # 날짜 선택 허브
  diary/[date]/page.tsx     # 날짜별 다이어리 (3열 레이아웃)
  layout.tsx
  globals.css
components/
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
types/
  diary.ts                  # 타입 정의
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
- [ ] Phase 4 — Notion API 연동
- [ ] Phase 5 — Vercel 배포
