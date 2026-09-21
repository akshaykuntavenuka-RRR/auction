import fs from 'fs';
import path from 'path';
import https from 'https';

const OUTPUT_DIR = './public/players';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// All IPL players with their Wikipedia article titles and output slugs
const PLAYERS = [
  { slug: 'virat-kohli',           wiki: 'Virat Kohli' },
  { slug: 'rohit-sharma',          wiki: 'Rohit Sharma' },
  { slug: 'shubman-gill',          wiki: 'Shubman Gill' },
  { slug: 'suryakumar-yadav',      wiki: 'Suryakumar Yadav' },
  { slug: 'yashasvi-jaiswal',      wiki: 'Yashasvi Jaiswal' },
  { slug: 'ruturaj-gaikwad',       wiki: 'Ruturaj Gaikwad' },
  { slug: 'travis-head',           wiki: 'Travis Head (cricketer)' },
  { slug: 'faf-du-plessis',        wiki: 'Faf du Plessis' },
  { slug: 'shreyas-iyer',          wiki: 'Shreyas Iyer' },
  { slug: 'sai-sudharsan',         wiki: 'Sai Sudharsan' },
  { slug: 'david-warner',          wiki: 'David Warner (cricketer)' },
  { slug: 'nicholas-pooran',       wiki: 'Nicholas Pooran' },
  { slug: 'tilak-varma',           wiki: 'Tilak Varma' },
  { slug: 'devdutt-padikkal',      wiki: 'Devdutt Padikkal' },
  { slug: 'abhishek-sharma',       wiki: 'Abhishek Sharma (cricketer)' },
  { slug: 'riyan-parag',           wiki: 'Riyan Parag' },
  { slug: 'shivam-dube',           wiki: 'Shivam Dube' },
  { slug: 'phil-salt',             wiki: 'Phil Salt' },
  { slug: 'ms-dhoni',              wiki: 'MS Dhoni' },
  { slug: 'rishabh-pant',          wiki: 'Rishabh Pant' },
  { slug: 'jos-buttler',           wiki: 'Jos Buttler' },
  { slug: 'kl-rahul',              wiki: 'KL Rahul' },
  { slug: 'ishan-kishan',          wiki: 'Ishan Kishan' },
  { slug: 'quinton-de-kock',       wiki: 'Quinton de Kock' },
  { slug: 'sanju-samson',          wiki: 'Sanju Samson' },
  { slug: 'heinrich-klaasen',      wiki: 'Heinrich Klaasen' },
  { slug: 'dhruv-jurel',           wiki: 'Dhruv Jurel' },
  { slug: 'hardik-pandya',         wiki: 'Hardik Pandya' },
  { slug: 'ravindra-jadeja',       wiki: 'Ravindra Jadeja' },
  { slug: 'pat-cummins',           wiki: 'Pat Cummins' },
  { slug: 'glenn-maxwell',         wiki: 'Glenn Maxwell (cricketer)' },
  { slug: 'axar-patel',            wiki: 'Axar Patel' },
  { slug: 'washington-sundar',     wiki: 'Washington Sundar' },
  { slug: 'marcus-stoinis',        wiki: 'Marcus Stoinis' },
  { slug: 'krunal-pandya',         wiki: 'Krunal Pandya' },
  { slug: 'liam-livingstone',      wiki: 'Liam Livingstone' },
  { slug: 'tim-david',             wiki: 'Tim David (cricketer)' },
  { slug: 'mitchell-santner',      wiki: 'Mitchell Santner' },
  { slug: 'venkatesh-iyer',        wiki: 'Venkatesh Iyer' },
  { slug: 'jasprit-bumrah',        wiki: 'Jasprit Bumrah' },
  { slug: 'yuzvendra-chahal',      wiki: 'Yuzvendra Chahal' },
  { slug: 'rashid-khan',           wiki: 'Rashid Khan (cricketer)' },
  { slug: 'mohammed-siraj',        wiki: 'Mohammed Siraj' },
  { slug: 'arshdeep-singh',        wiki: 'Arshdeep Singh' },
  { slug: 'mitchell-starc',        wiki: 'Mitchell Starc' },
  { slug: 'ravichandran-ashwin',   wiki: 'Ravichandran Ashwin' },
  { slug: 'kuldeep-yadav',         wiki: 'Kuldeep Yadav' },
  { slug: 'mohammed-shami',        wiki: 'Mohammed Shami' },
  { slug: 'trent-boult',           wiki: 'Trent Boult' },
  { slug: 'prasidh-krishna',       wiki: 'Prasidh Krishna' },
  { slug: 'varun-chakravarthy',    wiki: 'Varun Chakravarthy (cricketer)' },
  { slug: 't-natarajan',           wiki: 'T. Natarajan' },
  { slug: 'harshal-patel',         wiki: 'Harshal Patel' },
  { slug: 'deepak-chahar',         wiki: 'Deepak Chahar' },
  { slug: 'bhuvneshwar-kumar',     wiki: 'Bhuvneshwar Kumar' },
  { slug: 'josh-hazlewood',        wiki: 'Josh Hazlewood' },
  { slug: 'kagiso-rabada',         wiki: 'Kagiso Rabada' },
  { slug: 'noor-ahmad',            wiki: 'Noor Ahmad (cricketer)' },
];

