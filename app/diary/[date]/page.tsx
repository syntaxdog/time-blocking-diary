'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useDiaryStore } from '@/store/diaryStore';
import { displayDate, addDays } from '@/lib/utils';

import TimeBox from '@/components/TimeBox/TimeBox';
import BigThree from '@/components/BigThree';
import BrainDump from '@/components/BrainDump';
import Feedback from '@/components/Feedback';
import FutureViz from '@/components/FutureViz';
import Identity from '@/components/Identity';
import Motivation from '@/components/Motivation';
import Gratitude from '@/components/Gratitude';
import MorningRoutine from '@/components/MorningRoutine';

export default function DiaryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const router = useRouter();
  const { getOrCreate } = useDiaryStore();
  getOrCreate(date);

  // Parse date for display
  const dateObj = new Date(date + 'T00:00:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayEngNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dateObj.getDay();
  const monthDay = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  // Week day buttons
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const currentDayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0 to Sun=6

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-0 gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-[var(--color-primary)] p-2 rounded-lg text-white hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-2xl">event_note</span>
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{monthDay}</h1>
            <p className="text-slate-500 font-medium">{dayNames[dayOfWeek]}요일 · {dayEngNames[dayOfWeek]}</p>
          </div>
        </div>
        <nav className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {weekDays.map((d, idx) => (
            <button
              key={d}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                idx === currentDayIdx
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : idx >= 5
                  ? 'text-slate-400 hover:bg-slate-50'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </nav>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/diary/${addDays(date, -1)}`)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => router.push(`/diary/${addDays(date, 1)}`)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Mindset & Reflection */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1 min-w-0">
            <FutureViz date={date} />
            <Identity date={date} />
            <Motivation date={date} />
            <Gratitude date={date} />
          </div>

          {/* Middle Column: Execution & Priorities */}
          <div className="lg:col-span-5 space-y-6 order-3 lg:order-2 min-w-0">
            {/* Morning Routine */}
            <MorningRoutine date={date} />

            <BigThree date={date} />
            <BrainDump date={date} />
            <Feedback date={date} />
          </div>

          {/* Right Column: Time Box */}
          <div className="lg:col-span-4 order-1 lg:order-3 min-w-0">
            <TimeBox date={date} />
          </div>
        </div>
      </main>
    </div>
  );
}
