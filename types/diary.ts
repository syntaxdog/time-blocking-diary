export type TimeBlock = {
  id: string;
  startSlot: number; // 0 = 05:00, 1 = 05:30, ...
  endSlot: number;
  label: string;
  color: BlockColor;
  column: 0 | 1;
};

export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type BrainDumpItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type FeedbackType = {
  morning: string;
  midday: string;
  evening: string;
};

export type DiaryData = {
  date: string; // 'YYYY-MM-DD'
  bigThree: [string, string, string];
  brainDump: BrainDumpItem[];
  timeBlocks: TimeBlock[];
  feedback: FeedbackType;
  futureViz: string;
  identity: string;
  motivation: string;
  gratitude: string;
};
