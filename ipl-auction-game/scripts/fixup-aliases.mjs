/**
 * Fix-up script:
 * 1. Re-downloads files that were incorrectly skipped (Dhoni's image used)
 * 2. Creates alias files for slug mismatches (e.g. suryakumar-yadav → surya-kumar-yadav.png)
 */
import fs from 'fs';
import https from 'https';

const OUTPUT_DIR = './public/players';
const MAP_FILE = './scripts/player-id-map.json';
const playerMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Players whose files were skipped (wrong Dhoni image at ~973KB from earlier run)
// These need to be re-downloaded with correct IDs
const NEED_REDOWNLOAD = [
  { ourSlug: 'bhuvneshwar-kumar',  mapSlug: 'bhuvneshwar-kumar' },
  { ourSlug: 'trent-boult',        mapSlug: 'trent-boult' },
  { ourSlug: 'deepak-chahar',      mapSlug: 'deepak-chahar' },
];

// Slug aliases: our slug → IPL map slug (for players with different slug conventions)
const ALIASES = [
  { ourSlug: 'suryakumar-yadav',   mapSlug: 'surya-kumar-yadav' },
  { ourSlug: 'tilak-varma',        mapSlug: 'n-tilak-varma' },
  { ourSlug: 'varun-chakravarthy', mapSlug: 'varun-chakaravarthy' },
  { ourSlug: 'mohammed-shami',     mapSlug: 'mohammad-shami' },
  { ourSlug: 'rohit-sharma',       mapSlug: 'rohit-sharma' },    // verify correct
  { ourSlug: 'virat-kohli',        mapSlug: 'virat-kohli' },    // verify correct
];

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

async function main() {
  console.log('=== Fix-up Script ===\n');

  // Step 1: Re-download incorrectly-skipped files
  console.log('--- Re-downloading SKIP files ---');
  for (const item of NEED_REDOWNLOAD) {
    const player = playerMap[item.mapSlug];
    if (!player) {
      console.log(`❓ No map entry for ${item.mapSlug}`);
      continue;
    }
    const url = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${player.id}.png`;
    const dest = `${OUTPUT_DIR}/${item.ourSlug}.png`;
    process.stdout.write(`⬇️  ${item.ourSlug} (ID=${player.id})... `);
    const ok = await downloadBinary(url, dest);
    if (ok && fs.existsSync(dest)) {
      const sz = fs.statSync(dest).size;
      console.log(`✅ ${(sz/1024).toFixed(0)}KB`);
    } else {
      console.log('❌ Failed');
    }
    await sleep(300);
  }

  // Step 2: Create alias files for slug mismatches
  console.log('\n--- Creating alias files ---');
  for (const alias of ALIASES) {
    const srcFile = `${OUTPUT_DIR}/${alias.mapSlug}.png`;
    const destFile = `${OUTPUT_DIR}/${alias.ourSlug}.png`;
    
    // Check if src exists and is valid
    if (fs.existsSync(srcFile) && fs.statSync(srcFile).size > 50000) {
      // If dest doesn't exist or is wrong size, copy from src
      const destExists = fs.existsSync(destFile) && fs.statSync(destFile).size > 50000;
      if (!destExists) {
        fs.copyFileSync(srcFile, destFile);
        const sz = fs.statSync(destFile).size;
        console.log(`✅ ${alias.ourSlug} ← ${alias.mapSlug} (${(sz/1024).toFixed(0)}KB)`);
      } else {
        console.log(`⏭️  ${alias.ourSlug} already exists (${(fs.statSync(destFile).size/1024).toFixed(0)}KB)`);
      }
    } else {
      // Need to download for mapSlug first
      const player = playerMap[alias.mapSlug];
      if (player) {
        const url = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${player.id}.png`;
        process.stdout.write(`⬇️  Downloading ${alias.mapSlug} (ID=${player.id})... `);
        const ok = await downloadBinary(url, srcFile);
        if (ok && fs.existsSync(srcFile) && fs.statSync(srcFile).size > 50000) {
          fs.copyFileSync(srcFile, destFile);
          const sz = fs.statSync(destFile).size;
          console.log(`✅ Then copied to ${alias.ourSlug} (${(sz/1024).toFixed(0)}KB)`);
        } else {
          console.log(`❌ Failed`);
        }
        await sleep(300);
      } else {
        console.log(`❓ No map entry for ${alias.mapSlug}`);
      }
    }
  }

  // Step 3: Verify key players
  console.log('\n--- Verifying key players ---');
  const KEY_PLAYERS = [
    'virat-kohli', 'rohit-sharma', 'ms-dhoni', 'jasprit-bumrah',
    'suryakumar-yadav', 'rishabh-pant', 'hardik-pandya', 'yashasvi-jaiswal',
    'tilak-varma', 'varun-chakravarthy', 'mohammed-shami', 'trent-boult',
    'deepak-chahar', 'bhuvneshwar-kumar',
  ];
  for (const slug of KEY_PLAYERS) {
    const file = `${OUTPUT_DIR}/${slug}.png`;
    if (fs.existsSync(file)) {
      const sz = fs.statSync(file).size;
      const ok = sz > 50000;
      console.log(`${ok ? '✅' : '❌'} ${slug}: ${(sz/1024).toFixed(0)}KB${ok ? '' : ' (may be wrong)'}`);
    } else {
      console.log(`❌ ${slug}: FILE MISSING`);
    }
  }

  console.log('\n✅ Fix-up complete!');
}

main().catch(console.error);
