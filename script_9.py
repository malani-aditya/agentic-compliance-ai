# Create React components
import os

os.makedirs('components', exist_ok=True)

# Header component
header_component = '''import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const providers = [
  { id: 'openai', name: 'OpenAI GPT-4', type: 'paid' },
  { id: 'anthropic', name: 'Anthropic Claude', type: 'paid' },
  { id: 'groq', name: 'Groq Llama', type: 'paid' },
  { id: 'ollama', name: 'Ollama (Local)', type: 'free' }
]

export default function Header() {
  const [selectedProvider, setSelectedProvider] = useState('openai')

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Compliance Hub</h1>
            <p className="text-sm text-gray-500">AI-powered evidence collection</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                LLM Provider:
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="block w-48 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} {provider.type === 'free' && '(Free)'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-900">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
'''

# Sidebar component  
sidebar_component = '''import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon,
  PlayIcon, 
  FolderIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon },
  { name: 'Active Sessions', href: '/sessions', icon: PlayIcon },
  { name: 'Evidence Library', href: '/evidence', icon: FolderIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
'''

# Loading spinner component
loading_spinner = '''export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
    </div>
  )
}
'''

# Dashboard stats component
dashboard_stats = '''import { useEffect, useState } from 'react'

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalChecks: 0,
    automatedChecks: 0,
    pendingApprovals: 0,
    activeTeams: 0
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalChecks: 25,
      automatedChecks: 18,
      pendingApprovals: 7,
      activeTeams: 4
    })
  }, [])

  const statCards = [
    { 
      name: 'Total Checks', 
      value: stats.totalChecks, 
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Automated Checks', 
      value: stats.automatedChecks,
      color: 'bg-green-500',
      textColor: 'text-green-700', 
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Pending Approvals', 
      value: stats.pendingApprovals,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    { 
      name: 'Active Teams', 
      value: stats.activeTeams,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div key={stat.name} className={`${stat.bgColor} overflow-hidden rounded-lg px-4 py-5 shadow`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${stat.color} rounded-md`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                <dd className={`text-lg font-medium ${stat.textColor}`}>{stat.value}</dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
'''

# Write component files
with open('components/Header.tsx', 'w') as f:
    f.write(header_component)

with open('components/Sidebar.tsx', 'w') as f:
    f.write(sidebar_component)

with open('components/LoadingSpinner.tsx', 'w') as f:
    f.write(loading_spinner)

with open('components/DashboardStats.tsx', 'w') as f:
    f.write(dashboard_stats)

print("✅ Created React components:")
print("  - components/Header.tsx")
print("  - components/Sidebar.tsx") 
print("  - components/LoadingSpinner.tsx")
print("  - components/DashboardStats.tsx")