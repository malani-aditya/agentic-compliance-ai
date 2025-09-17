# Core files
mv layout.tsx app/layout.tsx
mv globals.css app/globals.css
mv page.tsx app/dashboard/page.tsx
mv route.ts app/api/sessions/route.ts

# Components
mv Header.tsx components/
mv Sidebar.tsx components/
mv ComplianceChecksTable.tsx components/
mv EvidenceCollectionInterface.tsx components/
mv ChatInterface.tsx components/
mv DashboardStats.tsx components/
mv LoadingSpinner.tsx components/

# Libraries
mv supabase.ts lib/
mv llm-providers.ts lib/
mv google-drive.ts lib/
mv microsoft-graph.ts lib/
mv slack.ts lib/
mv sprinto.ts lib/

# Supabase
mv config.toml supabase/
mv 20250917000001_initial_schema.sql supabase/migrations/
mv 20250917000002_seed_data.sql supabase/migrations/