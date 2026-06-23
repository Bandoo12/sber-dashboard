'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import Link from 'next/link';

/* ── THEME TOKENS ── */
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
  track:      'rgba(255,255,255,0.07)',
  tabBg:      'rgba(255,255,255,0.05)',
  statBg:     'rgba(255,255,255,0.04)',
  statBorder: 'rgba(255,255,255,0.06)',
  cardBg:     'rgba(255,255,255,0.025)',
};
const LIGHT_T = {
  bg:         '#F0F2F5',
  surface:    '#FFFFFF',
  surface2:   '#F5F7FA',
  btn:        '#E2E5EC',
  border:     'rgba(0,0,0,0.08)',
  text:       '#0D0F18',
  textMuted:  '#4A4D5C',
  textDim:    '#8A8EA0',
  blue:       '#1068D9',
  green:      '#00A044',
  greenAct:   '#008838',
  yellow:     '#C08000',
  red:        '#C42B2B',
  track:      'rgba(0,0,0,0.07)',
  tabBg:      'rgba(0,0,0,0.05)',
  statBg:     'rgba(0,0,0,0.03)',
  statBorder: 'rgba(0,0,0,0.08)',
  cardBg:     '#FFFFFF',
};
type Tokens = typeof DARK_T;
const ThemeCtx = createContext<{ T: Tokens; dark: boolean; toggle: () => void }>({ T: DARK_T, dark: true, toggle: () => {} });
function useTheme() { return useContext(ThemeCtx); }

/* ── TYPES ── */
type TaskData = { label: string; count: number; totalMin: number };
type QtrMonth = { label: string; short: string; fact: number; plan: number };
type Employee = {
  id: string; name: string; initials: string;
  gradFrom: string; gradTo: string;
  avatar: string;
  todayFact: number; todayPlan: number;
  qtrFact: number; qtrPlan: number;
  todayTasks: TaskData[]; qtrTasks: TaskData[];
  months: QtrMonth[];
};

/* ── КВАРТАЛЬНЫЕ КОНСТАНТЫ ── */
type Quarter = { q: number; start: string; end: string; label: string; totalDays: number };
const QUARTERS: Quarter[] = [
  { q: 1, start: '2025-11-01', end: '2026-03-20', label: '1 квартал 2026', totalDays: 140 },
  { q: 2, start: '2026-03-21', end: '2026-06-20', label: '2 квартал 2026', totalDays:  92 },
  { q: 3, start: '2026-06-21', end: '2026-09-20', label: '3 квартал 2026', totalDays:  92 },
  { q: 4, start: '2026-09-21', end: '2026-10-31', label: '4 квартал 2026', totalDays:  41 },
];
function getQuarter(iso: string): Quarter {
  return QUARTERS.find(q => iso >= q.start && iso <= q.end) ?? QUARTERS[1];
}

const TODAY_ISO   = '2026-06-05';
const TODAY_DISP  = '05.06.26';
const quarter     = getQuarter(TODAY_ISO);

const BASE_PLAN        = 430;   // мин/день
const QTR_WD_TOTAL     = 65;   // всего раб. дней в квартале (Мар:7+Апр:22+Май:21+Июн:15)
const QTR_WD_ELAPSED   = 55;   // раб. дней прошло (Мар:7+Апр:22+Май:21+Июн:5)
const WD_REMAINING     = 10;   // раб. дней осталось (Июн 8–19)
const QTR_ELAPSED_DAYS = 77;   // календарных дней прошло
const DAYS_REMAINING   = quarter.totalDays - QTR_ELAPSED_DAYS; // 15 кал. дней
const QTR_POS          = QTR_ELAPSED_DAYS / quarter.totalDays; // 0.837

// план-на-текущую-дату: 55 раб. дн × 430 мин = 23 650 мин
const QTR_PLAN_TO_DATE = QTR_WD_ELAPSED * BASE_PLAN; // 23 650 мин
const QTR_FULL_PLAN    = QTR_WD_TOTAL   * BASE_PLAN; // 27 950 мин

