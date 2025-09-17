import { google } from 'googleapis'

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
