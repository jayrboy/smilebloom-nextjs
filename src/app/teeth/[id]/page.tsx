'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Navbar from '@/src/app/components/Navbar';
import MobileAppBar from '@/src/app/components/MobileAppBar';
import Child from '@/src/app/components/Child';
import TeethEvent from '@/src/app/components/TeethEvent';
import { TeethQuadrantProgress } from '@/src/app/components/TeethQuadrantProgress';

type TeethType = 'DECIDUOUS' | 'PERMANENT';
type ChildRow = {
  _id: string;
  fullname: string;
  birthday: string;
  gender?: 'MALE' | 'FEMALE';
};

type TeethDef = {
  code: string;
  type: TeethType;
  arch: 'UPPER' | 'LOWER';
  side: 'LEFT' | 'RIGHT';
  tooth_kind: 'INCISOR' | 'CANINE' | 'MOLAR' | 'PREMOLAR';
  name: string;
  name_th: string;
  order: number;
  start_occurrence_month: number;
  end_occurrence_month: number;
  start_destory_month?: number;
  end_destory_month?: number;
};

type TeethEventRow = {
  _id: string;
  childId?: { _id: string; fullname: string; birthday?: string } | string;
  type: 'ERUPTED' | 'SHED' | 'EXTRACTED' | 'NOTE';
  toothCode?: string;
  remark?: string;
  eventDate?: string;
  createdAt?: string;
};

