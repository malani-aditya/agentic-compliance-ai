# Create Supabase database schema
schema_sql = '''-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Create enum types
create type session_status as enum ('pending', 'collecting', 'reviewing', 'completed', 'error');
create type evidence_status as enum ('pending', 'collected', 'approved', 'rejected', 'error');
create type memory_type as enum ('procedural', 'episodic', 'semantic', 'contextual');
create type step_status as enum ('pending', 'in_progress', 'completed', 'error', 'skipped');

-- Compliance checks table (synced from Google Sheets)
create table compliance_checks (
  id uuid primary key default uuid_generate_v4(),
  check_type text not null,
  check_name text not null,
  area text,
  owner text,
  spoc text,
  task_status text,
  status text,
  team text,
  automate boolean default false,
  repetition text,
  collection_remarks text,
  spoc_comments text,
  sheet_row_id integer, -- Reference to Google Sheets row
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Evidence collection sessions
create table evidence_sessions (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid,
  selected_checks uuid[] not null,
  status session_status default 'pending',
  progress_steps jsonb not null default '[]',
  chat_messages jsonb default '[]',
  total_steps integer default 0,
  completed_steps integer default 0,
  estimated_time_minutes integer,
  actual_time_minutes integer,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Individual evidence items
create table evidence_items (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references evidence_sessions(id) on delete cascade,
  check_id uuid references compliance_checks(id),
  evidence_type text not null, -- 'google_sheet_snapshot', 'drive_file', 'onedrive_file', 'folder_backup'
  source_path text not null,
  file_name text,
  file_size bigint,
  storage_path text, -- Where evidence is stored
  collected_data jsonb, -- Metadata about collected evidence
  status evidence_status default 'pending',
  approval_notes text,
  approver_id uuid,
  slack_message_ts text, -- Slack message timestamp for approvals
  created_at timestamptz default now(),
  approved_at timestamptz,
  rejected_at timestamptz
);

-- Agent memory with vector embeddings
create table agent_memories (
  id uuid primary key default uuid_generate_v4(),
  check_type text,
  check_name text,
  memory_type memory_type not null,
  content jsonb not null,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  confidence_score float check (confidence_score >= 0 and confidence_score <= 1),
  success_rate float default 1.0 check (success_rate >= 0 and success_rate <= 1),
  usage_count integer default 1,
  created_by uuid,
  created_at timestamptz default now(),
  last_used timestamptz default now(),
  updated_at timestamptz default now()
);

-- Collection patterns learned by AI
create table collection_patterns (
  id uuid primary key default uuid_generate_v4(),
  check_type text not null,
  check_name text,
  step_sequence jsonb not null, -- Ordered array of steps
  success_indicators jsonb, -- What indicates successful collection
  user_preferences jsonb, -- User-specific preferences
  modification_history jsonb[] default '{}', -- History of user modifications
  usage_count integer default 1,
  success_count integer default 0,
  avg_completion_time interval,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit log for compliance tracking
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  session_id uuid references evidence_sessions(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_compliance_checks_team on compliance_checks(team);
create index idx_compliance_checks_status on compliance_checks(status);
create index idx_compliance_checks_check_type on compliance_checks(check_type);

create index idx_evidence_sessions_status on evidence_sessions(status);
create index idx_evidence_sessions_admin_user_id on evidence_sessions(admin_user_id);
create index idx_evidence_sessions_created_at on evidence_sessions(created_at desc);

create index idx_evidence_items_session_id on evidence_items(session_id);
create index idx_evidence_items_status on evidence_items(status);
create index idx_evidence_items_check_id on evidence_items(check_id);

create index idx_agent_memories_check_type on agent_memories(check_type);
create index idx_agent_memories_memory_type on agent_memories(memory_type);
create index idx_agent_memories_embedding on agent_memories using ivfflat (embedding vector_cosine_ops);

create index idx_collection_patterns_check_type on collection_patterns(check_type);
create index idx_collection_patterns_usage_count on collection_patterns(usage_count desc);

-- Enable Row Level Security
alter table compliance_checks enable row level security;
alter table evidence_sessions enable row level security;
alter table evidence_items enable row level security;
alter table agent_memories enable row level security;
alter table collection_patterns enable row level security;
alter table audit_logs enable row level security;

-- RLS Policies (basic - can be expanded based on requirements)
create policy "Public read access" on compliance_checks for select using (true);
create policy "Authenticated users can manage sessions" on evidence_sessions for all using (auth.uid() is not null);
create policy "Users can view evidence items" on evidence_items for select using (true);
create policy "System can manage agent memories" on agent_memories for all using (true);
create policy "System can manage collection patterns" on collection_patterns for all using (true);
create policy "Users can view audit logs" on audit_logs for select using (auth.uid() = user_id);

-- Create functions for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_compliance_checks_updated_at before update on compliance_checks for each row execute procedure update_updated_at_column();
create trigger update_evidence_sessions_updated_at before update on evidence_sessions for each row execute procedure update_updated_at_column();
create trigger update_agent_memories_updated_at before update on agent_memories for each row execute procedure update_updated_at_column();
create trigger update_collection_patterns_updated_at before update on collection_patterns for each row execute procedure update_updated_at_column();

-- Function to search similar memories using vector similarity
create or replace function search_similar_memories(
  query_embedding vector(1536),
  match_threshold float default 0.8,
  match_count int default 5
)
returns table (
  id uuid,
  check_type text,
  memory_type memory_type,
  content jsonb,
  similarity float
)
language sql stable
as $$
  select
    agent_memories.id,
    agent_memories.check_type,
    agent_memories.memory_type,
    agent_memories.content,
    1 - (agent_memories.embedding <=> query_embedding) as similarity
  from agent_memories
  where 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
  order by agent_memories.embedding <=> query_embedding
  limit match_count;
$$;
'''

