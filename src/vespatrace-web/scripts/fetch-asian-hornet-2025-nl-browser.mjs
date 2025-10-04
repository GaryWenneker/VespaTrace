import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

// Output paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(OUT_DIR, 'asian-hornet-waarneming-nl-2025.json');
const PROFILE_DIR = path.join(OUT_DIR, 'pw-profile');

// Config
const SPECIES_ID = process.env.SPECIES_ID || '8807';
const DATE_AFTER = process.env.DATE_AFTER || '2025-10-04';
// Leave DATE_BEFORE empty to fetch open-ended from DATE_AFTER onward
const DATE_BEFORE = process.env.DATE_BEFORE || '';
const DIVISIONS = (process.env.DIVISIONS || '7').split(',').map(s => s.trim()).filter(Boolean);
const CONCURRENCY = Math.max(1, parseInt(process.env.CONCURRENCY || '3', 10));
const RAW_HTML = process.env.RAW_HTML === '1';
const HEADLESS = process.env.HEADLESS !== '0';
const MAX_HTML = Math.max(0, parseInt(process.env.MAX_HTML || '50000', 10));

// NL country_division -> province name mapping (Waarneming.nl)
const NL_DIVISION_MAP = {
  '1': 'Utrecht',
  '2': 'Noord-Holland',
  '3': 'Friesland',
  '4': 'Groningen',
  '5': 'Drenthe',
  '6': 'Overijssel',
  '7': 'Gelderland',
  '8': 'Flevoland',
  '9': 'Zuid-Holland',
  '10': 'Noord-Brabant',
  '11': 'Limburg',
  '12': 'Zeeland'
};

