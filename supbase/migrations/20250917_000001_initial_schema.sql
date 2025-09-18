-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom enum types
CREATE TYPE session_status AS ENUM ('pending', 'planning', 'collecting', 'reviewing', 'completed', 'error', 'cancelled');
CREATE TYPE evidence_status AS ENUM ('pending', 'collected', 'validated', 'approved', 'rejected', 'error', 'resubmitted');
CREATE TYPE memory_type AS ENUM ('procedural', 'episodic', 'semantic', 'contextual');
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'error', 'skipped', 'waiting_input');
CREATE TYPE provider_type AS ENUM ('kimi', 'openai', 'anthropic', 'google', 'groq', 'deepseek');

-- Users and authentication
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- admin, manager, user, viewer
    team TEXT,
    department TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance frameworks and checks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- SOC2, GDPR, ISO27001, HIPAA, etc.
    version TEXT,
    description TEXT,
    requirements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES compliance_frameworks(id),
    check_type TEXT NOT NULL,
    check_name TEXT NOT NULL,
    check_code TEXT, -- Unique identifier like SOC2-CC6.1
    area TEXT NOT NULL, -- IT Security, Privacy, Operations, HR
    sub_area TEXT,
    owner TEXT NOT NULL,
    spoc TEXT NOT NULL, -- Single Point of Contact
    team TEXT NOT NULL,
    frequency TEXT NOT NULL, -- Daily, Weekly, Monthly, Quarterly, Annually
    automation_level TEXT DEFAULT 'manual', -- manual, semi-automated, fully-automated
    priority INTEGER DEFAULT 3, -- 1=Critical, 2=High, 3=Medium, 4=Low
    estimated_effort_hours INTEGER DEFAULT 1,
    task_status TEXT DEFAULT 'active', -- active, inactive, deprecated
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
    collection_requirements JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    approval_workflow JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    sheet_row_id INTEGER, -- Reference to Google Sheets row
    last_collection_date TIMESTAMPTZ,
    next_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence collection sessions
CREATE TABLE evidence_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name TEXT,
    compliance_check_ids UUID[] NOT NULL,
    admin_user_id UUID REFERENCES profiles(id),
    status session_status DEFAULT 'pending',
    llm_provider provider_type DEFAULT 'kimi',
    progress_steps JSONB DEFAULT '[]',
    chat_messages JSONB DEFAULT '[]',
    ai_reasoning_log JSONB DEFAULT '[]',
    collection_strategy JSONB DEFAULT '{}',
    user_preferences JSONB DEFAULT '{}',
    error_log JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}', -- timing, success rates, etc.
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration INTERVAL,
    actual_duration INTERVAL,
    total_evidence_items INTEGER DEFAULT 0,
    successful_collections INTEGER DEFAULT 0,
    failed_collections INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual evidence items
CREATE TABLE evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES evidence_sessions(id) ON DELETE CASCADE,
    check_id UUID REFERENCES compliance_checks(id),
    evidence_type TEXT NOT NULL, -- file, screenshot, api_response, manual_entry, database_export
    source_system TEXT NOT NULL, -- google_drive, onedrive, sharepoint, slack, database, manual
    source_path TEXT NOT NULL,
    original_filename TEXT,
    stored_filename TEXT,
    file_size BIGINT,
    file_hash TEXT, -- SHA256 for deduplication and integrity
    mime_type TEXT,
    storage_path TEXT, -- Where evidence is stored (Supabase Storage path)
    metadata JSONB DEFAULT '{}', -- File properties, collection context, etc.
    content_preview TEXT, -- First 1000 chars or AI-generated summary
    ai_analysis JSONB DEFAULT '{}', -- AI-generated insights about the evidence
    collection_context JSONB DEFAULT '{}', -- How/when it was collected
    validation_status TEXT DEFAULT 'pending', -- pending, valid, invalid, needs_review
    validation_details JSONB DEFAULT '{}',
    validation_errors TEXT[],
    review_status evidence_status DEFAULT 'pending',
    review_notes TEXT,
    reviewer_id UUID REFERENCES profiles(id),
    review_history JSONB DEFAULT '[]',
    slack_message_ts TEXT, -- For approval tracking
    slack_channel_id TEXT,
    sprinto_submission_id TEXT,
    sprinto_status TEXT,
    tags TEXT[] DEFAULT '{}',
    is_sensitive BOOLEAN DEFAULT FALSE,
    retention_policy JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ
);

