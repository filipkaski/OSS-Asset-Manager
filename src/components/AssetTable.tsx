import React, { useState } from 'react';
import { MOCK_ASSETS } from '../data/mockAssets';
import { ITAsset } from '../types/assets';

const AssetTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Logika filtrowania - szukamy po nazwie, tagu, seryjnym lub nazwisku
  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      asset.assetName.toLowerCase().includes(searchStr) ||
      asset.assetTag.toLowerCase().includes(searchStr) ||
      asset.serialNumber.toLowerCase().includes(searchStr) ||
      asset.assignedTo.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h2>Ewidencja Zasobów IT - OSS Asset Manager</h2>
      
      {/* Pasek wyszukiwania */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Szukaj po nazwie, SN, Tagu lub nazwisku..."
          style={{ padding: '10px', width: '350px', borderRadius: '5px', border: '1px solid #ccc' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span style={{ marginLeft: '10px', color: '#666' }}>
          Znaleziono: {filteredAssets.length}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={tableHeaderStyle}>Device Info</th>
            <th style={tableHeaderStyle}>Category</th>
            <th style={tableHeaderStyle}>Zone / Room</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssets.map((asset: ITAsset) => (
            <tr key={asset.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}>
                <strong>{asset.assetName}</strong> <br />
                <small>SN: {asset.serialNumber}</small>
              </td>
              <td style={tableCellStyle}>{asset.category}</td>
              <td style={tableCellStyle}>
                <span style={zoneBadgeStyle}>{asset.zone}</span> <br />
                {asset.room && <small>{asset.room}</small>}
              </td>
              <td style={tableCellStyle}>
                <span style={getStatusStyle(asset.status)}>{asset.status}</span>
              </td>
              <td style={tableCellStyle}>{asset.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Style ---
const tableHeaderStyle = { padding: '15px' };
const tableCellStyle = { padding: '15px' };
const zoneBadgeStyle = { backgroundColor: '#e8f4fd', color: '#2b5a83', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' as const };

const getStatusStyle = (status: string) => {
  const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.85em', color: 'white', fontWeight: 'bold' as const };
  if (status === 'Active') return { ...base, backgroundColor: '#27ae60' };
  if (status === 'Disposed') return { ...base, backgroundColor: '#c0392b' };
  if (status.includes('Stock')) return { ...base, backgroundColor: '#f39c12' };
  return { ...base, backgroundColor: '#7f8c8d' };
};

export default AssetTable;