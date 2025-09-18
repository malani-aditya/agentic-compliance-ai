import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { EvidenceValidation } from '@/types/app.types'

export interface ValidationRule {
  type: 'file_size' | 'file_type' | 'content_pattern' | 'metadata_required' | 'date_range'
  condition: any
  error_message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationContext {
  check_type: string
  framework: string
  expected_patterns?: string[]
  required_fields?: string[]
  size_limits?: {
    min_bytes?: number
    max_bytes?: number
  }
  allowed_types?: string[]
  date_constraints?: {
    not_older_than_days?: number
    must_be_recent?: boolean
  }
}

class EvidenceValidator {
  async validate(
    filePath: string, 
    validationRules: ValidationContext
  ): Promise<EvidenceValidation> {
    try {
      const validation: EvidenceValidation = {
        is_valid: true,
        validation_score: 1.0,
        issues: [],
        metadata_completeness: 1.0,
        content_analysis: {
          summary: '',
          key_findings: [],
          quality_score: 1.0
        }
      }

      // Get file stats and metadata
      const fileStats = await this.getFileMetadata(filePath)
      
      // Run all validation checks
      await this.validateFileSize(fileStats, validationRules, validation)
      await this.validateFileType(fileStats, validationRules, validation)
      await this.validateFileAge(fileStats, validationRules, validation)
      await this.validateFileContent(filePath, validationRules, validation)
      await this.validateMetadataCompleteness(fileStats, validationRules, validation)

      // Calculate overall validation score
      const errorCount = validation.issues.filter(issue => issue.type === 'error').length
      const warningCount = validation.issues.filter(issue => issue.type === 'warning').length
      
      validation.validation_score = Math.max(0, 1.0 - (errorCount * 0.3) - (warningCount * 0.1))
      validation.is_valid = errorCount === 0

      // Generate content analysis summary
      if (validation.content_analysis) {
        validation.content_analysis.summary = this.generateContentSummary(filePath, validationRules)
        validation.content_analysis.quality_score = validation.validation_score
      }

      return validation
    } catch (error) {
      console.error('Evidence validation error:', error)
      
      return {
        is_valid: false,
        validation_score: 0,
        issues: [{
          type: 'error',
          message: `Validation failed: ${error.message}`,
          suggestion: 'Please check if the file is accessible and not corrupted'
        }],
        metadata_completeness: 0
      }
    }
  }

  private async getFileMetadata(filePath: string) {
    try {
      const stats = await fs.stat(filePath)
      const fileName = filePath.split('/').pop() || ''
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        name: fileName,
        extension: fileExtension,
        path: filePath
      }
    } catch (error) {
      throw new Error(`Cannot access file: ${error.message}`)
    }
  }

  private async validateFileSize(
    fileStats: any, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    if (rules.size_limits) {
      if (rules.size_limits.min_bytes && fileStats.size < rules.size_limits.min_bytes) {
        validation.issues.push({
          type: 'warning',
          message: `File size ${this.formatFileSize(fileStats.size)} is smaller than expected minimum ${this.formatFileSize(rules.size_limits.min_bytes)}`,
          field: 'file_size',
          suggestion: 'Verify this file contains all required evidence data'
        })
      }

      if (rules.size_limits.max_bytes && fileStats.size > rules.size_limits.max_bytes) {
        validation.issues.push({
          type: 'error',
          message: `File size ${this.formatFileSize(fileStats.size)} exceeds maximum allowed ${this.formatFileSize(rules.size_limits.max_bytes)}`,
          field: 'file_size',
          suggestion: 'Consider compressing the file or splitting into multiple files'
        })
      }
    }

    // Check for suspiciously small files
    if (fileStats.size < 100) {
      validation.issues.push({
        type: 'warning',
        message: 'File appears to be very small and may be empty or incomplete',
        field: 'file_size',
        suggestion: 'Verify file contains actual evidence data'
      })
    }
  }

