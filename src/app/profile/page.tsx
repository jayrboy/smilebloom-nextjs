'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/src/app/components/Navbar';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import MobileAppBar from '@/src/app/components/MobileAppBar';

type ProfileUser = {
  _id: string;
  username: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
};

function isValidEmail(email: string) {
  const e = email.trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return Boolean(e) && e.length <= 254 && re.test(e);
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const username = session?.user?.username;

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => isValidEmail(email), [email]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/profile');
      const data = (await res.json()) as { user?: ProfileUser; error?: string };
      if (!res.ok) throw new Error(data?.error || 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ');

      setUser(data.user || null);
      setEmail(data.user?.email || '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { user?: ProfileUser; error?: string };
      if (!res.ok) throw new Error(data?.error || 'บันทึกไม่สำเร็จ');

      setUser(data.user || null);
      setMessage('บันทึกข้อมูลสำเร็จ');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    void load();
  }, [status]);

  return (
    <>
      <Navbar session={session} />
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">Profile</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                ข้อมูลผู้ใช้งาน
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                แก้ไขข้อมูลเบื้องต้นของบัญชีคุณ
              </p>
            </div>

            {/* {status === 'authenticated' && (
              <button
                type="button"
                onClick={load}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                รีเฟรช
              </button>
            )} */}
          </div>

          {status === 'loading' && (
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-black/5">
              กำลังตรวจสอบสถานะผู้ใช้...
            </div>
          )}

          {status === 'unauthenticated' && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                กรุณาเข้าสู่ระบบเพื่อดู/แก้ไขโปรไฟล์
              </div>
              <p className="mt-2 text-sm text-slate-600">
                เพื่อเข้าถึงข้อมูลบัญชีและอัปเดตอีเมล
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  ไปหน้าเข้าสู่ระบบ
                </Link>
                <Link
                  href="/"
                  className="rounded-full px-5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  กลับหน้า Home
                </Link>
              </div>
            </div>
          )}

          {status === 'authenticated' && (
            <div className="mt-6 grid gap-6">
              {(error || message) && (
                <div
                  className={[
                    'rounded-2xl px-4 py-3 text-sm ring-1',
                    error
                      ? 'bg-rose-50 text-rose-800 ring-rose-100'
                      : 'bg-emerald-50 text-emerald-800 ring-emerald-100',
                  ].join(' ')}
                  role="status"
                >
                  {error || message}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-1">
                  <div className="text-sm font-semibold text-slate-500">Account</div>
                  <div className="mt-2 text-lg font-extrabold tracking-tight text-slate-900">
                    {username || user?.username || '-'}
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Role</span>
                      <span className="font-semibold text-slate-700">{user?.role || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Status</span>
                      <span className="font-semibold text-slate-700">{user?.status || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Updated</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateTime(user?.updatedAt)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-500">Edit profile</div>
                      <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                        แก้ไขข้อมูลเบื้องต้น
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        เปลี่ยนอีเมลสำหรับการติดต่อ (บันทึกลงระบบ)
                      </p>
                    </div>
                    {loading && <div className="text-sm font-semibold text-slate-500">กำลังโหลด…</div>}
                  </div>

                  <form onSubmit={onSave} className="mt-5 grid gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        autoComplete="email"
                      />
                      <div className="mt-2 text-xs text-slate-500">
                        {email.trim()
                          ? canSave
                            ? 'รูปแบบอีเมลถูกต้อง'
                            : 'รูปแบบอีเมลไม่ถูกต้อง'
                          : 'กรอกอีเมลเพื่อบันทึก'}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(user?.email || '');
                          setError(null);
                          setMessage(null);
                        }}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        รีเซ็ต
                      </button>
                      <button
                        type="submit"
                        disabled={saving || loading || !canSave}
                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          )}
        </div>

        <MobileAppBar session={session} />
      </div>
    </>
  )
}
export default ProfilePage