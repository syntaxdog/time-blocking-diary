export type TimeBlock = {
  id: string;
  startSlot: number; // 15분 단위. 0 = 시작시간, 1 = +15분, ... (endSlot 포함)
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
  timeBoxStartHour?: number; // 날짜별 타임박스 시작시간 오버라이드 (0-23)
  slotMinutes?: number; // 슬롯 단위(분). 없으면 예전 30분 데이터 → 로드 시 15분으로 변환
  updatedAt?: number; // ms timestamp – last modification time
};
