(() => {
  const SUPABASE_URL = "https://ccgvewotmiumtyhpbzzl.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7iTe_SX7MhHNJWu6JmrnSA_Vy0TIuGt";

  if (!window.supabase?.createClient) {
    console.error("[Supabase] supabase-js가 먼저 로드되지 않았습니다.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log("[Supabase] client initialized:", !!window.supabaseClient);
})();
