'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ── TOKENS ── */
const T = {
  bg:        '#000000',
  surface:   '#1B1B1B',
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

/* ── ДАННЫЕ ── */
const TODAY_PLAN = 430;
const TODAY_FACT = 286;
const TODAY_DISP = '05.06.26';

const QTR_WD   = 55;
const QTR_PLAN = QTR_WD * TODAY_PLAN;        // 23 650
const QTR_FACT = Math.round(QTR_PLAN * 0.5); // 11 825

const QTR_ELAPSED_DAYS = 77;
const QTR_TOTAL_DAYS   = 92;
const QTR_POS          = QTR_ELAPSED_DAYS / QTR_TOTAL_DAYS;

/* ── HELPERS ── */
function pctColor(p: number) { return p >= 0.8 ? T.greenAct : p >= 0.5 ? T.yellow : T.red; }
function pctRgb(p: number)   { return p >= 0.8 ? '0,178,75' : p >= 0.5 ? '217,166,0' : '220,53,53'; }
function fmtPct(p: number)   { const v = p * 100; return Number.isInteger(v) ? `${v}%` : `${v.toFixed(1)}%`; }
function fmtN(n: number)     { return n.toLocaleString('ru-RU'); }

/* ── HOOK ── */
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

/* ── КОЛЬЦО — MVP (без флипа) ── */
interface RingProps {
  id:        string;
  plan:      number;
  fact:      number;
  label:     string;
  sublabel?: string;
  gradFrom:  string;
  gradTo:    string;
  unit?:     string;
}

function Ring({ id, plan, fact, label, sublabel, gradFrom, gradTo, unit = 'мин' }: RingProps) {
  const ready    = useReady(120);
  const animFact = useCount(fact);
  const animPlan = useCount(plan);

  const pct  = plan > 0 ? Math.min(fact / plan, 1) : 0;
  const rgb  = pctRgb(pct);
  const R    = 96; const CX = 120; const CY = 120; const SW = 18;
  const circ = 2 * Math.PI * R;
  const arc  = pct * circ;

  return (
    <div style={{
      flex: 1,
      borderRadius: 28,
      border: `1px solid rgba(${rgb},0.22)`,
      background: `linear-gradient(145deg, rgba(${rgb},0.12) 0%, rgba(${rgb},0.05) 42%, rgba(255,255,255,0.02) 100%)`,
      padding: '28px 24px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
    }}>

      {/* Заголовок */}
      <div style={{ alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 10, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-inter)', marginBottom: 3 }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>{sublabel}</div>
        )}
      </div>

      {/* SVG кольцо */}
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
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={gradFrom} floodOpacity="0.45"/>
          </filter>
        </defs>

        {/* Трек */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>

        {/* Дуга */}
        {pct > 0 && (
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={`url(#ag-${id})`} strokeWidth={SW} strokeLinecap="round"
            filter={`url(#gl-${id})`}
            style={{
              strokeDasharray:  `${arc.toFixed(2)} ${(circ - arc).toFixed(2)}`,
              strokeDashoffset: ready ? 0 : circ,
              transition:       ready ? 'stroke-dashoffset 1.3s cubic-bezier(0.22,1,0.36,1)' : 'none',
              transform:        'rotate(-90deg)',
              transformOrigin:  `${CX}px ${CY}px`,
            }}
          />
        )}

        {/* Процент в центре */}
        <text x={CX} y={CY - 6} textAnchor="middle" fill={`url(#tg-${id})`}
          fontSize="48" fontWeight="700" fontFamily="var(--font-manrope)" letterSpacing="-2">
          {fmtPct(pct)}
        </text>
        <text x={CX} y={CY + 18} textAnchor="middle" fill={T.textDim}
          fontSize="12" fontFamily="var(--font-inter)">
          продуктивность
        </text>
      </svg>

      {/* Факт / план */}
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        {[
          { label: 'Факт',  val: animFact, color: pctColor(pct) },
          { label: 'План',  val: animPlan, color: T.textMuted   },
        ].map(({ label: lbl, val, color }) => (
          <div key={lbl} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {fmtN(val)}
            </div>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)', marginTop: 2 }}>{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── КВАРТАЛЬНАЯ ПОЛОСА ── */
function QuarterBar() {
  const ready = useReady(200);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>
          2 квартал 2026 · {QTR_ELAPSED_DAYS} / {QTR_TOTAL_DAYS} дн.
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
          transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 300ms',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>21.03.26</span>
        <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>20.06.26</span>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function UserLitePage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>

      {/* Карточка контента */}
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Хлебные крошки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/sber-dashboard/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
              Case Management Online
            </span>
          </Link>
          <span style={{ fontSize: 12, color: T.textDim }}>/</span>
          <Link href="/sber-dashboard/user/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
              Сотрудник
            </span>
          </Link>
          <span style={{ fontSize: 12, color: T.textDim }}>/</span>
          <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'var(--font-inter)' }}>Обзор</span>
        </div>

        {/* Шапка пользователя */}
        <div style={{
          background: `linear-gradient(145deg, rgba(19,129,255,0.09) 0%, rgba(0,178,75,0.04) 60%, rgba(255,255,255,0.01) 100%)`,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>
                  Иванова Анна Сергеевна
                </span>
                <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', color: T.textDim, fontFamily: 'var(--font-inter)' }}>
                  Без особого статуса
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                {[['EM-003', 'ID'], ['Специалист по АФМ', 'Должность'], ['8 ч / день', 'График']].map(([v, k]) => (
                  <div key={k} style={{ display: 'flex', gap: 3 }}>
                    <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'var(--font-inter)' }}>{k}:</span>
                    <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'var(--font-inter)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: T.textDim, fontFamily: 'var(--font-inter)' }}>Сегодня</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: 'var(--font-manrope)' }}>{TODAY_DISP}</div>
            </div>
          </div>
          <QuarterBar/>
        </div>

        {/* Два кольца */}
        <div style={{ display: 'flex', gap: 20 }}>
          <Ring
            id="today"
            plan={TODAY_PLAN}
            fact={TODAY_FACT}
            label="Продуктивность за сегодня"
            sublabel={TODAY_DISP}
            gradFrom="#D9A600"
            gradTo="#00D95B"
          />
          <Ring
            id="qtr"
            plan={QTR_PLAN}
            fact={QTR_FACT}
            label="С начала квартала"
            sublabel="от 21.03.26"
            gradFrom={T.blue}
            gradTo={T.green}
          />
        </div>

      </div>
    </div>
  );
}
