import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try{
    const userPayload = await getAuthenticatedUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userPayload.userId;
    const queryOptions: any = {
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone_number: true,
        role: true,
        created_at: true,
        user_addresses: {
          select: { id: true, address_label: true, full_address: true },
          take: 5 
        },
      }
    };

    queryOptions.select.shops_managed = {
        select: { id: true, name: true, type: true, address: true }
    };

    const user = await prisma.users.findUnique(queryOptions);

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }catch(error){
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}