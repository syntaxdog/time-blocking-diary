import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, image } = body;

  const data: { name?: string; image?: string } = {};
  if (typeof name === 'string' && name.trim()) data.name = name.trim();
  if (typeof image === 'string') data.image = image;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { name: true, image: true },
  });

  return NextResponse.json(user);
}
