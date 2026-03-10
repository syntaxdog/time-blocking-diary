export type TimeBlock = {
  id: string;
  startSlot: number; // 0 = 05:00, 1 = 05:30, ...
  endSlot: number;
  label: string;
  color: BlockColor;
  column: 0 | 1;
};

export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray';

export type BrainDumpItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type BigThreeItem = {
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
  bigThree: [BigThreeItem, BigThreeItem, BigThreeItem];
  brainDump: BrainDumpItem[];
  timeBlocks: TimeBlock[];
  feedback: FeedbackType;
  futureViz: string;
  futureVizImage: string; // base64 data URL or external URL
  identity: string;
  motivation: string;
  gratitude: [string, string, string];
  morningRoutine: string;
};
