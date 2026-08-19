import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(url, {
    headers: {
      'apikey': key!,
      'Authorization': 'Bearer ' + key!
    }
  });
  const obj = await res.json();
  console.log('Tables:', Object.keys(obj.definitions));
  console.log('compatibility_relationships cols:', Object.keys(obj.definitions.compatibility_relationships.properties));
  console.log('phone_models cols:', Object.keys(obj.definitions.phone_models.properties));
  console.log('phone_aliases cols:', Object.keys(obj.definitions.phone_aliases.properties));
  console.log('compatibility_evidence cols:', Object.keys(obj.definitions.compatibility_evidence.properties));
}
run();
