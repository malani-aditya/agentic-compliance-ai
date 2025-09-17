# Fix the directory issue and create the app structure properly
import os

# Remove the incorrectly created directory
import shutil
if os.path.exists('app/globals.css') and os.path.isdir('app/globals.css'):
    shutil.rmtree('app/globals.css')

# Create app directory structure
os.makedirs('app/(dashboard)/sessions', exist_ok=True)

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
}

@keyframes pulse-blue {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse-blue {
  animation: pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
'''

# Dashboard layout
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

# Evidence session page
session_page = '''import { Suspense } from 'react'
import EvidenceCollectionInterface from '@/components/EvidenceCollectionInterface'
import ChatInterface from '@/components/ChatInterface'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <EvidenceCollectionInterface sessionId={params.id} />
          </Suspense>
        </div>
        <div className="w-96 border-l border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <ChatInterface sessionId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
'''

with open('app/globals.css', 'w') as f:
    f.write(globals_css)

with open('app/(dashboard)/layout.tsx', 'w') as f:
    f.write(dashboard_layout)

with open('app/(dashboard)/page.tsx', 'w') as f:
    f.write(dashboard_page)

with open('app/(dashboard)/sessions/[id]/page.tsx', 'w') as f:
    f.write(session_page)

print("✅ Created app pages:")
print("  - app/globals.css")
print("  - app/(dashboard)/layout.tsx")
print("  - app/(dashboard)/page.tsx")
print("  - app/(dashboard)/sessions/[id]/page.tsx")