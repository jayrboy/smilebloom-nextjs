import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import Child from '@/src/models/child';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await request.json();

  const update: Record<string, unknown> = {};
  const b = body as Record<string, unknown> | null;

  if (b && b.fullname !== undefined) update.fullname = String(b.fullname).trim();
  if (b && b.birthday !== undefined) {
    const d = new Date(String(b.birthday));
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'birthday is invalid' }, { status: 400 });
    }
    update.birthday = d;
  }
  if (b && b.gender !== undefined) {
    const g = String(b.gender).trim();
    if (!g) {
      return NextResponse.json({ error: 'gender is required' }, { status: 400 });
    }
    if (g !== 'MALE' && g !== 'FEMALE') {
      return NextResponse.json({ error: 'gender is invalid' }, { status: 400 });
    }
    update.gender = g;
  }

  await connectMongoDB();
  const updated = await Child.findOneAndUpdate(
    { _id: id, ownerUserId: userId },
    { $set: update },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ child: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await connectMongoDB();
  const deleted = await Child.findOneAndDelete({ _id: id, ownerUserId: userId });
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

