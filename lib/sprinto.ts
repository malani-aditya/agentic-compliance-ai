import { GraphQLClient } from 'graphql-request'

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