const UA = 'IPLCricketAuctionGame/1.0 (https://github.com/ipl-auction-game; contact@example.com)';

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA, ...headers } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBinary(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    }).on('error', () => resolve(false));
  });
}

async function getWikiThumbnail(wikiTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=500`;
  try {
    const res = await get(url);
    if (res.statusCode !== 200) return null;
    const data = JSON.parse(res.body);
    if (!data.query || !data.query.pages) return null;
    for (const id in data.query.pages) {
      const page = data.query.pages[id];
      if (page.thumbnail && page.thumbnail.source) {
        return page.thumbnail.source;
      }
    }
  } catch (e) {}
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== IPL Player Photo Downloader ===\n');
  console.log('Using Wikipedia Pageimages API to discover correct photo URLs...\n');

  const results = { success: [], failed: [] };

  for (let i = 0; i < PLAYERS.length; i++) {
    const p = PLAYERS[i];
    process.stdout.write(`[${i+1}/${PLAYERS.length}] ${p.slug}... `);

    // Check if we already have a valid image
    const destJpg = path.join(OUTPUT_DIR, `${p.slug}.jpg`);
    const destPng = path.join(OUTPUT_DIR, `${p.slug}.png`);
    const existingDest = fs.existsSync(destJpg) ? destJpg : (fs.existsSync(destPng) ? destPng : null);
    if (existingDest) {
      const stat = fs.statSync(existingDest);
      if (stat.size > 10000) { // > 10KB means real image
        console.log(`SKIP (already have ${(stat.size/1024).toFixed(1)}KB)`);
        results.success.push({ slug: p.slug, file: path.basename(existingDest) });
        continue;
      }
    }

    // Query Wikipedia
    const thumbUrl = await getWikiThumbnail(p.wiki);
    if (!thumbUrl) {
      console.log('❌ No Wikipedia thumbnail');
      results.failed.push(p.slug);
      await sleep(200);
      continue;
    }

    // Determine extension
    const ext = thumbUrl.includes('.jpg') || thumbUrl.includes('.jpeg') ? '.jpg' : '.png';
    const destPath = path.join(OUTPUT_DIR, `${p.slug}${ext}`);

    // Remove any corrupt file
    const oldFiles = [destJpg, destPng].filter(f => f !== destPath && fs.existsSync(f));
    oldFiles.forEach(f => fs.unlinkSync(f));

    // Download
    const ok = await downloadBinary(thumbUrl, destPath);
    if (ok) {
      const size = fs.statSync(destPath).size;
      if (size < 5000) {
        fs.unlinkSync(destPath);
        console.log(`❌ Too small (${size}B), likely error page`);
        results.failed.push(p.slug);
      } else {
        console.log(`✅ ${(size/1024).toFixed(1)}KB → ${path.basename(destPath)}`);
        results.success.push({ slug: p.slug, file: path.basename(destPath) });
      }
    } else {
      console.log(`❌ Download failed`);
      results.failed.push(p.slug);
    }

    await sleep(300); // Be polite to Wikipedia
  }

  console.log(`\n=== Done ===`);
  console.log(`✅ Success: ${results.success.length}/${PLAYERS.length}`);
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.join(', ')}`);
  }

  // Write results to JSON so we can update cricapi.js
  const jsonOut = `./scripts/wiki-download-results.json`;
  fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${jsonOut}`);
}

main().catch(console.error);
