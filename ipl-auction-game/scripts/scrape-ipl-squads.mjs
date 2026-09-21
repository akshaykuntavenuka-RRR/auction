/**
 * Correct IPL squad scraper using data-src + h2 name pairing pattern.
 * Pattern found: data-src="...IPLHeadshot2026/{id}.png" followed by <h2>Player Name</h2>
 */
import fs from 'fs';
import https from 'https';

const OUTPUT_DIR = './public/players';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TEAM_SLUGS = [
  'mumbai-indians',
  'chennai-super-kings',
  'royal-challengers-bengaluru',
  'kolkata-knight-riders',
  'rajasthan-royals',
  'delhi-capitals',
  'sunrisers-hyderabad',
  'gujarat-titans',
  'lucknow-super-giants',
  'punjab-kings',
];

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www.iplt20.com/', 'Accept': 'text/html' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchText(res.headers.location).then(resolve);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', () => resolve({ status: 0, body: '' }));
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': UA, 'Referer': 'https://www.iplt20.com/' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBinary(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) return resolve(false);
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    }).on('error', () => resolve(false));
  });
}

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Extract player name → headshot ID pairs from squad page HTML.
 * Uses the pattern: data-src="...IPLHeadshot2026/{id}.png" ... <h2>Name</h2>
 */
function extractPlayers(html) {
  const players = [];
  // Split into player blocks by ih-p-img
  const blocks = html.split('ih-p-img');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].substring(0, 500);
    const idMatch = block.match(/IPLHeadshot2026\/(\d+)\.png/);
    const nameMatch = block.match(/<h2>([^<]+)<\/h2>/);
    if (idMatch && nameMatch) {
      const id = parseInt(idMatch[1]);
      const name = nameMatch[1].trim();
      const slug = nameToSlug(name);
      players.push({ name, slug, id });
    }
  }
  return players;
}

// Master map from slug → { name, slug, id }
const playerMap = {};

async function main() {
  console.log('=== IPL Squad Scraper (Fixed) ===\n');

  // Fetch all team squad pages
  for (const team of TEAM_SLUGS) {
    process.stdout.write(`Fetching ${team}... `);
    const url = `https://www.iplt20.com/teams/${team}/squad`;
    const res = await fetchText(url);
    
    if (res.status !== 200) {
      console.log(`❌ HTTP ${res.status}`);
      await sleep(500);
      continue;
    }
    
    const players = extractPlayers(res.body);
    console.log(`✅ Found ${players.length} players`);
    
    for (const p of players) {
      if (!playerMap[p.slug]) {
        playerMap[p.slug] = p;
      }
    }
    
    await sleep(600);
  }

  console.log(`\n📊 Total unique players: ${Object.keys(playerMap).length}`);
  console.log('\n--- Name → ID mapping ---');
  Object.values(playerMap).forEach(p => console.log(`  ${p.name} (${p.slug}): ID=${p.id}`));

  // Save the mapping for future use
  fs.writeFileSync('./scripts/player-id-map.json', JSON.stringify(playerMap, null, 2));

  // Download the jersey headshots
  console.log('\n=== Downloading Jersey Headshots ===\n');
  let success = 0, failed = 0;

  for (const [slug, p] of Object.entries(playerMap)) {
    const destPath = `${OUTPUT_DIR}/${slug}.png`;
    
    // Skip if already have a valid large file
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 50000) {
      console.log(`⏭️  SKIP ${slug} (already downloaded)`);
      success++;
      continue;
    }
    
    const imgUrl = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${p.id}.png`;
    process.stdout.write(`⬇️  ${p.name} (ID=${p.id})... `);
    
    const ok = await downloadBinary(imgUrl, destPath);
    if (ok && fs.existsSync(destPath)) {
      const sz = fs.statSync(destPath).size;
      if (sz > 10000) {
        console.log(`✅ ${(sz/1024).toFixed(0)}KB`);
        success++;
      } else {
        fs.unlinkSync(destPath);
        console.log(`❌ Too small (${sz}B)`);
        failed++;
      }
    } else {
      console.log('❌ Download failed');
      failed++;
    }
    
    await sleep(250);
  }

  console.log(`\n=== Summary ===`);
  console.log(`✅ Success: ${success}/${Object.keys(playerMap).length}`);
  console.log(`❌ Failed:  ${failed}`);
}

main().catch(console.error);
