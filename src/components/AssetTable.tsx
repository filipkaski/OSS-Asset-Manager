import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../context/AssetsContext';
import { AssetCategory, AssetStatus, OperationalZone } from '../types/assets';
import { C, STATUS_STYLE, ZONE_COLORS, CATEGORY_CONFIG } from '../theme';

const PAGE_SIZE = 20;

const AssetTable: React.FC = () => {
  const { assets } = useAssets();
  const navigate = useNavigate();

  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState<AssetCategory | 'all'>('all');
  const [fStatus, setFStatus]           = useState('all');
  const [fZone, setFZone]               = useState('all');
  const [fLocation, setFLocation]       = useState('all');
  const [fAssigned, setFAssigned]       = useState('all');
  const [page, setPage]                 = useState(1);

  // Unique dropdown values from data
  const uStatuses  = [...new Set(assets.map(a => a.status))].sort() as AssetStatus[];
  const uZones     = [...new Set(assets.map(a => a.zone))].sort()   as OperationalZone[];
  const uLocations = [...new Set(assets.map(a => a.location))].sort();
  const uAssigned  = [...new Set(assets.map(a => a.assignedTo))].sort();

  const catCounts = (Object.keys(CATEGORY_CONFIG) as AssetCategory[]).reduce<Record<AssetCategory, number>>(
    (acc, cat) => ({ ...acc, [cat]: assets.filter(a => a.category === cat).length }),
    {} as Record<AssetCategory, number>
  );

  const anyFilter = search || catFilter !== 'all' || fStatus !== 'all' || fZone !== 'all' || fLocation !== 'all' || fAssigned !== 'all';

  const clearAll = () => {
    setSearch(''); setCatFilter('all');
    setFStatus('all'); setFZone('all');
    setFLocation('all'); setFAssigned('all');
    setPage(1);
  };

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    return (
      (catFilter  === 'all' || a.category   === catFilter)  &&
      (fStatus    === 'all' || a.status     === fStatus)    &&
      (fZone      === 'all' || a.zone       === fZone)      &&
      (fLocation  === 'all' || a.location   === fLocation)  &&
      (fAssigned  === 'all' || a.assignedTo === fAssigned)  &&
      (!q || a.assetName.toLowerCase().includes(q) ||
             a.assignedTo.toLowerCase().includes(q) ||
             a.serialNumber.toLowerCase().includes(q) ||
             a.id.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageAssets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const mkSetter = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    fn(e.target.value); setPage(1);
  };

  const sel = (active: boolean): React.CSSProperties => ({
    backgroundColor: C.inputBg,
    color: active ? C.text : C.textSub,
    border: `1px solid ${active ? C.accent : C.border}`,
    borderRadius: '7px',
    padding: '7px 11px',
    fontSize: '0.82em',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '140px',
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
        <h2 style={{ color: C.text, margin: 0, fontSize: '1.35em' }}>Ewidencja zasobów IT</h2>
        <span style={{ color: C.textMuted, fontSize: '0.82em' }}>{assets.length} urządzeń łącznie</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {(Object.entries(CATEGORY_CONFIG) as [AssetCategory, typeof CATEGORY_CONFIG[AssetCategory]][]).map(([cat, cfg]) => (
          <div
            key={cat}
            onClick={() => { setCatFilter(p => p === cat ? 'all' : cat); setPage(1); }}
            style={{
              backgroundColor: C.card,
              borderRadius: '10px',
              padding: '16px 18px',
              borderLeft: `4px solid ${cfg.color}`,
              cursor: 'pointer',
              outline: catFilter === cat ? `2px solid ${cfg.color}` : '2px solid transparent',
              outlineOffset: '2px',
              transition: 'all 0.15s',
              border: `1px solid ${C.border}`,
              borderLeftWidth: '4px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.cardHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.card; }}
          >
            <div style={{ fontSize: '1.4em', marginBottom: '5px' }}>{cfg.icon}</div>
            <div style={{ fontSize: '1.8em', fontWeight: 700, color: C.text, lineHeight: 1 }}>{catCounts[cat]}</div>
            <div style={{ fontSize: '0.8em', color: C.textSub, marginTop: '3px' }}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            placeholder="Szukaj po nazwie, SN, użytkowniku, ID..."
            style={{
              padding: '7px 12px', flex: '1 1 240px',
              borderRadius: '7px', border: `1px solid ${C.border}`,
              backgroundColor: C.inputBg, color: C.text,
              fontSize: '0.85em', outline: 'none',
            }}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select style={sel(fStatus   !== 'all')} value={fStatus}   onChange={mkSetter(setFStatus)}>
            <option value="all">Status: Wszystkie</option>
            {uStatuses.map(s  => <option key={s}  value={s}>{s}</option>)}
          </select>
          <select style={sel(fZone     !== 'all')} value={fZone}     onChange={mkSetter(setFZone)}>
            <option value="all">Strefa: Wszystkie</option>
            {uZones.map(z     => <option key={z}  value={z}>{z}</option>)}
          </select>
          <select style={sel(fLocation !== 'all')} value={fLocation} onChange={mkSetter(setFLocation)}>
            <option value="all">Lokalizacja: Wszystkie</option>
            {uLocations.map(l => <option key={l}  value={l}>{l}</option>)}
          </select>
          <select style={sel(fAssigned !== 'all')} value={fAssigned} onChange={mkSetter(setFAssigned)}>
            <option value="all">Przypisany: Wszyscy</option>
            {uAssigned.map(p  => <option key={p}  value={p}>{p}</option>)}
          </select>
          {anyFilter && (
            <button onClick={clearAll} style={{ padding: '7px 12px', backgroundColor: 'transparent', color: C.textSub, border: `1px solid ${C.border}`, borderRadius: '7px', cursor: 'pointer', fontSize: '0.82em' }}>
              ✕ Wyczyść
            </button>
          )}
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8em', color: C.textMuted }}>
          {filtered.length} wyników
          {catFilter !== 'all' && (
            <span style={{ marginLeft: '8px', color: CATEGORY_CONFIG[catFilter].color }}>
              · {CATEGORY_CONFIG[catFilter].icon} {CATEGORY_CONFIG[catFilter].label}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: C.sidebar, borderBottom: `1px solid ${C.border}` }}>
              {['Urządzenie', 'Kategoria', 'Strefa', 'Status', 'Przypisany', 'Lokalizacja'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageAssets.map(asset => {
              const zc = ZONE_COLORS[asset.zone] ?? C.accent;
              const ss = STATUS_STYLE[asset.status];
              return (
                <tr
                  key={asset.id}
                  style={{ borderBottom: `1px solid ${C.borderSub}`, cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.cardHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: C.text, fontSize: '0.92em' }}>{asset.assetName}</span><br />
                    <span style={{ color: C.textMuted, fontFamily: 'monospace', fontSize: '0.76em' }}>{asset.serialNumber}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86em', color: C.textSub }}>
                      {CATEGORY_CONFIG[asset.category].icon} {asset.category}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ backgroundColor: `${zc}22`, color: zc, padding: '3px 8px', borderRadius: '5px', fontSize: '0.78em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {asset.zone}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ backgroundColor: ss.bg, color: ss.color, padding: '3px 8px', borderRadius: '5px', fontSize: '0.78em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '0.88em', color: C.text }}>{asset.assignedTo}</td>
                  <td style={{ ...tdStyle, fontSize: '0.82em', color: C.textSub }}>{asset.location}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', padding: '14px', borderTop: `1px solid ${C.border}` }}>
            <button style={pgBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} style={{ ...pgBtn, backgroundColor: p === page ? C.accent : 'transparent', color: p === page ? '#fff' : C.textSub, borderColor: p === page ? C.accent : C.border }} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button style={pgBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </>
  );
};

const thStyle: React.CSSProperties = { padding: '10px 14px', fontWeight: 600, color: C.textSub, fontSize: '0.71em', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const pgBtn:   React.CSSProperties = { padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: C.textSub, fontSize: '0.86em' };

export default AssetTable;
