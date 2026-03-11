'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 select-none cursor-pointer group" onClick={() => router.push('/')}>
          <div className="w-9 h-9 bg-gradient-to-tr from-[var(--color-primary)] via-indigo-500 to-fuchsia-500 rounded-[12px] flex items-center justify-center text-white shadow-md border-[0.5px] border-white/20 shrink-0 transform -rotate-2 group-hover:rotate-3 transition-transform duration-300">
            <svg className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="7" height="6" rx="2" opacity="0.9" />
              <rect x="4" y="12" width="7" height="8" rx="2" opacity="0.5" />
              <rect x="13" y="4" width="7" height="10" rx="2" opacity="1" />
              <rect x="13" y="16" width="7" height="4" rx="1.5" opacity="0.75" />
            </svg>
          </div>
          <h1 className="text-[20px] tracking-tight flex items-baseline">
            <span className="font-extrabold text-slate-900">Time</span>
            <span className="font-light text-slate-500 ml-0.5 hidden sm:inline">Blocking</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/profile')}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] transition-colors cursor-pointer ml-2 flex items-center justify-center"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-slate-500">person</span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-20">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold truncate">{session?.user?.name || '사용자'}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => { router.push('/profile'); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                프로필
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-red-600 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
