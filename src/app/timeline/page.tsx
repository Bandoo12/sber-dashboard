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
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);
const IconCheck = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#22C55E"/>
    <polyline points="8,12 11,15 16,9" stroke="#0a2e1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
  {
    amount: '840 000 ₽', date: '12.03.2024',
    tags: ['Расчёты с ЮЛ', 'Исходящий'],
    counterparty: 'Иванов Иван Иванович → Наташина Радость',
    purpose: 'Оплата по договору №12 от 01.03.2024',
    product: { тип: 'Переводы', подтип: 'Стандартные расчеты', направление: 'Исходящий' },
    recipient: { наименование: 'ООО БеТА', инн: '77123456', счет: '567231323445' },
    fullPurpose: 'Оплата по договору №12 от 01.03.2024 за поставку оборудования. НДС не облагается.',
  },
];
const MODAL_DOCS = [
  {
    name: 'Письменные пояснения',
    files: [
      { label: 'Договор поставки №12', date: '03.02.2024', status: 'ok' },
      { label: 'Доп. соглашение №1',   date: '15.03.2024', status: 'ok' },
    ],
  },
  {
    name: 'Источник образования денежных средств',
    files: [
      { label: 'Паспорт сделки 01/2024', date: '15.01.2024', status: 'missing' },
    ],
  },
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
  const [expandedOp,  setExpandedOp]  = useState<number | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  const copy = (s: string) => {
    navigator.clipboard.writeText(s).catch(() => {});
    setCopied(s);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        width: 540, maxHeight: '90vh',
        background: '#181B1F',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 22px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
            Запрос по ФЛ
          </span>
          <div style={{ color: '#7E8E9E', fontSize: 30, lineHeight: 1 }}>×</div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Status */}
          <div style={{
            padding: '14px 22px',
            background: '#131619',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconCheck/>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#22C55E', fontFamily: 'var(--font-inter)' }}>
              Успешно
            </span>
          </div>

          {/* Doc deadline */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, color: '#5E6E7E', fontFamily: 'var(--font-inter)', marginBottom: 5, letterSpacing: '0.04em' }}>
              Срок документов
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', fontFamily: 'var(--font-manrope)' }}>
              15.07.2024
            </div>
          </div>

          {/* Comment */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, color: '#5E6E7E', fontFamily: 'var(--font-inter)', marginBottom: 8, letterSpacing: '0.04em' }}>
              Комментарий
            </div>
            <div style={{
              background: '#21252B',
              borderRadius: 12, padding: '12px 14px',
              fontSize: 13, color: '#7E8E9E', lineHeight: 1.6,
              fontFamily: 'var(--font-inter)',
            }}>
              Пакет документов получен частично. Отсутствует паспорт сделки по валютной операции от 02.04.2024. Ожидаем до даты отсрочки.
            </div>
          </div>

          {/* Stat cards = tabs */}
          <div style={{ display: 'flex', padding: '12px 22px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'accounts' as Tab, label: 'Счета',     val: 3 },
              { id: 'ops'      as Tab, label: 'Операции',  val: 1 },
              { id: 'docs'     as Tab, label: 'Документы', val: 2 },
            ].map(s => {
              const active = tab === s.id;
              return (
                <button key={s.id} onClick={() => setTab(s.id)} style={{
                  flex: 1, padding: '12px 14px', borderRadius: 14,
                  background: active ? '#08A652' : '#21252B',
                  border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms',
                }}>
                  <div style={{ fontSize: 15, color: '#fff', fontFamily: 'var(--font-inter)', marginBottom: 5 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 400, color: active ? '#fff' : '#888', fontFamily: 'var(--font-manrope)', lineHeight: 1 }}>
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
                background: '#21252B',
                borderRadius: 12, padding: '11px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, color: '#555', fontFamily: 'var(--font-inter)' }}>₽</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#08A652', fontFamily: 'var(--font-inter)', letterSpacing: '0.03em' }}>
                    {acc}
                  </span>
                </div>
                <button onClick={() => copy(acc)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6,
                  color: copied === acc ? '#22C55E' : '#666',
                  display: 'flex', alignItems: 'center', transition: 'color 150ms',
                }}>
                  {copied === acc
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12 9,17 20,6"/></svg>
                    : <IconCopy/>}
                </button>
              </div>
            ))}

            {tab === 'ops' && MODAL_OPS.map((op, i) => {
              const expanded = expandedOp === i;
              return (
                <div key={i} style={{
                  background: '#21252B', borderRadius: 14, overflow: 'hidden',
                  cursor: 'pointer',
                }} onClick={() => setExpandedOp(expanded ? null : i)}>
                  {/* Always visible */}
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Amount + date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: '#08A652', fontFamily: 'var(--font-manrope)' }}>
                        {op.amount}
                      </span>
                      <span style={{ fontSize: 12, color: '#7E8E9E', fontFamily: 'var(--font-inter)' }}>
                        {op.date}
                      </span>
                    </div>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {op.tags.map(tag => (
                        <span key={tag} style={{
                          padding: '4px 10px', borderRadius: 999,
                          background: '#3E4C5A',
                          fontSize: 11, color: '#BECAD4', fontFamily: 'var(--font-inter)',
                        }}>{tag}</span>
                      ))}
                    </div>
                    {/* Divider */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 -16px' }}/>
                    {/* Counterparty + purpose */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#D1D5DB', fontFamily: 'var(--font-inter)', marginBottom: 3 }}>
                        {op.counterparty}
                      </div>
                      <div style={{ fontSize: 11, color: '#7E8E9E', fontFamily: 'var(--font-inter)' }}>
                        {op.purpose}
                      </div>
                    </div>
                  </div>

                  {/* Expanded section */}
                  {expanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      {/* Продукт */}
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: 'var(--font-inter)', marginBottom: 10 }}>
                          Продукт
                        </div>
                        {Object.entries(op.product).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#7E8E9E', fontFamily: 'var(--font-inter)', textTransform: 'capitalize' }}>{k}</span>
                            <span style={{ fontSize: 12, color: '#D1D5DB', fontFamily: 'var(--font-inter)' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      {/* Получатель */}
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: 'var(--font-inter)', marginBottom: 10 }}>
                          Получатель
                        </div>
                        {Object.entries(op.recipient).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#7E8E9E', fontFamily: 'var(--font-inter)', textTransform: 'capitalize' }}>{k}</span>
                            <span style={{ fontSize: 12, color: '#D1D5DB', fontFamily: 'var(--font-inter)' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      {/* Назначение платежа */}
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: 'var(--font-inter)', marginBottom: 8 }}>
                          Назначение платежа
                        </div>
                        <div style={{ fontSize: 12, color: '#7E8E9E', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                          {op.fullPurpose}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {tab === 'docs' && MODAL_DOCS.map((doc, i) => {
              const open = expandedDoc === i;
              return (
                <div key={doc.name} style={{ background: '#21252B', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Header row */}
                  <button onClick={() => setExpandedDoc(open ? null : i)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: '#5E6E7E', flexShrink: 0, display: 'flex', marginTop: 1 }}><IconDoc/></span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#D1D5DB', fontFamily: 'var(--font-inter)', textAlign: 'left' }}>
                        {doc.name}
                      </span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  {/* Expanded files */}
                  {open && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      {doc.files.map(f => (
                        <div key={f.label} style={{
                          padding: '13px 16px 13px 45px',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ fontSize: 12, color: '#7E8E9E', fontFamily: 'var(--font-inter)' }}>{f.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function TimelinePage() {
  const [modalOpen] = useState(true);

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
        <TimelineBg onBadgeClick={() => {}}/>
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
      {modalOpen && <RequestModal onClose={() => {}  }/>}
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
