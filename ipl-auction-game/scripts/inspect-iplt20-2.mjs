import fs from 'fs';

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\.system_generated\\steps\\932\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

const matches = content.match(/[^0-9]57[^0-9]/g) || [];
console.log('Occurrences of 57:', matches.length);

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('57')) {
    console.log(idx + 1, l.trim().substring(0, 150));
  }
});
