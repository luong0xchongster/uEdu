'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Search, BookOpen, Users, DollarSign } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Course {
  id: number
  name: string
  description: string
  level: string
  teacher_id: number
  capacity: number
  price: number
  start_date: string
  end_date: string
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/api/courses`),
        axios.get(`${API_URL}/api/teachers`),
      ])
      setCourses(coursesRes.data)
      setTeachers(teachersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Not assigned'
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnroll = (courseId: number) => {
    alert(`Enrolled in course ${courseId}!`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-600 mt-1">Explore and enroll in courses</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No courses found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="mb-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen size={16} />
                      <span>{getTeacherName(course.teacher_id)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} />
                      <span>{course.capacity} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span>${course.price}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Start: {new Date(course.start_date).toLocaleDateString()}</p>
                    <p>End: {new Date(course.end_date).toLocaleDateString()}</p>
                  </div>

                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
