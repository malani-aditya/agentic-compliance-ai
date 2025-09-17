# Create the missing directory structure and session page
import os

# Create the sessions directory structure
os.makedirs('app/(dashboard)/sessions/[id]', exist_ok=True)

# Evidence session page
session_page = '''import { Suspense } from 'react'
import EvidenceCollectionInterface from '@/components/EvidenceCollectionInterface'
import ChatInterface from '@/components/ChatInterface'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <EvidenceCollectionInterface sessionId={params.id} />
          </Suspense>
        </div>
        <div className="w-96 border-l border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <ChatInterface sessionId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
'''

with open('app/(dashboard)/sessions/[id]/page.tsx', 'w') as f:
    f.write(session_page)

print("✅ Created session page:")
print("  - app/(dashboard)/sessions/[id]/page.tsx")