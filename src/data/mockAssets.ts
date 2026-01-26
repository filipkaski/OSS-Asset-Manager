import { ITAsset } from '../types/assets';

export const MOCK_ASSETS: ITAsset[] = [
  {
    id: 'MOB0017807',
    assetName: 'M0046454', // Już istniejąca nazwa
    assetTag: 'M0046454',
    serialNumber: 'RZCT80MB8DD',
    imeiNumber: '354945971412737',
    manufacturer: 'Samsung',
    modelName: 'Galaxy A52',
    modelNumber: 'A52',
    category: 'Mobile Phone',
    deviceRole: 'Mobile Phone',
    assignedTo: 'Filip Kas',
    location: 'Label Mill - Wrocław',
    zone: 'Finishing',
    status: 'Disposed',
    lastUpdate: new Date('2026-01-26')
  },
  {
    id: 'ASM0913522',
    assetName: 'WPF1W7YJE', // Istniejąca nazwa W+SN
    assetTag: 'M0099887',
    serialNumber: 'PF1W7YJE',
    biosGuid: '2BB2CE4C-22A9-11B2-A85C-A405701FE1DC',
    manufacturer: 'Lenovo',
    modelName: 'ThinkPad L490',
    modelNumber: '20Q6S1MW14',
    category: 'Laptop',
    deviceRole: 'Standard Office Workstation',
    assignedTo: 'Filip Kas',
    location: 'Label Mill - Wrocław',
    zone: 'Office',
    status: 'Active',
    lastUpdate: new Date('2026-01-26')
  },
  {
    id: 'ASM0849628',
    assetName: 'NW11', // Nazwa z Queue Name
    assetTag: 'M0077665',
    serialNumber: '4MT20861',
    queueName: 'NW11',
    manufacturer: 'Canon',
    modelName: 'ImageRunner iR-ADV C3922',
    modelNumber: 'iR-ADV C3922',
    category: 'Printer',
    deviceRole: 'Multifunctional Device',
    assignedTo: 'Radosław Jankowski',
    location: 'Label Mill - Nowa Wieś',
    zone: 'Despatch',
    building: 'Fabryka',
    room: 'Despatch office',
    status: 'Active',
    lastUpdate: new Date('2026-01-26')
  }
];