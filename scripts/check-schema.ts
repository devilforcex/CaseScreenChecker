import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

if (process.env.ALLOW_SCHEMA_PROBE !== 'true') {
  throw new Error('Refusing schema probe because it writes temporary rows. Set ALLOW_SCHEMA_PROBE=true for an approved non-production target.');
}

if (process.env.NODE_ENV === 'production' || process.env.SUPABASE_ENVIRONMENT === 'production') {
  throw new Error('Refusing schema probe against a production target.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data } = await supabase.from('phone_aliases').select('*');
  console.log('Existing aliases:', JSON.stringify(data, null, 2));

  // Try more alias_kind values
  const kinds = ['brand_variant', 'common_name', 'retail', 'display_name', 'variant', 'regional', 'rebrand', 'sku'];
  const { data: models } = await supabase.from('phone_models').select('id').limit(1);
  const modelId = models![0].id;
  const uuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  for (const kind of kinds) {
    const { error } = await supabase.from('phone_aliases').insert({
      id: uuid, model_id: modelId, alias: `test_${kind}`, alias_kind: kind
    });
    if (!error) {
      console.log(`  "${kind}" -> VALID`);
      await supabase.from('phone_aliases').delete().eq('id', uuid);
    } else if (!error.message.includes('check constraint')) {
      console.log(`  "${kind}" -> ${error.message}`);
    }
  }
}
run();
