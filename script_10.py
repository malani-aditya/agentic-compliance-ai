# Create more React components - Compliance table, Evidence collection, Chat interface
import os

# Compliance checks table component
compliance_table = '''import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

interface ComplianceCheck {
  id: string
  checkType: string
  checkName: string
  area: string
  owner: string
  spoc: string
  taskStatus: string
  status: string
  team: string
  automate: boolean
  repetition: string
  collectionRemarks?: string
  spocComments?: string
}

export default function ComplianceChecksTable() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([])
  const [selectedChecks, setSelectedChecks] = useState<string[]>([])
  const [filters, setFilters] = useState({
    team: 'all',
    status: 'all',
    checkType: 'all'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChecks()
  }, [filters])

  const fetchChecks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.team !== 'all') params.set('team', filters.team)
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.checkType !== 'all') params.set('checkType', filters.checkType)

      const response = await fetch(`/api/compliance?${params}`)
      const data = await response.json()
      
      if (data.checks) {
        setChecks(data.checks)
      }
    } catch (error) {
      console.error('Failed to fetch checks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCheck = (checkId: string) => {
    setSelectedChecks(prev => 
      prev.includes(checkId) 
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    )
  }

  const handleSelectAll = () => {
    setSelectedChecks(
      selectedChecks.length === checks.length 
        ? [] 
        : checks.map(check => check.id)
    )
  }

  const startCollection = async () => {
    if (selectedChecks.length === 0) return
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedChecks,
          adminUserId: 'current-user-id' // Replace with actual user ID
        })
      })
      
      const data = await response.json()
      if (data.session) {
        window.location.href = `/sessions/${data.session.id}`
      }
    } catch (error) {
      console.error('Failed to start collection:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'in progress':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <select 
          value={filters.team}
          onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
          className="input"
        >
          <option value="all">All Teams</option>
          <option value="IT">IT</option>
          <option value="Security">Security</option>
          <option value="Legal">Legal</option>
          <option value="Network">Network</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="input"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Approved">Approved</option>
        </select>

        <select
          value={filters.checkType}
          onChange={(e) => setFilters(prev => ({ ...prev, checkType: e.target.value }))}
          className="input"
        >
          <option value="all">All Types</option>
          <option value="SOC 2">SOC 2</option>
          <option value="GDPR">GDPR</option>
          <option value="ISO 27001">ISO 27001</option>
          <option value="PCI DSS">PCI DSS</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedChecks.length} of {checks.length} checks selected
        </div>
        
        {selectedChecks.length > 0 && (
          <button
            onClick={startCollection}
            className="btn btn-primary"
          >
            Start Collection ({selectedChecks.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedChecks.length === checks.length && checks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Automate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {checks.map((check) => (
              <tr key={check.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedChecks.includes(check.id)}
                    onChange={() => handleSelectCheck(check.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {check.checkName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {check.checkType}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.owner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(check.status)}>
                    {check.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.automate ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
'''

# Evidence collection interface component
evidence_collection = '''import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'

interface ProgressStep {
  step: number
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  message: string
  timestamp?: string
}

interface EvidenceSession {
  id: string
  status: 'pending' | 'collecting' | 'reviewing' | 'completed' | 'error'
  progressSteps: ProgressStep[]
  selectedChecks: string[]
  estimatedTimeMinutes?: number
}

export default function EvidenceCollectionInterface({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<EvidenceSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
    
    // Set up real-time updates
    const interval = setInterval(fetchSession, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      const data = await response.json()
      
      if (data.session) {
        setSession(data.session)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch session:', error)
      setLoading(false)
    }
  }

  const startCollection = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/start`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchSession()
      }
    } catch (error) {
      console.error('Failed to start collection:', error)
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'in_progress':
        return <MagnifyingGlassIcon className="h-6 w-6 text-blue-500 animate-pulse-blue" />
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
      default:
        return <ClockIcon className="h-6 w-6 text-gray-400" />
    }
  }

  const getStepBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Session not found</p>
      </div>
    )
  }

  const completedSteps = session.progressSteps.filter(step => step.status === 'completed').length
  const totalSteps = session.progressSteps.length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Evidence Collection Session</h1>
            <p className="text-sm text-gray-500">
              {session.selectedChecks.length} checks selected
              {session.estimatedTimeMinutes && ` • ~${session.estimatedTimeMinutes} min estimated`}
            </p>
          </div>
          
          {session.status === 'pending' && (
            <button
              onClick={startCollection}
              className="btn btn-primary"
            >
              Start Collection
            </button>
          )}
          
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {completedSteps}/{totalSteps} Steps
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex-1 overflow-y-auto p-6">
        {session.status === 'pending' ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start</h3>
            <p className="text-gray-500">Click "Start Collection" to begin evidence collection</p>
          </div>
        ) : (
          <div className="space-y-4">
            {session.progressSteps.map((step, index) => (
              <div 
                key={step.step}
                className={`border rounded-lg p-4 ${getStepBgColor(step.status)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        Step {step.step}: {step.title}
                      </h4>
                      {step.timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600">
                      {step.message}
                    </p>
                    
                    {step.status === 'in_progress' && (
                      <div className="mt-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                          <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                          <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
'''

with open('components/ComplianceChecksTable.tsx', 'w') as f:
    f.write(compliance_table)

with open('components/EvidenceCollectionInterface.tsx', 'w') as f:
    f.write(evidence_collection)

print("✅ Created additional React components:")
print("  - components/ComplianceChecksTable.tsx")
print("  - components/EvidenceCollectionInterface.tsx")