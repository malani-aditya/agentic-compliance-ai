import { clsx } from 'clsx'

interface BadgeProps {
  variant?: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected' | 'error' | 'cancelled'
  children: React.ReactNode
  className?: string
}

export default function Badge({ 
  variant = 'pending', 
  children, 
  className 
}: BadgeProps) {
  const variantClasses = {
    pending: 'status-pending',
    'in-progress': 'status-in-progress',
    completed: 'status-completed',
    approved: 'status-approved', 
    rejected: 'status-rejected',
    error: 'status-error',
    cancelled: 'status-cancelled'
  }

  return (
    <span className={clsx('status-badge', variantClasses[variant], className)}>
      {children}
    </span>
  )
}