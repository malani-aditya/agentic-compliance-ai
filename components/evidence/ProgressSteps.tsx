'use client'

import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ProgressStep } from '@/types/app.types'

interface ProgressStepsProps {
  steps: ProgressStep[]
}

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <MagnifyingGlassIcon className="w-6 h-6 text-blue-500 animate-pulse" />
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
      case 'waiting_input':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepClasses = (status: string) => {
    const baseClasses = "progress-step"
    switch (status) {
      case 'completed':
        return `${baseClasses} completed`
      case 'in_progress':
        return `${baseClasses} in-progress`
      case 'error':
        return `${baseClasses} error`
      case 'waiting_input':
        return `${baseClasses} waiting-input`
      default:
        return baseClasses
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start</h3>
        <p className="text-gray-500">Click "Start Collection" to begin evidence collection</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.includes(step.id)
          const hasDetails = step.details || step.sub_steps?.length

          return (
            <div 
              key={step.id}
              className={getStepClasses(step.status)}
            >
              <div className="flex items-start space-x-4">
                {/* Step Icon */}
                <div className="flex-shrink-0 pt-1">
                  {getStepIcon(step.status)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => hasDetails && toggleStep(step.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-base font-medium text-gray-900">
                          Step {step.step}: {step.title}
                        </h4>
                        {hasDetails && (
                          <button className="p-1 hover:bg-gray-100 rounded">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>

                      {step.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {step.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-700 mt-2">
                        {step.message}
                      </p>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">
                        {formatTime(step.timestamp)}
                      </p>
                      {step.estimated_time && (
                        <p className="text-xs text-gray-400">
                          ~{step.estimated_time}s
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      {step.details && (
                        <div className="bg-gray-50 rounded-md p-3 mb-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Details:</h5>
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {step.details}
                          </pre>
                        </div>
                      )}

                      {step.sub_steps && step.sub_steps.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-900">Sub-steps:</h5>
                          {step.sub_steps.map((subStep, subIndex) => (
                            <div key={subStep.id} className="flex items-center space-x-2 text-sm">
                              {getStepIcon(subStep.status)}
                              <span className="text-gray-700">
                                {subStep.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress indicator for in-progress steps */}
                  {step.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
