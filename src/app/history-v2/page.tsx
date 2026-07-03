'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS  (sourced from Figma file 99YBeHB2jTuingVknzny2u)
══════════════════════════════════════════════════════════════ */
const T = {
  bg:          '#000000',
  surface:     '#1B1B1B',
  surface2:    '#21222C',
  btn:         '#3A3D43',
  border:      'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  text:        '#FAFAFA',
  textMuted:   '#AAAAAB',
  textDim:     '#858585',
  blue:        '#1381FF',
  green:       '#00D95B',
  greenAct:    '#00B24B',
  greenBadge:  '#6CB200',
  yellowBadge: '#D9A600',
  r: 8,
};

/* ══════════════════════════════════════════════════════════════
   TYPES & DATA
══════════════════════════════════════════════════════════════ */
type Category   = 'refused'|'removed'|'approved'|'onApproval'|'rehabPending'|'rehabilitated';
type ClientRole = 'payer'|'counterparty';

interface Op {
  id: number; status: string; category: Category;
  caseNum: string; caseType: string; date: string;
  pp: string; amount: string; opType: string;
  purpose: string; cp: string; inn: string; account: string; sig: 'Да'|'Нет';
  clientRole: ClientRole;
}

const OPS: Op[] = [
  {id:1,  status:'На согласовании',      category:'onApproval',   caseNum:'-114986', caseType:'Пост',         date:'—',          pp:'655556776', amount:'600 000,00 ₽',    opType:'Безналичная', purpose:'—',                         cp:'ООО Поставка',       inn:'987654321098', account:'40702810123450000345', sig:'Нет', clientRole:'payer'},
  {id:2,  status:'Согласована',          category:'approved',     caseNum:'-115283', caseType:'Онлайн',       date:'15.03.2026', pp:'554433',    amount:'1 200 000,00 ₽',  opType:'Безналичная', purpose:'Оплата по лизингу',         cp:'ООО Лизинг',         inn:'1122334455',   account:'40702810123450000789', sig:'Да',  clientRole:'payer'},
  {id:3,  status:'Новая',                category:'onApproval',   caseNum:'-115281', caseType:'Пост',         date:'—',          pp:'445566',    amount:'78 000,00 ₽',     opType:'Безналичная', purpose:'Хозяйственные расходы',     cp:'ООО ХозТорг',        inn:'1234567890',   account:'40702810123450000678', sig:'Да',  clientRole:'payer'},
  {id:4,  status:'На реабилитации',      category:'rehabPending', caseNum:'-115282', caseType:'Реабилитация', date:'—',          pp:'778899',    amount:'250 000,00 ₽',    opType:'Безналичная', purpose:'Аванс по договору',         cp:'ООО Поставка',       inn:'9876543210',   account:'40702810123450000345', sig:'Да',  clientRole:'payer'},
  {id:5,  status:'На реабилитации',      category:'rehabPending', caseNum:'-1885',   caseType:'Реабилитация', date:'—',          pp:'776633',    amount:'150 000,00 ₽',    opType:'Безналичная', purpose:'Авансовый платеж',          cp:'ООО ТехноСнаб',      inn:'2233445566',   account:'40702810123450001234', sig:'Да',  clientRole:'payer'},
  {id:6,  status:'Отказ в реабилитации', category:'refused',      caseNum:'-1884',   caseType:'Реабилитация', date:'19.03.2026', pp:'998844',    amount:'670 000,00 ₽',    opType:'Безналичная', purpose:'Поставка ТМЦ',              cp:'ООО ТоргПоставка',  inn:'3344556677',   account:'40702810123450001123', sig:'Да',  clientRole:'payer'},
  {id:7,  status:'Реабилитировано',      category:'rehabilitated',caseNum:'-1883',   caseType:'Реабилитация', date:'18.03.2026', pp:'887766',    amount:'230 000,00 ₽',    opType:'Безналичная', purpose:'Оплата услуг',              cp:'ООО СервисПлюс',    inn:'4455667788',   account:'40702810123450001012', sig:'Да',  clientRole:'payer'},
  {id:8,  status:'Отказана',             category:'refused',      caseNum:'-115285', caseType:'Онлайн',       date:'17.03.2026', pp:'776655',    amount:'890 000,00 ₽',    opType:'Безналичная', purpose:'Оплата по договору',        cp:'ООО СтройМаркет',   inn:'6677889900',   account:'40702810123450000901', sig:'Да',  clientRole:'payer'},
  {id:9,  status:'Отказ в реабилитации', category:'refused',      caseNum:'-115280', caseType:'Онлайн',       date:'16.03.2026', pp:'112233',    amount:'350 000,00 ₽',    opType:'Безналичная', purpose:'Консультационные услуги',   cp:'ООО КонсалтПлюс',   inn:'9900112233',   account:'40702810123450000567', sig:'Да',  clientRole:'payer'},
  {id:10, status:'Отказ в реабилитации', category:'refused',      caseNum:'-1882',   caseType:'Реабилитация', date:'14.03.2026', pp:'990011',    amount:'450 000,00 ₽',    opType:'ВЭД',         purpose:'Импорт товаров',            cp:'ChinaTrade Ltd',     inn:'—',            account:'—',                   sig:'Нет', clientRole:'payer'},
  {id:11, status:'Отказана',             category:'refused',      caseNum:'-115279', caseType:'Пост',         date:'13.03.2026', pp:'443322',    amount:'300 000,00 ₽',    opType:'Безналичная', purpose:'Аренда оборудования',       cp:'ООО РентАвто',       inn:'5544332211',   account:'40702810123450001300', sig:'Да',  clientRole:'payer'},
  {id:12, status:'На расследовании',     category:'onApproval',   caseNum:'-115277', caseType:'Онлайн',       date:'—',          pp:'110099',    amount:'750 000,00 ₽',    opType:'Безналичная', purpose:'Сделки с ц/б',              cp:'ООО Инвест',         inn:'2211009988',   account:'40702810123450001400', sig:'Да',  clientRole:'payer'},
  {id:13, status:'Отказана',             category:'refused',      caseNum:'-1881',   caseType:'Реабилитация', date:'11.03.2026', pp:'221100',    amount:'180 000,00 ₽',    opType:'Безналичная', purpose:'Транспортные расходы',      cp:'ООО Логистик',       inn:'3322110099',   account:'—',                   sig:'Нет', clientRole:'payer'},
  {id:14, status:'На расследовании',     category:'onApproval',   caseNum:'-115278', caseType:'Пост',         date:'—',          pp:'332211',    amount:'500 000,00 ₽',    opType:'Безналичная', purpose:'Оплата работ',              cp:'ООО СтройПро',       inn:'4433221100',   account:'40702810123450001500', sig:'Да',  clientRole:'payer'},
  {id:15, status:'Отказана',             category:'refused',      caseNum:'-115276', caseType:'Пост',         date:'10.03.2026', pp:'998877',    amount:'420 000,00 ₽',    opType:'Безналичная', purpose:'Прочие расходы',            cp:'ООО Прочее',         inn:'1100998877',   account:'40702810123450001600', sig:'Нет', clientRole:'payer'},
  {id:16, status:'Отозвана',             category:'removed',      caseNum:'-115270', caseType:'Пост',         date:'09.03.2026', pp:'332200',    amount:'190 000,00 ₽',    opType:'Безналичная', purpose:'Аренда оборудования',       cp:'ООО РентАвто',       inn:'5544332211',   account:'40702810123450001300', sig:'Нет', clientRole:'payer'},
  {id:17, status:'Удалена',              category:'removed',      caseNum:'-115268', caseType:'Онлайн',       date:'08.03.2026', pp:'110077',    amount:'75 000,00 ₽',     opType:'Безналичная', purpose:'Сделки с ц/б',              cp:'ООО Инвест',         inn:'2211009988',   account:'40702810123450001400', sig:'Нет', clientRole:'payer'},
  {id:18, status:'Согласована',          category:'approved',     caseNum:'-115300', caseType:'Онлайн',       date:'20.03.2026', pp:'123456',    amount:'500 000,00 ₽',    opType:'Безналичная', purpose:'Оплата по договору',        cp:'ООО Наташина Радость',inn:'8848116085', account:'40817273453453453543', sig:'Да',  clientRole:'counterparty'},
  {id:19, status:'Отказана',             category:'refused',      caseNum:'-115301', caseType:'Онлайн',       date:'21.03.2026', pp:'234567',    amount:'320 000,00 ₽',    opType:'Безналичная', purpose:'Аванс по контракту',        cp:'ООО Наташина Радость',inn:'8848116085', account:'40817273453453453543', sig:'Да',  clientRole:'counterparty'},
  {id:20, status:'Реабилитировано',      category:'rehabilitated',caseNum:'-1006',   caseType:'Реабилитация', date:'22.03.2026', pp:'345678',    amount:'180 000,00 ₽',    opType:'Безналичная', purpose:'Возврат переплаты',         cp:'ООО Наташина Радость',inn:'8848116085', account:'40817273453453453543', sig:'Да',  clientRole:'counterparty'},
  {id:21, status:'На согласовании',      category:'onApproval',   caseNum:'-115302', caseType:'Онлайн',       date:'—',          pp:'456789',    amount:'950 000,00 ₽',    opType:'Безналичная', purpose:'Расчеты по договору',       cp:'ООО Наташина Радость',inn:'8848116085', account:'40817273453453453543', sig:'Да',  clientRole:'counterparty'},
];

