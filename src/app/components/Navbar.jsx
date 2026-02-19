'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GiHamburgerMenu } from "react-icons/gi"
import { TbLogout } from "react-icons/tb";
import Image from 'next/image';

const Navbar = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [teethHref, setTeethHref] = useState('/dashboard');
  const router = useRouter();

  useEffect(() => {
    try {
      const lastChildId = localStorage.getItem('smilebloom:lastChildId');
      if (lastChildId) setTeethHref(`/teeth/${encodeURIComponent(lastChildId)}`);
    } catch {
      // ignore
    }
  }, []);

  const navLinks = useMemo(() => {
    return [
      { href: '/dashboard', label: 'หน้าหลัก' },
      { href: teethHref, label: 'ฟันที่ต้องรักษา' },
      { href: '/profile', label: 'ข้อมูลส่วนตัว' },
    ];
  }, [teethHref]);

  const handleLogout = async () => {
    setLoading(true);

    const confirm = window.confirm('คุณต้องการออกจากระบบหรือไม่?');
    if (!confirm) {
      setLoading(false);
      return;
    }

    try {
      await signOut({ redirect: false });
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }finally {
      setLoading(false);
    }
  }
  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="backdrop-blur" style={{ backgroundColor: '#8DD7BF' }}>
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between gap-3 py-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-2 py-2 text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
                aria-label="เปิดเมนู"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <GiHamburgerMenu size={24} />
              </button>

              <span className="text-xl font-extrabold tracking-tight text-white">
                Smilebloom
              </span>
              <Image src="/home/teeth_icon.png" alt="Smilebloom" width={120} height={44} className="h-9 w-auto" />

              {/* <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/home/logo.svg"
                  alt="Smilebloom"
                  width={120}
                  height={44}
                  className="h-9 w-auto"
                  priority
                />
              </Link> */}

              <nav className="hidden items-center gap-1 text-sm lg:flex">
                {navLinks.map((item) => (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="rounded-xl px-3 py-2 font-semibold text-white hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-1 items-center justify-end gap-2">
                {session?.user?.username ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'กำลังออกจากระบบ...' : <TbLogout size={20} />}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    เข้าสู่ระบบ
                  </Link>
                )}
              </div>
            </div>

            {mobileOpen && (
              <div className="pb-4 lg:hidden">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <div className="grid gap-1 text-sm">
                    {navLinks.map((item) => (
                      <Link
                        key={`${item.label}-${item.href}`}
                        href={item.href}
                        className="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-3">
                    {session?.user?.username ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await handleLogout();
                          setMobileOpen(false);
                        }}
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="block w-full rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
export default Navbar