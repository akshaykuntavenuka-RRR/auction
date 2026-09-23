const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'ipl-auction-game', 'dist');
const dest = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log('[Build] Copied dist to root directory successfully.');
} else {
  console.warn('[Build] Warning: Source dist not found at ' + src);
}
