'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/src/app/components/Navbar';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import MobileAppBar from '@/src/app/components/MobileAppBar';
import { LuRefreshCcw } from "react-icons/lu";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const username = session?.user?.username as string | undefined;
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [events, setEvents] = useState<
    Array<{
      _id?: string;
      childId?: { _id: string; fullname: string } | string;
      toothCode?: string;
      type?: string;
      eventDate?: string;
      createdAt?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [childrenRes, eventsRes] = await Promise.all([
        fetch('/api/children'),
        fetch('/api/teeth-events?limit=10'),
      ]);

      const childrenData = await childrenRes.json();
      const eventsData = await eventsRes.json();

      if (!childrenRes.ok) throw new Error(childrenData?.error || 'โหลดข้อมูลเด็กไม่สำเร็จ');
      if (!eventsRes.ok) throw new Error(eventsData?.error || 'โหลดเหตุการณ์ล่าสุดไม่สำเร็จ');

      setChildrenCount((childrenData.children || []).length);
      setEvents(eventsData.events || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    void load();
  }, [status]);

  const lastEventText = useMemo(() => {
    const ev = events[0];
    if (!ev) return '-';
    const childName =
      typeof ev?.childId === 'string'
        ? 'เด็ก'
        : (ev?.childId as { fullname?: string } | undefined)?.fullname || 'เด็ก';
    const tooth = ev?.toothCode ? `ซี่ ${ev.toothCode}` : 'ไม่ระบุซี่';
    return `${childName} • ${tooth} • ${ev.type}`;
  }, [events]);

  return (
    <>
      <Navbar session={session} />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">Dashboard</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                สรุปภาพรวม
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                ดูภาพรวมของเด็กและเหตุการณ์การขึ้นฟันล่าสุด
              </p>
            </div>
            {status === 'authenticated' && (
              <button
                type="button"
                onClick={load}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <LuRefreshCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {status === 'loading' && (
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-black/5">
              กำลังตรวจสอบสถานะผู้ใช้...
            </div>
          )}

          {status === 'unauthenticated' && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                กรุณาเข้าสู่ระบบเพื่อดู Dashboard
              </div>
              <p className="mt-2 text-sm text-slate-600">
                เพื่อเข้าถึงข้อมูลเด็กและเหตุการณ์การขึ้นฟัน
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
              {error && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <div className="text-sm font-semibold text-slate-500">Children</div>
                  <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {loading ? '…' : childrenCount}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">จำนวนเด็กในบัญชี</div>
                  <div className="mt-4">
                    <Link
                      href="/teeth"
                      className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      ไปหน้า Teeth
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <div className="text-sm font-semibold text-slate-500">Latest</div>
                  <div className="mt-2 text-base font-extrabold text-slate-900">
                    {loading ? 'กำลังโหลด...' : lastEventText}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    เหตุการณ์ล่าสุด (จาก 10 รายการล่าสุด)
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/teeth"
                      className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      เพิ่มเหตุการณ์
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <div className="text-sm font-semibold text-slate-500">Account</div>
                  <div className="mt-2 text-base font-extrabold text-slate-900">
                    {username || '-'}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">ผู้ใช้งานปัจจุบัน</div>
                  <div className="mt-4">
                    <Link
                      href="/profile"
                      className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      ไปหน้า Profile
                    </Link>
                  </div>
                </div>
              </div>

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Recent events</div>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      เหตุการณ์ล่าสุด
                    </h2>
                  </div>
                  <Link
                    href="/teeth"
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    ดู/เพิ่มใน Teeth
                  </Link>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                    <div className="col-span-4">เด็ก</div>
                    <div className="col-span-2">ซี่ฟัน</div>
                    <div className="col-span-3">ประเภท</div>
                    <div className="col-span-3 text-right">วันที่</div>
                  </div>

                  {events.length === 0 ? (
                    <div className="bg-white px-4 py-5 text-sm text-slate-500">
                      ยังไม่มีเหตุการณ์
                    </div>
                  ) : (
                    events.map((ev, idx) => {
                      const date = new Date(ev.eventDate || ev.createdAt || Date.now());
                      const dateText = Number.isNaN(date.getTime())
                        ? '-'
                        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
                            date.getDate()
                          ).padStart(2, '0')}`;
                      return (
                        <div
                          key={ev._id || `${idx}`}
                          className={[
                            'grid grid-cols-12 px-4 py-4 text-sm',
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                          ].join(' ')}
                        >
                          <div className="col-span-4 font-semibold text-slate-900">
                            {typeof ev.childId === 'string'
                              ? '—'
                              : ev.childId?.fullname || '—'}
                          </div>
                          <div className="col-span-2 text-slate-700">
                            {ev.toothCode || <span className="text-slate-400">-</span>}
                          </div>
                          <div className="col-span-3 text-slate-700">{ev.type}</div>
                          <div className="col-span-3 text-right text-slate-600">{dateText}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        <MobileAppBar session={session} />
      </div>
    </>
  )
}
export default DashboardPage