v11.34 → Supabase connection bootstrap patch

Changed files:
- index.html
- assets/supabase-config.js

What this patch does:
- Loads supabase-js v2 from jsDelivr.
- Initializes window.supabaseClient with the project's Project URL and Publishable key.
- Leaves the existing auth-v11-6.js and app-v11-18.js logic unchanged.
- Prints "[Supabase] client initialized: true" in the browser console when initialization succeeds.

This patch does NOT yet replace the existing login system or migrate LocalStorage learning history.
