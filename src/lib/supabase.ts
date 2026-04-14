import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Fallback placeholders so the module never crashes during SSR / static build.
// The real values come from NEXT_PUBLIC_* env vars at runtime in the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// In the browser: createBrowserClient stores the session in cookies so the
// server-side proxy can read it and protect routes.
// In Node.js (SSR / build): plain createClient, no DOM needed.
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(url, key)
    : createClient(url, key)
