const https = require('https');
const fs = require('fs');

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(options, (res) => {
      console.log('Download Status:', res.statusCode);
      console.log('Download Headers:', res.headers);
      
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirecting to:', res.headers.location);
        download(res.headers.location, filePath).then(resolve).catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get 200, status code: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Download complete!');
        resolve();
      });
    }).on('error', reject);
  });
}

const testUrl = 'https://onedrive.live.com/download?cid=C04E1B1BBE9DB785&resid=C04E1B1BBE9DB785%21102434&authkey=%21AEY9Pse7z0A9EHE';

download(testUrl, 'public/login-bg.mp4')
  .then(() => console.log('Successfully downloaded to public/login-bg.mp4!'))
  .catch(console.error);
