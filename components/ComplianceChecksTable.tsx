import { useState, useEffect } from 'react'
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
