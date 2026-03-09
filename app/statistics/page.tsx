'use client';

import Sidebar from '@/components/Sidebar';

export default function StatisticsPage() {
  // Sample data for charts
  const weeklyBig3 = [
    { day: '월', value: 100 },
    { day: '화', value: 66 },
    { day: '수', value: 100 },
    { day: '목', value: 33 },
    { day: '금', value: 100 },
    { day: '토', value: 66 },
    { day: '일', value: 33 },
  ];

  const timeDistribution = [
    { label: '업무/공부', pct: 35, color: 'bg-blue-500' },
    { label: '운동/건강', pct: 15, color: 'bg-green-500' },
    { label: '창작/취미', pct: 20, color: 'bg-purple-500' },
    { label: '휴식', pct: 15, color: 'bg-orange-400' },
    { label: '기타', pct: 15, color: 'bg-slate-400' },
  ];

  const achievements = [
    {
      icon: 'emoji_events',
      title: '10일 연속 Big 3 달성',
      desc: '꾸준한 집중력이 결실을 맺고 있습니다. 축하합니다!',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      icon: 'timer',
      title: '누적 기록 50시간 돌파',
      desc: '타임 박싱을 통해 시간을 더 밀도있게 관리하고 있습니다.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: 'speed',
      title: '집중 효율성 최고치 갱신',
      desc: '오전 10시-12시 사이의 생산성이 가장 높습니다.',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  const streakDays = [true, true, true, true, true, true, true, true, true, true, true, true, false, false];

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
              이번 주 생산성이 지난 주보다 <span className="font-bold">12% 향상</span>되었습니다.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '완료한 할 일', value: '128', icon: 'task_alt', color: 'text-green-500' },
              { label: '현재 스트릭', value: '12일', icon: 'local_fire_department', color: 'text-orange-500' },
              { label: '평균 집중 시간', value: '5.2h', icon: 'schedule', color: 'text-blue-500' },
              { label: '목표 달성률', value: '84%', icon: 'flag', color: 'text-purple-500' },
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
              <p className="text-sm text-slate-500 mb-6">타임 박싱 카테고리별 비중</p>
              <div className="space-y-4">
                {timeDistribution.map((item) => (
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
                <span className="text-4xl font-bold text-slate-900">12</span>
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