  private async validateFileType(
    fileStats: any, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    if (rules.allowed_types && rules.allowed_types.length > 0) {
      const isAllowedType = rules.allowed_types.some(type => 
        fileStats.extension === type.replace('.', '').toLowerCase()
      )

      if (!isAllowedType) {
        validation.issues.push({
          type: 'error',
          message: `File type '.${fileStats.extension}' is not allowed. Expected: ${rules.allowed_types.join(', ')}`,
          field: 'file_type',
          suggestion: 'Convert file to an approved format'
        })
      }
    }

    // Check for common evidence file types
    const commonEvidenceTypes = ['pdf', 'xlsx', 'docx', 'txt', 'csv', 'png', 'jpg']
    if (!commonEvidenceTypes.includes(fileStats.extension)) {
      validation.issues.push({
        type: 'info',
        message: `File type '.${fileStats.extension}' is uncommon for compliance evidence`,
        field: 'file_type',
        suggestion: 'Consider if this file type is appropriate for the evidence requirement'
      })
    }
  }

  private async validateFileAge(
    fileStats: any, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    if (rules.date_constraints) {
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - fileStats.modified.getTime()) / (1000 * 60 * 60 * 24))

      if (rules.date_constraints.not_older_than_days && daysDiff > rules.date_constraints.not_older_than_days) {
        validation.issues.push({
          type: 'warning',
          message: `File is ${daysDiff} days old, which may be too old for current compliance period`,
          field: 'file_age',
          suggestion: 'Verify this evidence is still current and relevant'
        })
      }

