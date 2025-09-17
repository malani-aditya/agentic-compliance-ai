# Create the API directories and files properly
import os

# Create all necessary API directories
os.makedirs('app/api/sessions/[id]/start', exist_ok=True) 
os.makedirs('app/api/slack/interactions', exist_ok=True)
os.makedirs('app/api/compliance', exist_ok=True)

# Session start API route
session_start = '''import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getModel } from '@/lib/llm-providers'
import { generateText } from 'ai'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    // Get session and associated checks
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('evidence_sessions')
      .select(`
        *,
        compliance_checks!inner(*)
      `)
      .eq('id', sessionId)
      .single()
    
    if (sessionError) throw sessionError
    
    // Update session status to collecting
    await supabaseAdmin
      .from('evidence_sessions')
      .update({ 
        status: 'collecting',
        progress_steps: [{
          step: 1,
          title: 'Initializing AI agent',
          status: 'in_progress',
          message: 'Starting evidence collection...',
          timestamp: new Date().toISOString()
        }]
      })
      .eq('id', sessionId)
    
    // Start async collection process
    collectEvidenceAsync(sessionId, session.compliance_checks)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Start collection error:', error)
    return NextResponse.json(
      { error: 'Failed to start collection' }, 
      { status: 500 }
    )
  }
}

async function collectEvidenceAsync(sessionId: string, checks: any[]) {
  // Implementation here...
}
'''

# Slack interactions API
slack_interactions = '''import { NextRequest, NextResponse } from 'next/server'
import { verifySlackSignature } from '@/lib/slack'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-slack-signature') || ''
    const timestamp = request.headers.get('x-slack-request-timestamp') || ''
    
    // Verify Slack signature
    if (!verifySlackSignature(signature, timestamp, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const payload = JSON.parse(new URLSearchParams(body).get('payload') || '{}')
    const action = payload.actions?.[0]
    
    if (!action) {
      return NextResponse.json({ error: 'No action found' }, { status: 400 })
    }
    
    const { evidenceId, sessionId } = JSON.parse(action.value)
    const userId = payload.user.id
    const isApproved = action.action_id === 'approve_evidence'
    
    // Update evidence item
    await supabaseAdmin
      .from('evidence_items')
      .update({
        status: isApproved ? 'approved' : 'rejected',
        approver_id: userId,
        approved_at: isApproved ? new Date().toISOString() : null,
        rejected_at: isApproved ? null : new Date().toISOString()
      })
      .eq('id', evidenceId)
    
    return NextResponse.json({ 
      replace_original: true,
      text: `Evidence ${isApproved ? '✅ Approved' : '❌ Rejected'}`
    })
  } catch (error) {
    console.error('Slack interaction error:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' }, 
      { status: 500 }
    )
  }
}
'''

# Compliance API
compliance_api = '''import { NextRequest, NextResponse } from 'next/server'
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
'''

# Write the API route files
with open('app/api/sessions/[id]/start/route.ts', 'w') as f:
    f.write(session_start)

with open('app/api/slack/interactions/route.ts', 'w') as f:
    f.write(slack_interactions)

with open('app/api/compliance/route.ts', 'w') as f:
    f.write(compliance_api)

print("✅ Created remaining API routes:")
print("  - app/api/sessions/[id]/start/route.ts")
print("  - app/api/slack/interactions/route.ts") 
print("  - app/api/compliance/route.ts")