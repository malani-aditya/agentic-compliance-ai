import { Suspense } from 'react'
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
