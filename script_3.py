# Create lib utilities for database, LLM providers, and integrations
import os

os.makedirs('lib', exist_ok=True)

# Database client
supabase_client = '''import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!
)
'''

# LLM provider abstraction
llm_providers = '''import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { mistral } from '@ai-sdk/mistral'

// Ollama provider (community or custom implementation)
const createOllama = (config: { baseURL: string }) => {
  return (model: string) => ({
    modelId: model,
    doGenerate: async (options: any) => {
      const response = await fetch(`${config.baseURL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: options.prompt,
          stream: false
        })
      })
      const data = await response.json()
      return {
        text: data.response,
        usage: { promptTokens: 0, completionTokens: 0 }
      }
    }
  })
}

export function getModel() {
  const provider = process.env.AI_MODEL_PROVIDER || 'openai'
  
  switch (provider) {
    case 'openai':
      return openai('gpt-4o-mini')
    case 'anthropic':
      return anthropic('claude-3-5-sonnet-20241022')
    case 'google':
      return google('gemini-1.5-pro')
    case 'groq':
      return groq('llama-3.3-70b-versatile')
    case 'mistral':
      return mistral('mistral-large-latest')
    case 'ollama':
      const ollamaClient = createOllama({ 
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' 
      })
      return ollamaClient('llama3.1:8b')
    default:
      return openai('gpt-4o-mini')
  }
}

export function getEmbeddingModel() {
  return openai.embedding('text-embedding-ada-002')
}
'''

# Google Drive integration
google_drive = '''import { google } from 'googleapis'

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
})

export const drive = google.drive({ version: 'v3', auth })
export const sheets = google.sheets({ version: 'v4', auth })

export async function listFiles(folderId?: string, query?: string) {
  const response = await drive.files.list({
    q: folderId ? `'${folderId}' in parents` : query,
    fields: 'files(id,name,mimeType,size,modifiedTime,parents)'
  })
  return response.data.files || []
}

export async function downloadFile(fileId: string) {
  const response = await drive.files.get({
    fileId,
    alt: 'media'
  })
  return response.data
}

export async function getFileMetadata(fileId: string) {
  const response = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,size,modifiedTime,parents,owners'
  })
  return response.data
}

export async function searchFiles(query: string) {
  return await listFiles(undefined, query)
}

// Google Sheets helpers
export async function readSheetData(spreadsheetId: string, range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  })
  return response.data.values || []
}

export async function syncComplianceChecks(spreadsheetId: string) {
  const data = await readSheetData(spreadsheetId, 'All Checks!A2:L1000')
  
  return data.map((row, index) => ({
    sheet_row_id: index + 2,
    check_type: row[0] || '',
    check_name: row[1] || '', 
    area: row[2] || '',
    owner: row[3] || '',
    spoc: row[4] || '',
    task_status: row[5] || '',
    status: row[6] || '',
    team: row[7] || '',
    automate: row[8] === 'TRUE',
    repetition: row[9] || '',
    collection_remarks: row[10] || '',
    spoc_comments: row[11] || ''
  }))
}
'''

# Microsoft Graph integration
microsoft_graph = '''import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'

class CustomAuthProvider implements AuthenticationProvider {
  async getAccessToken(): Promise<string> {
    // Implement OAuth2 flow or use client credentials
    const tokenResponse = await fetch('https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MS_CLIENT_ID!,
        client_secret: process.env.MS_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    })
    
    const data = await tokenResponse.json()
    return data.access_token
  }
}

export const graphClient = Client.initWithMiddleware({
  authProvider: new CustomAuthProvider()
})

export async function listOneDriveFiles(path?: string) {
  const endpoint = path 
    ? `/me/drive/root:/${path}:/children`
    : '/me/drive/root/children'
    
  const response = await graphClient.api(endpoint).get()
  return response.value || []
}

export async function downloadOneDriveFile(itemId: string) {
  const response = await graphClient.api(`/me/drive/items/${itemId}/content`).get()
  return response
}

export async function searchOneDriveFiles(query: string) {
  const response = await graphClient.api(`/me/drive/root/search(q='${query}')`).get()
  return response.value || []
}
'''

