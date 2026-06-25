'use client';
import { useState } from 'react';

/* ── TYPES ── */
type Tab = 'accounts' | 'ops' | 'docs';

/* ── ICONS ── */
const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/* ── DATA ── */
const MODAL_ACCOUNTS = ['40702810-0012', '40702810-0087', '42301810-1145'];
const MODAL_OPS = [
  { num: '47589324', date: '02.04.2024', type: 'Валютная',  amount: '284 000 ₽' },
  { num: '47589325', date: '15.03.2024', type: 'Входящий',  amount: '1 420 000 ₽' },
  { num: '47589326', date: '28.02.2024', type: 'Исходящий', amount: '560 000 ₽' },
  { num: '47589327', date: '10.01.2024', type: 'Конверсия', amount: '890 000 ₽' },
  { num: '47589328', date: '05.01.2024', type: 'Входящий',  amount: '340 000 ₽' },
];
const MODAL_DOCS = [
  { name: 'Паспорт сделки 01/2024',       date: '15.01.2024', status: 'missing' },
  { name: 'Договор поставки №384',          date: '03.02.2024', status: 'ok'      },
  { name: 'Инвойс INV-2024-00112',          date: '22.02.2024', status: 'ok'      },
  { name: 'ГТД 10702070/020424/00',         date: '02.04.2024', status: 'pending' },
];
const DOC_STATUS: Record<string, { label: string; color: string }> = {
  ok:      { label: 'Получен',     color: '#22C55E' },
  missing: { label: 'Отсутствует', color: '#EF4444' },
  pending: { label: 'Ожидается',   color: '#F59E0B' },
};

/* ── FAKE TIMELINE BACKGROUND ── */
const YEARS  = [2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031];
const ROWS   = ['Пост-контроль','Онлайн-контроль','Вне процессов'];
type Dot = { row: number; year: number; bg: string; label: string; kind?: 'icon' };
const DOTS: Dot[] = [
  { row: 0, year: 2025, bg: '#3B82F6', label: '99+' },
  { row: 0, year: 2025, bg: '#4B5563', label: '📄', kind: 'icon' },
  { row: 0, year: 2026, bg: '#F59E0B', label: '97' },
  { row: 0, year: 2026, bg: '#EF4444', label: '5'  },
  { row: 0, year: 2026, bg: '#14B8A6', label: '18' },
  { row: 0, year: 2026, bg: '#22C55E', label: '2'  },
  { row: 1, year: 2026, bg: '#3B82F6', label: '15' },
  { row: 1, year: 2026, bg: '#4B5563', label: '?'  },
  { row: 1, year: 2026, bg: '#22C55E', label: '2'  },
  { row: 1, year: 2026, bg: '#EF4444', label: '13' },
  { row: 2, year: 2026, bg: '#EF4444', label: '2'  },
  { row: 2, year: 2026, bg: '#22C55E', label: '✓'  },
];

