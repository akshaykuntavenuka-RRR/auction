import fs from 'fs';

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\.system_generated\\steps\\986\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Find all matches like:
// name or profile links and headshots
// Let's print out lines containing "IPLHeadshot2026" and see what is around them!
const lines = content.split('\n');
console.log('Total lines:', lines.length);

let matchesCount = 0;
lines.forEach((l, idx) => {
  if (l.includes('IPLHeadshot2026') || l.includes('Headshot')) {
    matchesCount++;
    console.log(idx + 1, l.trim().substring(0, 300));
  }
});

console.log('Total matches:', matchesCount);
