# UX Visual Reviewer — Persistent Memory

## Project: Time Blocking Diary

### Critical Design System Mismatches (as of 2026-03-10)
- `globals.css` `:root` and `@theme` use `--color-primary: #196ee6` (blue) — spec requires `#EF4444` (red)
- `globals.css` uses `--color-border: #e2e8f0` (slate-200) — spec requires `#FCA5A5` (rose-300)
- `globals.css` uses `--color-bg: #f6f7f8` — spec requires `#FDFAF7` (warm white)
- `body` font-family leads with `Inter`, not `Pretendard` as specified

### Known Bugs (confirmed in source)
- `Feedback.tsx` line 19: uses `key: 'afternoon'` but type/store defines `'midday'` — data silently discarded
- Weekday nav buttons in `/diary/[date]/page.tsx` lines 52–65: render but have no `onClick` — non-functional
- `lib/utils.ts`: `slotToTime(0)` returns `"04:00"`, `TOTAL_SLOTS = 48`. Spec says slot 0 = 05:00, 37 slots

### Recurring Accessibility Gaps
- `EventModal` (`components/TimeBox/EventModal.tsx`): no focus trap, no `role="dialog"`, no `aria-modal`, no Escape key handler
- `BlockItem` in TimeBox: interactive `div` — not keyboard-accessible, no `aria-label`
- TimeBox drag grid: no keyboard alternative for block creation
- Calendar nav buttons: missing `aria-label` (prev/next month)
- User avatar in home header: `div` with click handler — not a button element
- Most textarea/input fields across BrainDump, BigThree, Gratitude: no `aria-label`

### Contrast Failures
- `#94a3b8` (muted) on `#ffffff` white: ~2.8:1 — fails AA
- `#94a3b8` on `#f8fafc` (slate-50): ~2.75:1 — fails AA
- `#EF4444` on white for normal-weight text: ~4.0:1 — fails AA (use `#DC2626` or `#B91C1C` for text)
- `text-[10px]` used in multiple places — below practical legibility minimum

### Responsiveness Notes
- Sidebar is `hidden md:flex` — no mobile navigation replacement exists
- Weekday pill nav in diary header: 7 × `px-4 py-2` buttons overflow at 375px — needs `overflow-x-auto`
- TimeBox column renders first on mobile (`order-1`) — BigThree/priorities below fold
- Calendar day buttons are ~40px on mobile — below 44px touch target minimum
- `col-span-3` on empty-state in recent logs grid should be `col-span-full`

### Architecture Notes
- Zustand store key: `'time-blocking-diary'` in localStorage
- `@theme` block in globals.css controls Tailwind v4 utility generation; `:root` block controls `var()` in CSS
- `BLOCK_HEIGHT = 28` in TimeBox.tsx (px per slot) — currently 28px, gives 48×28=1344px tall grid
- Dark mode via `.dark` class on `<html>`, toggled by `ThemeProvider.tsx` reacting to store `theme` field
- See `details.md` for full component-by-component findings
