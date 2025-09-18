-- Insert compliance frameworks
INSERT INTO compliance_frameworks (name, version, description) VALUES
('SOC 2', '2017', 'Service Organization Control 2 - Trust Services Criteria'),
('GDPR', '2018', 'General Data Protection Regulation'),
('ISO 27001', '2022', 'Information Security Management Systems'),
('HIPAA', '1996', 'Health Insurance Portability and Accountability Act'),
('PCI DSS', '4.0', 'Payment Card Industry Data Security Standard');

-- Insert LLM provider configurations
INSERT INTO llm_providers (provider_name, display_name, is_active, configuration, cost_per_token, capabilities) VALUES
('kimi', 'Kimi (Moonshot)', TRUE, 
 '{"endpoint": "https://api.moonshot.cn/v1/chat/completions", "models": ["moonshot-v1-8k", "moonshot-v1-32k"]}',
 0.000002, ARRAY['chat', 'function_calling']),
('openai', 'OpenAI GPT-4', TRUE,
 '{"models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]}',
 0.00001, ARRAY['chat', 'embeddings', 'function_calling', 'vision']),
('anthropic', 'Anthropic Claude', TRUE,
 '{"models": ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"]}',
 0.000008, ARRAY['chat', 'function_calling', 'vision']),
('google', 'Google Gemini', TRUE,
 '{"models": ["gemini-1.5-pro", "gemini-1.5-flash"]}',
 0.000003, ARRAY['chat', 'function_calling', 'vision']),
('groq', 'Groq', TRUE,
 '{"models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]}',
 0.000001, ARRAY['chat', 'function_calling']),
('deepseek', 'DeepSeek', TRUE,
 '{"endpoint": "https://api.deepseek.com/v1/chat/completions", "models": ["deepseek-chat", "deepseek-coder"]}',
 0.0000005, ARRAY['chat', 'function_calling']);

-- Insert sample compliance checks
INSERT INTO compliance_checks (
    framework_id, check_type, check_name, check_code, area, sub_area, 
    owner, spoc, team, frequency, automation_level, priority,
    collection_requirements, validation_rules
) VALUES
((SELECT id FROM compliance_frameworks WHERE name = 'SOC 2'), 
 'SOC 2', 'Access Control Review', 'CC6.1', 'IT Security', 'Access Management',
 'John Smith', 'Jane Doe', 'IT', 'Quarterly', 'semi-automated', 1,
 '{"sources": ["active_directory", "google_workspace"], "file_patterns": ["AD_User_Report_*.xlsx", "Access_Review_*.pdf"], "required_fields": ["user_count", "last_modified", "reviewer_signature"]}',
 '{"min_file_size": 1024, "max_age_days": 30, "required_signatures": ["CISO", "IT_Manager"]}'),

((SELECT id FROM compliance_frameworks WHERE name = 'SOC 2'),
 'SOC 2', 'Data Backup Verification', 'CC6.2', 'IT Operations', 'Data Protection',
 'Mike Johnson', 'Sarah Wilson', 'IT', 'Monthly', 'fully-automated', 2,
 '{"sources": ["backup_system", "aws_s3"], "file_patterns": ["Backup_Log_*.txt", "Restore_Test_*.pdf"], "validation_scripts": ["verify_backup_integrity.py"]}',
 '{"backup_completion_rate": 0.99, "restore_test_frequency": "monthly"}'),

((SELECT id FROM compliance_frameworks WHERE name = 'GDPR'),
 'GDPR', 'Data Processing Inventory', 'Art.30', 'Privacy', 'Data Mapping',
 'Lisa Chen', 'David Brown', 'Legal', 'Annually', 'manual', 1,
 '{"sources": ["privacy_docs", "contracts"], "file_patterns": ["DPA_*.pdf", "Processing_Record_*.xlsx"], "legal_review": true}',
 '{"requires_legal_approval": true, "retention_period_years": 7}'),

((SELECT id FROM compliance_frameworks WHERE name = 'ISO 27001'),
 'ISO 27001', 'Incident Response Testing', 'A.16.1', 'Security', 'Incident Management',
 'Alex Rodriguez', 'Emily Davis', 'Security', 'Semi-annually', 'manual', 2,
 '{"sources": ["incident_reports", "training_records"], "exercise_types": ["tabletop", "simulation"], "documentation_required": true}',
 '{"min_participants": 5, "scenario_complexity": "high", "response_time_threshold": "4_hours"}'),

