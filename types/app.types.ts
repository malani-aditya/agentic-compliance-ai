import { Database } from './database.types'

export type ComplianceCheck = Database['public']['Tables']['compliance_checks']['Row']
export type EvidenceSessionRow = Database['public']['Tables']['evidence_sessions']['Row']
export type EvidenceItemRow = Database['public']['Tables']['evidence_items']['Row']
export type AgentMemory = Database['public']['Tables']['agent_memories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export type SessionStatus = Database['public']['Enums']['session_status']
export type EvidenceStatus = Database['public']['Enums']['evidence_status']
export type MemoryType = Database['public']['Enums']['memory_type']
export type StepStatus = Database['public']['Enums']['step_status']
export type ProviderType = Database['public']['Enums']['provider_type']

export interface EvidenceValidation {
  is_valid: boolean
  validation_score: number
  issues: ValidationIssue[]
  metadata_completeness: number
  content_analysis?: {
    summary: string
    key_findings: string[]
    quality_score: number
  }
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  field?: string
  suggestion?: string
}

export interface ProgressStep {
  [key: string]: string | number | boolean | null | ProgressStep[] | Record<string, any> | undefined
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

export interface EvidenceSession {
  id: string
  session_name?: string
  compliance_check_ids: string[]
  admin_user_id: string
  status: 'pending' | 'planning' | 'collecting' | 'reviewing' | 'completed' | 'error' | 'cancelled'
  llm_provider: ProviderType
  progress_steps: ProgressStep[] | Record<string, any>
  chat_messages: ChatMessage[] | Record<string, any>
  ai_reasoning_log: AIReasoning[] | Record<string, any>
  collection_strategy: Record<string, any>
  user_preferences: Record<string, any>
  error_log: Record<string, any>
  metrics: Record<string, any>
  started_at?: string | null
  completed_at?: string | null
  estimated_duration?: string | null
  actual_duration?: string | null
  total_evidence_items: number
  successful_collections: number
  failed_collections: number
  created_at: string
  updated_at: string
}
export interface EvidenceItem {
  id: string
  session_id: string
  check_id: string
  evidence_type: 'file' | 'screenshot' | 'api_response' | 'manual_entry'
  source_system: string
  source_path?: string
  original_filename?: string
  stored_filename?: string
  file_size?: number
  file_hash?: string
  mime_type?: string
  storage_path?: string
  metadata?: Record<string, any>
  content_preview?: string
  ai_analysis?: Record<string, any>
  collection_context: Record<string, any>
  validation_status: 'pending' | 'valid' | 'invalid' | 'warning'
  validation_details: Record<string, any>
  validation_errors: string[]
  review_status: 'pending' | 'approved' | 'rejected' | 'requires_changes'
  review_notes?: string | null
  reviewer_id?: string | null
  review_history: Record<string, any>
  slack_message_ts?: string | null
  slack_channel_id?: string | null
  sprinto_submission_id?: string | null
  sprinto_status?: string | null
  tags: string[]
  is_sensitive: boolean
  retention_policy: Record<string, any>
  created_at: string
  collected_at: string
  reviewed_at?: string | null
  approved_at?: string | null
  submitted_at?: string | null
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
