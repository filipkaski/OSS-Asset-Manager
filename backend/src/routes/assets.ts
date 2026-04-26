import { Router, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/** Prisma → JSON wysyłany do klienta */
const serialize = (asset: any) => ({
  ...asset,
  lastUpdate: asset.lastUpdate?.toISOString?.() ?? asset.lastUpdate,
  createdAt:  asset.createdAt?.toISOString?.()  ?? asset.createdAt,
  notes: asset.notes?.map((n: any) => ({
    ...n,
    createdAt: n.createdAt?.toISOString?.() ?? n.createdAt,
    updatedAt: n.updatedAt?.toISOString?.() ?? n.updatedAt,
  })),
  changeLogs: asset.changeLogs?.map((c: any) => ({
    ...c,
    changedAt: c.changedAt?.toISOString?.() ?? c.changedAt,
  })),
});

/** JSON z request → dane dla prisma.asset.create / update */
const toData = (body: any) => ({
  id:           body.id,
  assetName:    body.assetName,
  assetTag:     body.assetTag,
  serialNumber: body.serialNumber,
  imeiNumber:   body.imeiNumber   || null,
  biosGuid:     body.biosGuid     || null,
  queueName:    body.queueName    || null,
  manufacturer: body.manufacturer,
  modelName:    body.modelName,
  modelNumber:  body.modelNumber,
  category:     body.category,
  deviceRole:   body.deviceRole,
  assignedTo:   body.assignedTo,
  location:     body.location,
  zone:         body.zone,
  building:     body.building     || null,
  room:         body.room         || null,
  status:       body.status,
});

// ─────────────────────────────────────────────────────────────────────────────
// CSV helpers
// ─────────────────────────────────────────────────────────────────────────────

const CSV_COLS = [
  'id', 'assetName', 'assetTag', 'serialNumber',
  'imeiNumber', 'biosGuid', 'queueName',
  'manufacturer', 'modelName', 'modelNumber',
  'category', 'deviceRole', 'assignedTo',
  'location', 'zone', 'building', 'room',
  'status', 'lastUpdate',
];

const csvEscape = (v: any): string => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows: any[]): string =>
  [CSV_COLS.join(','), ...rows.map(r => CSV_COLS.map(c => csvEscape(r[c])).join(','))].join('\n');

