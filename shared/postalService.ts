import { RAW_POSTAL_RECORDS } from './postalData.ts';

export interface CountyMeta {
  code: string;
  slug: string;
  name: string;
  headquarters: string;
  aliases: string;
}

export interface PostalEntry {
  location: string;
  code: string;
  slug: string;
  countyCode: string;
  countySlug: string;
  countyName: string;
  prefix: string;
}

export interface CountySummary extends CountyMeta {
  count: number;
  minCode: string;
  maxCode: string;
  sampleOffices: string;
}

export interface PostalQueryOptions {
  q?: string;
  code?: string;
  county?: string;
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

export const KENYA_COUNTIES: readonly CountyMeta[] = [
  { code: '001', slug: 'mombasa', name: 'Mombasa', headquarters: 'Mombasa', aliases: 'Mombasa, Nyali, Bamburi, Changamwe, Likoni, Makupa' },
  { code: '002', slug: 'kwale', name: 'Kwale', headquarters: 'Kwale', aliases: 'Kwale, Ukunda, Diani, Matuga, Lunga Lunga' },
  { code: '003', slug: 'kilifi', name: 'Kilifi', headquarters: 'Kilifi', aliases: 'Kilifi, Malindi, Watamu, Mtwapa, Kaloleni, Mariakani' },
  { code: '004', slug: 'tana-river', name: 'Tana River', headquarters: 'Hola', aliases: 'Hola, Garsen, Bura Tana, Madogo' },
  { code: '005', slug: 'lamu', name: 'Lamu', headquarters: 'Lamu', aliases: 'Lamu, Faza, Witu, Mpeketoni' },
  { code: '006', slug: 'taita-taveta', name: 'Taita-Taveta', headquarters: 'Wundanyi', aliases: 'Voi, Wundanyi, Taveta, Mwatate' },
  { code: '007', slug: 'garissa', name: 'Garissa', headquarters: 'Garissa', aliases: 'Garissa, Dadaab' },
  { code: '008', slug: 'wajir', name: 'Wajir', headquarters: 'Wajir', aliases: 'Wajir, Habaswein, Griftu' },
  { code: '009', slug: 'mandera', name: 'Mandera', headquarters: 'Mandera', aliases: 'Mandera, El Wak' },
  { code: '010', slug: 'marsabit', name: 'Marsabit', headquarters: 'Marsabit', aliases: 'Marsabit, Loiyangalani, Laisamis, Moyale' },
  { code: '011', slug: 'isiolo', name: 'Isiolo', headquarters: 'Isiolo', aliases: 'Isiolo, Garba Tulla, Merti' },
  { code: '012', slug: 'meru', name: 'Meru', headquarters: 'Meru', aliases: 'Meru, Nkubu, Maua, Laare, Timau' },
  { code: '013', slug: 'tharaka-nithi', name: 'Tharaka-Nithi', headquarters: 'Kathwana', aliases: 'Chuka, Chogoria, Kathwana, Marimanti' },
  { code: '014', slug: 'embu', name: 'Embu', headquarters: 'Embu', aliases: 'Embu, Siakago, Runyenjes, Ishiara' },
  { code: '015', slug: 'kitui', name: 'Kitui', headquarters: 'Kitui', aliases: 'Kitui, Mwingi, Kabati, Mutomo, Migwani' },
  { code: '016', slug: 'machakos', name: 'Machakos', headquarters: 'Machakos', aliases: 'Machakos, Athi River, Mlolongo, Kangundo, Matuu, Syokimau' },
  { code: '017', slug: 'makueni', name: 'Makueni', headquarters: 'Wote', aliases: 'Wote, Makueni, Emali, Kibwezi, Makindu, Mbumbuni, Sultan Hamud' },
  { code: '018', slug: 'nyandarua', name: 'Nyandarua', headquarters: 'Ol Kalou', aliases: 'Ol Kalou, Engineer, North Kinangop, Ndaragwa, Ol Joro Orok' },
  { code: '019', slug: 'nyeri', name: 'Nyeri', headquarters: 'Nyeri', aliases: 'Nyeri, Karatina, Othaya, Naro Moru, Mukurweini' },
  { code: '020', slug: 'kirinyaga', name: 'Kirinyaga', headquarters: 'Kerugoya', aliases: 'Kerugoya, Sagana, Kagio, Kianyaga, Wanguru, Mwea' },
  { code: '021', slug: 'muranga', name: "Murang'a", headquarters: "Murang'a", aliases: "Muranga, Murang'a, Kenol, Kangema, Maragua, Kandara, Makuyu" },
  { code: '022', slug: 'kiambu', name: 'Kiambu', headquarters: 'Kiambu', aliases: 'Kiambu, Thika, Ruiru, Juja, Kikuyu, Limuru, Githunguri, Wangige, Gatundu' },
  { code: '023', slug: 'turkana', name: 'Turkana', headquarters: 'Lodwar', aliases: 'Lodwar, Kakuma, Lokichoggio, Kalokol, Lokitaung' },
  { code: '024', slug: 'west-pokot', name: 'West Pokot', headquarters: 'Kapenguria', aliases: 'Kapenguria, Makutano, Chepareria, Kacheliba' },
  { code: '025', slug: 'samburu', name: 'Samburu', headquarters: 'Maralal', aliases: 'Maralal, Baragoi, Wamba' },
  { code: '026', slug: 'trans-nzoia', name: 'Trans Nzoia', headquarters: 'Kitale', aliases: 'Kitale, Endebess, Matunda, Kapsara' },
  { code: '027', slug: 'uasin-gishu', name: 'Uasin Gishu', headquarters: 'Eldoret', aliases: 'Eldoret, Eldoret GPO, Burnt Forest, Turbo, Ziwa, Kesses' },
  { code: '028', slug: 'elgeyo-marakwet', name: 'Elgeyo-Marakwet', headquarters: 'Iten', aliases: 'Iten, Kapsowar, Chepkorio, Kapcherop' },
  { code: '029', slug: 'nandi', name: 'Nandi', headquarters: 'Kapsabet', aliases: 'Kapsabet, Nandi Hills, Mosoriot, Kabiyet' },
  { code: '030', slug: 'baringo', name: 'Baringo', headquarters: 'Kabarnet', aliases: 'Kabarnet, Eldama Ravine, Marigat, Kabartonjo' },
  { code: '031', slug: 'laikipia', name: 'Laikipia', headquarters: 'Rumuruti', aliases: 'Nanyuki, Nyahururu, Rumuruti, Dol Dol' },
  { code: '032', slug: 'nakuru', name: 'Nakuru', headquarters: 'Nakuru', aliases: 'Nakuru, Naivasha, Gilgil, Njoro, Molo, Elburgon, Rongai' },
  { code: '033', slug: 'narok', name: 'Narok', headquarters: 'Narok', aliases: 'Narok, Kilgoris, Lolgorian, Maasai Mara' },
  { code: '034', slug: 'kajiado', name: 'Kajiado', headquarters: 'Kajiado', aliases: 'Kajiado, Ongata Rongai, Ngong, Kitengela, Namanga, Loitoktok, Isinya' },
  { code: '035', slug: 'kericho', name: 'Kericho', headquarters: 'Kericho', aliases: 'Kericho, Litein, Londiani, Kipkelion, Kapkatet' },
  { code: '036', slug: 'bomet', name: 'Bomet', headquarters: 'Bomet', aliases: 'Bomet, Sotik, Longisa, Chebunyo' },
  { code: '037', slug: 'kakamega', name: 'Kakamega', headquarters: 'Kakamega', aliases: 'Kakamega, Mumias, Butere, Malava, Lugari, Lumakanda' },
  { code: '038', slug: 'vihiga', name: 'Vihiga', headquarters: 'Mbale', aliases: 'Vihiga, Mbale, Maragoli, Luanda, Chavakali, Hamisi' },
  { code: '039', slug: 'bungoma', name: 'Bungoma', headquarters: 'Bungoma', aliases: 'Bungoma, Webuye, Kimilili, Chwele, Kapsokwony' },
  { code: '040', slug: 'busia', name: 'Busia', headquarters: 'Busia', aliases: 'Busia, Malaba, Amagoro, Port Victoria, Bumala, Nambale' },
  { code: '041', slug: 'siaya', name: 'Siaya', headquarters: 'Siaya', aliases: 'Siaya, Bondo, Ugunja, Yala, Ukwala, Usenge' },
  { code: '042', slug: 'kisumu', name: 'Kisumu', headquarters: 'Kisumu', aliases: 'Kisumu, Ahero, Maseno, Muhoroni, Chemelil, Katito' },
  { code: '043', slug: 'homa-bay', name: 'Homa Bay', headquarters: 'Homa Bay', aliases: 'Homa Bay, Mbita, Kendu Bay, Ndhiwa, Oyugis' },
  { code: '044', slug: 'migori', name: 'Migori', headquarters: 'Migori', aliases: 'Migori, Kehancha, Isibania, Awendo, Rongo, Uriri, Nyatike' },
  { code: '045', slug: 'kisii', name: 'Kisii', headquarters: 'Kisii', aliases: 'Kisii, Ogembo, Keroka, Suneka, Nyamache, Keumbu' },
  { code: '046', slug: 'nyamira', name: 'Nyamira', headquarters: 'Nyamira', aliases: 'Nyamira, Nyansiongo, Kebirigo, Keroka' },
  { code: '047', slug: 'nairobi', name: 'Nairobi', headquarters: 'Nairobi', aliases: 'Nairobi, Nairobi GPO, Westlands, Karen, Eastleigh, Embakasi, Kasarani, Langata, Buru Buru' },
];

const COUNTY_BY_SLUG = new Map<string, CountyMeta>(
  KENYA_COUNTIES.map((county) => [county.slug, county])
);

const COUNTY_BY_CODE = new Map<string, CountyMeta>(
  KENYA_COUNTIES.map((county) => [county.code, county])
);

function resolveCountySlug(location: string, paddedCode: string): string {
  const loc = location.trim().toLowerCase();
  const p3 = paddedCode.slice(0, 3);

  // Explicit office-level county overrides where Posta Kenya routing prefixes cross county borders
  const exactCodeLocationOverrides: Record<string, string> = {
    '00127': 'makueni', // Mbumbuni
    '00204': 'machakos', // Athi River
    '00205': 'kajiado', // Magadi
    '00207': 'kajiado', // Namanga
    '00208': 'kajiado', // Ngong Hills
    '00209': 'kajiado', // Loitoktok
    '00213': 'kajiado', // Oltepesi
    '00214': 'kajiado', // Ilasit
    '00242': 'kajiado', // Ewaso Kedong
    '00511': 'kajiado', // Ongata Rongai
    '00607': 'kiambu', // Kamiti
    '00614': 'kiambu', // Wangige
    '01013': 'muranga', // Gatura
    '01015': 'muranga', // Ithanga
    '01016': 'machakos', // Ndithini
    '01020': 'muranga', // Makuyu
    '01029': 'muranga', // Migioini
    '01032': 'muranga', // Githumu
    '01033': 'muranga', // Kagunduini
    '10334': 'muranga', // Kandara
    '20103': 'baringo', // Eldama Ravine
    '20124': 'nyandarua', // Mirangine
    '20126': 'nyandarua', // Ngorika
    '20140': 'baringo', // Emining
    '20145': 'baringo', // Maji Mazuri
    '20149': 'baringo', // Makumbi
    '20300': 'laikipia', // Nyahururu
    '20307': 'laikipia', // Igwamiti
    '20322': 'laikipia', // Marmanet
    '20329': 'laikipia', // Wiyumiririe
    '20330': 'laikipia', // Laikipia Campus
    '30113': 'elgeyo-marakwet', // Kamwosor
    '30119': 'elgeyo-marakwet', // Kapkenda
    '30121': 'nandi', // Chepterwai
    '30123': 'nandi', // Ndalat
    '30125': 'elgeyo-marakwet', // Chebororwa
    '30129': 'elgeyo-marakwet', // Chepkorio
    '30130': 'elgeyo-marakwet', // Kabiemit
    '30131': 'elgeyo-marakwet', // Nyaru
    '30204': 'elgeyo-marakwet', // Kapcherop
    '30214': 'uasin-gishu', // Ziwa
    '40127': 'vihiga', // Nyangori
    '40139': 'siaya', // Akala
    '40140': 'siaya', // Aluor
    '40143': 'nandi', // Chemase
    '40222': 'homa-bay', // Oyugis
    '40223': 'homa-bay', // Kadongo
    '40224': 'homa-bay', // Othoro
    '40225': 'homa-bay', // Mikayi
    '40227': 'homa-bay', // Oriang
    '40228': 'migori', // Uriri
    '40331': 'migori', // Dede
    '40334': 'migori', // Oyani-masii
    '50239': 'kakamega', // Nangili
    '50240': 'kakamega', // Luandeti
    '50242': 'kakamega', // Lumakanda
    '50244': 'busia', // Amagoro
    '60214': 'tharaka-nithi', // Nkondi
    '60215': 'tharaka-nithi', // Marimanti
    '60402': 'meru', // Igoji
    '70101': 'tana-river', // Hola
    '70104': 'tana-river', // Bura Tana
    '80105': 'kilifi', // Kaloleni
    '80113': 'kilifi', // Mariakani
    '80114': 'kilifi', // Mazeras
    '80119': 'kilifi', // Vipingo
    '80201': 'tana-river', // Garsen
    '90120': 'makueni', // Iiani
    '90121': 'makueni', // Emali
    '90122': 'makueni', // Kalamba
    '90123': 'makueni', // Kasikeu
    '90126': 'makueni', // Kalawa
    '90129': 'makueni', // Ngwata
    '90130': 'makueni', // Nunguni
    '90134': 'makueni', // Yoani
    '90136': 'makueni', // Nzeeka
    '90137': 'makueni', // Kibwezi
    '90138': 'makueni', // Makindu
    '90140': 'makueni', // Matiliku
    '90143': 'makueni', // Nziu
    '90149': 'makueni', // Nthongoini
  };

  if (paddedCode === '10114' && loc === 'kakuzi') {
    return 'muranga';
  }
  if (exactCodeLocationOverrides[paddedCode]) {
    return exactCodeLocationOverrides[paddedCode];
  }

  // Standard 3-digit prefix to County mapping
  if (p3 === '001' || p3 === '005' || p3 === '006' || p3 === '008') return 'nairobi';
  if (p3 === '002') {
    if (loc === 'city square' || loc === 'kenyatta national hospital') return 'nairobi';
    return 'kiambu';
  }
  if (p3 === '009' || p3 === '010' || p3 === '100') return 'kiambu';
  if (p3 === '011') return 'kajiado';
  if (p3 === '101') return 'nyeri';
  if (p3 === '102') return 'muranga';
  if (p3 === '103') return 'kirinyaga';
  if (p3 === '104') return 'laikipia';
  if (p3 === '201') return 'nakuru';
  if (p3 === '202') return 'kericho';
  if (p3 === '203') return 'nyandarua';
  if (p3 === '204') return 'bomet';
  if (p3 === '205' || p3 === '407') return 'narok';
  if (p3 === '206') return 'samburu';
  if (p3 === '301') return 'uasin-gishu';
  if (p3 === '302') return 'trans-nzoia';
  if (p3 === '303') return 'nandi';
  if (p3 === '304') return 'baringo';
  if (p3 === '305') return 'turkana';
  if (p3 === '306') return 'west-pokot';
  if (p3 === '307') return 'elgeyo-marakwet';
  if (p3 === '401') return 'kisumu';
  if (p3 === '402') return 'kisii';
  if (p3 === '403') return 'homa-bay';
  if (p3 === '404') return 'migori';
  if (p3 === '405') return 'nyamira';
  if (p3 === '406') return 'siaya';
  if (p3 === '501') return 'kakamega';
  if (p3 === '502') return 'bungoma';
  if (p3 === '503') return 'vihiga';
  if (p3 === '504') return 'busia';
  if (p3 === '601') return 'embu';
  if (p3 === '602' || p3 === '606') return 'meru';
  if (p3 === '603') return 'isiolo';
  if (p3 === '604') return 'tharaka-nithi';
  if (p3 === '605') return 'marsabit';
  if (p3 === '701') return 'garissa';
  if (p3 === '702') return 'wajir';
  if (p3 === '703') return 'mandera';
  if (p3 === '801') return 'mombasa';
  if (p3 === '802') return 'kilifi';
  if (p3 === '803') return 'taita-taveta';
  if (p3 === '804') return 'kwale';
  if (p3 === '805') return 'lamu';
  if (p3 === '901') return 'machakos';
  if (p3 === '902' || p3 === '904') return 'kitui';
  if (p3 === '903') return 'makueni';

  return 'nairobi';
}

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/\s+/g, ' ');
}

