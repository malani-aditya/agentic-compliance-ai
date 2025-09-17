import { openai } from '@ai-sdk/openai'
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
