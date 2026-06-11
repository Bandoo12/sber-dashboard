'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ── TOKENS ── */
const T = {
  bg:        '#000000',
  surface:   '#1B1B1B',
  surface2:  '#21222C',
  btn:       '#3A3D43',
  border:    'rgba(255,255,255,0.08)',
  text:      '#FAFAFA',
  textMuted: '#AAAAAB',
  textDim:   '#858585',
  blue:      '#1381FF',
  green:     '#00D95B',
  greenAct:  '#00B24B',
  yellow:    '#D9A600',
  red:       '#DC3535',
};

/* ── БИЗНЕС-ЛОГИКА ── */
type Quarter = { q: number; start: string; end: string; label: string; totalDays: number };
const QUARTERS: Quarter[] = [
  { q: 1, start: '2025-11-01', end: '2026-03-20', label: '1 квартал 2026', totalDays: 140 },
  { q: 2, start: '2026-03-21', end: '2026-06-20', label: '2 квартал 2026', totalDays: 92 },
  { q: 3, start: '2026-06-21', end: '2026-09-20', label: '3 квартал 2026', totalDays: 92 },
  { q: 4, start: '2026-09-21', end: '2026-10-31', label: '4 квартал 2026', totalDays: 41 },
];
function getQuarter(iso: string): Quarter {
  return QUARTERS.find(q => iso >= q.start && iso <= q.end) ?? QUARTERS[1];
}

const TODAY_ISO  = '2026-06-05';
const TODAY_DISP = '05.06.26';
const quarter    = getQuarter(TODAY_ISO);
const BASE_PLAN  = 430;
const TODAY_PLAN = 430;
const TODAY_FACT = 286;

const QTR_WD           = 55;
const QTR_PLAN         = QTR_WD * TODAY_PLAN;
const QTR_FACT         = Math.round(QTR_PLAN * 0.5);
const QTR_ELAPSED_DAYS = 77;
const QTR_POS          = QTR_ELAPSED_DAYS / quarter.totalDays;

/* Задачи по типам (оборот карточки «Сегодня») */
const TODAY_TASKS = [
  { label: 'Стандартная АФМ',  count: 8, totalMin: 176 },
  { label: 'Экспресс-проверка', count: 4, totalMin: 40  },
  { label: 'Сложная АФМ',      count: 1, totalMin: 40  },
  { label: 'Срочная',           count: 1, totalMin: 30  },
]; // Σ 14 задач · 286 мин

/* Помесячные данные (оборот карточки «Квартал») */
const QTR_MONTHS = [
  { label: 'Март (с 21)', short: 'Мар', fact: 2408,  plan: 3010  },
  { label: 'Апрель',       short: 'Апр', fact: 4354,  plan: 9460  },
  { label: 'Май',          short: 'Май', fact: 4515,  plan: 9030  },
  { label: 'Июнь (1–5)',   short: 'Июн', fact: 548,   plan: 2150  },
];

/* 5 последних рабочих дней */
const HISTORY = [
  { date: '01.06', fact: 344 },
  { date: '02.06', fact: 387 },
  { date: '03.06', fact: 194 },
  { date: '04.06', fact: 430 },
  { date: '05.06', fact: TODAY_FACT, today: true },
];

/* ── HELPERS ── */
function pctColor(p: number) { return p >= 0.8 ? T.greenAct : p >= 0.5 ? T.yellow : T.red; }
function pctRgb(p: number)   { return p >= 0.8 ? '0,178,75' : p >= 0.5 ? '217,166,0' : '220,53,53'; }
function fmtPct(p: number)   { const v = p * 100; return Number.isInteger(v) ? `${v}%` : `${v.toFixed(1)}%`; }
function fmtN(n: number)     { return n.toLocaleString('ru-RU'); }

/* ── HOOKS ── */
function useCount(target: number, dur = 1100): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t0: number | null = null;
    let raf: number;
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

