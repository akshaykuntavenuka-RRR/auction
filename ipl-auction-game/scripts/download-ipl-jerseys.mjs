import fs from 'fs';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = './public/players';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Player slug mappings for iplt20.com
// Format: { slug: 'iplt20-slug', name: 'Player Name', outSlug: 'our-file-slug' }
const PLAYERS = [
  { name: 'Virat Kohli',          iplSlug: 'virat-kohli',          outSlug: 'virat-kohli' },
  { name: 'Rohit Sharma',         iplSlug: 'rohit-sharma',         outSlug: 'rohit-sharma' },
  { name: 'Shubman Gill',         iplSlug: 'shubman-gill',         outSlug: 'shubman-gill' },
  { name: 'Suryakumar Yadav',     iplSlug: 'suryakumar-yadav',     outSlug: 'suryakumar-yadav' },
  { name: 'Yashasvi Jaiswal',     iplSlug: 'yashasvi-jaiswal',     outSlug: 'yashasvi-jaiswal' },
  { name: 'Ruturaj Gaikwad',      iplSlug: 'ruturaj-gaikwad',      outSlug: 'ruturaj-gaikwad' },
  { name: 'Travis Head',          iplSlug: 'travis-head',          outSlug: 'travis-head' },
  { name: 'Faf du Plessis',       iplSlug: 'faf-du-plessis',       outSlug: 'faf-du-plessis' },
  { name: 'Shreyas Iyer',         iplSlug: 'shreyas-iyer',         outSlug: 'shreyas-iyer' },
  { name: 'Sai Sudharsan',        iplSlug: 'sai-sudharsan',        outSlug: 'sai-sudharsan' },
  { name: 'David Warner',         iplSlug: 'david-warner',         outSlug: 'david-warner' },
  { name: 'Nicholas Pooran',      iplSlug: 'nicholas-pooran',      outSlug: 'nicholas-pooran' },
  { name: 'Tilak Varma',          iplSlug: 'tilak-varma',          outSlug: 'tilak-varma' },
  { name: 'Devdutt Padikkal',     iplSlug: 'devdutt-padikkal',     outSlug: 'devdutt-padikkal' },
  { name: 'Abhishek Sharma',      iplSlug: 'abhishek-sharma',      outSlug: 'abhishek-sharma' },
  { name: 'Riyan Parag',          iplSlug: 'riyan-parag',          outSlug: 'riyan-parag' },
  { name: 'Shivam Dube',          iplSlug: 'shivam-dube',          outSlug: 'shivam-dube' },
  { name: 'Phil Salt',            iplSlug: 'phil-salt',            outSlug: 'phil-salt' },
  { name: 'MS Dhoni',             iplSlug: 'ms-dhoni',             outSlug: 'ms-dhoni' },
  { name: 'Rishabh Pant',         iplSlug: 'rishabh-pant',         outSlug: 'rishabh-pant' },
  { name: 'Jos Buttler',          iplSlug: 'jos-buttler',          outSlug: 'jos-buttler' },
  { name: 'KL Rahul',             iplSlug: 'kl-rahul',             outSlug: 'kl-rahul' },
  { name: 'Ishan Kishan',         iplSlug: 'ishan-kishan',         outSlug: 'ishan-kishan' },
  { name: 'Quinton de Kock',      iplSlug: 'quinton-de-kock',      outSlug: 'quinton-de-kock' },
  { name: 'Sanju Samson',         iplSlug: 'sanju-samson',         outSlug: 'sanju-samson' },
  { name: 'Heinrich Klaasen',     iplSlug: 'heinrich-klaasen',     outSlug: 'heinrich-klaasen' },
  { name: 'Dhruv Jurel',          iplSlug: 'dhruv-jurel',          outSlug: 'dhruv-jurel' },
  { name: 'Hardik Pandya',        iplSlug: 'hardik-pandya',        outSlug: 'hardik-pandya' },
  { name: 'Ravindra Jadeja',      iplSlug: 'ravindra-jadeja',      outSlug: 'ravindra-jadeja' },
  { name: 'Pat Cummins',          iplSlug: 'pat-cummins',          outSlug: 'pat-cummins' },
  { name: 'Glenn Maxwell',        iplSlug: 'glenn-maxwell',        outSlug: 'glenn-maxwell' },
  { name: 'Axar Patel',           iplSlug: 'axar-patel',           outSlug: 'axar-patel' },
  { name: 'Washington Sundar',    iplSlug: 'washington-sundar',    outSlug: 'washington-sundar' },
  { name: 'Marcus Stoinis',       iplSlug: 'marcus-stoinis',       outSlug: 'marcus-stoinis' },
  { name: 'Krunal Pandya',        iplSlug: 'krunal-pandya',        outSlug: 'krunal-pandya' },
  { name: 'Liam Livingstone',     iplSlug: 'liam-livingstone',     outSlug: 'liam-livingstone' },
  { name: 'Tim David',            iplSlug: 'tim-david',            outSlug: 'tim-david' },
  { name: 'Mitchell Santner',     iplSlug: 'mitchell-santner',     outSlug: 'mitchell-santner' },
  { name: 'Venkatesh Iyer',       iplSlug: 'venkatesh-iyer',       outSlug: 'venkatesh-iyer' },
  { name: 'Jasprit Bumrah',       iplSlug: 'jasprit-bumrah',       outSlug: 'jasprit-bumrah' },
  { name: 'Yuzvendra Chahal',     iplSlug: 'yuzvendra-chahal',     outSlug: 'yuzvendra-chahal' },
  { name: 'Rashid Khan',          iplSlug: 'rashid-khan',          outSlug: 'rashid-khan' },
  { name: 'Mohammed Siraj',       iplSlug: 'mohammed-siraj',       outSlug: 'mohammed-siraj' },
  { name: 'Arshdeep Singh',       iplSlug: 'arshdeep-singh',       outSlug: 'arshdeep-singh' },
  { name: 'Mitchell Starc',       iplSlug: 'mitchell-starc',       outSlug: 'mitchell-starc' },
  { name: 'Ravichandran Ashwin',  iplSlug: 'ravichandran-ashwin',  outSlug: 'ravichandran-ashwin' },
  { name: 'Kuldeep Yadav',        iplSlug: 'kuldeep-yadav',        outSlug: 'kuldeep-yadav' },
  { name: 'Mohammed Shami',       iplSlug: 'mohammed-shami',       outSlug: 'mohammed-shami' },
  { name: 'Trent Boult',          iplSlug: 'trent-boult',          outSlug: 'trent-boult' },
  { name: 'Prasidh Krishna',      iplSlug: 'prasidh-krishna',      outSlug: 'prasidh-krishna' },
  { name: 'Varun Chakravarthy',   iplSlug: 'varun-chakravarthy',   outSlug: 'varun-chakravarthy' },
  { name: 'T Natarajan',          iplSlug: 't-natarajan',          outSlug: 't-natarajan' },
  { name: 'Harshal Patel',        iplSlug: 'harshal-patel',        outSlug: 'harshal-patel' },
  { name: 'Deepak Chahar',        iplSlug: 'deepak-chahar',        outSlug: 'deepak-chahar' },
  { name: 'Bhuvneshwar Kumar',    iplSlug: 'bhuvneshwar-kumar',    outSlug: 'bhuvneshwar-kumar' },
  { name: 'Josh Hazlewood',       iplSlug: 'josh-hazlewood',       outSlug: 'josh-hazlewood' },
  { name: 'Kagiso Rabada',        iplSlug: 'kagiso-rabada',        outSlug: 'kagiso-rabada' },
  { name: 'Noor Ahmad',           iplSlug: 'noor-ahmad',           outSlug: 'noor-ahmad' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function fetchPage(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.iplt20.com/',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, body: '', error: e.message }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www.iplt20.com/' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBinary(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) return resolve(false);
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
  });
}

