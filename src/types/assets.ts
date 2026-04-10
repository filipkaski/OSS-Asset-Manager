export type OperationalZone = 
  | 'Finishing' | 'Coating' | 'Mixing' | 'Despatch' 
  | 'Receiving' | 'Office' | 'Security Gate' | 'R&D';

export type AssetStatus = 
  | 'In Stock' | 'In Stock - Low Usage' | 'Active' 
  | 'Active - Spare' | 'Retired' | 'Lost' 
  | 'Stolen' | 'Disposed';

export type AssetCategory = 'Mobile Phone' | 'Laptop' | 'Desktop' | 'Printer';

export interface ITAsset {
  id: string;                // Systemowe ID (np. ASM0849628)
  assetName: string;         // Generowane: W+SN, AZ+SN lub Queue Name dla drukarek
  assetTag: string;          // Twoja numeracja M00...
  serialNumber: string;      // Kluczowy SN z naklejki
  
  // Specyficzne pola z Twoich screenów
  imeiNumber?: string;       // Dla Mobile
  biosGuid?: string;         // Dla Laptop/Desktop
  queueName?: string;        // Specyficzne dla Printer (np. NW11)
  
  manufacturer: string;      // Samsung, Lenovo, Canon
  modelName: string;         // np. ImageRunner iR-ADV C3922
  modelNumber: string;       // np. iR-ADV C3922
  
  category: AssetCategory;
  deviceRole: string;        // np. Multifunctional Device, Standard Workstation
  assignedTo: string;        // Użytkownik (np. Radosław Jankowski)
  
  // Lokalizacja i strefy
  location: string;          // Fabryka (np. Label Mill - Nowa Wieś)
  zone: OperationalZone;     // Twoja strefa operacyjna
  building?: string;         // Dodatkowe pole ze screena drukarki
  room?: string;             // np. Despatch office
  
  status: AssetStatus;
  lastUpdate: Date;
  notes?: string;
}