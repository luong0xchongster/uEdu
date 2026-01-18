import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: 'Total Students', value: '150', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Teachers', value: '12', icon: GraduationCap, color: 'bg-green-500' },
    { name: 'Active Courses', value: '8', icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Enrollment Rate', value: '+15%', icon: TrendingUp, color: 'bg-orange-500' },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header title="Dashboard" />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Student {i}</p>
                      <p className="text-sm text-gray-500">English Level {i}</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Grammar Lesson {i}</p>
                      <p className="text-sm text-gray-500">10:00 AM - 11:00 AM</p>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Today</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
