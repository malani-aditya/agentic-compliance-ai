'use client'

import { useState } from 'react'
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { ProviderType } from '@/types/app.types'

const providers = [
  { id: 'kimi', name: 'Kimi (Moonshot)', type: 'free', color: 'bg-blue-500' },
  { id: 'openai', name: 'OpenAI GPT-4', type: 'paid', color: 'bg-green-500' },
  { id: 'anthropic', name: 'Anthropic Claude', type: 'paid', color: 'bg-purple-500' },
  { id: 'google', name: 'Google Gemini', type: 'paid', color: 'bg-red-500' },
  { id: 'groq', name: 'Groq Llama', type: 'paid', color: 'bg-orange-500' },
  { id: 'deepseek', name: 'DeepSeek', type: 'free', color: 'bg-indigo-500' }
]

export default function Header() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('kimi')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentProvider = providers.find(p => p.id === selectedProvider)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Agentic Compliance
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered evidence collection
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Provider Selector and User */}
          <div className="flex items-center space-x-6">
            {/* LLM Provider Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Provider
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${currentProvider?.color}`} />
                  <span>{currentProvider?.name}</span>
                  {currentProvider?.type === 'free' && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      {providers.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => {
                            setSelectedProvider(provider.id as ProviderType)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                            selectedProvider === provider.id 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                          <div className="flex-1">
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-xs text-gray-500">
                              {provider.type === 'free' ? 'Free tier' : 'Paid API'}
                            </div>
                          </div>
                          {provider.type === 'free' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Free
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Compliance Manager</p>
              </div>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}