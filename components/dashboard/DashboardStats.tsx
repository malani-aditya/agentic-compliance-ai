'use client'

import { useEffect, useState } from 'react'
import { ChartBarIcon, CheckCircleIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

interface StatsData {
  totalChecks: number
  automatedChecks: number
  pendingApprovals: number
  activeTeams: number
  successRate: number
  avgCollectionTime: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalChecks: 0,
    automatedChecks: 0,
    pendingApprovals: 0,
    activeTeams: 0,
    successRate: 0,
    avgCollectionTime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchStats = async () => {
      try {
        // Simulated data - replace with real API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalChecks: 47,
          automatedChecks: 34,
          pendingApprovals: 8,
          activeTeams: 6,
          successRate: 94.2,
          avgCollectionTime: 4.5
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { 
      name: 'Total Checks', 
      value: stats.totalChecks.toString(), 
      change: '+12%',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'blue'
    },
    { 
      name: 'Automated', 
      value: `${stats.automatedChecks}/${stats.totalChecks}`,
      change: `${Math.round((stats.automatedChecks / stats.totalChecks) * 100)}%`,
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'green'
    },
    { 
      name: 'Pending Approvals', 
      value: stats.pendingApprovals.toString(),
      change: '-23%',
      changeType: 'positive', 
      icon: ClockIcon,
      color: 'yellow'
    },
    { 
      name: 'Active Teams', 
      value: stats.activeTeams.toString(),
      change: '+2',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'purple'
    }
  ]

  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-body">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div key={stat.name} className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${colorMap[stat.color as keyof typeof colorMap]}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* AI Performance Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 lg:col-span-2">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-900">
                AI Performance
              </h3>
              <p className="text-sm text-primary-700">
                Current session metrics
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-900">
                {stats.successRate}%
              </div>
              <div className="text-sm text-primary-600">
                Success Rate
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-primary-600">Avg Collection Time</p>
              <p className="text-lg font-semibold text-primary-900">
                {stats.avgCollectionTime} min
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-600">Memory Patterns</p>
              <p className="text-lg font-semibold text-primary-900">
                127 learned
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}