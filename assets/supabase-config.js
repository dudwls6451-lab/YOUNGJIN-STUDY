(() => {
  'use strict';

  const SUPABASE_URL = 'https://ccgvewotmiumtyhpbzzl.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7iTe_SX7MhHNJWu6JmrnSA_Vy0TIuGt';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Supabase] supabase-js library was not loaded.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.info('[Supabase] client initialized:', Boolean(window.supabaseClient));
})();
