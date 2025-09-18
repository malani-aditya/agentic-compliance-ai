'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon,
  PlayIcon, 
  FolderIcon,
  CogIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: ChartBarIcon,
    description: 'Overview and statistics'
  },
  { 
    name: 'Active Sessions', 
    href: '/sessions', 
    icon: PlayIcon,
    description: 'Running evidence collection'
  },
  { 
    name: 'Evidence Library', 
    href: '/evidence', 
    icon: FolderIcon,
    description: 'Collected evidence archive'
  },
  { 
    name: 'AI Memory', 
    href: '/memory', 
    icon: BeakerIcon,
    description: 'Agent learning patterns'
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: DocumentTextIcon,
    description: 'Compliance reports'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon,
    description: 'System configuration'
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary-600' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* AI Status Indicator */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary-700">
              AI Agent Ready
            </span>
          </div>
          <p className="text-xs text-primary-600 mt-1">
            Memory: 127 patterns learned
          </p>
        </div>
      </div>
    </div>
  )
}