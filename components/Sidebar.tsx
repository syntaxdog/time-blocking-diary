'use client';

import Link from 'next/link';

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
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">이번 주 목표 달성</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-900">82%</span>
            <span className="text-sm text-green-500 flex items-center mb-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 5%
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
