import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// GET /api/diary — 로그인 유저의 전체 다이어리 로드
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const diaries = await prisma.diary.findMany({
    where: { userId: session.user.id },
    select: { date: true, data: true, updatedAt: true },
  });

  const result: Record<string, unknown> = {};
  for (const diary of diaries) {
    result[diary.date] = {
      ...(diary.data as Record<string, unknown>),
      updatedAt: diary.updatedAt.getTime(),
    };
  }

  return NextResponse.json(result);
}

// POST /api/diary — 날짜별 다이어리 저장 (upsert)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, data } = body as { date: string; data: Record<string, unknown> };

  if (!date || !data) {
    return NextResponse.json({ error: 'Missing date or data' }, { status: 400 });
  }

  await prisma.diary.upsert({
    where: {
      userId_date: { userId: session.user.id, date },
    },
    update: { data: data as Prisma.InputJsonValue },
    create: { userId: session.user.id, date, data: data as Prisma.InputJsonValue },
  });

  return NextResponse.json({ ok: true });
}
