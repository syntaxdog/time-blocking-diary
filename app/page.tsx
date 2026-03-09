'use client';

import { useRouter } from 'next/navigation';
import { today } from '@/lib/utils';
import { useState } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import Sidebar from '@/components/Sidebar';

export default function HomePage() {
  const router = useRouter();
  const { userVision } = useDiaryStore();
  const [currentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const todayDate = today();
  const todayDay = new Date().getDate();

  // Calendar generation
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  function goToDiary(day: number) {
    const m = String(currentMonth.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    router.push(`/diary/${currentMonth.year}-${m}-${d}`);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">event_note</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Time Blocking Diary</h1>
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
        {/* Sidebar Navigation */}
        <Sidebar active="home" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm text-slate-500 font-medium mb-3">나의 비전 선언</h2>
            <p className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-600 tracking-tight leading-relaxed" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              &quot;{userVision || "비전 선언문이 없습니다. 프로필에서 작성해보세요."}&quot;
            </p>
          </div>

          {/* Calendar & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Calendar Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h3 className="text-lg font-bold text-slate-900">{monthName}</h3>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-7 text-center mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                  <div key={d} className="text-xs font-semibold text-slate-400 py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty slots for offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square" />
                ))}
                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === todayDay;
                  return (
                    <button
                      key={day}
                      onClick={() => goToDiary(day)}
                      className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        isToday
                          ? 'bg-[var(--color-primary)] text-white font-bold shadow-md'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big 3 Stats Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">이번 주 &apos;Big 3&apos; 달성률</h3>
                <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">자세히 보기</button>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-6">
                {[
                  { label: '1. 주요 프로젝트 마일스톤 완료', pct: 100 },
                  { label: '2. 주 3회 운동하기', pct: 66 },
                  { label: '3. 독서 1권 완독', pct: 40 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-sm font-bold text-slate-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, opacity: item.pct >= 100 ? 1 : 0.6 + (item.pct / 300) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">최근 데일리 로그</h3>
              <button className="text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors">모두 보기</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                {
                  date: '3월 8일 (토)',
                  color: 'bg-green-500',
                  text: '주말이지만 오전에 일찍 일어나서 계획했던 코딩 공부를 2시간 동안 집중해서 완료했다. 오후에는 산책...',
                  tags: ['코딩', '휴식'],
                },
                {
                  date: '3월 7일 (금)',
                  color: 'bg-green-500',
                  text: '업무 회의가 길어져서 타임블록 일정이 조금 밀렸지만, 우선순위에 따라 중요한 업무부터 처리하여 큰 문제는...',
                  tags: ['업무', '회의'],
                },
                {
                  date: '3월 6일 (목)',
                  color: 'bg-orange-400',
                  text: '컨디션이 좋지 않아 오후 일정을 많이 소화하지 못했다. 내일은 무리하지 않고 천천히 진행해야겠다.',
                  tags: ['건강'],
                },
              ].map((log) => (
                <div
                  key={log.date}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.color}`} />
                      <span className="text-sm font-semibold text-slate-700">{log.date}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--color-primary)] transition-colors text-lg">
                      open_in_new
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{log.text}</p>
                  <div className="flex gap-2">
                    {log.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
