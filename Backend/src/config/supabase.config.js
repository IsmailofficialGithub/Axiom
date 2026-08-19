const { createClient } = require('@supabase/supabase-js');
const env = require('./env.config');

// Initialize the Supabase client using the Service Role Key
// IMPORTANT: This client bypasses Row Level Security (RLS). 
// It must NEVER be exposed to the frontend.
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabaseAdmin;
