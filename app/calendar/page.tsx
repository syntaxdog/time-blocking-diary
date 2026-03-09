'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Calendar generation
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  function prevMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToDiary(day: number) {
    const m = String(currentMonth.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    router.push(`/diary/${currentMonth.year}-${m}-${d}`);
  }

  // Sample schedule data
  const schedules = [
    { title: '기획 미팅', time: '오전 10:00 - 11:30', color: 'bg-blue-500' },
    { title: '디자인 시스템 업데이트', time: '오후 02:00 - 04:00', color: 'bg-purple-500' },
    { title: '오전 명상', time: '오전 08:00 - 08:30', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">event_note</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">타임 블로킹</h1>
          <span className="text-sm text-slate-400 ml-2">오늘도 생산적인 하루를!</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] transition-colors cursor-pointer ml-2 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="calendar" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-900">{monthName}</h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                  <div
                    key={d}
                    className={`text-sm font-semibold py-3 ${
                      i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square p-2" />
                ))}
                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday =
                    day === todayDate &&
                    currentMonth.month === todayMonth &&
                    currentMonth.year === todayYear;
                  const dayOfWeek = new Date(currentMonth.year, currentMonth.month, day).getDay();

                  return (
                    <button
                      key={day}
                      onClick={() => goToDiary(day)}
                      className={`aspect-square flex flex-col items-center justify-start p-2 rounded-xl text-sm font-medium transition-all hover:shadow-md ${
                        isToday
                          ? 'bg-[var(--color-primary)] text-white font-bold shadow-md ring-2 ring-[var(--color-primary)]/30'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`${
                          isToday
                            ? 'text-white'
                            : dayOfWeek === 0
                            ? 'text-red-400'
                            : dayOfWeek === 6
                            ? 'text-blue-400'
                            : ''
                        }`}
                      >
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">today</span>
                  오늘의 일정 ({now.getMonth() + 1}월 {now.getDate()}일)
                </h3>
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div
                      key={s.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className={`w-1.5 h-12 rounded-full ${s.color} shrink-0 mt-0.5`} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => goToDiary(todayDate)}
                  className="w-full mt-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  일정 추가하기
                </button>
              </div>

              {/* Monthly Progress */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">trending_up</span>
                  월간 진행도
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-slate-500">목표 달성률</span>
                    <span className="text-2xl font-bold text-slate-900">78%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[var(--color-primary)] to-blue-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  지난달보다 생산성이 <span className="text-green-500 font-semibold">12% 향상</span>
                  되었습니다. 훌륭한 페이스입니다!
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 leading-relaxed">
                    💡 &apos;타임 블로킹&apos;은 한 번에 한 가지 일에 집중하게 도와줍니다. 오늘 오후에는 알림을 끄고
                    집중 시간을 가져보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
