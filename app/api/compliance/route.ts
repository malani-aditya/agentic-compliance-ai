import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')
    const status = searchParams.get('status')
    const checkType = searchParams.get('checkType')

    let query = supabaseAdmin
      .from('compliance_checks')
      .select('*')
      .order('created_at', { ascending: false })

    if (team && team !== 'all') {
      query = query.eq('team', team)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (checkType && checkType !== 'all') {
      query = query.eq('check_type', checkType)
    }

    const { data: checks, error } = await query

    if (error) throw error

    return NextResponse.json({ checks })
  } catch (error) {
    console.error('Get compliance checks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance checks' }, 
      { status: 500 }
    )
  }
}
