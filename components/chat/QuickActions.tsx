'use client'

import { 
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const quickActions = [
    {
      id: 'pause',
      label: 'Pause Collection',
      icon: PauseIcon,
      action: 'Please pause the current collection step',
      variant: 'secondary' as const,
      color: 'text-yellow-600'
    },
    {
      id: 'explain',
      label: 'Explain Current Step',
      icon: QuestionMarkCircleIcon,
      action: 'Can you explain what you're doing in the current step?',
      variant: 'secondary' as const,
      color: 'text-blue-600'
    },
    {
      id: 'backup',
      label: 'Check Backup Folders',
      icon: ArrowPathIcon,
      action: 'Please check backup folders if you can't find the files',
      variant: 'secondary' as const,
      color: 'text-green-600'
    },
    {
      id: 'optimize',
      label: 'Speed Up Collection',
      icon: LightBulbIcon,
      action: 'Can you make the evidence collection faster?',
      variant: 'secondary' as const,
      color: 'text-purple-600'
    },
    {
      id: 'help',
      label: 'Help & Tips',
      icon: QuestionMarkCircleIcon,
      action: 'What can I do to improve the evidence collection process?',
      variant: 'ghost' as const,
      color: 'text-gray-600'
    },
    {
      id: 'issues',
      label: 'Report Issue',
      icon: ExclamationTriangleIcon,
      action: 'I'm seeing an issue with the current collection step',
      variant: 'ghost' as const,
      color: 'text-red-600'
    }
  ]

  const commonQuestions = [
    'Why is this step taking so long?',
    'Can you search in different folders?',
    'How do you decide which files to collect?',
    'Can I modify the file patterns you're looking for?',
    'What happens if you can't find the evidence?'
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Quick Action Buttons */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.slice(0, 4).map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              onClick={() => onAction(action.action)}
              className="flex items-center space-x-2 text-xs justify-start"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">More Options</h4>
        <div className="space-y-1">
          {quickActions.slice(4).map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              onClick={() => onAction(action.action)}
              className="flex items-center space-x-2 text-xs w-full justify-start"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Common Questions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Common Questions</h4>
        <div className="space-y-1">
          {commonQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => onAction(question)}
              className="block w-full text-left text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Collection Tips */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <LightBulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-blue-900">Pro Tip</h5>
            <p className="text-xs text-blue-700 mt-1">
              I learn from every collection. If I can't find something, tell me where it usually is and I'll remember for next time!
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-green-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-700 font-medium">
            AI Agent Active
          </span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Ready to assist with evidence collection
        </p>
      </div>
    </div>
  )
}
