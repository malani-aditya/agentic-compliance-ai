'use client'

import { useState, useEffect } from 'react'
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Badge from '@/components/ui/Badge'
import { EvidenceSession } from '@/types/app.types'

export default function RecentSessions() {
  const [sessions, setSessions] = useState<EvidenceSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentSessions()
  }, [])

  const fetchRecentSessions = async () => {
    try {
      setLoading(true)
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const mockSessions: EvidenceSession[] = [
        {
          id: '1',
          session_name: 'Q3 SOC 2 Collection',
          compliance_check_ids: ['1', '2'],
          admin_user_id: 'user1',
          status: 'completed',
          llm_provider: 'kimi',
          progress_steps: [],
          chat_messages: [],
          ai_reasoning_log: [],
          collection_strategy: {},
          user_preferences: {},
          error_log: [],
          metrics: {},
          started_at: '2025-09-17T10:00:00Z',
          completed_at: '2025-09-17T10:15:00Z',
          estimated_duration: null,
          actual_duration: null,
          total_evidence_items: 5,
          successful_collections: 5,
          failed_collections: 0,
          created_at: '2025-09-17T10:00:00Z',
          updated_at: '2025-09-17T10:15:00Z'
        },
        {
          id: '2',
          session_name: 'Privacy Impact Assessment',
          compliance_check_ids: ['3'],
          admin_user_id: 'user1',
          status: 'collecting',
          llm_provider: 'anthropic',
          progress_steps: [],
          chat_messages: [],
          ai_reasoning_log: [],
          collection_strategy: {},
          user_preferences: {},
          error_log: [],
          metrics: {},
          started_at: '2025-09-17T14:30:00Z',
          completed_at: null,
          estimated_duration: null,
          actual_duration: null,
          total_evidence_items: 3,
          successful_collections: 2,
          failed_collections: 0,
          created_at: '2025-09-17T14:30:00Z',
          updated_at: '2025-09-17T14:45:00Z'
        },
        {
          id: '3',
          session_name: 'Network Security Review',
          compliance_check_ids: ['4', '5'],
          admin_user_id: 'user1',
          status: 'error',
          llm_provider: 'openai',
          progress_steps: [],
          chat_messages: [],
          ai_reasoning_log: [],
          collection_strategy: {},
          user_preferences: {},
          error_log: [],
          metrics: {},
          started_at: '2025-09-16T16:00:00Z',
          completed_at: null,
          estimated_duration: null,
          actual_duration: null,
          total_evidence_items: 2,
          successful_collections: 1,
          failed_collections: 1,
          created_at: '2025-09-16T16:00:00Z',
          updated_at: '2025-09-16T16:20:00Z'
        }
      ]
      
      setSessions(mockSessions)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'collecting':
      case 'planning':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      'pending': 'pending',
      'planning': 'pending',
      'collecting': 'in-progress',
      'reviewing': 'in-progress',
      'completed': 'completed',
      'error': 'error',
      'cancelled': 'cancelled'
    }
    
    return statusMap[status] || 'pending'
  }

  const formatDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    
    if (diffMins < 60) {
      return `${diffMins}m`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div 
          key={session.id}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => {
            // Navigate to session detail
            console.log('Navigate to session:', session.id)
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(session.status)}
              <h4 className="font-medium text-gray-900 text-sm">
                {session.session_name || `Session ${session.id.slice(0, 8)}`}
              </h4>
            </div>
            <Badge variant={getStatusBadge(session.status)}>
              {session.status}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Checks:</span>
              <span>{session.compliance_check_ids.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Evidence:</span>
              <span>{session.successful_collections}/{session.total_evidence_items}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{formatDuration(session.started_at, session.completed_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Provider:</span>
              <span className="capitalize">{session.llm_provider}</span>
            </div>
          </div>
          
          {session.status === 'collecting' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round((session.successful_collections / session.total_evidence_items) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(session.successful_collections / session.total_evidence_items) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No recent sessions</p>
        </div>
      )}
    </div>
  )
}