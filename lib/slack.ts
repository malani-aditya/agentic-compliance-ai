import { WebClient } from '@slack/web-api'
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
          text: `${statusEmoji} *Evidence ${statusText}*${notes ? `\n_${notes}_` : ''}`
        }
      }
    ]
  })
}
