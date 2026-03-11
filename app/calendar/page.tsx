'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useDiaryStore } from '@/store/diaryStore';
import Sidebar from '@/components/Sidebar';
import { slotToTime } from '@/lib/utils';

export default function CalendarPage() {
  const router = useRouter();
  const { diaries } = useDiaryStore();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();
  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search results across all diary entries
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { dateStr: string; label: string; type: string }[] = [];

    Object.entries(diaries).forEach(([dateStr, diary]) => {
      diary.timeBlocks?.forEach((tb) => {
        if (tb.label?.toLowerCase().includes(q)) {
          results.push({ dateStr, label: tb.label, type: '타임블록' });
        }
      });
      diary.bigThree?.forEach((item) => {
        if (item?.text?.toLowerCase().includes(q)) {
          results.push({ dateStr, label: item.text, type: 'Big Three' });
        }
      });
      diary.brainDump?.forEach((item) => {
        const text = typeof item === 'string' ? item : item?.text || '';
        if (text.toLowerCase().includes(q)) {
          results.push({ dateStr, label: text, type: '브레인덤프' });
        }
      });
      if (diary.futureViz?.toLowerCase().includes(q)) {
        results.push({ dateStr, label: diary.futureViz, type: '미래 시각화' });
      }
      if (diary.identity?.toLowerCase().includes(q)) {
        results.push({ dateStr, label: diary.identity, type: '정체성' });
      }
      if (diary.motivation?.toLowerCase().includes(q)) {
        results.push({ dateStr, label: diary.motivation, type: '동기부여' });
      }
    });

    return results.slice(0, 20);
  }, [searchQuery, diaries]);

  function goToSearchResult(dateStr: string) {
    setSearchQuery('');
    setSearchOpen(false);
    router.push(`/diary/${dateStr}`);
  }

  // Calendar generation
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const prevMonthDays = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  const monthTitle = `${currentMonth.year}년 ${currentMonth.month + 1}월`;

  // Trailing days to fill the grid
  const totalCells = firstDay + daysInMonth;
  const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  function prevMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToToday() {
    setCurrentMonth({ year: todayYear, month: todayMonth });
    setSelectedDay(todayDate);
  }

  function goToDiary(day: number) {
    const m = String(currentMonth.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    router.push(`/diary/${currentMonth.year}-${m}-${d}`);
  }

  // Check which days have diary entries
  const daysWithEntries = useMemo(() => {
    const set = new Set<number>();
    Object.keys(diaries).forEach((dateStr) => {
      const diary = diaries[dateStr];
      const hasContent =
        (diary.timeBlocks?.length > 0) ||
        (diary.brainDump?.length > 0) ||
        (diary.bigThree?.some(t => t?.text?.trim() !== '')) ||
        (diary.feedback?.morning?.trim() !== '') ||
        (diary.feedback?.midday?.trim() !== '') ||
        (diary.feedback?.evening?.trim() !== '') ||
        (diary.futureViz?.trim() !== '') ||
        (diary.identity?.trim() !== '') ||
        (diary.motivation?.trim() !== '') ||
        (diary.morningRoutine?.trim() !== '') ||
        (diary.gratitude?.some(g => g?.trim() !== ''));

      if (hasContent) {
        const [y, m, d] = dateStr.split('-').map(Number);
        if (y === currentMonth.year && m === currentMonth.month + 1) {
          set.add(d);
        }
      }
    });
    return set;
  }, [diaries, currentMonth]);

  // Selected day info
  const selectedDateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDiary = diaries[selectedDateStr];

  // Calculate monthly progress
  const completedDays = Object.keys(diaries).filter((dateStr) => {
    const diary = diaries[dateStr];
    const hasContent =
      (diary.timeBlocks?.length > 0) ||
      (diary.brainDump?.length > 0) ||
      (diary.bigThree?.some(t => t?.text?.trim() !== '')) ||
      (diary.feedback?.morning?.trim() !== '') ||
      (diary.feedback?.midday?.trim() !== '') ||
      (diary.feedback?.evening?.trim() !== '') ||
      (diary.futureViz?.trim() !== '') ||
      (diary.identity?.trim() !== '') ||
      (diary.motivation?.trim() !== '') ||
      (diary.morningRoutine?.trim() !== '') ||
      (diary.gratitude?.some(g => g?.trim() !== ''));

    if (!hasContent) return false;

    const [y, m] = dateStr.split('-').map(Number);
    return y === currentMonth.year && m === currentMonth.month + 1;
  }).length;
  const progressPct = daysInMonth > 0 ? Math.round((completedDays / daysInMonth) * 100) : 0;

  // Sample schedule items from selected day's diary
  const scheduleItems = selectedDiary?.timeBlocks?.map((tb) => ({
    title: tb.label,
    time: `${tb.startSlot !== undefined ? slotToTime(tb.startSlot) : ''} - ${tb.endSlot !== undefined ? slotToTime(tb.endSlot) : ''}`,
    color: tb.color || 'blue',
  })) || [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="calendar" />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Header */}
          <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">{monthTitle}</h2>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
              <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50">오늘</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={searchRef}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                  placeholder="일정 검색..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                />
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToSearchResult(result.dateStr)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-3"
                        >
                          <span className="text-xs text-slate-400 shrink-0 mt-0.5">{result.dateStr}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.label}</p>
                            <span className="text-[11px] text-slate-400">{result.type}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calendar and Side Panel Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Full Month Calendar View */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
              <div className="grid grid-cols-7 border-l border-t border-slate-100">
                {/* Weekdays Header */}
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <div
                    key={day}
                    className={`p-3 text-center text-xs font-bold border-r border-b border-slate-100 bg-slate-50/50 ${i === 0 ? 'text-red-500' : 'text-slate-500'
                      }`}
                  >
                    {day}
                  </div>
                ))}

                {/* Previous month trailing days */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`prev-${i}`} className="min-h-[100px] p-2 border-r border-b border-slate-100 text-slate-300">
                    {prevMonthDays - firstDay + 1 + i}
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday =
                    day === todayDate &&
                    currentMonth.month === todayMonth &&
                    currentMonth.year === todayYear;
                  const isSelected = day === selectedDay;
                  const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const diary = diaries[dateStr];
                  const hasEntry = daysWithEntries.has(day);
                  const blocks = diary?.timeBlocks || [];
                  const displayBlocks = blocks.slice(0, 3);
                  const moreCount = blocks.length > 3 ? blocks.length - 3 : 0;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[100px] p-2 flex flex-col items-start border-r border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--color-primary)]/5' : 'hover:bg-slate-50'
                        }`}
                    >
                      {/* 날짜 헤더 영역 */}
                      <div className="flex justify-between items-start w-full">
                        {isToday ? (
                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-sm font-bold shadow-sm mb-1 shrink-0">
                            {day}
                          </span>
                        ) : (
                          <span className={`w-7 h-7 flex items-center justify-center text-sm mb-1 shrink-0 ${new Date(currentMonth.year, currentMonth.month, day).getDay() === 0 ? 'text-red-500' : 'font-medium'}`}>
                            {day}
                          </span>
                        )}
                        {/* 이벤트는 없지만 텍스트 기록만 있는 경우 작은 점 표시 */}
                        {hasEntry && blocks.length === 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-1 shrink-0" />
                        )}
                      </div>

                      {/* 이벤트 표시 영역 */}
                      <div className="flex flex-col gap-1 w-full mt-1">
                        {displayBlocks.map((block) => (
                          <div
                            key={block.id}
                            className={`flex items-center text-[10px] w-full pl-1.5 py-0.5 truncate font-medium text-slate-700 border-l-[3px] hover:bg-slate-50 transition-colors ${
                              block.color === 'red' ? 'border-red-500' :
                              block.color === 'green' ? 'border-green-500' :
                              block.color === 'purple' ? 'border-purple-500' :
                              block.color === 'yellow' ? 'border-yellow-500' :
                              block.color === 'orange' ? 'border-orange-500' :
                              block.color === 'gray' ? 'border-slate-400' :
                              'border-[var(--color-primary)]'
                            }`}
                          >
                            <span className="truncate">{block.label || '(제목 없음)'}</span>
                          </div>
                        ))}
                        {moreCount > 0 && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); goToDiary(day); }}
                            className="text-[10px] text-slate-400 font-medium px-1 mt-0.5 hover:text-slate-600 hover:underline cursor-pointer transition-colors"
                          >
                            +{moreCount}개 더보기
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Next month leading days */}
                {Array.from({ length: trailingDays }).map((_, i) => (
                  <div key={`next-${i}`} className="min-h-[100px] p-2 border-r border-b border-slate-100 text-slate-300">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Side Panel (Selected Day's Summary) */}
            <aside className="w-80 bg-[var(--color-bg)] border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  오늘의 일정 ({currentMonth.month + 1}월 {selectedDay}일)
                </h3>
                <div className="space-y-3">
                  {scheduleItems.length > 0 ? (
                    scheduleItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color === 'red' ? 'bg-red-100 text-red-600' :
                            item.color === 'green' ? 'bg-green-100 text-green-600' :
                              item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                item.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          }`}>
                          <span className="material-symbols-outlined text-[20px]">event</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{item.title || '(제목 없음)'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">event_busy</span>
                      <p className="text-sm text-slate-400">등록된 일정이 없습니다</p>
                    </div>
                  )}
                  <button
                    onClick={() => goToDiary(selectedDay)}
                    className="mt-3 w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    {daysWithEntries.has(selectedDay) ? '다이어리 보기' : '다이어리 작성하기'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">월간 기록률</h3>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold">{progressPct}%</span>
                    <span className="text-xs text-slate-500 mb-1">총 {daysInMonth}일 중 {completedDays}일 완료</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                    {completedDays > 0
                      ? '꾸준히 기록하고 있습니다. 훌륭한 페이스입니다!'
                      : '아직 이번 달 기록이 없습니다. 오늘부터 시작해보세요!'}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[var(--color-primary)] mb-2">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    <span className="text-xs font-bold">생산성 팁</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    &apos;타임 블로킹&apos;은 한 번에 한 가지 일에 집중하게 도와줍니다. 오늘 오후에는 알림을 끄고 집중 시간을 가져보세요.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