# Slack integration
slack_integration = '''import { WebClient } from '@slack/web-api'
import crypto from 'crypto'

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export function verifySlackSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET!
  const sigBasestring = `v0:${timestamp}:${body}`
  
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring, 'utf8')
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  )
}

export async function sendApprovalRequest(
  channel: string,
  evidenceItem: any,
  sessionId: string
) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 Evidence Approval Required'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Check:* ${evidenceItem.checkName}`
        },
        {
          type: 'mrkdwn', 
          text: `*File:* ${evidenceItem.fileName}`
        },
        {
          type: 'mrkdwn',
          text: `*Size:* ${evidenceItem.fileSize}`
        },
        {
          type: 'mrkdwn',
          text: `*Collected:* ${new Date(evidenceItem.collectedAt).toLocaleString()}`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✅ Approve'
          },
          style: 'primary',
          action_id: 'approve_evidence',
          value: JSON.stringify({
            evidenceId: evidenceItem.id,
            sessionId
          })
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '❌ Reject'
          },
          style: 'danger',
          action_id: 'reject_evidence',
          value: JSON.stringify({
            evidenceId: evidenceItem.id,
            sessionId
          })
        }
      ]
    }
  ]

  const result = await slack.chat.postMessage({
    channel,
    blocks
  })
  
  return result.ts
}

export async function updateApprovalMessage(
  channel: string,
  messageTs: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const statusEmoji = status === 'approved' ? '✅' : '❌'
  const statusText = status === 'approved' ? 'Approved' : 'Rejected'
  
  await slack.chat.update({
    channel,
    ts: messageTs,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${statusEmoji} *Evidence ${statusText}*${notes ? `\\n_${notes}_` : ''}`
        }
      }
    ]
  })
}
'''

# Sprinto API integration
sprinto_api = '''import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient(process.env.SPRINTO_API_URL!, {
  headers: {
    'Authorization': `Bearer ${process.env.SPRINTO_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export async function submitEvidence(evidenceData: {
  checkId: string
  fileName: string
  filePath: string
  metadata: any
  collectedAt: string
}) {
  const mutation = `
    mutation SubmitEvidence($input: EvidenceInput!) {
      createEvidence(input: $input) {
        id
        status
        createdAt
      }
    }
  `
  
  const variables = {
    input: {
      complianceCheckId: evidenceData.checkId,
      fileName: evidenceData.fileName,
      filePath: evidenceData.filePath,
      metadata: JSON.stringify(evidenceData.metadata),
      collectedAt: evidenceData.collectedAt
    }
  }
  
  try {
    const result = await client.request(mutation, variables)
    return result.createEvidence
  } catch (error) {
    console.error('Sprinto API Error:', error)
    throw error
  }
}

export async function getComplianceChecks() {
  const query = `
    query GetComplianceChecks {
      complianceChecks {
        id
        name
        description
        framework
        status
      }
    }
  `
  
  try {
    const result = await client.request(query)
    return result.complianceChecks
  } catch (error) {
    console.error('Sprinto API Error:', error)
    throw error
  }
}

export async function updateCheckStatus(checkId: string, status: string) {
  const mutation = `
    mutation UpdateCheckStatus($checkId: ID!, $status: String!) {
      updateComplianceCheck(id: $checkId, input: { status: $status }) {
        id
        status
        updatedAt
      }
    }
  `
  
  try {
    const result = await client.request(mutation, { checkId, status })
    return result.updateComplianceCheck
  } catch (error) {
    console.error('Sprinto API Error:', error)
    throw error
  }
}
'''

# Write lib files
with open('lib/supabase.ts', 'w') as f:
    f.write(supabase_client)

with open('lib/llm-providers.ts', 'w') as f:
    f.write(llm_providers)

with open('lib/google-drive.ts', 'w') as f:
    f.write(google_drive)

with open('lib/microsoft-graph.ts', 'w') as f:
    f.write(microsoft_graph)

with open('lib/slack.ts', 'w') as f:
    f.write(slack_integration)

with open('lib/sprinto.ts', 'w') as f:
    f.write(sprinto_api)

print("✅ Created lib utilities:")
print("  - lib/supabase.ts")
print("  - lib/llm-providers.ts")
print("  - lib/google-drive.ts")
print("  - lib/microsoft-graph.ts")
print("  - lib/slack.ts")
print("  - lib/sprinto.ts")