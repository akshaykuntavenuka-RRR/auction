import fs from 'fs';

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\.system_generated\\steps\\1046\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

const matches = content.match(/https?:\/\/documents\.iplt20\.com\/ipl\/IPLHeadshot2026\/[^\s"'>]+/gi) || [];
console.log('Found headshot URLs:', matches);
