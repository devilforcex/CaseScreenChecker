import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  console.log('Cleaning up partial migration data...');

  // Order matters: evidence -> relationships -> aliases -> models
  const { error: e1 } = await supabase.from('compatibility_evidence').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('compatibility_evidence:', e1 ? e1.message : 'cleared');

  const { error: e2 } = await supabase.from('compatibility_relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('compatibility_relationships:', e2 ? e2.message : 'cleared');

  const { error: e3 } = await supabase.from('phone_aliases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('phone_aliases:', e3 ? e3.message : 'cleared');

  const { error: e4 } = await supabase.from('phone_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('phone_models:', e4 ? e4.message : 'cleared');

  console.log('Cleanup done.');
}
run();
