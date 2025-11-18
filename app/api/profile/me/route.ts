import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth'; 
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const userPayload = await getAuthenticatedUser();

  if (!userPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userPayload.userId },
    select: { id: true, name: true, role: true }
  });

  return NextResponse.json({ user });
}