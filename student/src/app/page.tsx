'use client'

import { useState, useEffect } from 'react'
import { Clock, BookOpen, CheckCircle, Award, Play } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Exam {
  id: number
  title: string
  description: string
  exam_type: string
  duration: number
  passing_score: number
  start_date: string
  end_date: string
}

interface ExamResult {
  id: number
  exam_id: number
  exam_title: string
  score: number
  total_points: number
  status: string
  completed_at: string
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available')
  const [exams, setExams] = useState<Exam[]>([])
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/exams`),
        axios.get(`${API_URL}/api/v1/exam-results?student_id=1`),
      ])
      setExams(examsRes.data)
      setExamResults(resultsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExamTypeBadge = (type: string) => {
    const colors = {
      'pre_registration': 'bg-purple-100 text-purple-800',
      'progress': 'bg-blue-100 text-blue-800',
      'final': 'bg-green-100 text-green-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleStartExam = (exam: Exam) => {
    window.location.href = `/exam/${exam.id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">uEdu</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Intermediate Level</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600 mt-1">Continue your English learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exams Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {examResults.filter(r => r.status === 'passed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {examResults.length > 0 
                    ? Math.round(examResults.reduce((acc, r) => acc + r.score, 0) / examResults.length)
                    : 0}%
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <Award size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Exams</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{exams.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                <BookOpen size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Available Exams
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Exam History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : activeTab === 'available' ? (
              exams.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No available exams at the moment
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam) => (
                    <div key={exam.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="mb-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExamTypeBadge(exam.exam_type)}`}>
                          {exam.exam_type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{exam.duration} min</span>
                        </div>
                        <div>
                          Passing: {exam.passing_score}%
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartExam(exam)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play size={18} />
                        Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              examResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No exam history yet
                </div>
              ) : (
                <div className="space-y-4">
                  {examResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{result.exam_title}</h3>
                        <p className="text-sm text-gray-500">
                          Completed: {new Date(result.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{Math.round(result.score)}%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.status === 'passed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
