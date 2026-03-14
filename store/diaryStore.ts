'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiaryData, TimeBlock, BrainDumpItem, BigThreeItem } from '@/types/diary';
import { today, uid } from '@/lib/utils';
import type { DiaryData as DiaryDataType } from '@/types/diary';

// --- DB 동기화 ---
const syncTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function syncToDb(date: string, diary: DiaryDataType) {
  if (syncTimers[date]) clearTimeout(syncTimers[date]);
  syncTimers[date] = setTimeout(async () => {
    try {
      await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, data: diary }),
      });
    } catch {
      // 오프라인 — localStorage에 이미 저장됨, 다음에 재시도
    }
  }, 1000);
}

// mutation 후 자동 동기화 헬퍼
function withSync(date: string, get: () => DiaryStore) {
  const diary = get().diaries[date];
  if (diary) syncToDb(date, diary);
}

function emptyDiary(date: string): DiaryData {
  return {
    date,
    bigThree: [
      { text: '', checked: false },
      { text: '', checked: false },
      { text: '', checked: false },
    ],
    brainDump: [
      { id: uid(), text: '', checked: false },
      { id: uid(), text: '', checked: false },
      { id: uid(), text: '', checked: false },
    ],
    timeBlocks: [],
    feedback: { morning: '', midday: '', evening: '' },
    futureViz: '',
    futureVizImage: '',
    identity: '',
    motivation: '',
    gratitude: ['', '', ''],
    morningRoutine: '',
  };
}

type ThemeMode = 'light' | 'dark' | 'system';

