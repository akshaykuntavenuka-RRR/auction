import fs from 'fs';

const content = fs.readFileSync('src/data/players.js', 'utf8');

// Match all player objects in src/data/players.js
// We can use a regex to extract name and image:
// name: 'Player Name', ... image: espn('...') or avatar('...')
const playerBlocks = content.match(/name:\s*'([^']+)'[\s\S]*?image:\s*(espn\('[^']+'\)|avatar\('[^']+'\)|`[^`]+`)/g) || [];

console.log(`Found ${playerBlocks.length} player blocks:`);
playerBlocks.forEach(block => {
  const nameMatch = block.match(/name:\s*'([^']+)'/);
  const imageMatch = block.match(/image:\s*(espn\('[^']+'\)|avatar\('[^']+'\)|`[^`]+`)/);
  if (nameMatch && imageMatch) {
    console.log(`${nameMatch[1]} -> ${imageMatch[1]}`);
  }
});
