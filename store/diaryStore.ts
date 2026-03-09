'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiaryData, TimeBlock, BrainDumpItem, BlockColor } from '@/types/diary';
import { today, uid } from '@/lib/utils';

function emptyDiary(date: string): DiaryData {
  return {
    date,
    bigThree: ['', '', ''],
    brainDump: [],
    timeBlocks: [],
    feedback: { morning: '', midday: '', evening: '' },
    futureViz: '',
    identity: '',
    motivation: '',
    gratitude: '',
  };
}

type DiaryStore = {
  // 날짜별 다이어리 맵
  diaries: Record<string, DiaryData>;
  currentDate: string;

  // 현재 날짜 다이어리 가져오기 (없으면 빈 것 생성)
  getOrCreate: (date: string) => DiaryData;

  // 날짜 변경
  setDate: (date: string) => void;

  // Big 3
  setBigThree: (date: string, idx: 0 | 1 | 2, value: string) => void;

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
  setField: (date: string, field: 'futureViz' | 'identity' | 'motivation' | 'gratitude', value: string) => void;
};

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set, get) => ({
      diaries: {},
      currentDate: today(),

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

      setBigThree: (date, idx, value) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const bigThree = [...diary.bigThree] as [string, string, string];
          bigThree[idx] = value;
          return { diaries: { ...s.diaries, [date]: { ...diary, bigThree } } };
        }),

      addBrainItem: (date) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          const item: BrainDumpItem = { id: uid(), text: '', checked: false };
          return {
            diaries: {
              ...s.diaries,
              [date]: { ...diary, brainDump: [...diary.brainDump, item] },
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
              [date]: { ...diary, timeBlocks: [...diary.timeBlocks, newBlock] },
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
              [date]: { ...diary, feedback: { ...diary.feedback, [key]: value } },
            },
          };
        }),

      setField: (date, field, value) =>
        set((s) => {
          const diary = s.diaries[date] ?? emptyDiary(date);
          return {
            diaries: { ...s.diaries, [date]: { ...diary, [field]: value } },
          };
        }),
    }),
    { name: 'time-blocking-diary' }
  )
);
