const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'c:\\Ipl cricket Auction\\IPL_Players_Stats_Verified_Batch49.xlsx';
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const excelRows = XLSX.utils.sheet_to_json(worksheet);

// Build lookup map by lowercase trimmed name
const excelMap = new Map();
for (const r of excelRows) {
  const name = r['Player Name']?.trim();
  if (!name) continue;
  excelMap.set(name.toLowerCase(), r);
  if (name === 'Lhuan-dre Pretorius') {
    excelMap.set('lhuan-dre pretorious', r);
  }
}

// Role map
const roleCodeMap = {
  'ALL-ROUNDER': 'AR',
  'BOWLER': 'BOWL',
  'WICKETKEEPER': 'WK',
  'BATSMAN': 'BAT'
};

// We can read the existing PLAYERS by importing or evaluating
// Let's create a script that loads PLAYERS, updates their stats from excel, and writes it back cleanly!
const jsPath = 'src/data/players.js';
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Find PLAYERS = [ ... ];
const startMarker = 'export const PLAYERS = [';
const endMarker = '];\n\nexport const mockPlayers';

const startIndex = jsContent.indexOf(startMarker);
const endIndex = jsContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate markers in players.js');
  process.exit(1);
}

// Evaluate existing PLAYERS array
const playersArrayStr = jsContent.slice(startIndex + 'export const PLAYERS = '.length, endIndex + 1);
const players = eval(`(${playersArrayStr})`);

console.log(`Loaded ${players.length} players from players.js`);

let updatedCount = 0;
for (const p of players) {
  const lookupKey = p.name.trim().toLowerCase();
  const row = excelMap.get(lookupKey);
  if (!row) {
    console.warn('No excel row for:', p.name);
    continue;
  }

  // Update role if in excel
  if (row['Role'] && roleCodeMap[row['Role']]) {
    p.role = roleCodeMap[row['Role']];
  }

  // Update stats
  p.stats = p.stats || {};
  if (row['Total IPL Match Innings'] !== undefined) {
    p.stats.matches = Number(row['Total IPL Match Innings']) || 0;
  }
  if (row['Total Runs (Batter/AR)'] !== undefined) {
    p.stats.runs = Number(row['Total Runs (Batter/AR)']) || 0;
  }
  if (row['Total Wickets (Bowler/AR)'] !== undefined) {
    p.stats.wickets = Number(row['Total Wickets (Bowler/AR)']) || 0;
  }
  if (row['Batting Average'] !== undefined) {
    p.stats.average = Number(row['Batting Average']) || 0;
  }
  if (row['Batting Strike Rate'] !== undefined) {
    p.stats.strikeRate = Number(row['Batting Strike Rate']) || 0;
  }
  if (row['Bowling Economy'] !== undefined) {
    p.stats.economy = Number(row['Bowling Economy']) || 0;
  }
  if (row['Bowling Average'] !== undefined) {
    p.stats.bowlingAverage = Number(row['Bowling Average']) || 0;
  }

  updatedCount++;
}

console.log(`Updated ${updatedCount} players with verified statistics.`);

// Generate new JS content
const newPlayersJson = JSON.stringify(players, null, 2);
const newJsContent = jsContent.slice(0, startIndex + 'export const PLAYERS = '.length) + 
                     newPlayersJson + 
                     jsContent.slice(endIndex + 1);

fs.writeFileSync(jsPath, newJsContent, 'utf8');
console.log('Successfully updated src/data/players.js with verified stats!');