# Create Supabase directory and migration
os.makedirs('supabase/migrations', exist_ok=True)

with open('supabase/migrations/20250917000001_initial_schema.sql', 'w') as f:
    f.write(schema_sql)

# Create seed data
seed_sql = '''-- Insert sample compliance checks
insert into compliance_checks (check_type, check_name, area, owner, spoc, task_status, status, team, automate, repetition, collection_remarks, spoc_comments) values
('SOC 2', 'Access Control Review', 'IT Security', 'John Smith', 'Jane Doe', 'Active', 'Pending', 'IT', true, 'Quarterly', 'Collect AD reports and access reviews', 'Focus on privileged accounts'),
('SOC 2', 'Data Backup Verification', 'IT Operations', 'Mike Johnson', 'Sarah Wilson', 'Active', 'In Progress', 'IT', false, 'Monthly', 'Verify backup logs and test restores', 'Include offsite backup validation'),
('GDPR', 'Data Processing Inventory', 'Privacy', 'Lisa Chen', 'David Brown', 'Active', 'Completed', 'Legal', true, 'Annually', 'Document all data processing activities', 'Update privacy impact assessments'),
('ISO 27001', 'Incident Response Testing', 'Security', 'Alex Rodriguez', 'Emily Davis', 'Active', 'Pending', 'Security', false, 'Semi-annually', 'Test incident response procedures', 'Include tabletop exercises'),
('PCI DSS', 'Network Segmentation Review', 'Network Security', 'Tom Anderson', 'Jennifer Lee', 'Active', 'Approved', 'Network', true, 'Quarterly', 'Validate network segmentation controls', 'Test firewall rules and VLANs');

-- Insert sample collection patterns
insert into collection_patterns (check_type, check_name, step_sequence, success_indicators, user_preferences) values
('SOC 2', 'Access Control Review', 
 '[
   {"step": 1, "action": "connect_google_drive", "params": {"folder": "/IT Compliance/Access Control"}},
   {"step": 2, "action": "search_files", "params": {"pattern": "AD_User_Report_*FINAL*.xlsx"}},
   {"step": 3, "action": "download_file", "params": {"latest": true}},
   {"step": 4, "action": "validate_content", "params": {"required_fields": ["user_count", "last_modified"]}}
 ]'::jsonb,
 '{"file_downloaded": true, "content_valid": true, "ciso_signature_present": true}'::jsonb,
 '{"prefer_final_versions": true, "require_ciso_signature": true}'::jsonb);
'''

with open('supabase/migrations/20250917000002_seed_data.sql', 'w') as f:
    f.write(seed_sql)

# Create Supabase config
supabase_config = '''# The local environment name, used to identify the local environment within the project
# This is used to generate the local database URL and other local environment variables
PROJECT_ID = "your-project-id"

[api]
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API endpoints.
# public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# The database major version to use. This has to be the same as your remote database's. Run `SHOW server_version;` on the remote database to check.
major_version = 15

[studio]
# Port to use for Supabase Studio.
port = 54323

[inbucket]
# Port to use for the local email testing server.
port = 54324
'''

with open('supabase/config.toml', 'w') as f:
    f.write(supabase_config)

print("✅ Created Supabase schema and configuration:")
print("  - supabase/migrations/20250917000001_initial_schema.sql")
print("  - supabase/migrations/20250917000002_seed_data.sql") 
print("  - supabase/config.toml")