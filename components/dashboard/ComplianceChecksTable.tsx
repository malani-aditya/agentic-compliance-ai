'use client'

import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon, PlayIcon } from '@heroicons/react/20/solid'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { ComplianceCheck } from '@/types/app.types'

export default function ComplianceChecksTable() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([])
  const [selectedChecks, setSelectedChecks] = useState<string[]>([])
  const [filters, setFilters] = useState({
    team: 'all',
    status: 'all',
    checkType: 'all',
    search: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChecks()
  }, [filters])

  const fetchChecks = async () => {
    try {
      setLoading(true)
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockChecks: ComplianceCheck[] = [
        {
          id: '1',
          framework_id: 'soc2',
          check_type: 'SOC 2',
          check_name: 'Access Control Review',
          check_code: 'CC6.1',
          area: 'IT Security',
          sub_area: 'Access Management',
          owner: 'John Smith',
          spoc: 'Jane Doe',
          team: 'IT',
          frequency: 'Quarterly',
          automation_level: 'semi-automated',
          priority: 1,
          estimated_effort_hours: 4,
          task_status: 'active',
          status: 'pending',
          collection_requirements: {},
          validation_rules: {},
          approval_workflow: {},
          tags: ['critical', 'access'],
          sheet_row_id: 2,
          last_collection_date: null,
          next_due_date: '2025-12-31T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          framework_id: 'soc2',
          check_type: 'SOC 2',
          check_name: 'Data Backup Verification',
          check_code: 'CC6.2',
          area: 'IT Operations',
          sub_area: 'Data Protection',
          owner: 'Mike Johnson',
          spoc: 'Sarah Wilson',
          team: 'IT',
          frequency: 'Monthly',
          automation_level: 'fully-automated',
          priority: 2,
          estimated_effort_hours: 2,
          task_status: 'active',
          status: 'in_progress',
          collection_requirements: {},
          validation_rules: {},
          approval_workflow: {},
          tags: ['backup', 'monthly'],
          sheet_row_id: 3,
          last_collection_date: '2025-08-15T00:00:00Z',
          next_due_date: '2025-10-15T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-09-15T00:00:00Z'
        },
        {
          id: '3',
          framework_id: 'gdpr',
          check_type: 'GDPR',
          check_name: 'Data Processing Inventory',
          check_code: 'Art.30',
          area: 'Privacy',
          sub_area: 'Data Mapping',
          owner: 'Lisa Chen',
          spoc: 'David Brown',
          team: 'Legal',
          frequency: 'Annually',
          automation_level: 'manual',
          priority: 1,
          estimated_effort_hours: 8,
          task_status: 'active',
          status: 'completed',
          collection_requirements: {},
          validation_rules: {},
          approval_workflow: {},
          tags: ['gdpr', 'annual'],
          sheet_row_id: 4,
          last_collection_date: '2025-01-15T00:00:00Z',
          next_due_date: '2026-01-15T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z'
        }
      ]
      
      setChecks(mockChecks)
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
      // Simulate session creation
      console.log('Starting collection for checks:', selectedChecks)
      
      // In real app, create session and redirect
      // const response = await fetch('/api/sessions', { ... })
      // window.location.href = `/sessions/${sessionId}`
      
      alert(`Starting collection for ${selectedChecks.length} checks`)
    } catch (error) {
      console.error('Failed to start collection:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      'pending': 'pending',
      'in_progress': 'in-progress', 
      'completed': 'completed',
      'approved': 'approved'
    }
    
    return statusMap[status] || 'pending'
  }

  const filteredChecks = checks.filter(check => {
    if (filters.team !== 'all' && check.team !== filters.team) return false
    if (filters.status !== 'all' && check.status !== filters.status) return false
    if (filters.checkType !== 'all' && check.check_type !== filters.checkType) return false
    if (filters.search && !check.check_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search checks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="border-0 bg-transparent focus:ring-0 text-sm placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select 
            value={filters.team}
            onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
            className="border-gray-300 rounded-md text-sm focus:border-primary-500 focus:ring-primary-500"
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
            className="border-gray-300 rounded-md text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>

          <select
            value={filters.checkType}
            onChange={(e) => setFilters(prev => ({ ...prev, checkType: e.target.value }))}
            className="border-gray-300 rounded-md text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="SOC 2">SOC 2</option>
            <option value="GDPR">GDPR</option>
            <option value="ISO 27001">ISO 27001</option>
            <option value="PCI DSS">PCI DSS</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedChecks.length} of {filteredChecks.length} checks selected
        </div>
        
        {selectedChecks.length > 0 && (
          <Button onClick={startCollection} className="flex items-center space-x-2">
            <PlayIcon className="w-4 h-4" />
            <span>Start Collection ({selectedChecks.length})</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectedChecks.length === filteredChecks.length && filteredChecks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th>Check</th>
              <th>Area</th>
              <th>Owner</th>
              <th>Team</th>
              <th>Status</th>
              <th>Automation</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredChecks.map((check) => (
              <tr 
                key={check.id} 
                className={selectedChecks.includes(check.id) ? 'selected' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedChecks.includes(check.id)}
                    onChange={() => handleSelectCheck(check.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td>
                  <div>
                    <div className="font-medium text-gray-900">
                      {check.check_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {check.check_type} • {check.check_code}
                    </div>
                  </div>
                </td>
                <td className="text-gray-900">{check.area}</td>
                <td className="text-gray-900">{check.owner}</td>
                <td>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {check.team}
                  </span>
                </td>
                <td>
                  <Badge variant={getStatusBadge(check.status)}>
                    {check.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center">
                    {check.automation_level === 'fully-automated' ? (
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : check.automation_level === 'semi-automated' ? (
                      <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      </div>
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span className="ml-2 text-sm text-gray-600 capitalize">
                      {check.automation_level.replace('-', ' ')}
                    </span>
                  </div>
                </td>
                <td>
                  {check.next_due_date ? (
                    <div className="text-sm">
                      {new Date(check.next_due_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredChecks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No compliance checks found matching your filters.</p>
        </div>
      )}
    </div>
  )
}