'use client';

import { useMemo, useState } from 'react';

function formatDateInputValue(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;

  } catch {
    return ''
  }
}

const Child = ({ childrenList, selectedChildId, onSelect, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [fullname, setFullname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedChild = useMemo(() => {
    return (childrenList || []).find((c) => c._id === selectedChildId) || null;
  }, [childrenList, selectedChildId]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || 'เพิ่มข้อมูลเด็กไม่สำเร็จ');
        return;
      }
      setMessage('เพิ่มข้อมูลเด็กสำเร็จ');
      setFullname('');
      setBirthday('');
      setGender('');
      setOpen(false);
      onCreated?.(data.child);
      onSelect?.(data.child?._id);
    } catch {
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">Child</div>
          <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
            {selectedChild ? selectedChild.fullname : 'เลือกเด็ก'}
          </div>
          {selectedChild?.birthday && (
            <div className="mt-1 text-xs text-slate-500">
              วันเกิด: {formatDateInputValue(selectedChild.birthday)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            value={selectedChildId || ''}
            onChange={(e) => onSelect?.(e.target.value)}
          >
            <option value="" disabled>
              เลือกเด็ก…
            </option>
            {(childrenList || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullname}
              </option>
            ))}
          </select>

          {/* <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + เพิ่มเด็ก
          </button> */}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="เช่น น้องบลูม"
              className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-slate-700">วันเกิด</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-slate-700">เพศ (ไม่บังคับ)</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">ไม่ระบุ</option>
              <option value="MALE">ชาย</option>
              <option value="FEMALE">หญิง</option>
            </select>
          </div>

          {message && (
            <div
              className={[
                'sm:col-span-3 rounded-2xl px-4 py-3 text-sm ring-1',
                message.includes('สำเร็จ')
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                  : 'bg-rose-50 text-rose-800 ring-rose-100',
              ].join(' ')}
              role="status"
            >
              {message}
            </div>
          )}

          <div className="sm:col-span-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
export default Child