const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

// Determine dist directory path (works whether run from root or ipl-auction-game)
let DIST_DIR = path.resolve(__dirname, 'ipl-auction-game', 'dist');
if (!fs.existsSync(DIST_DIR)) {
  DIST_DIR = path.resolve(__dirname, 'dist');
}
if (!fs.existsSync(DIST_DIR)) {
  DIST_DIR = path.resolve(process.cwd(), 'ipl-auction-game', 'dist');
}
if (!fs.existsSync(DIST_DIR)) {
  DIST_DIR = path.resolve(process.cwd(), 'dist');
}

console.log(`[Railway Server] Serving static files from: ${DIST_DIR}`);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Health check endpoint for Railway
  if (pathname === '/health' || pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // 2. Cricinfo image proxy support (from vercel.json)
  if (pathname.startsWith('/cricinfo-img/')) {
    const remotePath = pathname.replace('/cricinfo-img/', '');
    const remoteUrl = `https://img1.hscicdn.com/${remotePath}`;

    const proxyReq = https.get(remoteUrl, {
      headers: {
        'Referer': 'https://www.espncricinfo.com/',
        'Origin': 'https://www.espncricinfo.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.writeHead(404);
      res.end('Image not found');
    });
    return;
  }

  // 3. Resolve requested file path
  let filePath = path.join(DIST_DIR, pathname);

  // Prevent directory traversal attacks
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if target exists and is a file
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(req, res, filePath);
    } else {
      // Check if folder contains index.html
      const subIndex = path.join(filePath, 'index.html');
      fs.stat(subIndex, (subErr, subStats) => {
        if (!subErr && subStats.isFile()) {
          serveFile(req, res, subIndex);
        } else {
          // SPA Fallback: serve root index.html for all client-side routes (e.g. /auction, /setup)
          const fallbackIndex = path.join(DIST_DIR, 'index.html');
          serveFile(req, res, fallbackIndex);
        }
      });
    }
  });
});

function serveFile(req, res, targetPath) {
  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Cache headers: Long cache for hashed Vite assets, no-cache for index.html
  const headers = { 'Content-Type': contentType };
  if (targetPath.includes(path.sep + 'assets' + path.sep)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  } else {
    headers['Cache-Control'] = 'public, max-age=86400';
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Handle compression (gzip or deflate) for text-based assets
  const shouldCompress = /text|javascript|json|xml|svg/i.test(contentType);

  if (shouldCompress && acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    fs.createReadStream(targetPath).pipe(zlib.createGzip()).pipe(res);
  } else if (shouldCompress && acceptEncoding.includes('deflate')) {
    headers['Content-Encoding'] = 'deflate';
    res.writeHead(200, headers);
    fs.createReadStream(targetPath).pipe(zlib.createDeflate()).pipe(res);
  } else {
    res.writeHead(200, headers);
    fs.createReadStream(targetPath).pipe(res);
  }
}

server.listen(PORT, HOST, () => {
  console.log(`🚀 IPL Auction Railway server running at http://${HOST}:${PORT}`);
});
