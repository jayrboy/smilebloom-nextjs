'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const REMEMBER_ME_KEY = 'sb_remember_me';
const REMEMBERED_USERNAME_KEY = 'sb_remembered_username';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    try {
      const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);

      if (shouldRemember) {
        setRememberMe(true);
        if (rememberedUsername) setUsername(rememberedUsername);
      }
    } catch {
      // Ignore storage access errors (e.g. blocked in some environments)
    }
  }, []);
  
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage(null);

      const result = await signIn('credentials', {
        username,
        password,
        remember: rememberMe,
        redirect: false,
      });

      if (result?.error) {
        setMessage('Invalid credentials');
        return;
      }

      if (result?.ok) {
        setMessage('สำเร็จ');

        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, 'true');
            localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
            localStorage.removeItem(REMEMBERED_USERNAME_KEY);
          }
        } catch {
          // Ignore storage access errors
        }

        router.replace('/dashboard');
        return;
      }

      setMessage('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } catch {
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <Image
            src="https://img5.pic.in.th/file/secure-sv1/smilebloom-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-75 saturate-125"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-950/70 via-emerald-950/55 to-slate-950/75" />
        <div className="absolute inset-0 -z-10 opacity-25 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.50),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.28),transparent_40%)]" />

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
              <div className="text-sm font-semibold text-slate-500">Login</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                เข้าสู่ระบบ
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                ใส่ชื่อผู้ใช้และรหัสผ่านเพื่อดำเนินการต่อ
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
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    จำฉันไว้
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-slate-700 hover:text-slate-900"
                    onClick={() => setMessage('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                {message && (
                  <div
                    className={[
                      'rounded-2xl px-4 py-3 text-sm ring-1',
                      message === 'สำเร็จ'
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
                  {loading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
                </button>

                <div className="text-right text-xs text-slate-500">
                  ยังไม่มีบัญชี?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-slate-700 hover:text-slate-900"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>

                <div className="text-center text-xs text-slate-500">
                  กลับหน้า{' '}
                  <Link
                    href="/"
                    className="font-semibold text-slate-700 hover:text-slate-900"
                  >
                    หน้าแรก
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
export default LoginPage