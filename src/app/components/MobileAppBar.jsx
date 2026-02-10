'use client';

import Link from 'next/link';

const MobileAppBar = ({ session }) => {
  const isAuthed = Boolean(session?.user?.username);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-3 px-4 py-2 text-xs font-semibold text-slate-700">
        <Link
          href="/dashboard"
          className="rounded-xl px-3 py-2 text-center hover:bg-slate-100"
        >
          Dashboard
        </Link>
        <Link href="/teeth" className="rounded-xl px-3 py-2 text-center hover:bg-slate-100">
          Teeth
        </Link>
        <Link
          href={isAuthed ? '/profile' : '/auth/login'}
          className="rounded-xl px-3 py-2 text-center hover:bg-slate-100"
        >
          {isAuthed ? 'Profile' : 'Login'}
        </Link>
      </div>
    </nav>
  );
}
export default MobileAppBar