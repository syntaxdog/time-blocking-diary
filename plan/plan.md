# Time Blocking Diary — 웹앱 개발 계획서

> 목표: 드래그 기반 Time Box 시각화 + 노션 DB 연동 다이어리 웹앱

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | Vercel 배포 최적화, API Routes 내장 |
| 스타일링 | Tailwind CSS | 빠른 레이아웃, 반응형 |
| 상태관리 | Zustand | 가볍고 직관적 |
| 드래그 Time Box | 커스텀 구현 (mouse/touch event) | 외부 의존 없이 완전 제어 |
| DB 연동 | Notion API (`@notionhq/client`) | 기존 노션 DB 재활용 |
| 배포 | Vercel (무료) | Next.js 네이티브, CI/CD 자동 |
| 인증 (선택) | Notion OAuth or 없이 로컬 | 개인용이면 API Key 환경변수로 충분 |

---

## 2. 프로젝트 구조

```
TIME_BLOCKING_DIARY/
├── app/
│   ├── page.tsx                  # 메인 허브 (날짜 선택)
│   ├── diary/[date]/page.tsx     # 날짜별 다이어리 페이지
│   └── api/
│       ├── notion/route.ts       # Notion DB CRUD
│       └── diary/route.ts        # 다이어리 저장/불러오기
├── components/
│   ├── TimeBox/
│   │   ├── TimeBox.tsx           # 핵심 — 드래그 시각화
│   │   ├── TimeBlock.tsx         # 30분 단위 블록
│   │   └── EventModal.tsx        # 일정 등록 모달
│   ├── BrainDump.tsx             # 체크박스 목록
│   ├── BigThree.tsx              # ①②③ 핵심 3가지
│   ├── Feedback.tsx              # 시작/중간/마무리
│   ├── FutureViz.tsx             # 미래 시각화 (텍스트에어리어)
│   ├── Identity.tsx              # 정체성
│   ├── Motivation.tsx            # 내적동기
│   └── Gratitude.tsx             # 감사일기
├── store/
│   └── diaryStore.ts             # Zustand 전역 상태
├── lib/
│   ├── notion.ts                 # Notion 클라이언트 설정
│   └── utils.ts                  # 날짜/Timezone 처리 (date-fns/dayjs) 및 포맷 유틸
├── types/
│   └── diary.ts                  # 타입 정의
└── .env.local                    # NOTION_API_KEY, NOTION_DB_ID
```

---

## 3. 핵심 기능 상세 설계

### 3-1. Time Box (최우선 구현)

**동작 방식**
- 05:00 ~ 23:30 → 30분 단위 = **총 37개 블록 × 2열**
- Pointer Events(`onPointerDown` → `onPointerMove` → `onPointerUp`)를 활용한 마우스/터치 통합 드래그 범위 선택
- 모바일 드래그 시 뷰포트 스크롤 방지 (`touch-action: none` 적용)
- 선택 완료 시 모달 팝업 → 일정명 + 색상 입력
- 등록된 블록은 색상으로 채워짐
- 블록 클릭 시 수정/삭제 가능

**데이터 구조**
```typescript
type TimeBlock = {
  id: string;
  startSlot: number;   // 0 = 05:00, 1 = 05:30, ...
  endSlot: number;
  label: string;
  color: string;       // 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  column: 0 | 1;       // 2열 지원
};
```

**드래그 구현 핵심 로직**
```typescript
// 드래그 시작 슬롯 저장 → 이동 중 범위 하이라이트 → 드래그 종료 시 모달 오픈
const [dragStart, setDragStart] = useState<number | null>(null);
const [dragEnd, setDragEnd] = useState<number | null>(null);
const [isDragging, setIsDragging] = useState(false);
```

---

### 3-2. Notion API 연동

**노션 DB 속성 설계**
```
날짜          Date      (기본 키)
Big3          Rich Text
BrainDump     Rich Text (JSON 직렬화)
TimeBlocks    Rich Text (JSON 직렬화)
Feedback      Rich Text (JSON 직렬화)
완료율         Formula   (Brain Dump 체크 수 / 전체 항목 수 * 100)
```