/* ── ОБОРОТ «СЕГОДНЯ» — задачи по типам ── */
function TasksBack({ gradFrom, gradTo }: { gradFrom: string; gradTo: string }) {
  const ready    = useReady(200);
  const totalMin = TODAY_TASKS.reduce((s, t) => s + t.totalMin, 0);
  const totalCnt = TODAY_TASKS.reduce((s, t) => s + t.count,    0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ fontSize: 11, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginBottom: 14 }}>
        Задачи за сегодня
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {TODAY_TASKS.map((task, i) => {
          const share  = task.totalMin / totalMin;
          const minPer = Math.round(task.totalMin / task.count);
          return (
            <div key={task.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>{task.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'var(--font-inter)' }}>{task.count}</span>
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>зад · {minPer} мин/шт</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                  background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                  boxShadow: `0 0 6px rgba(217,166,0,0.3)`,
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
function MonthCircle({ label, pct, gradFrom, gradTo, animDelay }: {
  label: string; pct: number; gradFrom: string; gradTo: string; animDelay: number;
}) {
  const ready = useReady(200 + animDelay);
  const R = 36; const CX = 44; const CY = 44; const SW = 7;
  const circ = 2 * Math.PI * R;
  const arc  = pct * circ;
  const c    = pctColor(pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <svg viewBox={`0 0 ${CX*2} ${CY*2}`} width={CX*2} height={CY*2} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`mc-v3-${label}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CX*2} y2={CY*2}>
            <stop offset="0%" stopColor={gradFrom}/>
            <stop offset="100%" stopColor={gradTo}/>
          </linearGradient>
          <filter id={`mg-v3-${label}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={gradFrom} floodOpacity="0.5"/>
          </filter>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW}/>
        {pct > 0 && (
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={`url(#mc-v3-${label})`} strokeWidth={SW} strokeLinecap="round"
            filter={`url(#mg-v3-${label})`}
            style={{
              strokeDasharray:  `${arc.toFixed(2)} ${(circ - arc).toFixed(2)}`,
              strokeDashoffset: ready ? 0 : circ,
              transition:       ready ? 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' : 'none',
              transform:        'rotate(-90deg)',
              transformOrigin:  `${CX}px ${CY}px`,
            }}
          />
        )}
        <text x={CX} y={CY - 5} textAnchor="middle" fill={c}
          fontSize="13" fontWeight="700" fontFamily="var(--font-manrope)">
          {fmtPct(pct)}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fill={T.textDim}
          fontSize="10" fontFamily="var(--font-inter)">
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ── ОБОРОТ «КВАРТАЛ» — кружки + бары ── */
function MonthlyBack({ gradFrom, gradTo }: { gradFrom: string; gradTo: string }) {
  const ready = useReady(200);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>

      {/* Кружки — прибиты к верху */}
      <div style={{ display: 'flex', gap: 4 }}>
        {QTR_MONTHS.map((m, i) => (
          <MonthCircle
            key={m.label}
            label={m.short}
            pct={m.fact / m.plan}
            gradFrom={gradFrom}
            gradTo={gradTo}
            animDelay={i * 80}
          />
        ))}
      </div>

      {/* Бары — прибиты к низу */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 1, background: T.border }}/>
        {QTR_MONTHS.map((m, i) => {
          const p = m.fact / m.plan;
          const c = pctColor(p);
          return (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>{m.label}</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{fmtN(m.fact)}/{fmtN(m.plan)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--font-inter)' }}>{fmtPct(p)}</span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                  background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                  boxShadow: `0 0 6px rgba(${pctRgb(p)},0.35)`,
                  width: ready ? `${Math.min(p * 100, 100)}%` : '0%',
                  transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
                }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── КОЛЬЦО ПРОДУКТИВНОСТИ ── */
interface RingProps {
  id:          string;
  plan:        number;
  fact:        number;
  title:       string;
  dateLabel:   string;
  note?:       string;
  gradFrom:    string;
  gradTo:      string;
  backContent: React.ReactNode;
}

function ProductivityRing({ id, plan, fact, title, dateLabel, note, gradFrom, gradTo, backContent }: RingProps) {
  const [hovered, setHovered] = useState(false);
  const ready    = useReady(100);
  const animFact = useCount(fact);
  const animPlan = useCount(plan);

  const pct  = plan > 0 ? Math.min(fact / plan, 1) : 0;
  const rgb  = pctRgb(pct);
  const R    = 88; const CX = 120; const CY = 120; const SW = 20;
  const circ = 2 * Math.PI * R;
  const arc  = pct * circ;

  const arcStyle: React.CSSProperties = {
    strokeDasharray:  `${arc.toFixed(2)} ${(circ - arc).toFixed(2)}`,
    strokeDashoffset: ready ? 0 : circ,
    transition:       ready ? 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' : 'none',
    transform:        'rotate(-90deg)',
    transformOrigin:  `${CX}px ${CY}px`,
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, borderRadius: 28,
        border: hovered ? `1px solid rgba(${rgb},0.45)` : `1px solid rgba(255,255,255,0.10)`,
        background: `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.06) 42%, rgba(255,255,255,0.02) 100%)`,
        overflow: 'hidden', perspective: 900,
        transition: 'border-color 150ms ease',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 650ms cubic-bezier(0.45,0,0.15,1)',
      }}>

        {/* ЛИЦО */}
        <div style={{
          padding: '24px 24px 20px',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
              {title}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{dateLabel}</div>
            {note && <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginTop: 3 }}>{note}</div>}
          </div>

          <svg viewBox={`0 0 ${CX*2} ${CY*2}`} width={CX*2} height={CY*2} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`ag-${id}`} gradientUnits="userSpaceOnUse"
                x1={CX - R} y1={CY - R} x2={CX + R} y2={CY + R}>
                <stop offset="0%"   stopColor={gradFrom}/>
                <stop offset="100%" stopColor={gradTo}/>
              </linearGradient>
              <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={gradFrom}/>
                <stop offset="100%" stopColor={gradTo}/>
              </linearGradient>
              <filter id={`gl-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={gradFrom} floodOpacity="0.5"/>
              </filter>
            </defs>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>
            {pct > 0 && (
              <circle cx={CX} cy={CY} r={R} fill="none"
                stroke={`url(#ag-${id})`} strokeWidth={SW} strokeLinecap="round"
                filter={`url(#gl-${id})`} style={arcStyle}/>
            )}
            <text x={CX} y={CY - 8} textAnchor="middle" fill={`url(#tg-${id})`}
              fontSize="44" fontWeight="700" fontFamily="var(--font-manrope)" letterSpacing="-2">
              {fmtPct(pct)}
            </text>
            <text x={CX} y={CY + 15} textAnchor="middle" fill={T.textDim}
              fontSize="11" fontFamily="var(--font-inter)">
              продуктивность
            </text>
          </svg>

          <div style={{ display: 'flex', gap: 12, marginTop: 16, width: '100%' }}>
            {[
              { label: 'Факт', val: animFact, c: pctColor(pct) },
              { label: 'План', val: animPlan, c: T.textMuted   },
            ].map(({ label, val, c }) => (
              <div key={label} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c, fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {fmtN(val)}
                </div>
                <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginTop: 1 }}>мин</div>
              </div>
            ))}
          </div>
        </div>

        {/* ОБОРОТ */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          padding: '24px 24px 20px',
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          {backContent}
        </div>
      </div>
    </div>
  );
}

/* ── 5-ДНЕВНЫЙ ЧАРТ ── */
function DayChart() {
  const ready = useReady(300);
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      borderRadius: 24, border: `1px solid ${T.border}`, padding: '20px 22px',
    }}>
      <div style={{ fontSize: 10, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-inter)', marginBottom: 16 }}>
        Последние 5 рабочих дней
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HISTORY.map((d, i) => {
          const p   = d.fact / TODAY_PLAN;
          const c   = pctColor(p);
          const rgb = pctRgb(p);
          const gF  = p >= 0.8 ? '#00D95B' : p >= 0.5 ? '#D9A600' : '#DC3535';
          const gT  = p >= 0.8 ? '#1381FF' : p >= 0.5 ? '#6CB200' : '#D9A600';
          return (
            <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-inter)', color: d.today ? T.text : T.textDim, width: 34, flexShrink: 0, fontWeight: d.today ? 600 : 400 }}>
                {d.date}
              </span>
              <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                  background: `linear-gradient(90deg, ${gF}, ${gT})`,
                  boxShadow: `0 0 7px rgba(${rgb},0.4)`,
                  width: ready ? `${Math.min(p * 100, 100)}%` : '0%',
                  transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 55}ms`,
                }}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: c, fontFamily: 'var(--font-inter)', width: 40, textAlign: 'right', flexShrink: 0 }}>
                {fmtPct(p)}
              </span>
              <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', width: 50, flexShrink: 0 }}>
                {fmtN(d.fact)} мин
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── КВАРТАЛЬНАЯ ПОЛОСА ── */
function QuarterBar() {
  const ready = useReady(150);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>
          {quarter.label} · {QTR_ELAPSED_DAYS} / {quarter.totalDays} дн.
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.blue, fontFamily: 'var(--font-inter)' }}>
          {fmtPct(QTR_POS)} пути
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 999,
          background: `linear-gradient(90deg, ${T.blue}, ${T.green})`,
          boxShadow: `0 0 8px rgba(19,129,255,0.4)`,
          width: ready ? `${Math.min(QTR_POS * 100, 100)}%` : '0%',
          transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 200ms',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>21.03.26</span>
        <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>20.06.26</span>
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
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 92, zIndex: 40,
      background: T.bg, borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 8,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: '#3A3D43', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, flexShrink: 0 }}>
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M10 1L1 6l9 4.5L19 6 10 1zM1 14l9 5 9-5M1 10l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>
      {NAV_ICONS.slice(0, 6).map((icon, i) => {
        const active = i === 4;
        const el = (
          <div className="nav-item" style={{
            width: 44, height: 44, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: active ? '#FAFAFA' : '#E3E3E3',
            background: active ? '#3A3D43' : 'transparent',
          }}>{icon}</div>
        );
        return i === 2
          ? <Link key={i} href="/sber-dashboard/" style={{ textDecoration: 'none' }}>{el}</Link>
          : <div key={i}>{el}</div>;
      })}
      <div style={{ flex: 1 }}/>
      <div style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#E3E3E3' }}>
        {NAV_ICONS[6]}
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function UserV3Page() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <Sidebar/>

      <main style={{ marginLeft: 92, flex: 1, padding: '28px 28px 40px', minWidth: 0 }}>

        {/* Хлебные крошки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Link href="/sber-dashboard/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
              Case Management Online
            </span>
          </Link>
          <span style={{ fontSize: 12, color: T.textDim }}>/</span>
          <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>Сотрудник</span>
        </div>

        {/* Основной контент */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto', width: '100%' }}>

          {/* Шапка пользователя — упрощённая */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(19,129,255,0.09) 0%, rgba(0,178,75,0.04) 60%, rgba(255,255,255,0.01) 100%)',
            borderRadius: 24, border: `1px solid rgba(19,129,255,0.18)`,
            padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 999, flexShrink: 0,
                background: `linear-gradient(135deg, ${T.blue} 0%, ${T.greenAct} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-manrope)',
                boxShadow: `0 0 18px rgba(19,129,255,0.3)`,
              }}>
                ИА
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>
                  Иванова Анна Сергеевна
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Сегодня</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{TODAY_DISP}</div>
              </div>
            </div>
            <QuarterBar/>
          </div>

          {/* Два кольца */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
            <ProductivityRing
              id="v3-today"
              plan={TODAY_PLAN}
              fact={TODAY_FACT}
              title="Продуктивность за сегодня"
              dateLabel={TODAY_DISP}
              note={`База ${BASE_PLAN} мин`}
              gradFrom="#D9A600"
              gradTo="#00D95B"
              backContent={<TasksBack gradFrom="#D9A600" gradTo="#00D95B"/>}
            />
            <ProductivityRing
              id="v3-qtr"
              plan={QTR_PLAN}
              fact={QTR_FACT}
              title="С начала квартала"
              dateLabel="от 21.03.26"
              note={`${QTR_WD} раб. дн. · план до сегодня (вкл.)`}
              gradFrom={T.blue}
              gradTo={T.green}
              backContent={<MonthlyBack gradFrom={T.blue} gradTo={T.green}/>}
            />
          </div>

          {/* 5 дней */}
          <DayChart/>
        </div>
      </main>
    </div>
  );
}
