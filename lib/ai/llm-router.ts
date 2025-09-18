import { ProviderType, LLMProvider } from '@/types/app.types'

// Multi-LLM provider support with unified interface
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model?: string
  provider?: ProviderType
}

export interface LLMConfig {
  provider: ProviderType
  model: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

class LLMRouter {
  private providers: Map<ProviderType, LLMProvider> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    const providers: LLMProvider[] = [
      {
        id: 'kimi',
        name: 'kimi',
        display_name: 'Kimi (Moonshot)',
        is_active: !!process.env.MOONSHOT_API_KEY,
        capabilities: ['chat', 'function_calling'],
        models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
        cost_per_token: 0.000002,
        rate_limits: { requests_per_minute: 200 }
      },
      {
        id: 'openai',
        name: 'openai', 
        display_name: 'OpenAI GPT-4',
        is_active: !!process.env.OPENAI_API_KEY,
        capabilities: ['chat', 'embeddings', 'function_calling', 'vision'],
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        cost_per_token: 0.00001,
        rate_limits: { requests_per_minute: 500 }
      },
      {
        id: 'anthropic',
        name: 'anthropic',
        display_name: 'Anthropic Claude',
        is_active: !!process.env.ANTHROPIC_API_KEY,
        capabilities: ['chat', 'function_calling', 'vision'],
        models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
        cost_per_token: 0.000008,
        rate_limits: { requests_per_minute: 300 }
      },
      {
        id: 'google',
        name: 'google',
        display_name: 'Google Gemini',
        is_active: !!process.env.GOOGLE_AI_API_KEY,
        capabilities: ['chat', 'function_calling', 'vision'],
        models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
        cost_per_token: 0.000003,
        rate_limits: { requests_per_minute: 300 }
      },
      {
        id: 'groq',
        name: 'groq',
        display_name: 'Groq',
        is_active: !!process.env.GROQ_API_KEY,
        capabilities: ['chat', 'function_calling'],
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
        cost_per_token: 0.000001,
        rate_limits: { requests_per_minute: 100 }
      },
      {
        id: 'deepseek',
        name: 'deepseek',
        display_name: 'DeepSeek',
        is_active: !!process.env.DEEPSEEK_API_KEY,
        capabilities: ['chat', 'function_calling'],
        models: ['deepseek-chat', 'deepseek-coder'],
        cost_per_token: 0.0000005,
        rate_limits: { requests_per_minute: 200 }
      }
    ]

    providers.forEach(provider => {
      if (provider.is_active) {
        this.providers.set(provider.id, provider)
      }
    })
  }

  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.values()).filter(p => p.is_active)
  }

  getDefaultProvider(): ProviderType {
    const defaultProvider = (process.env.DEFAULT_LLM_PROVIDER as ProviderType) || 'kimi'
    return this.providers.has(defaultProvider) ? defaultProvider : 'kimi'
  }

  async generateResponse(
    messages: LLMMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    const provider = this.providers.get(config.provider)
    if (!provider) {
      throw new Error(`Provider ${config.provider} not available`)
    }

    try {
      switch (config.provider) {
        case 'kimi':
          return await this.callKimi(messages, config)
        case 'openai':
          return await this.callOpenAI(messages, config)
        case 'anthropic':
          return await this.callAnthropic(messages, config)
        case 'google':
          return await this.callGoogle(messages, config)
        case 'groq':
          return await this.callGroq(messages, config)
        case 'deepseek':
          return await this.callDeepSeek(messages, config)
        default:
          throw new Error(`Provider ${config.provider} not implemented`)
      }
    } catch (error) {
      console.error(`LLM Provider ${config.provider} error:`, error)
      // Fallback to next available provider
      const fallbackProvider = this.getAvailableProviders()
        .find(p => p.id !== config.provider)

      if (fallbackProvider) {
        console.log(`Falling back to ${fallbackProvider.id}`)
        return this.generateResponse(messages, { ...config, provider: fallbackProvider.id })
      }

      throw error
    }
  }

  private async callKimi(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'moonshot-v1-8k',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || 2000
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Kimi API error: ${data.error?.message || 'Unknown error'}`)
    }

    return {
      content: data.choices[0].message.content,
      usage: mapUsage(data.usage),
      model: data.model,
      provider: 'kimi'
    }
  }

  private async callOpenAI(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const { openai } = await import('@ai-sdk/openai')
    const { generateText } = await import('ai')

    const result = await generateText({
      model: openai(config.model || 'gpt-4o-mini'),
      messages,
      temperature: config.temperature,
      maxTokens: config.max_tokens
    })

    return {
      content: result.text,
      usage: mapUsage(result.usage as any),
      model: config.model,
      provider: 'openai'
    }
  }

  private async callAnthropic(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const { anthropic } = await import('@ai-sdk/anthropic')
    const { generateText } = await import('ai')

    const result = await generateText({
      model: anthropic(config.model || 'claude-3-5-sonnet-latest'),
      messages,
      temperature: config.temperature,
      maxTokens: config.max_tokens
    })

    return {
      content: result.text,
      usage: mapUsage(result.usage as any),
      model: config.model,
      provider: 'anthropic'
    }
  }

  private async callGoogle(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const { google } = await import('@ai-sdk/google')
    const { generateText } = await import('ai')

    const result = await generateText({
      model: google(config.model || 'gemini-1.5-pro'),
      messages,
      temperature: config.temperature,
      maxTokens: config.max_tokens
    })

    return {
      content: result.text,
      usage: mapUsage(result.usage as any),
      model: config.model,
      provider: 'google'
    }
  }

  private async callGroq(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const { groq } = await import('@ai-sdk/groq')
    const { generateText } = await import('ai')

    const result = await generateText({
      model: groq(config.model || 'llama-3.3-70b-versatile') as any,
      messages,
      temperature: config.temperature,
      maxTokens: config.max_tokens
    })

    return {
      content: result.text,
      usage: mapUsage(result.usage as any),
      model: config.model,
      provider: 'groq'
    }
  }

  private async callDeepSeek(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || 2000
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`)
    }

    return {
      content: data.choices[0].message.content,
      usage: mapUsage(data.usage),
      model: data.model,
      provider: 'deepseek'
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Use OpenAI for embeddings (most reliable)
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key required for embeddings')
    }

    const { openai } = await import('@ai-sdk/openai')
    const { embed } = await import('ai')

    const result = await embed({
      model: openai.embedding('text-embedding-ada-002'),
      value: text
    })

    return result.embedding
  }
}

export const llmRouter = new LLMRouter()
export default llmRouter

// Map various provider/SDK usage formats to our unified usage shape
function mapUsage(raw: any): { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined {
  try {
    if (!raw) return undefined
    const pRaw = (raw as any).prompt_tokens ?? (raw as any).promptTokens ?? (raw as any).inputTokens
    const cRaw = (raw as any).completion_tokens ?? (raw as any).completionTokens ?? (raw as any).outputTokens
    if (typeof pRaw === 'number' && typeof cRaw === 'number') {
      const tRaw = (raw as any).total_tokens ?? (raw as any).totalTokens
      const p = pRaw
      const c = cRaw
      const t = typeof tRaw === 'number' ? tRaw : p + c
      return { prompt_tokens: p, completion_tokens: c, total_tokens: t }
    }
    return undefined
  } catch {
    return undefined
  }
}
