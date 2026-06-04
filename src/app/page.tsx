'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS  (sourced from Figma file 99YBeHB2jTuingVknzny2u)
   ══════════════════════════════════════════════════════════════ */
const T = {
  bg:          '#000000',
  surface:     '#1B1B1B',        // Figma: rgb(27,27,27)
  surface2:    '#21222C',        // Figma: rgb(33,34,38) — table cells
  btn:         '#3A3D43',        // Figma: rgb(58,61,67)
  border:      'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  text:        '#FAFAFA',        // Figma: rgb(250,250,250)
  textMuted:   '#AAAAAB',        // Figma: rgb(170,170,171)
  textDim:     '#858585',        // Figma: rgb(133,133,133) — column headers
  blue:        '#1381FF',        // Figma: rgb(19,129,255)
  green:       '#00D95B',        // Figma: rgb(0,217,91) — active tab
  greenAct:    '#00B24B',        // Figma: rgb(0,178,75) — action button
  greenBadge:  '#6CB200',        // Figma: rgb(108,178,0)
  yellowBadge: '#D9A600',        // Figma: rgb(217,166,0)
  r: 8,
};

/* ══════════════════════════════════════════════════════════════ DATA */

type StatusKey = 'rejected' | 'approved' | 'rehabilitated' | 'investigating';

interface Op {
  id: number; status: string; sk: StatusKey;
  caseNum: string; caseType: string; date: string;
  pp: string; amount: string; opType: string;
  purpose: string; cp: string; inn: string; sig: 'Да' | 'Нет';
}

const OPS: Op[] = [
  {id:1,  status:'На согласовании',      sk:'approved',       caseNum:'-114986', caseType:'Онлайн',       date:'—',          pp:'655556776', amount:'600 000,00 ₽',    opType:'Безналичная', purpose:'—',                         cp:'—',                   inn:'—',          sig:'Нет'},
  {id:2,  status:'Согласована',          sk:'approved',       caseNum:'-115283', caseType:'Онлайн',       date:'15.03.2026', pp:'554433',    amount:'1 200 000,00 ₽',  opType:'Безналичная', purpose:'Оплата по лизингу',         cp:'ООО Лизинг',          inn:'1122334455', sig:'Да'},
  {id:3,  status:'Новая',                sk:'investigating',  caseNum:'-115281', caseType:'Онлайн',       date:'—',          pp:'445566',    amount:'78 000,00 ₽',     opType:'Безналичная', purpose:'Хозяйственные расходы',     cp:'ООО ХозТорг',         inn:'1234567890', sig:'Да'},
  {id:4,  status:'На реабилитации',      sk:'rehabilitated',  caseNum:'-115282', caseType:'Онлайн',       date:'—',          pp:'778899',    amount:'250 000,00 ₽',    opType:'Безналичная', purpose:'Аванс по договору',         cp:'ООО Поставка',        inn:'9876543210', sig:'Да'},
  {id:5,  status:'На реабилитации',      sk:'rehabilitated',  caseNum:'-1885',   caseType:'Реабилитация', date:'—',          pp:'776633',    amount:'150 000,00 ₽',    opType:'Безналичная', purpose:'Авансовый платеж',          cp:'ООО ТехноСнаб',      inn:'2233445566', sig:'Да'},
  {id:6,  status:'Отказ в реабилитации', sk:'rejected',       caseNum:'-1884',   caseType:'Реабилитация', date:'19.03.2026', pp:'998844',    amount:'670 000,00 ₽',    opType:'Безналичная', purpose:'Поставка ТМЦ',              cp:'ООО ТоргПоставка',   inn:'3344556677', sig:'Да'},
  {id:7,  status:'Реабилитировано',      sk:'rehabilitated',  caseNum:'-1883',   caseType:'Реабилитация', date:'18.03.2026', pp:'887766',    amount:'230 000,00 ₽',    opType:'Безналичная', purpose:'Оплата услуг',              cp:'ООО СервисПлюс',     inn:'4455667788', sig:'Да'},
  {id:8,  status:'Отказана',             sk:'rejected',       caseNum:'-115285', caseType:'Онлайн',       date:'17.03.2026', pp:'776655',    amount:'890 000,00 ₽',    opType:'Безналичная', purpose:'Оплата по договору',        cp:'ООО СтройМаркет',    inn:'6677889900', sig:'Да'},
  {id:9,  status:'Отказ в реабилитации', sk:'rejected',       caseNum:'-115280', caseType:'Онлайн',       date:'16.03.2026', pp:'112233',    amount:'350 000,00 ₽',    opType:'Безналичная', purpose:'Консультационные услуги',   cp:'ООО КонсалтПлюс',   inn:'9900112233', sig:'Да'},
  {id:10, status:'Отказ в реабилитации', sk:'rejected',       caseNum:'-1882',   caseType:'Реабилитация', date:'14.03.2026', pp:'990011',    amount:'450 000,00 ₽',    opType:'ВЭД',         purpose:'Импорт товаров',            cp:'ChinaTrade Ltd',     inn:'—',          sig:'Нет'},
  {id:11, status:'Отказана',             sk:'rejected',       caseNum:'-115279', caseType:'Онлайн',       date:'13.03.2026', pp:'443322',    amount:'300 000,00 ₽',    opType:'Безналичная', purpose:'Аренда оборудования',       cp:'ООО РентАвто',       inn:'5544332211', sig:'Да'},
  {id:12, status:'На расследовании',     sk:'investigating',  caseNum:'-115277', caseType:'Онлайн',       date:'—',          pp:'110099',    amount:'750 000,00 ₽',    opType:'Безналичная', purpose:'Сделки с ц/б',              cp:'ООО Инвест',         inn:'2211009988', sig:'Да'},
  {id:13, status:'Отказана',             sk:'rejected',       caseNum:'-1881',   caseType:'Реабилитация', date:'11.03.2026', pp:'221100',    amount:'180 000,00 ₽',    opType:'Безналичная', purpose:'Транспортные расходы',      cp:'ООО Логистик',       inn:'3322110099', sig:'Нет'},
  {id:14, status:'На расследовании',     sk:'investigating',  caseNum:'-115278', caseType:'Онлайн',       date:'—',          pp:'332211',    amount:'500 000,00 ₽',    opType:'Безналичная', purpose:'Оплата работ',              cp:'ООО СтройПро',       inn:'4433221100', sig:'Да'},
  {id:15, status:'Отказана',             sk:'rejected',       caseNum:'-115276', caseType:'Онлайн',       date:'10.03.2026', pp:'998877',    amount:'420 000,00 ₽',    opType:'Безналичная', purpose:'Прочие расходы',            cp:'ООО Прочее',         inn:'1100998877', sig:'Нет'},
];

/* ══════════════════════════════════════════════════════════════
   STATUS BADGE CONFIG  (matched to Figma badge colors)
   ══════════════════════════════════════════════════════════════ */
const SB: Record<string, { bg: string; color: string; dot: string }> = {
  'На согласовании':      { bg: 'rgba(217,166,0,0.18)',   color: '#D9A600',  dot: '#D9A600'  },
  'Согласована':          { bg: 'rgba(19,129,255,0.18)',  color: '#1381FF',  dot: '#1381FF'  },
  'Новая':                { bg: 'rgba(108,178,0,0.18)',   color: '#6CB200',  dot: '#6CB200'  },
  'На реабилитации':      { bg: 'rgba(217,166,0,0.18)',   color: '#D9A600',  dot: '#D9A600'  },
  'Реабилитировано':      { bg: 'rgba(0,178,75,0.18)',    color: '#00B24B',  dot: '#00B24B'  },
  'Отказ в реабилитации': { bg: 'rgba(220,53,53,0.18)',   color: '#DC3535',  dot: '#DC3535'  },
  'Отказана':             { bg: 'rgba(220,53,53,0.18)',   color: '#DC3535',  dot: '#DC3535'  },
  'На расследовании':     { bg: 'rgba(217,166,0,0.18)',   color: '#D9A600',  dot: '#D9A600'  },
};

