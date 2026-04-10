import { ITAsset, AssetCategory, AssetStatus, OperationalZone } from '../types/assets';

// Deterministyczny pseudo-random - te same ziarna = te same wyniki
const sr = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const pick = <T>(arr: T[], seed: number): T => arr[Math.floor(sr(seed) * arr.length)];

const PEOPLE = [
  'Filip Kaski', 'Anna Kowalska', 'Piotr Nowak', 'Radosław Jankowski',
  'Katarzyna Wiśniewska', 'Marek Zielewski', 'Joanna Kamińska',
  'Tomasz Wróblewski', 'Agnieszka Kowalczyk', 'Michał Lewandowski',
  'Barbara Dąbrowska', 'Krzysztof Szymański', 'Monika Woźniak',
  'Paweł Kaczmarek', 'Magdalena Mazur', 'Andrzej Witek',
  'Dominika Lis', 'Sławomir Kos', 'Natalia Baran', 'Łukasz Kubiak',
];

const LOCATIONS = [
  'Label Mill - Wrocław', 'Label Mill - Wrocław', 'Label Mill - Wrocław',
  'Label Mill - Nowa Wieś', 'Label Mill - Nowa Wieś',
  'Label Mill - Warszawa',
];

// Wagi stref — Office najczęstsze
const ZONES: OperationalZone[] = [
  'Office', 'Office', 'Office', 'Office', 'Office',
  'Finishing', 'Finishing', 'Finishing',
  'Despatch', 'Despatch',
  'Receiving', 'Receiving',
  'Coating', 'Mixing',
  'Security Gate', 'R&D',
];

// Wagi statusów — większość Active
const STATUSES: AssetStatus[] = [
  'Active', 'Active', 'Active', 'Active', 'Active', 'Active',
  'Active - Spare', 'Active - Spare',
  'In Stock', 'In Stock',
  'Retired',
  'Disposed',
  'In Stock - Low Usage',
  'Lost',
  'Stolen',
];

interface ModelDef {
  manufacturer: string;
  modelName: string;
  modelNumber: string;
  role: string;
}

const MOBILE_MODELS: ModelDef[] = [
  { manufacturer: 'Samsung', modelName: 'Galaxy A52', modelNumber: 'SM-A525F', role: 'Mobile Phone' },
  { manufacturer: 'Samsung', modelName: 'Galaxy A53', modelNumber: 'SM-A536B', role: 'Mobile Phone' },
  { manufacturer: 'Samsung', modelName: 'Galaxy A54', modelNumber: 'SM-A546B', role: 'Mobile Phone' },
  { manufacturer: 'Samsung', modelName: 'Galaxy XCover 6 Pro', modelNumber: 'SM-G736B', role: 'Rugged Mobile Phone' },
  { manufacturer: 'Apple', modelName: 'iPhone 13', modelNumber: 'MLPF3B/A', role: 'Mobile Phone' },
  { manufacturer: 'Apple', modelName: 'iPhone 14', modelNumber: 'MPVX3B/A', role: 'Mobile Phone' },
  { manufacturer: 'Motorola', modelName: 'Moto G9 Plus', modelNumber: 'XT2087-2', role: 'Mobile Phone' },
  { manufacturer: 'Motorola', modelName: 'Moto G10', modelNumber: 'XT2127-2', role: 'Mobile Phone' },
];

const LAPTOP_MODELS: ModelDef[] = [
  { manufacturer: 'Lenovo', modelName: 'ThinkPad L490', modelNumber: '20Q6S1MW14', role: 'Standard Office Workstation' },
  { manufacturer: 'Lenovo', modelName: 'ThinkPad L580', modelNumber: '20LW000QPB', role: 'Standard Office Workstation' },
  { manufacturer: 'Lenovo', modelName: 'ThinkPad T480', modelNumber: '20L5000APB', role: 'Standard Office Workstation' },
  { manufacturer: 'Lenovo', modelName: 'ThinkPad T14 Gen 2', modelNumber: '20W0S0GS00', role: 'Manager Workstation' },
  { manufacturer: 'Dell', modelName: 'Latitude 5420', modelNumber: 'LAT5420', role: 'Standard Office Workstation' },
  { manufacturer: 'Dell', modelName: 'Latitude 5520', modelNumber: 'LAT5520', role: 'Standard Office Workstation' },
  { manufacturer: 'HP', modelName: 'EliteBook 840 G8', modelNumber: '3G1G7EA', role: 'Manager Workstation' },
  { manufacturer: 'HP', modelName: 'EliteBook 850 G7', modelNumber: '10U73EA', role: 'Standard Office Workstation' },
];

