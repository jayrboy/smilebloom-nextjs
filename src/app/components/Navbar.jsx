'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

const Navbar = ({session}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);

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

              <div className="flex flex-1 items-center justify-end gap-2">
                <form
                  className="hidden max-w-[360px] flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 md:flex"
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollToId('services');
                  }}
                >
                  <input
                    // value={query}
                    // onChange={(e) => setQuery(e.target.value)}
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

                <a
                  onClick={() => handleLogout()}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  {session?.user?.username ? 'Logout' : 'Login'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
export default Navbar