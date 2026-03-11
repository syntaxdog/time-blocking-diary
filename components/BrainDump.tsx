'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function BrainDump({ date }: { date: string }) {
  const { diaries, addBrainItem, updateBrainItem, toggleBrainItem, removeBrainItem } = useDiaryStore();
  const items = diaries[date]?.brainDump ?? [];
  const checked = items.filter((i) => i.checked).length;
  const total = items.length;

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">list_alt</span>
          <h2 className="font-bold text-slate-800">브레인 덤프</h2>
          {total > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {checked}/{total}
            </span>
          )}
        </div>
        <button
          onClick={() => addBrainItem(date)}
          className="text-xs text-[var(--color-primary)] font-bold hover:underline transition-colors"
        >
          + 할 일 추가
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 ${item.checked ? 'opacity-50' : ''}`}>
            <label className="relative flex items-center justify-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleBrainItem(date, item.id)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-[4px] border-2 border-slate-300 peer-checked:bg-[var(--color-primary)] peer-checked:border-transparent flex items-center justify-center transition-all bg-white">
                {item.checked && (
                  <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                )}
              </div>
            </label>
            <input
              className={`flex-1 bg-transparent text-sm outline-none transition-colors ${item.checked ? 'line-through text-slate-400' : 'text-slate-600'
                }`}
              value={item.text}
              onChange={(e) => updateBrainItem(date, item.id, e.target.value)}
              placeholder="할 일 입력"
            />
            <button
              onClick={() => removeBrainItem(date, item.id)}
              className="text-slate-300 hover:text-red-400 flex-shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
          <p className="text-sm text-slate-500 italic">할 일을 추가해보세요</p>
        </div>
      )}
    </section>
  );
}
