const https = require('https');
const fs = require('fs');

function fetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  const url3 = 'https://onedrive.live.com/?qt=allmyphotos&photosData=%2fshare%2fC04E1B1BBE9DB785!sbf73e4db64484a018e26cbeac8084edc%3fithint%3dvideo%26e%3dY0QPrC%26migratedtospo%3dtrue&cid=C04E1B1BBE9DB785&id=C04E1B1BBE9DB785!sbf73e4db64484a018e26cbeac8084edc&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3YvYy9jMDRlMWIxYmJlOWRiNzg1L0lRRGI1SE9fU0dRQlNvNG15LXJJQ0U3Y0FTSGFVMW9TNWY3VW5Ya2JkYmNBY1FnP2U9WTBRUHJD';
  console.log('Fetching page 3...');
  let res = await fetch(url3);
  console.log('Page 3 status:', res.statusCode);
  fs.writeFileSync('scripts/page3.html', res.body);
  console.log('Saved page 3 to scripts/page3.html');
  
  // Find all URLs
  const regex = /https?:\/\/[^\s"']+/g;
  const matches = res.body.match(regex) || [];
  const candidates = Array.from(new Set(matches.filter(u => u.includes('mp4') || u.includes('download') || u.includes('stream') || u.includes('video') || u.includes('1drv') || u.includes('sharepoint'))));
  console.log('Filtered candidates (first 30):', candidates.slice(0, 30));
}

run().catch(console.error);
