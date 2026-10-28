import { createClient } from '@supabase/supabase-js'

// This client bypasses Row Level Security. NEVER use this on the client side.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}