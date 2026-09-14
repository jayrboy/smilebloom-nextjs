'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaPalette, FaSave } from 'react-icons/fa';
import { LuRefreshCcw } from 'react-icons/lu';

import Navbar from '@/src/app/components/Navbar';
import MobileAppBar from '@/src/app/components/MobileAppBar';
import {
  DEFAULT_SMILE_CONFIG,
  normalizeSmileConfig,
  type SmileConfig,
} from '@/src/lib/smileConfig';

const HOME_COLOR_FIELDS: Array<{ key: keyof SmileConfig; label: string }> = [
  { key: 'pageBackground', label: 'สีพื้นหลังหน้าแรก' },
  { key: 'featureBoxColor', label: 'สีกล่องฟีเจอร์' },
  { key: 'heroOverlayFrom', label: 'สี hero เริ่มต้น' },
  { key: 'heroOverlayVia', label: 'สี hero กลาง' },
  { key: 'heroOverlayTo', label: 'สี hero สิ้นสุด' },
];

const MENU_COLOR_FIELDS: Array<{ key: keyof SmileConfig; label: string }> = [
  { key: 'menuBackgroundColor', label: 'สีพื้นหลังเมนูด้านใน' },
  { key: 'menuTextColor', label: 'สีตัวอักษรเมนูด้านใน' },
];

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState<SmileConfig>(DEFAULT_SMILE_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'ADMIN';

  const featuresText = useMemo(() => form.features.join('\n'), [form.features]);
  const heroPreviewLines = useMemo(
    () => form.heroSubtitle.split('\n').filter(Boolean),
    [form.heroSubtitle]
  );
  const introPreviewLines = useMemo(
    () => form.introTitle.split('\n').filter(Boolean),
    [form.introTitle]
  );

  const setField = (key: keyof SmileConfig, value: string) => {
    setForm((current) => normalizeSmileConfig({ ...current, [key]: value }));
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/smile-config', { cache: 'no-store' });
      const data = (await res.json()) as { config?: Partial<SmileConfig>; error?: string };
      if (!res.ok) throw new Error(data?.error || 'โหลด config ไม่สำเร็จ');
      setForm(normalizeSmileConfig(data.config));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/smile-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { config?: Partial<SmileConfig>; error?: string };
      if (!res.ok) throw new Error(data?.error || 'บันทึก config ไม่สำเร็จ');
      setForm(normalizeSmileConfig(data.config));
      setMessage('บันทึกการตั้งค่าสำเร็จ');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) void load();
  }, [status, isAdmin]);

  return (
    <>
      <Navbar session={session} />
      <div className="min-h-screen" style={{ backgroundColor: '#448575' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/80">Admin</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ตั้งค่าหน้าแรก
              </h1>
              <p className="mt-2 text-sm text-white">
                ปรับหัวข้อ ไอคอน/รูปภาพ และสีที่ใช้ในหน้าแรกของ Smilebloom
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={load}
                disabled={loading || saving}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LuRefreshCcw className="h-4 w-4" />
                รีเฟรช
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
                กรุณาเข้าสู่ระบบก่อนใช้งานเมนู admin
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/auth/login" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  ไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          )}

          {status === 'authenticated' && !isAdmin && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                เฉพาะผู้ดูแลระบบเท่านั้น
              </div>
              <p className="mt-2 text-sm text-slate-600">
                บัญชีนี้ไม่มีสิทธิ์แก้ไข config ของระบบ
              </p>
            </div>
          )}

          {status === 'authenticated' && isAdmin && (
            <form onSubmit={save} className="mt-6 grid gap-6">
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
                <div className="text-sm font-semibold text-slate-500">Home content</div>
                <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                  ข้อความและรูปภาพ
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <TextField label="หัวข้อหลัก" value={form.heroTitle} onChange={(v) => setField('heroTitle', v)} />
                  <TextArea label="คำอธิบายใต้หัวข้อหลัก" value={form.heroSubtitle} onChange={(v) => setForm((current) => ({ ...current, heroSubtitle: v }))} className="sm:col-span-2" />
                  <TextArea label="หัวข้อส่วนแนะนำ" value={form.introTitle} onChange={(v) => setForm((current) => ({ ...current, introTitle: v }))} className="sm:col-span-2" />
                  <TextField label="หัวข้อฟีเจอร์" value={form.featureTitle} onChange={(v) => setField('featureTitle', v)} className="sm:col-span-2" />
                  <TextArea
                    label="รายการฟีเจอร์ (บรรทัดละ 1 รายการ)"
                    value={featuresText}
                    onChange={(v) =>
                      setForm((current) => ({
                        ...current,
                        features: v.split('\n'),
                      }))
                    }
                    className="sm:col-span-2"
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <FaPalette className="h-4 w-4 text-emerald-800" />
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Colors</div>
                    <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      สีของหน้าแรก
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      แนะนำให้ copy รหัสสีแบบเต็ม เช่น #8DD7BF มาวาง หรือเลือกจากช่องสีด้านซ้าย
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {HOME_COLOR_FIELDS.map((field) => (
                    <label key={field.key} className="grid gap-2 text-sm font-semibold text-slate-700">
                      {field.label}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(form[field.key])}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1"
                        />
                        <input
                          value={String(form[field.key])}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <FaPalette className="h-4 w-4 text-emerald-800" />
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Menu colors</div>
                    <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      สีเมนูด้านใน
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      แยกจากสีหน้าแรก ใช้กับแถบเมนูหลัง login
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {MENU_COLOR_FIELDS.map((field) => (
                    <label key={field.key} className="grid gap-2 text-sm font-semibold text-slate-700">
                      {field.label}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(form[field.key])}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1"
                        />
                        <input
                          value={String(form[field.key])}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="text-sm font-semibold text-slate-500">Preview</div>
                <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                  ตัวอย่างหน้าแรก
                </div>

                <div
                  className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-200"
                  style={{ backgroundColor: form.menuBackgroundColor }}
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div
                      className="text-base font-extrabold tracking-tight"
                      style={{ color: form.menuTextColor }}
                    >
                      Smilebloom
                    </div>
                    <div className="hidden items-center gap-1 text-xs font-semibold sm:flex">
                      {['หน้าหลัก', 'ฟันที่ต้องรักษา', 'ข้อมูลส่วนตัว', 'ตั้งค่า'].map((item) => (
                        <span
                          key={item}
                          className="rounded-xl px-3 py-2"
                          style={{ color: form.menuTextColor }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/90" />
                  </div>
                </div>

                <div
                  className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-200"
                  style={{ backgroundColor: form.pageBackground }}
                >
                  <div
                    className="px-5 py-8 text-center text-white"
                    style={{
                      background: `linear-gradient(135deg, ${form.heroOverlayFrom}, ${form.heroOverlayVia}, ${form.heroOverlayTo})`,
                    }}
                  >
                    <div className="text-2xl font-extrabold tracking-tight">
                      {form.heroTitle}
                    </div>
                    <div className="mx-auto mt-3 max-w-lg text-sm leading-6">
                      {heroPreviewLines.map((line, idx) => (
                        <span key={`${line}-${idx}`}>
                          {line}
                          {idx < heroPreviewLines.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2 md:items-center">
                    <div>
                      <div className="text-center text-lg font-extrabold leading-8 text-white">
                        {introPreviewLines.map((line, idx) => (
                          <span key={`${line}-${idx}`}>
                            {line}
                            {idx < introPreviewLines.length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      <div
                        className="mt-4 rounded-2xl p-4 text-white"
                        style={{ backgroundColor: form.featureBoxColor }}
                      >
                        <div className="text-sm font-semibold">{form.featureTitle}</div>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {form.features.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mx-auto w-full max-w-[260px]">
                      <Image
                        src={form.imageSrc}
                        alt={form.imageAlt}
                        width={520}
                        height={420}
                        className="h-auto max-h-[210px] w-full object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave className="h-4 w-4" />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
              </div>
            </form>
          )}
        </div>
        <MobileAppBar session={session} />
      </div>
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-y rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
      />
    </label>
  );
}
