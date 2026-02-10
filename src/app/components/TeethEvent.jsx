'use client';

import { useMemo, useState } from 'react';

function formatIsoDateInput(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const TYPE_OPTIONS = [
  { value: 'ERUPTED', label: 'ฟันขึ้น (Erupted)' },
  { value: 'SHED', label: 'ฟันน้ำนมหลุด (Shed)' },
  { value: 'EXTRACTED', label: 'ถอนฟัน (Extracted)' },
  { value: 'NOTE', label: 'โน้ต/อาการ (Note)' },
];

const TeethEvent = ({ childId, teethType, teethList, events, onReload }) => {
  const [type, setType] = useState('ERUPTED');
  const [toothCode, setToothCode] = useState('');
  const [eventDate, setEventDate] = useState(formatIsoDateInput(new Date()));
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const filteredTeeth = useMemo(() => {
    return (teethList || []).filter((t) => t.type === teethType);
  }, [teethList, teethType]);

  const toothByCode = useMemo(() => {
    const map = new Map();
    for (const t of teethList || []) map.set(t.code, t);
    return map;
  }, [teethList]);

  const submit = async (e) => {
    e.preventDefault();
    if (!childId) {
      setMessage('กรุณาเลือกเด็กก่อน');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        childId,
        type,
        toothCode: type === 'NOTE' ? undefined : toothCode || undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        remark: remark || undefined,
      };

      const res = await fetch('/api/teeth-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || 'บันทึกเหตุการณ์ไม่สำเร็จ');
        return;
      }
      setMessage('บันทึกเหตุการณ์สำเร็จ');
      setRemark('');
      setToothCode('');
      await onReload?.();
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
          <div className="text-sm font-semibold text-slate-500">Events</div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
            บันทึกเหตุการณ์การขึ้นฟัน
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            บันทึก “ฟันขึ้น/หลุด/ถอน/โน้ต” เพื่อดูย้อนหลังและสรุปใน Dashboard
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">ประเภทเหตุการณ์</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            ซี่ฟัน {type === 'NOTE' ? '(ไม่บังคับ)' : '(จำเป็น)'}
          </label>
          <select
            value={toothCode}
            onChange={(e) => setToothCode(e.target.value)}
            disabled={type === 'NOTE'}
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60"
          >
            <option value="">เลือกซี่ฟัน…</option>
            {filteredTeeth.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code} — {t.name_th}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">วันที่</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="text-sm font-semibold text-slate-700">หมายเหตุ (ไม่บังคับ)</label>
          <input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="เช่น มีไข้ งอแง เหงือกบวม ฯลฯ"
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {message && (
          <div
            className={[
              'sm:col-span-6 rounded-2xl px-4 py-3 text-sm ring-1',
              message.includes('สำเร็จ')
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                : 'bg-rose-50 text-rose-800 ring-rose-100',
            ].join(' ')}
            role="status"
          >
            {message}
          </div>
        )}

        <div className="sm:col-span-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading || !childId || (type !== 'NOTE' && !toothCode)}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังบันทึก...' : 'เพิ่มเหตุการณ์'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">รายการล่าสุด</div>
          <button
            type="button"
            onClick={() => onReload?.()}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            รีเฟรช
          </button>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            <div className="col-span-3">วันที่</div>
            <div className="col-span-3">ซี่ฟัน</div>
            <div className="col-span-3">ประเภท</div>
            <div className="col-span-3 text-right">หมายเหตุ</div>
          </div>

          {(events || []).length === 0 ? (
            <div className="bg-white px-4 py-5 text-sm text-slate-500">ยังไม่มีเหตุการณ์</div>
          ) : (
            (events || []).map((ev, idx) => {
              const dateText = formatIsoDateInput(ev.eventDate || ev.createdAt || new Date());
              const tooth = ev.toothCode ? toothByCode.get(ev.toothCode) : null;
              return (
                <div
                  key={ev._id || `${idx}`}
                  className={[
                    'grid grid-cols-12 bg-white px-4 py-4 text-sm',
                    idx % 2 === 1 ? 'bg-slate-50/60' : '',
                  ].join(' ')}
                >
                  <div className="col-span-3 font-semibold text-slate-900">{dateText}</div>
                  <div className="col-span-3 text-slate-700">
                    {ev.toothCode ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">{ev.toothCode}</span>
                        <span className="text-xs text-slate-500">{tooth?.name_th || ''}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                  <div className="col-span-3 text-slate-700">{ev.type}</div>
                  <div className="col-span-3 text-right text-slate-600">
                    {ev.remark ? ev.remark : <span className="text-slate-400">-</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
export default TeethEvent