'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/src/app/components/Navbar';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import MobileAppBar from '@/src/app/components/MobileAppBar';
import { LuRefreshCcw } from 'react-icons/lu';
import { FaEdit, FaTeeth } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

type ChildRow = {
  _id: string;
  fullname: string;
  birthday: string;
  gender?: 'MALE' | 'FEMALE';
  createdAt?: string;
  updatedAt?: string;
};

function dateToISODate(date: string | Date | undefined) {
  try {
    if (!date) return '';
    if (typeof date === 'string') {
      const s = date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function formatDateDisplay(date: string | Date | undefined) {
  const iso = dateToISODate(date);
  if (!iso) return '';
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function genderText(g?: ChildRow['gender']) {
  if (g === 'MALE') return 'ชาย';
  if (g === 'FEMALE') return 'หญิง';
  return '-';
}

const DashboardPage = () => {
  const { data: session, status } = useSession();

  const [childrenList, setChildrenList] = useState<ChildRow[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Add form
  const [fullname, setFullname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'' | 'MALE' | 'FEMALE'>('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Edit row
  const [editingId, setEditingId] = useState<string>('');
  const [editFullname, setEditFullname] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editGender, setEditGender] = useState<'' | 'MALE' | 'FEMALE'>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string>('');

  const hasAutoOpenedAddModalRef = useRef(false);

  const childrenCount = childrenList.length;

  const canAdd = useMemo(() => {
    return fullname.trim().length > 0 && Boolean(birthday);
  }, [fullname, birthday]);

  const canSaveEdit = useMemo(() => {
    return editFullname.trim().length > 0 && Boolean(editBirthday);
  }, [editFullname, editBirthday]);

  const loadChildren = async ({ initial = false }: { initial?: boolean } = {}) => {
    setLoadingChildren(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/children');
      const data = (await res.json()) as { children?: ChildRow[]; error?: string };
      if (!res.ok) throw new Error(data?.error || 'โหลดรายการเด็กไม่สำเร็จ');
      const list = (data.children || []) as ChildRow[];
      setChildrenList(list);

      // Auto-open add modal only on first entry (initial load) when no children exist.
      if (initial && !hasAutoOpenedAddModalRef.current && list.length === 0) {
        hasAutoOpenedAddModalRef.current = true;
        setAddModalOpen(true);
        setError(null);
        setMessage(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    void loadChildren({ initial: true });
  }, [status]);

  useEffect(() => {
    if (!addModalOpen) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setAddModalOpen(false);
        setError(null);
        setMessage(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addModalOpen]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) {
      setError('กรุณากรอกชื่อและวันเกิด');
      return;
    }

    setAdding(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          birthday,
          gender: gender || undefined,
        }),
      });
      const data = (await res.json()) as { child?: ChildRow; error?: string };
      if (!res.ok) throw new Error(data?.error || 'เพิ่มข้อมูลเด็กไม่สำเร็จ');

      if (data.child?._id) {
        setChildrenList((prev) => [data.child as ChildRow, ...prev]);
      } else {
        await loadChildren();
      }

      setFullname('');
      setBirthday('');
      setGender('');
      setAddModalOpen(false);
      setMessage('เพิ่มข้อมูลเด็กสำเร็จ');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (child: ChildRow) => {
    setEditingId(child._id);
    setEditFullname(child.fullname || '');
    setEditBirthday(dateToISODate(child.birthday));
    setEditGender(child.gender || '');
    setPendingDeleteId('');
    setError(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditFullname('');
    setEditBirthday('');
    setEditGender('');
  };

  const requestDelete = (id: string) => {
    if (editingId) return;
    setPendingDeleteId(id);
    setError(null);
    setMessage(null);
  };

  const cancelDelete = () => {
    setPendingDeleteId('');
  };

  const onSaveEdit = async (id: string) => {
    if (!canSaveEdit) {
      setError('กรุณากรอกชื่อและวันเกิดให้ถูกต้อง');
      return;
    }

    setSavingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/children/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: editFullname,
          birthday: editBirthday,
          gender: editGender || undefined,
        }),
      });
      const data = (await res.json()) as { child?: ChildRow; error?: string };
      if (!res.ok) throw new Error(data?.error || 'บันทึกไม่สำเร็จ');

      if (data.child?._id) {
        setChildrenList((prev) => prev.map((c) => (c._id === id ? (data.child as ChildRow) : c)));
      } else {
        await loadChildren();
      }

      cancelEdit();
      setMessage('บันทึกข้อมูลสำเร็จ');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/children/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data?.error || 'ลบไม่สำเร็จ');

      setChildrenList((prev) => prev.filter((c) => c._id !== id));
      if (editingId === id) cancelEdit();
      if (pendingDeleteId === id) cancelDelete();
      setMessage('ลบข้อมูลสำเร็จ');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar session={session} />
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">Children</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                เพิ่มข้อมูลเด็ก & รายการเด็ก
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                เพิ่ม แก้ไข และลบข้อมูลเด็กในบัญชีคุณ
              </p>
            </div>
            {/* {status === 'authenticated' && (
              <button
                type="button"
                onClick={loadChildren}
                disabled={loadingChildren}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="รีเฟรชรายการเด็ก"
              >
                <LuRefreshCcw className="w-4 h-4" />
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
                กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลเด็ก
              </div>
              <p className="mt-2 text-sm text-slate-600">
                เพื่อเพิ่ม แก้ไข และดูรายการเด็กในบัญชีคุณ
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

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Children</div>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      รายการเด็ก
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      กดดูฟันเพื่อบันทึกเหตุการณ์ หรือกดแก้ไข/ลบเพื่อจัดการข้อมูล
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden text-sm font-semibold text-slate-500 sm:block">
                      ทั้งหมด: {childrenCount}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddModalOpen(true);
                        setError(null);
                        setMessage(null);
                      }}
                      disabled={loadingChildren || Boolean(editingId) || Boolean(pendingDeleteId)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      + เพิ่มเด็ก
                    </button>
                    <button
                      type="button"
                      onClick={() => loadChildren({ initial: false })}
                      disabled={loadingChildren}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LuRefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingChildren && (
                  <div className="mt-4 text-sm font-semibold text-slate-500">กำลังโหลด…</div>
                )}

                {childrenList.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
                    ยังไม่มีเด็กในบัญชี — กดปุ่ม “+ เพิ่มเด็ก” เพื่อเพิ่มข้อมูล
                  </div>
                ) : (
                  <>
                    {/* Mobile layout */}
                    <div className="mt-4 grid gap-3 sm:hidden">
                      {childrenList.map((c) => {
                        const isEditing = editingId === c._id;
                        const isPendingDelete = pendingDeleteId === c._id;
                        const rowBusy = savingId === c._id || deletingId === c._id || loadingChildren;

                        return (
                          <div
                            key={c._id}
                            className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold text-slate-500">ชื่อ</div>
                                <div className="mt-1 font-extrabold text-slate-900">
                                  {isEditing ? (
                                    <input
                                      value={editFullname}
                                      onChange={(e) => setEditFullname(e.target.value)}
                                      className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                      placeholder="ชื่อ-นามสกุล"
                                      disabled={rowBusy}
                                      required
                                    />
                                  ) : (
                                    c.fullname
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-xs font-semibold text-slate-500">วันเกิด</div>
                                <div className="mt-1 text-slate-700">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      value={editBirthday}
                                      onChange={(e) => setEditBirthday(e.target.value)}
                                      className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                      disabled={rowBusy}
                                      required
                                    />
                                  ) : (
                                    formatDateDisplay(c.birthday) || '-'
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-500">เพศ</div>
                                <div className="mt-1 text-slate-700">
                                  {isEditing ? (
                                    <select
                                      value={editGender}
                                      onChange={(e) =>
                                        setEditGender(e.target.value as '' | 'MALE' | 'FEMALE')
                                      }
                                      className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                      disabled={rowBusy}
                                    >
                                      <option value="">ไม่ระบุ</option>
                                      <option value="MALE">ชาย</option>
                                      <option value="FEMALE">หญิง</option>
                                    </select>
                                  ) : (
                                    genderText(c.gender)
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onSaveEdit(c._id)}
                                    disabled={rowBusy || !canSaveEdit}
                                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {savingId === c._id ? 'กำลังบันทึก…' : 'บันทึก'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={rowBusy}
                                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    ยกเลิก
                                  </button>
                                </>
                              ) : isPendingDelete ? (
                                <>
                                  <span className="mr-auto text-xs font-semibold text-rose-700">
                                    ยืนยันลบรายการนี้?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onDelete(c._id)}
                                    disabled={rowBusy}
                                    className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingId === c._id ? 'กำลังลบ…' : 'ยืนยัน'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelDelete}
                                    disabled={rowBusy}
                                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    ยกเลิก
                                  </button>
                                </>
                              ) : (
                                <>
                                  <Link
                                    href={`/teeth/${encodeURIComponent(c._id)}`}
                                    className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                                  >
                                    <FaTeeth className="h-4 w-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(c)}
                                    disabled={
                                      rowBusy || Boolean(editingId) || Boolean(pendingDeleteId)
                                    }
                                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <FaEdit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDelete(c._id)}
                                    disabled={rowBusy || Boolean(editingId)}
                                    className="rounded-full px-4 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <MdDelete className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop layout */}
                    <div className="mt-4 hidden overflow-hidden rounded-2xl ring-1 ring-slate-200 sm:block">
                      <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                        <div className="col-span-5">ชื่อ</div>
                        <div className="col-span-2">วันเกิด</div>
                        <div className="col-span-2">เพศ</div>
                        <div className="col-span-3 text-right">จัดการ</div>
                      </div>

                      {childrenList.map((c, idx) => {
                        const isEditing = editingId === c._id;
                        const isPendingDelete = pendingDeleteId === c._id;
                        const rowBusy = savingId === c._id || deletingId === c._id || loadingChildren;

                        return (
                          <div
                            key={c._id}
                            className={[
                              'grid grid-cols-12 items-center px-4 py-4 text-sm',
                              idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                            ].join(' ')}
                          >
                            <div className="col-span-5 pr-2">
                              {isEditing ? (
                                <input
                                  value={editFullname}
                                  onChange={(e) => setEditFullname(e.target.value)}
                                  className="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  placeholder="ชื่อ-นามสกุล"
                                  disabled={rowBusy}
                                  required
                                />
                              ) : (
                                <div className="font-semibold text-slate-900">{c.fullname}</div>
                              )}
                            </div>

                            <div className="col-span-2 pr-2 text-slate-700">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editBirthday}
                                  onChange={(e) => setEditBirthday(e.target.value)}
                                  className="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  disabled={rowBusy}
                                  required
                                />
                              ) : (
                                <span>{formatDateDisplay(c.birthday) || '-'}</span>
                              )}
                            </div>

                            <div className="col-span-2 pr-2 text-slate-700">
                              {isEditing ? (
                                <select
                                  value={editGender}
                                  onChange={(e) =>
                                    setEditGender(e.target.value as '' | 'MALE' | 'FEMALE')
                                  }
                                  className="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  disabled={rowBusy}
                                >
                                  <option value="">ไม่ระบุ</option>
                                  <option value="MALE">ชาย</option>
                                  <option value="FEMALE">หญิง</option>
                                </select>
                              ) : (
                                <span>{genderText(c.gender)}</span>
                              )}
                            </div>

                            <div className="col-span-3 flex items-center justify-end gap-2 flex-nowrap">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onSaveEdit(c._id)}
                                    disabled={rowBusy || !canSaveEdit}
                                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    {savingId === c._id ? 'กำลังบันทึก…' : 'บันทึก'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={rowBusy}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    ยกเลิก
                                  </button>
                                </>
                              ) : isPendingDelete ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onDelete(c._id)}
                                    disabled={rowBusy}
                                    className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    {deletingId === c._id ? 'กำลังลบ…' : 'ยืนยัน'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelDelete}
                                    disabled={rowBusy}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    ยกเลิก
                                  </button>
                                </>
                              ) : (
                                <>
                                  <Link
                                    href={`/teeth/${encodeURIComponent(c._id)}`}
                                    className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                                  >
                                    <FaTeeth className="h-4 w-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(c)}
                                    disabled={
                                      rowBusy || Boolean(editingId) || Boolean(pendingDeleteId)
                                    }
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    <FaEdit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDelete(c._id)}
                                    disabled={rowBusy || Boolean(editingId)}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                                  >
                                    <MdDelete className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-4 text-xs text-slate-500">
                  {editingId
                    ? 'กำลังแก้ไข 1 รายการ (บันทึก/ยกเลิกก่อนทำรายการอื่น)'
                    : pendingDeleteId
                      ? 'กำลังยืนยันการลบ 1 รายการ'
                      : ' '}
                </div>
              </section>

              {addModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30 sm:items-center"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="add-child-title"
                  onMouseDown={(e) => {
                    if (e.currentTarget !== e.target) return;
                    setAddModalOpen(false);
                    setError(null);
                    setMessage(null);
                  }}
                >
                  <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-500">Add child</div>
                        <h3
                          id="add-child-title"
                          className="mt-1 text-lg font-extrabold tracking-tight text-slate-900"
                        >
                          เพิ่มข้อมูลเด็ก
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          กรอกชื่อและวันเกิด (เพศไม่บังคับ)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddModalOpen(false);
                          setError(null);
                          setMessage(null);
                        }}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        ปิด
                      </button>
                    </div>

                    <form onSubmit={onAdd} className="mt-5 grid gap-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
                        <input
                          value={fullname}
                          onChange={(e) => setFullname(e.target.value)}
                          placeholder="เช่น น้องบลูม"
                          className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">วันเกิด</label>
                          <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            เพศ (ไม่บังคับ)
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as '' | 'MALE' | 'FEMALE')}
                            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                          >
                            <option value="">ไม่ระบุ</option>
                            <option value="MALE">ชาย</option>
                            <option value="FEMALE">หญิง</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFullname('');
                            setBirthday('');
                            setGender('');
                            setError(null);
                            setMessage(null);
                          }}
                          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          ล้างค่า
                        </button>
                        <button
                          type="submit"
                          disabled={adding || loadingChildren || !canAdd}
                          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {adding ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                      </div>

                      <div className="pt-2 text-xs text-slate-500">
                        เคล็ดลับ: เพิ่มเด็กแล้วกดไอคอน “ฟัน” ในแถวรายการเด็ก เพื่อบันทึกเหตุการณ์การขึ้นฟัน
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <MobileAppBar session={session} />
      </div>
    </>
  );
};
export default DashboardPage
