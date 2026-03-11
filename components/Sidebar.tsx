'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useDiaryStore } from '@/store/diaryStore';

type SidebarProps = {
  active: 'home' | 'calendar' | 'statistics' | 'profile';
};

const navItems = [
  { id: 'home', label: '홈', icon: 'home', href: '/' },
  { id: 'calendar', label: '캘린더', icon: 'calendar_month', href: '/calendar' },
  { id: 'statistics', label: '통계', icon: 'bar_chart', href: '/statistics' },
  { id: 'profile', label: '프로필', icon: 'person', href: '/profile' },
] as const;

export default function Sidebar({ active }: SidebarProps) {
  const { diaries } = useDiaryStore();

  // 이번 주 월~오늘까지 Big3 달성률 계산
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월=0 ~ 일=6
    const monday = new Date(now);
    monday.setDate(now.getDate() - todayIdx);

    let totalChecked = 0;
    let totalPossible = 0;

    for (let i = 0; i <= todayIdx; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const diary = diaries[dateStr];
      if (diary) {
        const checked = diary.bigThree.filter((b) => b.checked).length;
        totalChecked += checked;
        totalPossible += 3;
      }
    }

    if (totalPossible === 0) return null;
    const percentage = Math.round((totalChecked / totalPossible) * 100);
    return { percentage, totalChecked, totalPossible };
  }, [diaries]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col gap-2 overflow-y-auto shrink-0">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              active === item.id
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 퀵 작성 버튼 */}
      <div className="mt-4 px-4">
        <Link
          href={`/diary/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          className="group relative flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="material-symbols-outlined text-[18px] relative z-10">edit_document</span>
          <span className="relative z-10">오늘 일기 쓰기</span>
        </Link>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-2">이번 주 Big3 달성</p>
          {weeklyStats ? (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-slate-900">{weeklyStats.percentage}%</span>
                <span className="text-[11px] text-slate-400">
                  {weeklyStats.totalChecked}/{weeklyStats.totalPossible}개 완료
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${weeklyStats.percentage}%`,
                    background: weeklyStats.percentage >= 80
                      ? 'linear-gradient(to right, #22c55e, #4ade80)'
                      : weeklyStats.percentage >= 50
                        ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                        : 'linear-gradient(to right, #ef4444, #f87171)',
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">이번 주 기록이 아직 없어요</p>
          )}
        </div>
      </div>
    </aside>
  );
}
