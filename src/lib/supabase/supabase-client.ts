import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

// These would normally be environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);