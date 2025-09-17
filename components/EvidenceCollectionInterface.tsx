import { useState, useEffect } from 'react'
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
