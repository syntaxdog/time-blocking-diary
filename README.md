# Time Blocking Diary

**[→ 라이브 데모](https://time-blocking-diary.vercel.app)**

## 소개

Time Blocking은 하루를 시간 단위로 쪼개 각 시간대에 구체적인 작업을 미리 배정하는 생산성 기법입니다. 막연하게 할 일 목록을 적는 것과 달리, "언제 무엇을 할지"를 시각적으로 확정해두기 때문에 계획과 실행 사이의 간격을 줄이는 데 효과적입니다.

Time Blocking Diary는 이 기법을 웹에서 편하게 쓸 수 있도록 만든 개인 다이어리입니다. 타임라인 위에서 드래그 한 번으로 일정 블록을 만들고, 하루의 목표·회고·루틴을 함께 기록합니다.

---

## 스크린샷

### 다크 모드

<table>
  <tr>
    <td align="center"><img src="screenshots/5. dark.JPG" width="480"/><br/><sub>다크 모드 — 다이어리</sub></td>
    <td align="center"><img src="screenshots/6. diary.JPG" width="480"/><br/><sub>다크 모드 — 타임라인</sub></td>
  </tr>
</table>

### 라이트 모드

<table>
  <tr>
    <td align="center"><img src="screenshots/1. Home.JPG" width="320"/><br/><sub>홈</sub></td>
    <td align="center"><img src="screenshots/2. Calendar.JPG" width="320"/><br/><sub>월간 캘린더</sub></td>
    <td align="center"><img src="screenshots/3. Statics.JPG" width="320"/><br/><sub>통계</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="screenshots/4. profile.JPG" width="320"/><br/><sub>프로필</sub></td>
    <td align="center"><img src="screenshots/4-2. mode.JPG" width="320"/><br/><sub>테마 전환</sub></td>
    <td></td>
  </tr>
</table>

---

## 화면 구성

### 하루 다이어리 (`/diary/YYYY-MM-DD`)

하루 페이지는 세 개의 열로 나뉩니다.

- **왼쪽** — 오전/오후 타임라인 (05:00~23:30, 30분 단위 슬롯)
  - 마우스 또는 터치 드래그로 Time Box 생성
  - 블록 클릭 시 이름·색상 편집, 삭제
  - 색상 6종 (빨강·파랑·초록·노랑·보라·주황)
- **가운데** — 하루 핵심 기록
  - **Big 3** — 오늘 반드시 끝낼 3가지
  - **Brain Dump** — 머릿속을 비우는 자유 메모
  - **Morning Routine** — 아침 루틴 체크리스트
- **오른쪽** — 하루 마무리
  - **Feedback** — 오늘 잘한 것 / 개선할 것
  - **Future Viz** — 미래 시각화 (이미지 첨부 가능)
  - **Identity / Motivation / Gratitude** — 정체성 확인, 동기, 감사 기록

### 월간 캘린더 (`/calendar`)

한 달 치 날짜를 달력 형태로 보여줍니다. 날짜를 클릭하면 해당 날 다이어리로 이동합니다.

### 통계 (`/statistics`)

기간별 시간 블록 데이터를 집계해 시간 사용 패턴을 확인합니다.

---

## 주요 기능

- **Time Box 드래그** — 타임라인 위에서 마우스/터치로 드래그해 일정 블록 생성
- **하루 다이어리** — Big 3, 브레인덤프, 피드백, 모닝루틴 등 섹션별 기록
- **월간 캘린더** — 날짜별 진행 현황 한눈에 확인
- **통계** — 시간 사용 패턴 분석
- **멀티 디바이스 동기화** — 로그인 시 PostgreSQL DB 기준으로 기기 간 데이터 동기화
- **오프라인 지원** — localStorage 기반 로컬 저장, 네트워크 없이도 사용 가능

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 상태 관리 | Zustand v5 (persist) |
| 인증 | Auth.js v5 (next-auth@beta) — GitHub OAuth |
| ORM / DB | Prisma 6 + PostgreSQL (Neon) |
| 배포 | Vercel |

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정 (아래 참고)
cp .env.example .env.local

# DB 스키마 적용
npx prisma db push

# 개발 서버 실행
npm run dev
```

`http://localhost:3000` 에서 확인.

## 환경변수

`.env.local` 파일에 아래 값을 설정해야 합니다.

```env
# PostgreSQL (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth.js
AUTH_SECRET="your-secret"
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
```

GitHub OAuth App 설정:
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

## 데이터 흐름

변경사항은 Zustand → localStorage에 즉시 반영되고, 1초 debounce 후 DB에 POST합니다.
로그인 시 DB 데이터와 localStorage를 `updatedAt` 기준으로 병합합니다.

## 배포

```bash
npx vercel --prod
```

DB 마이그레이션은 Vercel 환경변수 설정 후 `npx prisma db push`.

## 라이선스

MIT
