import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssets } from '../context/AssetsContext';
import { AssetStatus, OperationalZone, ITAsset } from '../types/assets';
import { C, STATUS_STYLE, ZONE_COLORS } from '../theme';

const API = 'http://localhost:3001/api/assets';

const STATUSES: AssetStatus[] = [
  'Active', 'Active - Spare', 'In Stock', 'In Stock - Low Usage',
  'Retired', 'Lost', 'Stolen', 'Disposed',
];
const ZONES: OperationalZone[] = [
  'Finishing', 'Coating', 'Mixing', 'Despatch',
  'Receiving', 'Office', 'Security Gate', 'R&D',
];
const LOCATIONS = ['Label Mill - Wrocław', 'Label Mill - Nowa Wieś', 'Label Mill - Warszawa'];

interface ApiNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiChangeLog {
  id: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
  changedBy: { id: number; name: string } | null;
}

const FIELD_LABELS: Record<string, string> = {
  status:     'Status',
  assignedTo: 'Przypisany do',
  zone:       'Strefa',
  location:   'Lokalizacja',
  building:   'Budynek',
  room:       'Pomieszczenie',
};

type Draft = {
  assignedTo: string;
  status: AssetStatus;
  zone: OperationalZone;
  location: string;
  building: string;
  room: string;
};

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { updateAsset } = useAssets();

  // Asset z backendu (pełny, z notatkami)
  const [asset, setAsset] = useState<ITAsset | null>(null);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [changeLogs, setChangeLogs] = useState<ApiChangeLog[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoadingAsset(true);
    setFetchErr(null);
    try {
      const res = await fetch(`${API}/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAsset({ ...data, lastUpdate: new Date(data.lastUpdate) });
      setNotes(data.notes ?? []);
      setChangeLogs(data.changeLogs ?? []);
    } catch (e: any) {
      setFetchErr(e.message ?? 'Błąd pobierania assetu');
    } finally {
      setLoadingAsset(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // Edycja
  const [editing, setEditing_] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    assignedTo: '', status: 'Active', zone: 'Office',
    location: '', building: '', room: '',
  });

  const setEditing = (v: boolean) => { setEditing_(v); setSaveErr(null); };

  const startEdit = () => {
    if (!asset) return;
    setDraft({
      assignedTo: asset.assignedTo,
      status:     asset.status,
      zone:       asset.zone,
      location:   asset.location,
      building:   asset.building ?? '',
      room:       asset.room     ?? '',
    });
    setEditing(true);
  };

  const save = async () => {
    if (!asset) return;
    setSaving(true);
    setSaveErr(null);
    try {
      await updateAsset(asset.id, {
        ...draft,
        building: draft.building || undefined,
        room:     draft.room     || undefined,
      });
      await fetchDetail();
      setEditing_(false);
    } catch (e: any) {
      setSaveErr(e.message ?? 'Błąd zapisu');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft(d => ({ ...d, [key]: e.target.value }));

  // Notatki
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteErr, setNoteErr] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  const addNote = async () => {
    if (!asset || !noteText.trim()) return;
    setAddingNote(true);
    setNoteErr(null);
    try {
      const res = await fetch(`${API}/${asset.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const note: ApiNote = await res.json();
      setNotes(p => [note, ...p]);
      setNoteText('');
    } catch (e: any) {
      setNoteErr(e.message ?? 'Błąd dodawania notatki');
    } finally {
      setAddingNote(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    if (!asset) return;
    setDeletingNoteId(noteId);
    try {
      await fetch(`${API}/${asset.id}/notes/${noteId}`, { method: 'DELETE' });
      setNotes(p => p.filter(n => n.id !== noteId));
    } finally {
      setDeletingNoteId(null);
    }
  };

  // ── render states ──────────────────────────────────────────────────────────
  if (loadingAsset) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: C.textSub }}>
      Ładowanie…
    </div>
  );

  if (fetchErr || !asset) return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <div style={{ color: '#f87171', marginBottom: '12px' }}>{fetchErr ?? 'Asset nie znaleziony'}</div>
      <Link to="/assets" style={{ color: C.accent }}>← Powrót do listy</Link>
    </div>
  );

  const currentStatus = editing ? draft.status : asset.status;
  const ss = STATUS_STYLE[currentStatus];
  const zoneColor = ZONE_COLORS[editing ? draft.zone : asset.zone] ?? C.accent;

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <Link to="/assets" style={{ color: C.accent, textDecoration: 'none', fontSize: '0.86em' }}>
          ← Powrót do listy
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {editing ? (
            <>
              {saveErr && <span style={{ color: '#f87171', fontSize: '0.8em' }}>{saveErr}</span>}
              <button style={btnSec} onClick={() => setEditing(false)} disabled={saving}>Anuluj</button>
              <button style={{ ...btnPrim, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
                {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
              </button>
            </>
          ) : (
            <button style={btnSec} onClick={startEdit}>✏ Edytuj</button>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '5px', flexWrap: 'wrap' }}>
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
            {editing ? draft.zone : asset.zone}
          </span>
        </div>
        <p style={{ margin: 0, color: C.textSub, fontSize: '0.85em' }}>{asset.id} · {asset.category}</p>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        <div style={card}>
          <h4 style={cardTitle}>Informacje podstawowe</h4>
          <Row label="Producent"       value={asset.manufacturer} />
          <Row label="Model"           value={asset.modelName} />
          <Row label="Nr modelu"       value={asset.modelNumber} />
          <Row label="Rola urządzenia" value={asset.deviceRole} />
        </div>

        <div style={card}>
          <h4 style={cardTitle}>Identyfikatory</h4>
          <Row label="Asset Tag"     value={asset.assetTag}     mono />
          <Row label="Serial Number" value={asset.serialNumber} mono />
          {asset.imeiNumber && <Row label="IMEI"       value={asset.imeiNumber} mono />}
          {asset.biosGuid   && <Row label="BIOS GUID"  value={asset.biosGuid}   mono />}
          {asset.queueName  && <Row label="Queue Name" value={asset.queueName}  mono />}
        </div>

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
              <Row label="Lokalizacja"       value={asset.location} />
              <Row label="Strefa operacyjna" value={asset.zone} />
              {asset.building && <Row label="Budynek"       value={asset.building} />}
              {asset.room     && <Row label="Pomieszczenie" value={asset.room} />}
            </>
          )}
        </div>

        <div style={card}>
          <h4 style={cardTitle}>Przypisanie</h4>
          {editing ? (
            <Field label="Przypisany do">
              <input style={inpStyle} value={draft.assignedTo} onChange={set('assignedTo')} placeholder="Imię i nazwisko" />
            </Field>
          ) : (
            <Row label="Przypisany do" value={asset.assignedTo} />
          )}
          <Row label="Ostatnia aktualizacja" value={asset.lastUpdate instanceof Date
            ? asset.lastUpdate.toLocaleDateString('pl-PL')
            : new Date(asset.lastUpdate).toLocaleDateString('pl-PL')} />
        </div>
      </div>

      {/* Historia zmian */}
      <div style={{ ...card, marginTop: '14px' }}>
        <h4 style={cardTitle}>Historia zmian ({changeLogs.length})</h4>
        {changeLogs.length === 0 ? (
          <p style={{ margin: 0, color: C.textMuted, fontSize: '0.87em' }}>Brak zarejestrowanych zmian.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {changeLogs.map((log, i) => (
              <div key={log.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '8px',
                padding: '10px 0',
                borderBottom: i < changeLogs.length - 1 ? `1px solid ${C.borderSub}` : 'none',
                alignItems: 'start',
              }}>
                <div>
                  <span style={{ fontSize: '0.84em', color: C.textSub, fontWeight: 600 }}>
                    {FIELD_LABELS[log.field] ?? log.field}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#3d1515', color: '#f87171',
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '0.78em', fontFamily: 'monospace',
                      textDecoration: 'line-through', opacity: 0.8,
                    }}>
                      {log.oldValue ?? '—'}
                    </span>
                    <span style={{ color: C.textMuted, fontSize: '0.8em' }}>→</span>
                    <span style={{
                      backgroundColor: '#0a3324', color: '#4ade80',
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '0.78em', fontFamily: 'monospace',
                    }}>
                      {log.newValue ?? '—'}
                    </span>
                  </div>
                  {log.changedBy && (
                    <span style={{ fontSize: '0.75em', color: C.textMuted, marginTop: '3px', display: 'block' }}>
                      przez {log.changedBy.name}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.75em', color: C.textMuted, whiteSpace: 'nowrap', paddingTop: '2px' }}>
                  {new Date(log.changedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notatki */}
      <div style={{ ...card, marginTop: '14px' }}>
        <h4 style={cardTitle}>Notatki ({notes.length})</h4>

        {/* Dodaj notatkę */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Wpisz notatkę…"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); }}
            style={{
              flex: 1, padding: '9px 12px',
              borderRadius: '7px', border: `1px solid ${C.border}`,
              backgroundColor: C.inputBg, color: C.text,
              fontSize: '0.87em', resize: 'vertical',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={addNote}
            disabled={addingNote || !noteText.trim()}
            style={{
              ...btnPrim,
              alignSelf: 'flex-end',
              opacity: addingNote || !noteText.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {addingNote ? '…' : '+ Dodaj'}
          </button>
        </div>
        {noteErr && <div style={{ color: '#f87171', fontSize: '0.82em', marginBottom: '10px' }}>{noteErr}</div>}

        {/* Lista notatek */}
        {notes.length === 0 ? (
          <p style={{ margin: 0, color: C.textMuted, fontSize: '0.87em' }}>Brak notatek.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notes.map(note => (
              <div key={note.id} style={{
                backgroundColor: C.bg,
                border: `1px solid ${C.borderSub}`,
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 6px', color: C.text, fontSize: '0.88em', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                  <span style={{ color: C.textMuted, fontSize: '0.75em' }}>
                    {new Date(note.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  disabled={deletingNoteId === note.id}
                  title="Usuń notatkę"
                  style={{
                    background: 'none', border: 'none',
                    color: C.textMuted, cursor: 'pointer',
                    fontSize: '1em', padding: '2px 4px',
                    opacity: deletingNoteId === note.id ? 0.4 : 1,
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
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
