'use client';

import { useSession } from 'next-auth/react';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  console.log({ status, session });

  return (
    <div className="p-6">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="mt-2 text-sm text-slate-600">Session status: {status}</div>
      <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-50">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}
export default DashboardPage