'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type NavItem = { label: string; href: `#${string}` };
type ServiceItem = { name: string; desc: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'หน้าแรก', href: '#home' },
  { label: 'บริการ', href: '#services' },
  { label: 'เวลาทำการ', href: '#hours' },
  { label: 'ติดต่อ', href: '#contact' },
  { label: 'เกี่ยวกับเรา', href: '#about' },
];

const SERVICES: ServiceItem[] = [
  { name: 'ตรวจสุขภาพช่องปาก', desc: 'ประเมินสภาพฟันและเหงือก พร้อมคำแนะนำเฉพาะบุคคล' },
  { name: 'ขูดหินปูน', desc: 'ทำความสะอาดคราบหินปูน ลดกลิ่นปากและเหงือกอักเสบ' },
  { name: 'อุดฟัน', desc: 'ซ่อมแซมฟันผุให้กลับมาใช้งานได้ดีและสวยงาม' },
  { name: 'ถอนฟัน', desc: 'หัตถการปลอดภัย พร้อมดูแลหลังทำอย่างใกล้ชิด' },
  { name: 'จัดฟัน', desc: 'ปรับรอยยิ้มให้มั่นใจ ด้วยแผนการรักษาที่เหมาะสม' },
  { name: 'ฟอกสีฟัน', desc: 'เพิ่มความขาวใสอย่างเป็นธรรมชาติและปลอดภัย' },
  { name: 'ครอบฟัน/วีเนียร์', desc: 'งานบูรณะเพื่อความสวยงามและความแข็งแรงของฟัน' },
  { name: 'รากฟันเทียม', desc: 'ทดแทนฟันที่หายไป ให้เคี้ยวได้ใกล้เคียงฟันธรรมชาติ' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ImageCard({
  src,
  alt,
  aspect = 'aspect-[4/3]',
}: {
  src: string;
  alt: string;
  aspect?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-black/5',
        aspect,
      ].join(' ')}
    >
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
          รูปภาพยังไม่พร้อมใช้งาน
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICES;
    return SERVICES.filter((s) => `${s.name} ${s.desc}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50">
        <div className="bg-slate-950/40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between py-2 text-xs text-white/90">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">โทร. 0-2430-6533</span>
                <span className="hidden sm:inline">จ.-ศ. 09:00–19:00</span>
                <a
                  href="#contact"
                  className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/15"
                >
                  นัดหมายของฉัน
                </a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-white/90 ring-1 ring-white/20 hover:bg-white/10"
                  aria-label="ภาษาไทย"
                >
                  TH
                </button>
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-white/70 ring-1 ring-white/15 hover:bg-white/10"
                  aria-label="English"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between gap-3 py-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="เปิดเมนู"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="h-0.5 w-5 bg-slate-700" />
                <span className="h-0.5 w-5 bg-slate-700" />
                <span className="h-0.5 w-5 bg-slate-700" />
              </button>

              <a href="#home" className="flex items-center gap-2">
                <Image
                  src="/home/logo.svg"
                  alt="Smilebloom"
                  width={120}
                  height={44}
                  className="h-9 w-auto"
                  priority
                />
              </a>

              <nav className="hidden items-center gap-6 text-sm text-slate-700 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="hover:text-slate-900"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="flex flex-1 items-center justify-end gap-2">
                <form
                  className="hidden max-w-[360px] flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 md:flex"
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollToId('services');
                  }}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    aria-label="ค้นหาบริการ"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    GO
                  </button>
                </form>

                <Link
                  href="/auth/sign-in"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  ลงชื่อเข้าใช้
                </Link>
              </div>
            </div>

            {mobileOpen && (
              <div className="pb-4 lg:hidden">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <form
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      scrollToId('services');
                    }}
                  >
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="SEARCH"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      aria-label="ค้นหาบริการ"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      GO
                    </button>
                  </form>

                  <div className="mt-3 grid gap-2 text-sm">
                    {NAV_ITEMS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-800"
        >
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.35),transparent_40%)]" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center text-white">
              <div className="mx-auto mb-6 flex w-fit items-center justify-center rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                <Image
                  src="/home/logo.svg"
                  alt="Smilebloom"
                  width={160}
                  height={60}
                  className="h-10 w-auto"
                />
              </div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
                คลินิกบริการทันตกรรมพิเศษ
              </h1>
              <p className="mt-4 text-pretty text-sm text-white/90 sm:text-base">
                คลินิกทันตแพทยศาสตร์
                <br className="hidden sm:block" />
                จุฬาลงกรณ์มหาวิทยาลัย
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white/95 sm:w-auto"
                  onClick={() => scrollToId('contact')}
                >
                  นัดหมายทันที
                </button>
                <button
                  type="button"
                  className="w-full rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/15 sm:w-auto"
                  onClick={() => scrollToId('services')}
                >
                  ดูบริการทั้งหมด
                </button>
              </div>
            </div>
          </div>

          <div className="h-2 w-full bg-white/15" />
          <div className="h-2 w-full bg-white/10" />
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                ยิ้มสวย สุขภาพดี เริ่มได้ที่นี่
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                ให้บริการทันตกรรมโดยทีมทันตแพทย์และบุคลากรผู้เชี่ยวชาญ
                ดูแลอย่างใส่ใจ ตั้งแต่การตรวจประเมิน ไปจนถึงการรักษาและติดตามผล
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">เปิดบริการด้วย</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    เครื่องมือและระบบการดูแลมาตรฐาน
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    แผนการรักษาที่เหมาะสมกับแต่ละบุคคล
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    ติดตามผลหลังทำ เพื่อความมั่นใจ
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageCard src="/home/intro-1.svg" alt="บรรยากาศคลินิก" />
                <ImageCard src="/home/intro-2.svg" alt="ทีมแพทย์และการให้บริการ" />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 pb-10 sm:pb-12">
          <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 sm:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  เกี่ยวกับเรา
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  คลินิกบริการทันตกรรมพิเศษ มุ่งเน้นมาตรฐานความปลอดภัย
                  ความใส่ใจ และประสบการณ์ที่สบายใจสำหรับผู้รับบริการ
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => scrollToId('contact')}
                >
                  นัดหมาย/สอบถาม
                </button>
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                  onClick={() => scrollToId('services')}
                >
                  ดูบริการ
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: 'ทีมทันตแพทย์', desc: 'ดูแลโดยบุคลากรผู้เชี่ยวชาญ และให้คำแนะนำแบบเข้าใจง่าย' },
                { title: 'มาตรฐานความปลอดภัย', desc: 'ให้ความสำคัญกับความสะอาดและกระบวนการที่ปลอดภัย' },
                { title: 'ประสบการณ์ที่ดี', desc: 'เน้นความสบายใจ ตั้งแต่การนัดหมายจนถึงการติดตามผล' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="text-sm font-bold text-slate-900">{card.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-6">
          <div className="grid place-items-center py-8">
            <div className="text-[84px] font-black leading-none text-indigo-950 sm:text-[110px]">
              ฟ
            </div>
            <div className="mt-2 h-4 w-[260px] rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 shadow-inner sm:w-[340px]" />
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                บริการของเรา
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                พิมพ์คำค้นด้านบนเพื่อกรองรายการบริการ
              </p>
            </div>
            <div className="text-sm text-slate-500">
              พบ {filteredServices.length} รายการ
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    NEW
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{s.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    onClick={() => scrollToId('contact')}
                  >
                    ขอคิว/นัดหมาย
                  </button>
                  <Link
                    href="#about"
                    className="rounded-full px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    รายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="hours" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            วัน-เวลาที่เปิดบริการ
          </h2>

          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <div className="col-span-5">วัน</div>
              <div className="col-span-7 text-right">เวลา</div>
            </div>

            {[
              { day: 'จันทร์–ศุกร์', time: '09:00 – 19:00', highlight: false },
              { day: 'เสาร์', time: '09:00 – 16:00', highlight: false },
              { day: 'อาทิตย์', time: 'ปิดทำการ', highlight: true },
            ].map((row, idx) => (
              <div
                key={row.day}
                className={[
                  'grid grid-cols-12 px-4 py-4 text-sm',
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                  row.highlight ? 'bg-rose-50' : '',
                ].join(' ')}
              >
                <div className="col-span-5 font-semibold text-slate-900">{row.day}</div>
                <div className="col-span-7 text-right text-slate-700">{row.time}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                ติดต่อคลินิก
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                สอบถามรายละเอียด หรือขอนัดหมายได้ที่ช่องทางด้านล่าง
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">โทร</div>
                  <div className="mt-1 text-base font-bold text-slate-900">0-2430-6533</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">ที่อยู่</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    กรุงเทพฯ (ตัวอย่าง)
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    ปรับข้อความนี้ให้ตรงกับคลินิกของคุณได้
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.open('tel:024306533')}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  โทรตอนนี้
                </button>
                <Link
                  href="#about"
                  className="rounded-full px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  ดูข้อมูลเพิ่มเติม
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">สแกนเพื่อเพิ่มเพื่อน</div>
                <div className="mt-4 mx-auto w-full max-w-[260px]">
                  <ImageCard src="/home/qr.svg" alt="QR ติดต่อ" aspect="aspect-square" />
                </div>
                <div className="mt-4 text-center text-xs text-slate-600">
                  เปลี่ยนไฟล์เป็น `public/home/qr.png` ได้ภายหลัง
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-indigo-950 text-white" >
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-lg font-extrabold">คลินิกทันตกรรม</div>
              <div className="mt-2 text-sm text-white/80">
                คณะทันตแพทยศาสตร์<br />
                จุฬาลงกรณ์มหาวิทยาลัย (ตัวอย่าง)
              </div>
            </div>
            <div className="text-sm">
              <div className="font-semibold">ติดต่อ</div>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>โทร: 0-2430-6533</li>
                <li>อีเมล: contact@example.com</li>
                <li>เวลาทำการ: จ.-ศ. 09:00–19:00</li>
              </ul>
            </div>
            <div className="text-sm">
              <div className="font-semibold">เมนู</div>
              <ul className="mt-3 space-y-2 text-white/80">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm">
              <div className="font-semibold">เข้าสู่ระบบ</div>
              <p className="mt-3 text-white/80">
                สำหรับเจ้าหน้าที่/ผู้ใช้งาน
              </p>
              <div className="mt-4">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-950 hover:bg-white/95"
                >
                  ไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
            © {new Date().getFullYear()} Smilebloom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}