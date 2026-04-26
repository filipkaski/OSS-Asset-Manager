export type AssetStatus =
  | 'Active' | 'Active - Spare' | 'In Stock'
  | 'In Stock - Low Usage' | 'Retired' | 'Lost' | 'Stolen' | 'Disposed';

export type AssetCategory = 'Mobile Phone' | 'Laptop' | 'Desktop' | 'Printer';

export type OperationalZone =
  | 'Finishing' | 'Coating' | 'Mixing' | 'Despatch'
  | 'Receiving' | 'Office' | 'Security Gate' | 'R&D';

export interface ITAsset {
  id: string;
  assetName: string;
  assetTag: string;
  serialNumber: string;
  imeiNumber?: string;
  biosGuid?: string;
  queueName?: string;
  manufacturer: string;
  modelName: string;
  modelNumber: string;
  category: AssetCategory;
  deviceRole: string;
  assignedTo: string;
  location: string;
  zone: OperationalZone;
  building?: string;
  room?: string;
  status: AssetStatus;
  lastUpdate: Date;
  notes?: string;
}
