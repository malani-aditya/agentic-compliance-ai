import { WebClient } from '@slack/web-api'
import { EvidenceItem, SlackApprovalRequest } from '@/types/app.types'
import crypto from 'crypto'

class SlackIntegration {
  private client: WebClient

  constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN)
  }

  verifySignature(signature: string, timestamp: string, body: string): boolean {
    try {
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
    } catch (error) {
      console.error('Slack signature verification error:', error)
      return false
    }
  }

  async sendApprovalRequest(
    evidenceItem: EvidenceItem,
    channelId: string,
    sessionId: string
  ): Promise<string> {
    try {
      const blocks = this.buildApprovalBlocks(evidenceItem, sessionId)

      const result = await this.client.chat.postMessage({
        channel: channelId,
        text: `Evidence approval required for: ${evidenceItem.original_filename}`,
        blocks
      })

      if (result.ok && result.ts) {
        return result.ts
      } else {
        throw new Error(`Slack API error: ${result.error}`)
      }
    } catch (error) {
      console.error('Slack approval request error:', error)
      throw error
    }
  }

  async sendBulkApprovalRequest(
    evidenceItems: EvidenceItem[],
    channelId: string,
    sessionId: string
  ): Promise<string> {
    try {
      const blocks = this.buildBulkApprovalBlocks(evidenceItems, sessionId)

      const result = await this.client.chat.postMessage({
        channel: channelId,
        text: `Bulk evidence approval required: ${evidenceItems.length} items`,
        blocks
      })

      if (result.ok && result.ts) {
        return result.ts
      } else {
        throw new Error(`Slack API error: ${result.error}`)
      }
    } catch (error) {
      console.error('Slack bulk approval request error:', error)
      throw error
    }
  }

  async updateApprovalMessage(
    channelId: string,
    messageTs: string,
    status: 'approved' | 'rejected',
    notes?: string,
    userId?: string
  ): Promise<void> {
    try {
      const statusEmoji = status === 'approved' ? '✅' : '❌'
      const statusText = status === 'approved' ? 'Approved' : 'Rejected'
      const userMention = userId ? `<@${userId}>` : 'User'

      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${statusEmoji} *Evidence ${statusText}* by ${userMention}${notes ? `\n_${notes}_` : ''}`
          }
        }
      ]

      await this.client.chat.update({
        channel: channelId,
        ts: messageTs,
        text: `Evidence ${statusText}`,
        blocks
      })
    } catch (error) {
      console.error('Slack message update error:', error)
      throw error
    }
  }

  async sendNotification(
    channelId: string,
    message: string,
    options: {
      color?: 'good' | 'warning' | 'danger'
      fields?: Array<{ title: string; value: string; short?: boolean }>
    } = {}
  ): Promise<void> {
    try {
      const attachment = {
        color: options.color || 'good',
        text: message,
        fields: options.fields || [],
        ts: Math.floor(Date.now() / 1000).toString()
      }

      await this.client.chat.postMessage({
        channel: channelId,
        text: message,
        attachments: [attachment]
      })
    } catch (error) {
      console.error('Slack notification error:', error)
      throw error
    }
  }

  private buildApprovalBlocks(evidenceItem: EvidenceItem, sessionId: string): any[] {
    return [
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
            text: `*File:* ${evidenceItem.original_filename || 'Unknown'}`
          },
          {
            type: 'mrkdwn',
            text: `*Source:* ${evidenceItem.source_system}`
          },
          {
            type: 'mrkdwn',
            text: `*Size:* ${this.formatFileSize(evidenceItem.file_size || 0)}`
          },
          {
            type: 'mrkdwn',
            text: `*Collected:* ${new Date(evidenceItem.collected_at).toLocaleString()}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Preview:* ${evidenceItem.content_preview || 'No preview available'}`
        }
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
              sessionId: sessionId
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
              sessionId: sessionId
            })
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔍 Review'
            },
            action_id: 'review_evidence',
            value: JSON.stringify({
              evidenceId: evidenceItem.id,
              sessionId: sessionId
            })
          }
        ]
      },
      {
        type: 'divider'
      }
    ]
  }

  private buildBulkApprovalBlocks(evidenceItems: EvidenceItem[], sessionId: string): any[] {
    const itemsList = evidenceItems
      .slice(0, 10) // Limit to 10 items for display
      .map(item => `• ${item.original_filename || 'Unknown'} (${this.formatFileSize(item.file_size || 0)})`)
      .join('\n')

    const moreItemsText = evidenceItems.length > 10 
      ? `\n...and ${evidenceItems.length - 10} more items`
      : ''

    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 Bulk Evidence Approval (${evidenceItems.length} items)`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Evidence Items:*\n${itemsList}${moreItemsText}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Items:* ${evidenceItems.length}`
          },
          {
            type: 'mrkdwn',
            text: `*Total Size:* ${this.formatFileSize(evidenceItems.reduce((sum, item) => sum + (item.file_size || 0), 0))}`
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
              text: '✅ Approve All'
            },
            style: 'primary',
            action_id: 'bulk_approve_evidence',
            value: JSON.stringify({
              evidenceIds: evidenceItems.map(item => item.id),
              sessionId: sessionId
            })
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '❌ Reject All'
            },
            style: 'danger',
            action_id: 'bulk_reject_evidence',
            value: JSON.stringify({
              evidenceIds: evidenceItems.map(item => item.id),
              sessionId: sessionId
            })
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔍 Review Individually'
            },
            action_id: 'individual_review',
            value: JSON.stringify({
              evidenceIds: evidenceItems.map(item => item.id),
              sessionId: sessionId
            })
          }
        ]
      }
    ]
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const slack = new SlackIntegration()
export default slack
