const https = require('https');
const fs = require('fs');

const url = 'https://onedrive.live.com/embed?resid=C04E1B1BBE9DB785!102434&authkey=!AEY9Pse7z0A9EHE&ithint=video%2cmp4';

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    fs.writeFileSync('scripts/embed_response.html', body);
    console.log('Saved response to scripts/embed_response.html');
    
    // Find all links containing http or https
    const regex = /https?:\/\/[^\s"']+/g;
    const matches = body.match(regex) || [];
    console.log('Total URLs found:', matches.length);
    
    const candidates = matches.filter(u => u.includes('mp4') || u.includes('download') || u.includes('stream') || u.includes('video'));
    console.log('Filtered candidates:');
    console.log(Array.from(new Set(candidates)).slice(0, 10));
  });
}).on('error', err => {
  console.error(err);
});
