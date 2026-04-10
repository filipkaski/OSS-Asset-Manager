import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssets } from '../context/AssetsContext';
import { AssetStatus, OperationalZone } from '../types/assets';
import { C, STATUS_STYLE, ZONE_COLORS } from '../theme';

const STATUSES: AssetStatus[] = [
  'Active', 'Active - Spare', 'In Stock', 'In Stock - Low Usage',
  'Retired', 'Lost', 'Stolen', 'Disposed',
];

const ZONES: OperationalZone[] = [
  'Finishing', 'Coating', 'Mixing', 'Despatch',
  'Receiving', 'Office', 'Security Gate', 'R&D',
];

const LOCATIONS = ['Label Mill - Wrocław', 'Label Mill - Nowa Wieś', 'Label Mill - Warszawa'];

type Draft = {
  assignedTo: string;
  status: AssetStatus;
  zone: OperationalZone;
  location: string;
  building: string;
  room: string;
  notes: string;
};

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { assets, updateAsset } = useAssets();
  const asset = assets.find(a => a.id === id);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    assignedTo: '', status: 'Active', zone: 'Office',
    location: '', building: '', room: '', notes: '',
  });

  if (!asset) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: C.text }}>Asset nie znaleziony</h2>
      <Link to="/assets" style={{ color: C.accent }}>← Powrót do listy</Link>
    </div>
  );

  const startEdit = () => {
    setDraft({
      assignedTo: asset.assignedTo,
      status:     asset.status,
      zone:       asset.zone,
      location:   asset.location,
      building:   asset.building  ?? '',
      room:       asset.room      ?? '',
      notes:      asset.notes     ?? '',
    });
    setEditing(true);
  };

  const save = () => {
    updateAsset(asset.id, {
      ...draft,
      building:    draft.building  || undefined,
      room:        draft.room      || undefined,
      notes:       draft.notes     || undefined,
      lastUpdate:  new Date(),
    });
    setEditing(false);
  };

  const set = (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDraft(d => ({ ...d, [key]: e.target.value }));

  const currentStatus = editing ? draft.status : asset.status;
  const ss = STATUS_STYLE[currentStatus];
  const zoneColor = ZONE_COLORS[asset.zone] ?? C.accent;

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <Link to="/assets" style={{ color: C.accent, textDecoration: 'none', fontSize: '0.86em' }}>
          ← Powrót do listy
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editing ? (
            <>
              <button style={btnSec} onClick={() => setEditing(false)}>Anuluj</button>
              <button style={btnPrim} onClick={save}>Zapisz zmiany</button>
            </>
          ) : (
            <button style={btnSec} onClick={startEdit}>✏ Edytuj</button>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '5px' }}>
          <h2 style={{ margin: 0, color: C.text, fontSize: '1.55em' }}>{asset.assetName}</h2>
          {editing ? (
            <select
              value={draft.status}
              onChange={set('status')}
              style={{ ...inlSel, backgroundColor: ss.bg, color: ss.color, borderColor: ss.color + '55' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span style={{ backgroundColor: ss.bg, color: ss.color, padding: '4px 14px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 700 }}>
              {asset.status}
            </span>
          )}
          <span style={{ backgroundColor: `${zoneColor}22`, color: zoneColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 600 }}>
            {asset.zone}
          </span>
        </div>
        <p style={{ margin: 0, color: C.textSub, fontSize: '0.85em' }}>{asset.id} · {asset.category}</p>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Informacje podstawowe — read only */}
        <div style={card}>
          <h4 style={cardTitle}>Informacje podstawowe</h4>
          <Row label="Producent"        value={asset.manufacturer} />
          <Row label="Model"            value={asset.modelName} />
          <Row label="Nr modelu"        value={asset.modelNumber} />
          <Row label="Rola urządzenia"  value={asset.deviceRole} />
        </div>

        {/* Identyfikatory — read only */}
        <div style={card}>
          <h4 style={cardTitle}>Identyfikatory</h4>
          <Row label="Asset Tag"      value={asset.assetTag}     mono />
          <Row label="Serial Number"  value={asset.serialNumber} mono />
          {asset.imeiNumber && <Row label="IMEI"       value={asset.imeiNumber} mono />}
          {asset.biosGuid   && <Row label="BIOS GUID"  value={asset.biosGuid}   mono />}
          {asset.queueName  && <Row label="Queue Name" value={asset.queueName}  mono />}
        </div>

        {/* Lokalizacja — editable */}
        <div style={card}>
          <h4 style={cardTitle}>Lokalizacja</h4>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Field label="Lokalizacja">
                <select style={selStyle} value={draft.location} onChange={set('location')}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Strefa operacyjna">
                <select style={selStyle} value={draft.zone} onChange={set('zone')}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </Field>
              <Field label="Budynek">
                <input style={inpStyle} value={draft.building} onChange={set('building')} placeholder="np. Fabryka" />
              </Field>
              <Field label="Pomieszczenie">
                <input style={inpStyle} value={draft.room} onChange={set('room')} placeholder="np. Despatch office" />
              </Field>
            </div>
          ) : (
            <>
              <Row label="Lokalizacja"        value={asset.location} />
              <Row label="Strefa operacyjna"  value={asset.zone} />
              {asset.building && <Row label="Budynek"        value={asset.building} />}
              {asset.room     && <Row label="Pomieszczenie"  value={asset.room} />}
            </>
          )}
        </div>

        {/* Przypisanie — editable */}
        <div style={card}>
          <h4 style={cardTitle}>Przypisanie</h4>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Field label="Przypisany do">
                <input style={inpStyle} value={draft.assignedTo} onChange={set('assignedTo')} placeholder="Imię i nazwisko" />
              </Field>
              <Row label="Ostatnia aktualizacja" value={asset.lastUpdate.toLocaleDateString('pl-PL')} />
            </div>
          ) : (
            <>
              <Row label="Przypisany do"          value={asset.assignedTo} />
              <Row label="Ostatnia aktualizacja"  value={asset.lastUpdate.toLocaleDateString('pl-PL')} />
            </>
          )}
        </div>
      </div>

      {/* Notatki — full width */}
      <div style={{ ...card, marginTop: '14px' }}>
        <h4 style={cardTitle}>Notatki</h4>
        {editing ? (
          <textarea
            value={draft.notes}
            onChange={set('notes')}
            placeholder="Dodaj notatkę do tego urządzenia..."
            rows={4}
            style={{
              width: '100%', padding: '10px 12px',
              borderRadius: '7px', border: `1px solid ${C.border}`,
              backgroundColor: C.inputBg, color: C.text,
              fontSize: '0.88em', resize: 'vertical',
              fontFamily: 'Segoe UI, sans-serif',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        ) : (
          <p style={{ margin: 0, color: asset.notes ? C.text : C.textMuted, fontSize: '0.88em', lineHeight: 1.7 }}>
            {asset.notes ?? 'Brak notatek.'}
          </p>
        )}
      </div>
    </>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.borderSub}` }}>
    <span style={{ color: C.textSub, fontSize: '0.84em', flexShrink: 0, marginRight: '12px' }}>{label}</span>
    <span style={{ color: C.text, fontWeight: 500, fontSize: '0.86em', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>
      {value}
    </span>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.78em', color: C.textSub, marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
    {children}
  </div>
);

const card:      React.CSSProperties = { backgroundColor: C.card, padding: '18px 20px', borderRadius: '10px', border: `1px solid ${C.border}` };
const cardTitle: React.CSSProperties = { marginTop: 0, marginBottom: '14px', color: C.text, fontSize: '0.88em', fontWeight: 700, borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' };
const inpStyle:  React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.inputBg, color: C.text, fontSize: '0.86em', outline: 'none', boxSizing: 'border-box' };
const selStyle:  React.CSSProperties = { ...inpStyle, cursor: 'pointer' };
const inlSel:    React.CSSProperties = { padding: '3px 10px', borderRadius: '20px', border: '1px solid', fontSize: '0.8em', fontWeight: 700, cursor: 'pointer', outline: 'none' };
const btnPrim:   React.CSSProperties = { padding: '8px 18px', backgroundColor: C.accent, color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.87em' };
const btnSec:    React.CSSProperties = { padding: '8px 18px', backgroundColor: 'transparent', color: C.textSub, border: `1px solid ${C.border}`, borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.87em' };

export default AssetDetail;
