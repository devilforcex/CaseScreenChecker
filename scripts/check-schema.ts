import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
