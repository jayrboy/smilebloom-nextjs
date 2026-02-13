import TeethPageClient from './TeethPageClient';

export default function TeethPage({
  searchParams,
}: {
  searchParams?: { childId?: string | string[] };
}) {
  const raw = searchParams?.childId;
  const childId = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  return <TeethPageClient initialChildId={childId} />;
}