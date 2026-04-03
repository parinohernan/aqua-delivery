const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set. Expenses module will not work.');
}

// Service client (bypasses RLS - for server-side operations)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Anon client (respects RLS - for user-scoped operations)
const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Creates a Supabase client scoped to a specific user's JWT.
 * This ensures RLS policies are enforced for that user.
 * @param {string} accessToken - The user's Supabase access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
const getSupabaseClient = (accessToken) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

module.exports = {
  supabaseAdmin,
  supabaseAnon,
  getSupabaseClient,
};
