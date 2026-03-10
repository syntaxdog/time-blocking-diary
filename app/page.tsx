'use client';

import { useRouter } from 'next/navigation';

import { useState, useMemo } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import Sidebar from '@/components/Sidebar';

export default function HomePage() {
  const router = useRouter();
  const { userVision, diaries } = useDiaryStore();
  const [currentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

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

  // 이번 주 월~일 날짜
  const weekDates = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  }, []);

  // 요일별 Big3 달성률
  const weeklyBig3 = useMemo(() => {
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const d = new Date().getDay();
    const todayIdx = d === 0 ? 6 : d - 1;
    return weekDates.map((dateStr, i) => {
      const isFuture = i > todayIdx;
      const diary = diaries[dateStr];
      if (!diary) return { day: dayLabels[i], value: 0, hasData: false, isToday: i === todayIdx, isFuture };
      const checked = diary.bigThree.filter((b) => b.checked).length;
      return { day: dayLabels[i], value: Math.round((checked / 3) * 100), hasData: true, isToday: i === todayIdx, isFuture };
    });
  }, [weekDates, diaries]);

  // 최근 데일리 로그 (최신 3개)
  const colorLabel: Record<string, string> = {
    blue: '업무', purple: '학습/공부', green: '운동/건강',
    orange: '관계/소통', yellow: '휴식/여가', red: '생활관리', gray: '기타',
  };

  const recentLogs = useMemo(() => {
    return Object.entries(diaries)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([dateStr, diary]) => {
        const d = new Date(dateStr);
        const label = d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
        const checkedCount = diary.bigThree.filter((b) => b.checked).length;
        const dotColor =
          checkedCount === 3 ? 'bg-green-500' : checkedCount >= 1 ? 'bg-orange-400' : 'bg-slate-300';
        const bigTexts = diary.bigThree.map((b) => b.text).filter(Boolean);
        const summary = bigTexts.length > 0 ? bigTexts.join(' · ') : '(기록 없음)';
        const usedColors = [...new Set(diary.timeBlocks.map((b) => b.color))];
        const tags = usedColors.map((c) => colorLabel[c]).filter(Boolean).slice(0, 2);
        return { dateStr, label, dotColor, summary, tags };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaries]);

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
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square" />
                ))}
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

            {/* Big 3 Stats Card — 이번 주 요일별 달성률 */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5">
              {/* 헤더 */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">이번 주 Big 3 달성률</h3>
                  <p className="text-xs text-slate-400 mt-0.5">매일 3가지 목표 달성 현황</p>
                </div>
                {(() => {
                  const recorded = weeklyBig3.filter((d) => d.hasData && !d.isFuture);
                  const avg = recorded.length > 0
                    ? Math.round(recorded.reduce((s, d) => s + d.value, 0) / recorded.length)
                    : null;
                  return avg !== null ? (
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-extrabold text-indigo-600">{avg}%</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">주간 평균</span>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* 차트 */}
              <div className="flex-1 flex items-end gap-2 mt-2 min-h-[180px] max-h-[240px]">
                {weeklyBig3.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <span
                      className="text-xs font-bold leading-none mt-auto shrink-0"
                      style={{
                        color: item.isFuture ? 'transparent'
                          : item.hasData || item.isToday ? '#4f46e5'
                          : 'transparent',
                        minHeight: 16,
                      }}
                    >
                      {item.isFuture ? '·' : item.hasData || item.isToday ? `${item.value}%` : '·'}
                    </span>
                    <div
                      className="w-full rounded-xl overflow-hidden relative flex-1"
                      style={{
                        background: item.isFuture ? 'transparent' : '#f1f5f9',
                        border: item.isFuture ? '1.5px dashed #e2e8f0' : 'none',
                        minHeight: '60px',
                      }}
                    >
                      {!item.isFuture && (
                        <div
                          className="absolute bottom-0 w-full rounded-xl transition-all duration-700"
                          style={{
                            height: `${item.value}%`,
                            background: item.hasData || item.isToday
                              ? 'linear-gradient(to top, #4f46e5, #818cf8)'
                              : 'transparent',
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[11px] font-bold shrink-0"
                      style={{
                        color: item.isFuture ? '#e2e8f0'
                          : item.hasData || item.isToday ? '#4f46e5'
                          : '#94a3b8',
                      }}
                    >
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              {weeklyBig3.every((d) => !d.hasData || d.isFuture) && weeklyBig3.filter(d => !d.isFuture).every(d => !d.hasData) && (
                <p className="text-center text-slate-400 text-sm -mt-2">이번 주 기록이 아직 없어요</p>
              )}
            </div>
          </div>

          {/* Recent Logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">최근 데일리 로그</h3>
              <button className="text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors">모두 보기</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentLogs.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">edit_note</span>
                  아직 기록이 없어요. 오늘의 다이어리를 작성해보세요!
                </div>
              ) : recentLogs.map((log) => (
                <div
                  key={log.dateStr}
                  onClick={() => router.push(`/diary/${log.dateStr}`)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.dotColor}`} />
                      <span className="text-sm font-semibold text-slate-700">{log.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--color-primary)] transition-colors text-lg">
                      open_in_new
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{log.summary}</p>
                  <div className="flex gap-2 flex-wrap">
                    {log.tags.length > 0 ? log.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {tag}
                      </span>
                    )) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-xs rounded-md">타임블록 없음</span>
                    )}
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
