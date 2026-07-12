/* ═══════════════════════════════════════════════════════════
   SUPABASE CONFIG — connected to the itelect project.
   ═══════════════════════════════════════════════════════════ */
const SUPABASE_URL      = 'https://kguzicchghzxovssiwch.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mqr1cxzIdadFhWzcx7VksQ_CjPBbi7v';

// Creates the shared client every page/script uses.
// Requires the Supabase JS library <script> tag loaded first (added in each HTML file next step).
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);