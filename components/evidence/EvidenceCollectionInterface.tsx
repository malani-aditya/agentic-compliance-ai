'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/20/solid'
import { EvidenceSession, ProgressStep } from '@/types/app.types'
import ProgressSteps from './ProgressSteps'
import ChatInterface from '@/components/chat/ChatInterface'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function EvidenceCollectionInterface() {
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<EvidenceSession | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSession()

      // Set up real-time updates
      const interval = setInterval(fetchSession, 2000)
      return () => clearInterval(interval)
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockSession: EvidenceSession = {
        id: sessionId,
        session_name: 'Q3 Compliance Collection',
        compliance_check_ids: ['1', '2', '3'],
        admin_user_id: 'user1',
        status: 'collecting',
        llm_provider: 'kimi',
        progress_steps: [
          {
            id: '1',
            step: 1,
            title: 'Initialize Collection Session',
            description: 'Setting up evidence collection parameters',
            status: 'completed',
            message: 'Session initialized successfully with 3 compliance checks',
            timestamp: '2025-09-18T12:00:00Z',
            estimated_time: 30,
            actual_time: 25
          },
          {
            id: '2', 
            step: 2,
            title: 'Scan Google Drive Folders',
            description: 'Searching for evidence files in specified locations',
            status: 'in_progress',
            message: 'Scanning /Compliance/SOC2/Access Control folder...',
            timestamp: '2025-09-18T12:01:00Z',
            estimated_time: 120,
            details: 'Found 15 files matching patterns: AD_User_Report_*.xlsx, Access_Review_*.pdf'
          },
          {
            id: '3',
            step: 3, 
            title: 'Validate Evidence Files',
            description: 'Checking file completeness and requirements',
            status: 'pending',
            message: 'Waiting for file scan completion',
            timestamp: '2025-09-18T12:03:00Z',
            estimated_time: 60
          },
          {
            id: '4',
            step: 4,
            title: 'Generate Evidence Report',
            description: 'Compile collected evidence into structured format',
            status: 'pending', 
            message: 'Ready to process collected files',
            timestamp: '2025-09-18T12:05:00Z',
            estimated_time: 45
          }
        ] as ProgressStep[],
        chat_messages: [],
        ai_reasoning_log: [],
        collection_strategy: {},
        user_preferences: {},
        error_log: [],
        metrics: {},
        started_at: '2025-09-18T12:00:00Z',
        completed_at: null,
        estimated_duration: '15 minutes',
        actual_duration: null,
        total_evidence_items: 0,
        successful_collections: 0,
        failed_collections: 0,
        created_at: '2025-09-18T12:00:00Z',
        updated_at: '2025-09-18T12:03:00Z'
      }

      setSession(mockSession)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch session:', error)
      setLoading(false)
    }
  }

  const startCollection = async () => {
    try {
      // Simulate starting collection
      console.log('Starting collection for session:', sessionId)

      if (session) {
        setSession({
          ...session,
          status: 'collecting',
          started_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to start collection:', error)
    }
  }

  const pauseCollection = async () => {
    console.log('Pausing collection')
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
        <ExclamationCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Session not found</p>
      </div>
    )
  }

  const completedSteps = (session.progress_steps as ProgressStep[]).filter(step => step.status === 'completed').length
  const totalSteps = (session.progress_steps as ProgressStep[]).length

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showChat ? 'mr-96' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.session_name || 'Evidence Collection Session'}
              </h1>
              <p className="text-gray-600 mt-1">
                {session.compliance_check_ids.length} checks selected • 
                <span className="ml-1 capitalize">{session.llm_provider}</span> provider
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={session.status === 'collecting' ? 'in-progress' : 'pending'}>
                {session.status}
              </Badge>

              <Button
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>AI Chat</span>
              </Button>

              {session.status === 'pending' ? (
                <Button onClick={startCollection} className="flex items-center space-x-2">
                  <span>Start Collection</span>
                </Button>
              ) : session.status === 'collecting' ? (
                <Button variant="warning" onClick={pauseCollection}>
                  Pause Collection
                </Button>
              ) : null}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {completedSteps}/{totalSteps} steps completed</span>
              <span>{session.estimated_duration}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex-1 overflow-y-auto">
          <ProgressSteps steps={session.progress_steps as ProgressStep[]} />
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-30">
          <ChatInterface sessionId={sessionId} />
        </div>
      )}
    </div>
  )
}
