import fs from 'fs';
import path from 'path';

const PLAYERS = [
  { slug: 'virat-kohli', name: 'Virat Kohli' },
  { slug: 'rohit-sharma', name: 'Rohit Sharma' },
  { slug: 'ms-dhoni', name: 'MS Dhoni' },
  { slug: 'jasprit-bumrah', name: 'Jasprit Bumrah' },
  { slug: 'rishabh-pant', name: 'Rishabh Pant' },
  { slug: 'hardik-pandya', name: 'Hardik Pandya' },
  { slug: 'rashid-khan', name: 'Rashid Khan' },
  { slug: 'pat-cummins', name: 'Pat Cummins' },
  { slug: 'shubman-gill', name: 'Shubman Gill' },
  { slug: 'suryakumar-yadav', name: 'Suryakumar Yadav' },
  { slug: 'kl-rahul', name: 'KL Rahul' },
  { slug: 'yuzvendra-chahal', name: 'Yuzvendra Chahal' },
  { slug: 'ravindra-jadeja', name: 'Ravindra Jadeja' },
  { slug: 'ravichandran-ashwin', name: 'Ravichandran Ashwin' },
  { slug: 'mohammed-siraj', name: 'Mohammed Siraj' },
  { slug: 'arshdeep-singh', name: 'Arshdeep Singh' },
  { slug: 'axar-patel', name: 'Axar Patel' },
  { slug: 'washington-sundar', name: 'Washington Sundar' },
  { slug: 'yashasvi-jaiswal', name: 'Yashasvi Jaiswal' },
  { slug: 'ruturaj-gaikwad', name: 'Ruturaj Gaikwad' },
  { slug: 'ishan-kishan', name: 'Ishan Kishan' },
  { slug: 'sanju-samson', name: 'Sanju Samson' },
  { slug: 'jos-buttler', name: 'Jos Buttler' },
  { slug: 'travis-head', name: 'Travis Head' },
  { slug: 'faf-du-plessis', name: 'Faf du Plessis' },
  { slug: 'shreyas-iyer', name: 'Shreyas Iyer' },
  { slug: 'glenn-maxwell', name: 'Glenn Maxwell' },
  { slug: 'mitchell-starc', name: 'Mitchell Starc' },
  { slug: 'kuldeep-yadav', name: 'Kuldeep Yadav' },
  { slug: 'mohammed-shami', name: 'Mohammed Shami' },
];

const peopleCsvPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\scratch\\people.csv';
const csvContent = fs.readFileSync(peopleCsvPath, 'utf8');

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  const headers = lines[0].split(',');
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (let char of lines[i]) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    
    const record = {};
    headers.forEach((h, index) => {
      record[h] = row[index] || '';
    });
    records.push(record);
  }
  return records;
}

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const people = parseCSV(csvContent);
console.log(`Loaded ${people.length} people records.`);

PLAYERS.forEach(p => {
  const normPlayerName = normalizeName(p.name);
  let matched = people.find(person => normalizeName(person.name) === normPlayerName || normalizeName(person.unique_name) === normPlayerName);
  if (!matched) {
    matched = people.find(person => {
      const normName = normalizeName(person.name);
      const normUnique = normalizeName(person.unique_name);
      return normName.includes(normPlayerName) || normPlayerName.includes(normName) ||
             normUnique.includes(normPlayerName) || normPlayerName.includes(normUnique);
    });
  }
  if (matched) {
    console.log(`${p.name} (${p.slug}): Cricbuzz ID = ${matched.key_cricbuzz || 'None'}, Cricinfo ID = ${matched.key_cricinfo || 'None'}, Pulse ID = ${matched.key_pulse || 'None'}`);
  } else {
    console.log(`${p.name} (${p.slug}): Not found`);
  }
});
