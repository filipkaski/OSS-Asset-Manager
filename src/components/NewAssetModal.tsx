import React, { useState } from 'react';
import { C, CATEGORY_CONFIG } from '../theme';
import { AssetCategory, AssetStatus, OperationalZone, ITAsset } from '../types/assets';

const ZONES: OperationalZone[] = ['Office', 'Finishing', 'Coating', 'Mixing', 'Despatch', 'Receiving', 'Security Gate', 'R&D'];
const STATUSES: AssetStatus[] = ['Active', 'Active - Spare', 'In Stock', 'In Stock - Low Usage', 'Retired', 'Lost', 'Stolen', 'Disposed'];
const LOCATIONS = ['Label Mill - Wrocław', 'Label Mill - Nowa Wieś', 'Label Mill - Warszawa'];
const CATEGORIES = Object.keys(CATEGORY_CONFIG) as AssetCategory[];

function genId(category: AssetCategory): string {
  const suffix = String(Date.now()).slice(-7);
  return category === 'Mobile Phone' ? `MOB${suffix}` : `ASM${suffix}`;
}
function genTag(): string { return `M${String(Date.now()).slice(-7)}`; }
function genAssetName(category: AssetCategory, sn: string, tag: string, queueName: string): string {
  if (category === 'Mobile Phone') return tag;
  if (category === 'Printer') return queueName || 'NW00';
  return `W${sn.toUpperCase()}`;
}

interface Props { onClose: () => void; onSave: (asset: ITAsset) => Promise<void>; }

const EMPTY = {
  category: 'Laptop' as AssetCategory,
  manufacturer: '',
  modelName: '',
  modelNumber: '',
  serialNumber: '',
  deviceRole: '',
  assignedTo: '',
  location: 'Label Mill - Wrocław',
  zone: 'Office' as OperationalZone,
  status: 'Active' as AssetStatus,
  imeiNumber: '',
  biosGuid: '',
  queueName: '',
  building: '',
  room: '',
};

const NewAssetModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serialNumber || !form.manufacturer || !form.modelName) {
      setErr('Uzupełnij wymagane pola: producent, model i numer seryjny.');
      return;
    }
    setSaving(true);
    setErr(null);
    const tag = genTag();
    const asset: ITAsset = {
      id:           genId(form.category),
      assetTag:     tag,
      assetName:    genAssetName(form.category, form.serialNumber, tag, form.queueName),
      serialNumber: form.serialNumber,
      manufacturer: form.manufacturer,
      modelName:    form.modelName,
      modelNumber:  form.modelNumber,
      category:     form.category,
      deviceRole:   form.deviceRole || form.category,
      assignedTo:   form.assignedTo || 'Unassigned',
      location:     form.location,
      zone:         form.zone,
      status:       form.status,
      lastUpdate:   new Date(),
      ...(form.category === 'Mobile Phone' && form.imeiNumber ? { imeiNumber: form.imeiNumber } : {}),
      ...(form.category !== 'Mobile Phone' && form.category !== 'Printer' && form.biosGuid ? { biosGuid: form.biosGuid } : {}),
      ...(form.category === 'Printer' && form.queueName ? { queueName: form.queueName } : {}),
      ...(form.building ? { building: form.building } : {}),
      ...(form.room     ? { room:     form.room }     : {}),
    };
    try {
      await onSave(asset);
      onClose();
    } catch (e: any) {
      setErr(e.message ?? 'Błąd zapisu');
      setSaving(false);
    }
  };

  const inp = (label: string, key: keyof typeof EMPTY, required = false, placeholder = '') => (
    <label style={labelStyle}>
      <span style={labelText}>{label}{required && <span style={{ color: '#f87171' }}> *</span>}</span>
      <input
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
      />
    </label>
  );

  const showIMEI  = form.category === 'Mobile Phone';
  const showBIOS  = form.category === 'Laptop' || form.category === 'Desktop';
  const showQueue = form.category === 'Printer';

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: C.text, fontSize: '1.1em' }}>Nowy asset</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: '1.3em', lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Kategoria */}
          <label style={labelStyle}>
            <span style={labelText}>Kategoria</span>
            <select value={form.category} onChange={set('category')} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {c}</option>)}
            </select>
          </label>

          <div style={grid2}>
            {inp('Producent', 'manufacturer', true, 'np. Lenovo')}
            {inp('Model', 'modelName', true, 'np. ThinkPad L490')}
          </div>
          <div style={grid2}>
            {inp('Numer modelu', 'modelNumber', false, 'np. 20Q6S1MW14')}
            {inp('Numer seryjny', 'serialNumber', true, 'np. PF1W7YJE')}
          </div>

          {showIMEI  && inp('IMEI', 'imeiNumber', false, '15 cyfr')}
          {showBIOS  && inp('BIOS GUID', 'biosGuid', false, 'xxxxxxxx-xxxx-...')}
          {showQueue && inp('Nazwa kolejki (Queue)', 'queueName', false, 'np. NW12')}

          <div style={grid2}>
            {inp('Rola urządzenia', 'deviceRole', false, 'np. Standard Office Workstation')}
            {inp('Przypisany do', 'assignedTo', false, 'Imię i nazwisko')}
          </div>

          <div style={grid2}>
            <label style={labelStyle}>
              <span style={labelText}>Lokalizacja</span>
              <select value={form.location} onChange={set('location')} style={inputStyle}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelText}>Strefa</span>
              <select value={form.zone} onChange={set('zone')} style={inputStyle}>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </label>
          </div>

          <div style={grid2}>
            {inp('Budynek', 'building', false, 'opcjonalne')}
            {inp('Pomieszczenie', 'room', false, 'opcjonalne')}
          </div>

          <label style={labelStyle}>
            <span style={labelText}>Status</span>
            <select value={form.status} onChange={set('status')} style={inputStyle}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          {err && <div style={{ color: '#f87171', fontSize: '0.83em', marginTop: '8px' }}>{err}</div>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Anuluj</button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? 'Zapisywanie…' : 'Dodaj asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  backgroundColor: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};
const modal: React.CSSProperties = {
  backgroundColor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: '12px',
  padding: '24px',
  width: '100%', maxWidth: '560px',
  maxHeight: '90vh', overflowY: 'auto',
};
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' };
const labelText: React.CSSProperties = { fontSize: '0.78em', color: C.textSub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' };
const inputStyle: React.CSSProperties = {
  backgroundColor: C.inputBg, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: '7px',
  padding: '8px 10px', fontSize: '0.88em', outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  backgroundColor: C.accent, color: '#fff',
  border: 'none', borderRadius: '7px',
  padding: '9px 20px', cursor: 'pointer', fontSize: '0.88em', fontWeight: 600,
};
const btnSecondary: React.CSSProperties = {
  backgroundColor: 'transparent', color: C.textSub,
  border: `1px solid ${C.border}`, borderRadius: '7px',
  padding: '9px 16px', cursor: 'pointer', fontSize: '0.88em',
};

export default NewAssetModal;