**API 흐름**
```
[페이지 진입]
  → GET /api/diary?date=2025-01-01
  → Notion DB 조회 (날짜 필터)
  → 없으면 빈 템플릿 반환

[저장]
  → POST /api/diary
  → Notion DB upsert (날짜 기준)
  → 자동 저장 (debounce 1.5초)
  → 실패 시 Retry 로직 및 사용자 Toast 알림 (Notion API Rate Limit 대응)
```

---

### 3-3. 레이아웃 (반응형)

**PC (1280px 이상)**
```
┌──────────────────┬──────────────────┬──────────────┐
│  미래 시각화      │  기상 직후 할 일  │  Time Box    │
│  정체성           │  Brain Dump      │  (드래그)    │
│  내적동기         │  Big 3           │              │
│  감사일기         │  Feedback        │              │
└──────────────────┴──────────────────┴──────────────┘
```

**모바일 (768px 이하)**
```
세로 스택:
Time Box → Big 3 → Brain Dump → Feedback
→ 미래시각화 → 정체성 → 내적동기 → 감사일기
```
(Time Box 모바일은 1열로 축소, 터치 드래그 지원)

---

## 4. 개발 단계 (로드맵)

### Phase 1 — UI 뼈대 (1~2일)
- [ ] Next.js 프로젝트 초기화
- [ ] 전체 레이아웃 컴포넌트 구현
- [ ] 정적 데이터로 모든 섹션 렌더링
- [ ] Tailwind 스타일링 (Time Blocking 레드 테마)

### Phase 2 — Time Box 핵심 구현 (2~3일)
- [ ] 30분 슬롯 그리드 렌더링
- [ ] Pointer Events 기반 마우스/터치 통합 드래그 로직 구현
- [ ] 모바일 터치 스크롤 제어 (`touch-action: none`) 및 최적화
- [ ] 일정 등록 모달
- [ ] 색상 선택 + 일정 라벨
- [ ] 등록 블록 시각화 (색상 채우기)
- [ ] 수정 / 삭제

### Phase 3 — 상태관리 & 로컬 저장 (1일)
- [ ] Zustand store 설계
- [ ] localStorage 임시 저장 (Notion 연동 전 테스트용)
- [ ] 날짜 이동 (이전/다음 날)
- [ ] 자동 저장 debounce 및 에러 핸들링 (Toast 알림)
- [ ] 데이터 동기화 및 오프라인 상태 관리 전략 (다른 기기 수정분 갱신)

### Phase 4 — Notion API 연동 (2일)
- [ ] Notion DB 생성 & API Key 발급
- [ ] `/api/notion` 라우트 구현
- [ ] 날짜별 조회 / 생성 / 업데이트
- [ ] 로딩 / 에러 상태 처리 및 Rate Limit 재시도(Retry) 로직

### Phase 5 — 배포 & 마무리 (1일)
- [ ] Vercel 배포
- [ ] 환경변수 설정
- [ ] 모바일 최종 테스트
- [ ] 반응형 버그 수정

---

## 5. 환경 설정

```bash
# 프로젝트 생성
npx create-next-app@latest time-blocking-diary --typescript --tailwind --app

# 패키지 설치
npm install @notionhq/client zustand
npm install -D @types/node
```

**.env.local**
```
NOTION_API_KEY=secret_xxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxx
```

---

## 6. 디자인 시스템

```css
/* 컬러 팔레트 */
--color-primary: #EF4444;      /* 레드 (Time Blocking 브랜드) */
--color-bg: #FDFAF7;           /* 따뜻한 화이트 */
--color-surface: #FFFFFF;
--color-border: #FCA5A5;       /* 연한 레드 */
--color-text: #1C1C1E;
--color-muted: #9CA3AF;

/* Time Box 일정 색상 */
--block-red: #FCA5A5;
--block-blue: #93C5FD;
--block-green: #86EFAC;
--block-yellow: #FDE68A;
--block-purple: #C4B5FD;
```

---

## 7. 참고 / 외부 리소스

- Notion API 공식 문서: https://developers.notion.com
- Next.js App Router: https://nextjs.org/docs
- Vercel 배포: https://vercel.com/docs
- 폰트: Pretendard (https://github.com/orioncactus/pretendard)

---

*Generated for TIME_BLOCKING_DIARY Project — 지윤*
