import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/src/lib/mongodb';
import User from '@/src/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await connectMongoDB();
    const user = await User.create({ username, password: hashedPassword });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}