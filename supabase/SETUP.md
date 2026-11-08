# Supabase account setup

1. Create a Supabase project.
2. In the SQL Editor, run [`schema.sql`](./schema.sql). The table has row-level security policies that limit every operation to the signed-in user's row. If you ran an earlier version of this setup, run the updated file again; it safely adds the game library and weekly study-goal columns. If the app says a column does not exist, the database needs this updated SQL before that feature can sync.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from **Project Settings → API Keys**. Copy the entire publishable key (it starts with `sb_publishable_`); existing setups using the legacy anon JWT key (starts with `eyJ`) in `VITE_SUPABASE_ANON_KEY` continue to work. Do not use the project/database password, a secret key, or a `service_role` key in a browser variable.
4. In Supabase Authentication settings, configure the site URL and redirect URLs for your local Vite origin and deployed site. Enable email confirmation if you want verified accounts.
5. Restart Vite after changing environment variables.

Without these variables, account controls remain disabled and the chess app continues in browser-only mode. Existing local collections, review snapshots, imported games, and custom study goals are imported into the signed-in account once per browser and user; the local copies are retained. Public Lichess and Chess.com game imports use the providers' public game/archive APIs and do not require your passwords or account tokens.
