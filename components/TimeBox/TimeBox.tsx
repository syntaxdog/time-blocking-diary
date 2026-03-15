'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import { TOTAL_SLOTS, slotToTime, canChangeStartHour } from '@/lib/utils';
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

const BLOCK_HEIGHT_DESKTOP = 28;
const BLOCK_HEIGHT_MOBILE = 36;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function formatDuration(slots: number): string {
  const totalMin = slots * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

type ModalState =
  | { mode: 'create'; startSlot: number; endSlot: number }
  | { mode: 'edit'; block: TimeBlock };

type ResizeState = {
  blockId: string;
  edge: 'top' | 'bottom';
  originalStart: number;
  originalEnd: number;
  currentSlot: number;
};

type MoveState = {
  blockId: string;
  blockSize: number;
  originalStartSlot: number;
  originalEndSlot: number;
  grabOffsetSlots: number;
  currentTopSlot: number;
};

export default function TimeBox({ date }: { date: string }) {
  const isDark = useIsDark();
  const isMobile = useIsMobile();
  const BLOCK_HEIGHT = isMobile ? BLOCK_HEIGHT_MOBILE : BLOCK_HEIGHT_DESKTOP;
  const { diaries, addTimeBlock, updateTimeBlock, removeTimeBlock, timeBoxStartHour: globalStartHour, setDayStartHour } = useDiaryStore();
  const timeBlocks = diaries[date]?.timeBlocks ?? [];
  const big3Suggestions = (diaries[date]?.bigThree ?? [])
    .map((b) => b.text.trim())
    .filter(Boolean);

  // 날짜별 오버라이드 > 글로벌 기본값
  const startHour = diaries[date]?.timeBoxStartHour ?? globalStartHour;
  const [showStartHourPicker, setShowStartHourPicker] = useState(false);

  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);
  const [moveState, setMoveState] = useState<MoveState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressOrigin = useRef<{ x: number; y: number; blockId: string; pointerId: number } | null>(null);
  const displacementMap = useRef<Map<string, number>>(new Map());

  // 피커 외부 클릭 시 닫기
  useEffect(() => {
    if (!showStartHourPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowStartHourPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStartHourPicker]);

  // 모바일 탭 감지용 (드래그 없음 — 스크롤 충돌 방지)
  const mobileTouch = useRef<{ startY: number; startX: number; slot: number } | null>(null);

  function pointerToSlot(clientY: number): number {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const slot = Math.floor(y / BLOCK_HEIGHT);
    return Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));
  }

  // 리사이즈 시작 핸들러
  const onResizeStart = useCallback((e: React.PointerEvent, blockId: string, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();
    const block = timeBlocks.find((b) => b.id === blockId);
    if (!block) return;
    gridRef.current?.setPointerCapture(e.pointerId);
    setResize({
      blockId,
      edge,
      originalStart: block.startSlot,
      originalEnd: block.endSlot,
      currentSlot: pointerToSlot(e.clientY),
    });
  }, [timeBlocks, BLOCK_HEIGHT]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return;
    if (isMobile) {
      // 모바일: setPointerCapture 절대 안 함 → 브라우저 스크롤 자유롭게
      mobileTouch.current = {
        startY: e.clientY,
        startX: e.clientX,
        slot: pointerToSlot(e.clientY),
      };
    } else {
      // 데스크톱: 즉시 드래그
      e.currentTarget.setPointerCapture(e.pointerId);
      const slot = pointerToSlot(e.clientY);
      setDragStart(slot);
      setDragEnd(slot);
      setIsDragging(true);
    }
  }, [isMobile, BLOCK_HEIGHT]);

  // 리사이즈 시 다른 블록과 겹치지 않도록 슬롯 제한
  const clampResizeSlot = useCallback((slot: number, blockId: string, edge: 'top' | 'bottom', originalStart: number, originalEnd: number) => {
    const others = timeBlocks.filter((b) => b.id !== blockId);
    if (edge === 'top') {
      // 위로 늘릴 때: 바로 위 블록의 endSlot + 1 이하로 못 감
      let minSlot = 0;
      for (const b of others) {
        if (b.endSlot < originalEnd && b.endSlot >= minSlot) {
          minSlot = b.endSlot + 1;
        }
      }
      return Math.max(slot, minSlot);
    } else {
      // 아래로 늘릴 때: 바로 아래 블록의 startSlot - 1 이상으로 못 감
      let maxSlot = TOTAL_SLOTS - 1;
      for (const b of others) {
        if (b.startSlot > originalStart && b.startSlot <= maxSlot + 1) {
          maxSlot = b.startSlot - 1;
        }
      }
      return Math.min(slot, maxSlot);
    }
  }, [timeBlocks]);

  // 밀림 알고리즘: 드래그 블록 위치 기준으로 겹치는 블록을 위/아래로 밀기
  const calculateDisplacement = useCallback((
    dragStart: number, dragEnd: number, draggedId: string,
  ) => {
    const others = timeBlocks
      .filter((b) => b.id !== draggedId)
      .sort((a, b) => a.startSlot - b.startSlot);

    const newDisplacements = new Map<string, number>();

    for (const block of others) {
      const overlaps = block.startSlot <= dragEnd && block.endSlot >= dragStart;
      if (!overlaps) {
        newDisplacements.set(block.id, 0);
        continue;
      }

      const blockCenter = (block.startSlot + block.endSlot) / 2;
      const dragCenter = (dragStart + dragEnd) / 2;

      let pushSlots: number;
      if (blockCenter <= dragCenter) {
        // 위로 밀기
        pushSlots = dragStart - block.endSlot - 1;
      } else {
        // 아래로 밀기
        pushSlots = dragEnd - block.startSlot + 1;
      }

      // 경계 클램핑
      const newStart = block.startSlot + pushSlots;
      const newEnd = block.endSlot + pushSlots;
      if (newStart < 0) pushSlots -= newStart;
      if (newEnd > TOTAL_SLOTS - 1) pushSlots -= (newEnd - (TOTAL_SLOTS - 1));

      newDisplacements.set(block.id, pushSlots * BLOCK_HEIGHT);
    }

    // DOM 직접 조작 (리렌더 없이 애니메이션)
    for (const [blockId, offset] of newDisplacements) {
      const el = gridRef.current?.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
      if (el) {
        el.style.transform = offset === 0 ? '' : `translateY(${offset}px)`;
      }
    }

    displacementMap.current = newDisplacements;
  }, [timeBlocks, BLOCK_HEIGHT]);

  // 블록 위 pointerDown → 롱프레스 감지 시작
  const onBlockPointerDown = useCallback((e: React.PointerEvent, blockId: string) => {
    // 리사이즈 핸들이면 무시
    if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
    e.stopPropagation();

    longPressOrigin.current = {
      x: e.clientX, y: e.clientY, blockId, pointerId: e.pointerId,
    };

    longPressTimer.current = setTimeout(() => {
      const block = timeBlocks.find((b) => b.id === blockId);
      if (!block || !longPressOrigin.current) return;

      const slot = pointerToSlot(longPressOrigin.current.y);
      const grabOffset = Math.max(0, slot - block.startSlot);

      // 햅틱 피드백
      if (navigator.vibrate) navigator.vibrate(50);

      // 포인터 캡처
      gridRef.current?.setPointerCapture(longPressOrigin.current.pointerId);

      setMoveState({
        blockId,
        blockSize: block.endSlot - block.startSlot + 1,
        originalStartSlot: block.startSlot,
        originalEndSlot: block.endSlot,
        grabOffsetSlots: grabOffset,
        currentTopSlot: block.startSlot,
      });
    }, 300);
  }, [timeBlocks, BLOCK_HEIGHT]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // 롱프레스 대기 중: 이동 거리 크면 취소
    if (longPressOrigin.current && !moveState) {
      const dx = Math.abs(e.clientX - longPressOrigin.current.x);
      const dy = Math.abs(e.clientY - longPressOrigin.current.y);
      if (dx > 5 || dy > 5) {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        longPressOrigin.current = null;
      }
      return;
    }

    // 이동 모드
    if (moveState) {
      const rawSlot = pointerToSlot(e.clientY);
      const newTopSlot = Math.max(0, Math.min(TOTAL_SLOTS - moveState.blockSize, rawSlot - moveState.grabOffsetSlots));

      // 드래그 블록 DOM 직접 조작
      const draggedEl = gridRef.current?.querySelector(`[data-block-id="${moveState.blockId}"]`) as HTMLElement;
      if (draggedEl) {
        const deltaPixels = (newTopSlot - moveState.originalStartSlot) * BLOCK_HEIGHT;
        draggedEl.style.transform = `translateY(${deltaPixels}px) scale(1.03)`;
        draggedEl.style.zIndex = '50';
        draggedEl.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        draggedEl.style.opacity = '0.9';
        draggedEl.style.transition = 'box-shadow 0.2s ease, opacity 0.2s ease';
      }

      // 다른 블록 밀림 계산
      calculateDisplacement(newTopSlot, newTopSlot + moveState.blockSize - 1, moveState.blockId);
      setMoveState((prev) => prev ? { ...prev, currentTopSlot: newTopSlot } : null);
      return;
    }

    // 리사이즈 중 (데스크톱 전용)
    if (resize) {
      const rawSlot = pointerToSlot(e.clientY);
      const clampedSlot = clampResizeSlot(rawSlot, resize.blockId, resize.edge, resize.originalStart, resize.originalEnd);
      setResize((prev) => prev ? { ...prev, currentSlot: clampedSlot } : null);
      return;
    }
    if (!isDragging) return;
    setDragEnd(pointerToSlot(e.clientY));
  }, [resize, isDragging, moveState, BLOCK_HEIGHT, clampResizeSlot, calculateDisplacement]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    // 롱프레스 타이머 취소
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // 롱프레스 대기 중 짧은 탭 → 편집 모달
    if (longPressOrigin.current && !moveState) {
      const blockId = longPressOrigin.current.blockId;
      longPressOrigin.current = null;
      const block = timeBlocks.find((b) => b.id === blockId);
      if (block) {
        e.preventDefault();
        setModal({ mode: 'edit', block });
      }
      return;
    }

    // 이동 모드 드롭
    if (moveState) {
      const rawSlot = pointerToSlot(e.clientY);
      const finalTopSlot = Math.max(0, Math.min(TOTAL_SLOTS - moveState.blockSize, rawSlot - moveState.grabOffsetSlots));
      const finalEndSlot = finalTopSlot + moveState.blockSize - 1;

      // 모든 DOM 스타일 초기화
      const allBlockEls = gridRef.current?.querySelectorAll('[data-block-id]');
      allBlockEls?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = '';
        htmlEl.style.transition = '';
        htmlEl.style.zIndex = '';
        htmlEl.style.boxShadow = '';
        htmlEl.style.opacity = '';
      });

      // 드래그 블록 위치 커밋
      updateTimeBlock(date, moveState.blockId, {
        startSlot: finalTopSlot,
        endSlot: finalEndSlot,
      });

      // 밀린 블록들 위치 커밋
      for (const [blockId, offsetPx] of displacementMap.current) {
        if (offsetPx !== 0) {
          const block = timeBlocks.find((b) => b.id === blockId);
          if (block) {
            const offsetSlots = Math.round(offsetPx / BLOCK_HEIGHT);
            updateTimeBlock(date, blockId, {
              startSlot: block.startSlot + offsetSlots,
              endSlot: block.endSlot + offsetSlots,
            });
          }
        }
      }

      displacementMap.current.clear();
      setMoveState(null);
      longPressOrigin.current = null;
      return;
    }

    // 리사이즈 완료 (데스크톱 전용)
    if (resize) {
      const rawSlot = pointerToSlot(e.clientY);
      const slot = clampResizeSlot(rawSlot, resize.blockId, resize.edge, resize.originalStart, resize.originalEnd);
      let newStart = resize.originalStart;
      let newEnd = resize.originalEnd;
      if (resize.edge === 'top') {
        newStart = Math.min(slot, resize.originalEnd);
      } else {
        newEnd = Math.max(slot, resize.originalStart);
      }
      updateTimeBlock(date, resize.blockId, { startSlot: newStart, endSlot: newEnd });
      setResize(null);
      return;
    }
    // 모바일: 손 뗄 때 이동 거리 작으면 탭으로 처리
    if (isMobile && mobileTouch.current) {
      const dx = Math.abs(e.clientX - mobileTouch.current.startX);
      const dy = Math.abs(e.clientY - mobileTouch.current.startY);
      const slot = mobileTouch.current.slot;
      mobileTouch.current = null;
      if (dx < 8 && dy < 8) {
        e.preventDefault();
        setModal({ mode: 'create', startSlot: slot, endSlot: slot });
      }
      return;
    }
    // 데스크톱 드래그 완료
    if (!isDragging || dragStart === null) return;
    setIsDragging(false);
    e.preventDefault();
    const end = pointerToSlot(e.clientY);
    const startSlot = Math.min(dragStart, end);
    const endSlot = Math.max(dragStart, end);
    setModal({ mode: 'create', startSlot, endSlot });
    setDragStart(null);
    setDragEnd(null);
  }, [resize, isMobile, isDragging, dragStart, moveState, timeBlocks, date, updateTimeBlock, BLOCK_HEIGHT, clampResizeSlot]);

  const onPointerCancel = useCallback(() => {
    // 롱프레스 취소
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressOrigin.current = null;

    // 이동 모드 취소 — DOM 초기화
    if (moveState) {
      gridRef.current?.querySelectorAll('[data-block-id]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = '';
        htmlEl.style.transition = '';
        htmlEl.style.zIndex = '';
        htmlEl.style.boxShadow = '';
        htmlEl.style.opacity = '';
      });
      setMoveState(null);
      displacementMap.current.clear();
    }

    mobileTouch.current = null;
    setResize(null);
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    }
  }, [isDragging, moveState]);

  const highlightStart = dragStart !== null && dragEnd !== null ? Math.min(dragStart, dragEnd) : null;
  const highlightEnd = dragStart !== null && dragEnd !== null ? Math.max(dragStart, dragEnd) : null;

  // 리사이즈 미리보기 슬롯 계산
  const resizePreview = resize
    ? {
        startSlot: resize.edge === 'top'
          ? Math.min(resize.currentSlot, resize.originalEnd)
          : resize.originalStart,
        endSlot: resize.edge === 'bottom'
          ? Math.max(resize.currentSlot, resize.originalStart)
          : resize.originalEnd,
      }
    : null;

  function handleConfirm(label: string, color: BlockColor, startSlot: number, endSlot: number) {
    if (!modal) return;
    if (modal.mode === 'create') {
      addTimeBlock(date, { startSlot, endSlot, label, color, column: 0 });
    } else {
      updateTimeBlock(date, modal.block.id, { label, color, startSlot, endSlot });
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
        <div className="flex items-center gap-2">
          {/* 시작시간 설정 버튼 */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowStartHourPicker((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
              title="타임박스 시작시간 변경"
            >
              <span className="material-symbols-outlined text-sm">alarm</span>
              {String(startHour).padStart(2, '0')}:00~
            </button>
            {showStartHourPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 w-48 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">시작시간 (이 날짜)</p>
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <button
                      key={h}
                      onClick={() => {
                        if (!canChangeStartHour(timeBlocks, startHour, h)) {
                          alert('기존 일정이 변경하려는 시간 범위와 충돌합니다. 해당 일정을 먼저 삭제하거나 이동해주세요.');
                          return;
                        }
                        setDayStartHour(date, h);
                        setShowStartHourPicker(false);
                      }}
                      className={`text-xs py-1.5 rounded font-medium transition-colors ${
                        h === startHour
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String(h).padStart(2, '0')}시
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">30-min</span>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-slate-400">드래그로 시간 블록을 만드세요</p>
      </div>

      <div className="px-4 pb-4 overflow-y-auto flex-1 max-h-[830px]">
        <div className="relative" style={{ height: TOTAL_SLOTS * BLOCK_HEIGHT, marginTop: 8 }}>
          {/* 시간 레이블 (absolute, 격자선에 걸침) */}
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) =>
            i % 2 === 0 ? (
              <div key={`t${i}`} className="absolute left-0 text-right pr-2"
                style={{
                  top: i * BLOCK_HEIGHT,
                  width: 44,
                  fontSize: isMobile ? 11 : 10,
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {slotToTime(i, startHour)}
              </div>
            ) : null
          )}

          {/* 그리드 */}
          <div
            ref={gridRef}
            className="absolute top-0 bottom-0 right-0 no-select"
            style={{ left: 48, touchAction: moveState ? 'none' : isMobile ? 'pan-y' : (isDragging ? 'none' : 'auto') }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
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
            {highlightStart !== null && highlightEnd !== null && (() => {
              const slots = highlightEnd - highlightStart + 1;
              const top = highlightStart * BLOCK_HEIGHT;
              const height = slots * BLOCK_HEIGHT;
              const labelAbove = slots <= 2 && top >= 28;
              const labelBelow = slots <= 2 && top < 28;
              return (
                <>
                  {/* 배경 오버레이 */}
                  <div
                    className="absolute pointer-events-none rounded-sm left-0 w-full"
                    style={{ top, height, background: 'color-mix(in srgb, var(--color-primary) 25%, transparent)' }}
                  />
                  {/* 시간 레이블 */}
                  <div
                    className="absolute left-0 w-full flex flex-col items-center pointer-events-none select-none"
                    style={{ top: labelAbove ? top - 28 : labelBelow ? top + height : top, height: (labelAbove || labelBelow) ? 28 : height, justifyContent: 'center', display: 'flex', flexDirection: 'column' }}
                  >
                    <span className="text-[var(--color-primary)] font-bold text-xs leading-tight">
                      {slotToTime(highlightStart, startHour)} ~ {slotToTime(highlightEnd + 1, startHour)}
                    </span>
                    <span className="text-[var(--color-primary)] text-[10px] mt-0.5 opacity-70">
                      {formatDuration(slots)}
                    </span>
                  </div>
                </>
              );
            })()}

            {/* 등록된 블록들 */}
            {timeBlocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                blockHeight={BLOCK_HEIGHT}
                onClick={() => setModal({ mode: 'edit', block })}
                onResizeStart={onResizeStart}
                onBlockPointerDown={onBlockPointerDown}
                resizePreview={resize?.blockId === block.id ? resizePreview : null}
                isBeingMoved={moveState?.blockId === block.id}
                isMobile={isMobile}
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
          suggestions={modal.mode === 'create' ? big3Suggestions : undefined}
          startHour={startHour}
        />
      )}
    </section>
  );
}

const accentColorMap = {
  light: {
    red: { bar: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
    blue: { bar: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
    green: { bar: '#22c55e', bg: '#f0fdf4', text: '#166534' },
    yellow: { bar: '#eab308', bg: '#fefce8', text: '#854d0e' },
    purple: { bar: '#a855f7', bg: '#faf5ff', text: '#6b21a8' },
    orange: { bar: '#f97316', bg: '#fff7ed', text: '#9a3412' },
    gray: { bar: '#6b7280', bg: '#f8fafc', text: '#374151' },
  },
  dark: {
    red: { bar: '#f87171', bg: '#3b1a1e', text: '#fca5a5' },
    blue: { bar: '#60a5fa', bg: '#142240', text: '#93c5fd' },
    green: { bar: '#4ade80', bg: '#143024', text: '#86efac' },
    yellow: { bar: '#facc15', bg: '#3b3014', text: '#fde68a' },
    purple: { bar: '#c084fc', bg: '#241638', text: '#d8b4fe' },
    orange: { bar: '#fb923c', bg: '#3b1a0e', text: '#fdba74' },
    gray: { bar: '#9ca3af', bg: '#1e2330', text: '#d1d5db' },
  },
} as const;

function BlockItem({
  block,
  blockHeight,
  onClick,
  onResizeStart,
  onBlockPointerDown,
  resizePreview,
  isBeingMoved,
  isMobile,
}: {
  block: TimeBlock;
  blockHeight: number;
  onClick: () => void;
  onResizeStart: (e: React.PointerEvent, blockId: string, edge: 'top' | 'bottom') => void;
  onBlockPointerDown: (e: React.PointerEvent, blockId: string) => void;
  resizePreview: { startSlot: number; endSlot: number } | null;
  isBeingMoved?: boolean;
  isMobile: boolean;
}) {
  const isDark = useIsDark();
  const palette = isDark ? accentColorMap.dark : accentColorMap.light;
  const accent = palette[block.color] ?? palette.blue;

  const displayStart = resizePreview?.startSlot ?? block.startSlot;
  const displayEnd = resizePreview?.endSlot ?? block.endSlot;
  const isResizing = resizePreview !== null;

  return (
    <div
      data-block
      data-block-id={block.id}
      className="absolute w-full rounded-md overflow-hidden"
      style={{
        top: displayStart * blockHeight + 1,
        height: (displayEnd - displayStart + 1) * blockHeight - 2,
        background: accent.bg,
        borderLeft: `3px solid ${accent.bar}`,
        color: accent.text,
        fontSize: blockHeight > 30 ? 13 : 11,
        fontWeight: 600,
        zIndex: isResizing ? 20 : isBeingMoved ? 50 : 10,
        opacity: isResizing ? 0.85 : 1,
        cursor: 'pointer',
      }}
      onClick={onClick}
      onPointerDown={(e) => onBlockPointerDown(e, block.id)}
    >
      {/* 상단 리사이즈 핸들 (데스크톱 전용) */}
      {!isMobile && (
        <div
          data-resize-handle
          className="absolute top-0 left-0 w-full flex items-center justify-center"
          style={{ height: 8, cursor: 'ns-resize', zIndex: 2 }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, block.id, 'top');
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: 24, height: 2, borderRadius: 1, background: 'currentColor', opacity: 0.2 }} />
        </div>
      )}

      {/* 레이블 */}
      <div className="flex items-center h-full" style={{ paddingLeft: 8, paddingRight: 4, paddingTop: 8, paddingBottom: 8 }}>
        <span className="truncate">{block.label}</span>
      </div>

      {/* 하단 리사이즈 핸들 (데스크톱 전용) */}
      {!isMobile && (
        <div
          data-resize-handle
          className="absolute bottom-0 left-0 w-full flex items-center justify-center"
          style={{ height: 8, cursor: 'ns-resize', zIndex: 2 }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, block.id, 'bottom');
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: 24, height: 2, borderRadius: 1, background: 'currentColor', opacity: 0.2 }} />
        </div>
      )}
    </div>
  );
}
