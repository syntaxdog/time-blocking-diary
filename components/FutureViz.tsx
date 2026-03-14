'use client';

import { useRef, useState } from 'react';
import { useDiaryStore } from '@/store/diaryStore';

const MAX_WIDTH = 800;
const QUALITY = 0.7;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function FutureViz({ date }: { date: string }) {
  const { diaries, setField } = useDiaryStore();
  const diary = diaries[date];
  const fileRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const image = diary?.futureVizImage ?? '';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setField(date, 'futureVizImage', dataUrl);
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      setField(date, 'futureVizImage', urlValue.trim());
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    setField(date, 'futureVizImage', '');
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">auto_awesome</span>
        <h2 className="font-bold text-slate-800">미래 시각화</h2>
      </div>

      {/* Image area */}
      <div className="rounded-lg w-full bg-slate-100 mb-3 overflow-hidden relative min-h-[128px]">
        {image ? (
          <div className="relative group">
            <img
              src={image}
              alt="미래 시각화"
              className="w-full h-auto max-h-64 object-contain rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <span className="material-symbols-outlined text-slate-300 text-4xl">image</span>
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                파일 업로드
              </button>
              <button
                onClick={() => setShowUrlInput(true)}
                className="text-xs px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
              >
                URL 입력
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            placeholder="이미지 URL을 입력하세요..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            autoFocus
          />
          <button
            onClick={handleUrlSubmit}
            className="text-xs px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            확인
          </button>
          <button
            onClick={() => { setShowUrlInput(false); setUrlValue(''); }}
            className="text-xs px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Image change buttons (when image exists) */}
      {image && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            이미지 변경
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setShowUrlInput(true)}
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            URL로 변경
          </button>
        </div>
      )}

      <textarea
        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 resize-none h-20 outline-none"
        placeholder="생생하게 꿈꾸는 미래의 모습을 기록하세요..."
        maxLength={200}
        value={diary?.futureViz ?? ''}
        onChange={(e) => setField(date, 'futureViz', e.target.value)}
      />
    </section>
  );
}