const DESKTOP_MODELS: ModelDef[] = [
  { manufacturer: 'Dell', modelName: 'OptiPlex 7090', modelNumber: 'OPTX7090', role: 'Standard Workstation' },
  { manufacturer: 'Dell', modelName: 'OptiPlex 5090', modelNumber: 'OPTX5090', role: 'Standard Workstation' },
  { manufacturer: 'HP', modelName: 'ProDesk 400 G7', modelNumber: '294S0EA', role: 'Standard Workstation' },
  { manufacturer: 'HP', modelName: 'ProDesk 600 G6', modelNumber: '273A3EA', role: 'Standard Workstation' },
  { manufacturer: 'Lenovo', modelName: 'ThinkCentre M70q', modelNumber: '11DT001FPB', role: 'Compact Workstation' },
];

const PRINTER_MODELS: ModelDef[] = [
  { manufacturer: 'Canon', modelName: 'ImageRunner iR-ADV C3922', modelNumber: 'iR-ADV C3922', role: 'Multifunctional Device' },
  { manufacturer: 'Canon', modelName: 'ImageRunner iR-ADV C5560', modelNumber: 'iR-ADV C5560', role: 'Multifunctional Device' },
  { manufacturer: 'HP', modelName: 'LaserJet Pro M428fdw', modelNumber: 'W1W47A', role: 'Network Printer' },
  { manufacturer: 'HP', modelName: 'LaserJet Enterprise M507dn', modelNumber: '1PV87A', role: 'Network Printer' },
  { manufacturer: 'Xerox', modelName: 'VersaLink C405', modelNumber: 'C405V_DN', role: 'Multifunctional Device' },
];

function genSN(seed: number, len = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, (_, i) =>
    chars[Math.floor(sr(seed * 13 + i * 7 + 1) * chars.length)]
  ).join('');
}

function genIMEI(seed: number): string {
  let imei = '35';
  for (let i = 0; i < 13; i++) imei += Math.floor(sr(seed * 17 + i * 3 + 1) * 10);
  return imei.slice(0, 15);
}

function genBIOSGUID(seed: number): string {
  const h = (s: number, len: number) => {
    const chars = '0123456789ABCDEF';
    return Array.from({ length: len }, (_, i) =>
      chars[Math.floor(sr(s + i * 11 + 1) * 16)]
    ).join('');
  };
  return `${h(seed, 8)}-${h(seed + 100, 4)}-${h(seed + 200, 4)}-${h(seed + 300, 4)}-${h(seed + 400, 12)}`;
}

function genDate(seed: number): Date {
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2026, 3, 1).getTime();
  return new Date(start + Math.floor(sr(seed) * (end - start)));
}

function generateAssets(): ITAsset[] {
  const assets: ITAsset[] = [];
  let globalSeed = 1;
  let mobCounter = 17808;
  let asmCounter = 913523;
  let tagCounter = 46455;
  let printerIdx = 1;

  // Realistyczny rozkład: dużo telefonów i laptopów, mało drukarek
  const batches: [AssetCategory, ModelDef[], number][] = [
    ['Mobile Phone', MOBILE_MODELS, 42],
    ['Laptop',       LAPTOP_MODELS, 36],
    ['Desktop',      DESKTOP_MODELS, 18],
    ['Printer',      PRINTER_MODELS, 11],
  ];

  for (const [category, models, count] of batches) {
    for (let i = 0; i < count; i++) {
      const s = globalSeed++;
      const model   = pick(models, s * 3);
      const zone    = pick(ZONES, s * 7) as OperationalZone;
      const location = pick(LOCATIONS, s * 11);
      const person  = pick(PEOPLE, s * 13);
      const status  = pick(STATUSES, s * 17) as AssetStatus;
      const sn      = genSN(s * 23);
      const date    = genDate(s * 29);

      const assetTag = `M${String(tagCounter++).padStart(7, '0')}`;
      const extra: Partial<ITAsset> = {};
      let id: string;
      let assetName: string;

      if (category === 'Mobile Phone') {
        id = `MOB${String(mobCounter++).padStart(7, '0')}`;
        assetName = assetTag;
        extra.imeiNumber = genIMEI(s * 31);
      } else if (category === 'Laptop' || category === 'Desktop') {
        id = `ASM${String(asmCounter++).padStart(7, '0')}`;
        assetName = `W${sn}`;
        extra.biosGuid = genBIOSGUID(s * 37);
      } else {
        // Printer
        id = `ASM${String(asmCounter++).padStart(7, '0')}`;
        const queueName = `NW${String(printerIdx++).padStart(2, '0')}`;
        assetName = queueName;
        extra.queueName = queueName;
        extra.building = pick(['Fabryka', 'Biuro', 'Magazyn'], s * 43);
        extra.room = pick(['Despatch office', 'Print room', 'Reception', 'Corridor'], s * 47);
      }

      assets.push({
        id,
        assetName,
        assetTag,
        serialNumber: sn,
        manufacturer: model.manufacturer,
        modelName: model.modelName,
        modelNumber: model.modelNumber,
        category,
        deviceRole: model.role,
        assignedTo: person,
        location,
        zone,
        status,
        lastUpdate: date,
        ...extra,
      });
    }
  }

  return assets;
}

export const MOCK_ASSETS: ITAsset[] = generateAssets();
