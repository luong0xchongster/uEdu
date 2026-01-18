'use client'

import Navbar from '@/components/Navbar'
import { Calendar, Clock, MapPin } from 'lucide-react'

export default function Schedule() {
  const schedule = [
    {
      id: 1,
      course: 'English Grammar Intermediate',
      time: '10:00 AM - 11:00 AM',
      date: 'Monday, January 20',
      room: 'Room 101',
      teacher: 'Jane Smith',
      status: 'upcoming',
    },
    {
      id: 2,
      course: 'Conversation Practice',
      time: '2:00 PM - 3:00 PM',
      date: 'Monday, January 20',
      room: 'Room 205',
      teacher: 'John Johnson',
      status: 'upcoming',
    },
    {
      id: 3,
      course: 'Reading Comprehension',
      time: '9:00 AM - 10:00 AM',
      date: 'Tuesday, January 21',
      room: 'Room 103',
      teacher: 'Emily Davis',
      status: 'upcoming',
    },
    {
      id: 4,
      course: 'Writing Skills',
      time: '11:00 AM - 12:00 PM',
      date: 'Wednesday, January 22',
      room: 'Room 102',
      teacher: 'Michael Brown',
      status: 'upcoming',
    },
    {
      id: 5,
      course: 'Listening Comprehension',
      time: '3:00 PM - 4:00 PM',
      date: 'Thursday, January 23',
      room: 'Room 201',
      teacher: 'Sarah Wilson',
      status: 'upcoming',
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600 mt-1">View your upcoming classes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={20} />
              <span className="font-medium">January 2026</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {schedule.map((classItem) => (
              <div key={classItem.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{classItem.course}</h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{classItem.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{classItem.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{classItem.room}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Teacher: {classItem.teacher}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {classItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