function ageInMonths(birthday: string | Date | undefined) {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (Number.isNaN(b.getTime())) return null;

  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

type DeciduousLegendKey = 'CENTRAL' | 'LATERAL' | 'CANINE' | 'FIRST_MOLAR' | 'SECOND_MOLAR';
type DeciduousLegend = {
  key: DeciduousLegendKey;
  label: string;
  label_th: string;
  dotClass: string;
  pillClass: string;
  ringClass: string;
};

const DECIDUOUS_LEGEND: Record<DeciduousLegendKey, DeciduousLegend> = {
  CENTRAL: {
    key: 'CENTRAL',
    label: 'Central incisor',
    label_th: 'ฟันหน้าซี่กลาง',
    dotClass: 'bg-rose-600',
    pillClass: 'bg-rose-50 text-rose-800 ring-rose-100',
    ringClass: 'ring-rose-200',
  },
  LATERAL: {
    key: 'LATERAL',
    label: 'Lateral incisor',
    label_th: 'ฟันหน้าซี่ข้าง',
    dotClass: 'bg-orange-500',
    pillClass: 'bg-orange-50 text-orange-800 ring-orange-100',
    ringClass: 'ring-orange-200',
  },
  CANINE: {
    key: 'CANINE',
    label: 'Canine cuspid',
    label_th: 'ฟันเขี้ยว',
    dotClass: 'bg-emerald-600',
    pillClass: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    ringClass: 'ring-emerald-200',
  },
  FIRST_MOLAR: {
    key: 'FIRST_MOLAR',
    label: 'First molar',
    label_th: 'ฟันกรามซี่ที่ 1',
    dotClass: 'bg-indigo-700',
    pillClass: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    ringClass: 'ring-indigo-200',
  },
  SECOND_MOLAR: {
    key: 'SECOND_MOLAR',
    label: 'Second molar',
    label_th: 'ฟันกรามซี่ที่ 2',
    dotClass: 'bg-violet-700',
    pillClass: 'bg-violet-50 text-violet-800 ring-violet-100',
    ringClass: 'ring-violet-200',
  },
};

function getDeciduousLegendByCode(code: string): DeciduousLegend | null {
  const last = code?.slice(-1);
  switch (last) {
    case '1':
      return DECIDUOUS_LEGEND.CENTRAL;
    case '2':
      return DECIDUOUS_LEGEND.LATERAL;
    case '3':
      return DECIDUOUS_LEGEND.CANINE;
    case '4':
      return DECIDUOUS_LEGEND.FIRST_MOLAR;
    case '5':
      return DECIDUOUS_LEGEND.SECOND_MOLAR;
    default:
      return null;
  }
}

export default function TeethPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const childId = (id || '').trim();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TeethType>('DECIDUOUS');
  const [childrenList, setChildrenList] = useState<ChildRow[]>([]);
  const [teethList, setTeethList] = useState<TeethDef[]>([]);
  const [events, setEvents] = useState<TeethEventRow[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingTeeth, setLoadingTeeth] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventsReqIdRef = useRef(0);

  useEffect(() => {
    if (!childId) return;
    try {
      localStorage.setItem('smilebloom:lastChildId', childId);
    } catch {
      // ignore
    }
  }, [childId]);

  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c._id === childId) || null;
  }, [childrenList, childId]);

  const childAgeMonths = useMemo(() => ageInMonths(selectedChild?.birthday), [selectedChild?.birthday]);

  const loadChildren = async () => {
    setLoadingChildren(true);
    setError(null);
    try {
      const res = await fetch('/api/children');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'โหลดรายการเด็กไม่สำเร็จ');
      const list = (data.children || []) as ChildRow[];
      setChildrenList(list);

      if (list.length > 0 && childId && !list.some((c) => c._id === childId)) {
        router.replace(`/teeth/${encodeURIComponent(list[0]._id)}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadTeeth = async () => {
    setLoadingTeeth(true);
    setError(null);
    try {
      const res = await fetch('/api/teeth');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'โหลดข้อมูลลำดับฟันไม่สำเร็จ');
      setTeethList((data.teeth || []) as TeethDef[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoadingTeeth(false);
    }
  };

  const loadEvents = async (cid?: string) => {
    const id = (cid || childId || '').trim();
    if (!id) {
      setEvents([]);
      return;
    }
    const reqId = ++eventsReqIdRef.current;
    setLoadingEvents(true);
    setError(null);
    try {
      const res = await fetch(`/api/teeth-events?childId=${encodeURIComponent(id)}&limit=100`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'โหลดเหตุการณ์ไม่สำเร็จ');
      if (reqId !== eventsReqIdRef.current) return;
      setEvents((data.events || []) as TeethEventRow[]);
    } catch (e: unknown) {
      if (reqId !== eventsReqIdRef.current) return;
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      if (reqId === eventsReqIdRef.current) setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    void loadChildren();
    void loadTeeth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void loadEvents(childId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, status]);

  const teethByTab = useMemo(() => {
    return teethList
      .filter((t) => t.type === tab)
      .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
  }, [teethList, tab]);

  const lastEventByTooth = useMemo(() => {
    const map = new Map<string, TeethEventRow>();
    for (const ev of events) {
      if (!ev.toothCode) continue;
      if (!map.has(ev.toothCode)) map.set(ev.toothCode, ev);
    }
    return map;
  }, [events]);

  const pageBusy = loadingChildren || loadingTeeth || loadingEvents;

  return (
    <div className="min-h-screen" >
      <Navbar session={session} />
     <div style={{ backgroundColor: '#448575' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Teeth</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ลำดับการขึ้นฟัน & บันทึกเหตุการณ์
              </h1>
              <p className="mt-2 text-sm text-white">เลือกเด็ก แล้วบันทึกเหตุการณ์เพื่อดูย้อนหลัง (ฟันน้ำนม)</p>
            </div>
  
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('DECIDUOUS')}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold ring-1',
                  tab === 'DECIDUOUS'
                    ? 'bg-slate-900 text-white ring-slate-900'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                ฟันน้ำนม
              </button>
              {/* <button
                type="button"
                onClick={() => setTab('PERMANENT')}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold ring-1',
                  tab === 'PERMANENT'
                    ? 'bg-slate-900 text-white ring-slate-900'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                ฟันแท้
              </button> */}
            </div>
          </div>
  
          {status === 'loading' && (
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-black/5">
              กำลังตรวจสอบสถานะผู้ใช้...
            </div>
          )}
  
          {status === 'unauthenticated' && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="text-lg font-extrabold tracking-tight text-slate-900">กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้</div>
              <p className="mt-2 text-sm text-slate-600">เพื่อบันทึกข้อมูลเด็กและเหตุการณ์การขึ้นฟัน</p>
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
  
              <Child
                childrenList={childrenList}
                selectedChildId={childId}
                onSelect={(id: string) => router.push(`/teeth/${encodeURIComponent(id)}`)}
                onCreated={(child?: { _id?: string }) => {
                  void loadChildren();
                  if (child?._id) router.push(`/teeth/${encodeURIComponent(child._id)}`);
                }}
              />
  
              {/* Teeth Monitoring */}
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-5">
                    <div className="text-sm font-semibold text-slate-500">Introduction</div>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-400 bg-clip-text text-transparent">
                        ลำดับการขึ้นของฟันน้ำนม
                      </span>
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      อินโฟกราฟิกนี้ช่วยดู “ลำดับการขึ้นของฟันน้ำนม” โดยช่วงอายุเป็น
                      <span className="font-semibold"> เดือนหลังคลอด</span> และเป็นค่าโดยประมาณ
                    </p>
  
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        [
                          DECIDUOUS_LEGEND.CENTRAL,
                          DECIDUOUS_LEGEND.LATERAL,
                          DECIDUOUS_LEGEND.CANINE,
                          DECIDUOUS_LEGEND.FIRST_MOLAR,
                          DECIDUOUS_LEGEND.SECOND_MOLAR,
                        ] as const
                      ).map((item) => (
                        <span
                          key={item.key}
                          className={[
                            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1',
                            item.pillClass,
                          ].join(' ')}
                        >
                          <span className={['h-2.5 w-2.5 rounded-sm', item.dotClass].join(' ')} />
                          <span className="whitespace-nowrap">{item.label_th}</span>
                        </span>
                      ))}
                    </div>
                  </div>
  
                  <div className="lg:col-span-7">
                    <div className="relative overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                      <Image
                        src="/teeth/deciduous-eruption.png"
                        alt="ลำดับการขึ้นของฟันน้ำนม"
                        width={1200}
                        height={650}
                        className="h-auto w-full object-contain"
                        priority
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      หมายเหตุ: ช่วงอายุอาจแตกต่างกันในเด็กแต่ละคน หากมีอาการผิดปกติควรปรึกษาทันตแพทย์
                    </p>
                  </div>
                </div>
              </section>
  
              {/* Saved quadrants overview */}
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <TeethQuadrantProgress
                    imageUrl="/teeth/teeth_monitor.png"
                    teethList={teethList}
                    events={events}
                  />
                </section>
    
                <TeethEvent
                  childId={childId}
                  teethType={tab}
                  teethList={teethList}
                  events={events}
                  onReload={() => loadEvents(childId)}
                />
              </div>
  
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Timeline</div>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      โครงสร้างลำดับการขึ้นฟัน ({tab === 'DECIDUOUS' ? 'ฟันน้ำนม' : 'ฟันแท้'})
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      ช่วงอายุโดยประมาณเป็น “เดือนหลังคลอด”
                      {childAgeMonths !== null ? ` • อายุปัจจุบัน ~ ${childAgeMonths} เดือน` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void loadTeeth();
                      void loadEvents();
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    รีเฟรชข้อมูล
                  </button>
                </div>
  
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teethByTab
                    .filter((t) => {
                      const last = lastEventByTooth.get(t.code);
                      return (
                        last &&
                        (last.type === 'ERUPTED' || last.type === 'SHED' || last.type === 'EXTRACTED')
                      );
                    })
                    .map((t) => {
                      const last = lastEventByTooth.get(t.code);
                      const statusText =
                        last?.type === 'ERUPTED'
                          ? 'ขึ้นแล้ว'
                          : last?.type === 'SHED'
                            ? 'หลุดแล้ว'
                            : last?.type === 'EXTRACTED'
                              ? 'ถอนแล้ว'
                              : 'ยังไม่บันทึก';
  
                      const inWindow =
                        childAgeMonths !== null &&
                        childAgeMonths >= t.start_occurrence_month &&
                        childAgeMonths <= t.end_occurrence_month;
  
                      const deciduousLegend = tab === 'DECIDUOUS' ? getDeciduousLegendByCode(t.code) : null;
  
                      return (
                        <div
                          key={t.code}
                          className={[
                            'rounded-2xl p-4 ring-1 transition',
                            inWindow ? 'bg-rose-50 ring-rose-100' : 'bg-white ring-slate-200 hover:shadow-sm',
                            deciduousLegend ? deciduousLegend.ringClass : '',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span>{t.code}</span>
                                {deciduousLegend && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className={['h-2.5 w-2.5 rounded-sm', deciduousLegend.dotClass].join(' ')} />
                                    <span className="text-slate-500">{deciduousLegend.label}</span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-sm font-extrabold text-slate-900">{t.name_th}</div>
                            </div>
                            <span
                              className={[
                                'rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                                statusText === 'ขึ้นแล้ว'
                                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                                  : statusText === 'ยังไม่บันทึก'
                                    ? 'bg-slate-50 text-slate-700 ring-slate-200'
                                    : 'bg-indigo-50 text-indigo-800 ring-indigo-100',
                              ].join(' ')}
                            >
                              {statusText}
                            </span>
                          </div>
  
                          <div className="mt-3 text-xs text-slate-600">
                            ช่วงขึ้นโดยประมาณ: {t.start_occurrence_month}–{t.end_occurrence_month} เดือน
                          </div>
  
                          {tab === 'DECIDUOUS' && t.start_destory_month && t.end_destory_month && (
                            <div className="mt-1 text-xs text-slate-600">
                              ช่วงหลุด/เปลี่ยน: {t.start_destory_month}–{t.end_destory_month} เดือน
                            </div>
                          )}
  
                          {inWindow && (
                            <div className="mt-3 text-xs font-semibold text-rose-700">อยู่ในช่วงที่พบบ่อยสำหรับการขึ้นของซี่นี้</div>
                          )}
                        </div>
                      );
                    })}
                </div>
  
                {loadingTeeth && <div className="mt-4 text-sm text-slate-500">กำลังโหลดข้อมูลลำดับฟัน...</div>}
              </section>
  
              {pageBusy && <div className="text-center text-sm text-slate-500">กำลังโหลดข้อมูล...</div>}
            </div>
          )}
        </div>
     </div>

      <MobileAppBar session={session} />
    </div>
  );
}