/* ══════════════════════════════════════════════════════════════
   STAT CARDS CONFIG
   ══════════════════════════════════════════════════════════════ */
const CARDS = [
  { key:'rejected'      as StatusKey, label:'Отказанные',       count:7, pct:47, color:'#DC3535', rgb:'220,53,53',    extra:'Последний отказ: 19.03.2026', chart:'area'  },
  { key:'approved'      as StatusKey, label:'Согласованные',    count:2, pct:13, color:'#00B24B', rgb:'0,178,75',     extra:null,                          chart:'donut' },
  { key:'rehabilitated' as StatusKey, label:'Реабилитированные',count:2, pct:13, color:'#1381FF', rgb:'19,129,255',   extra:'Всего запросов: 6',           chart:'bar', eff:33 },
  { key:'investigating' as StatusKey, label:'На расследовании', count:4, pct:27, color:'#D9A600', rgb:'217,166,0',    extra:null,                          chart:'gauge' },
] as const;

/* ══════════════════════════════════════════════════════════════
   MINI CHARTS — построены по реальным данным таблицы
   ══════════════════════════════════════════════════════════════ */

/* Отказанные: хронология сумм по датам отказов */
function AreaChart({ ops, color }: { ops: Op[]; color: string }) {
  const [tip, setTip] = useState<{x:number;y:number;label:string}|null>(null);

  const dated = ops
    .filter(o => o.date !== '—')
    .sort((a, b) => a.date.localeCompare(b.date));

  const amounts = dated.map(o => parseInt(o.amount.replace(/[^0-9]/g, ''), 10));
  const maxA = Math.max(...amounts, 1);
  const W = 200, H = 72;
  const dx = amounts.length > 1 ? W / (amounts.length - 1) : W;
  const pts = amounts.map((a, i) => ({ x: i * dx, y: H - Math.round((a / maxA) * (H - 14)) - 4 }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const id = `ach-${color.replace(/[^a-z0-9]/gi, '')}`;

  const fmt = (n: number) => n >= 1_000_000
    ? `${(n/1_000_000).toFixed(1)} млн ₽`
    : `${(n/1_000).toFixed(0)} тыс ₽`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      onMouseLeave={() => setTip(null)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      {amounts.length > 1 && (
        <>
          <path d={`${line} L${pts[pts.length-1].x},${H} L0,${H} Z`} fill={`url(#${id})`} className="anim-fill"/>
          <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="anim-line"/>
        </>
      )}
      {pts.map((p, i) => {
        if (i === 0 || i === pts.length - 1) return null;
        return (
          <g key={i}
            onMouseEnter={() => setTip({ x: p.x, y: p.y, label: `${dated[i].date.slice(0,5)}\n${fmt(amounts[i])}` })}
            onMouseLeave={() => setTip(null)}>
            <circle cx={p.x} cy={p.y} r={8} fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={3} fill={color} className="anim-dot" style={{animationDelay:`${300 + i * 30}ms`}}/>
          </g>
        );
      })}
      {/* Tooltip */}
      {tip && (() => {
        const [datePart, amtPart] = tip.label.split('\n');
        const tw = 72, th = 28, tx = Math.min(Math.max(tip.x - tw/2, 2), W - tw - 2);
        const ty = tip.y > 36 ? tip.y - th - 6 : tip.y + 8;
        return (
          <g style={{pointerEvents:'none'}}>
            <rect x={tx} y={ty} width={tw} height={th} rx={5} fill="rgba(30,31,36,0.95)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
            <text x={tx + tw/2} y={ty + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5.5" fontFamily="Inter">{datePart}</text>
            <text x={tx + tw/2} y={ty + 21} textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="600" fontFamily="Inter">{amtPart}</text>
          </g>
        );
      })()}
    </svg>
  );
}

/* Согласованные: доля Согласована vs На согласовании */
function DonutChart({ ops, color }: { ops: Op[]; color: string }) {
  const confirmed = ops.filter(o => o.status === 'Согласована').length;
  const pending   = ops.filter(o => o.status === 'На согласовании').length;
  const total = confirmed + pending || 1;
  const r = 48, CX = 56, CY = 56, circ = 2 * Math.PI * r;
  const confirmedArc = (confirmed / total) * circ;
  const pendingColor = 'rgba(255,255,255,0.15)';

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', height:'100%'}}>
      {/* Donut SVG */}
      <svg viewBox="0 0 112 112" width="112" height="112" style={{flexShrink:0}}>
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={pendingColor} strokeWidth="10"/>
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${confirmedArc.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round"
          className="anim-arc" style={{transform:`rotate(-90deg)`,transformOrigin:`${CX}px ${CY}px`}}/>
        <text x={CX} y={CY - 5} textAnchor="middle" fill={T.text} fontSize="17" fontWeight="700" fontFamily="Inter">
          {confirmed}/{total}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill={T.textDim} fontSize="9" fontFamily="Inter">согласовано</text>
      </svg>

      {/* Legend */}
      <div style={{display:'flex', flexDirection:'column', gap:10, justifyContent:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:color, flexShrink:0}}/>
          <span style={{fontSize:11, color:'rgba(255,255,255,0.5)', fontFamily:'var(--font-inter)'}}>Подтверждено</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:pendingColor, flexShrink:0}}/>
          <span style={{fontSize:11, color:'rgba(255,255,255,0.5)', fontFamily:'var(--font-inter)'}}>Ожидает</span>
        </div>
      </div>
    </div>
  );
}

/* Реабилитированные: воронка реабилитации (в процессе / завершено / отказано) */
function BarChart({ color }: { color: string }) {
  const inProgress = OPS.filter(o => o.status === 'На реабилитации').length;
  const completed  = OPS.filter(o => o.status === 'Реабилитировано').length;
  const refused    = OPS.filter(o => o.status === 'Отказ в реабилитации').length;
  const maxV = Math.max(inProgress, completed, refused, 1);

  const bars = [
    { l: 'В процессе', v: inProgress, c: '#D9A600' },
    { l: 'Завершено',  v: completed,  c: color },
    { l: 'Отказано',   v: refused,    c: '#DC3535' },
  ];

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:'100%', paddingBottom:2 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
          {/* Count above bar */}
          <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.8)', fontFamily:'var(--font-inter)', lineHeight:1 }}>
            {b.v}
          </span>
          {/* Bar */}
          <div style={{
            width:'100%', borderRadius:6, background:b.c,
            height:`${Math.max((b.v / maxV) * 70, 4)}%`,
            animation:`bar-grow 550ms cubic-bezier(0.34,1.3,0.64,1) ${i * 80}ms both`,
            minHeight:4,
          }}/>
          {/* Label */}
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontFamily:'var(--font-inter)', textAlign:'center', lineHeight:1.2 }}>
            {b.l}
          </span>
        </div>
      ))}
    </div>
  );
}

