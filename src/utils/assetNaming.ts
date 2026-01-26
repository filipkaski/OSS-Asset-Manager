import { ITAsset } from '../types/assets';

/**
 * Funkcja automatyzująca nazewnictwo urządzeń zgodnie z logiką zakładową.
 * Dokumentuje proces opisany w rozdziale dotyczącym automatyzacji zasobów IT.
 */
export const generateAssetName = (asset: Partial<ITAsset>): string => {
  const { category, serialNumber, queueName, modelName } = asset;

  if (category === 'Printer' && queueName) {
    return queueName; // Dla drukarek nazwa to Queue Name (np. NW11)
  }

  if (!serialNumber) return 'UNKNOWN-SN';

  if (category === 'Laptop') {
    // Logika dla laptopów typu LAF (AZ + SN)
    if (modelName?.includes('LAF')) {
      return `AZ${serialNumber}`;
    }
    // Standardowy laptop (W + SN)
    return `W${serialNumber}`;
  }

  if (category === 'Desktop') {
    return `W${serialNumber}`; // Desktopy zawsze z przedrostkiem W
  }

  if (category === 'Mobile Phone' || category === 'Terminal') {
    return asset.assetTag || `M-${serialNumber}`; // Telefony używają Tagu M00...
  }

  return serialNumber; // Fallback: sam numer seryjny
};