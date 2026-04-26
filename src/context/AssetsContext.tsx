import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ITAsset } from '../types/assets';

const API = 'http://localhost:3001/api/assets';

// Daty z API wracają jako stringi ISO — konwertujemy na Date
const hydrate = (a: any): ITAsset => ({
  ...a,
  lastUpdate: a.lastUpdate ? new Date(a.lastUpdate) : new Date(),
});

interface AssetsContextType {
  assets: ITAsset[];
  loading: boolean;
  error: string | null;
  addAsset: (asset: ITAsset) => Promise<void>;
  updateAsset: (id: string, updates: Partial<ITAsset>) => Promise<void>;
  reload: () => void;
}

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
  loading: false,
  error: null,
  addAsset: async () => {},
  updateAsset: async () => {},
  reload: () => {},
});

export const AssetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}?limit=200`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAssets((json.data ?? json).map(hydrate));
    } catch (e: any) {
      setError(e.message ?? 'Błąd połączenia z API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const addAsset = async (a: ITAsset): Promise<void> => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    const created = hydrate(await res.json());
    setAssets(p => [created, ...p]);
  };

  const updateAsset = async (id: string, updates: Partial<ITAsset>): Promise<void> => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    const updated = hydrate(await res.json());
    setAssets(p => p.map(a => a.id === id ? updated : a));
  };

  return (
    <AssetsContext.Provider value={{ assets, loading, error, addAsset, updateAsset, reload: fetchAssets }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => useContext(AssetsContext);
