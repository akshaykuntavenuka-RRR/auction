import https from 'https';

const url = 'https://www.iplt20.com/teams/mumbai-indians/squad';
https.get(url, {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.iplt20.com/' }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Find any JavaScript data that contains player IDs
    const scriptDataMatches = d.match(/ng-init="[^"]{0,500}"/g) || [];
    console.log('ng-init blocks:', scriptDataMatches.length);
    
    // Find JSON-like objects with player data
    const jsonMatches = d.match(/\{"id":\d+[^}]{0,200}}/g) || [];
    console.log('JSON objects found:', jsonMatches.length);
    jsonMatches.slice(0, 5).forEach(m => console.log(m.substring(0, 200)));
    
    // Find all Headshot IDs
    const headshotIds = [...new Set((d.match(/IPLHeadshot2026\/(\d+)\.png/g) || []))];
    console.log('\nHeadshot IDs found:', headshotIds.length);
    headshotIds.forEach(h => console.log(h));
    
    // Find all player hrefs
    const playerHrefs = [...new Set((d.match(/href="\/players\/[^"]+"/g) || []))];
    console.log('\nPlayer hrefs:', playerHrefs.length);
    playerHrefs.slice(0, 10).forEach(h => console.log(h));
    
    // Save HTML snippet
    const idx = d.indexOf('IPLHeadshot2026');
    if (idx > 0) {
      console.log('\n--- Context around first Headshot ---');
      console.log(d.substring(Math.max(0, idx-500), idx+300));
    }
  });
});
