'use client';

/**
 * EmployeeProfile — standalone component
 *
 * Entry point: <ProfileView emp={...} />
 *
 * Wrap the page (or root layout) in <ThemeCtx.Provider> once to enable
 * dark/light theming.  See the bottom of this file for a minimal demo.
 */

import { useState, useEffect, useContext, createContext } from 'react';

/* ══════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════ */
const DARK_T = {
  bg:         '#000000',
  surface:    '#1B1B1B',
  surface2:   '#21222C',
  btn:        '#3A3D43',
  border:     'rgba(255,255,255,0.08)',
  text:       '#FAFAFA',
  textMuted:  '#AAAAAB',
  textDim:    '#858585',
  blue:       '#1381FF',
  green:      '#00D95B',
  greenAct:   '#00B24B',
  yellow:     '#D9A600',
  red:        '#DC3535',
  track:      'rgba(255,255,255,0.09)',
  tabBg:      'rgba(255,255,255,0.05)',
  statBg:     'rgba(255,255,255,0.04)',
  statBorder: 'rgba(255,255,255,0.06)',
  cardBg:     'rgba(255,255,255,0.025)',
};
const LIGHT_T = {
  bg:         '#EAECF0',
  surface:    '#FFFFFF',
  surface2:   '#F0F2F7',
  btn:        '#DDE1EA',
  border:     'rgba(0,0,0,0.13)',
  text:       '#0D0F18',
  textMuted:  '#1F2233',
  textDim:    '#4A5070',
  blue:       '#1068D9',
  green:      '#00A044',
  greenAct:   '#008838',
  yellow:     '#C08000',
  red:        '#C42B2B',
  track:      'rgba(0,0,0,0.084)',
  tabBg:      'rgba(0,0,0,0.08)',
  statBg:     'rgba(0,0,0,0.038)',
  statBorder: 'rgba(0,0,0,0.14)',
  cardBg:     '#FFFFFF',
};
type Tokens = typeof DARK_T;
const ThemeCtx = createContext<{ T: Tokens; dark: boolean; toggle: () => void }>({ T: DARK_T, dark: true, toggle: () => {} });
function useTheme() { return useContext(ThemeCtx); }

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
type TaskData      = { label: string; count: number; totalMin: number };
type ShiftTaskItem = { label: string; count: number; totalMin: number };
type ShiftProcess  = { key: string; label: string; color: string; colorFrom: string; colorTo: string; tasks: ShiftTaskItem[]; totalMin: number };
type HoldEntry     = { label: string; durationMin: number };
type ShiftData     = { processes: ShiftProcess[]; holds: HoldEntry[] };
type QtrMonth      = { label: string; short: string; fact: number; plan: number; procSplit: { post: number; online: number; rehab: number } };

export type Employee = {
  id: string; name: string; initials: string;
  gradFrom: string; gradTo: string;
  avatar: string;
  todayFact: number; todayPlan: number;
  qtrFact: number; qtrPlan: number;
  shiftData: ShiftData; qtrTasks: TaskData[];
  months: QtrMonth[];
};

/* ══════════════════════════════════════════════════════
   QUARTER / DATE CONSTANTS  (update to match your data)
══════════════════════════════════════════════════════ */
const TODAY_ISO        = '2026-06-05';
const TODAY_DISP       = '05.06.26';
const QTR_WD_ELAPSED   = 55;   // рабочих дней прошло с начала квартала
const QTR_WD_TOTAL     = 65;   // всего рабочих дней в квартале
const BASE_PLAN        = 430;  // мин/смена (плановое значение)
const QTR_PLAN_TO_DATE = QTR_WD_ELAPSED * BASE_PLAN; // план-на-дату
const QTR_FULL_PLAN    = QTR_WD_TOTAL   * BASE_PLAN;
const DAYS_REMAINING   = 15;   // календарных дней до конца квартала

