import React from 'react';
import { useAssets } from '../context/AssetsContext';
import { AssetCategory, AssetStatus } from '../types/assets';
import { C, STATUS_STYLE, CATEGORY_CONFIG } from '../theme';

const StatsPanel: React.FC = () => {
  const { assets } = useAssets();

  const byCategory = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1; return acc;
  }, {});

  const byStatus = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc;
  }, {});

  const byZone = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.zone] = (acc[a.zone] || 0) + 1; return acc;
  }, {});

  const maxZone = Math.max(...Object.values(byZone));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
        <h2 style={{ color: C.text, margin: 0, fontSize: '1.35em' }}>Statystyki zasobów IT</h2>
        <span style={{ color: C.textMuted, fontSize: '0.82em' }}>{assets.length} urządzeń łącznie</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Według kategorii */}
        <div style={card}>
          <h4 style={cardTitle}>Według kategorii</h4>
          {(Object.entries(byCategory) as [AssetCategory, number][]).map(([cat, count]) => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <div key={cat} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.86em', color: C.textSub }}>{cfg?.icon} {cat}</span>
                  <span style={{ fontSize: '0.86em', fontWeight: 700, color: C.text }}>{count}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: C.border, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / assets.length) * 100}%`, backgroundColor: cfg?.color ?? C.accent, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Według statusu */}
        <div style={card}>
          <h4 style={cardTitle}>Według statusu</h4>
          {(Object.entries(byStatus) as [AssetStatus, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => {
              const ss = STATUS_STYLE[status];
              return (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${C.borderSub}` }}>
                  <span style={{ fontSize: '0.86em', color: C.textSub }}>{status}</span>
                  <span style={{ backgroundColor: ss?.bg ?? C.border, color: ss?.color ?? C.text, padding: '2px 12px', borderRadius: '12px', fontSize: '0.82em', fontWeight: 700, minWidth: '28px', textAlign: 'center' }}>
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Według strefy */}
      <div style={card}>
        <h4 style={cardTitle}>Według strefy operacyjnej</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
          {Object.entries(byZone)
            .sort((a, b) => b[1] - a[1])
            .map(([zone, count]) => (
              <div key={zone} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.86em', color: C.textSub }}>{zone}</span>
                  <span style={{ fontSize: '0.86em', fontWeight: 700, color: C.text }}>{count}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: C.border, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / maxZone) * 100}%`, backgroundColor: C.accent, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

const card:      React.CSSProperties = { backgroundColor: C.card, padding: '20px', borderRadius: '10px', border: `1px solid ${C.border}` };
const cardTitle: React.CSSProperties = { marginTop: 0, marginBottom: '16px', color: C.text, fontSize: '0.88em', fontWeight: 700, borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' };

export default StatsPanel;
