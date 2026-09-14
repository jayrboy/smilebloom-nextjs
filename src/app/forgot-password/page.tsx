'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage(null);
      setSuccess(false);

      if (password !== confirmPassword) {
        setMessage('รหัสผ่านไม่ตรงกัน');
        return;
      }

      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          (data && (data.message || data.error)) ||
            'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
        );
        return;
      }

      setSuccess(true);
      setMessage('เปลี่ยนรหัสผ่านสำเร็จ กำลังกลับไปหน้าเข้าสู่ระบบ');
      setTimeout(() => router.replace('/auth/login'), 900);
    } catch {
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-950/70 via-emerald-950/55 to-slate-950/75" />
        <div className="absolute inset-0 -z-10 opacity-25 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.50),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.28),transparent_40%)]" />

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
              <div className="text-sm font-semibold text-slate-500">
                Forgot password
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                ลืมรหัสผ่าน
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                ใส่ชื่อผู้ใช้และตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อผู้ใช้"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="รหัสผ่านใหม่"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-2xl bg-white px-4 py-3 pr-11 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? (
                        <IoMdEye className="h-5 w-5" />
                      ) : (
                        <IoMdEyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="ยืนยันรหัสผ่านใหม่"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-2 w-full rounded-2xl bg-white px-4 py-3 pr-11 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                      }
                    >
                      {showConfirmPassword ? (
                        <IoMdEyeOff className="h-5 w-5" />
                      ) : (
                        <IoMdEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {message && (
                  <div
                    className={[
                      'rounded-2xl px-4 py-3 text-sm ring-1',
                      success
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                        : 'bg-rose-50 text-rose-800 ring-rose-100',
                    ].join(' ')}
                    role="status"
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'กำลังดำเนินการ...' : 'บันทึกรหัสผ่านใหม่'}
                </button>

                <div className="text-center text-xs text-slate-500">
                  กลับไป{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-slate-700 hover:text-slate-900"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
