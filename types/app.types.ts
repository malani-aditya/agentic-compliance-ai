import { Database } from './database.types'

export type ComplianceCheck = Database['public']['Tables']['compliance_checks']['Row']
export type EvidenceSession = Database['public']['Tables']['evidence_sessions']['Row']
export type EvidenceItem = Database['public']['Tables']['evidence_items']['Row']
export type AgentMemory = Database['public']['Tables']['agent_memories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export type SessionStatus = Database['public']['Enums']['session_status']
export type EvidenceStatus = Database['public']['Enums']['evidence_status']
export type MemoryType = Database['public']['Enums']['memory_type']
export type StepStatus = Database['public']['Enums']['step_status']
export type ProviderType = Database['public']['Enums']['provider_type']

export interface ProgressStep {
  id: string
  step: number
  title: string
  description?: string
  status: StepStatus
  message: string
  details?: string
  timestamp: string
  estimated_time?: number
  actual_time?: number
  sub_steps?: ProgressStep[]
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    thinking?: string
    function_calls?: any[]
    session_id?: string
    step_id?: string
  }
}

export interface LLMProvider {
  id: ProviderType
  name: string
  display_name: string
  is_active: boolean
  capabilities: string[]
  models: string[]
  cost_per_token: number
  rate_limits?: {
    requests_per_minute?: number
    tokens_per_minute?: number
  }
}

export interface CollectionStrategy {
  check_id: string
  approach: 'automated' | 'semi-automated' | 'manual'
  sources: string[]
  file_patterns: string[]
  validation_rules: Record<string, any>
  estimated_time: number
  confidence_score: number
  fallback_strategies?: CollectionStrategy[]
}

export interface AIReasoning {
  step_id: string
  reasoning: string
  confidence: number
  alternatives_considered: string[]
  selected_approach: string
  expected_outcome: string
  risk_assessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
}

export interface EvidenceValidation {
  is_valid: boolean
  validation_score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    field?: string
    suggestion?: string
  }>
  metadata_completeness: number
  content_analysis?: {
    summary: string
    key_findings: string[]
    quality_score: number
  }
}

export interface UserPreferences {
  default_llm_provider: ProviderType
  notification_settings: {
    slack_notifications: boolean
    email_notifications: boolean
    real_time_updates: boolean
  }
  collection_preferences: {
    auto_validate: boolean
    require_confirmation: boolean
    backup_locations: boolean
    ai_assistance_level: 'minimal' | 'moderate' | 'extensive'
  }
  ui_preferences: {
    theme: 'light' | 'dark' | 'system'
    compact_mode: boolean
    show_advanced_options: boolean
  }
}

export interface SessionMetrics {
  total_duration: number
  avg_step_time: number
  success_rate: number
  efficiency_score: number
  user_satisfaction: number
  cost_analysis: {
    llm_costs: number
    api_calls: number
    storage_costs: number
    total_cost: number
  }
  performance_metrics: {
    avg_response_time: number
    error_rate: number
    retry_count: number
  }
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    request_id: string
    execution_time: number
  }
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Filter and Search Types
export interface ComplianceCheckFilters {
  team?: string[]
  status?: string[]
  check_type?: string[]
  area?: string[]
  automation_level?: string[]
  priority?: number[]
  search?: string
  date_range?: {
    start: string
    end: string
  }
}

export interface EvidenceSessionFilters {
  status?: SessionStatus[]
  llm_provider?: ProviderType[]
  admin_user_id?: string
  date_range?: {
    start: string
    end: string
  }
  search?: string
}

// Integration Types
export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  parents: string[]
  webViewLink: string
  downloadUrl?: string
}

export interface SlackApprovalRequest {
  evidence_item_id: string
  channel_id: string
  message_ts?: string
  blocks: any[]
  metadata?: Record<string, any>
}

export interface SprintoSubmission {
  evidence_item_id: string
  control_id: string
  framework_id: string
  submission_data: Record<string, any>
  status: 'submitted' | 'accepted' | 'rejected' | 'pending'
}
