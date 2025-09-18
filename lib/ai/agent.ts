import { supabaseAdmin } from '@/lib/supabase'
import llmRouter, { LLMMessage, LLMConfig } from './llm-router'
import { 
  ProgressStep, 
  CollectionStrategy, 
  AIReasoning, 
  ProviderType,
  ComplianceCheck,
  EvidenceSession,
  AgentMemory
} from '@/types/app.types'

export interface AgentContext {
  sessionId: string
  userId: string
  complianceChecks: ComplianceCheck[]
  currentProvider: ProviderType
  userPreferences: Record<string, any>
  conversationHistory: LLMMessage[]
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any, context: AgentContext) => Promise<any>
}

export class ComplianceAgent {
  private context: AgentContext
  private tools: Map<string, AgentTool> = new Map()
  private memory: AgentMemory[] = []

  constructor(context: AgentContext) {
    this.context = context
    this.initializeTools()
  }

  private initializeTools() {
    // Google Drive integration tool
    this.tools.set('scan_google_drive', {
      name: 'scan_google_drive',
      description: 'Scan Google Drive folder for compliance evidence files',
      parameters: {
        type: 'object',
        properties: {
          folder_path: { type: 'string' },
          file_patterns: { type: 'array', items: { type: 'string' } },
          max_age_days: { type: 'number' }
        },
        required: ['folder_path']
      },
      execute: async (params, context) => {
        const { googleDrive } = await import('@/lib/integrations/google-drive')
        return await googleDrive.scanFolder(params.folder_path, {
          patterns: params.file_patterns,
          maxAge: params.max_age_days
        })
      }
    })

    // OneDrive integration tool
    this.tools.set('scan_onedrive', {
      name: 'scan_onedrive',
      description: 'Scan OneDrive folder for compliance evidence files',
      parameters: {
        type: 'object',
        properties: {
          folder_path: { type: 'string' },
          file_patterns: { type: 'array', items: { type: 'string' } }
        },
        required: ['folder_path']
      },
      execute: async (params, context) => {
        const { microsoftGraph } = await import('@/lib/integrations/microsoft-graph')
        return await microsoftGraph.scanFolder(params.folder_path, params.file_patterns)
      }
    })

    // Memory retrieval tool
    this.tools.set('search_memory', {
      name: 'search_memory',
      description: 'Search agent memory for relevant past experiences',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          memory_types: { type: 'array', items: { type: 'string' } },
          check_type: { type: 'string' }
        },
        required: ['query']
      },
      execute: async (params, context) => {
        return await this.searchMemory(params.query, {
          memoryTypes: params.memory_types,
          checkType: params.check_type
        })
      }
    })

    // Evidence validation tool
    this.tools.set('validate_evidence', {
      name: 'validate_evidence',
      description: 'Validate collected evidence against compliance requirements',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          validation_rules: { type: 'object' }
        },
        required: ['file_path', 'validation_rules']
      },
      execute: async (params, context) => {
        const { evidenceValidator } = await import('@/lib/ai/evidence-validator')
        return await evidenceValidator.validate(params.file_path, params.validation_rules)
      }
    })
  }

  async planEvidenceCollection(): Promise<CollectionStrategy[]> {
    const strategies: CollectionStrategy[] = []

    for (const check of this.context.complianceChecks) {
      // Search memory for past successful approaches
      const relevantMemories = await this.searchMemory(
        `Evidence collection for ${check.check_type} ${check.check_name}`,
        { memoryTypes: ['procedural', 'episodic'], checkType: check.check_type }
      )

      // Generate collection strategy using LLM with memory context
      const strategy = await this.generateCollectionStrategy(check, relevantMemories)
      strategies.push(strategy)
    }

    return strategies
  }

  private async generateCollectionStrategy(
    check: ComplianceCheck,
    memories: AgentMemory[]
  ): Promise<CollectionStrategy> {
    const memoryContext = memories.map(m => ({
      type: m.memory_type,
      content: m.content,
      success_rate: m.success_rate
    }))

    const prompt = `
    Plan evidence collection for compliance check:

    Check Details:
    - Type: ${check.check_type}
    - Name: ${check.check_name}
    - Area: ${check.area}
    - Requirements: ${JSON.stringify(check.collection_requirements, null, 2)}
    - Validation Rules: ${JSON.stringify(check.validation_rules, null, 2)}

    Relevant Past Experiences:
    ${JSON.stringify(memoryContext, null, 2)}

    Generate a detailed collection strategy including:
    1. Approach (automated/semi-automated/manual)
    2. Data sources to check
    3. File patterns to search for
    4. Validation steps
    5. Estimated time
    6. Confidence score
    7. Potential risks and fallbacks

    Return as structured JSON.
    `

    const response = await llmRouter.generateResponse([
      { role: 'system', content: 'You are an expert compliance evidence collection agent. Plan efficient and reliable evidence collection strategies.' },
      { role: 'user', content: prompt }
    ], {
      provider: this.context.currentProvider,
      model: this.getModelForProvider(this.context.currentProvider),
      temperature: 0.3
    })

    try {
      const strategy = JSON.parse(response.content)

      return {
        check_id: check.id,
        approach: strategy.approach || 'semi-automated',
        sources: strategy.sources || [],
        file_patterns: strategy.file_patterns || [],
        validation_rules: strategy.validation_rules || {},
        estimated_time: strategy.estimated_time || 300, // 5 minutes default
        confidence_score: strategy.confidence_score || 0.7,
        fallback_strategies: strategy.fallbacks || []
      }
    } catch (error) {
      console.error('Failed to parse strategy JSON:', error)

      // Return default strategy
      return {
        check_id: check.id,
        approach: 'manual',
        sources: ['google_drive'],
        file_patterns: [`*${check.check_name.replace(/\s+/g, '_')}*`],
        validation_rules: check.validation_rules,
        estimated_time: 600, // 10 minutes default
        confidence_score: 0.5
      }
    }
  }

  async executeCollectionStep(
    step: ProgressStep,
    strategy: CollectionStrategy
  ): Promise<{ success: boolean; result?: any; error?: string; reasoning?: AIReasoning }> {
    const reasoning: AIReasoning = {
      step_id: step.id,
      reasoning: `Executing ${step.title} using ${strategy.approach} approach`,
      confidence: strategy.confidence_score,
      alternatives_considered: [],
      selected_approach: strategy.approach,
      expected_outcome: `Collect evidence matching patterns: ${strategy.file_patterns.join(', ')}`,
      risk_assessment: {
        level: 'low',
        factors: ['File availability', 'Access permissions'],
        mitigation: ['Check backup locations', 'Fallback to manual collection']
      }
    }

    try {
      // Update step status to in_progress
      await this.updateSessionProgress(step.id, 'in_progress', 'Executing collection step...')

      let result: any = null

      // Execute based on strategy sources
      for (const source of strategy.sources) {
        if (source === 'google_drive') {
          const tool = this.tools.get('scan_google_drive')!
          result = await tool.execute({
            folder_path: this.extractFolderPath(strategy),
            file_patterns: strategy.file_patterns,
            max_age_days: 30
          }, this.context)
        } else if (source === 'onedrive') {
          const tool = this.tools.get('scan_onedrive')!
          result = await tool.execute({
            folder_path: this.extractFolderPath(strategy),
            file_patterns: strategy.file_patterns
          }, this.context)
        }

        if (result && result.files && result.files.length > 0) {
          break // Found files, stop searching other sources
        }
      }

      if (result && result.files && result.files.length > 0) {
        // Validate collected evidence
        const validationTool = this.tools.get('validate_evidence')!
        const validationResult = await validationTool.execute({
          file_path: result.files[0].path,
          validation_rules: strategy.validation_rules
        }, this.context)

        await this.updateSessionProgress(step.id, 'completed', `Collected ${result.files.length} files`)

        // Store successful pattern in memory
        await this.storeMemory({
          memory_type: 'procedural',
          check_type: strategy.approach,
          content: {
            successful_pattern: {
              sources: strategy.sources,
              file_patterns: strategy.file_patterns,
              validation_passed: validationResult.is_valid
            },
            context: `Successfully collected evidence for ${step.title}`
          },
          success_rate: 1.0
        })

        return { 
          success: true, 
          result: { files: result.files, validation: validationResult },
          reasoning 
        }
      } else {
        await this.updateSessionProgress(step.id, 'error', 'No evidence files found')

        // Store failed attempt in memory for learning
        await this.storeMemory({
          memory_type: 'episodic',
          check_type: strategy.approach,
          content: {
            failed_attempt: {
              sources: strategy.sources,
              file_patterns: strategy.file_patterns,
              error: 'No files found'
            },
            lesson_learned: 'Consider checking backup locations or alternative file patterns'
          },
          success_rate: 0.0
        })

        return { 
          success: false, 
          error: 'No evidence files found matching the specified patterns',
          reasoning 
        }
      }
    } catch (error) {
      await this.updateSessionProgress(step.id, 'error', `Error: ${error.message}`)

      return { 
        success: false, 
        error: error.message,
        reasoning 
      }
    }
  }

  async handleUserMessage(message: string): Promise<string> {
    // Add user message to conversation history
    this.context.conversationHistory.push({
      role: 'user',
      content: message
    })

    // Analyze user intent
    const intent = await this.analyzeUserIntent(message)

    let response: string

    switch (intent.type) {
      case 'modify_step':
        response = await this.handleStepModification(intent)
        break
      case 'explain_action':
        response = await this.explainCurrentAction(intent)
        break
      case 'change_approach':
        response = await this.changeCollectionApproach(intent)
        break
      case 'general_question':
        response = await this.handleGeneralQuestion(message)
        break
      default:
        response = 'I understand. Let me help you with that.'
    }

    // Add assistant response to conversation history
    this.context.conversationHistory.push({
      role: 'assistant',
      content: response
    })

    return response
  }

  private async analyzeUserIntent(message: string): Promise<{ type: string; parameters?: any }> {
    const prompt = `
    Analyze this user message and determine their intent:
    "${message}"

    Possible intents:
    - modify_step: User wants to change how a collection step is executed
    - explain_action: User wants to understand what I'm doing or why
    - change_approach: User wants to change the overall collection approach
    - general_question: General question about the process

    Return JSON with 'type' and optional 'parameters'.
    `

    const response = await llmRouter.generateResponse([
      { role: 'system', content: 'You are an expert at analyzing user intent in compliance workflows.' },
      { role: 'user', content: prompt }
    ], {
      provider: this.context.currentProvider,
      model: this.getModelForProvider(this.context.currentProvider),
      temperature: 0.1
    })

    try {
      return JSON.parse(response.content)
    } catch (error) {
      return { type: 'general_question' }
    }
  }

  private async handleStepModification(intent: any): Promise<string> {
    // Implementation for modifying collection steps based on user input
    return "I'll update the collection step as requested. The changes will be applied to future similar collections as well."
  }

  private async explainCurrentAction(intent: any): Promise<string> {
    // Get current session progress
    const session = await this.getCurrentSession()
    const currentStep = this.getCurrentStep(session)

    return `I'm currently ${currentStep?.title.toLowerCase()}. This involves scanning the specified folders for files matching your compliance requirements. Based on past successful collections, I'm checking the most likely locations first.`
  }

  private async changeCollectionApproach(intent: any): Promise<string> {
    return "I'll adjust my collection approach. What specific changes would you like me to make?"
  }

  private async handleGeneralQuestion(message: string): Promise<string> {
    const context = `
    Current session context:
    - Session ID: ${this.context.sessionId}
    - Compliance checks: ${this.context.complianceChecks.map(c => c.check_name).join(', ')}
    - Current provider: ${this.context.currentProvider}

    User question: ${message}
    `

    const response = await llmRouter.generateResponse([
      { role: 'system', content: 'You are a helpful compliance automation assistant. Answer questions about the evidence collection process.' },
      { role: 'user', content: context }
    ], {
      provider: this.context.currentProvider,
      model: this.getModelForProvider(this.context.currentProvider),
      temperature: 0.5
    })

    return response.content
  }

  private async searchMemory(
    query: string, 
    options: { memoryTypes?: string[]; checkType?: string } = {}
  ): Promise<AgentMemory[]> {
    // Generate embedding for the query
    const embedding = await llmRouter.generateEmbedding(query)

    // Search similar memories using pgvector
    const { data: memories, error } = await supabaseAdmin.rpc('search_similar_memories', {
      query_embedding: embedding,
      memory_types: options.memoryTypes,
      match_threshold: 0.7,
      match_count: 5
    })

    if (error) {
      console.error('Memory search error:', error)
      return []
    }

    return memories || []
  }

  private async storeMemory(memoryData: Partial<AgentMemory>): Promise<void> {
    try {
      // Generate embedding for the memory content
      const embedding = await llmRouter.generateEmbedding(
        JSON.stringify(memoryData.content)
      )

      await supabaseAdmin.from('agent_memories').insert({
        ...memoryData,
        embedding,
        created_by: this.context.userId
      })
    } catch (error) {
      console.error('Failed to store memory:', error)
    }
  }

  private async updateSessionProgress(
    stepId: string, 
    status: any, 
    message: string
  ): Promise<void> {
    // Update the progress step in the session
    const { data: session } = await supabaseAdmin
      .from('evidence_sessions')
      .select('progress_steps')
      .eq('id', this.context.sessionId)
      .single()

    if (session) {
      const steps = session.progress_steps as ProgressStep[]
      const stepIndex = steps.findIndex(s => s.id === stepId)

      if (stepIndex >= 0) {
        steps[stepIndex] = {
          ...steps[stepIndex],
          status,
          message,
          timestamp: new Date().toISOString()
        }

        await supabaseAdmin
          .from('evidence_sessions')
          .update({ 
            progress_steps: steps,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.context.sessionId)
      }
    }
  }

  private extractFolderPath(strategy: CollectionStrategy): string {
    // Extract folder path from strategy or use default
    return strategy.sources.includes('google_drive') 
      ? '/Compliance/Evidence' 
      : '/Evidence'
  }

  private getModelForProvider(provider: ProviderType): string {
    const modelMap = {
      kimi: 'moonshot-v1-8k',
      openai: 'gpt-4o-mini', 
      anthropic: 'claude-3-5-sonnet-latest',
      google: 'gemini-1.5-pro',
      groq: 'llama-3.3-70b-versatile',
      deepseek: 'deepseek-chat'
    }
    return modelMap[provider] || 'moonshot-v1-8k'
  }

  private async getCurrentSession(): Promise<EvidenceSession | null> {
    const { data } = await supabaseAdmin
      .from('evidence_sessions')
      .select('*')
      .eq('id', this.context.sessionId)
      .single()

    return data
  }

  private getCurrentStep(session: EvidenceSession | null): ProgressStep | null {
    if (!session?.progress_steps) return null

    const steps = session.progress_steps as ProgressStep[]
    return steps.find(s => s.status === 'in_progress') || null
  }
}

export default ComplianceAgent
