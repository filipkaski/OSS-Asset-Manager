import React, { createContext, useContext, useState } from 'react';
import { MOCK_ASSETS } from '../data/mockAssets';
import { ITAsset } from '../types/assets';

interface AssetsContextType {
  assets: ITAsset[];
  addAsset: (asset: ITAsset) => void;
  updateAsset: (id: string, updates: Partial<ITAsset>) => void;
}

const AssetsContext = createContext<AssetsContextType>({ assets: [], addAsset: () => {}, updateAsset: () => {} });

export const AssetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<ITAsset[]>(MOCK_ASSETS);

  const addAsset = (a: ITAsset) => setAssets(p => [a, ...p]);
  const updateAsset = (id: string, updates: Partial<ITAsset>) =>
    setAssets(p => p.map(a => a.id === id ? { ...a, ...updates } : a));

  return (
    <AssetsContext.Provider value={{ assets, addAsset, updateAsset }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => useContext(AssetsContext);