/* ══════════════════════════════════════════════════════
   DATA FACTORIES  (generate mock shift / tasks / months)
══════════════════════════════════════════════════════ */
const QTR_MONTH_PLANS = [
  { label: 'Март (с 21)', short: 'Мар', plan: 3010 },
  { label: 'Апрель',      short: 'Апр', plan: 9460 },
  { label: 'Май',         short: 'Май', plan: 9030 },
  { label: 'Июнь (1–5)', short: 'Июн', plan: 2150 },
];
const MONTH_VAR    = [0.82, 1.12, 0.96, 0.88];
const MONTH_SPLITS = [
  { post: 0.55, online: 0.28, rehab: 0.17 },
  { post: 0.48, online: 0.35, rehab: 0.17 },
  { post: 0.52, online: 0.30, rehab: 0.18 },
  { post: 0.50, online: 0.33, rehab: 0.17 },
];
export function makeMonths(qtrFact: number): QtrMonth[] {
  const raw = QTR_MONTH_PLANS.map((m, i) => m.plan * MONTH_VAR[i]);
  const rawTotal = raw.reduce((s, v) => s + v, 0);
  return QTR_MONTH_PLANS.map((m, i) => ({
    label: m.label, short: m.short,
    fact: i === 2 ? Math.round(m.plan * 0.20) : Math.round(qtrFact * raw[i] / rawTotal),
    plan: m.plan,
    procSplit: MONTH_SPLITS[i],
  }));
}
export function makeShiftData(todayFact: number): ShiftData {
  const procs = [
    { key: 'post',   label: 'Пост',         color: '#3B82F6', colorFrom: '#60A5FA', colorTo: '#1D4ED8', share: 0.50 },
    { key: 'online', label: 'Онлайн',       color: '#10B981', colorFrom: '#34D399', colorTo: '#065F46', share: 0.30 },
    { key: 'rehab',  label: 'Реабилитация', color: '#94A3B8', colorFrom: '#E2E8F0', colorTo: '#475569', share: 0.20 },
  ];
  const cmplx = [
    { label: 'Простые', share: 0.60, minPer:  6 },
    { label: 'Средние', share: 0.30, minPer: 15 },
    { label: 'Сложные', share: 0.10, minPer: 35 },
  ];
  const processes = procs.map(p => {
    const procMin = Math.round(todayFact * p.share);
    const tasks = cmplx.map(c => {
      const totalMin = Math.round(procMin * c.share);
      return { label: c.label, count: Math.round(totalMin / c.minPer), totalMin };
    });
    return { key: p.key, label: p.label, color: p.color, colorFrom: p.colorFrom, colorTo: p.colorTo, tasks, totalMin: procMin };
  });
  const holds: HoldEntry[] = [
    { label: 'Обед',                                durationMin: 57 },
    { label: 'Консультация',                        durationMin: 38 },
    { label: 'Летучки/совещания/встречи отдела',   durationMin: 28 },
    { label: 'Минутка личного пространства',        durationMin: 11 },
  ];
  return { processes, holds };
}
export function makeTasks(qtrFact: number): { qtrTasks: TaskData[] } {
  const split = [
    { label: 'Стандартная АФМ',   minPerTask: 22, share: 0.62 },
    { label: 'Экспресс-проверка', minPerTask: 10, share: 0.14 },
    { label: 'Сложная АФМ',       minPerTask: 40, share: 0.14 },
    { label: 'Срочная',           minPerTask: 30, share: 0.10 },
  ];
  return { qtrTasks: split.map(s => {
    const totalMin = Math.round(qtrFact * s.share);
    return { label: s.label, count: Math.max(1, Math.round(totalMin / s.minPerTask)), totalMin };
  })};
}

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function ringTheme(p: number): { from: string; to: string; rgb: string } {
  if (p >= 0.66) return { from: '#22C55E', to: '#86EFAC', rgb: '34,197,94'  };
  if (p >= 0.33) return { from: '#F97316', to: '#FB923C', rgb: '249,115,22' };
  return           { from: '#EF4444',  to: '#FCA5A5', rgb: '239,68,68'     };
}
const GRAY_RING = { from: '#94A3B8', to: '#CBD5E1', rgb: '148,163,184' };

