-- Insert sample compliance checks
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