// Шаблоны месяцев (только плановые цифры)
const QTR_MONTH_PLANS = [
  { label: 'Март (с 21)', short: 'Мар', plan: 3010 },
  { label: 'Апрель',      short: 'Апр', plan: 9460 },
  { label: 'Май',         short: 'Май', plan: 9030 },
  { label: 'Июнь (1–5)', short: 'Июн', plan: 2150 },
];
// Распределяем qtrFact по месяцам пропорционально их планам
function makeMonths(qtrFact: number): QtrMonth[] {
  const totalPlan = QTR_MONTH_PLANS.reduce((s, m) => s + m.plan, 0);
  return QTR_MONTH_PLANS.map(m => ({
    label: m.label, short: m.short,
    fact: Math.round(qtrFact * (m.plan / totalPlan)),
    plan: m.plan,
  }));
}

/* ── СОТРУДНИКИ ── */
function makeTasks(todayFact: number, qtrFact: number): { todayTasks: TaskData[]; qtrTasks: TaskData[] } {
  const split = [
    { label: 'Стандартная АФМ',  minPerTask: 22, share: 0.62 },
    { label: 'Экспресс-проверка', minPerTask: 10, share: 0.14 },
    { label: 'Сложная АФМ',      minPerTask: 40, share: 0.14 },
    { label: 'Срочная',           minPerTask: 30, share: 0.10 },
  ];
  const build = (total: number): TaskData[] =>
    split.map(s => {
      const totalMin = Math.round(total * s.share);
      return { label: s.label, count: Math.max(1, Math.round(totalMin / s.minPerTask)), totalMin };
    });
  return { todayTasks: build(todayFact), qtrTasks: build(qtrFact) };
}

// qtrFact vs QTR_PLAN_TO_DATE (23 650 мин) — ≥ плана = успевает
const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Иванова Анна Сергеевна',        initials: 'ИА', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', gradFrom: '#D9A600', gradTo: '#00D95B', todayFact:  65, todayPlan: 430, qtrFact: 12800, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths(12800), ...makeTasks( 65, 12800) },
  { id: 'e2', name: 'Петров Сергей Иванович',         initials: 'ПС', avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   gradFrom: '#1381FF', gradTo: '#00D95B', todayFact: 396, todayPlan: 430, qtrFact: 20400, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths(20400), ...makeTasks(396, 20400) },
  { id: 'e3', name: 'Смирнова Ольга Петровна',        initials: 'СО', avatar: 'https://randomuser.me/api/portraits/women/17.jpg', gradFrom: '#00D95B', gradTo: '#1381FF', todayFact: 430, todayPlan: 430, qtrFact: 24000, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths(24000), ...makeTasks(430, 24000) },
  { id: 'e4', name: 'Козлов Дмитрий Александрович',  initials: 'КД', avatar: 'https://randomuser.me/api/portraits/men/58.jpg',   gradFrom: '#DC3535', gradTo: '#D9A600', todayFact: 189, todayPlan: 430, qtrFact:  8500, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths( 8500), ...makeTasks(189,  8500) },
  { id: 'e5', name: 'Новикова Екатерина Дмитриевна', initials: 'НЕ', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', gradFrom: '#D9A600', gradTo: '#1381FF', todayFact: 314, todayPlan: 430, qtrFact: 15800, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths(15800), ...makeTasks(314, 15800) },
  { id: 'e6', name: 'Морозов Алексей Владимирович',  initials: 'МА', avatar: 'https://randomuser.me/api/portraits/men/11.jpg',   gradFrom: '#00D95B', gradTo: '#D9A600', todayFact: 430, todayPlan: 430, qtrFact: 24200, qtrPlan: QTR_PLAN_TO_DATE, months: makeMonths(24200), ...makeTasks(430, 24200) },
];