const BASE_LIST = (divisionId, page=1) => {
  const base = new URL(`https://waarneming.nl/species/${SPECIES_ID}/observations/`);
  const qp = base.searchParams;
  if (DATE_AFTER) qp.set('date_after', DATE_AFTER);
  if (DATE_BEFORE) qp.set('date_before', DATE_BEFORE);
  qp.set('country_division', divisionId);
  qp.set('search', '');
  qp.set('user', '');
  qp.set('location', '');
  qp.set('sex', '');
  qp.set('month', '');
  qp.set('life_stage', '');
  qp.set('activity', '');
  qp.set('method', '');
  qp.set('page', String(page));
  return base.toString();
};
const OBS_URL = (id) => `https://waarneming.nl/observation/${id}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractIdsFromHtml(html) {
  const ids = new Set();
  const re = /href=\"\/observation\/(\d+)/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return Array.from(ids);
}

function tryParseJsonLd(html) {
  const scripts = Array.from(html.matchAll(/<script[^>]*type=\"application\/ld\+json\"[^>]*>([\s\S]*?)<\/script>/gi));
  const blocks = [];
  for (const s of scripts) {
    try { blocks.push(JSON.parse(s[1].trim())); } catch {}
  }
  return blocks;
}

function extractFromObservationHtml(html) {
  const blocks = tryParseJsonLd(html);
  let lat = null, lon = null, date = null, locality = null, province = null, user = null, images = [];
  let municipality = null, count = null, sex = null, lifeStage = null, activity = null, method = null, observerId = null;
  // new fields
  let countOnSite = null, dateTime = null, externalSource = null, locationDisplay = null, rd = null, rdX = null, rdY = null, accuracy = null, accuracyMeters = null, sourceLabel = null;
  const pick = (obj, path) => path.split('.').reduce((a,k)=> (a && a[k] !== undefined ? a[k] : null), obj);
  for (const b of Array.isArray(blocks) ? blocks.flat() : [blocks]) {
    const arr = Array.isArray(b) ? b : [b];
    for (const o of arr) {
      if (!o || typeof o !== 'object') continue;
      const geo = pick(o, 'geo') || pick(o, 'location.geo') || null;
      if (geo && (geo.latitude || geo.lat)) {
        lat = lat ?? (geo.latitude ?? geo.lat ?? null);
        lon = lon ?? (geo.longitude ?? geo.lng ?? null);
      }
      date = date ?? (o.dateObserved || o.datePublished || o.dateCreated || null);
      locality = locality ?? (pick(o, 'location.name') || o.name || null);
      const address = pick(o, 'address') || pick(o, 'location.address');
      province = province ?? (address && (address.addressRegion || address.region) || null);
      municipality = municipality ?? (address && (address.addressLocality || address.locality) || null);
      user = user ?? (pick(o, 'author.name') || pick(o, 'creator.name') || null);
      const imgs = (o.image && (Array.isArray(o.image) ? o.image : [o.image]).map(im => (typeof im === 'string' ? im : im.url)).filter(Boolean)) || [];
      if (imgs.length) images = images.concat(imgs);
      const addProps = pick(o, 'additionalProperty') || pick(o, 'additionalProperties') || null;
      const propsArr = Array.isArray(addProps) ? addProps : (addProps ? [addProps] : []);
      for (const p of propsArr) {
        const name = (p?.name || p?.['@name'] || '').toString().toLowerCase();
        const val = (p?.value || p?.['@value'] || p?.description || '').toString();
        if (!name) continue;
        if (!count && /aantal|count|quantity/.test(name)) count = parseInt(val) || count;
        if (!sex && /(sex|geslacht|sekse)/.test(name)) sex = val;
        if (!lifeStage && /(stage|life|stadium|leeftijd|leefstadium)/.test(name)) lifeStage = val;
        if (!activity && /(activiteit|activity)/.test(name)) activity = val;
        if (!method && /(methode|method)/.test(name)) method = val;
      }
    }
  }
  if (lat == null || lon == null) {
    const m = html.match(/(?:lat|latitude)["']?\s*[:=]\s*([\-\d\.]+).*?(?:lng|lon|longitude)["']?\s*[:=]\s*([\-\d\.]+)/i);
    if (m) { lat = parseFloat(m[1]); lon = parseFloat(m[2]); }
  }
  if (!date) {
    const m = html.match(/(20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}[:\d{2}]*)/);
    if (m) date = m[1];
  }
  const getLabel = (labels) => {
    for (const lab of labels) {
      const dt = new RegExp(`<dt[^>]*>\\s*${lab}\\s*<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`, 'i');
      const th = new RegExp(`<th[^>]*>\\s*${lab}\\s*<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, 'i');
      const line = new RegExp(`${lab}\\s*[:：]\\s*([^<\\n\\r]{1,120})`, 'i');
      let m = html.match(dt) || html.match(th) || html.match(line);
      if (m && m[1]) return m[1].replace(/<[^>]*>/g, '').trim();
    }
    return null;
  };
  municipality = municipality || getLabel(['Gemeente', 'municipality', 'gemeente']);
  const locName = getLabel(['Locatie', 'Plaats', 'Location', 'locatie']);
  locality = locality || locName;
  locationDisplay = locName || locality || null;
  // Date/time with time component if present
  dateTime = getLabel(['Datum en tijd', 'Datum', 'Date']) || dateTime;
  if (!dateTime) {
    const mdt = html.match(/(20\d{2}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
    if (mdt) dateTime = `${mdt[1]} ${mdt[2]}`;
  }
  if (!count) {
    const m = html.match(/A(?:a)ntal\s*[:：]?\s*(\d+)/i) || html.match(/\((\d+)\s*ex/i) || html.match(/(\d+)\s*exemplaren/i);
    if (m) count = parseInt(m[1]);
  }
  // Aantal (ter plaatse)
  const cntOnSiteLabel = getLabel(['Aantal (ter plaatse)', 'Aantal ter plaatse']);
  if (cntOnSiteLabel) {
    const m = cntOnSiteLabel.match(/(\d+)/);
    if (m) countOnSite = parseInt(m[1]);
  }
  if (!sex) {
    const m = getLabel(['Sekse', 'Geslacht', 'Sex']) || (html.match(/\b(?:♂|mannetje|male)\b/i) ? 'male' : (html.match(/\b(?:♀|vrouwtje|female)\b/i) ? 'female' : null));
    if (m) sex = m;
  }
  if (!lifeStage) {
    const m = getLabel(['Levensstadium', 'Leefstadium', 'Life stage']) || (html.match(/\b(?:imago|adult|larve|larva|koningin|queen|werkster|worker)\b/i)?.[0] ?? null);
    if (m) lifeStage = typeof m === 'string' ? m : String(m);
  }
  activity = activity || getLabel(['Activiteit', 'Activity']);
  method = method || getLabel(['Methode', 'Method']);
  // RD and accuracy
  const rdLabel = getLabel(['RD', 'Rijksdriehoek', 'Rijksdriehoekscoördinaten', 'Rijksdriehoekscoordinaten']);
  if (rdLabel) {
    const m = rdLabel.match(/(\d{3,6})\D+(\d{3,6})/);
    if (m) { rd = `${m[1]} ${m[2]}`; rdX = parseInt(m[1]); rdY = parseInt(m[2]); }
  }
  accuracy = getLabel(['Nauwkeurigheid', 'Accuracy']) || accuracy;
  if (accuracy) {
    const m = accuracy.match(/(\d+)\s*m/);
    if (m) accuracyMeters = parseInt(m[1]);
  }
  // External source / source label
  externalSource = getLabel(['Externe bron', 'Externe bron of naam', 'External source']) || null;
  sourceLabel = getLabel(['Bron', 'Source']) || externalSource || null;
  const userLink = html.match(/href=\"\/users\/(\d+)\//i);
  if (userLink) observerId = userLink[1];

  // GPS display string
  const gps = (lat != null && lon != null) ? `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}` : null;

  return {
    lat, lon, date, locality, province, user,
    images: Array.from(new Set(images)),
    municipality, count, sex, lifeStage, activity, method, observerId,
    // new fields
    countOnSite, dateTime, externalSource, locationDisplay, gps, rd, rdX, rdY, accuracy, accuracyMeters, sourceLabel
  };
}

async function collectListIds(ctx, divisionId, initialKnownIds = []) {
  const initialKnown = new Set(initialKnownIds || []);
  const seen = new Set(initialKnown);
  const meta = {}; // id -> { listCount, sex, nest, nestType }
  let pageNo = 1;
  const page = await ctx.newPage();
  try {
    while (true) {
      const url = BASE_LIST(divisionId, pageNo);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      // Try to dismiss cookie banner if present
      try {
        const candidates = [
          'button:has-text("Akkoord")',
          'button:has-text("Accepteer")',
          'button:has-text("Alles accepteren")',
          'button:has-text("Accept all")',
          'button:has-text("Ik ga akkoord")'
        ];
        for (const sel of candidates) {
          const btn = await page.$(sel);
          if (btn) { await btn.click().catch(() => {}); break; }
        }
      } catch {}
      // Wait for either list to appear or bot page to disappear
      await page.waitForTimeout(1500 + Math.floor(Math.random()*400));
      // If bot page present, give extra time
      let html = await page.content();
      if (/Checking if you are not a bot/i.test(html) || /Anubis|BotStopper/i.test(html)) {
        await page.waitForTimeout(8000);
        html = await page.content();
      }
      // Prefer DOM-based extraction (more robust than regex on HTML)
      let extracted = [];
      try {
        extracted = await page.$$eval('a[href^="/observation/"]', (as) => {
          const rows = [];
          function text(n) { return (n && n.innerText || '').trim(); }
          for (const a of as) {
            const href = a.getAttribute('href') || '';
            const m = href.match(/\/observation\/(\d+)/);
            if (!m) continue;
            const id = m[1];
            // Find a reasonable row container
            let row = a.closest('tr') || a.closest('li') || a.closest('article') || a.closest('div');
            let block = row ? text(row) : text(a.parentElement);
            const norm = block.replace(/\s+/g, ' ').trim();
            const lower = norm.toLowerCase();
            // Count preferences: Aantal: N; or N + keyword; else max small number
            let listCount = null;
            let mm = lower.match(/\baantal\s*[:：]?\s*(\d{1,3})\b/);
            if (!mm) mm = lower.match(/\b(\d{1,3})\s*(?:ex\b|dood\b|imago\b|nigrithorax\b|gezien\b|werkster\b|nest\b)/i);
            if (mm) {
              listCount = parseInt(mm[1], 10);
            } else {
              const nums = Array.from(lower.matchAll(/\b(\d{1,3})\b/g)).map(m=>parseInt(m[1],10)).filter(n=>n>0 && n<1000);
              if (nums.length) listCount = Math.max(...nums);
            }
            // Sex
            let sex = null;
            if (/\b(♂|mannetje|male)\b/i.test(block)) sex = 'male';
            else if (/\b(♀|vrouwtje|female)\b/i.test(block)) sex = 'female';
            // Nest detection
            let nest = false; let nestType = null;
            if (/\bnest\b/i.test(block)) {
              nest = true;
              const nm = block.match(/nest\s*\(([^)]+)\)/i) || block.match(/nest\s*[:：]?\s*(primair|secundair|primary|secondary)/i);
              if (nm) nestType = nm[1] || nm[0];
            }
            rows.push({ id, listCount, sex, nest, nestType });
          }
          // Deduplicate by last occurrence wins
          const map = new Map();
          for (const r of rows) map.set(r.id, r);
          return Array.from(map.values());
        });
      } catch {
        // Fallback to HTML regex if DOM extraction fails
        const ids = extractIdsFromHtml(html);
        extracted = ids.map(id => ({ id, listCount: null, sex: null, nest: false, nestType: null }));
      }
      const ids = extracted.map(x => x.id);
      for (const r of extracted) meta[r.id] = { listCount: r.listCount, sex: r.sex, nest: r.nest, nestType: r.nestType };
      if (pageNo === 1 && ids.length === 0) {
        try {
          if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
          fs.writeFileSync(path.join(OUT_DIR, `waarneming-browser-list-debug-${divisionId}-p1.html`), html.slice(0, 200000), 'utf-8');
          console.warn(`No IDs found on first list page for division ${divisionId} (browser). Wrote debug HTML.`);
        } catch {}
      }
      let added = 0;
      for (const id of ids) { if (!seen.has(id)) { seen.add(id); added++; } }
      if (added === 0) break;
      pageNo += 1;
      if (pageNo > 100) break;
      await sleep(500);
    }
  } finally {
    await page.close();
  }
  const allIds = Array.from(seen);
  const newIds = allIds.filter(id => !initialKnown.has(id));
  return { ids: allIds, meta, newIds };
}

async function fetchObservation(ctx, id) {
  const url = OBS_URL(id);
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    const parsed = extractFromObservationHtml(html);
    // DOM-driven extraction for GPS, RD, accuracy and source
    try {
      const coordTexts = await page.$$eval('.teramap-coordinates-coords', nodes => nodes.map(n => (n.textContent||'').trim()).filter(Boolean));
      for (const t of coordTexts) {
        // GPS like 52.24870, 5.24352
        const mg = t.match(/([\-\d\.]{2,})\s*,\s*([\-\d\.]{2,})/);
        if (mg) {
          const glat = parseFloat(mg[1]);
          const glon = parseFloat(mg[2]);
          if (!Number.isNaN(glat) && !Number.isNaN(glon)) {
            if (parsed.lat == null) parsed.lat = glat;
            if (parsed.lon == null) parsed.lon = glon;
            parsed.gps = `${glat.toFixed(5)}, ${glon.toFixed(5)}`;
          }
          continue;
        }
        // RD like 145188 473416
        const mr = t.match(/(\d{3,6})\s+(\d{3,6})/);
        if (mr && !parsed.rd) {
          parsed.rd = `${mr[1]} ${mr[2]}`;
          parsed.rdX = parseInt(mr[1], 10);
          parsed.rdY = parseInt(mr[2], 10);
        }
      }
    } catch {}
    try {
      // Use readable body text to reliably extract label-value pairs, avoiding map attribution noise
      const bodyText = await page.evaluate(() => document.body.innerText || '');
      // Accuracy like: Nauwkeurigheid: 10 m
      const accMatch = bodyText.match(/Nauwkeurigheid\s*:?\s*([0-9]+\s*m)/i);
      if (accMatch) {
        parsed.accuracy = accMatch[1].trim();
        const m = parsed.accuracy.match(/(\d+)\s*m/);
        if (m) parsed.accuracyMeters = parseInt(m[1], 10);
      }
      // Source label like: Bron: <value>; filter out map attribution vendor lists
      const srcMatch = bodyText.match(/\bBron\s*:?\s*([^\n\r]{1,120})/i);
      if (srcMatch) {
        const candidate = srcMatch[1].trim();
        const noisy = /(Esri|USDA|USGS|GeoEye|Getmapping|Aerogrid|IGN|IGP|GIS\s+User\s+Community|OpenStreetMap|Mapbox)/i;
        if (!noisy.test(candidate) && candidate.toLowerCase() !== 'bron') {
          parsed.sourceLabel = candidate;
        }
      }
    } catch {}
    if (RAW_HTML) parsed.html = html.slice(0, MAX_HTML);
    return { id, url, ...parsed };
  } finally {
    await page.close();
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  // Load previous output to allow resume
  let previous = null;
  if (fs.existsSync(OUT_FILE)) {
    try {
      previous = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
    } catch {}
  }
  const existingAll = Array.isArray(previous?.observations) ? previous.observations : [];
  const inDivisions = new Set(DIVISIONS.map(String));
  const tsAfter = DATE_AFTER ? Date.parse(DATE_AFTER) : null;
  const tsBefore = DATE_BEFORE ? Date.parse(DATE_BEFORE) : null;
  function obsInRange(o) {
    if (o?.divisionId && !inDivisions.has(String(o.divisionId))) return false;
    // Parse date from dateTime (preferred) or date
    const dt = (o?.dateTime && (o.dateTime.replace(' ', 'T') + (o.dateTime.length === 10 ? 'T00:00:00' : ''))) || o?.date || null;
    if (!dt) return true; // if unknown, don't exclude
    const t = Date.parse(dt);
    if (Number.isNaN(t)) return true;
    if (tsAfter != null && t < tsAfter) return false;
    if (tsBefore != null && t > tsBefore) return false;
    return true;
  }
  const existingObservations = existingAll.filter(obsInRange);
  const existingById = new Map(existingObservations.map(o => [String(o.id), o]));
  const knownIds = new Set([...existingById.keys()]);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: HEADLESS,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  });
  try {
    const resultsNew = [];
    for (const div of DIVISIONS) {
      const { ids, meta, newIds } = await collectListIds(context, div, knownIds);
      let idx = 0;
      const toFetch = (newIds && newIds.length ? newIds : ids.filter(id => !knownIds.has(id)));
      // Add new IDs to known set to avoid duplicate work across divisions (ids are globally unique)
      for (const id of toFetch) knownIds.add(id);
      const worker = async () => {
        while (true) {
          const i = idx++;
          if (i >= toFetch.length) break;
          const id = toFetch[i];
          try {
            const obs = await fetchObservation(context, id);
            obs.divisionId = div;
            // Fill province from division map when not present on the page
            if (!obs.province && div && NL_DIVISION_MAP[div]) {
              obs.province = NL_DIVISION_MAP[div];
            }
            // Merge list meta if detail page lacks values
            const m = meta[id] || {};
            if ((obs.count == null || Number.isNaN(obs.count)) && m.listCount != null) obs.count = m.listCount;
            if (obs.countOnSite == null && m.listCount != null) obs.countOnSite = m.listCount;
            if (!obs.sex && m.sex) obs.sex = m.sex;
            if (m.nest) obs.nest = true;
            if (!obs.nestType && m.nestType) obs.nestType = m.nestType;
            resultsNew.push(obs);
            await sleep(300 + Math.floor(Math.random() * 300));
          } catch (e) {
            console.warn('Skip id due to error', id, e?.message || e);
            await sleep(600);
          }
        }
      };
      const workers = Array.from({ length: Math.min(CONCURRENCY, 4) }, () => worker());
      await Promise.all(workers);
    }

    // Merge old + new
    const mergedById = new Map(existingObservations.map(o => [String(o.id), o]));
    for (const o of resultsNew) mergedById.set(String(o.id), o);
    // Upgrade province for existing where possible via division map
    for (const o of mergedById.values()) {
      if (!o.province && o.divisionId && NL_DIVISION_MAP[String(o.divisionId)]) {
        o.province = NL_DIVISION_MAP[String(o.divisionId)];
      }
    }

    const finalObservations = Array.from(mergedById.values());
    // Group by province
    const byProvince = {};
    for (const item of finalObservations) {
      const prov = item.province || (item.divisionId ? `Division-${item.divisionId}` : 'Unknown');
      if (!byProvince[prov]) byProvince[prov] = [];
      byProvince[prov].push(item);
    }
    const summary = Object.fromEntries(Object.entries(byProvince).map(([k, v]) => [k, { count: v.length }]));

    const out = {
      meta: {
        source: 'waarneming.nl',
        generatedAt: new Date().toISOString(),
        country: 'NL',
        dateAfter: DATE_AFTER,
        dateBefore: DATE_BEFORE || null,
        speciesId: SPECIES_ID,
        divisions: DIVISIONS,
        total: finalObservations.length,
        options: { concurrency: CONCURRENCY, browser: true, rawHtml: RAW_HTML }
      },
      observations: finalObservations,
      summary,
      provinces: byProvince
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf-8');
    console.log(OUT_FILE);
  } finally {
    await context.close();
  }
}

main().catch((e) => {
  console.error('Failed (browser):', e);
  process.exit(1);
});
