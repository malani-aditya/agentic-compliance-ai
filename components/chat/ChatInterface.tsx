'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/20/solid'
import { ChatMessage as ChatMessageType } from '@/types/app.types'
import ChatMessage from './ChatMessage'
import QuickActions from './QuickActions'
import Button from '@/components/ui/Button'

interface ChatInterfaceProps {
  sessionId: string
  onClose?: () => void
}

export default function ChatInterface({ sessionId, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history for the session
    loadChatHistory()
  }, [sessionId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockMessages: ChatMessageType[] = [
        {
          id: '1',
          role: 'system',
          content: "Welcome! I'm your AI compliance assistant. I can help modify collection steps, explain my actions, and answer questions about the evidence collection process.",
          timestamp: '2025-09-18T12:00:00Z'
        },
        {
          id: '2',
          role: 'assistant',
          content: "I've started collecting evidence for your SOC 2 compliance checks. Currently scanning the Google Drive folders for access control documents.",
          timestamp: '2025-09-18T12:01:00Z',
          metadata: {
            thinking: 'User has 3 compliance checks selected. Starting with access control as it has highest priority.',
            session_id: sessionId
          }
        }
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const aiResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date().toISOString(),
        metadata: {
          thinking: 'Analyzing user request and adjusting collection strategy accordingly.',
          session_id: sessionId
        }
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes('stop') || input.includes('pause')) {
      return "I'll pause the current collection step. You can resume it anytime from the interface. Is there anything specific you'd like me to modify before we continue?"
    }

    if (input.includes('backup') || input.includes('alternative')) {
      return "I'll check the backup folders for evidence. I've learned that backup locations often contain the files we need when primary folders are empty. Updating my search strategy now."
    }

    if (input.includes('explain') || input.includes('why')) {
      return "I'm currently scanning Google Drive folders based on the collection requirements for your SOC 2 checks. I prioritize locations where I've successfully found evidence before, and I use file patterns that match your compliance framework requirements."
    }

    if (input.includes('faster') || input.includes('speed')) {
      return "I can optimize the collection by running parallel searches across multiple folders and focusing on the most likely file locations first. Would you like me to enable aggressive collection mode?"
    }

    return "I understand your request. I'll adjust my approach accordingly and remember this preference for future collections. Is there anything else you'd like me to modify in the current process?"
  }

  const handleQuickAction = (action: string) => {
    sendMessage(action)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">AI Assistant</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span>AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200">
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to modify steps, explain actions, or help with evidence collection..."
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="self-end"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
