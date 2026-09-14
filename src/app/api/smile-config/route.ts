import { NextResponse } from 'next/server';

import { connectMongoDB } from '@/src/lib/mongodb';
import { normalizeSmileConfig } from '@/src/lib/smileConfig';
import SmileConfig from '@/src/models/smile_config';

export async function GET() {
  try {
    await connectMongoDB();
    const config = await SmileConfig.findOne({ key: 'home' }).lean();
    return NextResponse.json({ config: normalizeSmileConfig(config) });
  } catch (error) {
    console.error('Failed to load smile config:', error);
    return NextResponse.json({ config: normalizeSmileConfig(null) });
  }
}
