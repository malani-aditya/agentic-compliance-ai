import { Suspense } from 'react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import ComplianceChecksTable from '@/components/dashboard/ComplianceChecksTable'
import RecentSessions from '@/components/dashboard/RecentSessions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Compliance Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and automate your compliance evidence collection with AI-powered assistance
        </p>
      </div>

      {/* Dashboard Statistics */}
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Checks
              </h2>
              <p className="text-sm text-gray-500">
                Select and manage compliance evidence collection tasks
              </p>
            </div>
            <div className="card-body">
              <Suspense fallback={<LoadingSpinner />}>
                <ComplianceChecksTable />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Sessions
              </h3>
            </div>
            <div className="card-body">
              <Suspense fallback={<LoadingSpinner />}>
                <RecentSessions />
              </Suspense>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                AI Assistant Status
              </h3>
            </div>
            <div className="card-body">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success-500 rounded-full animate-bounce-gentle"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    AI Agent Active
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready for evidence collection
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Memory Patterns</span>
                  <span className="font-medium">127 learned</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Success Rate</span>
                  <span className="font-medium text-success-600">94.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Provider</span>
                  <span className="font-medium">Kimi (Default)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
