# Detailed Component Findings — Time Blocking Diary

## File Map (key files)
- Design system: `app/globals.css`
- Layout: `app/layout.tsx` (Pretendard + Inter + Material Symbols loaded in head)
- Home page: `app/page.tsx`
- Diary page: `app/diary/[date]/page.tsx`
- TimeBox: `components/TimeBox/TimeBox.tsx`
- EventModal: `components/TimeBox/EventModal.tsx`
- Store: `store/diaryStore.ts`
- Types: `types/diary.ts`
- Utils: `lib/utils.ts`

## EventModal Specifics
- Width: `w-80` (320px) — zero margin on 375px screen; fix to `w-[calc(100vw-2rem)] max-w-sm`
- No `role="dialog"`, no `aria-modal`, no `aria-labelledby`
- `onMouseDown` backdrop dismiss works; no Escape key handler
- `autoFocus` on label input is correct
- Color palette hardcoded hex values in `COLORS` array

## TimeBox Specifics
- `BLOCK_HEIGHT = 28px`, `TOTAL_SLOTS = 48` → grid height = 1344px (very tall)
- Drag via Pointer Events API with `setPointerCapture` — correct implementation
- `BlockItem` uses `div[data-block]` with `onClick` — not keyboard accessible
- Time labels placed at `left: 0, width: 44px`; grid at `left: 48px`
- Highlight overlay uses `color-mix(in srgb, var(--color-primary) 25%, transparent)` — requires modern browser support

## Store/Type Inconsistency
- `FeedbackType` (types/diary.ts): `{ morning, midday, evening }`
- `emptyDiary` (store): `feedback: { morning: '', midday: '', evening: '' }` — correct
- `Feedback.tsx` component: uses `'morning'`, `'afternoon'`, `'evening'` — `'afternoon'` is wrong key

## Slot System
- `lib/utils.ts` slotToTime: `totalMinutes = (4 * 60 + slot * 30) % (24 * 60)` → slot 0 = 04:00
- CLAUDE.md spec: slot 0 = 05:00, 37 total slots
- Implementation: 48 slots, wraps midnight (last slot = 03:30 next day)
- Decision needed: adopt 05:00–23:30 (37 slots) or 04:00 (48 slots)

## Sidebar
- Achievement `82%` is hardcoded on line 39 — not from store
- Only visible at `md:` breakpoint and above — mobile has no navigation

## Home Page
- Vision banner: `style={{ fontFamily: 'Pretendard, sans-serif' }}` — only Pretendard override is here inline; body uses Inter
- Bar chart data: `color: item.isFuture ? 'transparent'` with content `'·'` — visual-only placeholder dots; color set transparent but dot rendered
- `indigo-600` used for bar chart (`#4f46e5`) — not in design system tokens
