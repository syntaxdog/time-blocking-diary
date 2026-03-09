'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function ProfilePage() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [identityText, setIdentityText] = useState('나는 매일 성장하는 개발자이다.');
  const [activeTab, setActiveTab] = useState('info');

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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <span className="material-symbols-outlined text-lg">settings</span>
              <span>프로필 및 설정</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                김
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-slate-900">김철수</h2>
                <p className="text-slate-500 mt-1">chulsoo.kim@example.com</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold rounded-full">
                    Premium Plan
                  </span>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                    12일 연속 기록 중 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-fit">
            {[
              { id: 'info', label: '회원 정보', icon: 'person' },
              { id: 'notifications', label: '알림 설정', icon: 'notifications' },
              { id: 'theme', label: '화면 테마', icon: 'palette' },
              { id: 'security', label: '보안 및 개인정보', icon: 'security' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Identity Statement */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
                나의 정체성 선언
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                자신이 되고자 하는 모습을 정의하세요. 이 문구는 매일 대시보드에 표시됩니다.
              </p>
              <textarea
                className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm resize-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                value={identityText}
                onChange={(e) => setIdentityText(e.target.value)}
                placeholder="나는 _____ 이다."
              />
              <button className="mt-3 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                저장하기
              </button>
            </div>

            {/* Notification & Diary Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">tune</span>
                알림 및 다이어리 설정
              </h3>
              <div className="space-y-5">
                {/* Daily Reminder */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">데일리 리마인더</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      시간 블록 계획을 세우도록 알림을 보냅니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setDailyReminder(!dailyReminder)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      dailyReminder ? 'bg-[var(--color-primary)]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        dailyReminder ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Backup */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">자동 백업</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      매일 밤 데이터를 클라우드에 안전하게 보관합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoBackup(!autoBackup)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      autoBackup ? 'bg-[var(--color-primary)]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        autoBackup ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">dark_mode</span>
                다크 모드 설정
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">
                    {darkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {darkMode ? '다크 모드' : '라이트 모드'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {darkMode ? '어두운 테마가 적용됩니다.' : '밝은 테마가 적용됩니다.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    darkMode ? 'bg-[var(--color-primary)]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      darkMode ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">manage_accounts</span>
                계정 관리
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                계정을 삭제하면 모든 타임 블로킹 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">download</span>
                  데이터 내보내기
                </button>
                <button className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">delete_forever</span>
                  계정 삭제
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
