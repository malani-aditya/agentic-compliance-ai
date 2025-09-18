import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service key for admin operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!
)

// Real-time subscription helpers
export const subscribeToSession = (sessionId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'evidence_sessions',
        filter: `id=eq.${sessionId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'evidence_items',
        filter: `session_id=eq.${sessionId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToEvidenceUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('evidence-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'evidence_items'
      },
      callback
    )
    .subscribe()
}
