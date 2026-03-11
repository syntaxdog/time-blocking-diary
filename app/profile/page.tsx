'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useDiaryStore } from '@/store/diaryStore';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Header from '@/components/Header';

type SettingsTab = 'info' | 'theme' | 'security';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme, userVision, setUserVision } = useDiaryStore();
  const userName = session?.user?.name || '사용자';
  const userInitial = userName.charAt(0);
  const userImage = session?.user?.image;
  const [activeTab, setActiveTab] = useState<SettingsTab>('info');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editImage, setEditImage] = useState(userImage || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        setEditImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          ...(editImage !== userImage ? { image: editImage } : {}),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        await updateSession({ name: updated.name, image: updated.image });
        setEditing(false);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const tabItems: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'info', label: '회원 정보', icon: 'person' },
    { id: 'theme', label: '화면 테마', icon: 'palette' },
    { id: 'security', label: '보안 및 개인정보', icon: 'security' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="profile" />

        <main className="flex-1 overflow-y-auto flex justify-center py-8 pb-20 md:pb-8 px-4 sm:px-6">
          <div className="w-full max-w-[960px] flex flex-col md:flex-row gap-8">
            {/* Left Column: Navigation & Profile Info */}
            <aside className="w-full md:w-1/3 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
                <div className="relative group cursor-pointer" onClick={() => { if (editing) fileInputRef.current?.click(); }}>
                  {(editing ? editImage : userImage) ? (
                    <img
                      src={editing ? editImage : userImage!}
                      alt="Profile"
                      className="aspect-square rounded-full h-32 w-32 border-4 border-[var(--color-primary)]/10 object-cover"
                    />
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-[var(--color-primary)] to-blue-400 rounded-full h-32 w-32 border-4 border-[var(--color-primary)]/10 flex items-center justify-center text-white text-5xl font-bold">
                      {editing ? (editName.charAt(0) || userInitial) : userInitial}
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-4 w-full text-center text-xl font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                      autoFocus
                    />
                    <div className="mt-4 flex gap-2 w-full">
                      <button
                        onClick={() => { setEditing(false); setEditName(userName); setEditImage(userImage || ''); }}
                        className="flex-1 py-2 px-4 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 transition-colors"
                        disabled={saving}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="mt-4 text-xl font-bold">{userName}</h1>
                    <div className="mt-4 flex gap-2 w-full">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex-1 py-2 px-4 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        로그아웃
                      </button>
                      <button
                        onClick={() => { setEditName(userName); setEditImage(userImage || ''); setEditing(true); }}
                        className="flex-1 py-2 px-4 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold hover:bg-[var(--color-primary)]/20 transition-colors"
                      >
                        편집
                      </button>
                    </div>
                  </>
                )}
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
      <MobileNav active="profile" />
    </div>
  );
}
