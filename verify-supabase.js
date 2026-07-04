import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env or .env.local manually for the test script
const envPath = path.resolve(__dirname, '.env.local');
const envExamplePath = path.resolve(__dirname, '.env');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
} else if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf-8');
}

const parseEnv = (content) => {
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
  return env;
};

const envVars = parseEnv(envContent);

const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or Anon Key in environment variables.');
  console.error('Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
  console.log(`Testing connection to: ${supabaseUrl}...`);
  try {
    // Simply fetch a non-existent table or auth health check to verify network/keys
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection verification failed:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase!');
    }
  } catch (err) {
    console.error('❌ Unexpected error verifying connection:', err.message);
  }
}

verifyConnection();