/* ── HELPERS ── */
// 3 фиксированные темы: зелёный / оранжевый / красный
function ringTheme(p: number): { from: string; to: string; rgb: string } {
  if (p >= 0.66) return { from: '#1A6C38', to: '#50E880', rgb: '26,108,56'  }; // зелёный (светлее на 10%) → ярко-светлый
  if (p >= 0.33) return { from: '#974E1A', to: '#FFB84A', rgb: '151,78,26'  }; // оранжевый (светлее на 10%) → светлый
  return           { from: '#971A1A',  to: '#FF2D2D', rgb: '151,26,26'       }; // красный (светлее на 10%) → насыщенный
}
function pctRgb(p: number) { return ringTheme(p).rgb; }
// Линейная интерполяция двух hex-цветов
function lerpHex(a: string, b: string, t: number): string {
  const h = (s: string) => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)];
  const [ar,ag,ab]=h(a); const [br,bg,bb]=h(b);
  return `#${[ar+(br-ar)*t,ag+(bg-ag)*t,ab+(bb-ab)*t].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`;
}
function pctColor(p: number, _T?: Tokens) { return ringTheme(p).from; }
function pctGrad(p: number,  _T?: Tokens) { return { from: ringTheme(p).from, to: ringTheme(p).to }; }
function fmtPct(p: number) { return `${Math.round(p * 100)}%`; }
function fmtN(n: number)   { return n.toLocaleString('ru-RU'); }

// Сотрудник успевает, если накопленный факт ≥ план на текущую дату (23 650 мин)
function isOnTrack(qtrFact: number) {
  return qtrFact >= QTR_PLAN_TO_DATE;
}