      if (rules.date_constraints.must_be_recent && daysDiff > 30) {
        validation.issues.push({
          type: 'error',
          message: `File must be recent but is ${daysDiff} days old`,
          field: 'file_age',
          suggestion: 'Obtain more recent evidence or justify the use of older evidence'
        })
      }
    }
  }

  private async validateFileContent(
    filePath: string, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    try {
      // Read file content for pattern matching
      const content = await this.extractTextContent(filePath)
      
      if (rules.expected_patterns && rules.expected_patterns.length > 0) {
        const foundPatterns = []
        const missingPatterns = []

        for (const pattern of rules.expected_patterns) {
          const regex = new RegExp(pattern, 'i')
          if (regex.test(content)) {
            foundPatterns.push(pattern)
          } else {
            missingPatterns.push(pattern)
          }
        }

        if (missingPatterns.length > 0) {
          validation.issues.push({
            type: 'warning',
            message: `Missing expected content patterns: ${missingPatterns.join(', ')}`,
            field: 'content',
            suggestion: 'Verify the file contains all required information sections'
          })
        }

        // Store found patterns for analysis
        if (validation.content_analysis) {
          validation.content_analysis.key_findings = foundPatterns
        }
      }

      // Check for common compliance keywords based on framework
      await this.validateFrameworkSpecificContent(content, rules, validation)

    } catch (error) {
      validation.issues.push({
        type: 'warning',
        message: `Could not analyze file content: ${error.message}`,
        field: 'content',
        suggestion: 'Manual review may be required'
      })
    }
  }

  private async validateFrameworkSpecificContent(
    content: string, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    const frameworkKeywords = {
      'SOC 2': ['access control', 'user access', 'logical access', 'security', 'audit', 'controls'],
      'GDPR': ['personal data', 'data subject', 'processing', 'consent', 'privacy'],
      'ISO 27001': ['information security', 'risk management', 'security policy', 'controls'],
      'HIPAA': ['protected health information', 'PHI', 'healthcare', 'medical records'],
      'PCI DSS': ['cardholder data', 'payment', 'credit card', 'PAN']
    }

    const keywords = frameworkKeywords[rules.framework as keyof typeof frameworkKeywords] || []
    let foundKeywords = 0

    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        foundKeywords++
      }
    }

    const keywordScore = keywords.length > 0 ? foundKeywords / keywords.length : 1
    
    if (keywordScore < 0.3) {
      validation.issues.push({
        type: 'warning',
        message: `Content may not be relevant to ${rules.framework} framework`,
        field: 'content_relevance',
        suggestion: `Verify file contains ${rules.framework}-specific information`
      })
    }
  }

  private async validateMetadataCompleteness(
    fileStats: any, 
    rules: ValidationContext, 
    validation: EvidenceValidation
  ) {
    let completenessScore = 1.0
    const requiredMetadata = ['name', 'size', 'modified']

    // Check if file has descriptive name
    if (fileStats.name.length < 5 || /^(file|document|untitled)/i.test(fileStats.name)) {
      validation.issues.push({
        type: 'info',
        message: 'File has generic or short name, consider using more descriptive filename',
        field: 'filename',
        suggestion: 'Rename file to clearly indicate its purpose and content'
      })
      completenessScore -= 0.1
    }

    // Check if file name contains relevant compliance keywords
    const hasRelevantName = rules.check_type && 
      fileStats.name.toLowerCase().includes(rules.check_type.toLowerCase().replace(/\s+/g, '_'))

    if (!hasRelevantName) {
      validation.issues.push({
        type: 'info',
        message: 'Filename does not clearly indicate compliance check type',
        field: 'filename',
        suggestion: 'Consider including check type or compliance area in filename'
      })
      completenessScore -= 0.05
    }

    validation.metadata_completeness = Math.max(0, completenessScore)
  }

  private async extractTextContent(filePath: string): Promise<string> {
    const fileStats = await this.getFileMetadata(filePath)
    
    try {
      switch (fileStats.extension) {
        case 'txt':
        case 'csv':
          return await fs.readFile(filePath, 'utf-8')
        
        case 'pdf':
          // For PDF files, we'd normally use a PDF parser
          // For now, return the filename as content indicator
          return fileStats.name
        
        case 'xlsx':
        case 'xls':
        case 'docx':
          // For Office files, we'd normally use appropriate parsers
          // For now, return the filename as content indicator
          return fileStats.name
        
        default:
          // For other file types, try to read as text
          try {
            const content = await fs.readFile(filePath, 'utf-8')
            return content.slice(0, 10000) // Limit content size
          } catch {
            return fileStats.name
          }
      }
    } catch (error) {
      throw new Error(`Cannot read file content: ${error.message}`)
    }
  }

  private generateContentSummary(filePath: string, rules: ValidationContext): string {
    const fileName = filePath.split('/').pop() || ''
    const checkType = rules.check_type || 'compliance'
    const framework = rules.framework || 'general'
    
    return `Evidence file "${fileName}" collected for ${checkType} under ${framework} framework. File appears to contain relevant compliance documentation.`
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Utility method for calculating file hash
  async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath)
      return createHash('sha256').update(fileBuffer).digest('hex')
    } catch (error) {
      throw new Error(`Cannot calculate file hash: ${error.message}`)
    }
  }

  // Method to get validation rules based on compliance check
  getDefaultValidationRules(checkType: string, framework: string): ValidationContext {
    const commonRules: ValidationContext = {
      check_type: checkType,
      framework: framework,
      size_limits: {
        min_bytes: 100,
        max_bytes: 50 * 1024 * 1024 // 50MB
      },
      allowed_types: ['pdf', 'xlsx', 'docx', 'txt', 'csv', 'png', 'jpg'],
      date_constraints: {
        not_older_than_days: 90
      }
    }

    // Framework-specific rules
    switch (framework.toLowerCase()) {
      case 'soc 2':
        return {
          ...commonRules,
          expected_patterns: ['access.*control', 'user.*access', 'security.*policy', 'audit.*log'],
          required_fields: ['date', 'user', 'action']
        }
      
      case 'gdpr':
        return {
          ...commonRules,
          expected_patterns: ['personal.*data', 'data.*subject', 'consent', 'processing.*activity'],
          date_constraints: { not_older_than_days: 30 }
        }
      
      case 'iso 27001':
        return {
          ...commonRules,
          expected_patterns: ['information.*security', 'risk.*assessment', 'security.*control']
        }
      
      default:
        return commonRules
    }
  }
}

// Export singleton instance
export const evidenceValidator = new EvidenceValidator()
export default evidenceValidator