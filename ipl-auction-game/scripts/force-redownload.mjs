/**
 * Force re-download all players from the ID map, ignoring existing files.
 * This replaces any wrong Dhoni copies with the correct IPL jersey images.
 */
import fs from 'fs';
import https from 'https';

const OUTPUT_DIR = './public/players';
const playerMap = JSON.parse(fs.readFileSync('./scripts/player-id-map.json', 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Players known to still use Dhoni's image (996262 bytes) or similar wrong file
// These are the IPL map slugs we need to force-download
// We'll just re-download EVERY player in the map
function downloadBinary(url, destPath) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': UA, 'Referer': 'https://www.iplt20.com/' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBinary(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) return resolve({ ok: false, code: res.statusCode });
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve({ ok: true }); });
      file.on('error', () => resolve({ ok: false, code: 'stream error' }));
    }).on('error', (e) => resolve({ ok: false, code: e.message }));
  });
}

const DHONI_SIZE = 996262; // Old wrong Dhoni file size

async function main() {
  const entries = Object.entries(playerMap);
  console.log(`=== Force Re-Download (${entries.length} players) ===\n`);
  
  let success = 0, skipped = 0, failed = 0;

  for (const [slug, p] of entries) {
    const destPath = `${OUTPUT_DIR}/${slug}.png`;
    const url = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${p.id}.png`;
    
    // Only skip if file exists AND is NOT the wrong Dhoni image AND is large enough
    if (fs.existsSync(destPath)) {
      const sz = fs.statSync(destPath).size;
      if (sz === DHONI_SIZE) {
        // Force re-download — this is Dhoni's image
        process.stdout.write(`[FORCE] ${slug} (ID=${p.id})... `);
      } else if (sz > 50000) {
        console.log(`⏭️  SKIP ${slug} (${(sz/1024).toFixed(0)}KB, looks correct)`);
        skipped++;
        continue;
      } else {
        process.stdout.write(`[SMALL] ${slug} (ID=${p.id})... `);
      }
    } else {
      process.stdout.write(`[NEW] ${slug} (ID=${p.id})... `);
    }

    const result = await downloadBinary(url, destPath);
    if (result.ok && fs.existsSync(destPath)) {
      const sz = fs.statSync(destPath).size;
      if (sz > 10000) {
        console.log(`✅ ${(sz/1024).toFixed(0)}KB`);
        success++;
      } else {
        console.log(`⚠️  Small (${sz}B)`);
        failed++;
      }
    } else {
      console.log(`❌ HTTP ${result.code}`);
      failed++;
    }

    await sleep(150);
  }

  console.log(`\n=== Final Summary ===`);
  console.log(`✅ Downloaded: ${success}`);
  console.log(`⏭️  Skipped:    ${skipped}`);
  console.log(`❌ Failed:     ${failed}`);
  console.log(`Total:         ${entries.length}`);
}

main().catch(console.error);
