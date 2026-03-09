'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function MorningRoutine({ date }: { date: string }) {
  const { diaries, setField } = useDiaryStore();
  const diary = diaries[date];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-400 text-xl">wb_sunny</span>
          <h2 className="font-bold text-slate-800">기상 직후 할 일</h2>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Morning Routine</span>
      </div>
      <textarea
        className="w-full ruled-lines min-h-[80px] text-sm text-slate-600 resize-none bg-transparent border-none focus:ring-0 p-0 outline-none"
        placeholder="오늘 아침의 첫 단추를 채우세요..."
        maxLength={200}
        value={diary?.morningRoutine ?? ''}
        onChange={(e) => setField(date, 'morningRoutine', e.target.value)}
      />
    </section>
  );
}
