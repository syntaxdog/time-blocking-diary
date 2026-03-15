'use client';

import { useState, useEffect } from 'react';
import type { BlockColor, TimeBlock } from '@/types/diary';
import { slotToTime, TOTAL_SLOTS } from '@/lib/utils';

const COLORS: { value: BlockColor; label: string; bg: string; dot: string }[] = [
  { value: 'blue',   label: '업무',      bg: '#eff6ff', dot: '#3b82f6' },
  { value: 'purple', label: '학습/공부', bg: '#faf5ff', dot: '#a855f7' },
  { value: 'green',  label: '운동/건강', bg: '#f0fdf4', dot: '#22c55e' },
  { value: 'orange', label: '관계/소통', bg: '#fff7ed', dot: '#f97316' },
  { value: 'yellow', label: '휴식/여가', bg: '#fefce8', dot: '#eab308' },
  { value: 'red',    label: '생활관리', bg: '#fef2f2', dot: '#ef4444' },
  { value: 'gray',   label: '기타',      bg: '#f8fafc', dot: '#6b7280' },
];

type Props = {
  startSlot: number;
  endSlot: number;
  onConfirm: (label: string, color: BlockColor, startSlot: number, endSlot: number) => void;
  onCancel: () => void;
  existing?: Pick<TimeBlock, 'label' | 'color'>;
  onDelete?: () => void;
  suggestions?: string[];
  startHour?: number;
};

export default function EventModal({ startSlot, endSlot, onConfirm, onCancel, existing, onDelete, suggestions, startHour = 4 }: Props) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [color, setColor] = useState<BlockColor>(existing?.color ?? 'blue');
  const [localStart, setLocalStart] = useState(startSlot);
  const [localEnd, setLocalEnd] = useState(endSlot);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  function adjustStart(delta: number) {
    setLocalStart((s) => {
      const next = Math.max(0, Math.min(localEnd, s + delta));
      return next;
    });
  }

  function adjustEnd(delta: number) {
    setLocalEnd((e) => {
      const next = Math.max(localStart, Math.min(TOTAL_SLOTS - 1, e + delta));
      return next;
    });
  }

  const slots = localEnd - localStart + 1;
  const totalMin = slots * 30;
  const dh = Math.floor(totalMin / 60);
  const dm = totalMin % 60;
  const durationLabel = dh > 0 && dm > 0 ? `${dh}시간 ${dm}분` : dh > 0 ? `${dh}시간` : `${dm}분`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={existing ? '일정 수정' : '일정 등록'}
        className="w-full sm:w-80 rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 shadow-xl pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
            {existing ? '일정 수정' : '일정 등록'}
          </h3>
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
            {durationLabel}
          </span>
        </div>

        {/* 시간 조정 */}
        <div className="flex flex-col gap-2 rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <TimeRow label="시작" time={slotToTime(localStart, startHour)} onMinus={() => adjustStart(-1)} onPlus={() => adjustStart(1)} disableMinus={localStart <= 0} disablePlus={localStart >= localEnd} />
          <div style={{ height: 1, background: 'var(--color-border)' }} />
          <TimeRow label="종료" time={slotToTime(localEnd + 1, startHour)} onMinus={() => adjustEnd(-1)} onPlus={() => adjustEnd(1)} disableMinus={localEnd <= localStart} disablePlus={localEnd >= TOTAL_SLOTS - 1} />
        </div>

        {/* 일정명 */}
        <input
          autoFocus
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          placeholder="일정명"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && label.trim() && onConfirm(label.trim(), color, localStart, localEnd)}
        />

        {/* BIG3 빠른 선택 */}
        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Big 3에서 선택
            </span>
            <div className="flex flex-col gap-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setLabel(s)}
                  className="text-left text-xs px-3 py-1.5 rounded-lg border transition-colors truncate"
                  style={{
                    borderColor: label === s ? 'var(--color-primary)' : 'var(--color-border)',
                    background: label === s ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'var(--color-bg)',
                    color: label === s ? 'var(--color-primary)' : undefined,
                    fontWeight: label === s ? 600 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 카테고리 선택 */}
        <div className="grid grid-cols-2 gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left"
              style={{
                borderColor: color === c.value ? c.dot : 'var(--color-border)',
                background: color === c.value ? c.bg : 'var(--color-bg)',
                color: color === c.value ? c.dot : 'var(--color-muted)',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              {c.label}
            </button>
          ))}
        </div>

        {/* 버튼들 */}
        <div className="flex gap-2">
          {existing && onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 rounded-xl py-2 text-sm font-semibold text-red-400 border transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
            >
              삭제
            </button>
          )}
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2 text-sm border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            취소
          </button>
          <button
            onClick={() => label.trim() && onConfirm(label.trim(), color, localStart, localEnd)}
            disabled={!label.trim()}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeRow({ label, time, onMinus, onPlus, disableMinus, disablePlus }: {
  label: string;
  time: string;
  onMinus: () => void;
  onPlus: () => void;
  disableMinus: boolean;
  disablePlus: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold w-8" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMinus}
          disabled={disableMinus}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
          style={{ background: 'var(--color-border)', color: 'var(--color-primary)' }}
        >
          −
        </button>
        <span className="text-sm font-bold tabular-nums w-12 text-center" style={{ color: 'var(--color-primary)' }}>
          {time}
        </span>
        <button
          type="button"
          onClick={onPlus}
          disabled={disablePlus}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
          style={{ background: 'var(--color-border)', color: 'var(--color-primary)' }}
        >
          +
        </button>
      </div>
    </div>
  );
}