/* ── MODAL ── */
function RequestModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('accounts');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (s: string) => {
    navigator.clipboard.writeText(s).catch(() => {});
    setCopied(s);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width: 540, maxHeight: '90vh',
        background: '#181B1F',
        borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 22px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
            Запрос по ФЛ
          </span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 999, border: 'none',
            background: 'rgba(255,255,255,0.07)', color: '#888',
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Status */}
          <div style={{
            padding: '14px 22px',
            background: '#181B1F',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconCheck/>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E', fontFamily: 'var(--font-inter)' }}>
              Успешно
            </span>
          </div>

          {/* Doc deadline */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, color: '#5a5a5a', fontFamily: 'var(--font-inter)', marginBottom: 5, letterSpacing: '0.04em' }}>
              Срок документов
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
              15.07.2024
            </div>
          </div>

          {/* Comment */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, color: '#5a5a5a', fontFamily: 'var(--font-inter)', marginBottom: 8, letterSpacing: '0.04em' }}>
              Комментарий
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '12px 14px',
              fontSize: 13, color: '#C8CACC', lineHeight: 1.6,
              fontFamily: 'var(--font-inter)',
            }}>
              Пакет документов получен частично. Отсутствует паспорт сделки по валютной операции от 02.04.2024. Ожидаем до даты отсрочки.
            </div>
          </div>

          {/* Stat cards = tabs */}
          <div style={{ display: 'flex', padding: '12px 14px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'accounts' as Tab, label: 'Счета',     val: 10 },
              { id: 'ops'      as Tab, label: 'Операции',  val: 3  },
              { id: 'docs'     as Tab, label: 'Документы', val: 4  },
            ].map(s => {
              const active = tab === s.id;
              return (
                <button key={s.id} onClick={() => setTab(s.id)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 14,
                  background: active ? '#08A652' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? '#08A652' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 150ms',
                }}>
                  <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.75)' : '#555', fontFamily: 'var(--font-inter)', marginBottom: 5 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: active ? '#fff' : '#888', fontFamily: 'var(--font-manrope)', lineHeight: 1 }}>
                    {s.val}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding: '12px 22px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>

            {tab === 'accounts' && MODAL_ACCOUNTS.map(acc => (
              <div key={acc} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '11px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-inter)' }}>₽</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#60A5FA', fontFamily: 'var(--font-inter)', letterSpacing: '0.03em' }}>
                    {acc}
                  </span>
                </div>
                <button onClick={() => copy(acc)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6,
                  color: copied === acc ? '#22C55E' : '#444',
                  display: 'flex', alignItems: 'center', transition: 'color 150ms',
                }}>
                  {copied === acc ? '✓' : <IconCopy/>}
                </button>
              </div>
            ))}

            {tab === 'ops' && MODAL_OPS.map(op => (
              <div key={op.num} style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '11px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-inter)', marginBottom: 3 }}>
                    {op.date} · {op.type}
                  </div>
                  <div style={{ fontSize: 13, color: '#60A5FA', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
                    № {op.num}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
                  {op.amount}
                </div>
              </div>
            ))}

            {tab === 'docs' && MODAL_DOCS.map(doc => (
              <div key={doc.name} style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '11px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: '#444', flexShrink: 0 }}><IconDoc/></div>
                  <div>
                    <div style={{ fontSize: 13, color: '#D1D5DB', fontFamily: 'var(--font-inter)', fontWeight: 500, marginBottom: 2 }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-inter)' }}>
                      {doc.date}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  color: DOC_STATUS[doc.status].color, fontFamily: 'var(--font-inter)',
                }}>
                  {DOC_STATUS[doc.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function TimelinePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{
      height: '100vh', background: '#0A0A0A', overflow: 'hidden',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>

      {/* Header bar */}
      <div style={{
        background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52, flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
            Timeline
          </span>
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2 }}>
            {['Неделя','Месяц','Год'].map(v => (
              <button key={v} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none',
                background: v === 'Год' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: v === 'Год' ? '#FAFAFA' : '#555',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: v === 'Год' ? 600 : 400,
              }}>{v}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>‹</button>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>2026</span>
            <button style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>›</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#888', fontSize: 12, fontFamily: 'inherit',
          }}>
            <IconFilter/> Фильтры
            <span style={{ background: '#3B82F6', color: '#fff', borderRadius: 999, minWidth: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>3</span>
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#666', fontSize: 12, fontFamily: 'inherit',
          }}>
            Легенда ⓘ
          </button>
          <a href="/sber-dashboard/" style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', fontSize: 16, textDecoration: 'none',
          }}>×</a>
        </div>
      </div>

      {/* Timeline grid */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <TimelineBg onBadgeClick={() => setModalOpen(true)}/>
      </div>

      {/* Footer */}
      <div style={{
        background: '#111113', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52, flexShrink: 0,
      }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, position: 'relative',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10, padding: '0 14px', height: 36, cursor: 'pointer',
          color: '#888', fontSize: 13, fontFamily: 'inherit',
        }}>
          <IconFilter/> Фильтры
          <span style={{
            position: 'absolute', top: -8, right: -8,
            background: '#3B82F6', color: '#fff', width: 18, height: 18,
            borderRadius: 999, fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>9</span>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['с','по'].map(label => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10, padding: '0 12px', height: 36,
            }}>
              <span style={{ fontSize: 12, color: '#444' }}>{label}</span>
              <input placeholder="дд.мм.гггг" style={{
                background: 'none', border: 'none', outline: 'none',
                color: '#FAFAFA', fontSize: 13, width: 84, fontFamily: 'inherit',
              }}/>
              <IconCalendar/>
            </div>
          ))}
          <button style={{
            height: 36, padding: '0 20px', borderRadius: 10, border: 'none',
            background: '#00B24B', color: '#000', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Поиск</button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <RequestModal onClose={() => setModalOpen(false)}/>}
    </div>
  );
}