const parseCsv = (text: string): Record<string, string>[] => {
  let lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  // Pomiń linię sep=, generowaną dla Excela
  if (lines[0]?.toLowerCase().startsWith('sep=')) lines = lines.slice(1);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const vals: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        vals.push(cur); cur = '';
      } else cur += ch;
    }
    vals.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']));
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// WAŻNE: /export i /import muszą być zarejestrowane PRZED /:id
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/assets/export/csv
router.get('/export/csv', async (_req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({ orderBy: { createdAt: 'asc' } });
    const csv = toCsv(assets.map(serialize));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition',
      `attachment; filename="assets-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + 'sep=,\n' + csv);
  } catch {
    res.status(500).json({ error: 'Błąd eksportu CSV' });
  }
});

// POST /api/assets/import/csv
router.post('/import/csv', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'Brak pliku. Wyślij plik CSV w polu "file" (multipart/form-data).' });
    return;
  }

  const text = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
  const rows = parseCsv(text);

  if (rows.length === 0) {
    res.status(400).json({ error: 'Plik CSV jest pusty lub ma nieprawidłowy format.' });
    return;
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const data = toData(row);
      if (!data.id) { errors.push(`Pomięto wiersz bez pola "id"`); continue; }

      const exists = await prisma.asset.findUnique({ where: { id: data.id } });
      if (exists) {
        await prisma.asset.update({ where: { id: data.id }, data });
        updated++;
      } else {
        await prisma.asset.create({ data });
        created++;
      }
    } catch (e: any) {
      errors.push(`${row['id'] ?? '?'}: ${e.message}`);
    }
  }

  res.json({ message: 'Import zakończony', created, updated, errors });
});

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/assets
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category, status, zone, location, search,
      page = '1', limit = '50',
    } = req.query as Record<string, string>;

    const where: any = {};
    if (category) where.category = category;
    if (status)   where.status   = status;
    if (zone)     where.zone     = zone;
    if (location) where.location = location;
    if (search)   where.OR = [
      { assetName:    { contains: search } },
      { serialNumber: { contains: search } },
      { assignedTo:   { contains: search } },
      { assetTag:     { contains: search } },
      { id:           { contains: search } },
    ];

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { lastUpdate: 'desc' },
        include: { _count: { select: { notes: true, changeLogs: true } } },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      data:  assets.map(serialize),
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch {
    res.status(500).json({ error: 'Błąd pobierania assetów' });
  }
});

// GET /api/assets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        notes:      { orderBy: { createdAt: 'desc' } },
        changeLogs: {
          orderBy: { changedAt: 'desc' },
          take: 30,
          include: { changedBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!asset) {
      res.status(404).json({ error: `Asset ${req.params.id} nie istnieje` });
      return;
    }

    res.json(serialize(asset));
  } catch {
    res.status(500).json({ error: 'Błąd pobierania assetu' });
  }
});

// POST /api/assets
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = toData(req.body);

    if (!data.id || !data.assetTag || !data.serialNumber || !data.manufacturer) {
      res.status(400).json({ error: 'Wymagane pola: id, assetTag, serialNumber, manufacturer' });
      return;
    }

    const asset = await prisma.asset.create({ data });
    res.status(201).json(serialize(asset));
  } catch (e: any) {
    if (e.code === 'P2002') {
      const field = e.meta?.target?.[0] ?? 'pole';
      res.status(409).json({ error: `Duplikat: ${field} już istnieje w bazie` });
    } else {
      res.status(500).json({ error: 'Błąd tworzenia assetu' });
    }
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: `Asset ${id} nie istnieje` });
      return;
    }

    const updates = toData({ ...existing, ...req.body, id });

    const TRACKED = ['status', 'assignedTo', 'zone', 'location', 'building', 'room'] as const;
    const logEntries = TRACKED
      .filter(f => String((existing as any)[f] ?? '') !== String((updates as any)[f] ?? ''))
      .map(f => ({
        assetId:  id,
        field:    f,
        oldValue: String((existing as any)[f] ?? '') || null,
        newValue: String((updates as any)[f] ?? '') || null,
      }));

    const [updatedAsset] = await prisma.$transaction([
      prisma.asset.update({ where: { id }, data: updates }),
      ...logEntries.map(entry => prisma.changeLog.create({ data: entry })),
    ]);

    res.json(serialize(updatedAsset));
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ error: 'Konflikt unikalności (assetTag lub serialNumber)' });
    } else {
      res.status(500).json({ error: 'Błąd aktualizacji assetu' });
    }
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: any) {
    if (e.code === 'P2025') {
      res.status(404).json({ error: `Asset ${req.params.id} nie istnieje` });
    } else {
      res.status(500).json({ error: 'Błąd usuwania assetu' });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/assets/:id/notes
router.post('/:id/notes', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    res.status(400).json({ error: 'Treść notatki nie może być pusta.' });
    return;
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) { res.status(404).json({ error: `Asset ${id} nie istnieje` }); return; }

    const note = await prisma.note.create({
      data: { content: content.trim(), assetId: id },
    });

    res.status(201).json({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Błąd dodawania notatki' });
  }
});

// DELETE /api/assets/:id/notes/:noteId
router.delete('/:id/notes/:noteId', async (req: Request, res: Response) => {
  const noteId = parseInt(req.params.noteId);
  if (isNaN(noteId)) { res.status(400).json({ error: 'Nieprawidłowe ID notatki' }); return; }

  try {
    await prisma.note.delete({ where: { id: noteId } });
    res.status(204).send();
  } catch (e: any) {
    if (e.code === 'P2025') {
      res.status(404).json({ error: 'Notatka nie istnieje' });
    } else {
      res.status(500).json({ error: 'Błąd usuwania notatki' });
    }
  }
});

export default router;
