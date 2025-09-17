import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { selectedChecks, adminUserId } = await request.json()

    if (!selectedChecks?.length) {
      return NextResponse.json({ error: 'No checks selected' }, { status: 400 })
    }

    // Create evidence session
    const { data: session, error } = await supabaseAdmin
      .from('evidence_sessions')
      .insert({
        admin_user_id: adminUserId,
        selected_checks: selectedChecks,
        status: 'pending',
        progress_steps: [],
        estimated_time_minutes: selectedChecks.length * 5 // 5 min per check estimate
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('evidence_sessions')
      .select(`
        *,
        evidence_items (
          id,
          status,
          evidence_type,
          file_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' }, 
      { status: 500 }
    )
  }
}