type DiaryStore = {
  // hydration 상태
  _hasHydrated: boolean;

  // 날짜별 다이어리 맵
  diaries: Record<string, DiaryData>;
  currentDate: string;
  theme: ThemeMode;

  // 현재 날짜 다이어리 가져오기 (없으면 빈 것 생성)
  getOrCreate: (date: string) => DiaryData;

  // 날짜 변경
  setDate: (date: string) => void;

  // 테마
  setTheme: (mode: ThemeMode) => void;

  // Big 3
  setBigThree: (date: string, idx: 0 | 1 | 2, text: string) => void;
  toggleBigThree: (date: string, idx: 0 | 1 | 2) => void;

  // Brain Dump
  addBrainItem: (date: string) => void;
  updateBrainItem: (date: string, id: string, text: string) => void;
  toggleBrainItem: (date: string, id: string) => void;
  removeBrainItem: (date: string, id: string) => void;

  // Time Blocks
  addTimeBlock: (date: string, block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (date: string, id: string, patch: Partial<Omit<TimeBlock, 'id'>>) => void;
  removeTimeBlock: (date: string, id: string) => void;

  // Feedback
  setFeedback: (date: string, key: 'morning' | 'midday' | 'evening', value: string) => void;

  // 텍스트 필드들
  setField: (date: string, field: 'futureViz' | 'futureVizImage' | 'identity' | 'motivation' | 'morningRoutine', value: string) => void;

  // 감사 일기
  setGratitude: (date: string, idx: 0 | 1 | 2, value: string) => void;

  // 전역 비전/가치관 (프로필에서 설정)
  userVision: string;
  setUserVision: (vision: string) => void;

  // DB 동기화
  loadFromDb: () => Promise<void>;
  _dbLoaded: boolean;
};

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      _dbLoaded: false,
      diaries: {},
      currentDate: today(),
      theme: 'light' as ThemeMode,
      userVision: '나는 매일매일 성장하는 사람이다.',

      setTheme: (mode) => set({ theme: mode }),
      setUserVision: (vision) => set({ userVision: vision }),

      loadFromDb: async () => {
        try {
          const res = await fetch('/api/diary');
          if (!res.ok) return;
          const dbDiaries = (await res.json()) as Record<string, DiaryData>;
          set((s) => {
            const merged = { ...s.diaries };
            for (const [date, dbDiary] of Object.entries(dbDiaries)) {
              const local = merged[date];
              if (!local || (dbDiary.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
                merged[date] = dbDiary;
              }
            }
            return { diaries: merged, _dbLoaded: true };
          });
        } catch {
          // 오프라인 — localStorage 데이터 사용
          set({ _dbLoaded: true });
        }
      },

      getOrCreate: (date) => {
        const { diaries } = get();
        if (!diaries[date]) {
          const newDiary = emptyDiary(date);
          set((s) => ({ diaries: { ...s.diaries, [date]: newDiary } }));
          return newDiary;
        }
        return diaries[date];
      },

      setDate: (date) => {
        get().getOrCreate(date);
        set({ currentDate: date });
      },

      setBigThree: (date, idx, text) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const bigThree = [...diary.bigThree] as [BigThreeItem, BigThreeItem, BigThreeItem];
          bigThree[idx] = { ...bigThree[idx], text };
          return { diaries: { ...s.diaries, [date]: { ...diary, bigThree, updatedAt: Date.now() } } };
        });
        withSync(date, get);
      },

      toggleBigThree: (date, idx) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const bigThree = [...diary.bigThree] as [BigThreeItem, BigThreeItem, BigThreeItem];
          bigThree[idx] = { ...bigThree[idx], checked: !bigThree[idx].checked };
          return { diaries: { ...s.diaries, [date]: { ...diary, bigThree, updatedAt: Date.now() } } };
        });
        withSync(date, get);
      },

      addBrainItem: (date) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const item: BrainDumpItem = { id: uid(), text: '', checked: false };
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, brainDump: [...diary.brainDump, item], updatedAt: Date.now() },
            },
          };
        });
        withSync(date, get);
      },

      updateBrainItem: (date, id, text) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: {
                ...diary,
                brainDump: diary.brainDump.map((i) => (i.id === id ? { ...i, text } : i)),
                updatedAt: Date.now(),
              },
            },
          };
        });
        withSync(date, get);
      },

      toggleBrainItem: (date, id) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: {
                ...diary,
                brainDump: diary.brainDump.map((i) =>
                  i.id === id ? { ...i, checked: !i.checked } : i
                ),
                updatedAt: Date.now(),
              },
            },
          };
        });
        withSync(date, get);
      },

      removeBrainItem: (date, id) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: {
                ...diary,
                brainDump: diary.brainDump.filter((i) => i.id !== id),
                updatedAt: Date.now(),
              },
            },
          };
        });
        withSync(date, get);
      },

      addTimeBlock: (date, block) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const newBlock: TimeBlock = { ...block, id: uid() };
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, timeBlocks: [...diary.timeBlocks, newBlock], updatedAt: Date.now() },
            },
          };
        });
        withSync(date, get);
      },

      updateTimeBlock: (date, id, patch) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: {
                ...diary,
                timeBlocks: diary.timeBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
                updatedAt: Date.now(),
              },
            },
          };
        });
        withSync(date, get);
      },

      removeTimeBlock: (date, id) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: {
                ...diary,
                timeBlocks: diary.timeBlocks.filter((b) => b.id !== id),
                updatedAt: Date.now(),
              },
            },
          };
        });
        withSync(date, get);
      },

      setFeedback: (date, key, value) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, feedback: { ...diary.feedback, [key]: value }, updatedAt: Date.now() },
            },
          };
        });
        withSync(date, get);
      },

      setField: (date, field, value) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: { ...s.diaries, [date]: { ...diary, [field]: value, updatedAt: Date.now() } },
          };
        });
        withSync(date, get);
      },

      setGratitude: (date, idx, value) => {
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const gratitude = [...diary.gratitude] as [string, string, string];
          gratitude[idx] = value;
          return { diaries: { ...s.diaries, [date]: { ...diary, gratitude, updatedAt: Date.now() } } };
        });
        withSync(date, get);
      },
    }),
    {
      name: 'time-blocking-diary',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _hasHydrated, _dbLoaded, ...rest } = state;
        void _dbLoaded;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state._hasHydrated = true;
        // Migrate bigThree from string[] to BigThreeItem[]
        const migrated: Record<string, DiaryData> = {};
        for (const [date, diary] of Object.entries(state.diaries)) {
          const bigThree = diary.bigThree.map((item) =>
            typeof item === 'string'
              ? { text: item as unknown as string, checked: false }
              : item
          ) as [BigThreeItem, BigThreeItem, BigThreeItem];
          migrated[date] = { ...diary, bigThree };
        }
        state.diaries = migrated;
      },
    }
  )
);
