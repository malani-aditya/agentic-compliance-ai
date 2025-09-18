'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  DocumentIcon,
  ClockIcon
} from '@heroicons/react/20/solid'
import { EvidenceItem } from '@/types/app.types'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

export default function EvidenceReview() {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvidenceItems()
  }, [])

  const fetchEvidenceItems = async () => {
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockItems: EvidenceItem[] = [
        {
          id: '1',
          session_id: 'session1',
          check_id: 'check1',
          evidence_type: 'file',
          source_system: 'google_drive',
          source_path: '/Compliance/SOC2/Access Control/AD_User_Report_Q3_2025.xlsx',
          original_filename: 'AD_User_Report_Q3_2025.xlsx',
          stored_filename: 'evidence_1_ad_user_report.xlsx',
          file_size: 2547892,
          file_hash: 'sha256_hash_here',
          mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          storage_path: '/evidence/session1/ad_user_report.xlsx',
          metadata: {
            lastModified: '2025-09-15T10:30:00Z',
            owner: 'jane.doe@company.com'
          },
          content_preview: 'User access report containing 1,247 active users with role assignments and last login dates',
          ai_analysis: {
            summary: 'Complete access control evidence with all required data points',
            completeness_score: 0.95,
            issues: []
          },
          collection_context: {},
          validation_status: 'valid',
          validation_details: {},
          validation_errors: [],
          review_status: 'pending',
          review_notes: null,
          reviewer_id: null,
          review_history: [],
          slack_message_ts: null,
          slack_channel_id: null,
          sprinto_submission_id: null,
          sprinto_status: null,
          tags: ['soc2', 'access-control'],
          is_sensitive: true,
          retention_policy: {},
          created_at: '2025-09-18T10:00:00Z',
          collected_at: '2025-09-18T10:00:00Z',
          reviewed_at: null,
          approved_at: null,
          submitted_at: null
        },
        {
          id: '2',
          session_id: 'session1',
          check_id: 'check2',
          evidence_type: 'file',
          source_system: 'google_drive',
          source_path: '/Compliance/Backup/Backup_Log_Sept_2025.txt',
          original_filename: 'Backup_Log_Sept_2025.txt',
          stored_filename: 'evidence_2_backup_log.txt',
          file_size: 45670,
          file_hash: 'sha256_hash_here2',
          mime_type: 'text/plain',
          storage_path: '/evidence/session1/backup_log.txt',
          metadata: {
            lastModified: '2025-09-17T23:59:00Z',
            owner: 'system@company.com'
          },
          content_preview: 'Daily backup log showing successful completion of all critical systems',
          ai_analysis: {
            summary: 'Backup verification evidence shows 99.8% success rate',
            completeness_score: 0.92,
            issues: ['Missing verification for weekend backups']
          },
          collection_context: {},
          validation_status: 'valid',
          validation_details: {},
          validation_errors: [],
          review_status: 'approved',
          review_notes: 'Evidence meets all requirements for backup verification',
          reviewer_id: 'reviewer1',
          review_history: [],
          slack_message_ts: null,
          slack_channel_id: null,
          sprinto_submission_id: null,
          sprinto_status: null,
          tags: ['backup', 'verification'],
          is_sensitive: false,
          retention_policy: {},
          created_at: '2025-09-18T10:05:00Z',
          collected_at: '2025-09-18T10:05:00Z',
          reviewed_at: '2025-09-18T11:00:00Z',
          approved_at: '2025-09-18T11:00:00Z',
          submitted_at: null
        }
      ]

      setEvidenceItems(mockItems)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch evidence items:', error)
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      console.log('Approving evidence item:', itemId)
      // Simulate API call
      setEvidenceItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, review_status: 'approved', approved_at: new Date().toISOString() }
            : item
        )
      )
    } catch (error) {
      console.error('Failed to approve evidence:', error)
    }
  }

  const handleReject = async (itemId: string, notes: string) => {
    try {
      console.log('Rejecting evidence item:', itemId, 'Notes:', notes)
      // Simulate API call
      setEvidenceItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                review_status: 'rejected', 
                review_notes: notes,
                reviewed_at: new Date().toISOString() 
              }
            : item
        )
      )
    } catch (error) {
      console.error('Failed to reject evidence:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      'pending': 'pending',
      'approved': 'approved', 
      'rejected': 'rejected',
      'collected': 'in-progress'
    }
    return statusMap[status] || 'pending'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Evidence Review</h2>
        <div className="text-sm text-gray-500">
          {evidenceItems.filter(item => item.review_status === 'pending').length} pending review
        </div>
      </div>

      <div className="space-y-4">
        {evidenceItems.map((item) => (
          <div key={item.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <DocumentIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">
                      {item.original_filename}
                    </h3>
                    <Badge variant={getStatusBadge(item.review_status)}>
                      {item.review_status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {item.content_preview}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(item.file_size || 0)}</span>
                    <span>{item.source_system}</span>
                    <span>{new Date(item.collected_at).toLocaleDateString()}</span>
                  </div>

                  {item.ai_analysis && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900">AI Analysis</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        {(item.ai_analysis as any).summary}
                      </p>
                      {(item.ai_analysis as any).issues?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-700">Issues found:</p>
                          <ul className="text-xs text-blue-700 list-disc list-inside">
                            {(item.ai_analysis as any).issues.map((issue: string, i: number) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item)
                      setShowModal(true)
                    }}
                    className="flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Preview</span>
                  </Button>

                  {item.review_status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item.id, 'Requires revision')}
                        className="flex items-center space-x-1"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  )}

                  {item.review_status === 'approved' && (
                    <div className="text-xs text-green-600 text-center">
                      <CheckCircleIcon className="w-4 h-4 mx-auto" />
                      Approved
                    </div>
                  )}

                  {item.review_status === 'rejected' && (
                    <div className="text-xs text-red-600 text-center">
                      <XCircleIcon className="w-4 h-4 mx-auto" />
                      Rejected
                    </div>
                  )}
                </div>
              </div>

              {item.review_notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Review Notes</h4>
                  <p className="text-sm text-gray-700 mt-1">{item.review_notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Evidence Preview"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Filename</dt>
                  <dd className="text-gray-900">{selectedItem.original_filename}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="text-gray-900">{formatFileSize(selectedItem.file_size || 0)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="text-gray-900">{selectedItem.source_system}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Collected</dt>
                  <dd className="text-gray-900">
                    {new Date(selectedItem.collected_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {selectedItem.content_preview}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="primary"
                onClick={() => console.log('Download:', selectedItem.id)}
              >
                Download File
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
