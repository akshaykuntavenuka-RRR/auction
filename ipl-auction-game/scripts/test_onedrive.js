const https = require('https');

function encodeSharingUrl(url) {
  let base64 = Buffer.from(url).toString('base64');
  let formatted = base64.replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
  return 'u!' + formatted;
}

const shareLink = 'https://1drv.ms/v/c/c04e1b1bbe9db785/IQDb5HO_SGQBSo4my-rICE7cASHaU1oS5f7UnXkbdbcAcQg?e=Y0QPrC';
// Strip query parameters
const cleanShareLink = shareLink.split('?')[0];

console.log('Original Share Link:', cleanShareLink);
const encoded = encodeSharingUrl(cleanShareLink);
console.log('Encoded share ID:', encoded);

const apiUrl = `https://api.onedrive.com/v1.0/shares/${encoded}/root/content`;
console.log('API Url:', apiUrl);

https.get(apiUrl, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Direct download location:', res.headers.location);
  }
}).on('error', (err) => {
  console.error('Error:', err);
});
