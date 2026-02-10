import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import Child from '@/src/models/child';
import TeethEvent from '@/src/models/teeth_event';
import { TEETH_CATALOG } from '@/src/lib/teethCatalog';

const ALLOWED_TYPES = new Set(['ERUPTED', 'SHED', 'EXTRACTED', 'NOTE']);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const childId = url.searchParams.get('childId');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50) || 50, 200);

  await connectMongoDB();

  const query: { ownerUserId: string; childId?: string } = { ownerUserId: userId };
  if (childId) query.childId = childId;

  const events = await TeethEvent.find(query)
    .sort({ eventDate: -1, createdAt: -1 })
    .limit(limit)
    .populate('childId', 'fullname birthday')
    .lean();

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const childId = (body?.childId ?? '').toString();
  const type = (body?.type ?? '').toString();
  const toothCode = body?.toothCode ? body.toothCode.toString().trim() : '';
  const remark = body?.remark ? body.remark.toString().trim() : '';
  const eventDateRaw = body?.eventDate ? body.eventDate.toString() : '';

  if (!childId) return NextResponse.json({ error: 'childId is required' }, { status: 400 });
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: 'type is invalid' }, { status: 400 });
  }

  if (type !== 'NOTE' && !toothCode) {
    return NextResponse.json({ error: 'toothCode is required' }, { status: 400 });
  }

  if (toothCode) {
    const exists = TEETH_CATALOG.some((t) => t.code === toothCode);
    if (!exists) {
      return NextResponse.json({ error: 'toothCode is invalid' }, { status: 400 });
    }
  }

  const eventDate = eventDateRaw ? new Date(eventDateRaw) : new Date();
  if (Number.isNaN(eventDate.getTime())) {
    return NextResponse.json({ error: 'eventDate is invalid' }, { status: 400 });
  }

  await connectMongoDB();
  const child = await Child.findOne({ _id: childId, ownerUserId: userId }).lean();
  if (!child) {
    return NextResponse.json({ error: 'child not found' }, { status: 404 });
  }

  const created = await TeethEvent.create({
    ownerUserId: userId,
    childId,
    type,
    toothCode: toothCode || undefined,
    remark: remark || undefined,
    eventDate,
  });

  return NextResponse.json({ event: created }, { status: 201 });
}