/* ── TIMELINE BACKGROUND (interactive) ── */
function TimelineBg({ onBadgeClick }: { onBadgeClick: () => void }) {
  const LW = 148, CW = 100, RH = 150, HH = 42;
  const YEARS  = [2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031];
  const ROWS   = [
    { label: 'Пост-контроль',   sub: null },
    { label: 'Онлайн-контроль', sub: null },
    { label: 'Вне процессов',   sub: 'Жалобы / Ограничения / 2 RED' },
  ];
  type BadgeDef = { year: number; row: number; bg: string; label: string };
  const BADGES: BadgeDef[] = [
    { year:2025, row:0, bg:'#3B82F6', label:'99+' },
    { year:2025, row:0, bg:'#52525b', label:'📄'  },
    { year:2026, row:0, bg:'#F59E0B', label:'97'  },
    { year:2026, row:0, bg:'#EF4444', label:'5'   },
    { year:2026, row:0, bg:'#14B8A6', label:'18'  },
    { year:2026, row:0, bg:'#22C55E', label:'✓'   },
    { year:2026, row:1, bg:'#3B82F6', label:'15'  },
    { year:2026, row:1, bg:'#52525b', label:'?'   },
    { year:2026, row:1, bg:'#22C55E', label:'2'   },
    { year:2026, row:1, bg:'#EF4444', label:'13'  },
    { year:2026, row:2, bg:'#EF4444', label:'2'   },
    { year:2026, row:2, bg:'#22C55E', label:'✓'   },
  ];
  const cells: Record<string,BadgeDef[]> = {};
  for (const b of BADGES) {
    const k = `${b.row}-${b.year}`;
    (cells[k] ??= []).push(b);
  }

  return (
    <div style={{ minWidth: LW + CW * YEARS.length }}>
      {/* Header */}
      <div style={{ display:'flex', height:HH, position:'sticky', top:0, background:'#0D0D0F', zIndex:5, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width:LW, flexShrink:0 }}/>
        {YEARS.map(y=>(
          <div key={y} style={{
            width:CW, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
            borderLeft:'1px solid rgba(255,255,255,0.05)',
            fontSize:12, color: y===2026 ? '#aaa':'#333', fontWeight: y===2026?600:400,
          }}>{y}</div>
        ))}
      </div>
      {/* Rows */}
      {ROWS.map((row,ri)=>(
        <div key={ri} style={{
          display:'flex', height:RH,
          background: ri===1 ? 'rgba(255,255,255,0.015)':'transparent',
          borderBottom:'1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width:LW, flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center',
            paddingLeft:20, borderRight:'1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize:12, color:'#444', fontWeight:500 }}>{row.label}</span>
            {row.sub && <span style={{ fontSize:10, color:'#2a2a2a', marginTop:3 }}>{row.sub}</span>}
          </div>
          {YEARS.map(y=>{
            const ds = cells[`${ri}-${y}`]??[];
            return (
              <div key={y} style={{
                width:CW, flexShrink:0,
                borderLeft:'1px solid rgba(255,255,255,0.03)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5,
              }}>
                {ds.map((d,i)=>(
                  <button key={i} onClick={onBadgeClick} style={{
                    width:30, height:30, borderRadius:999,
                    background:d.bg, color:'#fff', border:'none', cursor:'pointer',
                    fontSize: d.label.length>2?8:11, fontWeight:700, fontFamily:'var(--font-manrope)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:`0 2px 8px ${d.bg}55`, transition:'transform 120ms',
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.18)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                  >{d.label}</button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