/* ── HOOKS ── */
function useCount(target: number, dur = 1100): number {
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
function useReady(delay = 80): boolean {
  const [r, setR] = useState(false);
  useEffect(() => { const t = setTimeout(() => setR(true), delay); return () => clearTimeout(t); }, [delay]);
  return r;
}

/* ── ДУГА КОЛЬЦА (одна цветовая тема, плавный градиент внутри неё) ── */
function SegmentedRingArc({ id, cx, cy, r, sw, pct, dark, ready, duration = 900, n: _n = 36 }: {
  id: string; cx: number; cy: number; r: number; sw: number;
  pct: number; dark: boolean; ready: boolean; duration?: number; n?: number;
}) {
  const clamped = Math.min(Math.max(pct, 0), 1);
  const circ = 2 * Math.PI * r;
  const arc  = clamped * circ;
  const theme = ringTheme(clamped);
  return (
    <>
      <defs>
        {/* Градиент: оба цвета одной семьи — смешивания нет */}
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

/* ── ОБОРОТ «СЕГОДНЯ» ── */
function TasksBack({ gradFrom, gradTo, tasks }: { gradFrom: string; gradTo: string; tasks: TaskData[] }) {
  const { T } = useTheme();
  const ready    = useReady(200);
  const totalMin = tasks.reduce((s, t) => s + t.totalMin, 0);
  const totalCnt = tasks.reduce((s, t) => s + t.count,    0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ fontSize: 11, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginBottom: 14 }}>
        Задачи за сегодня
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {tasks.map((task, i) => {
          const share  = task.totalMin / totalMin;
          const minPer = Math.round(task.totalMin / task.count);
          return (
            <div key={task.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>{task.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'var(--font-inter)' }}>{task.count}</span>
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>зад × {minPer} мин</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: T.track, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                  background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                  width: ready ? `${Math.min(share * 100, 100)}%` : '0%',
                  transition: `width 750ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Итого</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>
          {totalCnt} задач · {fmtN(totalMin)} мин
        </span>
      </div>
    </div>
  );
}

/* ── КРУЖОК МЕСЯЦА ── */
function MonthCircle({ label, pct, animDelay, size = 80 }: {
  label: string; pct: number; animDelay: number; size?: number;
}) {
  const { T, dark } = useTheme();
  const ready = useReady(200 + animDelay);
  const R = size * 0.38; const CX = size / 2; const CY = size / 2; const SW = size * 0.1;
  const c  = pctColor(pct, T);
  const fs = Math.round(size * 0.18);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.track} strokeWidth={SW}/>
        <SegmentedRingArc id={`mc-${label}`} cx={CX} cy={CY} r={R} sw={SW} pct={pct} dark={dark} ready={ready} n={36}/>
        <text x={CX} y={CY - 3} textAnchor="middle" fill={c} fontSize={fs} fontWeight="700" fontFamily="var(--font-manrope)">{fmtPct(pct)}</text>
        <text x={CX} y={CY + fs * 0.85} textAnchor="middle" fill={T.textDim} fontSize={fs * 0.7} fontFamily="var(--font-inter)">{label}</text>
      </svg>
    </div>
  );
}

/* ── ОБОРОТ «КВАРТАЛ» ── */
function MonthlyBack({ gradFrom, gradTo, tasks, months }: { gradFrom: string; gradTo: string; tasks: TaskData[]; months: QtrMonth[] }) {
  const { T } = useTheme();
  const ready    = useReady(200);
  const qtrTotal = tasks.reduce((s, t) => s + t.totalMin, 0);
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        {months.map((m, i) => {
          const mPct = m.fact / m.plan;
          return <MonthCircle key={m.label} label={m.short} pct={mPct} animDelay={i * 80} size={86}/>;
        })}
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: T.border, flexShrink: 0 }}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, minWidth: 0 }}>
        {tasks.map((task, i) => {
          const share  = task.totalMin / qtrTotal;
          const minPer = Math.round(task.totalMin / task.count);
          return (
            <div key={task.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%' }}>{task.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'var(--font-inter)' }}>{fmtN(task.count)}</span>
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>зад × {minPer} мин</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: T.track, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                  background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                  width: ready ? `${Math.min(share * 100, 100)}%` : '0%',
                  transition: `width 750ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                }}/>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 3, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Итого</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>
            {fmtN(tasks.reduce((s,t) => s+t.count, 0))} задач · {fmtN(qtrTotal)} мин
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── БОЛЬШОЕ КОЛЬЦО С ФЛИПОМ ── */
interface RingProps {
  id: string; plan: number; fact: number; displayPlan?: number;
  title: string; dateLabel?: string; note?: string; subtitle?: string; planLabel?: string;
  backContent: React.ReactNode;
}
function ProductivityRing({ id, plan, fact, displayPlan, title, dateLabel, note, subtitle = 'продуктивность', planLabel = 'План', backContent }: RingProps) {
  const [flipped, setFlipped] = useState(false);
  const [hov, setHov] = useState(false);
  const { T, dark } = useTheme();
  const ready    = useReady(100);
  const animFact = useCount(fact);
  const animPlan = useCount(displayPlan ?? plan);
  const pct  = plan > 0 ? Math.min(fact / plan, 1) : 0;
  const rgb  = pctRgb(pct);
  const R = 88; const CX = 120; const CY = 120; const SW = 20;
  const cardBg = dark
    ? `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.06) 42%, rgba(255,255,255,0.02) 100%)`
    : `linear-gradient(145deg, rgba(${rgb},0.07) 0%, rgba(${rgb},0.02) 60%, ${T.surface} 100%)`;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => setFlipped(f => !f)}
      style={{
        flex: 1, borderRadius: 28, cursor: 'pointer',
        border: hov ? `1px solid rgba(${rgb},0.45)` : `1px solid ${T.border}`,
        background: cardBg,
        overflow: 'hidden', perspective: 900, transition: 'border-color 150ms ease',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 650ms cubic-bezier(0.45,0,0.15,1)',
      }}>
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
              <SegmentedRingArc id={`pr-${id}`} cx={CX} cy={CY} r={R} sw={SW} pct={pct} dark={dark} ready={ready} duration={1200} n={60}/>
              <text x={CX} y={CY + 5} textAnchor="middle" fill={ringTheme(pct).to} fontSize="44" fontWeight="700" fontFamily="var(--font-manrope)" letterSpacing="-2">{fmtPct(pct)}</text>
              {subtitle && <text x={CX} y={CY + 24} textAnchor="middle" fill={T.textDim} fontSize="11" fontFamily="var(--font-inter)">{subtitle}</text>}
            </svg>
            <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {note && <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)', textAlign: 'center' }}>{note}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              {[{ label: 'Факт', val: animFact, c: ringTheme(pct).to }, { label: planLabel, val: animPlan, c: T.text }].map(({ label, val, c }) => (
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

/* ── МИНИ-КОЛЬЦО (цвет по проценту) ── */
function MiniRing({ id, pct, size = 64 }: { id: string; pct: number; size?: number }) {
  const { T, dark } = useTheme();
  const ready   = useReady(120);
  const R = size * 0.34; const CX = size / 2; const CY = size / 2; const SW = size * 0.1;
  const clamped = Math.min(pct, 1);
  const glowC   = ringTheme(clamped).from;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.track} strokeWidth={SW}/>
      <SegmentedRingArc id={id} cx={CX} cy={CY} r={R} sw={SW} pct={clamped} dark={dark} ready={ready} n={36}/>
      <text x={CX} y={CY + 4} textAnchor="middle" fill={glowC} fontSize={13} fontWeight="700" fontFamily="var(--font-manrope)">{fmtPct(clamped)}</text>
    </svg>
  );
}

/* ── КАРТОЧКА СОТРУДНИКА ── */
function EmployeeCard({ emp, onSelect }: { emp: Employee; onSelect: (e: Employee) => void }) {
  const [hov, setHov] = useState(false);
  const { T, dark } = useTheme();
  const todayPct = emp.todayFact / emp.todayPlan;
  const qtrPct   = emp.qtrFact   / emp.qtrPlan;
  const rgb = pctRgb(todayPct);
  return (
    <div
      onClick={() => onSelect(emp)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20, padding: '20px 20px 22px',
        border: hov ? `1px solid rgba(${rgb},0.4)` : `1px solid ${T.border}`,
        background: hov
          ? (dark
              ? `linear-gradient(145deg, rgba(${rgb},0.1) 0%, rgba(${rgb},0.04) 60%, rgba(255,255,255,0.02) 100%)`
              : `linear-gradient(145deg, rgba(${rgb},0.07) 0%, rgba(${rgb},0.02) 60%, ${T.surface} 100%)`)
          : T.cardBg,
        cursor: 'pointer', transition: 'border-color 150ms, background 150ms',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999, flexShrink: 0,
          background: `linear-gradient(135deg, ${emp.gradFrom}, ${emp.gradTo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-manrope)',
          boxShadow: `0 0 12px rgba(${rgb},0.3)`,
        }}>
          {emp.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: 'var(--font-manrope)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {emp.name}
          </div>
          <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginTop: 2 }}>Специалист по АФМ</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: hov ? T.textMuted : T.textDim, transition: 'color 150ms', flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      {/* Два кружка: цвет по %  */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-around' }}>
        {[
          { label: 'Сегодня',    pct: todayPct, key: 'today' },
          { label: 'С нач. кв.', pct: qtrPct,   key: 'qtr'   },
        ].map(row => (
          <div key={row.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <MiniRing id={`${emp.id}-${row.key}`} pct={row.pct} size={120}/>
            <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ТАБ-ПЕРЕКЛЮЧАТЕЛЬ ── */
type ViewMode = 'self' | 'team';
function TabSwitcher({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const { T, dark } = useTheme();
  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'self', label: 'По себе' },
    { id: 'team', label: 'По сотрудникам' },
  ];
  return (
    <div style={{ display: 'flex', background: T.tabBg, borderRadius: 999, padding: 4, gap: 2, alignSelf: 'flex-start' }}>
      {tabs.map(tab => {
        const active = view === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            padding: '7px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: active ? (dark ? T.btn : T.surface) : 'transparent',
            boxShadow: active && !dark ? '0 1px 6px rgba(0,0,0,0.16)' : 'none',
            color: active ? T.text : T.textMuted,
            fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'var(--font-inter)',
            transition: 'background 150ms, color 150ms, box-shadow 150ms',
          }}>{tab.label}</button>
        );
      })}
    </div>
  );
}

/* ── ПРОФИЛЬ СОТРУДНИКА ── */
function ProfileView({ emp }: { emp: Employee; isSelf?: boolean }) {
  const { T, dark } = useTheme();
  const pctRgbVal = '0,178,75'; // фиксированный зелёный для шапки
  const onTrack   = isOnTrack(emp.qtrFact);
  const avgPerDay = Math.round(emp.qtrFact / QTR_WD_ELAPSED);

  // Квартальный ринг: цвет по проценту план-на-сегодня
  const qtrPct  = emp.qtrFact / QTR_PLAN_TO_DATE;
  const qtrGrad = pctGrad(qtrPct, T);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Шапка — без прогресс-бара */}
      <div style={{
        background: dark
          ? `linear-gradient(145deg, rgba(${pctRgbVal},0.14) 0%, rgba(128,128,128,0.04) 60%, rgba(128,128,128,0.01) 100%)`
          : `linear-gradient(145deg, rgba(${pctRgbVal},0.20) 0%, rgba(${pctRgbVal},0.07) 55%, ${T.surface} 100%)`,
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
          }}>
            {emp.initials}
          </div>
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
          title="Выполнено за смену"
          subtitle="прогресс"
          backContent={<TasksBack gradFrom={pctGrad(emp.todayFact / emp.todayPlan, T).from} gradTo={pctGrad(emp.todayFact / emp.todayPlan, T).to} tasks={emp.todayTasks}/>}
        />
        <ProductivityRing
          id={`${emp.id}-qtr`}
          plan={QTR_PLAN_TO_DATE} fact={emp.qtrFact}
          title="Среднее за квартал" dateLabel="С 21 марта" planLabel="Средний план за смену" displayPlan={360}
          note={`До конца квартала ${DAYS_REMAINING} дней`}
          backContent={<MonthlyBack gradFrom={qtrGrad.from} gradTo={qtrGrad.to} tasks={emp.qtrTasks} months={emp.months}/>}
        />
      </div>
    </div>
  );
}

/* ── САЙДБАР ── */
const NAV_ICONS = [
  <svg key="h"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  <svg key="s"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  <svg key="d"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>,
  <svg key="a"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>,
  <svg key="u"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  <svg key="st" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0014 3h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.6.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  <svg key="l"  viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
];

function Sidebar() {
  const { T } = useTheme();
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 92, zIndex: 40, background: T.bg, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 8, transition: 'background 200ms' }}>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: T.btn, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, flexShrink: 0 }}>
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 1L1 6l9 4.5L19 6 10 1zM1 14l9 5 9-5M1 10l9 5 9-5" stroke={T.text} strokeWidth="1.5" strokeLinejoin="round"/></svg>
      </div>
      {NAV_ICONS.slice(0, 6).map((icon, i) => {
        const active = i === 4;
        const el = <div className="nav-item" style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? T.text : T.textMuted, background: active ? T.btn : 'transparent' }}>{icon}</div>;
        return i === 2 ? <Link key={i} href="/sber-dashboard/" style={{ textDecoration: 'none' }}>{el}</Link> : <div key={i}>{el}</div>;
      })}
      <div style={{ flex: 1 }}/>
      <div style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textMuted }}>{NAV_ICONS[6]}</div>
    </div>
  );
}

/* ── PAGE ── */
const SELF = EMPLOYEES[0];

export default function UserV3Page() {
  const [view, setView]         = useState<ViewMode>('self');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [dark, setDark]         = useState(true);
  const T = dark ? DARK_T : LIGHT_T;

  function handleSelectEmployee(emp: Employee) { setSelected(emp); }
  function handleTabChange(v: ViewMode) { setView(v); setSelected(null); }
  function toggle() { setDark(d => !d); }

  return (
    <ThemeCtx.Provider value={{ T, dark, toggle }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, transition: 'background 200ms' }}>
        <Sidebar/>
        <main style={{ marginLeft: 92, flex: 1, padding: '28px 28px 40px', minWidth: 0 }}>

          {/* Хлебные крошки + переключатель темы */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <Link href="/sber-dashboard/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: T.textDim, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>Case Management Online</span>
            </Link>
            <span style={{ fontSize: 12, color: T.textDim }}>/</span>
            <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>Продуктивность</span>
            <div style={{ flex: 1 }}/>
            <button
              onClick={toggle}
              title={dark ? 'Светлая тема' : 'Тёмная тема'}
              style={{
                width: 36, height: 36, borderRadius: 999,
                border: `1px solid ${T.border}`,
                background: T.btn, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.textMuted, transition: 'background 200ms, border-color 200ms',
              }}
            >
              {dark
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto', width: '100%' }}>
            <TabSwitcher view={view} onChange={handleTabChange}/>

            {view === 'self' && <ProfileView emp={SELF} isSelf/>}

            {view === 'team' && !selected && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {EMPLOYEES.map(emp => (
                  <EmployeeCard key={emp.id} emp={emp} onSelect={handleSelectEmployee}/>
                ))}
              </div>
            )}

            {view === 'team' && selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <button onClick={() => setSelected(null)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.textDim, fontSize: 12, fontFamily: 'var(--font-inter)', padding: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
                  К списку сотрудников
                </button>
                <ProfileView emp={selected}/>
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}