const CAT_CFG = [
  { key:'refused'       as Category, label:'Отказанные',       color:'#DC3535', rgb:'220,53,53'   },
  { key:'removed'       as Category, label:'Отозвано/Удалено', color:'#858585', rgb:'133,133,133' },
  { key:'approved'      as Category, label:'Согласованные',    color:'#00B24B', rgb:'0,178,75'    },
  { key:'onApproval'    as Category, label:'На согласовании',  color:'#D9A600', rgb:'217,166,0'   },
  { key:'rehabPending'  as Category, label:'На реабилитации',  color:'#F59E0B', rgb:'245,158,11'  },
  { key:'rehabilitated' as Category, label:'Реабилитированные',color:'#1381FF', rgb:'19,129,255'  },
] as const;

/* ══════════════════════════════════════════════════════════════
   STATUS BADGE CONFIG  (matched to Figma badge colors)
══════════════════════════════════════════════════════════════ */
const SB: Record<string, { bg: string; color: string; dot: string }> = {
  'На согласовании':      { bg:'rgba(217,166,0,0.18)',  color:'#D9A600', dot:'#D9A600' },
  'Согласована':          { bg:'rgba(19,129,255,0.18)', color:'#1381FF', dot:'#1381FF' },
  'Новая':                { bg:'rgba(108,178,0,0.18)',  color:'#6CB200', dot:'#6CB200' },
  'На реабилитации':      { bg:'rgba(217,166,0,0.18)',  color:'#D9A600', dot:'#D9A600' },
  'Реабилитировано':      { bg:'rgba(0,178,75,0.18)',   color:'#00B24B', dot:'#00B24B' },
  'Отказ в реабилитации': { bg:'rgba(220,53,53,0.18)',  color:'#DC3535', dot:'#DC3535' },
  'Отказана':             { bg:'rgba(220,53,53,0.18)',  color:'#DC3535', dot:'#DC3535' },
  'На расследовании':     { bg:'rgba(217,166,0,0.18)',  color:'#D9A600', dot:'#D9A600' },
  'Отозвана':             { bg:'rgba(133,133,133,0.18)',color:'#858585', dot:'#858585' },
  'Удалена':              { bg:'rgba(133,133,133,0.18)',color:'#858585', dot:'#858585' },
};

