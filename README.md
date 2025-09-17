# Agentic AI Compliance Evidence Collection System

An intelligent, conversational AI agent that autonomously collects compliance evidence while continuously learning from team interactions and evolving its understanding through natural language conversations.

## Features

- 🤖 **Agentic AI**: Self-learning AI agent that remembers successful patterns
- 💬 **Conversational Interface**: Modify collection steps through natural language  
- 📊 **Real-time Progress**: Step-by-step evidence collection with live updates
- 🔄 **Multi-provider LLMs**: Support for OpenAI, Anthropic, Google, Groq, and local Ollama
- 🔌 **Multi-source Integration**: Google Drive, OneDrive, Slack, Sprinto APIs
- 🧠 **Persistent Memory**: AI learns once and applies knowledge automatically
- ✅ **Approval Workflows**: Slack-based evidence review and approval

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL + Realtime)
- **AI**: Vercel AI SDK with multiple provider support
- **Database**: Supabase with pgvector for AI memory
- **Deployment**: Vercel with automatic Supabase integration

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)
- LLM provider API keys (OpenAI, Anthropic, etc.) or local Ollama

### 1. Clone and Install

```bash
git clone <repository-url>
cd agentic-compliance-ai
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- At least one LLM provider key (e.g., `OPENAI_API_KEY`)
- Google service account JSON for Drive/Sheets integration
- Slack credentials for approval workflows
- Microsoft Graph credentials for OneDrive access

### 3. Database Setup

Initialize Supabase and run migrations:

```bash
npx supabase init
npx supabase start
npx supabase db reset
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Deploy

Deploy to Vercel with one-click Supabase integration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Configuration

### LLM Providers

The system supports multiple LLM providers. Set `AI_MODEL_PROVIDER` to:

- `openai` - OpenAI GPT-4 (paid)
- `anthropic` - Anthropic Claude (paid)  
- `google` - Google Gemini (paid)
- `groq` - Groq Llama (paid, fast)
- `ollama` - Local Ollama models (free)

### Google Drive Integration

1. Create a Google Cloud project
2. Enable Drive and Sheets APIs
3. Create a service account and download JSON credentials
4. Share target folders/sheets with the service account email

### Slack Integration

1. Create a Slack app with bot permissions
2. Add interactive components endpoint: `https://your-domain.com/api/slack/interactions`
3. Install the app to your workspace
4. Configure bot token and signing secret

### Microsoft Graph (OneDrive)

1. Register an Azure AD application
2. Grant Files.Read permissions
3. Configure client ID, secret, and tenant ID

## Usage

### 1. Initial Setup

1. Access the dashboard at `/`
2. Select your preferred LLM provider in the header
3. Review compliance checks in the main table
4. Use filters to find specific checks by team, status, or type

### 2. Evidence Collection

1. Select multiple compliance checks using checkboxes
2. Click "Start Collection" to create a new session
3. Watch real-time progress as the AI agent collects evidence
4. Use the chat interface to modify steps, ask questions, or provide guidance

### 3. AI Learning

The AI learns from each interaction:
- **Procedural Memory**: Remembers successful collection workflows
- **Episodic Memory**: Learns from user feedback and corrections  
- **Semantic Memory**: Understands compliance terminology
- **Contextual Memory**: Maintains conversation context

### 4. Approval Workflow

1. Collected evidence is sent to Slack for review
2. Approvers can approve/reject with interactive buttons
3. Approved evidence is automatically submitted to Sprinto
4. All actions are logged for audit compliance

## Development

### Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities and integrations
├── supabase/             # Database migrations and config
├── package.json          # Dependencies
└── README.md            # This file
```

### Key Components

- `ComplianceChecksTable`: Main dashboard table with filtering
- `EvidenceCollectionInterface`: Real-time progress display
- `ChatInterface`: Conversational AI interaction
- `Header`: Provider selection and user profile
- `Sidebar`: Navigation menu

### API Routes

- `/api/sessions` - Create and manage evidence collection sessions
- `/api/compliance` - CRUD operations for compliance checks
- `/api/slack/interactions` - Handle Slack approval interactions
- `/api/sprinto/submit` - Submit evidence to Sprinto

### Database Schema

The application uses Supabase PostgreSQL with:
- `compliance_checks` - Synced from Google Sheets
- `evidence_sessions` - Collection session tracking
- `evidence_items` - Individual evidence files
- `agent_memories` - AI learning and memory storage
- `collection_patterns` - Learned collection workflows

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the repository or contact the development team.
