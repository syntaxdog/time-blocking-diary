'use client';

import { useState } from 'react';
import type { BlockColor, TimeBlock } from '@/types/diary';
import { slotToTime } from '@/lib/utils';

const COLORS: { value: BlockColor; label: string; bg: string }[] = [
  { value: 'red', label: '빨강', bg: '#FCA5A5' },
  { value: 'blue', label: '파랑', bg: '#93C5FD' },
  { value: 'green', label: '초록', bg: '#86EFAC' },
  { value: 'yellow', label: '노랑', bg: '#FDE68A' },
  { value: 'purple', label: '보라', bg: '#C4B5FD' },
];

type Props = {
  startSlot: number;
  endSlot: number;
  onConfirm: (label: string, color: BlockColor) => void;
  onCancel: () => void;
  existing?: Pick<TimeBlock, 'label' | 'color'>;
  onDelete?: () => void;
};

export default function EventModal({ startSlot, endSlot, onConfirm, onCancel, existing, onDelete }: Props) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [color, setColor] = useState<BlockColor>(existing?.color ?? 'red');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
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

        {/* 색상 선택 */}
        <div className="flex gap-2 justify-center">
          {COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setColor(c.value)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c.bg,
                borderColor: color === c.value ? 'var(--color-text)' : 'transparent',
                transform: color === c.value ? 'scale(1.2)' : undefined,
              }}
            />
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