/* На расследовании: сумма под расследованием + топ типов операций */
function GaugeChart({ ops, color }: { ops: Op[]; color: string }) {
  const totalSum = ops.reduce((s, o) => s + parseInt(o.amount.replace(/[^0-9]/g, ''), 10), 0);
  const fmt = (n: number) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} млн`
    : `${(n / 1_000).toFixed(0)} тыс`;

  const byOpType = ops.reduce((acc, o) => {
    acc[o.opType] = (acc[o.opType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const types = Object.entries(byOpType).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const maxV = Math.max(...types.map(([, v]) => v), 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, height:'100%', justifyContent:'center', padding:'4px 2px' }}>
      {/* Сумма */}
      <div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'var(--font-inter)', marginBottom:2 }}>
          Общая сумма под расследованием
        </div>
        <div style={{ fontSize:20, fontWeight:600, color, fontFamily:'var(--font-inter)', letterSpacing:'-0.02em' }}>
          {fmt(totalSum)} ₽
        </div>
      </div>
      {/* Разделитель */}
      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 0 2px' }}/>
      {/* Топ типов операций */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {types.map(([type, count], i) => (
          <div key={type} style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', fontFamily:'var(--font-inter)' }}>{type}</span>
              <span style={{ fontSize:10, fontWeight:600, color, fontFamily:'var(--font-inter)' }}>{count}</span>
            </div>
            <div style={{ height:3, borderRadius:999, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999, background: color,
                width:`${Math.round((count / maxV) * 100)}%`,
                animation:`bar-grow 500ms cubic-bezier(0.25,1,0.5,1) ${i * 70 + 100}ms both`,
              }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function playWhoosh() {
  try {
    const ctx = new AudioContext();
    ctx.resume().then(() => {
      const dur = 0.28;
      const sr = ctx.sampleRate;
      const buf = ctx.createBuffer(1, Math.ceil(sr * dur), sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        // Smooth bell envelope: quick rise, long tail
        const env = Math.pow(Math.sin(Math.PI * i / d.length), 0.6);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      // Sweep filter high→low gives "whoosh" character
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(4000, ctx.currentTime);
      lpf.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + dur);
      lpf.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination);
      src.start();
      setTimeout(() => ctx.close(), (dur + 0.05) * 1000);
    });
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */
function StatCard({ card, active, onClick }: { card:typeof CARDS[number]; active:boolean; onClick:()=>void }) {
  const [hovered, setHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const { label, count, pct, color, rgb, extra, chart } = card;
  const cardOps = OPS.filter(o => o.sk === card.key);
  const border = active ? `1px solid rgba(${rgb},0.45)` : `1px solid rgba(255,255,255,0.10)`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); setAnimKey(k => k + 1); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:'relative', textAlign:'left', border, borderRadius:28,
        background: `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.04) 42%, rgba(255,255,255,0.02) 100%)`,
        width:'100%',
        outline:'none', cursor: active ? 'default' : 'pointer', overflow:'hidden', display:'block',
        transition:'border-color 150ms ease',
        perspective: 900,
      }}
    >
      {/* Flip wrapper — in normal flow so it defines card height */}
      <div style={{
        position:'relative', width:'100%', height:'100%',
        transformStyle:'preserve-3d',
        transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition:'transform 650ms cubic-bezier(0.45,0,0.15,1)',
      }}>

        {/* ── FRONT — in normal flow, defines height ── */}
        <div style={{
          padding:'20px',
          backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          display:'flex', flexDirection:'column', gap:10, justifyContent:'flex-start',
        }}>
          <span style={{fontSize:13,fontWeight:500,color:T.textMuted,fontFamily:'var(--font-inter)',letterSpacing:'-0.01em'}}>
            {label}
          </span>
          <div style={{fontSize:50,fontWeight:300,lineHeight:1,color,fontFamily:'var(--font-inter)',letterSpacing:'-0.03em'}}>
            {count}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <div style={{display:'flex',alignItems:'baseline',gap:6}}>
              <span style={{fontSize:14,fontWeight:600,color,fontFamily:'var(--font-inter)'}}>{pct}%</span>
              <span style={{fontSize:12,color:T.textDim,fontFamily:'var(--font-inter)'}}>от всех операций</span>
            </div>
            {extra && card.key !== 'rehabilitated' && <span style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>{extra}</span>}
            {'eff' in card && card.key !== 'rehabilitated' && (
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                <span style={{fontSize:11,color:T.textDim}}>Эффективность реабилитации</span>
                <span style={{fontSize:11,fontWeight:600,color}}>&nbsp;{(card as {eff:number}).eff}% (2/6)</span>
              </div>
            )}
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position:'absolute', inset:0,
          backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          transform:'rotateY(180deg)',
          padding: chart === 'area' ? 0 : '16px 18px',
          display:'flex', flexDirection:'column', gap: chart === 'area' ? 0 : 8,
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding: chart === 'area' ? '14px 16px 6px' : 0,
        }}>
          <span style={{fontSize:12,fontWeight:500,color:T.textMuted,fontFamily:'var(--font-inter)'}}>{label}</span>
          <span className="anim-num" style={{fontSize:13,fontWeight:700,color,fontFamily:'var(--font-inter)'}}>{count} · {pct}%</span>
        </div>
        {card.key === 'rehabilitated' && (
          <div style={{display:'flex',gap:12,marginBottom:6}}>
            {extra && <span style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>{extra}</span>}
            {'eff' in card && (
              <span style={{fontSize:11,fontFamily:'var(--font-inter)',color:T.textDim}}>
                Эффективность: <span style={{fontWeight:600,color}}>{(card as {eff:number}).eff}%</span>
              </span>
            )}
          </div>
        )}
        <div key={animKey} style={{flex:1,minHeight:0}}>
          {chart==='area'  && <AreaChart  ops={cardOps} color={color}/>}
          {chart==='donut' && <DonutChart ops={cardOps} color={color}/>}
          {chart==='bar'   && <BarChart   color={color}/>}
          {chart==='gauge' && <GaugeChart ops={cardOps} color={color}/>}
        </div>
        </div>{/* end back */}
      </div>{/* end flip wrapper */}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATUS BADGE
   ══════════════════════════════════════════════════════════════ */
function Badge({ status }: { status:string }) {
  const s = SB[status] ?? { bg:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', dot:'rgba(255,255,255,0.4)' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'0 10px', height:24, borderRadius:999,
      fontSize:12, fontWeight:500, fontFamily:'var(--font-inter)',
      background:s.bg, color:s.color, whiteSpace:'nowrap',
    }}>
      <span style={{width:5,height:5,borderRadius:'50%',background:s.dot,flexShrink:0}}/>
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   TABLE
   ══════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;
const COLS = [
  { key:'status',  label:'Статус операции',    w:196 },
  { key:'caseNum', label:'Номер кейса',        w:112 },
  { key:'caseType',label:'Тип кейса',          w:112 },
  { key:'date',    label:'Дата решения',       w:118 },
  { key:'pp',      label:'ПП №',               w:108 },
  { key:'amount',  label:'Сумма',              w:148 },
  { key:'opType',  label:'Тип операции',       w:114 },
  { key:'purpose', label:'Назначение платежа', w:194 },
  { key:'cp',      label:'Контрагент',         w:156 },
  { key:'inn',     label:'ИНН контрагента',   w:134 },
  { key:'sig',     label:'Значимость',         w:96  },
] as const;

type TimelineOp = typeof OPS[number];

const STATUS_FLOW: Record<string, {label:string; color:string}[]> = {
  'Отказана':             [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'},{label:'Отказана',color:'#DC3535'}],
  'Отказ в реабилитации': [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'Реабилитация',color:'#D9A600'},{label:'Отказ',color:'#DC3535'}],
  'Согласована':          [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'},{label:'Согласована',color:'#1381FF'}],
  'На согласовании':      [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'}],
  'Новая':                [{label:'Создан',color:'#555'},{label:'Новая',color:'#00B24B'}],
  'На реабилитации':      [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'На реабилитации',color:'#D9A600'}],
  'Реабилитировано':      [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'Реабилитация',color:'#D9A600'},{label:'Реабилитировано',color:'#00B24B'}],
  'На расследовании':     [{label:'Создан',color:'#555'},{label:'На расследовании',color:'#D9A600'}],
};

function Table({ filter, typeFilter }: { filter:StatusKey|null; typeFilter:string }) {
  const [page, setPage] = useState(1);
  const [hovOp, setHovOp] = useState<TimelineOp|null>(null);
  const [tipPos, setTipPos] = useState({x:0,y:0});

  const rows = useMemo(()=>{
    let d = OPS;
    if (filter)                d = d.filter(o=>o.sk===filter);
    if (typeFilter!=='all')    d = d.filter(o=>o.caseType===typeFilter);
    return d;
  }, [filter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const cp = Math.min(page, totalPages);
  const visible = rows.slice((cp-1)*PAGE_SIZE, cp*PAGE_SIZE);

  const thS: React.CSSProperties = {
    padding:'0 12px', textAlign:'left', fontSize:14, fontWeight:500,
    color:'#858585', whiteSpace:'nowrap', background:'#212226',
    fontFamily:'var(--font-inter)', userSelect:'none', height:60,
  };
  const tdS: React.CSSProperties = {
    padding:'0 12px', fontSize:14, fontWeight:400,
    color:'#FFFFFF', fontFamily:'var(--font-inter)', height:44,
    background:'#212226',
  };

  return (
    <>
    <div className="table-scroll" style={{overflowX:'auto', borderRadius:12}}>
        <table style={{width:'100%',minWidth:1382,borderCollapse:'separate',borderSpacing:'1px',background:'#141415'}}>
          <thead>
            <tr>
              {COLS.map((c,i)=>(
                <th key={c.key} style={{
                  ...thS, width:c.w, minWidth:c.w,
                  borderTopLeftRadius:  i===0 ? 12 : 0,
                  borderTopRightRadius: i===COLS.length-1 ? 12 : 0,
                }}>
                  {c.label}
                  {['status','date','pp'].includes(c.key) &&
                    <span style={{opacity:0.45,marginLeft:4,fontSize:12}}>⇅</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length===0
              ? <tr><td colSpan={COLS.length} style={{...tdS,textAlign:'center',padding:'48px 0',color:T.textDim}}>
                  Нет операций по выбранному фильтру
                </td></tr>
              : visible.map((o, ri)=>(
              <tr key={o.id} className="t-row"
                onMouseEnter={e=>{
                  const tipW=290, tipH=200;
                  const x=Math.min(e.clientX+12, window.innerWidth-tipW-8);
                  const y=e.clientY+tipH>window.innerHeight ? e.clientY-tipH-8 : e.clientY+16;
                  setTipPos({x, y});
                  setHovOp(o);
                }}
                onMouseMove={e=>{
                  const tipW=290, tipH=200;
                  const x=Math.min(e.clientX+12, window.innerWidth-tipW-8);
                  const y=e.clientY+tipH>window.innerHeight ? e.clientY-tipH-8 : e.clientY+16;
                  setTipPos({x, y});
                }}
                onMouseLeave={()=>setHovOp(null)}
              >
                <td style={{...tdS, borderBottomLeftRadius: ri===visible.length-1?12:0}}><Badge status={o.status}/></td>
                <td style={{...tdS,color:T.text}}>{o.caseNum}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.caseType}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.date}</td>
                <td style={{...tdS,fontWeight:600}}>{o.pp}</td>
                <td style={{...tdS,fontWeight:600}}>{o.amount}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.opType}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.purpose}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.cp}</td>
                <td style={{...tdS,color:T.textDim,fontSize:13}}>{o.inn}</td>
                <td style={{...tdS, borderBottomRightRadius: ri===visible.length-1?12:0, color:o.sig==='Да'?T.greenAct:T.textDim, fontWeight:o.sig==='Да'?600:400}}>
                  {o.sig}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>

      {/* Row timeline tooltip */}
      {hovOp && (()=>{
        const steps = STATUS_FLOW[hovOp.status] ?? [{label:'Создан',color:'#555'},{label:hovOp.status,color:'#888'}];
        return (
          <div className={`row-timeline visible`} style={{
            position:'fixed', left:tipPos.x, top:tipPos.y, zIndex:9999,
            background:'#1A1B1E', border:'1px solid rgba(255,255,255,0.10)',
            borderRadius:12, padding:'14px 16px', minWidth:280,
            boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-inter)',marginBottom:12,letterSpacing:'0.05em',textTransform:'uppercase'}}>
              История кейса {hovOp.caseNum}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {steps.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                    <div style={{
                      width:10,height:10,borderRadius:'50%',
                      background: i===steps.length-1 ? s.color : 'rgba(255,255,255,0.2)',
                      border: i===steps.length-1 ? `2px solid ${s.color}` : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: i===steps.length-1 ? `0 0 6px ${s.color}` : 'none',
                      marginTop:2, flexShrink:0,
                    }}/>
                    {i<steps.length-1 && <div style={{width:1,height:24,background:'rgba(255,255,255,0.08)',margin:'3px 0'}}/>}
                  </div>
                  <div style={{paddingBottom: i<steps.length-1 ? 0 : 0}}>
                    <div style={{fontSize:13,fontWeight: i===steps.length-1 ? 600 : 400,color: i===steps.length-1 ? '#fff' : 'rgba(255,255,255,0.45)',fontFamily:'var(--font-inter)'}}>
                      {s.label}
                    </div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:'var(--font-inter)'}}>
                      {i===0 ? '—' : i===steps.length-1 && hovOp.date!=='—' ? hovOp.date : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Pagination — Figma node 101:3793, outside table */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:16,
        padding:'16px 0',
      }}>

        {/* chevron + page numbers + dots + last + chevron */}
        <div style={{display:'flex',alignItems:'center',gap:4}}>

          {/* ChevronLeft */}
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={cp===1}
            style={{
              width:36,height:36,borderRadius:10,border:'none',cursor:cp===1?'default':'pointer',
              background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',
              opacity:cp===1?0.25:1,
            }}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path d="M7.41 1.41L6 0L0 6L6 12L7.41 10.59L2.83 6L7.41 1.41Z" fill="white"/>
            </svg>
          </button>

          {/* Page numbers */}
          {(()=>{
            const pages: (number|'...')[] = [];
            if (totalPages <= 7) {
              for (let i=1;i<=totalPages;i++) pages.push(i);
            } else {
              if (cp <= 4) {
                pages.push(1,2,3,4,5,'...',totalPages);
              } else if (cp >= totalPages-3) {
                pages.push(1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages);
              } else {
                pages.push(1,'...',cp-1,cp,cp+1,'...',totalPages);
              }
            }
            return pages.map((p,i)=> p==='...'
              ? <span key={`d${i}`} style={{
                  width:36,height:36,borderRadius:10,display:'inline-flex',alignItems:'center',
                  justifyContent:'center',fontSize:14,fontWeight:600,color:'#A4ACBB',
                  fontFamily:'var(--font-inter)',
                }}>...</span>
              : <button key={p} onClick={()=>setPage(p as number)} style={{
                  width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',
                  fontSize:14,fontWeight:600,fontFamily:'var(--font-inter)',
                  background: cp===p ? '#00B24B' : 'transparent',
                  color: '#fff',
                }}>
                  {p}
                </button>
            );
          })()}

          {/* ChevronRight */}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={cp===totalPages}
            style={{
              width:36,height:36,borderRadius:10,border:'none',cursor:cp===totalPages?'default':'pointer',
              background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',
              opacity:cp===totalPages?0.25:1,
            }}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path d="M1.41 0L0 1.41L4.58 6L0 10.59L1.41 12L7.41 6L1.41 0Z" fill="white"/>
            </svg>
          </button>
        </div>

        {/* Right: "Записей на страницу" dropdown — Figma: bg #212226, stroke #2E3035, r=16, h=44 */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          height:44, borderRadius:16, overflow:'hidden',
          background:'#212226', border:'1px solid #2E3035',
        }}>
          <span style={{fontSize:14,fontWeight:500,color:'#AAAABB',fontFamily:'var(--font-inter)',padding:'0 8px 0 14px',whiteSpace:'nowrap'}}>
            Записей на страницу: <span style={{color:'#fff'}}>{PAGE_SIZE}</span>
          </span>
          <div style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="12" height="7.5" viewBox="0 0 8 5" fill="none">
              <path d="M7.06 0L4 3.05333L0.94 0L0 0.94L4 4.94L8 0.94L7.06 0Z" fill="white"/>
            </svg>
          </div>
        </div>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR  (Figma: icons rgb(227,227,227) inactive, white active; bg #000)
   ══════════════════════════════════════════════════════════════ */
const NAV_ICONS = [
  // Home
  <svg key="h" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  // Person
  <svg key="p" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/></svg>,
  // Grid (active)
  <svg key="g" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>,
  // Search
  <svg key="s" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  // Bell
  <svg key="b" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  // Settings
  <svg key="st" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0014 3h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.6.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  // Logout
  <svg key="l" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
];

function Sidebar() {
  return (
    <div style={{
      position:'fixed',left:0,top:0,bottom:0,width:92,zIndex:40,
      background:T.bg, borderRight:`1px solid ${T.border}`,
      display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 0',gap:8,
    }}>
      {/* Logo */}
      <div style={{width:44,height:44,borderRadius:999,background:'#3A3D43',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:4,flexShrink:0}}>
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M10 1L1 6l9 4.5L19 6 10 1zM1 14l9 5 9-5M1 10l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>

      {NAV_ICONS.slice(0,6).map((icon,i)=>(
        <div key={i} style={{position:'relative'}}>
          <div className="nav-item" style={{
            width:44,height:44,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
            color:'#E3E3E3',
            background: i===2 ? '#3A3D43' : 'transparent',
          }}>{icon}</div>
        </div>
      ))}

      <div style={{flex:1}}/>
      <div style={{
        width:44,height:44,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        color:'#E3E3E3', background:'transparent',
      }}>
        {NAV_ICONS[6]}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOP BAR  — точно по Figma (dark theme)
   ══════════════════════════════════════════════════════════════ */

/* ClientInfo chip: label (gray) + value (light blue) */
function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display:'flex', flexDirection:'row', alignItems:'center', gap:6,
      padding:'0 12px', height:30, borderRadius:999,
      background:'#1D1E20', border:'1px solid #242528',
    }}>
      <span style={{fontSize:16, fontWeight:400, color:'#838894', fontFamily:'var(--font-inter)', whiteSpace:'nowrap'}}>{label}:</span>
      <span style={{fontSize:16, fontWeight:500, color:'#99C8FF', fontFamily:'var(--font-inter)', whiteSpace:'nowrap'}}>{value}</span>
    </div>
  );
}

/* Status badge — Figma: цветной круг с иконкой + текст */
function StatusChip({ label, bg, vb, paths }: { label: string; bg: string; vb: string; paths: string[] }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'0 12px 0 0', height:36, borderRadius:999,
      border:'1px solid rgba(255,255,255,0.10)', background:'transparent',
    }}>
      <div style={{
        width:36, height:36, borderRadius:999, background:bg, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" style={{width:'67%', height:'67%', display:'block'}}>
          {paths.map((d,i) => <path key={i} d={d} fill="white"/>)}
        </svg>
      </div>
      <span style={{fontSize:16, fontWeight:500, color:T.text, fontFamily:'var(--font-inter)', whiteSpace:'nowrap'}}>{label}</span>
    </div>
  );
}

const STATUS_CHIPS = [
  { label:'ЗСК',   bg:'#797F8B', vb:'0 0 28 28', paths:['M14 2.33334L4.66669 5.83334V12.9383C4.66669 18.83 8.64502 24.325 14 25.6667C19.355 24.325 23.3334 18.83 23.3334 12.9383V5.83334L14 2.33334ZM21 12.9383C21 17.605 18.025 21.9217 14 23.24C9.97502 21.9217 7.00002 17.6167 7.00002 12.9383V7.45501L14 4.83001L21 7.45501V12.9383Z','M12.8333 16.3333H15.1666V18.6667H12.8333V16.3333ZM12.8333 8.16666H15.1666V14H12.8333V8.16666Z'] },
  { label:'2RED',  bg:'#797F8B', vb:'0 0 24 24', paths:['M23 12L20.56 9.22001L20.9 5.54001L17.29 4.72001L15.4 1.54001L12 3.00001L8.6 1.54001L6.71 4.72001L3.1 5.53001L3.44 9.21001L1 12L3.44 14.78L3.1 18.47L6.71 19.29L8.6 22.47L12 21L15.4 22.46L17.29 19.28L20.9 18.46L20.56 14.78L23 12ZM18.49 14.11L18.75 16.9L16.01 17.52L14.58 19.93L12 18.82L9.42 19.93L7.99 17.52L5.25 16.9L5.51 14.1L3.66 12L5.51 9.88001L5.25 7.10001L7.99 6.49001L9.42 4.08001L12 5.18001L14.58 4.07001L16.01 6.48001L18.75 7.10001L18.49 9.89001L20.34 12L18.49 14.11ZM11 15H13V17H11V15ZM11 7.00001H13V13H11V7.00001Z'] },
  { label:'PB',    bg:'#797F8B', vb:'0 0 24 24', paths:['M20 7H16V5L14 3H10L8 5V7H4C2.9 7 2 7.9 2 9V14C2 14.75 2.4 15.38 3 15.73V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V15.72C21.59 15.37 22 14.73 22 14V9C22 7.9 21.1 7 20 7ZM10 5H14V7H10V5ZM4 9H20V14H15V11H9V14H4V9ZM13 15H11V13H13V15ZM19 19H5V16H9V17H15V16H19V19Z'] },
  { label:'VIP',   bg:'#797F8B', vb:'0 0 24 24', paths:['M19 3H5L2 9L12 21L22 9L19 3ZM9.62 8L11.12 5H12.88L14.38 8H9.62ZM11 10V16.68L5.44 10H11ZM13 10H18.56L13 16.68V10ZM19.26 8H16.61L15.11 5H17.76L19.26 8ZM6.24 5H8.89L7.39 8H4.74L6.24 5Z'] },
  { label:'VC',    bg:'#797F8B', vb:'0 0 24 24', paths:['M13.5 3H7V12H5V14H7V16H5V18H7V21H9V18H13V16H9V14H13.5C16.54 14 19 11.54 19 8.5C19 5.46 16.54 3 13.5 3ZM13.5 12H9V5H13.5C15.43 5 17 6.57 17 8.5C17 10.43 15.43 12 13.5 12Z'] },
  { label:'HOT',   bg:'#797F8B', vb:'0 0 20 20', paths:['M13.3333 4.99999L12.9667 5.45832C12.6167 5.89166 12.15 6.08332 11.6833 6.08332C10.8333 6.08332 10 5.43332 10 4.41666V1.66666C10 1.66666 3.33334 4.99999 3.33334 10.8333C3.33334 14.5167 6.31668 17.5 10 17.5C13.6833 17.5 16.6667 14.5167 16.6667 10.8333C16.6667 8.36666 15.325 6.14999 13.3333 4.99999ZM10 15.8333C9.08334 15.8333 8.33334 15.1083 8.33334 14.2167C8.33334 13.7917 8.50001 13.3917 8.81668 13.0833L10 11.9167L11.1917 13.0833C11.5 13.3917 11.6667 13.7917 11.6667 14.2167C11.6667 15.1083 10.9167 15.8333 10 15.8333ZM13.3 14.5833C13.3333 14.2833 13.4833 13.0083 12.3583 11.9L10 9.58332L7.64168 11.9C6.50834 13.0167 6.66668 14.3 6.70001 14.5833C5.65834 13.6667 5.00001 12.325 5.00001 10.8333C5.00001 8.19999 6.77501 6.12499 8.35834 4.79166C8.55001 6.44999 9.96668 7.74999 11.6833 7.74999C12.3333 7.74999 12.9667 7.55832 13.5 7.19999C14.45 8.14999 15 9.45832 15 10.8333C15 12.325 14.3417 13.6667 13.3 14.5833Z'] },
  { label:'УС',    bg:'#797F8B', vb:'0 0 20 20', paths:['M19.99 2C19.99 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H16L20 20L19.99 2ZM18 2V15.17L16.83 14H2V2H18ZM4 10H16V12H4V10ZM4 7H16V9H4V7ZM4 4H16V6H4V4Z'] },
  { label:'ОМ',    bg:'#797F8B', vb:'0 0 24 24', paths:['M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z'] },
  { label:'СК',    bg:'#797F8B', vb:'0 0 24 24', paths:['M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z'] },
  { label:'Увед.', bg:'#797F8B', vb:'0 0 18 22', paths:['M7.01 19.51C7.01 20.61 7.9 21.5 9 21.5C10.1 21.5 10.99 20.61 10.99 19.51H7.01ZM9 4.5C11.76 4.5 14 6.74 14 9.5V16.5H4V9.5C4 6.74 6.24 4.5 9 4.5ZM9 0C8.17 0 7.5 0.67 7.5 1.5V2.67C4.36 3.35 2 6.15 2 9.5V15.5L0 17.5V18.5H18V17.5L16 15.5V9.5C16 6.15 13.64 3.35 10.5 2.67V1.5C10.5 0.67 9.83 0 9 0ZM10 6.5H8V9.5H5V11.5H8V14.5H10V11.5H13V9.5H10V6.5Z'] },
];

function TopBar() {
  const CLI_TABS = ['КП','Список','Инфо','Числовая фактура','Операции','Выписка','КА','Заключение'];

  const divider: React.CSSProperties = {};

  return (
    <div style={{position:'fixed',top:0,left:92,right:0,zIndex:30,background:T.bg}}>

      {/* ── Row 0: Case Management Online + ID ── */}
      <div style={{
        display:'flex', alignItems:'center', height:40, padding:'0 0 0 14px',
      }}>
        {/* "Case Management Online" — Figma: Inter Variable 12px w400 white */}
        <span style={{fontSize:12,fontWeight:400,color:'rgba(255,255,255,0.9)',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>
          Case Management Online
        </span>
        <div style={{flex:1}}/>
        {/* ID — Figma: Manrope, правый край */}
        <div style={{
          height:40, padding:'0 16px', display:'flex', alignItems:'center',
          fontSize:12, fontWeight:600, fontFamily:'var(--font-manrope)',
          color:'rgba(255,255,255,0.45)', borderLeft:`1px solid ${T.border}`, flexShrink:0,
        }}>
          ID: 303202567
        </div>
      </div>

      {/* ── Row 1: клиентские табы (LEFT) + контролы (RIGHT) ── */}
      <div style={{
        display:'flex', alignItems:'center', height:44, padding:'0 14px',
        ...divider,
      }}>
        {/* Клиентские табы — Inter 14px w500, active = green */}
        <div style={{display:'flex', flex:1, overflowX:'auto', gap:6}}>
          {CLI_TABS.map(t => {
            const isActive = t === 'Операции';
            return (
              <button key={t} style={{
                height:36, padding:'0 12px', cursor:'pointer', whiteSpace:'nowrap',
                fontSize:14, fontWeight:500, fontFamily:'var(--font-inter)',
                color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                background: isActive ? T.green : 'transparent',
                border: isActive ? 'none' : '1px solid #2E3035',
                borderRadius: 999,
                flexShrink: 0,
              }}>{t}</button>
            );
          })}
        </div>

        {/* Контролы справа — Figma: Countdown + Отложить + Создать */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:12}}>

          {/* Countdown timer h=36 */}
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'4px 12px 4px 4px', height:36, borderRadius:999,
            background:'rgba(25,40,17,1)',
          }}>
            {/* Priority badge 28x28, иконка 20 */}
            <div style={{
              width:28, height:28, borderRadius:999, background:T.greenBadge,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <span className="flame-icon" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
              </span>
            </div>
            <span style={{fontSize:11,color:'rgba(154,161,177,1)',fontFamily:'var(--font-inter)'}}>:</span>
            {/* Time — 14px */}
            <span style={{fontSize:14, fontWeight:500, color:'#fff', fontFamily:'var(--font-inter)', letterSpacing:'0.02em'}}>
              23:59:59
            </span>
          </div>

          {/* Отложить задачу h=40, text=14, icon=24 */}
          <button style={{
            padding:'0 14px', height:40, borderRadius:999, border:'none', cursor:'pointer',
            fontSize:14, fontWeight:500, fontFamily:'var(--font-inter)',
            background:T.btn, color:T.text,
            display:'flex', alignItems:'center', gap:8,
          }}>
            {/* PauseCircleOutline — Figma */}
            <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
              <path d="M7 14H9V6H7V14ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM11 14H13V6H11V14Z" fill="#E3E3E3"/>
            </svg>
            Отложить задачу
          </button>

          {/* + кнопка 40x40, иконка 24 */}
          <button style={{
            width:40, height:40, borderRadius:999, border:'none', cursor:'pointer',
            background:T.greenAct, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>
      </div>

      {/* ── Rows 2+3: Head контейнер — как карточки ниже, с отступами и скруглением ── */}
      <div style={{
        margin:'8px 24px 16px',
        borderRadius:28,
        border:`1px solid rgba(255,255,255,0.10)`,
        background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(4,38,1,0.50) 100%)',
        overflow:'hidden',
      }}>

      {/* ── Row 2: Online badge + Тильдиум + ClientInfo ── */}
      <div style={{padding:'24px 24px 0 24px'}}>
        {/* Top mini row: Online badge LEFT + SLA RIGHT */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          {/* Online: Акцепт — Figma: bg #6CB200 solid, white text 14px, OnlinePrediction icon */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'0 12px', height:32, borderRadius:999,
            background:T.greenBadge,
          }}>
            {/* OnlinePrediction icon (Figma) */}
            <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
              <path d="M13.5 6.57C13.5 8.57 11 10.07 11 11.57H9C9 10.07 6.5 8.57 6.5 6.57C6.5 4.64 8.07 3.07 10 3.07C11.93 3.07 13.5 4.64 13.5 6.57ZM11 12.57H9V14.07H11V12.57ZM20 7.07C20 4.31 18.88 1.81 17.07 0L16.01 1.06C17.55 2.6 18.5 4.73 18.5 7.07C18.5 9.41 17.55 11.54 16.01 13.08L17.07 14.14C18.88 12.33 20 9.83 20 7.07ZM1.5 7.07C1.5 4.73 2.45 2.6 3.99 1.06L2.93 0C1.12 1.81 0 4.31 0 7.07C0 9.83 1.12 12.33 2.93 14.14L3.99 13.08C2.45 11.54 1.5 9.41 1.5 7.07ZM15.5 7.07C15.5 8.59 14.88 9.96 13.89 10.96L14.95 12.02C16.22 10.75 17 9 17 7.07C17 5.14 16.22 3.39 14.95 2.12L13.89 3.18C14.88 4.18 15.5 5.55 15.5 7.07ZM5.05 12.02L6.11 10.96C5.11 9.96 4.5 8.59 4.5 7.07C4.5 5.55 5.12 4.18 6.11 3.18L5.05 2.12C3.78 3.39 3 5.14 3 7.07C3 9 3.78 10.75 5.05 12.02Z" fill="white"/>
            </svg>
            <span style={{fontSize:13,fontWeight:500,color:'#fff',fontFamily:'var(--font-inter)'}}>Online: Акцепт</span>
          </div>

          {/* SLA истекает — RIGHT, Figma: fire icon (LocalFireDepartmentOutlined), bg rgba(255,129,38) */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'4px 12px', borderRadius:999,
            background:'#141415', border:'1px solid #1D1E20',
          }}>
            {/* LocalFireDepartment icon (Figma) */}
            <svg viewBox="0 0 24 24" fill="#FF8126" width="13" height="13">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
            <span style={{fontSize:12,color:'#838894',fontFamily:'var(--font-inter)'}}>SLA истекает</span>
            <span style={{fontSize:12,fontWeight:500,color:'#FF8126',fontFamily:'var(--font-inter)'}}>16.03.2026 16:00</span>
          </div>
        </div>

        {/* Тильдиум — Figma: Inter Variable 36px w400, white */}
        <div style={{fontSize:36,fontWeight:400,color:T.text,fontFamily:'var(--font-inter)',lineHeight:1.1,letterSpacing:'-0.02em',marginBottom:12}}>
          Тильдиум
        </div>

        {/* ClientInfo chips — Figma: bg rgba(29,30,32), label gray, value #99C8FF */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
          <InfoChip label="ИНН" value="303202567"/>
          <InfoChip label="Тип клиента" value="ФЛ"/>
          <InfoChip label="Запрос документов" value="ДА"/>
          <InfoChip label="Начало периода" value="09.01.2025"/>
          <InfoChip label="Конец периода" value="09.10.2025"/>
        </div>
      </div>

      {/* ── Row 3: Status badges bar ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:6, padding:'20px 24px 24px 24px',
        overflowX:'auto',
      }}>
        {STATUS_CHIPS.map(c => <StatusChip key={c.label} {...c}/>)}
        <div style={{flex:1}}/>
        <button style={{
          padding:'0 14px',height:36,borderRadius:999,border:`1px solid ${T.border}`,cursor:'pointer',
          fontSize:14,fontWeight:500,background:'transparent',color:T.textMuted,fontFamily:'var(--font-inter)',
          flexShrink:0,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:8,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15.325 12.1333C13.925 11.4167 12.1083 10.8333 9.99998 10.8333C7.89165 10.8333 6.07498 11.4167 4.67498 12.1333C3.84165 12.5583 3.33331 13.4167 3.33331 14.35V16.6667H16.6666V14.35C16.6666 13.4167 16.1583 12.5583 15.325 12.1333ZM15 15H4.99998V14.35C4.99998 14.0333 5.16665 13.75 5.43331 13.6167C6.42498 13.1083 8.02498 12.5 9.99998 12.5C11.975 12.5 13.575 13.1083 14.5666 13.6167C14.8333 13.75 15 14.0333 15 14.35V15ZM8.14998 10H11.85C12.8583 10 13.6333 9.11668 13.5 8.11668L13.2333 6.07501C12.975 4.49168 11.6 3.33334 9.99998 3.33334C8.39998 3.33334 7.02498 4.49168 6.76665 6.07501L6.49998 8.11668C6.36665 9.11668 7.14165 10 8.14998 10ZM8.41665 6.32501C8.54998 5.55834 9.21665 5.00001 9.99998 5.00001C10.7833 5.00001 11.45 5.55834 11.5833 6.32501L11.85 8.33334H8.14998L8.41665 6.32501Z" fill="#F6F6F6"/>
          </svg>
          Профиль клиента
        </button>
      </div>

      </div>{/* end Head container */}
    </div>
  );
}

/* ── Figma-style Dropdown ── */
function FigmaDropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger */}
      <div onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', gap: 0,
        height: 36, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
        background: '#212226', border: '1px solid rgba(255,255,255,0.08)',
        userSelect: 'none',
      }}>
        {/* Left icon — CropFree */}
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 7H16V5L14 3H10L8 5V7H4C2.9 7 2 7.9 2 9V14C2 14.75 2.4 15.38 3 15.73V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V15.72C21.59 15.37 22 14.73 22 14V9C22 7.9 21.1 7 20 7ZM10 5H14V7H10V5ZM4 9H20V14H15V11H9V14H4V9ZM13 15H11V13H13V15ZM19 19H5V16H9V17H15V16H19V19Z" fill="rgba(255,255,255,0.4)"/>
          </svg>
        </div>
        {/* Label */}
        <span style={{ fontSize: 14, fontWeight: 500, color: '#AAAABB', fontFamily: 'var(--font-inter)', paddingRight: 4, whiteSpace: 'nowrap' }}>
          {selected?.label ?? 'Выбрать'}
        </span>
        {/* Expand button */}
        <div style={{
          width: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#3A3D43', marginLeft: 4, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s',
        }}>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path d="M7.06 0L4 3.05333L0.94 0L0 0.94L4 4.94L8 0.94L7.06 0Z" fill="white"/>
          </svg>
        </div>
      </div>
      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute', top: 40, right: 0, zIndex: 999,
          background: '#212226', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 8, overflow: 'hidden', minWidth: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {options.map(o => (
            <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: '8px 14px', fontSize: 14, fontWeight: 500,
                color: o.value === value ? '#fff' : '#AAAABB',
                background: o.value === value ? 'rgba(255,255,255,0.06)' : 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = o.value === value ? 'rgba(255,255,255,0.06)' : 'transparent')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── All-ops bar ── */
function AllOpsBar({ isActive, onSelect }: { isActive: boolean; onSelect: () => void }) {
  const [animKey, setAnimKey] = useState(0);
  const total = OPS.length;

  return (
    <button
      onClick={onSelect}
      className="all-ops-bar"
      onMouseEnter={() => { if (!isActive) setAnimKey(k => k + 1); }}
      style={{
        display:'flex', alignItems:'center', gap:24,
        padding:'18px 24px', borderRadius:28, width:'100%', textAlign:'left',
        border: isActive ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.10)',
        background: isActive
          ? 'linear-gradient(145deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.01) 100%)',
        boxShadow: isActive ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        cursor: isActive ? 'default' : 'pointer', outline:'none',
      }}
    >
      {/* Label + number */}
      <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0,minWidth:120}}>
        <span style={{fontSize:13,fontWeight:500,color:T.textMuted,fontFamily:'var(--font-inter)'}}>
          Все операции
        </span>
        <span style={{fontSize:42,fontWeight:300,lineHeight:1,letterSpacing:'-0.03em',color:'#fff',fontFamily:'var(--font-inter)'}}>
          {total}
        </span>
      </div>

      {/* Stacked bar — re-mounts on hover to replay animation */}
      <div key={animKey} style={{flex:1,display:'flex',flexDirection:'column',gap:8,alignSelf:'center'}}>
        <div style={{height:8,borderRadius:999,overflow:'hidden',display:'flex',gap:2}}>
          {CARDS.map((c, i) => {
            const pct = (OPS.filter(o => o.sk === c.key).length / total) * 100;
            return (
              <div key={c.key} style={{width:`${pct}%`, height:'100%', overflow:'hidden', flexShrink:0, borderRadius:999}}>
                <div style={{
                  width:'100%', height:'100%', background:c.color,
                  animation:`seg-grow 600ms cubic-bezier(0.25,1,0.5,1) ${i * 100}ms both`,
                }}/>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:0}}>
          {CARDS.map((c, i) => {
            const cnt = OPS.filter(o => o.sk === c.key).length;
            const pct = Math.round((cnt / total) * 100);
            return (
              <div key={c.key} style={{width:`${pct}%`,minWidth:0,overflow:'hidden'}}>
                <span style={{
                  fontSize:11,fontWeight:500,color:c.color,
                  fontFamily:'var(--font-inter)',whiteSpace:'nowrap',
                  animation:`fade-up 300ms ease ${i * 80 + 200}ms both`,
                  display:'inline-block',
                }}>{pct}%</span>
              </div>
            );
          })}
        </div>

      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function Page() {
  const [filter, setFilter]     = useState<StatusKey|null>(null);
  const [typeFilter, setType]   = useState('all');
  const [segment, setSegment]   = useState<'post'|'online'|'rehab'>('post');

  const SEGMENTS = [
    { key: 'post'   as const, label: 'Пост' },
    { key: 'online' as const, label: 'Онлайн' },
    { key: 'rehab'  as const, label: 'Реабилитация' },
  ];

  const caseTypes = ['all', ...Array.from(new Set(OPS.map(o=>o.caseType)))];

  const filteredCount = useMemo(()=>{
    let d = OPS;
    if (filter)            d = d.filter(o=>o.sk===filter);
    if (typeFilter!=='all') d = d.filter(o=>o.caseType===typeFilter);
    return d.length;
  }, [filter, typeFilter]);

  const btnReset: React.CSSProperties = {
    padding:'5px 14px',borderRadius:7,border:`1px solid ${T.border}`,cursor:'pointer',
    fontSize:13,fontWeight:500,background:'transparent',color:T.textMuted,fontFamily:'var(--font-inter)',
  };

  return (
    <>
      <Sidebar/>
      <TopBar/>

      {/* paddingTop = globalRow(40) + tabs(44) + head ≈ total fixed height */}
      <div style={{marginLeft:92,paddingTop:330,minHeight:'100vh',background:T.bg}}>
        <div style={{padding:'16px 24px 48px',display:'flex',flexDirection:'column',gap:18}}>

          {/* ── All-statuses aggregate bar ── */}
          <AllOpsBar isActive={filter === null} onSelect={() => setFilter(null)} />

          {/* ── Stat cards ── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,alignItems:'stretch'}}>
            {CARDS.map(c=>(
              <StatCard key={c.key} card={c} active={filter===c.key} onClick={()=>setFilter(p=>p===c.key?null:c.key)}/>
            ))}
          </div>

          {/* ── Segment control + dropdown ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {/* Segmented control */}
            <div style={{
              display:'flex', alignItems:'center',
              background:'transparent', border:'1px solid #3A3D43',
              borderRadius:999, padding:3, gap:2,
            }}>
              {SEGMENTS.map(s => {
                const isA = segment === s.key;
                return (
                  <button key={s.key} onClick={() => setSegment(s.key)} style={{
                    height:38, padding:'0 20px', borderRadius:999, border:'none', cursor:'pointer',
                    fontSize:14, fontWeight:500, fontFamily:'var(--font-inter)', whiteSpace:'nowrap',
                    color: isA ? '#000' : '#C6CFE2',
                    background: isA ? '#00B24B' : 'transparent',
                    transition: 'background 0.15s, color 0.15s',
                  }}>
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Settings button */}
            <button style={{
              width:36, height:36, borderRadius:999, border:'1px solid #2E3035',
              background:'transparent', cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.7638 10.7228C16.8045 10.4176 16.8249 10.1023 16.8249 9.76653C16.8249 9.44098 16.8045 9.11543 16.7537 8.81023L18.8189 7.20282C19.002 7.06039 19.0529 6.7857 18.941 6.58224L16.9877 3.20464C16.8656 2.98083 16.6112 2.90961 16.3874 2.98083L13.956 3.95748C13.4473 3.57089 12.9081 3.24534 12.3079 3.00117L11.9416 0.417112C11.9009 0.172949 11.6975 0 11.4533 0H7.54668C7.30252 0 7.10922 0.172949 7.06853 0.417112L6.70228 3.00117C6.10205 3.24534 5.55268 3.58106 5.05418 3.95748L2.62272 2.98083C2.3989 2.89944 2.14457 2.98083 2.02249 3.20464L0.0793534 6.58224C-0.0427282 6.79588 -0.00203446 7.06039 0.201435 7.20282L2.26665 8.81023C2.21578 9.11543 2.17509 9.45115 2.17509 9.76653C2.17509 10.0819 2.19544 10.4176 2.2463 10.7228L0.181088 12.3302C-0.00203444 12.4727 -0.0529017 12.7474 0.0590065 12.9508L2.01231 16.3284C2.13439 16.5522 2.38873 16.6235 2.61255 16.5522L5.04401 15.5756C5.55268 15.9622 6.09187 16.2877 6.69211 16.5319L7.05835 19.116C7.10922 19.3601 7.30252 19.5331 7.54668 19.5331H11.4533C11.6975 19.5331 11.9009 19.3601 11.9314 19.116L12.2977 16.5319C12.8979 16.2877 13.4473 15.9622 13.9458 15.5756L16.3773 16.5522C16.6011 16.6336 16.8554 16.5522 16.9775 16.3284L18.9308 12.9508C19.0529 12.727 19.002 12.4727 18.8087 12.3302L16.7638 10.7228ZM9.49999 13.429C7.48564 13.429 5.83754 11.7809 5.83754 9.76653C5.83754 7.75219 7.48564 6.10408 9.49999 6.10408C11.5143 6.10408 13.1624 7.75219 13.1624 9.76653C13.1624 11.7809 11.5143 13.429 9.49999 13.429Z" fill="#AAAAAB"/>
              </svg>
            </button>

          </div>


          {/* ── Table ── */}
          <Table filter={filter} typeFilter={typeFilter}/>

        </div>
      </div>
    </>
  );
}
