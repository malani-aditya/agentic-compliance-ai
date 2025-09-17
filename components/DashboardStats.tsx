import { useEffect, useState } from 'react'

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalChecks: 0,
    automatedChecks: 0,
    pendingApprovals: 0,
    activeTeams: 0
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalChecks: 25,
      automatedChecks: 18,
      pendingApprovals: 7,
      activeTeams: 4
    })
  }, [])

  const statCards = [
    { 
      name: 'Total Checks', 
      value: stats.totalChecks, 
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Automated Checks', 
      value: stats.automatedChecks,
      color: 'bg-green-500',
      textColor: 'text-green-700', 
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Pending Approvals', 
      value: stats.pendingApprovals,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    { 
      name: 'Active Teams', 
      value: stats.activeTeams,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div key={stat.name} className={`${stat.bgColor} overflow-hidden rounded-lg px-4 py-5 shadow`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${stat.color} rounded-md`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                <dd className={`text-lg font-medium ${stat.textColor}`}>{stat.value}</dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
