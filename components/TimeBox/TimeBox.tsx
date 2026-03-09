'use client';

import { useState, useRef, useCallback } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import { TOTAL_SLOTS, slotToTime, blockColorMap } from '@/lib/utils';
import type { BlockColor, TimeBlock } from '@/types/diary';
import EventModal from './EventModal';

const BLOCK_HEIGHT = 28; // px per slot

type ModalState =
  | { mode: 'create'; startSlot: number; endSlot: number; column: 0 | 1 }
  | { mode: 'edit'; block: TimeBlock };

export default function TimeBox({ date }: { date: string }) {
  const { diaries, addTimeBlock, updateTimeBlock, removeTimeBlock } = useDiaryStore();
  const timeBlocks = diaries[date]?.timeBlocks ?? [];

  const [dragStart, setDragStart] = useState<{ slot: number; col: 0 | 1 } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // 포인터 위치 → 슬롯 번호
  function pointerToSlot(clientY: number): number {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const slot = Math.floor(y / BLOCK_HEIGHT);
    return Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));
  }

  function pointerToColumn(clientX: number): 0 | 1 {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    return clientX - rect.left < rect.width / 2 ? 0 : 1;
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // 이미 등록된 블록 클릭 시 무시
    if ((e.target as HTMLElement).closest('[data-block]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const slot = pointerToSlot(e.clientY);
    const col = pointerToColumn(e.clientX);
    setDragStart({ slot, col });
    setDragEnd(slot);
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragEnd(pointerToSlot(e.clientY));
  }, [isDragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    setIsDragging(false);
    const end = pointerToSlot(e.clientY);
    const startSlot = Math.min(dragStart.slot, end);
    const endSlot = Math.max(dragStart.slot, end);
    setModal({ mode: 'create', startSlot, endSlot, column: dragStart.col });
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart]);

  // 드래그 하이라이트 범위
  const highlightStart = dragStart && dragEnd !== null ? Math.min(dragStart.slot, dragEnd) : null;
  const highlightEnd = dragStart && dragEnd !== null ? Math.max(dragStart.slot, dragEnd) : null;

  function handleConfirm(label: string, color: BlockColor) {
    if (!modal) return;
    if (modal.mode === 'create') {
      addTimeBlock(date, {
        startSlot: modal.startSlot,
        endSlot: modal.endSlot,
        label,
        color,
        column: modal.column,
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

  // 컬럼별 블록
  const col0 = timeBlocks.filter((b) => b.column === 0);
  const col1 = timeBlocks.filter((b) => b.column === 1);

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
        <p className="text-xs text-slate-400">드래그로 시간 블록을 만드세요 (좌/우 2열)</p>
      </div>

      <div className="flex gap-1 px-4 pb-4 overflow-y-auto flex-1 max-h-[800px]">
        {/* 시간 레이블 */}
        <div className="flex flex-col flex-shrink-0" style={{ width: 44 }}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <div key={i} className="flex items-start justify-end pr-2"
              style={{ height: BLOCK_HEIGHT, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
              {i % 2 === 0 ? slotToTime(i) : ''}
            </div>
          ))}
        </div>

        {/* 그리드 (2열) */}
        <div
          ref={gridRef}
          className="flex-1 relative no-select"
          style={{ height: TOTAL_SLOTS * BLOCK_HEIGHT, touchAction: 'none' }}
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
                borderTop: i % 2 === 0 ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
              }} />
          ))}

          {/* 드래그 하이라이트 */}
          {highlightStart !== null && highlightEnd !== null && dragStart && (
            <div
              className="absolute pointer-events-none rounded-sm opacity-30"
              style={{
                top: highlightStart * BLOCK_HEIGHT,
                height: (highlightEnd - highlightStart + 1) * BLOCK_HEIGHT,
                left: dragStart.col === 0 ? 0 : '50%',
                width: '50%',
                background: 'var(--color-primary)',
              }}
            />
          )}

          {/* 등록된 블록들 — col 0 */}
          {col0.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              blockHeight={BLOCK_HEIGHT}
              offset="left-0"
              onClick={() => setModal({ mode: 'edit', block })}
            />
          ))}

          {/* 등록된 블록들 — col 1 */}
          {col1.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              blockHeight={BLOCK_HEIGHT}
              offset="left-1/2"
              onClick={() => setModal({ mode: 'edit', block })}
            />
          ))}
        </div>
      </div>

      {/* 모달 */}
      {modal && (
        <EventModal
          startSlot={modal.mode === 'create' ? modal.startSlot : modal.block.startSlot}
          endSlot={modal.mode === 'create' ? modal.endSlot : modal.block.endSlot}
          column={modal.mode === 'create' ? modal.column : modal.block.column}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          existing={modal.mode === 'edit' ? { label: modal.block.label, color: modal.block.color } : undefined}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
        />
      )}
    </section>
  );
}

function BlockItem({
  block,
  blockHeight,
  offset,
  onClick,
}: {
  block: TimeBlock;
  blockHeight: number;
  offset: string;
  onClick: () => void;
}) {
  const colors = blockColorMap[block.color];
  return (
    <div
      data-block
      className={`absolute w-1/2 rounded border cursor-pointer overflow-hidden flex items-center px-1 ${offset} ${colors.bg} ${colors.border} ${colors.text}`}
      style={{
        top: block.startSlot * blockHeight + 1,
        height: (block.endSlot - block.startSlot + 1) * blockHeight - 2,
        fontSize: 10,
        fontWeight: 600,
        zIndex: 10,
      }}
      onClick={onClick}
    >
      <span className="truncate">{block.label}</span>
    </div>
  );
}
