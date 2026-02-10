'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/teeth', label: 'Teeth' },
  { href: '/profile', label: 'Profile' },
];

const Navbar = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out: ', error);
    }finally {
      setLoading(false);
    }
  }
  return (
    <>
      <header className="sticky top-0 z-50">
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

              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/home/logo.svg"
                  alt="Smilebloom"
                  width={120}
                  height={44}
                  className="h-9 w-auto"
                  priority
                />
              </Link>

              <nav className="hidden items-center gap-1 text-sm lg:flex">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
                    {loading ? 'กำลังออกจากระบบ...' : 'Logout'}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {mobileOpen && (
              <div className="pb-4 lg:hidden">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <div className="grid gap-1 text-sm">
                    {NAV_LINKS.map((item) => (
                      <Link
                        key={item.href}
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
                        {loading ? 'กำลังออกจากระบบ...' : 'Logout'}
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