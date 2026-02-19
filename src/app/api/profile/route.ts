import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/src/lib/auth';
import { connectMongoDB } from '@/src/lib/mongodb';
import User from '@/src/models/user';

function normalizeString(input: unknown) {
  const value = String(input ?? '').trim();
  return value;
}

function normalizeDateOnly(input: unknown) {
  return normalizeString(input);
}

function isValidDateOnly(value: string) {
  // Expected YYYY-MM-DD (date-only) to avoid timezone drift.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map((v) => Number(v));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  // Use UTC to validate actual calendar date without local timezone offsets.
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectMongoDB();
  const user = await User.findById(userId)
    .select('_id username email role status dentistName dentistDay dentistHistory createdAt updatedAt')
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
  const hasDentistName = Object.prototype.hasOwnProperty.call(obj, 'dentistName');
  const hasDentistDay = Object.prototype.hasOwnProperty.call(obj, 'dentistDay');

  const dentistName = hasDentistName ? normalizeString(obj.dentistName) : '';
  const dentistDay = hasDentistDay ? normalizeDateOnly(obj.dentistDay) : '';

  if (hasDentistDay && dentistDay && !isValidDateOnly(dentistDay)) {
    return NextResponse.json({ error: 'dentistDay is invalid' }, { status: 400 });
  }

  await connectMongoDB();

  const current = await User.findById(userId)
    .select('_id dentistName dentistDay dentistHistory username email role status createdAt updatedAt')
    .lean();

  if (!current) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, unknown> = {};

  if (hasDentistName) {
    if (dentistName) $set.dentistName = dentistName;
    else $unset.dentistName = 1;
  }

  if (hasDentistDay) {
    if (dentistDay) $set.dentistDay = dentistDay;
    else $unset.dentistDay = 1;
  }

  const nextDentistName = hasDentistName ? dentistName : (current.dentistName ?? '');
  const nextDentistDay = hasDentistDay ? dentistDay : (current.dentistDay ?? '');

  const shouldPushHistory =
    Boolean(nextDentistDay) &&
    (nextDentistDay !== (current.dentistDay ?? '') || nextDentistName !== (current.dentistName ?? '')) &&
    (hasDentistDay || hasDentistName);

  const updateOps: Record<string, unknown> = {
    ...(Object.keys($set).length ? { $set } : {}),
    ...(Object.keys($unset).length ? { $unset } : {}),
    ...(shouldPushHistory
      ? {
          $push: {
            dentistHistory: {
              $each: [
                {
                  ...(nextDentistName ? { dentistName: nextDentistName } : {}),
                  dentistDay: nextDentistDay,
                  savedAt: new Date(),
                },
              ],
              $slice: -50,
            },
          },
        }
      : {}),
  };

  if (!Object.keys(updateOps).length) {
    return NextResponse.json({ user: current });
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    updateOps,
    // `strict: false` prevents silent stripping when model schema is stale (common in dev HMR).
    { returnDocument: 'after', strict: false }
  )
    .select('_id username email role status dentistName dentistDay dentistHistory createdAt updatedAt')
    .lean();

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}

