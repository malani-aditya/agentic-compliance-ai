import { Client } from '@microsoft/microsoft-graph-client'
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
