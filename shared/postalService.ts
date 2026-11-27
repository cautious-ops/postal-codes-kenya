import { RAW_POSTAL_RECORDS } from './postalData.ts';

export interface PostalEntry {
  location: string;
  code: string;
  regionId: string;
  regionName: string;
  prefix: string;
}

export interface RegionMeta {
  id: string;
  name: string;
  prefixRange: string;
  majorHubs: string;
}

export interface RegionSummary extends RegionMeta {
  count: number;
  minCode: string;
  maxCode: string;
}

export interface PostalQueryOptions {
  q?: string;
  code?: string;
  region?: string;
  limit?: number;
  offset?: number;
}

export interface PostalQueryResult {
  total: number;
  count: number;
  limit: number;
  offset: number;
  results: PostalEntry[];
}

export const KENYA_REGIONS: readonly RegionMeta[] = [
  { id: '0', name: 'Nairobi & Metro', prefixRange: '00xxx–01xxx', majorHubs: 'Nairobi GPO, Westlands, Kiambu, Kajiado' },
  { id: '1', name: 'Central', prefixRange: '10xxx', majorHubs: 'Nyeri, Karatina, Kerugoya, Nanyuki' },
  { id: '2', name: 'South & Central Rift', prefixRange: '20xxx', majorHubs: 'Nakuru, Naivasha, Kericho, Narok' },
  { id: '3', name: 'North Rift', prefixRange: '30xxx', majorHubs: 'Eldoret, Kitale, Kapsabet, Lodwar' },
  { id: '4', name: 'Nyanza', prefixRange: '40xxx', majorHubs: 'Kisumu, Kisii, Homa Bay, Siaya' },
  { id: '5', name: 'Western', prefixRange: '50xxx', majorHubs: 'Kakamega, Bungoma, Busia, Vihiga' },
  { id: '6', name: 'Upper Eastern', prefixRange: '60xxx', majorHubs: 'Embu, Meru, Isiolo, Marsabit' },
  { id: '7', name: 'North Eastern', prefixRange: '70xxx', majorHubs: 'Garissa, Wajir, Mandera, Dadaab' },
  { id: '8', name: 'Coast', prefixRange: '80xxx', majorHubs: 'Mombasa, Malindi, Ukunda, Lamu' },
  { id: '9', name: 'Lower Eastern', prefixRange: '90xxx', majorHubs: 'Machakos, Kitui, Makueni, Mwingi' },
];

const REGION_BY_ID = new Map<string, RegionMeta>(
  KENYA_REGIONS.map((region) => [region.id, region])
);

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'");
}

export const POSTAL_ENTRIES: readonly PostalEntry[] = RAW_POSTAL_RECORDS.map((record) => {
  const paddedCode = record.code.padStart(5, '0');
  const regionId = paddedCode.charAt(0);
  const regionMeta = REGION_BY_ID.get(regionId);
  return {
    location: record.location,
    code: paddedCode,
    regionId,
    regionName: regionMeta ? regionMeta.name : 'Other',
    prefix: paddedCode.slice(0, 2),
  };
});

export function getRegionsSummary(): RegionSummary[] {
  return KENYA_REGIONS.map((region) => {
    const entries = POSTAL_ENTRIES.filter((entry) => entry.regionId === region.id);
    const sortedCodes = entries.map((e) => e.code).sort();
    return {
      ...region,
      count: entries.length,
      minCode: sortedCodes[0] ?? '',
      maxCode: sortedCodes[sortedCodes.length - 1] ?? '',
    };
  });
}

export function lookupByExactCode(rawCode: string): PostalEntry[] {
  const cleaned = rawCode.trim();
  if (!cleaned) return [];
  const padded = /^\d+$/.test(cleaned) ? cleaned.padStart(5, '0') : cleaned;
  return POSTAL_ENTRIES.filter((entry) => entry.code === padded);
}

export function queryPostalCodes(options: PostalQueryOptions = {}): PostalQueryResult {
  const normalizedQ = options.q ? normalizeSearchText(options.q) : '';
  const normalizedCode = options.code ? options.code.trim() : '';
  const normalizedRegion = options.region ? options.region.trim() : '';

  let filtered = POSTAL_ENTRIES.slice();

  if (normalizedRegion && normalizedRegion !== 'all') {
    filtered = filtered.filter((entry) => entry.regionId === normalizedRegion);
  }

  if (normalizedCode) {
    const padded = /^\d+$/.test(normalizedCode) && normalizedCode.length <= 5
      ? normalizedCode
      : normalizedCode;
    filtered = filtered.filter(
      (entry) => entry.code === padded.padStart(5, '0') || entry.code.startsWith(padded)
    );
  }

  if (normalizedQ) {
    const scored: Array<{ entry: PostalEntry; score: number }> = [];
    for (const entry of filtered) {
      const locNorm = normalizeSearchText(entry.location);
      const codeNorm = entry.code.toLowerCase();
      const regionNorm = normalizeSearchText(entry.regionName);

      if (codeNorm === normalizedQ || locNorm === normalizedQ) {
        scored.push({ entry, score: 0 });
      } else if (locNorm.startsWith(normalizedQ) || codeNorm.startsWith(normalizedQ)) {
        scored.push({ entry, score: 1 });
      } else if (locNorm.includes(normalizedQ) || codeNorm.includes(normalizedQ)) {
        scored.push({ entry, score: 2 });
      } else if (regionNorm.includes(normalizedQ)) {
        scored.push({ entry, score: 3 });
      }
    }
    scored.sort((a, b) => a.score - b.score || a.entry.location.localeCompare(b.entry.location));
    filtered = scored.map((item) => item.entry);
  }

  const total = filtered.length;
  const safeOffset = Number.isFinite(options.offset) && (options.offset ?? 0) > 0
    ? Math.floor(options.offset!)
    : 0;
  const safeLimit = Number.isFinite(options.limit) && (options.limit ?? 0) > 0
    ? Math.min(Math.floor(options.limit!), 1000)
    : 50;

  const results = filtered.slice(safeOffset, safeOffset + safeLimit);

  return {
    total,
    count: results.length,
    limit: safeLimit,
    offset: safeOffset,
    results,
  };
}

export function entriesToCsv(entries: readonly PostalEntry[]): string {
  const escapeCsv = (val: string) =>
    /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;

  const header = 'Location,Postal Address,Region';
  const rows = entries.map(
    (entry) =>
      `${escapeCsv(entry.location)},${escapeCsv(entry.code)},${escapeCsv(entry.regionName)}`
  );
  return [header, ...rows].join('\n');
}
