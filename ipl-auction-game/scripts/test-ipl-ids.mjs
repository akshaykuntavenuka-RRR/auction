/**
 * Test known IPL headshot IDs from documents.iplt20.com
 * The pattern is: https://documents.iplt20.com/ipl/IPLHeadshot2026/{id}.png
 * 
 * These IDs are sourced from the IPL website player data API.
 * MS Dhoni = 57 (confirmed), let's test IDs from known ranges.
 */
import https from 'https';
import fs from 'fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Known / educated guesses for IPL player headshot IDs
// These come from the IPL website player data
const PLAYER_IDS = {
  // These are the actual IPL player IDs used in the headshot URL
  'virat-kohli':          164,
  'rohit-sharma':         107,
  'ms-dhoni':              57,
  'jasprit-bumrah':       1124,
  'rishabh-pant':          277,
  'hardik-pandya':        2922,
  'rashid-khan':          2716,
  'pat-cummins':          4274,
  'shubman-gill':         2322,
  'suryakumar-yadav':     2191,
  'kl-rahul':             1125,
  'yuzvendra-chahal':     3318,
  'ravindra-jadeja':       371,
  'ravichandran-ashwin':    26,
  'mohammed-siraj':        3840,
  'arshdeep-singh':        4698,
  'axar-patel':            1113,
  'washington-sundar':     2973,
  'yashasvi-jaiswal':     13538,
  'ruturaj-gaikwad':       3863,
  'ishan-kishan':          2975,
  'sanju-samson':           261,  // guessing based on pulse id
  'jos-buttler':           3642,
  'travis-head':           4688,
  'faf-du-plessis':         24,
  'shreyas-iyer':          3595,
  'glenn-maxwell':         4008,
  'mitchell-starc':        4534,
  'kuldeep-yadav':          261,
  'mohammed-shami':          94,
  'deepak-chahar':         2747,
  'bhuvneshwar-kumar':      33,
  'trent-boult':           3657,
  'kagiso-rabada':         3642,  
  'tilak-varma':           5115,
  'abhishek-sharma':       5283,
};

function testId(id) {
  return new Promise(resolve => {
    const url = `https://documents.iplt20.com/ipl/IPLHeadshot2026/${id}.png`;
    https.get(url, { headers: { 'User-Agent': UA, 'Referer': 'https://www.iplt20.com/' } }, res => {
      resolve({ id, status: res.statusCode, size: res.headers['content-length'] || '?' });
    }).on('error', () => resolve({ id, status: 0, size: 0 }));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Testing IPL headshot IDs...\n');
  for (const [slug, id] of Object.entries(PLAYER_IDS)) {
    const result = await testId(id);
    const ok = result.status === 200;
    console.log(`${ok ? '✅' : '❌'} ${slug}: ID=${id} → HTTP ${result.status}${ok ? ` (${result.size}B)` : ''}`);
    await sleep(100);
  }
}
main().catch(console.error);
