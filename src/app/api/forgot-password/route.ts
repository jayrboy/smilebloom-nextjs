import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { connectMongoDB } from '@/src/lib/mongodb';
import User from '@/src/models/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body?.username ?? '').toString().trim();
    const password = (body?.password ?? '').toString();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'ชื่อผู้ใช้และรหัสผ่านใหม่จำเป็นต้องระบุ' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' },
        { status: 404 }
      );
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return NextResponse.json({ message: 'แก้ไขรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.log('forgot password error:', error);
    return NextResponse.json(
      { message: 'ไม่สามารถอัปเดตรหัสผ่านได้' },
      { status: 500 }
    );
  }
}
