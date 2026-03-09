import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Time Blocking Diary',
  description: 'Time Blocking 다이어리 — 하루를 디자인하세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
