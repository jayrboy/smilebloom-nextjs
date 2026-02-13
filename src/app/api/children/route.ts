import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import Child from '@/src/models/child';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectMongoDB();
  const children = await Child.find({ ownerUserId: userId })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ children });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const fullname = (body?.fullname ?? '').toString().trim();
  const birthdayRaw = (body?.birthday ?? '').toString();
  const genderRaw = body?.gender?.toString?.() ?? '';
  const gender = genderRaw.trim();

  if (!fullname) {
    return NextResponse.json({ error: 'fullname is required' }, { status: 400 });
  }
  if (!birthdayRaw) {
    return NextResponse.json({ error: 'birthday is required' }, { status: 400 });
  }
  if (!gender) {
    return NextResponse.json({ error: 'gender is required' }, { status: 400 });
  }
  if (gender !== 'MALE' && gender !== 'FEMALE') {
    return NextResponse.json({ error: 'gender is invalid' }, { status: 400 });
  }

  const birthday = new Date(birthdayRaw);
  if (Number.isNaN(birthday.getTime())) {
    return NextResponse.json({ error: 'birthday is invalid' }, { status: 400 });
  }

  await connectMongoDB();
  const created = await Child.create({
    ownerUserId: userId,
    fullname,
    birthday,
    gender,
  });

  return NextResponse.json({ child: created }, { status: 201 });
}

