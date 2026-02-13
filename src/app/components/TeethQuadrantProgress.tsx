/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo } from 'react';

type TeethArch = 'UPPER' | 'LOWER';
type TeethSide = 'LEFT' | 'RIGHT';
type TeethEventType = 'ERUPTED' | 'SHED' | 'EXTRACTED' | 'NOTE';

export type TeethQuadrantProgressTooth = {
  code: string;
  arch: TeethArch;
  side: TeethSide;
};

export type TeethQuadrantProgressEvent = {
  type: TeethEventType;
  toothCode?: string;
  eventDate?: string;
  createdAt?: string;
};

type QuadrantKey = 'UPPER_RIGHT' | 'UPPER_LEFT' | 'LOWER_RIGHT' | 'LOWER_LEFT';

function quadrantFromArchSide(arch: TeethArch, side: TeethSide): QuadrantKey {
  return `${arch}_${side}` as QuadrantKey;
}

function mirrorSide(side: TeethSide): TeethSide {
  return side === 'LEFT' ? 'RIGHT' : 'LEFT';
}

function quadrantLabelTh(q: QuadrantKey) {
  switch (q) {
    case 'UPPER_RIGHT':
      return 'บน-ขวา';
    case 'UPPER_LEFT':
      return 'บน-ซ้าย';
    case 'LOWER_RIGHT':
      return 'ล่าง-ขวา';
    case 'LOWER_LEFT':
      return 'ล่าง-ซ้าย';
  }
}

function typeStyle(type?: TeethEventType) {
  if (type === 'ERUPTED') {
    return { overlay: 'bg-emerald-500/20 ring-1 ring-emerald-400/30', pill: 'bg-emerald-50 text-emerald-800 ring-emerald-100' };
  }
  if (type === 'SHED') {
    return { overlay: 'bg-indigo-500/20 ring-1 ring-indigo-400/30', pill: 'bg-indigo-50 text-indigo-800 ring-indigo-100' };
  }
  if (type === 'EXTRACTED') {
    return { overlay: 'bg-rose-500/20 ring-1 ring-rose-400/30', pill: 'bg-rose-50 text-rose-800 ring-rose-100' };
  }
  return { overlay: 'bg-transparent ring-1 ring-slate-200/60', pill: 'bg-slate-50 text-slate-700 ring-slate-200' };
}

export function TeethQuadrantProgress({
  imageUrl,
  teethList,
  events,
  mirrorLeftRight = false,
  title = 'ภาพรวมซีกที่มีการบันทึกแล้ว',
}: {
  imageUrl: string;
  teethList: TeethQuadrantProgressTooth[];
  events: TeethQuadrantProgressEvent[];
  mirrorLeftRight?: boolean;
  title?: string;
}) {
  const latestTypeByQuadrant = useMemo(() => {
    const toothMetaByCode = new Map<string, { arch: TeethArch; side: TeethSide }>();
    for (const t of teethList || []) {
      if (!t?.code) continue;
      toothMetaByCode.set(t.code, { arch: t.arch, side: t.side });
    }

    const picked = new Map<QuadrantKey, TeethEventType>();
    for (const ev of events || []) {
      if (!ev?.toothCode) continue;
      if (!ev?.type || ev.type === 'NOTE') continue;
      const meta = toothMetaByCode.get(ev.toothCode);
      if (!meta) continue;

      const side = mirrorLeftRight ? mirrorSide(meta.side) : meta.side;
      const q = quadrantFromArchSide(meta.arch, side);
      if (picked.has(q)) continue;
      picked.set(q, ev.type);

      if (picked.size === 4) break;
    }

    return {
      UPPER_RIGHT: picked.get('UPPER_RIGHT'),
      UPPER_LEFT: picked.get('UPPER_LEFT'),
      LOWER_RIGHT: picked.get('LOWER_RIGHT'),
      LOWER_LEFT: picked.get('LOWER_LEFT'),
    } as Record<QuadrantKey, TeethEventType | undefined>;
  }, [events, teethList, mirrorLeftRight]);

  const showMirrorHint = mirrorLeftRight;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-500">Saved overview</div>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            สีแสดง “สถานะล่าสุด” ของเหตุการณ์ในแต่ละซีก (ขึ้นแล้ว/หลุดแล้ว/ถอนแล้ว)
            {showMirrorHint ? ' • โหมดสลับซ้าย-ขวาเปิดอยู่' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'ERUPTED' as const, label: 'ขึ้นแล้ว', dot: 'bg-emerald-600', pill: typeStyle('ERUPTED').pill },
              { key: 'SHED' as const, label: 'หลุดแล้ว', dot: 'bg-indigo-600', pill: typeStyle('SHED').pill },
              { key: 'EXTRACTED' as const, label: 'ถอนแล้ว', dot: 'bg-rose-600', pill: typeStyle('EXTRACTED').pill },
            ] as const
          ).map((it) => (
            <span
              key={it.key}
              className={['inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1', it.pill].join(
                ' '
              )}
            >
              <span className={['h-2.5 w-2.5 rounded-sm', it.dot].join(' ')} />
              <span className="whitespace-nowrap">{it.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200">
        <img
          src={imageUrl}
          alt="teeth quadrant overview"
          className="block h-auto w-full select-none object-contain filter grayscale"
        />
      </div>
    </div>
  );
}

