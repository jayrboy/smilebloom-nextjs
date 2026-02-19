'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdDashboard } from "react-icons/md";
import { GoPersonFill } from "react-icons/go";
import { FaTeeth } from "react-icons/fa";

const MobileAppBar = ({ session }) => {
  const isAuthed = Boolean(session?.user?.username);
  const [teethHref, setTeethHref] = useState('/dashboard');

  useEffect(() => {
    try {
      const lastChildId = localStorage.getItem('smilebloom:lastChildId');
      if (lastChildId) setTeethHref(`/teeth/${encodeURIComponent(lastChildId)}`);
    } catch {
      // ignore
    }
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 text-xs font-semibold text-slate-700">
        <Link
          href="/dashboard"
          className="flex flex-1 flex-col items-center justify-center rounded-xl py-2 px-0 text-center hover:bg-slate-100 transition-colors"
          tabIndex={0}
        >
          <MdDashboard size={30} />
        </Link>
        <Link
          href={teethHref}
          className="flex flex-1 flex-col items-center justify-center rounded-xl py-2 px-0 text-center hover:bg-slate-100 transition-colors"
          tabIndex={0}
        >
          <FaTeeth size={30} />
        </Link>
        <Link
          href={isAuthed ? '/profile' : '/auth/login'}
          className="flex flex-1 flex-col items-center justify-center rounded-xl py-2 px-0 text-center hover:bg-slate-100 transition-colors"
          tabIndex={0}
        >
          <GoPersonFill size={30} />
        </Link>
      </div>
    </nav>
  );
}
export default MobileAppBar