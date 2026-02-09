'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/src/app/components/Navbar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  console.log({ status, session });

  if (!session && status === 'unauthenticated') {
    redirect('/auth/login');
  }

  return (
    <>
    <Navbar session={session} />
    <div className="p-6">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="mt-2 text-sm text-slate-600">Session status: {status}</div>
      {session ? (
        <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-50">
          {JSON.stringify(session, null, 2)}
        </pre>
      ) : (
        <div className="mt-4 text-center text-slate-600">
          <Link href="/">Home Page</Link>
        </div>
      )}
    </div>
    </>
  )
}
export default DashboardPage