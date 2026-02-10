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
    </div>
    </>
  )
}
export default DashboardPage