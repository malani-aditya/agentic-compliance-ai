export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          team: string | null
          department: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          team?: string | null
          department?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          team?: string | null
          department?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      compliance_checks: {
        Row: {
          id: string
          framework_id: string | null
          check_type: string
          check_name: string
          check_code: string | null
          area: string
          sub_area: string | null
          owner: string
          spoc: string
          team: string
          frequency: string
          automation_level: string
          priority: number
          estimated_effort_hours: number
          task_status: string
          status: string
          collection_requirements: Json
          validation_rules: Json
          approval_workflow: Json
          tags: string[]
          sheet_row_id: number | null
          last_collection_date: string | null
          next_due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          framework_id?: string | null
          check_type: string
          check_name: string
          check_code?: string | null
          area: string
          sub_area?: string | null
          owner: string
          spoc: string
          team: string
          frequency: string
          automation_level?: string
          priority?: number
          estimated_effort_hours?: number
          task_status?: string
          status?: string
          collection_requirements?: Json
          validation_rules?: Json
          approval_workflow?: Json
          tags?: string[]
          sheet_row_id?: number | null
          last_collection_date?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          framework_id?: string | null
          check_type?: string
          check_name?: string
          check_code?: string | null
          area?: string
          sub_area?: string | null
          owner?: string
          spoc?: string
          team?: string
          frequency?: string
          automation_level?: string
          priority?: number
          estimated_effort_hours?: number
          task_status?: string
          status?: string
          collection_requirements?: Json
          validation_rules?: Json
          approval_workflow?: Json
          tags?: string[]
          sheet_row_id?: number | null
          last_collection_date?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evidence_sessions: {
        Row: {
          id: string
          session_name: string | null
          compliance_check_ids: string[]
          admin_user_id: string | null
          status: 'pending' | 'planning' | 'collecting' | 'reviewing' | 'completed' | 'error' | 'cancelled'
          llm_provider: 'kimi' | 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek'
          progress_steps: Json
          chat_messages: Json
          ai_reasoning_log: Json
          collection_strategy: Json
          user_preferences: Json
          error_log: Json
          metrics: Json
          started_at: string | null
          completed_at: string | null
          estimated_duration: string | null
          actual_duration: string | null
          total_evidence_items: number
          successful_collections: number
          failed_collections: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_name?: string | null
          compliance_check_ids: string[]
          admin_user_id?: string | null
          status?: 'pending' | 'planning' | 'collecting' | 'reviewing' | 'completed' | 'error' | 'cancelled'
          llm_provider?: 'kimi' | 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek'
          progress_steps?: Json
          chat_messages?: Json
          ai_reasoning_log?: Json
          collection_strategy?: Json
          user_preferences?: Json
          error_log?: Json
          metrics?: Json
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: string | null
          total_evidence_items?: number
          successful_collections?: number
          failed_collections?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_name?: string | null
          compliance_check_ids?: string[]
          admin_user_id?: string | null
          status?: 'pending' | 'planning' | 'collecting' | 'reviewing' | 'completed' | 'error' | 'cancelled'
          llm_provider?: 'kimi' | 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek'
          progress_steps?: Json
          chat_messages?: Json
          ai_reasoning_log?: Json
          collection_strategy?: Json
          user_preferences?: Json
          error_log?: Json
          metrics?: Json
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: string | null
          total_evidence_items?: number
          successful_collections?: number
          failed_collections?: number
          created_at?: string
          updated_at?: string
        }
      }
      evidence_items: {
        Row: {
          id: string
          session_id: string
          check_id: string | null
          evidence_type: string
          source_system: string
          source_path: string
          original_filename: string | null
          stored_filename: string | null
          file_size: number | null
          file_hash: string | null
          mime_type: string | null
          storage_path: string | null
          metadata: Json
          content_preview: string | null
          ai_analysis: Json
          collection_context: Json
          validation_status: string
          validation_details: Json
          validation_errors: string[]
          review_status: 'pending' | 'collected' | 'validated' | 'approved' | 'rejected' | 'error' | 'resubmitted'
          review_notes: string | null
          reviewer_id: string | null
          review_history: Json
          slack_message_ts: string | null
          slack_channel_id: string | null
          sprinto_submission_id: string | null
          sprinto_status: string | null
          tags: string[]
          is_sensitive: boolean
          retention_policy: Json
          created_at: string
          collected_at: string
          reviewed_at: string | null
          approved_at: string | null
          submitted_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          check_id?: string | null
          evidence_type: string
          source_system: string
          source_path: string
          original_filename?: string | null
          stored_filename?: string | null
          file_size?: number | null
          file_hash?: string | null
          mime_type?: string | null
          storage_path?: string | null
          metadata?: Json
          content_preview?: string | null
          ai_analysis?: Json
          collection_context?: Json
          validation_status?: string
          validation_details?: Json
          validation_errors?: string[]
          review_status?: 'pending' | 'collected' | 'validated' | 'approved' | 'rejected' | 'error' | 'resubmitted'
          review_notes?: string | null
          reviewer_id?: string | null
          review_history?: Json
          slack_message_ts?: string | null
          slack_channel_id?: string | null
          sprinto_submission_id?: string | null
          sprinto_status?: string | null
          tags?: string[]
          is_sensitive?: boolean
          retention_policy?: Json
          created_at?: string
          collected_at?: string
          reviewed_at?: string | null
          approved_at?: string | null
          submitted_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          check_id?: string | null
          evidence_type?: string
          source_system?: string
          source_path?: string
          original_filename?: string | null
          stored_filename?: string | null
          file_size?: number | null
          file_hash?: string | null
          mime_type?: string | null
          storage_path?: string | null
          metadata?: Json
          content_preview?: string | null
          ai_analysis?: Json
          collection_context?: Json
          validation_status?: string
          validation_details?: Json
          validation_errors?: string[]
          review_status?: 'pending' | 'collected' | 'validated' | 'approved' | 'rejected' | 'error' | 'resubmitted'
          review_notes?: string | null
          reviewer_id?: string | null
          review_history?: Json
          slack_message_ts?: string | null
          slack_channel_id?: string | null
          sprinto_submission_id?: string | null
          sprinto_status?: string | null
          tags?: string[]
          is_sensitive?: boolean
          retention_policy?: Json
          created_at?: string
          collected_at?: string
          reviewed_at?: string | null
          approved_at?: string | null
          submitted_at?: string | null
        }
      }
      agent_memories: {
        Row: {
          id: string
          memory_type: 'procedural' | 'episodic' | 'semantic' | 'contextual'
          check_type: string | null
          check_name: string | null
          framework: string | null
          content: Json
          embedding: string | null
          confidence_score: number | null
          success_rate: number
          application_count: number
          successful_applications: number
          user_feedback: Json
          context_tags: string[]
          related_memories: string[]
          created_by: string | null
          last_used: string
          last_updated: string
          expiry_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          memory_type: 'procedural' | 'episodic' | 'semantic' | 'contextual'
          check_type?: string | null
          check_name?: string | null
          framework?: string | null
          content: Json
          embedding?: string | null
          confidence_score?: number | null
          success_rate?: number
          application_count?: number
          successful_applications?: number
          user_feedback?: Json
          context_tags?: string[]
          related_memories?: string[]
          created_by?: string | null
          last_used?: string
          last_updated?: string
          expiry_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          memory_type?: 'procedural' | 'episodic' | 'semantic' | 'contextual'
          check_type?: string | null
          check_name?: string | null
          framework?: string | null
          content?: Json
          embedding?: string | null
          confidence_score?: number | null
          success_rate?: number
          application_count?: number
          successful_applications?: number
          user_feedback?: Json
          context_tags?: string[]
          related_memories?: string[]
          created_by?: string | null
          last_used?: string
          last_updated?: string
          expiry_date?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_similar_memories: {
        Args: {
          query_embedding: string
          memory_types?: ('procedural' | 'episodic' | 'semantic' | 'contextual')[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          memory_type: 'procedural' | 'episodic' | 'semantic' | 'contextual'
          check_type: string
          content: Json
          similarity: number
          success_rate: number
        }[]
      }
      get_pattern_recommendations: {
        Args: {
          p_check_type: string
          p_framework?: string
          p_limit?: number
        }
        Returns: {
          pattern_id: string
          pattern_name: string
          success_rate: number
          times_used: number
          avg_completion_time: string
        }[]
      }
    }
    Enums: {
      session_status: 'pending' | 'planning' | 'collecting' | 'reviewing' | 'completed' | 'error' | 'cancelled'
      evidence_status: 'pending' | 'collected' | 'validated' | 'approved' | 'rejected' | 'error' | 'resubmitted'
      memory_type: 'procedural' | 'episodic' | 'semantic' | 'contextual'
      step_status: 'pending' | 'in_progress' | 'completed' | 'error' | 'skipped' | 'waiting_input'
      provider_type: 'kimi' | 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek'
    }
  }
}