-- AI agent memories with vector embeddings
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_type memory_type NOT NULL,
    check_type TEXT,
    check_name TEXT,
    framework TEXT,
    content JSONB NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 embeddings
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    success_rate FLOAT DEFAULT 1.0 CHECK (success_rate >= 0 AND success_rate <= 1),
    application_count INTEGER DEFAULT 0,
    successful_applications INTEGER DEFAULT 0,
    user_feedback JSONB DEFAULT '[]',
    context_tags TEXT[] DEFAULT '{}',
    related_memories UUID[],
    created_by UUID REFERENCES profiles(id),
    last_used TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ, -- For automatic cleanup
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection patterns learned by AI
CREATE TABLE collection_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL,
    check_type TEXT NOT NULL,
    check_names TEXT[], -- Multiple checks this pattern applies to
    framework TEXT,
    workflow_steps JSONB NOT NULL, -- Ordered sequence of collection steps
    success_indicators JSONB DEFAULT '{}', -- What constitutes successful collection
    failure_patterns JSONB DEFAULT '{}', -- Common failure modes and solutions
    user_preferences JSONB DEFAULT '{}', -- User-specific customizations
    optimization_history JSONB DEFAULT '[]',
    performance_metrics JSONB DEFAULT '{}',
    avg_completion_time INTERVAL,
    success_rate FLOAT DEFAULT 1.0,
    confidence_score FLOAT DEFAULT 1.0,
    times_used INTEGER DEFAULT 0,
    times_successful INTEGER DEFAULT 0,
    user_satisfaction_score FLOAT,
    last_optimized TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM provider configurations and usage tracking
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name provider_type NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB DEFAULT '{}', -- API endpoints, model names, etc.
    rate_limits JSONB DEFAULT '{}',
    cost_per_token DECIMAL(10,8),
    capabilities TEXT[] DEFAULT '{}', -- chat, embeddings, function_calling, etc.
    performance_metrics JSONB DEFAULT '{}',
    usage_stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM usage tracking for cost and performance monitoring
CREATE TABLE llm_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES evidence_sessions(id),
    provider provider_type NOT NULL,
    model_name TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- chat, embedding, function_call
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    latency_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    request_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive audit trail for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    session_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- session, evidence_item, memory, pattern, user
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    changes JSONB, -- Summary of what changed
    ai_reasoning TEXT, -- AI's explanation for automated actions
    user_context JSONB DEFAULT '{}', -- Device, location, browser, etc.
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'info', -- debug, info, warning, error, critical
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slack integration tracking
CREATE TABLE slack_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_item_id UUID REFERENCES evidence_items(id),
    channel_id TEXT NOT NULL,
    message_ts TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- approval_request, approval_response, notification
    user_id TEXT NOT NULL, -- Slack user ID
    action TEXT, -- approve, reject, request_changes
    response_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprinto integration tracking
CREATE TABLE sprinto_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_item_id UUID REFERENCES evidence_items(id),
    submission_id TEXT NOT NULL, -- Sprinto's submission ID
    control_id TEXT,
    framework_id TEXT,
    submission_data JSONB NOT NULL,
    status TEXT DEFAULT 'submitted', -- submitted, accepted, rejected, pending
    response_data JSONB DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for performance
CREATE INDEX idx_compliance_checks_team ON compliance_checks(team);
CREATE INDEX idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX idx_compliance_checks_framework ON compliance_checks(framework_id);
CREATE INDEX idx_compliance_checks_next_due ON compliance_checks(next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX idx_compliance_checks_tags ON compliance_checks USING GIN(tags);

CREATE INDEX idx_evidence_sessions_status ON evidence_sessions(status);
CREATE INDEX idx_evidence_sessions_admin ON evidence_sessions(admin_user_id);
CREATE INDEX idx_evidence_sessions_created ON evidence_sessions(created_at DESC);
CREATE INDEX idx_evidence_sessions_provider ON evidence_sessions(llm_provider);

CREATE INDEX idx_evidence_items_session ON evidence_items(session_id);
CREATE INDEX idx_evidence_items_status ON evidence_items(review_status);
CREATE INDEX idx_evidence_items_check ON evidence_items(check_id);
CREATE INDEX idx_evidence_items_source ON evidence_items(source_system);
CREATE INDEX idx_evidence_items_hash ON evidence_items(file_hash);
CREATE INDEX idx_evidence_items_created ON evidence_items(created_at DESC);
CREATE INDEX idx_evidence_items_tags ON evidence_items USING GIN(tags);

CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);
CREATE INDEX idx_agent_memories_check_type ON agent_memories(check_type);
CREATE INDEX idx_agent_memories_embedding ON agent_memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_agent_memories_tags ON agent_memories USING GIN(context_tags);
CREATE INDEX idx_agent_memories_last_used ON agent_memories(last_used DESC);

