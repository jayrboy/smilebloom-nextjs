/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo } from 'react';

type TeethArch = 'UPPER' | 'LOWER';
type TeethSide = 'LEFT' | 'RIGHT';
type TeethEventType = 'ERUPTED' | 'SHED' | 'EXTRACTED' | 'NOTE';

export type TeethToothBox = {
  /** percent 0..100 (relative to image container) */
  x: number;
  /** percent 0..100 (relative to image container) */
  y: number;
  /** percent 0..100 (relative to image container) */
  w: number;
  /** percent 0..100 (relative to image container) */
  h: number;
};

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

function mirrorBoxX(box: TeethToothBox): TeethToothBox {
  // mirror horizontally inside a 0..100% coordinate space
  return { ...box, x: 100 - box.x - box.w };
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

function deciduousSolidClassesByCode(code: string) {
  // Match the color key in the reference infographic (by FDI last digit 1..5)
  const last = (code || '').slice(-1);
  switch (last) {
    case '1': // central incisor
      return { bg: 'bg-rose-500', ring: 'ring-rose-700' };
    case '2': // lateral incisor
      return { bg: 'bg-orange-500', ring: 'ring-orange-700' };
    case '3': // canine
      return { bg: 'bg-emerald-500', ring: 'ring-emerald-700' };
    case '4': // first molar
      return { bg: 'bg-indigo-600', ring: 'ring-indigo-800' };
    case '5': // second molar
      return { bg: 'bg-violet-600', ring: 'ring-violet-800' };
    default:
      return { bg: 'bg-slate-400', ring: 'ring-slate-600' };
  }
}

function toothFrameClass(code: string, hasEvent: boolean) {
  if (!hasEvent) return 'bg-transparent ring-1 ring-slate-200/60';
  const c = deciduousSolidClassesByCode(code);
  // "สีทึบ" + still keep a subtle edge
  return [c.bg, 'ring-2', c.ring].join(' ');
}

/**
 * Default boxes are only a starting point.
 * You can freely tweak x/y/w/h per toothCode to match your image.
 */
export const DEFAULT_DECIDUOUS_TOOTH_BOXES: Record<string, TeethToothBox> = {
  // UPPER_RIGHT: 51..55 (center -> outer)
  '51': { x: 53.5, y: 2, w: 9, h: 5 },
  '52': { x: 66, y: 6, w: 8, h: 5 },
  '53': { x: 72.5, y: 13, w: 9, h: 5 },
  '54': { x: 82, y: 23, w: 8, h: 7 },
  '55': { x: 87, y: 37, w: 9, h: 9 },

  // UPPER_LEFT: 61..65 (center -> outer)
  '61': { x: 39, y: 2, w: 9, h: 5 },
  '62': { x: 28, y: 6, w: 7, h: 5 },
  '63': { x: 21, y: 13, w: 7, h: 5 },
  '64': { x: 12, y: 23, w: 8, h: 7 },
  '65': { x: 6, y: 37, w: 9, h: 9 },

  // LOWER_RIGHT: 81..85 (center -> outer)
  '81': { x: 53, y: 93, w: 7, h: 5 },
  '82': { x: 63.5, y: 90.5, w: 7, h: 5 },
  '83': { x: 72, y: 84, w: 7, h: 5 },
  '84': { x: 81, y: 74, w: 8, h: 7 },
  '85': { x: 87, y: 57, w: 9, h: 10 },

  // LOWER_LEFT: 71..75 (center -> outer)
  '71': { x: 40.5, y: 93, w: 7, h: 5 },
  '72': { x: 29.5, y: 90.5, w: 7, h: 5 },
  '73': { x: 21, y: 84, w: 7, h: 5 },
  '74': { x: 11, y: 74, w: 8, h: 7 },
  '75': { x: 5, y: 57, w: 9, h: 10 },
};

export function TeethQuadrantProgress({
  imageUrl,
  teethList,
  events,
  mirrorLeftRight = false,
  title = 'ภาพรวมซีกที่มีการบันทึกแล้ว',
  toothBoxes = DEFAULT_DECIDUOUS_TOOTH_BOXES,
}: {
  imageUrl: string;
  teethList: TeethQuadrantProgressTooth[];
  events: TeethQuadrantProgressEvent[];
  mirrorLeftRight?: boolean;
  title?: string;
  /** Map toothCode -> {x,y,w,h} in percentages */
  toothBoxes?: Record<string, TeethToothBox>;
}) {
  const deciduousToothCodesByQuadrant = useMemo(() => {
    // Decide "20 teeth" by FDI deciduous codes: 5x/6x/7x/8x and 1..5
    const isDeciduousCode = (code: string) => /^[5-8][1-5]$/.test(code);

    const byQ: Record<QuadrantKey, string[]> = {
      UPPER_LEFT: [],
      UPPER_RIGHT: [],
      LOWER_LEFT: [],
      LOWER_RIGHT: [],
    };

    for (const t of teethList || []) {
      if (!t?.code) continue;
      if (!isDeciduousCode(t.code)) continue;

      const side = mirrorLeftRight ? mirrorSide(t.side) : t.side;
      const q = quadrantFromArchSide(t.arch, side);
      byQ[q].push(t.code);
    }

    const sortAsc = (a: string, b: string) => a.localeCompare(b);
    const sortDesc = (a: string, b: string) => b.localeCompare(a);

    // Arrange so "center teeth" are near midline:
    // - Left quadrants: outer→center (descending: 5→1)
    // - Right quadrants: center→outer (ascending: 1→5)
    byQ.UPPER_LEFT.sort(sortDesc);
    byQ.LOWER_LEFT.sort(sortDesc);
    byQ.UPPER_RIGHT.sort(sortAsc);
    byQ.LOWER_RIGHT.sort(sortAsc);

    return byQ;
  }, [teethList, mirrorLeftRight]);

  const latestTypeByToothCode = useMemo(() => {
    // events are returned sorted DESC by eventDate/createdAt, so first seen per tooth = latest.
    const picked = new Map<string, TeethEventType>();
    for (const ev of events || []) {
      const code = ev?.toothCode?.trim();
      if (!code) continue;
      if (!ev?.type || ev.type === 'NOTE') continue;
      if (picked.has(code)) continue;
      picked.set(code, ev.type);
    }
    return picked;
  }, [events]);

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

        {/* Tooth frames (20 teeth) - positionable via x/y/w/h */}
        <div className="pointer-events-none absolute inset-0">
          {(
            [
              ...deciduousToothCodesByQuadrant.UPPER_LEFT,
              ...deciduousToothCodesByQuadrant.UPPER_RIGHT,
              ...deciduousToothCodesByQuadrant.LOWER_LEFT,
              ...deciduousToothCodesByQuadrant.LOWER_RIGHT,
            ] as const
          ).map((code) => {
            const hasEvent = latestTypeByToothCode.has(code);
            const frame = toothFrameClass(code, hasEvent);
            const rawBox = toothBoxes?.[code];
            if (!rawBox) return null;
            const box = mirrorLeftRight ? mirrorBoxX(rawBox) : rawBox;

            return (
              <div
                key={code}
                className={['absolute rounded-xl bg-transparent', frame].join(' ')}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
              >
                <div className="absolute left-1 top-1">
                  <span
                    className={[
                      'rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight',
                      hasEvent ? 'text-white/95' : 'text-slate-600',
                      hasEvent ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]' : '',
                      hasEvent ? '' : 'bg-white/70 ring-1 ring-slate-200 backdrop-blur',
                    ].join(' ')}
                  >
                    {code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