/* ══════════════════════════════════════════════════════════════
   MINI CHART — AreaChart (один тип для всех 6 карточек)
══════════════════════════════════════════════════════════════ */
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

  if (amounts.length === 0) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:T.textDim,fontSize:12,fontFamily:'var(--font-inter)'}}>
        Нет дат
      </div>
    );
  }

  if (amounts.length === 1) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:6}}>
        <div style={{width:10,height:10,borderRadius:'50%',background:color,boxShadow:`0 0 10px ${color}`}}/>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontFamily:'var(--font-inter)'}}>{dated[0].date}</span>
        <span style={{fontSize:14,fontWeight:600,color,fontFamily:'var(--font-inter)'}}>{fmt(amounts[0])}</span>
      </div>
    );
  }

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
      {tip && (() => {
        const [datePart, amtPart] = tip.label.split('\n');
        const tw = 72, th = 28, tx = Math.min(Math.max(tip.x - tw/2, 2), W - tw - 2);
        const ty = tip.y > 36 ? tip.y - th - 6 : tip.y + 8;
        return (
          <g style={{pointerEvents:'none'}}>
            <rect x={tx} y={ty} width={tw} height={th} rx={5} fill="rgba(30,31,36,0.95)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
            <text x={tx+tw/2} y={ty+10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5.5" fontFamily="Inter">{datePart}</text>
            <text x={tx+tw/2} y={ty+21} textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="600" fontFamily="Inter">{amtPart}</text>
          </g>
        );
      })()}
    </svg>
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
        const env = Math.pow(Math.sin(Math.PI * i / d.length), 0.6);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
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
   STAT CARD  (flip on hover — AreaChart на обороте)
══════════════════════════════════════════════════════════════ */
function StatCard({ cfg, ops, allOps, active, onClick }: {
  cfg: typeof CAT_CFG[number]; ops: Op[]; allOps: Op[]; active: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const { label, color, rgb } = cfg;
  const count = ops.length;
  const total = allOps.length || 1;
  const pct   = Math.round((count / total) * 100);

  const lastDate = ops
    .filter(o => o.date !== '—')
    .map(o => o.date)
    .sort()
    .slice(-1)[0];

  const border = active
    ? `1px solid rgba(${rgb},0.45)`
    : `1px solid rgba(255,255,255,0.10)`;

  return (
    <button
      onClick={() => { playWhoosh(); onClick(); }}
      onMouseEnter={() => { setHovered(true); setAnimKey(k => k+1); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:'relative', textAlign:'left', border, borderRadius:28,
        background:`linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.04) 42%, rgba(255,255,255,0.02) 100%)`,
        width:'100%', outline:'none', cursor: active ? 'default' : 'pointer',
        overflow:'hidden', display:'block',
        transition:'border-color 150ms ease', perspective:900,
      }}
    >
      <div style={{
        position:'relative', width:'100%', height:'100%',
        transformStyle:'preserve-3d',
        transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition:'transform 650ms cubic-bezier(0.45,0,0.15,1)',
      }}>

        {/* ── FRONT ── */}
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
            {lastDate && (
              <span style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>Последняя: {lastDate}</span>
            )}
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position:'absolute', inset:0,
          backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          transform:'rotateY(180deg)', padding:0,
          display:'flex', flexDirection:'column',
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 16px 6px',
          }}>
            <span style={{fontSize:12,fontWeight:500,color:T.textMuted,fontFamily:'var(--font-inter)'}}>{label}</span>
            <span className="anim-num" style={{fontSize:13,fontWeight:700,color,fontFamily:'var(--font-inter)'}}>{count} · {pct}%</span>
          </div>
          <div key={animKey} style={{flex:1,minHeight:0}}>
            <AreaChart ops={ops} color={color}/>
          </div>
        </div>

      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALL-OPS BAR  (6 категорий)
══════════════════════════════════════════════════════════════ */
function AllOpsBar({ ops, isActive, onSelect }: { ops: Op[]; isActive: boolean; onSelect: () => void }) {
  const [animKey, setAnimKey] = useState(0);
  const total = ops.length;

  return (
    <button
      onClick={onSelect}
      className="all-ops-bar"
      onMouseEnter={() => { if (!isActive) setAnimKey(k => k+1); }}
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
      <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0,minWidth:120}}>
        <span style={{fontSize:13,fontWeight:500,color:T.textMuted,fontFamily:'var(--font-inter)'}}>Все операции</span>
        <span style={{fontSize:42,fontWeight:300,lineHeight:1,letterSpacing:'-0.03em',color:'#fff',fontFamily:'var(--font-inter)'}}>
          {total}
        </span>
      </div>

      <div key={animKey} style={{flex:1,display:'flex',flexDirection:'column',gap:8,alignSelf:'center'}}>
        <div style={{height:8,borderRadius:999,overflow:'hidden',display:'flex',gap:2}}>
          {CAT_CFG.map((c, i) => {
            const pct = total > 0 ? (ops.filter(o => o.category === c.key).length / total) * 100 : 0;
            return (
              <div key={c.key} style={{width:`${pct}%`,height:'100%',overflow:'hidden',flexShrink:0,borderRadius:999}}>
                <div style={{
                  width:'100%',height:'100%',background:c.color,
                  animation:`seg-grow 600ms cubic-bezier(0.25,1,0.5,1) ${i*100}ms both`,
                }}/>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:0}}>
          {CAT_CFG.map((c, i) => {
            const cnt = ops.filter(o => o.category === c.key).length;
            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            return (
              <div key={c.key} style={{width:`${pct}%`,minWidth:0,overflow:'hidden'}}>
                <span style={{
                  fontSize:11,fontWeight:500,color:c.color,
                  fontFamily:'var(--font-inter)',whiteSpace:'nowrap',
                  animation:`fade-up 300ms ease ${i*80+200}ms both`,
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
   STATUS BADGE
══════════════════════════════════════════════════════════════ */
function Badge({ status }: { status: string }) {
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
   TABLE  (с сортировкой + счёт контрагента)
══════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

type SortKey = 'status'|'caseNum'|'caseType'|'date'|'pp'|'amount'|'opType'|'cp'|'inn';

const COLS: { key: string; label: string; w: number; sortKey?: SortKey }[] = [
  { key:'status',  label:'Статус операции',    w:196, sortKey:'status'  },
  { key:'caseNum', label:'Номер кейса',        w:112, sortKey:'caseNum' },
  { key:'caseType',label:'Тип кейса',          w:112, sortKey:'caseType'},
  { key:'date',    label:'Дата решения',       w:118, sortKey:'date'    },
  { key:'pp',      label:'ПП №',               w:108, sortKey:'pp'      },
  { key:'amount',  label:'Сумма',              w:148, sortKey:'amount'  },
  { key:'opType',  label:'Тип операции',       w:114, sortKey:'opType'  },
  { key:'purpose', label:'Назначение платежа', w:194                    },
  { key:'cp',      label:'Контрагент',         w:156, sortKey:'cp'      },
  { key:'inn',     label:'ИНН контрагента',    w:134, sortKey:'inn'     },
  { key:'account', label:'Счёт контрагента',   w:180                    },
  { key:'sig',     label:'Значимость',         w:96                     },
] as const;

const STATUS_FLOW: Record<string, {label:string; color:string}[]> = {
  'Отказана':             [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'},{label:'Отказана',color:'#DC3535'}],
  'Отказ в реабилитации': [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'Реабилитация',color:'#D9A600'},{label:'Отказ',color:'#DC3535'}],
  'Согласована':          [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'},{label:'Согласована',color:'#1381FF'}],
  'На согласовании':      [{label:'Создан',color:'#555'},{label:'На согласовании',color:'#D9A600'}],
  'Новая':                [{label:'Создан',color:'#555'},{label:'Новая',color:'#00B24B'}],
  'На реабилитации':      [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'На реабилитации',color:'#D9A600'}],
  'Реабилитировано':      [{label:'Создан',color:'#555'},{label:'Отказана',color:'#DC3535'},{label:'Реабилитация',color:'#D9A600'},{label:'Реабилитировано',color:'#00B24B'}],
  'На расследовании':     [{label:'Создан',color:'#555'},{label:'На расследовании',color:'#D9A600'}],
  'Отозвана':             [{label:'Создан',color:'#555'},{label:'Отозвана',color:'#858585'}],
  'Удалена':              [{label:'Создан',color:'#555'},{label:'Удалена',color:'#858585'}],
};

function Table({ ops }: { ops: Op[] }) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [hovOp, setHovOp] = useState<Op|null>(null);
  const [tipPos, setTipPos] = useState({x:0,y:0});

  useEffect(() => { setPage(1); }, [ops]);

  const sorted = useMemo(() => {
    return [...ops].sort((a, b) => {
      const av = (a as unknown as Record<string,string>)[sortKey] ?? '';
      const bv = (b as unknown as Record<string,string>)[sortKey] ?? '';
      if (sortKey === 'amount') {
        const an = parseInt(a.amount.replace(/[^0-9]/g,''),10);
        const bn = parseInt(b.amount.replace(/[^0-9]/g,''),10);
        return sortDir === 'asc' ? an-bn : bn-an;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ops, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const cp = Math.min(page, totalPages);
  const visible = sorted.slice((cp-1)*PAGE_SIZE, cp*PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const thS: React.CSSProperties = {
    padding:'0 12px', textAlign:'left', fontSize:14, fontWeight:500,
    color:'#858585', whiteSpace:'nowrap', background:'#212226',
    fontFamily:'var(--font-inter)', userSelect:'none', height:60, cursor:'pointer',
  };
  const tdS: React.CSSProperties = {
    padding:'0 12px', fontSize:14, fontWeight:400,
    color:'#FFFFFF', fontFamily:'var(--font-inter)', height:44,
    background:'#212226',
  };

  return (
    <>
      <div className="table-scroll" style={{overflowX:'auto', borderRadius:12}}>
        <table style={{width:'100%',minWidth:1550,borderCollapse:'separate',borderSpacing:'1px',background:'#141415'}}>
          <thead>
            <tr>
              {COLS.map((c,i)=>(
                <th key={c.key} onClick={() => c.sortKey && handleSort(c.sortKey as SortKey)} style={{
                  ...thS, width:c.w, minWidth:c.w,
                  borderTopLeftRadius:  i===0 ? 12 : 0,
                  borderTopRightRadius: i===COLS.length-1 ? 12 : 0,
                  cursor: c.sortKey ? 'pointer' : 'default',
                }}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
                    {c.label}
                    {c.sortKey && (
                      <span style={{opacity:sortKey===c.sortKey?1:0.3,fontSize:12}}>
                        {sortKey===c.sortKey ? (sortDir==='asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    )}
                  </span>
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
                  const tipW=290,tipH=200;
                  const x=Math.min(e.clientX+12, window.innerWidth-tipW-8);
                  const y=e.clientY+tipH>window.innerHeight ? e.clientY-tipH-8 : e.clientY+16;
                  setTipPos({x,y}); setHovOp(o);
                }}
                onMouseMove={e=>{
                  const tipW=290,tipH=200;
                  const x=Math.min(e.clientX+12, window.innerWidth-tipW-8);
                  const y=e.clientY+tipH>window.innerHeight ? e.clientY-tipH-8 : e.clientY+16;
                  setTipPos({x,y});
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
                <td style={{...tdS,color:T.textMuted,maxWidth:194,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.purpose}</td>
                <td style={{...tdS,color:T.textMuted}}>{o.cp}</td>
                <td style={{...tdS,color:T.textDim,fontSize:13}}>{o.inn}</td>
                <td style={{...tdS,color:T.textDim,fontSize:12}}>{o.account}</td>
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
          <div className="row-timeline visible" style={{
            position:'fixed', left:tipPos.x, top:tipPos.y, zIndex:9999,
            background:'#1A1B1E', border:'1px solid rgba(255,255,255,0.10)',
            borderRadius:12, padding:'14px 16px', minWidth:280,
            boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-inter)',marginBottom:12,letterSpacing:'0.05em',textTransform:'uppercase'}}>
              История кейса {hovOp.caseNum}
            </div>
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
                <div>
                  <div style={{fontSize:13,fontWeight:i===steps.length-1?600:400,color:i===steps.length-1?'#fff':'rgba(255,255,255,0.45)',fontFamily:'var(--font-inter)'}}>
                    {s.label}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:'var(--font-inter)'}}>
                    {i===steps.length-1&&hovOp.date!=='—' ? hovOp.date : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Pagination */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,padding:'16px 0'}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={cp===1}
            style={{width:36,height:36,borderRadius:10,border:'none',cursor:cp===1?'default':'pointer',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',opacity:cp===1?0.25:1}}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M7.41 1.41L6 0L0 6L6 12L7.41 10.59L2.83 6L7.41 1.41Z" fill="white"/></svg>
          </button>
          {(()=>{
            const pages: (number|'...')[] = [];
            if (totalPages<=7) { for(let i=1;i<=totalPages;i++) pages.push(i); }
            else if (cp<=4) pages.push(1,2,3,4,5,'...',totalPages);
            else if (cp>=totalPages-3) pages.push(1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages);
            else pages.push(1,'...',cp-1,cp,cp+1,'...',totalPages);
            return pages.map((p,i)=> p==='...'
              ? <span key={`d${i}`} style={{width:36,height:36,borderRadius:10,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'#A4ACBB',fontFamily:'var(--font-inter)'}}>...</span>
              : <button key={p} onClick={()=>setPage(p as number)} style={{width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'var(--font-inter)',background:cp===p?'#00B24B':'transparent',color:'#fff'}}>{p}</button>
            );
          })()}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={cp===totalPages}
            style={{width:36,height:36,borderRadius:10,border:'none',cursor:cp===totalPages?'default':'pointer',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',opacity:cp===totalPages?0.25:1}}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M1.41 0L0 1.41L4.58 6L0 10.59L1.41 12L7.41 6L1.41 0Z" fill="white"/></svg>
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,height:44,borderRadius:16,overflow:'hidden',background:'#212226',border:'1px solid #2E3035'}}>
          <span style={{fontSize:14,fontWeight:500,color:'#AAAABB',fontFamily:'var(--font-inter)',padding:'0 8px 0 14px',whiteSpace:'nowrap'}}>
            Всего: <span style={{color:'#fff'}}>{sorted.length}</span>
          </span>
          <div style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="12" height="7.5" viewBox="0 0 8 5" fill="none"><path d="M7.06 0L4 3.05333L0.94 0L0 0.94L4 4.94L8 0.94L7.06 0Z" fill="white"/></svg>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
const NAV_ICONS = [
  <svg key="h" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  <svg key="p" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/></svg>,
  <svg key="g" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>,
  <svg key="s" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  <svg key="st" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0014 3h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.6.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  <svg key="l" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
];

function Sidebar() {
  return (
    <div style={{position:'fixed',left:0,top:0,bottom:0,width:92,zIndex:40,background:T.bg,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 0',gap:8}}>
      <div style={{width:44,height:44,borderRadius:999,background:'#3A3D43',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:4,flexShrink:0}}>
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 1L1 6l9 4.5L19 6 10 1zM1 14l9 5 9-5M1 10l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
      </div>
      {NAV_ICONS.slice(0,6).map((icon,i)=>(
        <div key={i} className="nav-item" style={{width:44,height:44,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#E3E3E3',background:i===2?'#3A3D43':'transparent'}}>{icon}</div>
      ))}
      <div style={{flex:1}}/>
      <div style={{width:44,height:44,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#E3E3E3'}}>{NAV_ICONS[6]}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOP BAR  (exact from v1 + role toggle)
══════════════════════════════════════════════════════════════ */
function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:6,padding:'0 12px',height:30,borderRadius:999,background:'#1D1E20',border:'1px solid #242528'}}>
      <span style={{fontSize:16,fontWeight:400,color:'#838894',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>{label}:</span>
      <span style={{fontSize:16,fontWeight:500,color:'#99C8FF',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>{value}</span>
    </div>
  );
}

function StatusChip({ label, bg, vb, paths }: { label:string; bg:string; vb:string; paths:string[] }) {
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'0 12px 0 0',height:36,borderRadius:999,border:'1px solid rgba(255,255,255,0.10)',background:'transparent'}}>
      <div style={{width:36,height:36,borderRadius:999,background:bg,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" style={{width:'67%',height:'67%',display:'block'}}>
          {paths.map((d,i)=><path key={i} d={d} fill="white"/>)}
        </svg>
      </div>
      <span style={{fontSize:16,fontWeight:500,color:T.text,fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>{label}</span>
    </div>
  );
}

const STATUS_CHIPS = [
  { label:'ЗСК',   bg:'#797F8B', vb:'0 0 28 28', paths:['M14 2.33334L4.66669 5.83334V12.9383C4.66669 18.83 8.64502 24.325 14 25.6667C19.355 24.325 23.3334 18.83 23.3334 12.9383V5.83334L14 2.33334ZM21 12.9383C21 17.605 18.025 21.9217 14 23.24C9.97502 21.9217 7.00002 17.6167 7.00002 12.9383V7.45501L14 4.83001L21 7.45501V12.9383Z','M12.8333 16.3333H15.1666V18.6667H12.8333V16.3333ZM12.8333 8.16666H15.1666V14H12.8333V8.16666Z'] },
  { label:'2RED',  bg:'#797F8B', vb:'0 0 24 24', paths:['M23 12L20.56 9.22001L20.9 5.54001L17.29 4.72001L15.4 1.54001L12 3.00001L8.6 1.54001L6.71 4.72001L3.1 5.53001L3.44 9.21001L1 12L3.44 14.78L3.1 18.47L6.71 19.29L8.6 22.47L12 21L15.4 22.46L17.29 19.28L20.9 18.46L20.56 14.78L23 12ZM18.49 14.11L18.75 16.9L16.01 17.52L14.58 19.93L12 18.82L9.42 19.93L7.99 17.52L5.25 16.9L5.51 14.1L3.66 12L5.51 9.88001L5.25 7.10001L7.99 6.49001L9.42 4.08001L12 5.18001L14.58 4.07001L16.01 6.48001L18.75 7.10001L18.49 9.89001L20.34 12L18.49 14.11ZM11 15H13V17H11V15ZM11 7.00001H13V13H11V7.00001Z'] },
  { label:'PB',    bg:'#797F8B', vb:'0 0 24 24', paths:['M20 7H16V5L14 3H10L8 5V7H4C2.9 7 2 7.9 2 9V14C2 14.75 2.4 15.38 3 15.73V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V15.72C21.59 15.37 22 14.73 22 14V9C22 7.9 21.1 7 20 7ZM10 5H14V7H10V5ZM4 9H20V14H15V11H9V14H4V9ZM13 15H11V13H13V15ZM19 19H5V16H9V17H15V16H19V19Z'] },
  { label:'VIP',   bg:'#797F8B', vb:'0 0 24 24', paths:['M19 3H5L2 9L12 21L22 9L19 3ZM9.62 8L11.12 5H12.88L14.38 8H9.62ZM11 10V16.68L5.44 10H11ZM13 10H18.56L13 16.68V10ZM19.26 8H16.61L15.11 5H17.76L19.26 8ZM6.24 5H8.89L7.39 8H4.74L6.24 5Z'] },
  { label:'HOT',   bg:'#797F8B', vb:'0 0 20 20', paths:['M13.3333 4.99999L12.9667 5.45832C12.6167 5.89166 12.15 6.08332 11.6833 6.08332C10.8333 6.08332 10 5.43332 10 4.41666V1.66666C10 1.66666 3.33334 4.99999 3.33334 10.8333C3.33334 14.5167 6.31668 17.5 10 17.5C13.6833 17.5 16.6667 14.5167 16.6667 10.8333C16.6667 8.36666 15.325 6.14999 13.3333 4.99999ZM10 15.8333C9.08334 15.8333 8.33334 15.1083 8.33334 14.2167C8.33334 13.7917 8.50001 13.3917 8.81668 13.0833L10 11.9167L11.1917 13.0833C11.5 13.3917 11.6667 13.7917 11.6667 14.2167C11.6667 15.1083 10.9167 15.8333 10 15.8333ZM13.3 14.5833C13.3333 14.2833 13.4833 13.0083 12.3583 11.9L10 9.58332L7.64168 11.9C6.50834 13.0167 6.66668 14.3 6.70001 14.5833C5.65834 13.6667 5.00001 12.325 5.00001 10.8333C5.00001 8.19999 6.77501 6.12499 8.35834 4.79166C8.55001 6.44999 9.96668 7.74999 11.6833 7.74999C12.3333 7.74999 12.9667 7.55832 13.5 7.19999C14.45 8.14999 15 9.45832 15 10.8333C15 12.325 14.3417 13.6667 13.3 14.5833Z'] },
];

function TopBar({ role, onRoleChange }: { role: ClientRole; onRoleChange: (r: ClientRole) => void }) {
  const CLI_TABS = ['КП','Список','Инфо','Числовая фактура','Операции','Выписка','КА','Заключение'];

  return (
    <div style={{background:T.bg}}>

      {/* Row 0 */}
      <div style={{display:'flex',alignItems:'center',height:40,padding:'0 0 0 14px'}}>
        <span style={{fontSize:12,fontWeight:400,color:'rgba(255,255,255,0.9)',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>
          Case Management Online
        </span>
        <div style={{flex:1}}/>
        <div style={{height:40,padding:'0 16px',display:'flex',alignItems:'center',fontSize:12,fontWeight:600,fontFamily:'var(--font-manrope)',color:'rgba(255,255,255,0.45)',borderLeft:`1px solid ${T.border}`,flexShrink:0}}>
          ID: 303202567
        </div>
      </div>

      {/* Row 1: tabs + controls */}
      <div style={{display:'flex',alignItems:'center',height:44,padding:'0 14px'}}>
        <div style={{display:'flex',flex:1,overflowX:'auto',gap:6}}>
          {CLI_TABS.map(t=>{
            const isActive = t==='Операции';
            return (
              <button key={t} style={{height:36,padding:'0 12px',cursor:'pointer',whiteSpace:'nowrap',fontSize:14,fontWeight:500,fontFamily:'var(--font-inter)',color:isActive?'#000':'rgba(255,255,255,0.55)',background:isActive?T.green:'transparent',border:isActive?'none':'1px solid #2E3035',borderRadius:999,flexShrink:0}}>{t}</button>
            );
          })}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:12}}>
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px 4px 4px',height:36,borderRadius:999,background:'rgba(25,40,17,1)'}}>
            <div style={{width:28,height:28,borderRadius:999,background:T.greenBadge,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span className="flame-icon" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
              </span>
            </div>
            <span style={{fontSize:11,color:'rgba(154,161,177,1)',fontFamily:'var(--font-inter)'}}>:</span>
            <span style={{fontSize:14,fontWeight:500,color:'#fff',fontFamily:'var(--font-inter)',letterSpacing:'0.02em'}}>23:59:59</span>
          </div>
          <button style={{padding:'0 14px',height:40,borderRadius:999,border:'none',cursor:'pointer',fontSize:14,fontWeight:500,fontFamily:'var(--font-inter)',background:T.btn,color:T.text,display:'flex',alignItems:'center',gap:8}}>
            <svg viewBox="0 0 20 20" fill="none" width="24" height="24"><path d="M7 14H9V6H7V14ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM11 14H13V6H11V14Z" fill="#E3E3E3"/></svg>
            Отложить задачу
          </button>
          <button style={{width:40,height:40,borderRadius:999,border:'none',cursor:'pointer',background:T.greenAct,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>
      </div>

      {/* Head container */}
      <div style={{margin:'8px 24px 0',borderRadius:28,border:'1px solid rgba(255,255,255,0.10)',background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(4,38,1,0.50) 100%)',overflow:'hidden'}}>

        {/* Row 2: client info */}
        <div style={{padding:'24px 24px 0 24px'}}>
          <div style={{fontSize:36,fontWeight:400,color:T.text,fontFamily:'var(--font-inter)',lineHeight:1.1,letterSpacing:'-0.02em',marginBottom:12}}>ООО &quot;НАТАШИНА РАДОСТЬ&quot;</div>
          <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
            <InfoChip label="ИНН" value="303202567"/>
            <InfoChip label="Тип клиента" value="ФЛ"/>
            <InfoChip label="Запрос документов" value="ДА"/>
            <InfoChip label="Начало периода" value="09.01.2026"/>
            <InfoChip label="Конец периода" value="09.10.2026"/>
          </div>
        </div>

        {/* Row 3: Role toggle + Профиль */}
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'20px 24px 24px 24px',overflowX:'auto'}}>

          {/* Role toggle */}
          <div style={{display:'flex',alignItems:'center',gap:0,borderRadius:999,border:`1px solid rgba(255,255,255,0.12)`,overflow:'hidden',flexShrink:0}}>
            {(['payer','counterparty'] as ClientRole[]).map(r=>(
              <button key={r} onClick={()=>onRoleChange(r)} style={{
                padding:'0 20px',height:36,border:'none',cursor:'pointer',
                fontSize:14,fontWeight:role===r?600:400,fontFamily:'var(--font-inter)',
                background:role===r ? T.greenAct : 'transparent',
                color:role===r ? '#000' : T.textMuted,
                transition:'background 150ms, color 150ms',
                flexShrink:0,
              }}>
                {r==='payer' ? 'Клиент' : 'Контрагент'}
              </button>
            ))}
          </div>

          <div style={{flex:1}}/>

          <button style={{padding:'0 14px',height:36,borderRadius:999,border:`1px solid ${T.border}`,cursor:'pointer',fontSize:14,fontWeight:500,background:'transparent',color:T.textMuted,fontFamily:'var(--font-inter)',flexShrink:0,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:8}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.325 12.1333C13.925 11.4167 12.1083 10.8333 9.99998 10.8333C7.89165 10.8333 6.07498 11.4167 4.67498 12.1333C3.84165 12.5583 3.33331 13.4167 3.33331 14.35V16.6667H16.6666V14.35C16.6666 13.4167 16.1583 12.5583 15.325 12.1333ZM15 15H4.99998V14.35C4.99998 14.0333 5.16665 13.75 5.43331 13.6167C6.42498 13.1083 8.02498 12.5 9.99998 12.5C11.975 12.5 13.575 13.1083 14.5666 13.6167C14.8333 13.75 15 14.0333 15 14.35V15ZM8.14998 10H11.85C12.8583 10 13.6333 9.11668 13.5 8.11668L13.2333 6.07501C12.975 4.49168 11.6 3.33334 9.99998 3.33334C8.39998 3.33334 7.02498 4.49168 6.76665 6.07501L6.49998 8.11668C6.36665 9.11668 7.14165 10 8.14998 10ZM8.41665 6.32501C8.54998 5.55834 9.21665 5.00001 9.99998 5.00001C10.7833 5.00001 11.45 5.55834 11.5833 6.32501L11.85 8.33334H8.14998L8.41665 6.32501Z" fill="#F6F6F6"/></svg>
            Профиль клиента
          </button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FIGMA DROPDOWN
══════════════════════════════════════════════════════════════ */
function FigmaDropdown({ value, onChange, options }: { value:string; onChange:(v:string)=>void; options:{value:string;label:string}[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o=>o.value===value);

  useEffect(()=>{
    function handler(e: MouseEvent) { if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return ()=>document.removeEventListener('mousedown', handler);
  },[]);

  return (
    <div ref={ref} style={{position:'relative',flexShrink:0}}>
      <div onClick={()=>setOpen(p=>!p)} style={{
        display:'flex', alignItems:'center', gap:6,
        height:44, borderRadius:999, padding:'0 16px',
        cursor:'pointer', background:'transparent',
        border:'1px solid #3A3D43', userSelect:'none',
      }}>
        <span style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,0.55)',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>
          {selected?.label ?? 'Выбрать'}
        </span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none"
          style={{transform:open?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.15s',flexShrink:0}}>
          <path d="M7.06 0L4 3.05333L0.94 0L0 0.94L4 4.94L8 0.94L7.06 0Z" fill="rgba(255,255,255,0.55)"/>
        </svg>
      </div>
      {open && (
        <div style={{position:'absolute',top:40,left:0,zIndex:999,background:'#1B1B1B',border:'1px solid #2E3035',borderRadius:12,overflow:'hidden',minWidth:'100%',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
          {options.map(o=>(
            <div key={o.value} onClick={()=>{onChange(o.value);setOpen(false);}}
              style={{padding:'8px 16px',fontSize:14,fontWeight:500,color:o.value===value?'#fff':'rgba(255,255,255,0.55)',background:o.value===value?'rgba(255,255,255,0.06)':'transparent',cursor:'pointer',fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}
              onMouseLeave={e=>(e.currentTarget.style.background=o.value===value?'rgba(255,255,255,0.06)':'transparent')}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function HistoryV2Page() {
  const [role, setRole]         = useState<ClientRole>('payer');
  const [catFilter, setCat]     = useState<Category|null>(null);
  const [typeFilter, setType]   = useState('all');
  const [segment, setSegment]   = useState<'post'|'online'|'rehab'>('post');
  const [showAdv, setShowAdv]   = useState(false);

  /* Расширенные фильтры */
  const [advInn,  setAdvInn]    = useState('');
  const [advCp,   setAdvCp]     = useState('');
  const [advAcc,  setAdvAcc]    = useState('');
  const [advAmtF, setAdvAmtF]   = useState('');
  const [advAmtT, setAdvAmtT]   = useState('');
  const [advDateF,setAdvDateF]  = useState('');
  const [advDateT,setAdvDateT]  = useState('');

  const roleOps = useMemo(()=>OPS.filter(o=>o.clientRole===role), [role]);
  const segBaseOps = useMemo(()=>{
    const sc: Record<string,string|null> = { post: 'Пост', online: 'Онлайн', rehab: 'Реабилитация' };
    const s = sc[segment];
    return s ? roleOps.filter(o=>o.caseType===s) : roleOps;
  },[roleOps, segment]);

  const caseTypes = useMemo(()=>['all',...Array.from(new Set(segBaseOps.map(o=>o.caseType)))],[segBaseOps]);

  const SEGMENTS = [
    { key:'post'   as const, label:'Пост'   },
    { key:'online' as const, label:'Онлайн' },
    { key:'rehab'  as const, label:'Реабилитация' },
  ];

  const advActive = [advInn,advCp,advAcc,advAmtF,advAmtT,advDateF,advDateT].some(v=>v!=='');

  const SEG_CASE: Record<string,string|null> = { post: 'Пост', online: 'Онлайн', rehab: 'Реабилитация' };

  const filteredOps = useMemo(()=>{
    let d = roleOps;
    const sc = SEG_CASE[segment];
    if (sc)                 d = d.filter(o=>o.caseType===sc);
    if (catFilter)          d = d.filter(o=>o.category===catFilter);
    if (typeFilter!=='all') d = d.filter(o=>o.caseType===typeFilter);
    if (advInn)             d = d.filter(o=>o.inn.includes(advInn));
    if (advCp)              d = d.filter(o=>o.cp.toLowerCase().includes(advCp.toLowerCase()));
    if (advAcc)             d = d.filter(o=>o.account.includes(advAcc));
    if (advAmtF) {
      const n = parseInt(advAmtF.replace(/[^0-9]/g,''),10);
      if (!isNaN(n)) d = d.filter(o=>parseInt(o.amount.replace(/[^0-9]/g,''),10)>=n);
    }
    if (advAmtT) {
      const n = parseInt(advAmtT.replace(/[^0-9]/g,''),10);
      if (!isNaN(n)) d = d.filter(o=>parseInt(o.amount.replace(/[^0-9]/g,''),10)<=n);
    }
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[roleOps, segment, catFilter, typeFilter, advInn, advCp, advAcc, advAmtF, advAmtT]);

  function resetAll() {
    setCat(null); setType('all');
    setAdvInn(''); setAdvCp(''); setAdvAcc('');
    setAdvAmtF(''); setAdvAmtT(''); setAdvDateF(''); setAdvDateT('');
  }

  const activeLabels: string[] = [];
  if (catFilter)          activeLabels.push(CAT_CFG.find(c=>c.key===catFilter)?.label ?? catFilter);
  if (typeFilter!=='all') activeLabels.push(typeFilter);
  if (advActive)          activeLabels.push('доп. фильтры');

  const inpS: React.CSSProperties = {
    background:'#1D1E20', border:'1px solid rgba(255,255,255,0.08)',
    color:T.text, padding:'0 10px', borderRadius:8, fontSize:13,
    fontFamily:'var(--font-inter)', outline:'none', height:34, minWidth:0,
  };

  return (
    <>
      <Sidebar/>

      <div style={{marginLeft:92, minHeight:'100vh', background:T.bg}}>
        <TopBar role={role} onRoleChange={r=>{ setRole(r); setCat(null); }}/>
        <div style={{padding:'18px 24px 48px', display:'flex', flexDirection:'column', gap:18}}>

          {/* All-ops bar */}
          <AllOpsBar ops={roleOps} isActive={catFilter===null&&!advActive} onSelect={resetAll}/>

          {/* 6 Stat cards — 1 row */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14, alignItems:'stretch'}}>
            {CAT_CFG.map(cfg=>(
              <StatCard
                key={cfg.key} cfg={cfg}
                ops={roleOps.filter(o=>o.category===cfg.key)}
                allOps={roleOps}
                active={catFilter===cfg.key}
                onClick={()=>setCat(p=>p===cfg.key?null:cfg.key)}
              />
            ))}
          </div>

          {/* ── Controls row ── */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>

            {/* Left: Segment control */}
            <div style={{display:'flex',alignItems:'center',background:'transparent',border:'1px solid #3A3D43',borderRadius:999,padding:3,gap:2}}>
              {SEGMENTS.map(s=>{
                const isA = segment===s.key;
                return (
                  <button key={s.key} onClick={()=>{ setSegment(s.key); setType('all'); setCat(null); }} style={{
                    height:38,padding:'0 20px',borderRadius:999,border:'none',cursor:'pointer',
                    fontSize:14,fontWeight:500,fontFamily:'var(--font-inter)',whiteSpace:'nowrap',
                    color:isA?'#000':'#C6CFE2',
                    background:isA?'#00B24B':'transparent',
                    transition:'background 0.15s, color 0.15s',
                  }}>{s.label}</button>
                );
              })}
            </div>

            {/* Middle: case type dropdown */}
            <FigmaDropdown
              value={typeFilter}
              onChange={v=>{setType(v);}}
              options={caseTypes.map(t=>({value:t,label:t==='all'?'Все типы':t}))}
            />

            <div style={{flex:1}}/>

            {/* Расширенные фильтры toggle */}
            <button onClick={()=>setShowAdv(p=>!p)} style={{
              display:'flex',alignItems:'center',gap:6,
              padding:'0 16px',height:36,borderRadius:999,border:`1px solid ${showAdv?T.greenAct:T.border}`,
              cursor:'pointer',fontSize:14,fontWeight:500,fontFamily:'var(--font-inter)',
              background: showAdv?'rgba(0,178,75,0.10)':'transparent',
              color:showAdv?T.greenAct:T.textMuted,
              transition:'all 150ms',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Фильтры
              {advActive && <span style={{fontSize:11,fontWeight:700,color:'#000',background:T.greenAct,borderRadius:999,padding:'0 6px',marginLeft:2}}>{[advInn,advCp,advAcc,advAmtF,advAmtT,advDateF,advDateT].filter(v=>v!=='').length}</span>}
            </button>

            {/* Settings */}
            <button style={{width:36,height:36,borderRadius:999,border:'1px solid #2E3035',background:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="24" height="24" viewBox="0 0 19 20" fill="none"><path d="M16.7638 10.7228C16.8045 10.4176 16.8249 10.1023 16.8249 9.76653C16.8249 9.44098 16.8045 9.11543 16.7537 8.81023L18.8189 7.20282C19.002 7.06039 19.0529 6.7857 18.941 6.58224L16.9877 3.20464C16.8656 2.98083 16.6112 2.90961 16.3874 2.98083L13.956 3.95748C13.4473 3.57089 12.9081 3.24534 12.3079 3.00117L11.9416 0.417112C11.9009 0.172949 11.6975 0 11.4533 0H7.54668C7.30252 0 7.10922 0.172949 7.06853 0.417112L6.70228 3.00117C6.10205 3.24534 5.55268 3.58106 5.05418 3.95748L2.62272 2.98083C2.3989 2.89944 2.14457 2.98083 2.02249 3.20464L0.0793534 6.58224C-0.0427282 6.79588 -0.00203446 7.06039 0.201435 7.20282L2.26665 8.81023C2.21578 9.11543 2.17509 9.45115 2.17509 9.76653C2.17509 10.0819 2.19544 10.4176 2.2463 10.7228L0.181088 12.3302C-0.00203444 12.4727 -0.0529017 12.7474 0.0590065 12.9508L2.01231 16.3284C2.13439 16.5522 2.38873 16.6235 2.61255 16.5522L5.04401 15.5756C5.55268 15.9622 6.09187 16.2877 6.69211 16.5319L7.05835 19.116C7.10922 19.3601 7.30252 19.5331 7.54668 19.5331H11.4533C11.6975 19.5331 11.9009 19.3601 11.9314 19.116L12.2977 16.5319C12.8979 16.2877 13.4473 15.9622 13.9458 15.5756L16.3773 16.5522C16.6011 16.6336 16.8554 16.5522 16.9775 16.3284L18.9308 12.9508C19.0529 12.727 19.002 12.4727 18.8087 12.3302L16.7638 10.7228ZM9.49999 13.429C7.48564 13.429 5.83754 11.7809 5.83754 9.76653C5.83754 7.75219 7.48564 6.10408 9.49999 6.10408C11.5143 6.10408 13.1624 7.75219 13.1624 9.76653C13.1624 11.7809 11.5143 13.429 9.49999 13.429Z" fill="#AAAAAB"/></svg>
            </button>
          </div>

          {/* ── Advanced filters panel ── */}
          {showAdv && (
            <div style={{padding:'16px 20px',borderRadius:16,border:`1px solid rgba(0,178,75,0.18)`,background:'rgba(0,178,75,0.04)',display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>ИНН контрагента</label>
                  <input style={inpS} value={advInn} onChange={e=>setAdvInn(e.target.value)} placeholder="10 или 12 цифр"/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>Наименование контрагента</label>
                  <input style={inpS} value={advCp} onChange={e=>setAdvCp(e.target.value)} placeholder="Введите название"/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>Счёт контрагента</label>
                  <input style={inpS} value={advAcc} onChange={e=>setAdvAcc(e.target.value)} placeholder="20 цифр"/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,alignItems:'flex-end'}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>Сумма от</label>
                  <input style={inpS} type="number" value={advAmtF} onChange={e=>setAdvAmtF(e.target.value)} placeholder="0 ₽"/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,color:T.textDim,fontFamily:'var(--font-inter)'}}>Сумма до</label>
                  <input style={inpS} type="number" value={advAmtT} onChange={e=>setAdvAmtT(e.target.value)} placeholder="∞ ₽"/>
                </div>
                <button onClick={()=>{setAdvInn('');setAdvCp('');setAdvAcc('');setAdvAmtF('');setAdvAmtT('');setAdvDateF('');setAdvDateT('');}} style={{height:34,padding:'0 16px',borderRadius:8,border:`1px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.textMuted,fontSize:13,fontFamily:'var(--font-inter)',whiteSpace:'nowrap'}}>
                  Сброс
                </button>
              </div>
            </div>
          )}

          {/* Active filter info bar */}
          {activeLabels.length > 0 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0'}}>
              <span style={{fontSize:12,color:T.textDim,fontFamily:'var(--font-inter)'}}>
                Фильтр: <span style={{color:T.textMuted}}>{activeLabels.join(' · ')}</span>
                <span style={{color:T.textDim}}> · {filteredOps.length} операций</span>
              </span>
              <button onClick={resetAll} style={{padding:'3px 10px',borderRadius:6,border:`1px solid ${T.border}`,background:'transparent',color:T.textMuted,fontSize:12,fontFamily:'var(--font-inter)',cursor:'pointer'}}>
                Сбросить все
              </button>
            </div>
          )}

          {/* Table */}
          <Table ops={filteredOps}/>

        </div>
      </div>
    </>
  );
}