((SELECT id FROM compliance_frameworks WHERE name = 'PCI DSS'),
 'PCI DSS', 'Network Segmentation Review', 'Req.1', 'Network Security', 'Firewall Management',
 'Tom Anderson', 'Jennifer Lee', 'Network', 'Quarterly', 'semi-automated', 1,
 '{"sources": ["firewall_configs", "network_diagrams"], "tools": ["nmap", "vulnerability_scanner"], "documentation": ["network_topology", "segmentation_validation"]}',
 '{"scan_coverage": 0.95, "vulnerability_threshold": "high", "config_compliance": true}');

-- Insert sample collection patterns
INSERT INTO collection_patterns (
    pattern_name, check_type, check_names, framework, workflow_steps, 
    success_indicators, user_preferences, success_rate, times_used
) VALUES
('SOC 2 Access Control Standard Pattern', 'SOC 2', ARRAY['Access Control Review'], 'SOC 2',
 '[
   {"step": 1, "action": "authenticate_google_workspace", "description": "Connect to Google Workspace with OAuth"},
   {"step": 2, "action": "scan_drive_folder", "params": {"folder": "/IT Compliance/Access Control", "patterns": ["AD_User_Report_*FINAL*.xlsx"]}},
   {"step": 3, "action": "validate_file_age", "params": {"max_age_days": 30}},
   {"step": 4, "action": "check_required_signatures", "params": {"required": ["CISO", "IT_Manager"]}},
   {"step": 5, "action": "create_evidence_snapshot", "params": {"include_metadata": true}}
 ]'::jsonb,
 '{"file_found": true, "signatures_present": true, "file_age_valid": true, "metadata_complete": true}'::jsonb,
 '{"prefer_final_versions": true, "backup_folder_check": true, "auto_validate": true}'::jsonb,
 0.95, 15),

('GDPR Privacy Documentation Pattern', 'GDPR', ARRAY['Data Processing Inventory'], 'GDPR',
 '[
   {"step": 1, "action": "scan_legal_documents", "params": {"folder": "/Legal/Privacy/GDPR", "file_types": ["pdf", "docx"]}},
   {"step": 2, "action": "extract_processing_activities", "params": {"use_ai_analysis": true}},
   {"step": 3, "action": "validate_completeness", "params": {"required_sections": ["purpose", "categories", "retention"]}},
   {"step": 4, "action": "get_legal_approval", "params": {"approver_role": "Legal"}}
 ]'::jsonb,
 '{"documents_found": true, "legal_approval": true, "completeness_score": 0.9}'::jsonb,
 '{"require_legal_review": true, "ai_assistance": true}'::jsonb,
 0.88, 8);

-- Insert sample agent memories (procedural knowledge)
INSERT INTO agent_memories (memory_type, check_type, content, confidence_score, success_rate, application_count) VALUES
('procedural', 'SOC 2', 
 '{"learned_pattern": "For SOC 2 Access Control Reviews, users prefer to check backup folders first when main folder is empty", "context": "Multiple users have redirected me to backup locations", "application_context": "When primary evidence location fails", "success_factors": ["check_backup_location", "verify_file_recency", "validate_signatures"]}'::jsonb,
 0.92, 0.94, 12),

('episodic', 'GDPR',
 '{"interaction_summary": "User Jane corrected my search pattern for GDPR docs - they are stored in year-based subfolders", "original_approach": "Search in root GDPR folder", "corrected_approach": "Search in /GDPR/2025/ subfolder", "user_feedback": "Always check current year folder first", "outcome": "Successful collection after correction"}'::jsonb,
 0.89, 0.96, 5),

('semantic', 'General',
 '{"concept": "Evidence freshness requirements", "definition": "Different compliance frameworks have different requirements for how recent evidence must be", "examples": {"SOC2": "30 days", "GDPR": "90 days", "ISO27001": "180 days"}, "usage_context": "Validate evidence age during collection"}'::jsonb,
 0.95, 0.98, 23);

-- Set the next due dates for checks based on frequency
UPDATE compliance_checks SET 
    next_due_date = CASE 
        WHEN frequency = 'Monthly' THEN NOW() + INTERVAL '1 month'
        WHEN frequency = 'Quarterly' THEN NOW() + INTERVAL '3 months' 
        WHEN frequency = 'Semi-annually' THEN NOW() + INTERVAL '6 months'
        WHEN frequency = 'Annually' THEN NOW() + INTERVAL '1 year'
        ELSE NOW() + INTERVAL '1 month'
    END;
