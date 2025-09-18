'use client'

import { useState } from 'react'
import { 
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/20/solid'
import { ChatMessage as ChatMessageType } from '@/types/app.types'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [showThinking, setShowThinking] = useState(false)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageClasses = () => {
    switch (message.role) {
      case 'user':
        return 'chat-message user'
      case 'assistant':
        return 'chat-message assistant'
      case 'system':
        return 'chat-message'
      default:
        return 'chat-message'
    }
  }

  const getBubbleClasses = () => {
    switch (message.role) {
      case 'user':
        return 'chat-bubble user'
      case 'assistant':
        return 'chat-bubble assistant'
      case 'system':
        return 'chat-bubble system'
      default:
        return 'chat-bubble assistant'
    }
  }

  const getAvatar = () => {
    switch (message.role) {
      case 'user':
        return (
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-5 h-5 text-white" />
          </div>
        )
      case 'assistant':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
        )
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">SYS</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={getMessageClasses()}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {getAvatar()}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-1">
        <div className={getBubbleClasses()}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-400 px-3">
          {formatTime(message.timestamp)}
        </p>

        {/* AI Thinking Process (for assistant messages) */}
        {message.role === 'assistant' && message.metadata?.thinking && (
          <div className="px-3">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showThinking ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
              <span>Show AI reasoning</span>
            </button>

            {showThinking && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-purple-200">
                <span className="font-medium text-purple-700">AI Thinking:</span>
                <p className="mt-1">{message.metadata.thinking}</p>
              </div>
            )}
          </div>
        )}

        {/* Function Calls (if any) */}
        {message.metadata?.function_calls && message.metadata.function_calls.length > 0 && (
          <div className="px-3">
            <div className="text-xs text-blue-600 bg-blue-50 rounded p-2 border-l-2 border-blue-200">
              <span className="font-medium">Tool Used:</span>
              <ul className="mt-1 space-y-1">
                {message.metadata.function_calls.map((call: any, index: number) => (
                  <li key={index}>
                    • {call.name}({Object.keys(call.parameters || {}).join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
