import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, UserIcon, CpuChipIcon } from '@heroicons/react/20/solid'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  message: string
  timestamp: string
}

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        sender: 'ai',
        message: 'Hello! I\'m your AI evidence collection assistant. I\'ll help you collect compliance evidence and you can modify my approach at any time. How can I assist you?',
        timestamp: new Date().toISOString()
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: getAIResponse(inputValue),
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes('folder') || input.includes('path')) {
      return 'I\'ll update the collection path. Which specific folder should I look in instead? I can search Google Drive, OneDrive, or local network shares.'
    }

    if (input.includes('stop') || input.includes('pause')) {
      return 'I\'ve paused the current evidence collection. You can resume anytime or modify the approach. What would you like to change?'
    }

    if (input.includes('help') || input.includes('what can')) {
      return 'I can help you with:\n\n• Modifying evidence collection steps\n• Changing search locations and patterns\n• Updating file filtering criteria\n• Explaining what I\'m doing and why\n• Pausing or adjusting the collection process\n\nJust tell me what you\'d like to change!'
    }

    if (input.includes('why') || input.includes('explain')) {
      return 'I\'m collecting evidence based on the compliance check requirements and learned patterns. For this check, I\'m looking for recent files that match the expected naming conventions and contain the required data elements. Would you like me to adjust my search criteria?'
    }

    return 'I understand. Let me adjust my approach accordingly. I\'ll update my collection strategy and continue with the modified parameters. You can always ask me to explain what I\'m doing or make further changes.'
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    'Change the search folder',
    'Explain what you\'re doing',
    'Pause collection',
    'Skip this step'
  ]

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
        <p className="text-sm text-gray-500">Modify collection steps in real-time</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                {message.sender === 'user' ? (
                  <UserIcon className="h-4 w-4 text-white" />
                ) : (
                  <CpuChipIcon className="h-4 w-4 text-gray-600" />
                )}
              </div>

              <div className={`rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm whitespace-pre-line">{message.message}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <CpuChipIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-2">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setInputValue(action)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
