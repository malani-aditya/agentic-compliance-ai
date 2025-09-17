# Create app directory structure and main layout
import os

os.makedirs('app', exist_ok=True)
os.makedirs('app/api', exist_ok=True)
os.makedirs('app/api/sessions', exist_ok=True)
os.makedirs('app/api/slack', exist_ok=True)
os.makedirs('app/api/sprinto', exist_ok=True)
os.makedirs('app/(dashboard)', exist_ok=True)
os.makedirs('app/(dashboard)/sessions', exist_ok=True)
os.makedirs('app/globals.css', exist_ok=True)

# Root layout
layout_tsx = '''import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agentic Compliance AI',
  description: 'AI-powered compliance evidence collection system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
'''

# Global CSS
globals_css = '''@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }
  
  .btn-success {
    @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .input {
    @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
  }
  
  .table {
    @apply min-w-full divide-y divide-gray-200;
  }
  
  .table th {
    @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50;
  }
  
  .table td {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
  }
  
  .status-badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .status-pending {
    @apply status-badge bg-yellow-100 text-yellow-800;
  }
  
  .status-in-progress {
    @apply status-badge bg-blue-100 text-blue-800;
  }
  
  .status-completed {
    @apply status-badge bg-green-100 text-green-800;
  }
  
  .status-approved {
    @apply status-badge bg-green-100 text-green-800;
  }
  
  .status-rejected {
    @apply status-badge bg-red-100 text-red-800;
  }
  
  .status-error {
    @apply status-badge bg-red-100 text-red-800;
  }
}

/* Progress animations */
@keyframes pulse-blue {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-blue {
  animation: pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Loading states */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

/* Chat interface */
.chat-container {
  @apply flex flex-col h-full;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.chat-message {
  @apply flex items-start space-x-3;
}

.chat-message.user {
  @apply justify-end;
}

.chat-message.ai {
  @apply justify-start;
}

.chat-bubble {
  @apply max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm;
}

.chat-bubble.user {
  @apply bg-primary-600 text-white;
}

.chat-bubble.ai {
  @apply bg-gray-200 text-gray-900;
}

/* Progress steps */
.progress-step {
  @apply flex items-start space-x-3 p-4 border-b border-gray-200 last:border-b-0;
}

.progress-step.completed {
  @apply bg-green-50;
}

.progress-step.in-progress {
  @apply bg-blue-50;
}

.progress-step.error {
  @apply bg-red-50;
}

.step-icon {
  @apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium;
}

.step-icon.completed {
  @apply bg-green-100 text-green-800;
}

.step-icon.in-progress {
  @apply bg-blue-100 text-blue-800 animate-pulse-blue;
}

.step-icon.pending {
  @apply bg-gray-100 text-gray-500;
}

.step-icon.error {
  @apply bg-red-100 text-red-800;
}
'''

# Main dashboard layout
dashboard_layout = '''import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
'''

# Dashboard page
dashboard_page = '''import { Suspense } from 'react'
import ComplianceChecksTable from '@/components/ComplianceChecksTable'
import DashboardStats from '@/components/DashboardStats'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="text-gray-600">Manage and automate your compliance evidence collection</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>
      
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Compliance Checks</h2>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <ComplianceChecksTable />
        </Suspense>
      </div>
    </div>
  )
}
'''

with open('app/layout.tsx', 'w') as f:
    f.write(layout_tsx)

with open('app/globals.css', 'w') as f:
    f.write(globals_css)

with open('app/(dashboard)/layout.tsx', 'w') as f:
    f.write(dashboard_layout)

with open('app/(dashboard)/page.tsx', 'w') as f:
    f.write(dashboard_page)

print("✅ Created app directory structure:")
print("  - app/layout.tsx")
print("  - app/globals.css")
print("  - app/(dashboard)/layout.tsx")
print("  - app/(dashboard)/page.tsx")