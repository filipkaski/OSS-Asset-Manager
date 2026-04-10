import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AssetTable from './components/AssetTable';
import AssetDetail from './components/AssetDetail';
import StatsPanel from './components/StatsPanel';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/assets" replace />} />
    <Route element={<Layout />}>
      <Route path="/assets"     element={<AssetTable />} />
      <Route path="/assets/:id" element={<AssetDetail />} />
      <Route path="/stats"      element={<StatsPanel />} />
    </Route>
    <Route path="*" element={<Navigate to="/assets" replace />} />
  </Routes>
);

export default App;
