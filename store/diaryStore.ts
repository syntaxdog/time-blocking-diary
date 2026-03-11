'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiaryData, TimeBlock, BrainDumpItem, BigThreeItem } from '@/types/diary';
import { today, uid } from '@/lib/utils';

function emptyDiary(date: string): DiaryData {
  return {
    date,
    bigThree: [
      { text: '', checked: false },
      { text: '', checked: false },
      { text: '', checked: false },
    ],
    brainDump: [],
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
};

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set, get) => ({
      diaries: {},
      currentDate: today(),
      theme: 'light' as ThemeMode,
      userVision: '나는 매일매일 성장하는 사람이다.',

      setTheme: (mode) => set({ theme: mode }),
      setUserVision: (vision) => set({ userVision: vision }),

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

      setBigThree: (date, idx, text) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const bigThree = [...diary.bigThree] as [BigThreeItem, BigThreeItem, BigThreeItem];
          bigThree[idx] = { ...bigThree[idx], text };
          return { diaries: { ...s.diaries, [date]: { ...diary, bigThree, updatedAt: Date.now() } } };
        }),

      toggleBigThree: (date, idx) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const bigThree = [...diary.bigThree] as [BigThreeItem, BigThreeItem, BigThreeItem];
          bigThree[idx] = { ...bigThree[idx], checked: !bigThree[idx].checked };
          return { diaries: { ...s.diaries, [date]: { ...diary, bigThree, updatedAt: Date.now() } } };
        }),

      addBrainItem: (date) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const item: BrainDumpItem = { id: uid(), text: '', checked: false };
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, brainDump: [...diary.brainDump, item], updatedAt: Date.now() },
            },
          };
        }),

      updateBrainItem: (date, id, text) =>
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
        }),

      toggleBrainItem: (date, id) =>
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
        }),

      removeBrainItem: (date, id) =>
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
        }),

      addTimeBlock: (date, block) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const newBlock: TimeBlock = { ...block, id: uid() };
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, timeBlocks: [...diary.timeBlocks, newBlock], updatedAt: Date.now() },
            },
          };
        }),

      updateTimeBlock: (date, id, patch) =>
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
        }),

      removeTimeBlock: (date, id) =>
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
        }),

      setFeedback: (date, key, value) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, feedback: { ...diary.feedback, [key]: value }, updatedAt: Date.now() },
            },
          };
        }),

      setField: (date, field, value) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: { ...s.diaries, [date]: { ...diary, [field]: value, updatedAt: Date.now() } },
          };
        }),

      setGratitude: (date, idx, value) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const gratitude = [...diary.gratitude] as [string, string, string];
          gratitude[idx] = value;
          return { diaries: { ...s.diaries, [date]: { ...diary, gratitude, updatedAt: Date.now() } } };
        }),
    }),
    {
      name: 'time-blocking-diary',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
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
