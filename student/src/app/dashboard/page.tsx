import Navbar from '@/components/Navbar'
import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react'

export default function Home() {
  const stats = [
    { name: 'Enrolled Courses', value: '3', icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Classes Attended', value: '24', icon: Users, color: 'bg-green-500' },
    { name: 'Progress', value: '85%', icon: TrendingUp, color: 'bg-purple-500' },
    { name: 'Study Hours', value: '48h', icon: Clock, color: 'bg-orange-500' },
  ]

  const upcomingClasses = [
    { id: 1, course: 'English Grammar Intermediate', time: '10:00 AM', date: 'Today', room: 'Room 101' },
    { id: 2, course: 'Conversation Practice', time: '2:00 PM', date: 'Today', room: 'Room 205' },
    { id: 3, course: 'Reading Comprehension', time: '9:00 AM', date: 'Tomorrow', room: 'Room 103' },
  ]

  const recentCourses = [
    { id: 1, name: 'English Grammar Intermediate', level: 'Intermediate', progress: 75 },
    { id: 2, name: 'Speaking and Listening', level: 'Advanced', progress: 60 },
    { id: 3, name: 'Academic Writing', level: 'Advanced', progress: 45 },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600 mt-1">Track your progress and stay updated with your classes</p>
        </div>

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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{classItem.course}</p>
                    <p className="text-sm text-gray-500">{classItem.time} • {classItem.room}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {classItem.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <span className="text-sm text-gray-500">{course.level}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
