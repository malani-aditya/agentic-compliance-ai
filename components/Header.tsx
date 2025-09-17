import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const providers = [
  { id: 'openai', name: 'OpenAI GPT-4', type: 'paid' },
  { id: 'anthropic', name: 'Anthropic Claude', type: 'paid' },
  { id: 'groq', name: 'Groq Llama', type: 'paid' },
  { id: 'ollama', name: 'Ollama (Local)', type: 'free' }
]

export default function Header() {
  const [selectedProvider, setSelectedProvider] = useState('openai')

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Compliance Hub</h1>
            <p className="text-sm text-gray-500">AI-powered evidence collection</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                LLM Provider:
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="block w-48 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} {provider.type === 'free' && '(Free)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-900">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
