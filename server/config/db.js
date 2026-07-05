import { createClient } from '@supabase/supabase-js';
import { setFallbackMode } from '../utils/fallbackStore.js';

export let supabase = null;

export const connectDB = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key missing in env, falling back to in-memory demo mode');
    setFallbackMode(true);
    return;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });

    // Test connectivity
    const { error } = await supabase.from('site_settings').select('id').limit(1);
    if (error) throw error;

    console.log('Supabase connected successfully');
    setFallbackMode(false);
  } catch (error) {
    console.warn('Supabase connection error:', error.message);
    console.warn('Falling back to in-memory demo mode');
    setFallbackMode(true);
  }
};