export function slugifyLocation(location: string): string {
  return location
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const POSTAL_ENTRIES: readonly PostalEntry[] = RAW_POSTAL_RECORDS.map((record) => {
  const paddedCode = record.code.padStart(5, '0');
  const countySlug = resolveCountySlug(record.location, paddedCode);
  const countyMeta = COUNTY_BY_SLUG.get(countySlug) ?? KENYA_COUNTIES[46];
  return {
    location: record.location,
    code: paddedCode,
    slug: `${paddedCode}-${slugifyLocation(record.location)}`,
    countyCode: countyMeta.code,
    countySlug: countyMeta.slug,
    countyName: countyMeta.name,
    prefix: paddedCode.slice(0, 2),
  };
});

const ENTRY_BY_SLUG = new Map<string, PostalEntry>(
  POSTAL_ENTRIES.map((entry) => [entry.slug, entry])
);

export function resolveCountyFilter(rawCounty: string): CountyMeta | undefined {
  const cleaned = normalizeSearchText(rawCounty)
    .replace(/\s+county$/i, '')
    .trim();
  if (!cleaned || cleaned === 'all') return undefined;

  if (/^\d{1,3}$/.test(cleaned)) {
    const padded = cleaned.padStart(3, '0');
    const byCode = COUNTY_BY_CODE.get(padded);
    if (byCode) return byCode;
  }

  const slugAttempt = slugifyLocation(cleaned);
  const bySlug = COUNTY_BY_SLUG.get(slugAttempt);
  if (bySlug) return bySlug;

  return KENYA_COUNTIES.find(
    (c) => normalizeSearchText(c.name) === cleaned || normalizeSearchText(c.name).replace(/'/g, '') === cleaned.replace(/'/g, '')
  );
}

export function findEntryBySlugOrCode(rawSlug: string): PostalEntry | undefined {
  const cleaned = rawSlug.trim().toLowerCase();
  if (!cleaned) return undefined;

  const exactSlug = ENTRY_BY_SLUG.get(cleaned);
  if (exactSlug) return exactSlug;

  const codeOnly = cleaned.match(/^(\d{3,5})(?:-|$)/);
  if (codeOnly) {
    const padded = codeOnly[1].padStart(5, '0');
    const byCode = POSTAL_ENTRIES.find((entry) => entry.code === padded);
    if (byCode) return byCode;
  }

  return POSTAL_ENTRIES.find(
    (entry) => slugifyLocation(entry.location) === cleaned
  );
}

export function getRelatedEntries(entry: PostalEntry, limit = 8): PostalEntry[] {
  const sameCounty = POSTAL_ENTRIES.filter(
    (item) => item.countySlug === entry.countySlug && item.slug !== entry.slug
  );
  if (sameCounty.length >= limit) {
    return sameCounty.slice(0, limit);
  }
  const seen = new Set(sameCounty.map((e) => e.slug));
  const samePrefix = POSTAL_ENTRIES.filter(
    (item) =>
      item.prefix === entry.prefix &&
      item.slug !== entry.slug &&
      !seen.has(item.slug)
  );
  return [...sameCounty, ...samePrefix].slice(0, limit);
}

export function getCountiesSummary(): CountySummary[] {
  return KENYA_COUNTIES.map((county) => {
    const entries = POSTAL_ENTRIES.filter((entry) => entry.countySlug === county.slug);
    const sortedCodes = entries.map((e) => e.code).sort();
    const sampleOffices = entries
      .slice(0, 4)
      .map((e) => `${e.location} (${e.code})`)
      .join(', ');
    return {
      ...county,
      count: entries.length,
      minCode: sortedCodes[0] ?? '',
      maxCode: sortedCodes[sortedCodes.length - 1] ?? '',
      sampleOffices,
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
  const normalizedCounty = options.county ? options.county.trim() : '';

  let filtered = POSTAL_ENTRIES.slice();

  if (normalizedCounty && normalizedCounty.toLowerCase() !== 'all') {
    const countyMeta = resolveCountyFilter(normalizedCounty);
    if (countyMeta) {
      filtered = filtered.filter((entry) => entry.countySlug === countyMeta.slug);
    } else {
      filtered = [];
    }
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
    const cleanQ = normalizedQ.replace(/\s+county$/i, '').trim();
    const scored: Array<{ entry: PostalEntry; score: number }> = [];
    for (const entry of filtered) {
      const locNorm = normalizeSearchText(entry.location);
      const codeNorm = entry.code.toLowerCase();
      const countyNorm = normalizeSearchText(entry.countyName);
      const countyMeta = COUNTY_BY_SLUG.get(entry.countySlug);
      const aliasNorm = countyMeta ? normalizeSearchText(countyMeta.aliases) : '';

      if (codeNorm === normalizedQ || locNorm === normalizedQ) {
        scored.push({ entry, score: 0 });
      } else if (locNorm.startsWith(normalizedQ) || codeNorm.startsWith(normalizedQ)) {
        scored.push({ entry, score: 1 });
      } else if (locNorm.includes(normalizedQ) || codeNorm.includes(normalizedQ)) {
        scored.push({ entry, score: 2 });
      } else if (
        countyNorm === cleanQ ||
        countyNorm.includes(cleanQ) ||
        aliasNorm.includes(cleanQ)
      ) {
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

  const header = 'Location,Postal Code,County';
  const rows = entries.map(
    (entry) =>
      `${escapeCsv(entry.location)},${escapeCsv(entry.code)},${escapeCsv(`${entry.countyName} County`)}`
  );
  return [header, ...rows].join('\n');
}
