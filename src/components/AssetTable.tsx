import React, { useState } from 'react';
import { MOCK_ASSETS } from '../data/mockAssets';
import { ITAsset } from '../types/assets';

const AssetTable: React.FC = () => {
  // Stan nawigacji i danych
  const [activeTab, setActiveTab] = useState('inventory');
  const [assets, setAssets] = useState<ITAsset[]>(MOCK_ASSETS);
  const [searchTerm, setSearchTerm] = useState('');

  // Stany formularza
  const [newSN, setNewSN] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [zone, setZone] = useState('Office');
  const [assignedTo, setAssignedTo] = useState('');

  const handleAddAsset = () => {
    if (!newSN || !assignedTo) return alert("Uzupełnij SN i Właściciela!");

    let prefix = category === 'Laptop' ? 'WPF' : category === 'Mobile Phone' ? 'M00' : 'AZ';
    const newAsset = {
      id: Math.random().toString(36).substring(2, 9),
      assetName: `${prefix}${newSN}`,
      assetTag: `${prefix}${newSN}`,
      serialNumber: newSN,
      category,
      zone,
      status: 'Active',
      assignedTo,
      room: '',
    } as any;

    setAssets([newAsset, ...assets]);
    setNewSN('');
    setAssignedTo('');
  };

  const filteredAssets = assets.filter(a =>
    a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6' }}>
      
      {/* --- PANEL BOCZNY (SIDEBAR) --- */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '25px', fontSize: '1.2em', fontWeight: 'bold', borderBottom: '1px solid #34495e', textAlign: 'center' }}>
          OSS ASSET MANAGER
        </div>
        <nav style={{ flex: 1, padding: '20px 10px' }}>
          <div 
            style={{ ...navItemStyle, backgroundColor: activeTab === 'inventory' ? '#3498db' : 'transparent' }}
            onClick={() => setActiveTab('inventory')}
          >
            📋 Ewidencja sprzętu
          </div>
          <div 
            style={{ ...navItemStyle, backgroundColor: activeTab === 'stats' ? '#3498db' : 'transparent' }}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statystyki stref
          </div>
        </nav>
        <div style={{ padding: '20px', fontSize: '0.8em', color: '#95a5a6', textAlign: 'center' }}>
          v1.0-inżynierska
        </div>
      </div>

      {/* --- TREŚĆ GŁÓWNA --- */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {activeTab === 'inventory' ? (
          <>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>System Zarządzania Zasobami IT</h2>
            
            {/* Formularz dodawania */}
            <div style={cardStyle}>
              <h4 style={{ marginTop: 0 }}>Nowe Urządzenie</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input placeholder="SN" value={newSN} style={inputStyle} onChange={e => setNewSN(e.target.value)} />
                <input placeholder="Użytkownik" value={assignedTo} style={inputStyle} onChange={e => setAssignedTo(e.target.value)} />
                <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Laptop">Laptop (WPF)</option>
                  <option value="Mobile Phone">Telefon (M00)</option>
                  <option value="Printer">Drukarka (AZ)</option>
                </select>
                <select style={inputStyle} value={zone} onChange={e => setZone(e.target.value)}>
                  <option value="Office">Office</option>
                  <option value="Finishing">Finishing</option>
                  <option value="Despatch">Despatch</option>
                  <option value="Receiving">Receiving</option>
                  <option value="Coating">Coating</option>
                  <option value="Mixing">Mixing</option>
                  <option value="Security Gate">Security Gate</option>
                  <option value="R&D">R&D</option>
                </select>
                <button onClick={handleAddAsset} style={buttonStyle}>Dodaj Zasób</button>
              </div>
            </div>

            {/* Szukajka */}
            <input 
              placeholder="Filtruj listę..." 
              style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '20px' }} 
              onChange={e => setSearchTerm(e.target.value)} 
            />

            {/* Tabela */}
            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={cellStyle}>Urządzenie</th>
                    <th style={cellStyle}>Kategoria</th>
                    <th style={cellStyle}>Strefa</th>
                    <th style={cellStyle}>Status</th>
                    <th style={cellStyle}>Przypisany</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={cellStyle}><strong>{asset.assetName}</strong><br/><small style={{color:'#7f8c8d'}}>SN: {asset.serialNumber}</small></td>
                      <td style={cellStyle}>{asset.category}</td>
                      <td style={cellStyle}><span style={badgeStyle}>{asset.zone}</span></td>
                      <td style={cellStyle}>{asset.status}</td>
                      <td style={cellStyle}>{asset.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Panel Statystyk</h2>
            <p>Tu wkrótce pojawią się wykresy zajętości sprzętu w strefach.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Style pomocnicze
const navItemStyle = { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', transition: '0.3s' };
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const cellStyle = { padding: '15px 10px' };
const badgeStyle = { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' as const };

export default AssetTable;