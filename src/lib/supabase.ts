import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createBrowserClient stores the session in cookies so the proxy can read it.
// During SSR / static build (Node.js, no DOM), fall back to createClient to avoid
// "document is not defined" errors — auth is never used server-side anyway.
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(url, key)
    : createClient(url, key)
