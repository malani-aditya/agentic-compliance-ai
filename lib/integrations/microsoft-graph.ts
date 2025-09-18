import { Client, AuthenticationProvider } from '@microsoft/microsoft-graph-client'
import { DriveItem } from '@microsoft/microsoft-graph-types'

interface GraphFile {
  id: string
  name: string
  size: number
  lastModifiedDateTime: string
  webUrl: string
  downloadUrl?: string
  mimeType?: string
}

class CustomAuthProvider implements AuthenticationProvider {
  async getAccessToken(): Promise<string> {
    try {
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      })

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.statusText}`)
      }

      const data = await tokenResponse.json()
      return data.access_token
    } catch (error) {
      console.error('Microsoft Graph auth error:', error)
      throw error
    }
  }
}

class MicrosoftGraphIntegration {
  private graphClient: Client

  constructor() {
    this.graphClient = Client.initWithMiddleware({
      authProvider: new CustomAuthProvider()
    })
  }

  async scanFolder(
    folderPath: string,
    filePatterns: string[] = []
  ): Promise<{ files: GraphFile[]; totalSize: number }> {
    try {
      const endpoint = folderPath && folderPath !== '/'
        ? `/me/drive/root:/${folderPath}:/children`
        : '/me/drive/root/children'

      const response = await this.graphClient
        .api(endpoint)
        .select('id,name,size,lastModifiedDateTime,webUrl,file')
        .top(100)
        .get()

      let items: DriveItem[] = response.value || []

      // Filter by file patterns if provided
      if (filePatterns.length > 0) {
        items = items.filter(item => {
          if (!item.name) return false
          return filePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i')
            return regex.test(item.name!)
          })
        })
      }

      const files: GraphFile[] = items.map(item => ({
        id: item.id!,
        name: item.name!,
        size: item.size || 0,
        lastModifiedDateTime: item.lastModifiedDateTime!,
        webUrl: item.webUrl!,
        mimeType: item.file?.mimeType ?? undefined,
        downloadUrl: `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`
      }))

      const totalSize = files.reduce((sum, file) => sum + file.size, 0)

      return { files, totalSize }
    } catch (error) {
      console.error('Microsoft Graph scan error:', error)
      throw error
    }
  }

  async downloadFile(itemId: string): Promise<Buffer> {
    try {
      const response = await this.graphClient
        .api(`/me/drive/items/${itemId}/content`)
        .get()

      return Buffer.from(response)
    } catch (error) {
      console.error('Microsoft Graph download error:', error)
      throw error
    }
  }

  async searchFiles(query: string): Promise<GraphFile[]> {
    try {
      const response = await this.graphClient
        .api(`/me/drive/root/search(q='${query}')`)
        .select('id,name,size,lastModifiedDateTime,webUrl,file')
        .get()

      const items: DriveItem[] = response.value || []

      return items.map(item => ({
        id: item.id!,
        name: item.name!,
        size: item.size || 0,
        lastModifiedDateTime: item.lastModifiedDateTime!,
        webUrl: item.webUrl!,
        mimeType: item.file?.mimeType ?? undefined,
        downloadUrl: `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`
      }))
    } catch (error) {
      console.error('Microsoft Graph search error:', error)
      throw error
    }
  }

  async getFileVersions(itemId: string): Promise<any[]> {
    try {
      const response = await this.graphClient
        .api(`/me/drive/items/${itemId}/versions`)
        .get()

      return response.value || []
    } catch (error) {
      console.error('Microsoft Graph versions error:', error)
      return []
    }
  }

  async createSnapshot(itemId: string, snapshotName?: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const copyName = snapshotName || `Snapshot_${timestamp}`

      const response = await this.graphClient
        .api(`/me/drive/items/${itemId}/copy`)
        .post({
          name: copyName,
          parentReference: {
            path: '/drive/root:/Evidence_Snapshots' // Configure as needed
          }
        })

      return response.id
    } catch (error) {
      console.error('Microsoft Graph snapshot error:', error)
      throw error
    }
  }
}

export const microsoftGraph = new MicrosoftGraphIntegration()
export default microsoftGraph
