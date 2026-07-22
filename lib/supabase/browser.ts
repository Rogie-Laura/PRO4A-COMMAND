import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

/** Browser Supabase client for Realtime only (revision stamp). */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return browserClient
}
