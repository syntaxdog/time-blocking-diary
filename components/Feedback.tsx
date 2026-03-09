'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function Feedback({ date }: { date: string }) {
  const { diaries, setFeedback } = useDiaryStore();
  const diary = diaries[date];
  const feedback = diary?.feedback ?? { morning: '', afternoon: '', evening: '' };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">reviews</span>
        <h2 className="font-bold text-slate-800">오늘의 피드백</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { key: 'morning' as const, label: 'Morning', placeholder: '계획대로 시작했나요?' },
          { key: 'afternoon' as const, label: 'Afternoon', placeholder: '집중도는 어땠나요?' },
          { key: 'evening' as const, label: 'Evening', placeholder: '내일의 준비는?' },
        ]).map((item) => (
          <div key={item.key} className="p-3 bg-slate-50 rounded-lg">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{item.label}</p>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs text-slate-600 resize-none h-16 outline-none"
              placeholder={item.placeholder}
              value={feedback[item.key]}
              onChange={(e) => setFeedback(date, item.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
