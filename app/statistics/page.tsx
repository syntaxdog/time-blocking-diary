'use client';

import { useMemo } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import { slotToTime } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

export default function StatisticsPage() {
  const { diaries } = useDiaryStore();

  // Get current week's dates (Mon-Sun)
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday.toISOString().slice(0, 10)]);

  // Weekly Big 3 data from store
  const weeklyBig3 = useMemo(() => {
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    return weekDates.map((dateStr, i) => {
      const diary = diaries[dateStr];
      if (!diary) return { day: dayLabels[i], value: 0 };
      const filledCount = diary.bigThree.filter((b) => b.trim() !== '').length;
      const pct = Math.round((filledCount / 3) * 100);
      return { day: dayLabels[i], value: pct };
    });
  }, [weekDates, diaries]);

  // Completed brain dump items across all entries
  const totalCompletedTasks = useMemo(() => {
    return Object.values(diaries).reduce((sum, diary) => {
      return sum + diary.brainDump.filter((item) => item.checked).length;
    }, 0);
  }, [diaries]);

  // Streak calculation
  const { streakCount, streakDays } = useMemo(() => {
    const today = new Date();
    let count = 0;
    const days: boolean[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const hasEntry = !!diaries[key];
      days.unshift(hasEntry);
      if (i === 0 || count > 0) {
        if (hasEntry) count++;
        else if (i > 0) break;
      }
    }
    return { streakCount: count, streakDays: days };
  }, [diaries]);

  // Total diary entries
  const totalEntries = Object.keys(diaries).length;

  // Average time blocks per day
  const avgTimeBlocks = useMemo(() => {
    const entries = Object.values(diaries);
    if (entries.length === 0) return 0;
    const totalBlocks = entries.reduce((sum, d) => sum + d.timeBlocks.length, 0);
    return (totalBlocks / entries.length).toFixed(1);
  }, [diaries]);

  // Time distribution from color categories
  const timeDistribution = useMemo(() => {
    const colorMap: Record<string, { label: string; count: number; cssColor: string }> = {
      blue: { label: '업무/공부', count: 0, cssColor: 'bg-blue-500' },
      green: { label: '운동/건강', count: 0, cssColor: 'bg-green-500' },
      purple: { label: '창작/취미', count: 0, cssColor: 'bg-purple-500' },
      yellow: { label: '휴식', count: 0, cssColor: 'bg-yellow-400' },
      red: { label: '기타', count: 0, cssColor: 'bg-red-400' },
    };

    Object.values(diaries).forEach((diary) => {
      diary.timeBlocks.forEach((tb) => {
        const slots = tb.endSlot - tb.startSlot;
        if (colorMap[tb.color]) {
          colorMap[tb.color].count += slots;
        }
      });
    });

    const total = Object.values(colorMap).reduce((s, c) => s + c.count, 0);
    return Object.values(colorMap)
      .filter((c) => c.count > 0 || total === 0)
      .map((c) => ({
        label: c.label,
        pct: total > 0 ? Math.round((c.count / total) * 100) : 0,
        color: c.cssColor,
      }));
  }, [diaries]);

  // If no time distribution data, show defaults
  const displayTimeDistribution = timeDistribution.some((t) => t.pct > 0)
    ? timeDistribution
    : [
        { label: '업무/공부', pct: 0, color: 'bg-blue-500' },
        { label: '운동/건강', pct: 0, color: 'bg-green-500' },
        { label: '창작/취미', pct: 0, color: 'bg-purple-500' },
        { label: '휴식', pct: 0, color: 'bg-yellow-400' },
        { label: '기타', pct: 0, color: 'bg-red-400' },
      ];

  // Goal achievement rate (Big 3 filled across all entries)
  const goalRate = useMemo(() => {
    const entries = Object.values(diaries);
    if (entries.length === 0) return 0;
    const totalFilled = entries.reduce((sum, d) => sum + d.bigThree.filter((b) => b.trim()).length, 0);
    const totalPossible = entries.length * 3;
    return Math.round((totalFilled / totalPossible) * 100);
  }, [diaries]);

  // Achievements
  const achievements = useMemo(() => {
    const result = [];
    if (streakCount >= 3) {
      result.push({
        icon: 'emoji_events',
        title: `${streakCount}일 연속 기록 달성`,
        desc: '꾸준한 집중력이 결실을 맺고 있습니다. 축하합니다!',
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
      });
    }
    if (totalEntries >= 5) {
      result.push({
        icon: 'timer',
        title: `누적 ${totalEntries}일 기록 돌파`,
        desc: '타임 박싱을 통해 시간을 더 밀도있게 관리하고 있습니다.',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      });
    }
    if (totalCompletedTasks >= 10) {
      result.push({
        icon: 'speed',
        title: `할 일 ${totalCompletedTasks}개 완료`,
        desc: '브레인 덤프에서 꾸준히 실행으로 옮기고 있습니다.',
        color: 'text-green-500',
        bg: 'bg-green-50',
      });
    }
    if (result.length === 0) {
      result.push({
        icon: 'rocket_launch',
        title: '시작이 반입니다!',
        desc: '매일 기록을 쌓으면 성과가 자동으로 표시됩니다.',
        color: 'text-slate-500',
        bg: 'bg-slate-50',
      });
    }
    return result;
  }, [streakCount, totalEntries, totalCompletedTasks]);

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
        <Sidebar active="statistics" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-blue-500 p-6 rounded-2xl text-white shadow-lg">
            <h2 className="text-sm font-medium opacity-80 mb-1">생산성 분석</h2>
            <p className="text-2xl font-bold">안녕하세요, 사용자님!</p>
            <p className="text-sm opacity-80 mt-1">
              {totalEntries > 0
                ? `총 ${totalEntries}일의 기록이 있습니다. 목표 달성률은 ${goalRate}%입니다.`
                : '아직 기록이 없습니다. 다이어리를 작성해보세요!'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '완료한 할 일', value: String(totalCompletedTasks), icon: 'task_alt', color: 'text-green-500' },
              { label: '현재 스트릭', value: `${streakCount}일`, icon: 'local_fire_department', color: 'text-orange-500' },
              { label: '평균 타임블록', value: `${avgTimeBlocks}개`, icon: 'schedule', color: 'text-blue-500' },
              { label: '목표 달성률', value: `${goalRate}%`, icon: 'flag', color: 'text-purple-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                  <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Big 3 Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                &apos;Big 3&apos; 주간 목표 달성률
              </h3>
              <p className="text-sm text-slate-500 mb-6">매일 가장 중요한 3가지 과업의 완료 추이</p>
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyBig3.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                    <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden relative" style={{ height: '160px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--color-primary)] to-blue-400 rounded-t-lg transition-all duration-700"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">시간 관리 분포</h3>
              <p className="text-sm text-slate-500 mb-6">타임 박싱 카테고리별 비중 (색상 기반)</p>
              <div className="space-y-4">
                {displayTimeDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Streak + Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logging Streak */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                로깅 스트릭
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-4xl font-bold text-slate-900">{streakCount}</span>
                <span className="text-sm text-slate-500">일 연속 기록 중</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {streakDays.map((active, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                최근 달성 성과
              </h3>
              <div className="space-y-4">
                {achievements.map((a) => (
                  <div
                    key={a.title}
                    className={`flex items-start gap-4 p-4 rounded-xl ${a.bg} transition-all hover:scale-[1.01]`}
                  >
                    <span className={`material-symbols-outlined ${a.color} text-2xl mt-0.5`}>
                      {a.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{a.title}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
