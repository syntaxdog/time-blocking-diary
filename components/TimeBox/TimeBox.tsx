'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import { TOTAL_SLOTS, slotToTime } from '@/lib/utils';
import type { BlockColor, TimeBlock } from '@/types/diary';
import EventModal from './EventModal';

function useIsDark() {
  const theme = useDiaryStore((s) => s.theme);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (theme === 'dark') setDark(true);
    else if (theme === 'light') setDark(false);
    else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setDark(mq.matches);
      const h = (e: MediaQueryListEvent) => setDark(e.matches);
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    }
  }, [theme]);
  return dark;
}

const BLOCK_HEIGHT = 28; // px per slot

type ModalState =
  | { mode: 'create'; startSlot: number; endSlot: number }
  | { mode: 'edit'; block: TimeBlock };

export default function TimeBox({ date }: { date: string }) {
  const isDark = useIsDark();
  const { diaries, addTimeBlock, updateTimeBlock, removeTimeBlock } = useDiaryStore();
  const timeBlocks = diaries[date]?.timeBlocks ?? [];

  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  function pointerToSlot(clientY: number): number {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const slot = Math.floor(y / BLOCK_HEIGHT);
    return Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const slot = pointerToSlot(e.clientY);
    setDragStart(slot);
    setDragEnd(slot);
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragEnd(pointerToSlot(e.clientY));
  }, [isDragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || dragStart === null) return;
    setIsDragging(false);
    const end = pointerToSlot(e.clientY);
    const startSlot = Math.min(dragStart, end);
    const endSlot = Math.max(dragStart, end);
    setModal({ mode: 'create', startSlot, endSlot });
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart]);

  const highlightStart = dragStart !== null && dragEnd !== null ? Math.min(dragStart, dragEnd) : null;
  const highlightEnd = dragStart !== null && dragEnd !== null ? Math.max(dragStart, dragEnd) : null;

  function handleConfirm(label: string, color: BlockColor) {
    if (!modal) return;
    if (modal.mode === 'create') {
      addTimeBlock(date, {
        startSlot: modal.startSlot,
        endSlot: modal.endSlot,
        label,
        color,
        column: 0,
      });
    } else {
      updateTimeBlock(date, modal.block.id, { label, color });
    }
    setModal(null);
  }

  function handleDelete() {
    if (modal?.mode === 'edit') {
      removeTimeBlock(date, modal.block.id);
      setModal(null);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">schedule</span>
          <h2 className="font-bold text-slate-800">타임박스 (Time Box)</h2>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">30-min Intervals</span>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-slate-400">드래그로 시간 블록을 만드세요</p>
      </div>

      <div className="px-4 pb-4 overflow-y-auto flex-1 max-h-[800px]">
        <div className="relative" style={{ height: TOTAL_SLOTS * BLOCK_HEIGHT }}>
          {/* 시간 레이블 (absolute) */}
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) =>
            i % 2 === 0 ? (
              <div key={`t${i}`} className="absolute left-0 text-right pr-2"
                style={{
                  top: i * BLOCK_HEIGHT,
                  width: 44,
                  fontSize: 10,
                  lineHeight: `${BLOCK_HEIGHT}px`,
                  color: 'var(--color-muted)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {slotToTime(i)}
              </div>
            ) : null
          )}

          {/* 그리드 */}
          <div
            ref={gridRef}
            className="absolute top-0 bottom-0 right-0 no-select"
            style={{ left: 48, touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
          {/* 슬롯 배경선 */}
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <div key={i} className="absolute w-full"
              style={{
                top: i * BLOCK_HEIGHT,
                height: BLOCK_HEIGHT,
                borderTop: i % 2 === 0
                  ? `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  : `1px dashed ${isDark ? '#1e293b' : '#f1f5f9'}`,
                background: i % 2 === 0
                  ? (isDark ? '#1a2332' : '#f8fafc')
                  : 'var(--color-surface)',
              }} />
          ))}

          {/* 드래그 하이라이트 */}
          {highlightStart !== null && highlightEnd !== null && (
            <div
              className="absolute pointer-events-none rounded-sm opacity-30 left-0 w-full"
              style={{
                top: highlightStart * BLOCK_HEIGHT,
                height: (highlightEnd - highlightStart + 1) * BLOCK_HEIGHT,
                background: 'var(--color-primary)',
              }}
            />
          )}

          {/* 등록된 블록들 */}
          {timeBlocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              blockHeight={BLOCK_HEIGHT}
              onClick={() => setModal({ mode: 'edit', block })}
            />
          ))}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {modal && (
        <EventModal
          startSlot={modal.mode === 'create' ? modal.startSlot : modal.block.startSlot}
          endSlot={modal.mode === 'create' ? modal.endSlot : modal.block.endSlot}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          existing={modal.mode === 'edit' ? { label: modal.block.label, color: modal.block.color } : undefined}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
        />
      )}
    </section>
  );
}

const accentColorMap = {
  light: {
    red:    { bar: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
    blue:   { bar: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
    green:  { bar: '#22c55e', bg: '#f0fdf4', text: '#166534' },
    yellow: { bar: '#eab308', bg: '#fefce8', text: '#854d0e' },
    purple: { bar: '#a855f7', bg: '#faf5ff', text: '#6b21a8' },
  },
  dark: {
    red:    { bar: '#f87171', bg: '#3b1a1e', text: '#fca5a5' },
    blue:   { bar: '#60a5fa', bg: '#142240', text: '#93c5fd' },
    green:  { bar: '#4ade80', bg: '#143024', text: '#86efac' },
    yellow: { bar: '#facc15', bg: '#3b3014', text: '#fde68a' },
    purple: { bar: '#c084fc', bg: '#241638', text: '#d8b4fe' },
  },
} as const;

function BlockItem({
  block,
  blockHeight,
  onClick,
}: {
  block: TimeBlock;
  blockHeight: number;
  onClick: () => void;
}) {
  const isDark = useIsDark();
  const palette = isDark ? accentColorMap.dark : accentColorMap.light;
  const accent = palette[block.color] ?? palette.blue;
  return (
    <div
      data-block
      className="absolute w-full rounded-md cursor-pointer overflow-hidden flex items-center"
      style={{
        top: block.startSlot * blockHeight + 1,
        height: (block.endSlot - block.startSlot + 1) * blockHeight - 2,
        background: accent.bg,
        borderLeft: `3px solid ${accent.bar}`,
        color: accent.text,
        fontSize: 11,
        fontWeight: 600,
        paddingLeft: 8,
        paddingRight: 4,
        zIndex: 10,
      }}
      onClick={onClick}
    >
      <span className="truncate">{block.label}</span>
    </div>
  );
}
