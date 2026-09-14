import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import { normalizeSmileConfig } from '@/src/lib/smileConfig';
import SmileConfig from '@/src/models/smile_config';

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const admin = await assertAdmin();
  if (admin.error) return admin.error;

  await connectMongoDB();
  const config = await SmileConfig.findOne({ key: 'home' }).lean();
  return NextResponse.json({ config: normalizeSmileConfig(config) });
}

export async function PATCH(request: Request) {
  const admin = await assertAdmin();
  if (admin.error) return admin.error;

  const body = (await request.json()) as Record<string, unknown>;
  const config = normalizeSmileConfig(body);

  await connectMongoDB();
  const updated = await SmileConfig.findOneAndUpdate(
    { key: 'home' },
    { $set: config },
    { upsert: true, returnDocument: 'after', runValidators: true }
  ).lean();

  return NextResponse.json({ config: normalizeSmileConfig(updated) });
}
