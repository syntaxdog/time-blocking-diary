import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import HydrationGate from '@/components/HydrationGate';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Time Blocking Diary',
  description: 'Time Blocking 다이어리 — 하루를 디자인하세요',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SessionProvider session={session}>
          <ThemeProvider>
            <HydrationGate>{children}</HydrationGate>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
