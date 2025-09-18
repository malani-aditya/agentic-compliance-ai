import { google } from 'googleapis'
import { GoogleDriveFile } from '@/types/app.types'

class GoogleDriveIntegration {
  private drive: any
  private sheets: any
  private auth: any

  constructor() {
    this.initializeAuth()
  }

  private initializeAuth() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ]
      })

      this.drive = google.drive({ version: 'v3', auth: this.auth })
      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
    } catch (error) {
      console.error('Failed to initialize Google Drive auth:', error)
    }
  }

  async scanFolder(
    folderPath: string,
    options: {
      patterns?: string[]
      maxAge?: number
      includeSubfolders?: boolean
    } = {}
  ): Promise<{ files: GoogleDriveFile[]; totalSize: number }> {
    try {
      // Find folder by path
      const folderId = await this.findFolderByPath(folderPath)
      if (!folderId) {
        throw new Error(`Folder not found: ${folderPath}`)
      }

      // Build search query
      let query = `'${folderId}' in parents and trashed=false`

      if (options.patterns && options.patterns.length > 0) {
        const nameFilters = options.patterns
          .map(pattern => `name contains '${pattern.replace('*', '')}'`)
          .join(' or ')
        query += ` and (${nameFilters})`
      }

      // Add date filter if maxAge specified
      if (options.maxAge) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - options.maxAge)
        query += ` and modifiedTime > '${cutoffDate.toISOString()}'`
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,owners)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      })

      const files: GoogleDriveFile[] = (response.data.files || []).map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: parseInt(file.size) || 0,
        modifiedTime: file.modifiedTime,
        parents: file.parents || [],
        webViewLink: file.webViewLink,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`
      }))

      const totalSize = files.reduce((sum, file) => sum + file.size, 0)

      // If includeSubfolders, scan subfolders recursively
      if (options.includeSubfolders) {
        const subfolders = await this.getSubfolders(folderId)
        for (const subfolder of subfolders) {
          const subfolderResults = await this.scanFolder(`${folderPath}/${subfolder.name}`, options)
          files.push(...subfolderResults.files)
        }
      }

      return { files, totalSize }
    } catch (error) {
      console.error('Google Drive scan error:', error)
      throw error
    }
  }

  async downloadFile(fileId: string, destinationPath?: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      })

      return Buffer.from(response.data)
    } catch (error) {
      console.error('Google Drive download error:', error)
      throw error
    }
  }

  async getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,owners'
      })

      const file = response.data
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: parseInt(file.size) || 0,
        modifiedTime: file.modifiedTime,
        parents: file.parents || [],
        webViewLink: file.webViewLink,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`
      }
    } catch (error) {
      console.error('Google Drive metadata error:', error)
      throw error
    }
  }

  async createSnapshot(fileId: string, snapshotName?: string): Promise<string> {
    try {
      // Create a copy of the file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const copyName = snapshotName || `Snapshot_${timestamp}`

      const response = await this.drive.files.copy({
        fileId,
        requestBody: {
          name: copyName,
          parents: ['your-evidence-folder-id'] // Configure this
        }
      })

      return response.data.id
    } catch (error) {
      console.error('Google Drive snapshot error:', error)
      throw error
    }
  }

  // Google Sheets specific methods
  async readSheetData(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      return response.data.values || []
    } catch (error) {
      console.error('Google Sheets read error:', error)
      throw error
    }
  }

  async syncComplianceChecks(spreadsheetId: string, tabName: string = 'All Checks') {
    try {
      const range = `${tabName}!A2:L1000` // Adjust range as needed
      const data = await this.readSheetData(spreadsheetId, range)

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
        automate: row[8] === 'TRUE' || row[8] === 'true',
        repetition: row[9] || '',
        collection_remarks: row[10] || '',
        spoc_comments: row[11] || ''
      }))
    } catch (error) {
      console.error('Compliance checks sync error:', error)
      throw error
    }
  }

  private async findFolderByPath(path: string): Promise<string | null> {
    try {
      const pathParts = path.split('/').filter(part => part.length > 0)
      let currentFolderId = 'root'

      for (const folderName of pathParts) {
        const response = await this.drive.files.list({
          q: `'${currentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id)'
        })

        if (!response.data.files || response.data.files.length === 0) {
          return null
        }

        currentFolderId = response.data.files[0].id
      }

      return currentFolderId
    } catch (error) {
      console.error('Folder path resolution error:', error)
      return null
    }
  }

  private async getSubfolders(parentFolderId: string): Promise<{ id: string; name: string }[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)'
      })

      return response.data.files || []
    } catch (error) {
      console.error('Subfolders fetch error:', error)
      return []
    }
  }
}

export const googleDrive = new GoogleDriveIntegration()
export default googleDrive
