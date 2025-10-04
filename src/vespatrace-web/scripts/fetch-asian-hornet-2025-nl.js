/*
  Fetch Asian hornet (Vespa velutina) observations for the Netherlands in 2025 from the GBIF API,
  group them per province, and output JSON. We use GBIF because waarneming.nl blocks automated scraping.
*/

// Node 18+ has global fetch
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(OUT_DIR, 'asian-hornet-nl-2025.json');

const BASE = 'https://api.gbif.org/v1/occurrence/search';
const LIMIT = 300;
const NAMES = ['Vespa velutina', 'Vespa velutina nigrithorax'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllForName(scientificName) {
  let offset = 0;
  let all = [];
  // First, get count
  const countUrl = `${BASE}?country=NL&year=2025&hasCoordinate=true&limit=0&offset=0&scientificName=${encodeURIComponent(scientificName)}`;
  const countRes = await fetch(countUrl);
  if (!countRes.ok) throw new Error(`Count failed: ${countRes.status}`);
  const countJson = await countRes.json();
  const total = countJson.count || 0;
  // Paginate
  while (offset < total) {
    const url = `${BASE}?country=NL&year=2025&hasCoordinate=true&limit=${LIMIT}&offset=${offset}&scientificName=${encodeURIComponent(scientificName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Page failed: ${res.status}`);
    const json = await res.json();
    all = all.concat(json.results || []);
    offset += LIMIT;
    // Be gentle
    await sleep(300);
  }
  return all;
}

function normalize(rec) {
  const {
    key,
    scientificName,
    eventDate,
    decimalLatitude,
    decimalLongitude,
    stateProvince,
    countryCode,
    municipality,
    locality,
    recordedBy,
    occurrenceStatus,
    basisOfRecord,
    issues,
    references
  } = rec;
  return {
    id: key,
    scientificName,
    date: eventDate,
    countryCode,
    province: stateProvince || null,
    municipality: municipality || null,
    locality: locality || null,
    lat: decimalLatitude,
    lon: decimalLongitude,
    recordedBy: recordedBy || null,
    status: occurrenceStatus || null,
    basisOfRecord: basisOfRecord || null,
    issues: issues || null,
    references: references || null
  };
}

async function main() {
  const seen = new Map(); // dedupe by key
  for (const name of NAMES) {
    const arr = await fetchAllForName(name);
    for (const r of arr) {
      if (!seen.has(r.key)) seen.set(r.key, r);
    }
  }
  const normalized = Array.from(seen.values()).map(normalize);

  // Group by province
  const byProvince = {};
  for (const item of normalized) {
    const prov = item.province || 'Unknown';
    if (!byProvince[prov]) byProvince[prov] = [];
    byProvince[prov].push(item);
  }

  const summary = Object.fromEntries(
    Object.entries(byProvince).map(([k, v]) => [k, { count: v.length }])
  );

  const out = {
    meta: {
      source: 'GBIF Occurrence API',
      generatedAt: new Date().toISOString(),
      country: 'NL',
      year: 2025,
      species: NAMES,
      total: normalized.length
    },
    summary,
    provinces: byProvince
  };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf-8');
  console.log(OUT_FILE);
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
