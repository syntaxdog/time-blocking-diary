'use client';

import Link from 'next/link';

type MobileNavProps = {
  active: 'home' | 'calendar' | 'statistics' | 'profile';
};

const navItems = [
  { id: 'home', label: '홈', icon: 'home', href: '/' },
  { id: 'calendar', label: '캘린더', icon: 'calendar_month', href: '/calendar' },
  {
    id: 'today',
    label: '오늘 일기',
    icon: 'edit_document',
    href: `/diary/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    isCenter: true,
  },
  { id: 'statistics', label: '통계', icon: 'bar_chart', href: '/statistics' },
  { id: 'profile', label: '프로필', icon: 'person', href: '/profile' },
] as const;

export default function MobileNav({ active }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = item.id === active;
          if (item.id === 'today') {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? 'text-[var(--color-primary)]' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
