'use client';

import { useState, useEffect } from 'react';
import type { BlockColor, TimeBlock } from '@/types/diary';
import { slotToTime } from '@/lib/utils';

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
  onConfirm: (label: string, color: BlockColor) => void;
  onCancel: () => void;
  existing?: Pick<TimeBlock, 'label' | 'color'>;
  onDelete?: () => void;
  suggestions?: string[];
};

export default function EventModal({ startSlot, endSlot, onConfirm, onCancel, existing, onDelete, suggestions }: Props) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [color, setColor] = useState<BlockColor>(existing?.color ?? 'blue');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={existing ? '일정 수정' : '일정 등록'}
        className="w-80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
        style={{ background: 'var(--color-surface)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
            {existing ? '일정 수정' : '일정 등록'}
          </h3>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {slotToTime(startSlot)} ~ {slotToTime(endSlot + 1)}
          </span>
        </div>

        {/* 일정명 */}
        <input
          autoFocus
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          placeholder="일정명"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && label.trim() && onConfirm(label.trim(), color)}
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
            onClick={() => label.trim() && onConfirm(label.trim(), color)}
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
