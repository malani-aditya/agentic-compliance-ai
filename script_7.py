# Create API routes
import os

os.makedirs('app/api/sessions/[id]', exist_ok=True)
os.makedirs('app/api/slack/interactions', exist_ok=True)
os.makedirs('app/api/sprinto/submit', exist_ok=True)
os.makedirs('app/api/compliance', exist_ok=True)

# Sessions API - Create session
sessions_create = '''import { NextRequest, NextResponse } from 'next/server'
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
'''

# Sessions API - Start collection
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
  try {
    const model = getModel()
    
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i]
      
      // Update progress
      await updateProgress(sessionId, {
        step: i + 2,
        title: `Collecting evidence for: ${check.check_name}`,
        status: 'in_progress',
        message: `Processing ${check.check_type} check...`,
        timestamp: new Date().toISOString()
      })
      
      // Get collection plan from AI
      const prompt = `
        Plan evidence collection for compliance check:
        - Check Type: ${check.check_type}
        - Check Name: ${check.check_name}  
        - Area: ${check.area}
        - Collection Remarks: ${check.collection_remarks}
        
        Provide a step-by-step plan to collect evidence.
      `
      
      const { text: plan } = await generateText({
        model,
        prompt
      })
      
      // Simulate evidence collection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create evidence item
      await supabaseAdmin
        .from('evidence_items')
        .insert({
          session_id: sessionId,
          check_id: check.id,
          evidence_type: 'google_drive_file',
          source_path: `/Compliance/${check.area}/${check.check_name}`,
          file_name: `${check.check_name}_Evidence_${new Date().toISOString().split('T')[0]}.pdf`,
          status: 'collected',
          collected_data: { ai_plan: plan }
        })
      
      // Update progress to completed
      await updateProgress(sessionId, {
        step: i + 2,
        title: `Collected evidence for: ${check.check_name}`,
        status: 'completed',
        message: 'Evidence collected successfully',
        timestamp: new Date().toISOString()
      })
    }
    
    // Complete session
    await supabaseAdmin
      .from('evidence_sessions')
      .update({ 
        status: 'reviewing',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      
  } catch (error) {
    console.error('Collection error:', error)
    
    await supabaseAdmin
      .from('evidence_sessions')
      .update({ 
        status: 'error',
        error_message: error.message
      })
      .eq('id', sessionId)
  }
}

async function updateProgress(sessionId: string, step: any) {
  const { data: session } = await supabaseAdmin
    .from('evidence_sessions')
    .select('progress_steps')
    .eq('id', sessionId)
    .single()
  
  const steps = session?.progress_steps || []
  const existingStepIndex = steps.findIndex((s: any) => s.step === step.step)
  
  if (existingStepIndex >= 0) {
    steps[existingStepIndex] = step
  } else {
    steps.push(step)
  }
  
  await supabaseAdmin
    .from('evidence_sessions')
    .update({ progress_steps: steps })
    .eq('id', sessionId)
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
    
    // Update Slack message
    const statusText = isApproved ? '✅ Approved' : '❌ Rejected'
    const responseMessage = {
      replace_original: true,
      text: `Evidence ${statusText} by <@${userId}>`
    }
    
    return NextResponse.json(responseMessage)
  } catch (error) {
    console.error('Slack interaction error:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' }, 
      { status: 500 }
    )
  }
}
'''

# Compliance checks API
compliance_api = '''import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { syncComplianceChecks } from '@/lib/google-drive'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')
    const status = searchParams.get('status')
    const checkType = searchParams.get('checkType')
    const area = searchParams.get('area')
    
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
    
    if (area && area !== 'all') {
      query = query.eq('area', area)
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

export async function POST(request: NextRequest) {
  try {
    const { action, spreadsheetId } = await request.json()
    
    if (action === 'sync' && spreadsheetId) {
      // Sync from Google Sheets
      const checksData = await syncComplianceChecks(spreadsheetId)
      
      // Upsert checks
      const { error } = await supabaseAdmin
        .from('compliance_checks')
        .upsert(checksData, { 
          onConflict: 'sheet_row_id',
          ignoreDuplicates: false 
        })
      
      if (error) throw error
      
      return NextResponse.json({ 
        success: true, 
        synced: checksData.length 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sync compliance checks error:', error)
    return NextResponse.json(
      { error: 'Failed to sync compliance checks' }, 
      { status: 500 }
    )
  }
}
'''

# Write API route files
with open('app/api/sessions/route.ts', 'w') as f:
    f.write(sessions_create)

with open('app/api/sessions/[id]/start/route.ts', 'w') as f:
    f.write(session_start)

with open('app/api/slack/interactions/route.ts', 'w') as f:
    f.write(slack_interactions)

with open('app/api/compliance/route.ts', 'w') as f:
    f.write(compliance_api)

# Create missing directory for session start endpoint
os.makedirs('app/api/sessions/[id]/start', exist_ok=True)

print("✅ Created API routes:")
print("  - app/api/sessions/route.ts")
print("  - app/api/sessions/[id]/start/route.ts")  
print("  - app/api/slack/interactions/route.ts")
print("  - app/api/compliance/route.ts")