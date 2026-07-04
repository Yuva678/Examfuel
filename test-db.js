import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

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
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('subject');
    
  if (error) {
    console.error('Error fetching:', error.message);
    return;
  }
  
  const subjects = data.reduce((acc, curr) => {
    acc[curr.subject] = (acc[curr.subject] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Subject counts in DB:');
  console.log(subjects);
}

checkResources();
