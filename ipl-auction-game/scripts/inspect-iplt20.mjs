import fs from 'fs';

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\.system_generated\\steps\\932\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Print lines containing 57.png or IPLHeadshot2026
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('57.png') || l.includes('IPLHeadshot2026')) {
    console.log(idx + 1, l);
  }
});
