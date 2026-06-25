import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/types/database';

const supabase = createClient<Database>('url', 'key');
const res = supabase.from('subjects');
type T = typeof res;
// @ts-expect-error
const test: T = "trigger_error";
