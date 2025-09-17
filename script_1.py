# Create Next.js configuration files
import os

# Create next.config.js
next_config = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['googleapis', '@microsoft/microsoft-graph-client']
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }
}

module.exports = nextConfig
'''

# Create tailwind.config.js
tailwind_config = '''/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b', 
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
'''

# Create postcss.config.js
postcss_config = '''module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
'''

# Create tsconfig.json
tsconfig = '''{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'''

# Create .env.example
env_example = '''# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AI Providers
AI_MODEL_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
MISTRAL_API_KEY=your_mistral_api_key
OLLAMA_BASE_URL=http://localhost:11434

# Google APIs
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json

# Microsoft Graph
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=your_microsoft_tenant_id

# Slack
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=your_slack_bot_token

# Sprinto
SPRINTO_API_KEY=your_sprinto_api_key
SPRINTO_API_URL=https://api.sprinto.com/graphql
'''

# Write config files
with open('next.config.js', 'w') as f:
    f.write(next_config)

with open('tailwind.config.js', 'w') as f:
    f.write(tailwind_config)

with open('postcss.config.js', 'w') as f:
    f.write(postcss_config)

with open('tsconfig.json', 'w') as f:
    f.write(tsconfig)

with open('.env.example', 'w') as f:
    f.write(env_example)

print("✅ Created configuration files:")
print("  - next.config.js")
print("  - tailwind.config.js") 
print("  - postcss.config.js")
print("  - tsconfig.json")
print("  - .env.example")