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
  dentistName?: string;
  dentistDay?: string; // YYYY-MM-DD (date-only)
  dentistHistory?: Array<{
    dentistName?: string;
    dentistDay: string;
    savedAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

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

function diffDaysFromTodayDateOnly(dateOnly: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUTC = Date.UTC(y, mo - 1, d);
  const diffDays = Math.round((targetUTC - todayUTC) / 86400000);
  return diffDays;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const username = session?.user?.username;

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dentistName, setDentistName] = useState('');
  const [dentistDay, setDentistDay] = useState(''); // YYYY-MM-DD

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/profile');
      const data = (await res.json()) as { user?: ProfileUser; error?: string };
      if (!res.ok) throw new Error(data?.error || 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ');

      setUser(data.user || null);
      setDentistName(data.user?.dentistName || '');
      setDentistDay(data.user?.dentistDay || '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistName: dentistName.trim(),
          dentistDay: dentistDay.trim(),
        }),
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

  const hasChanges = useMemo(() => {
    const baseName = user?.dentistName || '';
    const baseDay = user?.dentistDay || '';
    return dentistName.trim() !== baseName || dentistDay.trim() !== baseDay;
  }, [dentistName, dentistDay, user?.dentistName, user?.dentistDay]);

  const dentistDayHint = useMemo(() => {
    const v = dentistDay.trim();
    if (!v) return 'เลือกวันนัดเพื่อตรวจคำนวณจำนวนวัน';
    const diff = diffDaysFromTodayDateOnly(v);
    if (diff === null) return 'รูปแบบวันที่ไม่ถูกต้อง';
    if (diff === 0) return 'นัดครั้งต่อไป วันนี้';
    if (diff > 0) return `นัดครั้งต่อไป ในอีก ${diff} วัน`;
    return `ผ่านมาแล้ว ${Math.abs(diff)} วัน`;
  }, [dentistDay]);

  const dentistHistory = useMemo(() => {
    const list = user?.dentistHistory ?? [];
    return [...list].reverse();
  }, [user?.dentistHistory]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void load();
  }, [status]);

  return (
    <>
      <Navbar session={session} />
      <div className="min-h-screen" style={{ backgroundColor: '#448575' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          {/* <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">Profile</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                ข้อมูลผู้ใช้งาน
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                แก้ไขข้อมูลเบื้องต้นของบัญชีคุณ
              </p>
            </div>

            {status === 'authenticated' && (
              <button
                type="button"
                onClick={load}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                รีเฟรช
              </button>
            )}
          </div> */}

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

              <div className="grid gap-4 lg:grid-cols-2">
                {/* <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-1">
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
                </section> */}

                <section>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">Edit profile</div>
                      <h2 className="mt-1 text-lg font-extrabold tracking-tight text-white">
                        ข้อมูลหมอฟัน
                      </h2>
                      <p className="mt-1 text-sm text-white">
                        บันทึกชื่อทัตแพทย์ประจำและวันนัดครั้งถัดไป
                      </p>
                    </div>
                    {loading && <div className="text-sm font-semibold text-slate-500">กำลังโหลด…</div>}
                  </div>

                  <form onSubmit={onSave} className="mt-5 grid gap-4">
                    <div>
                      <label className="text-sm font-semibold text-white">ทัตแพทย์ประจำ</label>
                      <input
                        type="text"
                        value={dentistName}
                        onChange={(e) => setDentistName(e.target.value)}
                        placeholder="ชื่อคุณหมอ"
                        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white">
                        DENTIST DAY <span className="text-white">(นัดครั้งต่อไป)</span>
                      </label>
                      <input
                        type="date"
                        value={dentistDay}
                        onChange={(e) => setDentistDay(e.target.value)}
                        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text- ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <div className="mt-2 text-xs text-white"><b>{dentistDayHint}</b></div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDentistName(user?.dentistName || '');
                          setDentistDay(user?.dentistDay || '');
                          setError(null);
                          setMessage(null);
                        }}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        รีเซ็ต
                      </button>
                      <button
                        type="submit"
                        disabled={saving || loading || !hasChanges}
                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">History</div>
                        <div className="mt-1 text-lg font-extrabold tracking-tight text-white">
                          ประวัติการบันทึก
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">เก็บล่าสุด 50 รายการ</div>
                    </div>

                    {dentistHistory.length === 0 ? (
                      <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
                        ยังไม่มีประวัติการบันทึก
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2">
                        {dentistHistory.map((h, idx) => {
                          const diff = diffDaysFromTodayDateOnly(h.dentistDay);
                          const relative =
                            diff === null
                              ? '-'
                              : diff === 0
                                ? 'วันนี้'
                                : diff > 0
                                  ? `ในอีก ${diff} วัน`
                                  : `ผ่านมาแล้ว ${Math.abs(diff)} วัน`;

                          return (
                            <div
                              key={`${h.savedAt ?? idx}-${h.dentistDay}`}
                              className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-slate-100"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="font-semibold text-slate-900">
                                  {h.dentistDay}{' '}
                                  <span className="font-normal text-slate-500">({relative})</span>
                                </div>
                                <div className="text-xs text-slate-500">{formatDateTime(h.savedAt)}</div>
                              </div>
                              <div className="mt-1 text-xs text-slate-600">
                                ทัตแพทย์ประจำ: <span className="font-semibold text-slate-700">{h.dentistName || '-'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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