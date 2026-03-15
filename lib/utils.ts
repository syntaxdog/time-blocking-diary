// 슬롯 번호 → 시간 문자열 (startHour 기준, 기본 4시)
export function slotToTime(slot: number, startHour: number = 4): string {
  const totalMinutes = (startHour * 60 + slot * 30) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 총 슬롯 수: 04:00 ~ 03:30 → 48슬롯
export const TOTAL_SLOTS = 48;

// 날짜 포맷 YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 오늘 날짜 YYYY-MM-DD
export function today(): string {
  return formatDate(new Date());
}

// 날짜 이동
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// 표시용 날짜 (예: 2025년 1월 1일 수요일)
export function displayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 블록 색상 → Tailwind 클래스
export const blockColorMap: Record<string, { bg: string; border: string; text: string }> = {
  red:    { bg: 'bg-red-200',    border: 'border-red-300',    text: 'text-red-800'    },
  blue:   { bg: 'bg-blue-200',   border: 'border-blue-300',   text: 'text-blue-800'   },
  green:  { bg: 'bg-green-200',  border: 'border-green-300',  text: 'text-green-800'  },
  yellow: { bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-800' },
  purple: { bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-800' },
  orange: { bg: 'bg-orange-200', border: 'border-orange-300', text: 'text-orange-800' },
  gray:   { bg: 'bg-gray-200',   border: 'border-gray-300',   text: 'text-gray-700'   },
};

/** 시작시간 변경 가능 여부 검증 (wrap-around 발생 시 false) */
export function canChangeStartHour(
  blocks: { startSlot: number; endSlot: number }[],
  oldHour: number,
  newHour: number,
): boolean {
  if (oldHour === newHour || blocks.length === 0) return true;
  const delta = (oldHour - newHour) * 2;
  return blocks.every((b) => {
    let s = (b.startSlot + delta) % TOTAL_SLOTS;
    let e = (b.endSlot + delta) % TOTAL_SLOTS;
    if (s < 0) s += TOTAL_SLOTS;
    if (e < 0) e += TOTAL_SLOTS;
    return s <= e;
  });
}

/** 시작시간 변경 시 블록 슬롯 재계산 (절대시간 유지) */
export function recalcSlots(
  blocks: { startSlot: number; endSlot: number }[],
  oldHour: number,
  newHour: number,
) {
  if (oldHour === newHour) return blocks;
  const delta = (oldHour - newHour) * 2;
  return blocks.map((b) => {
    let s = (b.startSlot + delta) % TOTAL_SLOTS;
    let e = (b.endSlot + delta) % TOTAL_SLOTS;
    if (s < 0) s += TOTAL_SLOTS;
    if (e < 0) e += TOTAL_SLOTS;
    return { ...b, startSlot: s, endSlot: e };
  });
}

// 간단한 uid
export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}
