import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import User from '@/src/models/user';

function normalizeEmail(input: unknown) {
  const email = String(input ?? '').trim().toLowerCase();
  return email;
}

function isValidEmail(email: string) {
  // Basic sanity check; not RFC-complete (good enough for UI profile edit)
  if (!email) return false;
  if (email.length > 254) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectMongoDB();
  const user = await User.findById(userId)
    .select('_id username email role status createdAt updatedAt')
    .lean();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await request.json();
  const obj = (body ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(obj.email);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'email is invalid' }, { status: 400 });
  }

  await connectMongoDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { email } },
    { new: true }
  )
    .select('_id username email role status createdAt updatedAt')
    .lean();

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}

