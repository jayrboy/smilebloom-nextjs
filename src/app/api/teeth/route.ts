import { NextResponse } from 'next/server';

import { TEETH_CATALOG } from '@/src/lib/teethCatalog';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const list =
    type === 'DECIDUOUS' || type === 'PERMANENT'
      ? TEETH_CATALOG.filter((t) => t.type === type)
      : TEETH_CATALOG;

  const teeth = [...list].sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
  return NextResponse.json({ teeth });
}

