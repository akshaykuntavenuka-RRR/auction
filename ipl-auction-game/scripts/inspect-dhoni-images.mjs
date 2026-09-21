import fs from 'fs';

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity-ide\\brain\\a8e008fb-fbbd-4de5-9692-af827f0b9eb3\\.system_generated\\steps\\1046\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Find all matches for <img ... src="..."> or similar
const matches = content.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
console.log('Found <img> tags:', matches.length);
matches.forEach(img => {
  if (img.includes('png') || img.includes('jpg') || img.includes('jpeg') || img.includes('webp')) {
    console.log(img.trim().substring(0, 150));
  }
});
