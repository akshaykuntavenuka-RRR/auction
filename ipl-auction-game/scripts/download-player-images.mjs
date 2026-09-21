import fs from 'fs'
import path from 'path'
import https from 'https'

const OUTPUT_DIR = './public/players'
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// Mapping of player slugs to their Cricinfo image paths from src/data/players.js
const PLAYERS = [
  { slug: 'virat-kohli',        cricinfoPath: '313200/313252.png' },
  { slug: 'rohit-sharma',       cricinfoPath: '313200/313262.png' },
  { slug: 'ms-dhoni',           cricinfoPath: '28081/28081.png' },
  { slug: 'jasprit-bumrah',     cricinfoPath: '625383/625383.png' },
  { slug: 'rishabh-pant',       cricinfoPath: '1070173/1070173.png' },
  { slug: 'hardik-pandya',      cricinfoPath: '625371/625371.png' },
  { slug: 'rashid-khan',        cricinfoPath: '941034/941034.png' },
  { slug: 'pat-cummins',        cricinfoPath: '588687/588687.png' },
  { slug: 'shubman-gill',       cricinfoPath: '1151698/1151698.png' },
  { slug: 'suryakumar-yadav',   cricinfoPath: '481774/481774.png' },
  { slug: 'kl-rahul',           cricinfoPath: '422108/422108.png' },
  { slug: 'yuzvendra-chahal',   cricinfoPath: '625373/625373.png' },
  { slug: 'ravindra-jadeja',    cricinfoPath: '234675/234675.png' },
  { slug: 'ravichandran-ashwin',cricinfoPath: '26421/26421.png' },
  { slug: 'mohammed-siraj',     cricinfoPath: '1151827/1151827.png' },
  { slug: 'arshdeep-singh',     cricinfoPath: '1151764/1151764.png' },
  { slug: 'axar-patel',         cricinfoPath: '604296/604296.png' },
  { slug: 'washington-sundar',  cricinfoPath: '1151875/1151875.png' },
  { slug: 'yashasvi-jaiswal',   cricinfoPath: '1207645/1207645.png' },
  { slug: 'ruturaj-gaikwad',    cricinfoPath: '1151799/1151799.png' },
  { slug: 'ishan-kishan',       cricinfoPath: '1151793/1151793.png' },
  { slug: 'sanju-samson',       cricinfoPath: '559235/559235.png' },
  { slug: 'jos-buttler',        cricinfoPath: '308967/308967.png' },
  { slug: 'travis-head',        cricinfoPath: '720502/720502.png' },
  { slug: 'faf-du-plessis',     cricinfoPath: '300638/300638.png' },
  { slug: 'shreyas-iyer',       cricinfoPath: '989371/989371.png' },
  { slug: 'glenn-maxwell',      cricinfoPath: '430246/430246.png' },
  { slug: 'mitchell-starc',     cricinfoPath: '397629/397629.png' },
  { slug: 'kuldeep-yadav',      cricinfoPath: '667535/667535.png' },
  { slug: 'mohammed-shami',     cricinfoPath: '481896/481896.png' },
]

function downloadImage(slug, cricinfoPath) {
  return new Promise((resolve) => {
    const url = `https://img1.hscicdn.com/image/upload/f_auto,t_h_100_2x/lsci/db/PICTURES/CMS/${cricinfoPath}`
    const filePath = path.join(OUTPUT_DIR, `${slug}.png`)
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.espncricinfo.com/'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filePath)
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`✅ ${slug}`)
          resolve(true)
        })
      } else {
        console.log(`❌ ${slug}: Status ${res.statusCode}`)
        resolve(false)
      }
    })
    req.on('error', (e) => {
      console.log(`❌ ${slug}: ${e.message}`)
      resolve(false)
    })
  })
}

async function start() {
  console.log('Downloading player images from ESPNcricinfo...\n')
  for (const p of PLAYERS) {
    await downloadImage(p.slug, p.cricinfoPath)
    await new Promise(r => setTimeout(r, 200)) // Throttle to prevent rate-limiting
  }
  console.log('\n✅ Done! Images saved to public/players/')
}

start()
