const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.warn('⚠️ Supabase init failed:', error.message);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase credentials missing - using memory only');
}

module.exports = { supabase };