function extractHeadshotId(html) {
  // Look for IPLHeadshot2026/{id}.png in og:image or twitter:image
  const match = html.match(/IPLHeadshot2026\/(\d+)\.png/);
  return match ? match[1] : null;
}

const results = { success: [], failed: [] };

async function main() {
  console.log('=== IPL Jersey Headshot Downloader ===\n');
  console.log(`Fetching ${PLAYERS.length} player pages from iplt20.com...\n`);

  for (let i = 0; i < PLAYERS.length; i++) {
    const p = PLAYERS[i];
    process.stdout.write(`[${i+1}/${PLAYERS.length}] ${p.name}... `);

    // Fetch IPL player page
    const url = `https://www.iplt20.com/players/${p.iplSlug}`;
    const res = await fetchPage(url);

    if (res.status !== 200 || !res.body) {
      console.log(`❌ Page fetch failed (HTTP ${res.status}${res.error ? ': ' + res.error : ''})`);
      results.failed.push(p.outSlug);
      await sleep(500);
      continue;
    }

    const headshotId = extractHeadshotId(res.body);
    if (!headshotId) {
      console.log(`❌ No headshot ID found in page`);
      // Save page snippet for debugging
      results.failed.push(p.outSlug);
      await sleep(500);
      continue;
    }

    // Download the IPL jersey headshot
    const imgUrl = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${headshotId}.png`;
    const destPath = `${OUTPUT_DIR}/${p.outSlug}.png`;

    // Remove old file if it's an HTML error page (< 10KB)
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
      console.log(`SKIP (already have valid file, ID=${headshotId})`);
      results.success.push({ slug: p.outSlug, id: headshotId });
      await sleep(200);
      continue;
    }

    const ok = await downloadBinary(imgUrl, destPath);
    if (ok) {
      const size = fs.statSync(destPath).size;
      if (size < 5000) {
        fs.unlinkSync(destPath);
        console.log(`❌ Downloaded file too small (${size}B), ID=${headshotId}`);
        results.failed.push(p.outSlug);
      } else {
        console.log(`✅ ${(size/1024).toFixed(0)}KB (ID=${headshotId})`);
        results.success.push({ slug: p.outSlug, id: headshotId });
      }
    } else {
      console.log(`❌ Download failed (ID=${headshotId})`);
      results.failed.push(p.outSlug);
    }

    await sleep(400); // Be polite
  }

  console.log(`\n=== Results ===`);
  console.log(`✅ Success: ${results.success.length}/${PLAYERS.length}`);
  if (results.failed.length > 0) {
    console.log(`❌ Failed:  ${results.failed.join(', ')}`);
  }

  fs.writeFileSync('./scripts/ipl-headshot-results.json', JSON.stringify(results, null, 2));
  console.log(`\nResults saved to scripts/ipl-headshot-results.json`);
}

main().catch(console.error);
