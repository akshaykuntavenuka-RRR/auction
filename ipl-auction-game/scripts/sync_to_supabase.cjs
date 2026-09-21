const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read credentials from .env.local or environment
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ejxjayzbkejsewuvcrxw.supabase.co';
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('VITE_SUPABASE_URL=', '').trim();
    }
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = trimmed.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim();
    } else if (!process.env.SUPABASE_SERVICE_ROLE_KEY && trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = supabaseKey || trimmed.replace('VITE_SUPABASE_ANON_KEY=', '').trim();
    }
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log('🔄 Loading verified players data...');
  // Dynamic import of players.js
  const playersModule = await import('../src/data/players.js');
  const players = playersModule.PLAYERS;

  console.log(`📊 Found ${players.length} players to sync to Supabase (${supabaseUrl})`);

  // Prepare database rows
  const rows = players.map((p, idx) => {
    const baseVal = typeof p.base === 'number' && !isNaN(p.base) ? p.base : 0.5;
    return {
      id: String(idx + 1),
      name: p.name,
      ipl_team: p.ipl || p.team2026 || '',
      role: p.role || 'BAT',
      nationality: p.nationality || 'India',
      age: p.age || 0,
      batting_style: p.battingStyle || '',
      bowling_style: p.bowlingStyle || '',
      image_id: p.image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(p.name.toLowerCase())}&backgroundColor=b6e3f4,c0aede`,
      t20_matches: p.stats?.matches || 0,
      t20_runs: p.stats?.runs || 0,
      t20_average: p.stats?.average || 0,
      t20_strike_rate: p.stats?.strikeRate || 0,
      t20_wickets: p.stats?.wickets || 0,
      t20_economy: p.stats?.economy || 0,
      t20_best_figures: p.stats?.bestFigures || '-',
      base_price: baseVal,
      updated_at: new Date().toISOString()
    };
  });

  const BATCH_SIZE = 25;
  let successCount = 0;
  let failCount = 0;
  let firstError = null;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    try {
      const { data, error } = await supabase
        .from('players')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        failCount += batch.length;
        if (!firstError) firstError = error;
        console.error(`❌ Batch ${batchNum}/${totalBatches} failed: ${error.message}`);
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${batchNum}/${totalBatches} synced (${successCount}/${rows.length} players)`);
      }
    } catch (err) {
      failCount += batch.length;
      if (!firstError) firstError = err;
      console.error(`❌ Batch ${batchNum} error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\n======================================');
  if (successCount > 0) {
    console.log(`🎉 Sync completed: ${successCount} / ${rows.length} players stored in Supabase!`);
  }
  if (failCount > 0) {
    console.warn(`⚠️ ${failCount} players could not be inserted.`);
    console.warn('Reason:', firstError?.message || firstError);
  }
  console.log('======================================\n');
  return { successCount, failCount, firstError };
}

sync().then(res => {
  if (res.failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
