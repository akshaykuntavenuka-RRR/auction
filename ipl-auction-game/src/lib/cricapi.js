/**
 * cricapi.js
 * Player photo resolution: Wikipedia Pageimages API (CORS-enabled) + DiceBear fallback
 */

// Wikipedia article titles for each player name
export const PLAYER_WIKI_TITLES = {
  // Batsmen
  'Virat Kohli':           'Virat Kohli',
  'Rohit Sharma':          'Rohit Sharma',
  'Shubman Gill':          'Shubman Gill',
  'Suryakumar Yadav':      'Suryakumar Yadav',
  'Yashasvi Jaiswal':      'Yashasvi Jaiswal',
  'Ruturaj Gaikwad':       'Ruturaj Gaikwad',
  'Travis Head':           'Travis Head (cricketer)',
  'Faf du Plessis':        'Faf du Plessis',
  'Shreyas Iyer':          'Shreyas Iyer',
  'Sai Sudharsan':         'Sai Sudharsan',
  'David Warner':          'David Warner (cricketer)',
  'Nicholas Pooran':       'Nicholas Pooran',
  'Tilak Varma':           'Tilak Varma',
  'Devdutt Padikkal':      'Devdutt Padikkal',
  'Abhishek Sharma':       'Abhishek Sharma (cricketer)',
  'Riyan Parag':           'Riyan Parag',
  'Shivam Dube':           'Shivam Dube',
  'Phil Salt':             'Phil Salt',
  'Rajat Patidar':         'Rajat Patidar',
  'Rinku Singh':           'Rinku Singh',
  // Wicketkeepers
  'MS Dhoni':              'MS Dhoni',
  'Rishabh Pant':          'Rishabh Pant',
  'Jos Buttler':           'Jos Buttler',
  'KL Rahul':              'KL Rahul',
  'Ishan Kishan':          'Ishan Kishan',
  'Quinton de Kock':       'Quinton de Kock',
  'Sanju Samson':          'Sanju Samson',
  'Heinrich Klaasen':      'Heinrich Klaasen',
  'Dhruv Jurel':           'Dhruv Jurel',
  'Jitesh Sharma':         'Jitesh Sharma',
  'Wriddhiman Saha':       'Wriddhiman Saha',
  // All-rounders
  'Hardik Pandya':         'Hardik Pandya',
  'Ravindra Jadeja':       'Ravindra Jadeja',
  'Pat Cummins':           'Pat Cummins',
  'Glenn Maxwell':         'Glenn Maxwell (cricketer)',
  'Axar Patel':            'Axar Patel',
  'Washington Sundar':     'Washington Sundar',
  'Marcus Stoinis':        'Marcus Stoinis',
  'Krunal Pandya':         'Krunal Pandya',
  'Liam Livingstone':      'Liam Livingstone',
  'Tim David':             'Tim David (cricketer)',
  'Mitchell Santner':      'Mitchell Santner',
  'Venkatesh Iyer':        'Venkatesh Iyer',
  'Sam Curran':            'Sam Curran',
  'Moeen Ali':             'Moeen Ali',
  'Shardul Thakur':        'Shardul Thakur',
  'Sunil Narine':          'Sunil Narine',
  'Jonny Bairstow':        'Jonny Bairstow',
  'Aiden Markram':         'Aiden Markram',
  'Shahbaz Ahmed':         'Shahbaz Ahmed (cricketer)',
  // Bowlers
  'Jasprit Bumrah':        'Jasprit Bumrah',
  'Yuzvendra Chahal':      'Yuzvendra Chahal',
  'Rashid Khan':           'Rashid Khan (cricketer)',
  'Mohammed Siraj':        'Mohammed Siraj',
  'Arshdeep Singh':        'Arshdeep Singh',
  'Mitchell Starc':        'Mitchell Starc',
  'Ravichandran Ashwin':   'Ravichandran Ashwin',
  'Kuldeep Yadav':         'Kuldeep Yadav',
  'Mohammed Shami':        'Mohammed Shami',
  'Trent Boult':           'Trent Boult',
  'Prasidh Krishna':       'Prasidh Krishna',
  'Varun Chakravarthy':    'Varun Chakravarthy (cricketer)',
  'T Natarajan':           'T. Natarajan',
  'Harshal Patel':         'Harshal Patel',
  'Deepak Chahar':         'Deepak Chahar',
  'Bhuvneshwar Kumar':     'Bhuvneshwar Kumar',
  'Josh Hazlewood':        'Josh Hazlewood',
  'Kagiso Rabada':         'Kagiso Rabada',
  'Noor Ahmad':            'Noor Ahmad (cricketer)',
  'Mayank Yadav':          'Mayank Yadav (cricketer)',
  'Tushar Deshpande':      'Tushar Deshpande',
  'Avesh Khan':            'Avesh Khan',
  'Ravi Bishnoi':          'Ravi Bishnoi',
  'Khaleel Ahmed':         'Khaleel Ahmed',
  'Akash Deep':            'Akash Deep (cricketer)',
  'Umran Malik':           'Umran Malik',
};

// In-memory cache for fetched photo URLs
const photoCache = {};

/**
 * Fetches a player photo URL from Wikipedia's Pageimages API.
 * Wikipedia's API is CORS-enabled and free to use in the browser.
 * Returns null if no photo is found.
 */
export async function fetchPlayerPhotoFromWikipedia(playerName) {
  if (photoCache[playerName] !== undefined) {
    return photoCache[playerName];
  }

  const wikiTitle = PLAYER_WIKI_TITLES[playerName] || playerName;

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const res = await fetch(url);
    if (!res.ok) {
      photoCache[playerName] = null;
      return null;
    }
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      for (const id in pages) {
        const thumb = pages[id]?.thumbnail?.source;
        if (thumb) {
          photoCache[playerName] = thumb;
          return thumb;
        }
      }
    }
  } catch (_e) {
    // Network error or parse error
  }

  photoCache[playerName] = null;
  return null;
}

/**
 * Synchronous getter — returns cached URL or null if not yet fetched.
 * Used by components that need a synchronous check.
 */
export function getPlayerPhoto(playerName) {
  return photoCache[playerName] || null;
}

/**
 * Professional fallback avatar using UI Avatars
 */
export function getPlayerFallback(playerName, role) {
  const colors = {
    BAT:  '8B6914,FFD700',
    BOWL: '1A3A6B,00C9FF',
    AR:   '1A4A2A,00F5A0',
    WK:   '6B1A3A,FF3CAC',
  };
  const [bg, fg] = (colors[role] || colors.BAT).split(',');
  const initials = (playerName || 'PL').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${fg}&size=320&bold=true&font-size=0.45`;
}
