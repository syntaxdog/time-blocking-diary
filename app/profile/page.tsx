'use client';

import { useState } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import Sidebar from '@/components/Sidebar';

type SettingsTab = 'info' | 'notifications' | 'theme' | 'security';

export default function ProfilePage() {
  const { theme, setTheme, userVision, setUserVision } = useDiaryStore();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('info');

  const tabItems: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'info', label: '회원 정보', icon: 'person' },
    { id: 'notifications', label: '알림 설정', icon: 'notifications' },
    { id: 'theme', label: '화면 테마', icon: 'palette' },
    { id: 'security', label: '보안 및 개인정보', icon: 'security' },
  ];

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
        <Sidebar active="profile" />

        <main className="flex-1 overflow-y-auto flex justify-center py-8 px-4 sm:px-6">
          <div className="w-full max-w-[960px] flex flex-col md:flex-row gap-8">
            {/* Left Column: Navigation & Profile Info */}
            <aside className="w-full md:w-1/3 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
                <div className="relative group">
                  <div className="aspect-square bg-gradient-to-br from-[var(--color-primary)] to-blue-400 rounded-full h-32 w-32 border-4 border-[var(--color-primary)]/10 flex items-center justify-center text-white text-5xl font-bold">
                    김
                  </div>
                  <button className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white p-2 rounded-full border-2 border-white shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                  </button>
                </div>
                <h1 className="mt-4 text-xl font-bold">김철수</h1>
                <p className="text-slate-500 text-sm">chulsoo.kim@example.com</p>
                <div className="mt-4 flex gap-2 w-full">
                  <button className="flex-1 py-2 px-4 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 transition-colors">로그아웃</button>
                  <button className="flex-1 py-2 px-4 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold hover:bg-[var(--color-primary)]/20 transition-colors">편집</button>
                </div>
              </div>

              {/* Sidebar Nav */}
              <nav className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-r-4 border-[var(--color-primary)]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined">{tab.icon}</span>
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Right Column: Settings Sections */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              {/* info 탭: 회원 정보 + 비전 선언 */}
              {activeTab === 'info' && (
                <>
                  <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[var(--color-primary)]">psychology</span>
                      <h3 className="text-lg font-bold">나의 비전 선언</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">자신이 추구하는 핵심 가치와 비전을 정의하세요. 이 문구는 매일 홈 화면에 표시됩니다.</p>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block">비전 선언문</span>
                        <textarea
                          className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] min-h-[120px] p-4 text-base leading-relaxed outline-none border resize-none"
                          placeholder="예: 나는 매일 성장하며 타인에게 긍정적인 영향을 주는 효율적인 전문가이다."
                          value={userVision}
                          onChange={(e) => setUserVision(e.target.value)}
                        />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {/* notifications 탭: 알림 설정 */}
              {activeTab === 'notifications' && (
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">notifications_active</span>
                    <h3 className="text-lg font-bold">알림 및 다이어리 설정</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">데일리 리마인더</p>
                        <p className="text-xs text-slate-500">시간 블록 계획을 세우도록 알림을 보냅니다.</p>
                      </div>
                      <button
                        onClick={() => setDailyReminder(!dailyReminder)}
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <div className={`w-11 h-6 rounded-full transition-colors ${dailyReminder ? 'bg-[var(--color-primary)]' : 'bg-slate-300'}`} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${dailyReminder ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">자동 백업</p>
                        <p className="text-xs text-slate-500">매일 밤 데이터를 클라우드에 안전하게 보관합니다.</p>
                      </div>
                      <button
                        onClick={() => setAutoBackup(!autoBackup)}
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <div className={`w-11 h-6 rounded-full transition-colors ${autoBackup ? 'bg-[var(--color-primary)]' : 'bg-slate-300'}`} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${autoBackup ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* theme 탭: 화면 테마 */}
              {activeTab === 'theme' && (
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">dark_mode</span>
                    <h3 className="text-lg font-bold">다크 모드 설정</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-slate-100 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined">light_mode</span>
                      <span className="text-xs font-semibold">라이트</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-slate-100 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined">dark_mode</span>
                      <span className="text-xs font-semibold">다크</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        theme === 'system'
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-slate-100 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined">settings_brightness</span>
                      <span className="text-xs font-semibold">시스템</span>
                    </button>
                  </div>
                </section>
              )}

              {/* security 탭: 보안 및 개인정보 */}
              {activeTab === 'security' && (
                <section className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                  <h3 className="text-lg font-bold text-red-600 mb-2">계정 관리</h3>
                  <p className="text-sm text-red-500/80 mb-4">계정을 삭제하면 모든 타임 블로킹 데이터가 영구적으로 삭제됩니다.</p>
                  <button className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                    계정 탈퇴하기
                  </button>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
