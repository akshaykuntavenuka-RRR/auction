import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local file to get variables
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
const env = {};
for (const line of lines) {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
}

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('players', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg'],
      fileSizeLimit: 1048576 // 1MB
    });
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

testCreateBucket();
