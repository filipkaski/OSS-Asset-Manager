import React, { useState, useEffect } from 'react';
import { MOCK_ASSETS } from '../data/mockAssets';
import { ITAsset } from '../types/assets';
import Papa from 'papaparse';

type LocalAsset = ITAsset & {
  location?: string;
  notes?: string;
};

const AssetTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  // --- LOGIKA ZAPISYWANIA DANYCH (LocalStorage) ---
  const [assets, setAssets] = useState<LocalAsset[]>(() => {
    const saved = localStorage.getItem('oss_assets');
    return saved ? JSON.parse(saved) : (MOCK_ASSETS as any);
  });

  useEffect(() => {
    localStorage.setItem('oss_assets', JSON.stringify(assets));
  }, [assets]);

  // --- STANY FILTROWANIA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<LocalAsset | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // Stany formularza
  const [newSN, setNewSN] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [zone, setZone] = useState('Office');
  const [assignedTo, setAssignedTo] = useState('');

  const handleUpdateAsset = (updatedAsset: LocalAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedData = results.data.map((row: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          assetName: row['Configuration Item'] || 'Unknown', 
          assetTag: row['Configuration Item'] || 'Unknown',
          serialNumber: row['Configuration Item'] || '',
          category: row['Model category'] === 'Communication Device' ? 'Mobile Phone' : 'Laptop',
          zone: 'Office', 
          status: row['State'] === 'In use' ? 'Active' : 'Disposed',
          assignedTo: row['Assigned to'] || 'Unassigned',
          modelName: row['Display name'] || '',
          notes: '', 
          location: '', 
        } as any));
        setAssets((prev) => [...importedData, ...prev]);
        alert(`Zaimportowano i zapisano ${importedData.length} rekordów!`);
      },
    });
  };

  const handleAddAsset = () => {
    if (!newSN || !assignedTo) return alert("Uzupełnij dane!");
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
      notes: '',
      location: '',
    } as any;
    setAssets([newAsset, ...assets]);
    setNewSN('');
    setAssignedTo('');
  };

  // --- ZAAWANSOWANE FILTROWANIE ---
  const filteredAssets = assets.filter(a => {
  const matchesSearch = 
    a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.assignedTo && a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const matchesLocation = filterLocation === 'All' || a.location === filterLocation || a.zone === filterLocation;
  const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
  
  // NOWY WARUNEK:
  const matchesStatus = filterStatus === 'All' || a.status === filterStatus;

  return matchesSearch && matchesLocation && matchesCategory && matchesStatus;
});

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '25px', fontSize: '1.2em', fontWeight: 'bold', borderBottom: '1px solid #34495e', textAlign: 'center' }}>
          OSS ASSET MANAGER
        </div>
        <nav style={{ flex: 1, padding: '20px 10px' }}>
          <div style={{ ...navItemStyle, backgroundColor: activeTab === 'inventory' ? '#3498db' : 'transparent' }} onClick={() => setActiveTab('inventory')}>📋 Ewidencja</div>
          <div style={{ ...navItemStyle, backgroundColor: activeTab === 'stats' ? '#3498db' : 'transparent' }} onClick={() => setActiveTab('stats')}>📊 Statystyki</div>
          <button 
             onClick={() => { if(window.confirm("Czy wyczyścić wszystkie dane?")) { localStorage.clear(); window.location.reload(); } }}
             style={{ marginTop: '20px', background: 'none', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
          >
            🗑️ Resetuj bazę danych
          </button>
        </nav>
      </div>

      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {activeTab === 'inventory' ? (
          <>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Ewidencja Zasobów ({filteredAssets.length})</h2>

            {/* PANEL EDYCJI */}
            {selectedAsset && (
              <div style={{ ...cardStyle, border: '2px solid #3498db', backgroundColor: '#ebf5fb' }}>
                <h3 style={{ marginTop: 0 }}>Edycja: {selectedAsset.assetName}</h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{fontWeight:'bold'}}>Lokalizacja:</label>
                    <select 
                      style={{ ...inputStyle, width: '100%', marginTop: '5px' }}
                      value={selectedAsset.location || ''}
                      onChange={(e) => setSelectedAsset({...selectedAsset, location: e.target.value})}
                    >
                      <option value="">-- Wybierz --</option>
                      <option value="Despatch">Despatch</option>
                      <option value="Finishing">Finishing</option>
                      <option value="Coating">Coating</option>
                      <option value="Mixing">Mixing</option>
                      <option value="Office Floor 1">Office Floor 1</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{fontWeight:'bold'}}>Opis techniczny:</label>
                    <input style={{ ...inputStyle, width: '100%', marginTop: '5px' }} value={selectedAsset.notes || ''} onChange={(e) => setSelectedAsset({...selectedAsset, notes: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <button onClick={() => handleUpdateAsset(selectedAsset)} style={buttonStyle}>Zapisz</button>
                    <button onClick={() => setSelectedAsset(null)} style={{ ...buttonStyle, backgroundColor: '#95a5a6' }}>Anuluj</button>
                  </div>
                </div>
              </div>
            )}
            
            <div style={cardStyle}>
              <h4 style={{ marginTop: 0 }}>Dodaj / Importuj</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input placeholder="SN" value={newSN} style={inputStyle} onChange={e => setNewSN(e.target.value)} />
                <input placeholder="Użytkownik" value={assignedTo} style={inputStyle} onChange={e => setAssignedTo(e.target.value)} />
                <button onClick={handleAddAsset} style={buttonStyle}>Dodaj</button>
                <label style={{ ...buttonStyle, backgroundColor: '#34495e', cursor: 'pointer' }}>
                  📥 Import CSV <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

           {/* PANEL FILTROWANIA */}
<div style={{ ...cardStyle, display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', flexWrap: 'wrap' }}>
   <div style={{ flex: 2, minWidth: '200px' }}>
      <label style={{ fontSize: '0.8em', color: '#7f8c8d', fontWeight: 'bold' }}>🔍 Szukaj (User/SN/Asset):</label>
      <input 
        placeholder="Wyszukaj..." 
        style={{ ...inputStyle, width: '100%', border: '2px solid #3498db' }} 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)} 
      />
   </div>
   <div style={{ flex: 1, minWidth: '150px' }}>
      <label style={{fontSize: '0.8em', color: '#7f8c8d'}}>Lokalizacja:</label>
      <select style={{ ...inputStyle, width: '100%' }} onChange={e => setFilterLocation(e.target.value)}>
        <option value="All">Wszystkie</option>
        <option value="Office">Office</option>
        <option value="Despatch">Despatch</option>
        <option value="Finishing">Finishing</option>
        <option value="Coating">Coating</option>
        <option value="Mixing">Mixing</option>
      </select>
   </div>
   <div style={{ flex: 1, minWidth: '150px' }}>
      <label style={{fontSize: '0.8em', color: '#7f8c8d'}}>Typ:</label>
      <select style={{ ...inputStyle, width: '100%' }} onChange={e => setFilterCategory(e.target.value)}>
        <option value="All">Wszystkie</option>
        <option value="Laptop">Laptop</option>
        <option value="Mobile Phone">Telefon</option>
      </select>
   </div>
   {/* NOWY FILTR STATUSU */}
   <div style={{ flex: 1, minWidth: '150px' }}>
      <label style={{fontSize: '0.8em', color: '#7f8c8d'}}>Status:</label>
      <select style={{ ...inputStyle, width: '100%' }} onChange={e => setFilterStatus(e.target.value)}>
        <option value="All">Wszystkie</option>
        <option value="Active">Active (In use)</option>
        <option value="Disposed">Disposed (Retired)</option>
      </select>
   </div>
</div>

            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#7f8c8d' }}>
                    <th style={cellStyle}>URZĄDZENIE</th>
                    <th style={cellStyle}>LOKALIZACJA</th>
                    <th style={cellStyle}>UŻYTKOWNIK</th>
                    <th style={cellStyle}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(asset)}
                      style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', backgroundColor: selectedAsset?.id === asset.id ? '#e3f2fd' : 'transparent' }}
                    >
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 'bold' }}>{asset.assetName}</div>
                        <div style={{ fontSize: '0.8em', color: '#3498db' }}>{asset.notes || 'Brak opisu'}</div>
                      </td>
                      <td style={cellStyle}>
                        <span style={badgeStyle}>{asset.location || asset.zone}</span>
                      </td>
                      <td style={cellStyle}>{asset.assignedTo}</td>
                      <td style={cellStyle}>
                         <span style={{...badgeStyle, backgroundColor: asset.status === 'Active' ? '#27ae60' : '#e74c3c', color: 'white'}}>{asset.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAssets.length === 0 && <div style={{textAlign:'center', padding: '20px'}}>Brak wyników dla podanych filtrów.</div>}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Statystyki Systemu</h2>
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px'}}>
               <div style={{...cardStyle, width: '200px'}}><h3>{assets.length}</h3><p>Wszystkich zasobów</p></div>
               <div style={{...cardStyle, width: '200px'}}><h3>{assets.filter(a => a.category === 'Laptop').length}</h3><p>Laptopów</p></div>
               <div style={{...cardStyle, width: '200px'}}><h3>{assets.filter(a => a.category === 'Mobile Phone').length}</h3><p>Telefonów</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// STYLE
const navItemStyle = { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' };
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd' };
const buttonStyle = { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as const };
const cellStyle = { padding: '15px 10px' };
const badgeStyle = { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' as const };

export default AssetTable;