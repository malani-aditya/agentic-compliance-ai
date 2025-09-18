/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['googleapis', '@microsoft/microsoft-graph-client', 'ws']
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER || 'kimi'
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom']
    return config
  }
}

module.exports = nextConfig