function fmtHoldTotal(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}ч ${m}мин` : `${m}мин`;
}
function textOnColor(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.5 ? '#1E293B' : '#FFFFFF';
}
function hexRgb(h: string) { return [1,3,5].map(i => parseInt(h.slice(i,i+2),16)).join(','); }
function pctColor(p: number) { return ringTheme(p).from; }
function pctGrad(p: number)  { return { from: ringTheme(p).from, to: ringTheme(p).to }; }
function fmtPct(p: number)   { return `${Math.round(p * 100)}%`; }
function fmtN(n: number)     { return n.toLocaleString('ru-RU'); }
function isOnTrack(qtrFact: number) { return qtrFact >= QTR_PLAN_TO_DATE; }

/* ══════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════ */
function useCount(target: number, dur = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t0: number | null = null; let raf: number;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const prog = Math.min((ts - t0) / dur, 1);
      setV(Math.round(target * (1 - Math.pow(1 - prog, 3))));
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
function useReady(delay = 80) {
  const [r, setR] = useState(false);
  useEffect(() => { const t = setTimeout(() => setR(true), delay); return () => clearTimeout(t); }, [delay]);
  return r;
}

/* ══════════════════════════════════════════════════════
   SEGMENTED RING ARC
══════════════════════════════════════════════════════ */
function SegmentedRingArc({ id, cx, cy, r, sw, pct, dark, ready, duration = 900, themeOverride }: {
  id: string; cx: number; cy: number; r: number; sw: number;
  pct: number; dark: boolean; ready: boolean; duration?: number;
  themeOverride?: { from: string; to: string };
}) {
  const clamped = Math.min(Math.max(pct, 0), 1);
  const circ = 2 * Math.PI * r;
  const arc  = clamped * circ;
  const theme = themeOverride ?? ringTheme(clamped);
  return (
    <>
      <defs>
        <linearGradient id={`rg-${id}`} gradientUnits="userSpaceOnUse" x1={cx + r} y1={cy} x2={cx - r} y2={cy}>
          <stop offset="0%"   stopColor={theme.from}/>
          <stop offset="100%" stopColor={theme.to}/>
        </linearGradient>
        <filter id={`rf-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation={sw * 0.4}
            floodColor={theme.from} floodOpacity={dark ? '0.5' : '0.2'}/>
        </filter>
      </defs>
      {clamped > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={`url(#rg-${id})`} strokeWidth={sw} strokeLinecap="round"
          filter={`url(#rf-${id})`}
          style={{
            strokeDasharray: `${circ.toFixed(2)} ${circ.toFixed(2)}`,
            strokeDashoffset: ready ? circ - arc : circ,
            transition: ready ? `stroke-dashoffset ${duration}ms cubic-bezier(0.22,1,0.36,1)` : 'none',
            transform: 'rotate(-90deg)',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   PIE CHART  (donut segments with rounded corners)
══════════════════════════════════════════════════════ */
function donutSegPath(cx: number, cy: number, Ri: number, Ro: number, aStart: number, aEnd: number, cr: number) {
  const rad = (d: number) => (d - 90) * Math.PI / 180;
  const px  = (r: number, d: number) => cx + r * Math.cos(rad(d));
  const py  = (r: number, d: number) => cy + r * Math.sin(rad(d));
  const sweep = aEnd - aStart;
  const δo = Math.min((cr / Ro) * (180 / Math.PI), sweep * 0.45);
  const δi = Math.min((cr / Ri) * (180 / Math.PI), sweep * 0.45);
  const cro = δo * Ro * Math.PI / 180;
  const cri = δi * Ri * Math.PI / 180;
  const f = (n: number) => n.toFixed(2);
  const O1x = px(Ro,aStart+δo), O1y = py(Ro,aStart+δo);
  const O2x = px(Ro,aEnd  -δo), O2y = py(Ro,aEnd  -δo);
  const I1x = px(Ri,aStart+δi), I1y = py(Ri,aStart+δi);
  const I2x = px(Ri,aEnd  -δi), I2y = py(Ri,aEnd  -δi);
  const ECOx = px(Ro-cro,aEnd),   ECOy = py(Ro-cro,aEnd);
  const ECIx = px(Ri+cri,aEnd),   ECIy = py(Ri+cri,aEnd);
  const SCIx = px(Ri+cri,aStart), SCIy = py(Ri+cri,aStart);
  const SCOx = px(Ro-cro,aStart), SCOy = py(Ro-cro,aStart);
  const lgo = sweep-2*δo > 180 ? 1 : 0;
  const lgi = sweep-2*δi > 180 ? 1 : 0;
  return [
    `M ${f(O1x)},${f(O1y)}`,
    `A ${f(Ro)} ${f(Ro)} 0 ${lgo} 1 ${f(O2x)},${f(O2y)}`,
    `A ${f(cro)} ${f(cro)} 0 0 1 ${f(ECOx)},${f(ECOy)}`,
    `L ${f(ECIx)},${f(ECIy)}`,
    `A ${f(cri)} ${f(cri)} 0 0 1 ${f(I2x)},${f(I2y)}`,
    `A ${f(Ri)} ${f(Ri)} 0 ${lgi} 0 ${f(I1x)},${f(I1y)}`,
    `A ${f(cri)} ${f(cri)} 0 0 1 ${f(SCIx)},${f(SCIy)}`,
    `L ${f(SCOx)},${f(SCOy)}`,
    `A ${f(cro)} ${f(cro)} 0 0 1 ${f(O1x)},${f(O1y)}`,
    'Z',
  ].join(' ');
}

function PieChart({ processes, size = 92 }: { processes: ShiftProcess[]; size?: number }) {
  const ready = useReady(150);
  const { dark } = useTheme();
  const cx = size/2, cy = size/2, R = size*0.38, sw = size*0.20;
  const Ro = R + sw/2, Ri = R - sw/2, cr = Math.min(sw*0.22, size*0.038);
  const total = processes.reduce((s, p) => s + p.totalMin, 0);
  if (total === 0) return <svg width={size} height={size}/>;
  const GAP_DEG = 1.5;
  let angle = 0;
  const segs = processes.map(p => { const sweep = (p.totalMin/total)*360; const seg = {...p, startAngle: angle, sweep}; angle += sweep; return seg; });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ flexShrink: 0 }}>
      {segs.map((seg, i) => {
        if (seg.sweep <= GAP_DEG * 1.2) return null;
        const aStart = seg.startAngle + GAP_DEG/2;
        const aEnd   = seg.startAngle + seg.sweep - GAP_DEG/2;
        const pctVal = Math.round((seg.totalMin/total)*100);
        const mid = seg.startAngle + seg.sweep/2;
        const rad = (d: number) => (d-90)*Math.PI/180;
        const tx = cx + R*Math.cos(rad(mid)), ty = cy + R*Math.sin(rad(mid));
        const fs = Math.round(sw*0.40);
        return (
          <g key={seg.key} opacity={ready ? 1 : 0} style={{ transition: `opacity 350ms ease ${i*100}ms` }}>
            <path d={donutSegPath(cx,cy,Ri,Ro,aStart,aEnd,cr)} fill={seg.color}/>
            {pctVal > 0 && seg.sweep > 26 && (
              <text x={tx.toFixed(1)} y={ty.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
                fill={textOnColor(seg.color)} fontSize={fs} fontWeight="700" fontFamily="var(--font-manrope)" style={{ pointerEvents:'none' }}>
                {pctVal}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SHIFT BACK  (оборот карточки «Выполнено за смену»)
══════════════════════════════════════════════════════ */
const SHIFT_TAB_LABELS = [
  { id: 'tasks', label: 'Задачи' },
  { id: 'holds', label: 'Холды' },
] as const;
type ShiftTab = 'tasks' | 'holds';

function ShiftBack({ shiftData }: { shiftData: ShiftData }) {
  const [tab, setTab] = useState<ShiftTab>('tasks');
  const { T, dark } = useTheme();
  const holdTotal = shiftData.holds.reduce((s, h) => s + h.durationMin, 0);
  const total = shiftData.processes.reduce((s, p) =>
    s + p.tasks.filter(t => t.count > 0).reduce((ss, t) => ss + t.totalMin, 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)', borderRadius: 10, padding: 3, flexShrink: 0 }}>
        {SHIFT_TAB_LABELS.map(t => (
          <button key={t.id} onClick={e => { e.stopPropagation(); setTab(t.id); }} style={{
            flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t.id ? (dark ? '#2A2B35' : '#FFFFFF') : 'transparent',
            boxShadow: tab === t.id && !dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            color: tab === t.id ? T.text : T.textMuted,
            fontSize: 11, fontWeight: tab === t.id ? 600 : 400,
            fontFamily: 'var(--font-inter)', transition: 'background 150ms',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'tasks' ? (() => {
        const procs = shiftData.processes.map(p => {
          const active = p.tasks.filter(t => t.count > 0);
          const pMin   = active.reduce((s, t) => s + t.totalMin, 0);
          const pCount = active.reduce((s, t) => s + t.count, 0);
          return { ...p, active, pMin, pCount };
        }).filter(pd => pd.active.length > 0);

        // Largest-remainder → column pcts sum to 100
        const rawP   = procs.map(pd => total > 0 ? pd.pMin/total*100 : 0);
        const floorP = rawP.map(Math.floor);
        const remP   = rawP.map((v,i) => ({i, r: v-floorP[i]})).sort((a,b) => b.r-a.r);
        const colPcts = [...floorP];
        remP.slice(0, 100-floorP.reduce((s,v) => s+v, 0)).forEach(({i}) => colPcts[i]++);

        // Largest-remainder → task pcts sum to 100 across all processes
        const allTasks  = procs.flatMap(pd => pd.active.map(t => ({t, pKey: pd.key})));
        const rawT      = allTasks.map(({t}) => total > 0 ? t.totalMin/total*100 : 0);
        const floorT    = rawT.map(Math.floor);
        const remT      = rawT.map((v,i) => ({i, r: v-floorT[i]})).sort((a,b) => b.r-a.r);
        const allTPcts  = [...floorT];
        remT.slice(0, 100-floorT.reduce((s,v) => s+v, 0)).forEach(({i}) => allTPcts[i]++);
        let taskIdx = 0;
        const tPctsMap: Record<string, number[]> = {};
        for (const pd of procs) tPctsMap[pd.key] = pd.active.map(() => allTPcts[taskIdx++]);

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, flex: 1, alignContent: 'start' }}>
            {procs.map((pd, pi) => {
              const rgb   = hexRgb(pd.color);
              const tPcts = tPctsMap[pd.key];
              return (
                <div key={pd.key} style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: dark ? `rgba(${rgb},0.10)` : `rgba(${rgb},0.07)`, border: `1px solid rgba(${rgb},0.22)`, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 10px 8px', borderBottom: `1px solid rgba(${rgb},0.15)` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: pd.color, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: 4 }}>{pd.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'var(--font-manrope)', lineHeight: 1 }}>{pd.pCount}</span>
                        <span style={{ fontSize: 9, color: T.textDim, fontFamily: 'var(--font-inter)' }}>шт</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pd.color, fontFamily: 'var(--font-inter)' }}>{colPcts[pi]}%</span>
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <span style={{ fontSize: 9, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{pd.pMin} мин</span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pd.active.map((t, i) => (
                      <div key={t.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                          <span style={{ fontSize: 9, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{t.label}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, color: pd.color, fontFamily: 'var(--font-inter)' }}>{tPcts[i]}%</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{t.count} шт</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })() : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shiftData.holds.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: dark ? 'rgba(255,107,107,0.07)' : 'rgba(220,53,53,0.06)', borderRadius: 10, border: `1px solid ${dark ? 'rgba(255,107,107,0.18)' : 'rgba(196,43,43,0.15)'}` }}>
              <span style={{ fontSize: 12, color: T.text, fontFamily: 'var(--font-inter)' }}>{h.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FF8E8E', fontFamily: 'var(--font-inter)', flexShrink: 0 }}>{h.durationMin} мин</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Итого</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{fmtHoldTotal(holdTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MONTH CIRCLE  (кружок месяца на обороте квартала)
══════════════════════════════════════════════════════ */
function MonthCircle({ label, pct, animDelay, size = 80 }: { label: string; pct: number; animDelay: number; size?: number }) {
  const { T, dark } = useTheme();
  const ready = useReady(200 + animDelay);
  const R = size*0.38, CX = size/2, CY = size/2, SW = size*0.1;
  const c  = pctColor(pct);
  const fs = Math.round(size*0.18);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.track} strokeWidth={SW}/>
        <SegmentedRingArc id={`mc-${label}`} cx={CX} cy={CY} r={R} sw={SW} pct={pct} dark={dark} ready={ready}/>
        <text x={CX} y={CY - 3} textAnchor="middle" fill={c} fontSize={fs} fontWeight="700" fontFamily="var(--font-manrope)">{fmtPct(pct)}</text>
        <text x={CX} y={CY + fs*0.85} textAnchor="middle" fill={T.textDim} fontSize={fs*0.7} fontFamily="var(--font-inter)">{label}</text>
      </svg>
    </div>
  );
}

const PROC_META = [
  { key: 'post',   short: 'Пост', label: 'Пост',         color: '#3B82F6' },
  { key: 'online', short: 'Онл',  label: 'Онлайн',       color: '#10B981' },
  { key: 'rehab',  short: 'Реаб', label: 'Реабилитация', color: '#94A3B8' },
] as const;

/* ══════════════════════════════════════════════════════
   MONTHLY BACK  (оборот карточки «Квартал»)
══════════════════════════════════════════════════════ */
function MonthlyBack({ months }: { tasks: TaskData[]; months: QtrMonth[]; qtrPct: number }) {
  const { T } = useTheme();
  const totalFact = months.reduce((s, m) => s + m.fact, 0);
  const qtrSplit  = PROC_META.map(p => ({
    ...p,
    pct: totalFact > 0
      ? months.reduce((s, m) => s + m.fact * (m.procSplit as Record<string,number>)[p.key], 0) / totalFact
      : 0,
  }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 8px' }}>
        {months.map((m, i) => (
          <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <MonthCircle label={m.short} pct={m.fact/m.plan} animDelay={i*80} size={110}/>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {PROC_META.map(p => (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{p.short}</span>
                  <span style={{ fontSize: 11, color: T.text, fontWeight: 600, fontFamily: 'var(--font-inter)' }}>{Math.round(m.procSplit[p.key]*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: 8 }}>
          Итого за квартал
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          {qtrSplit.map(p => (
            <div key={p.key} style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 12, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{p.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: 'var(--font-manrope)' }}>{Math.round(p.pct*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRODUCTIVITY RING  (большая карточка с флипом)
══════════════════════════════════════════════════════ */
interface RingProps {
  id: string; plan: number; fact: number; displayPlan?: number; displayFact?: number;
  title: string; dateLabel?: string; note?: string; subtitle?: string;
  planLabel?: string; factLabel?: string;
  backContent: React.ReactNode;
  colorOverride?: { from: string; to: string; rgb: string };
}
function ProductivityRing({ id, plan, fact, displayPlan, displayFact, title, dateLabel, note, subtitle = 'продуктивность', planLabel = 'План', factLabel = 'Факт', backContent, colorOverride }: RingProps) {
  const [flipped, setFlipped] = useState(false);
  const [hov, setHov]         = useState(false);
  const { T, dark } = useTheme();
  const ready    = useReady(100);
  const animFact = useCount(fact);
  const animPlan = useCount(displayPlan ?? plan);
  const pct      = plan > 0 ? Math.min(fact/plan, 1) : 0;
  const theme    = colorOverride ?? ringTheme(pct);
  const rgb      = theme.rgb;
  const R = 88, CX = 120, CY = 120, SW = 20;
  const cardBg = dark
    ? `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.06) 42%, rgba(255,255,255,0.02) 100%)`
    : T.surface;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => setFlipped(f => !f)}
      style={{ flex: 1, borderRadius: 28, cursor: 'pointer', border: hov ? `1px solid rgba(${rgb},0.45)` : `1px solid ${T.border}`, background: cardBg, overflow: 'hidden', perspective: 900, transition: 'border-color 150ms ease' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 650ms cubic-bezier(0.45,0,0.15,1)' }}>
        {/* ЛИЦО */}
        <div style={{ padding: '24px 24px 20px', height: '100%', boxSizing: 'border-box', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {title}{dateLabel && <span style={{ color: T.text, fontWeight: 700 }}> {dateLabel}</span>}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
            <svg viewBox={`0 0 ${CX*2} ${CY*2}`} width={CX*2} height={CY*2} style={{ display: 'block', overflow: 'visible' }}>
              <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.track} strokeWidth={SW}/>
              <SegmentedRingArc id={`pr-${id}`} cx={CX} cy={CY} r={R} sw={SW} pct={pct} dark={dark} ready={ready} duration={1200} themeOverride={colorOverride}/>
              <text x={CX} y={CY+5} textAnchor="middle" fill={dark ? theme.to : theme.from} fontSize="44" fontWeight="700" fontFamily="var(--font-manrope)" letterSpacing="-2">{fmtPct(pct)}</text>
              {subtitle && <text x={CX} y={CY+24} textAnchor="middle" fill={T.textDim} fontSize="11" fontFamily="var(--font-inter)">{subtitle}</text>}
            </svg>
            <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {note && <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)', textAlign: 'center' }}>{note}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              {[
                { label: factLabel, val: displayFact !== undefined ? displayFact : animFact, c: dark ? ringTheme(pct).to : ringTheme(pct).from },
                { label: planLabel, val: animPlan,                                           c: T.text },
              ].map(({ label, val, c }) => (
                <div key={label} style={{ flex: 1, background: T.statBg, borderRadius: 12, padding: '10px 12px', border: `1px solid ${T.statBorder}` }}>
                  <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginBottom: 3 }}>{label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c, fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmtN(val)}</div>
                    <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>мин</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ОБОРОТ */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', padding: '24px 24px 20px', pointerEvents: flipped ? 'auto' : 'none' }}>
          {backContent}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MINI RING  (маленькое кольцо в карточке списка)
══════════════════════════════════════════════════════ */
function MiniRing({ id, pct, size = 64, colorOverride }: { id: string; pct: number; size?: number; colorOverride?: { from: string; to: string; rgb: string } }) {
  const { T, dark } = useTheme();
  const ready   = useReady(120);
  const R = size*0.34, CX = size/2, CY = size/2, SW = size*0.1;
  const clamped = Math.min(pct, 1);
  const theme   = colorOverride ?? ringTheme(clamped);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.track} strokeWidth={SW}/>
      <SegmentedRingArc id={id} cx={CX} cy={CY} r={R} sw={SW} pct={clamped} dark={dark} ready={ready} themeOverride={colorOverride}/>
      <text x={CX} y={CY+4} textAnchor="middle" fill={dark ? theme.to : theme.from} fontSize={13} fontWeight="700" fontFamily="var(--font-manrope)">{fmtPct(clamped)}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   PROFILE VIEW  ← главный экспортируемый компонент
══════════════════════════════════════════════════════ */
export function ProfileView({ emp }: { emp: Employee }) {
  const { T, dark } = useTheme();
  const pctRgbVal = '0,178,75';
  const qtrPct    = emp.qtrFact / QTR_PLAN_TO_DATE;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Шапка */}
      <div style={{
        background: dark
          ? `linear-gradient(145deg, rgba(${pctRgbVal},0.14) 0%, rgba(128,128,128,0.04) 60%, rgba(128,128,128,0.01) 100%)`
          : T.surface,
        borderRadius: 24, border: `1px solid rgba(${pctRgbVal},0.18)`,
        padding: '18px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 999, flexShrink: 0,
            background: `linear-gradient(135deg, ${emp.gradFrom} 0%, ${emp.gradTo} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-manrope)',
            boxShadow: `0 0 18px rgba(${pctRgbVal},0.3)`,
          }}>{emp.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{emp.name}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Сегодня</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{TODAY_DISP}</div>
          </div>
        </div>
      </div>

      {/* Два кольца */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        <ProductivityRing
          id={`${emp.id}-today`}
          plan={emp.todayPlan} fact={emp.todayFact}
          title="Выполнено за смену" subtitle="прогресс"
          colorOverride={GRAY_RING}
          backContent={<ShiftBack shiftData={emp.shiftData}/>}
        />
        <ProductivityRing
          id={`${emp.id}-qtr`}
          plan={QTR_PLAN_TO_DATE} fact={emp.qtrFact}
          title="Среднее за квартал" dateLabel="С 21 марта"
          planLabel="Средний план за смену" displayPlan={360}
          factLabel="Средний факт за смену" displayFact={Math.round(emp.qtrFact / QTR_WD_ELAPSED)}
          note={`До конца квартала ${DAYS_REMAINING} дней`}
          backContent={<MonthlyBack tasks={emp.qtrTasks} months={emp.months} qtrPct={qtrPct}/>}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DEMO PAGE  (Next.js route — /employee-profile)
══════════════════════════════════════════════════════ */
const DEMO_EMP: Employee = {
  id: 'demo',
  name: 'Петров Сергей Иванович',
  initials: 'ПС',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  gradFrom: '#1381FF', gradTo: '#00D95B',
  todayFact: 396, todayPlan: 430,
  qtrFact: 20400, qtrPlan: QTR_PLAN_TO_DATE,
  months: makeMonths(20400),
  shiftData: makeShiftData(396),
  ...makeTasks(20400),
};

export default function EmployeeProfilePage() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK_T : LIGHT_T;
  return (
    <ThemeCtx.Provider value={{ T, dark, toggle: () => setDark(d => !d) }}>
      <div style={{ minHeight: '100vh', background: T.bg, padding: '32px 24px', transition: 'background 200ms' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setDark(d => !d)} style={{ padding: '6px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.btn, color: T.text, cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif' }}>
              {dark ? '☀️ Светлая' : '🌙 Тёмная'}
            </button>
          </div>
          <ProfileView emp={DEMO_EMP}/>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