CREATE INDEX idx_collection_patterns_check_type ON collection_patterns(check_type);
CREATE INDEX idx_collection_patterns_success_rate ON collection_patterns(success_rate DESC);
CREATE INDEX idx_collection_patterns_usage ON collection_patterns(times_used DESC);
CREATE INDEX idx_collection_patterns_active ON collection_patterns(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE INDEX idx_llm_usage_session ON llm_usage_logs(session_id);
CREATE INDEX idx_llm_usage_provider ON llm_usage_logs(provider);
CREATE INDEX idx_llm_usage_created ON llm_usage_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant security
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view compliance checks" ON compliance_checks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage compliance checks" ON compliance_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can view own sessions" ON evidence_sessions
    FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "Users can create own sessions" ON evidence_sessions
    FOR INSERT WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON evidence_sessions
    FOR UPDATE USING (admin_user_id = auth.uid());

CREATE POLICY "Users can view evidence in own sessions" ON evidence_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evidence_sessions 
            WHERE evidence_sessions.id = evidence_items.session_id 
            AND evidence_sessions.admin_user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage agent memories" ON agent_memories
    FOR ALL USING (TRUE); -- Managed by application logic

CREATE POLICY "Users can view collection patterns" ON collection_patterns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_compliance_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_evidence_sessions_updated_at BEFORE UPDATE ON evidence_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collection_patterns_updated_at BEFORE UPDATE ON collection_patterns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_llm_providers_updated_at BEFORE UPDATE ON llm_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sprinto_submissions_updated_at BEFORE UPDATE ON sprinto_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to search similar memories using vector similarity
CREATE OR REPLACE FUNCTION search_similar_memories(
    query_embedding VECTOR(1536),
    memory_types memory_type[] DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.8,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    memory_type memory_type,
    check_type TEXT,
    content JSONB,
    similarity FLOAT,
    success_rate FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        agent_memories.id,
        agent_memories.memory_type,
        agent_memories.check_type,
        agent_memories.content,
        1 - (agent_memories.embedding <=> query_embedding) AS similarity,
        agent_memories.success_rate
    FROM agent_memories
    WHERE 
        (memory_types IS NULL OR agent_memories.memory_type = ANY(memory_types))
        AND 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
        AND (expiry_date IS NULL OR expiry_date > NOW())
    ORDER BY agent_memories.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to get collection pattern recommendations
CREATE OR REPLACE FUNCTION get_pattern_recommendations(
    p_check_type TEXT,
    p_framework TEXT DEFAULT NULL,
    p_limit INT DEFAULT 3
)
RETURNS TABLE (
    pattern_id UUID,
    pattern_name TEXT,
    success_rate FLOAT,
    times_used INTEGER,
    avg_completion_time INTERVAL
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        id,
        pattern_name,
        success_rate,
        times_used,
        avg_completion_time
    FROM collection_patterns
    WHERE 
        is_active = TRUE
        AND check_type = p_check_type
        AND (p_framework IS NULL OR framework = p_framework)
    ORDER BY 
        success_rate DESC,
        times_used DESC
    LIMIT p_limit;
$$;

-- Function to calculate session metrics
CREATE OR REPLACE FUNCTION calculate_session_metrics(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    session_data RECORD;
    evidence_stats RECORD;
BEGIN
    -- Get session data
    SELECT * INTO session_data FROM evidence_sessions WHERE id = p_session_id;

    -- Get evidence statistics
    SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE review_status = 'approved') as approved_items,
        COUNT(*) FILTER (WHERE review_status = 'rejected') as rejected_items,
        COUNT(*) FILTER (WHERE review_status = 'pending') as pending_items,
        AVG(file_size) as avg_file_size,
        SUM(file_size) as total_file_size
    INTO evidence_stats
    FROM evidence_items 
    WHERE session_id = p_session_id;

    -- Build result
    result := jsonb_build_object(
        'session_id', p_session_id,
        'duration', session_data.actual_duration,
        'total_evidence_items', evidence_stats.total_items,
        'approved_items', evidence_stats.approved_items,
        'rejected_items', evidence_stats.rejected_items,
        'pending_items', evidence_stats.pending_items,
        'success_rate', CASE 
            WHEN evidence_stats.total_items > 0 
            THEN evidence_stats.approved_items::FLOAT / evidence_stats.total_items 
            ELSE 0 
        END,
        'avg_file_size', evidence_stats.avg_file_size,
        'total_file_size', evidence_stats.total_file_size,
        'calculated_at', NOW()
    );

    RETURN result;
END;
$$;
