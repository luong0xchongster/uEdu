'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Users, TrendingUp, Award, Clock, BarChart3 } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ExamAnalytics {
  id: number
  exam_id: number
  exam_title: string
  total_attempts: number
  pass_count: number
  fail_count: number
  average_score: number
  average_time: number
  question_stats: any
  last_updated: string
}

interface StudentAnalytics {
  id: number
  student_id: number
  student_name: string
  total_exams: number
  total_passes: number
  total_fails: number
  average_score: number
  skill_breakdown: any
  weaknesses: string[]
  strengths: string[]
  recommended_level: string
}

export default function Analytics() {
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics[]>([])
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [examsRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/exams`),
        axios.get(`${API_URL}/api/v1/students`),
      ])

      const examResults = await axios.get(`${API_URL}/api/v1/exam-results`)
      
      processExamAnalytics(examsRes.data, examResults.data)
      processStudentAnalytics(studentsRes.data, examResults.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const processExamAnalytics = (exams: any[], results: any[]) => {
    const analytics: ExamAnalytics[] = exams.map(exam => {
      const examResults = results.filter((r: any) => r.exam_id === exam.id)
      const passed = examResults.filter((r: any) => r.status === 'passed').length
      const failed = examResults.filter((r: any) => r.status === 'failed').length
      const avgScore = examResults.length > 0
        ? examResults.reduce((sum: number, r: any) => sum + r.score, 0) / examResults.length
        : 0
      const avgTime = examResults.length > 0
        ? examResults.reduce((sum: number, r: any) => sum + r.time_taken, 0) / examResults.length
        : 0

      return {
        id: exam.id,
        exam_id: exam.id,
        exam_title: exam.title,
        total_attempts: examResults.length,
        pass_count: passed,
        fail_count: failed,
        average_score: Math.round(avgScore),
        average_time: Math.round(avgTime),
        question_stats: {},
        last_updated: new Date().toISOString(),
      }
    })

    setExamAnalytics(analytics)
  }

  const processStudentAnalytics = (students: any[], results: any[]) => {
    const analytics: StudentAnalytics[] = students.map(student => {
      const studentResults = results.filter((r: any) => r.student_id === student.id)
      const passed = studentResults.filter((r: any) => r.status === 'passed').length
      const failed = studentResults.filter((r: any) => r.status === 'failed').length
      const avgScore = studentResults.length > 0
        ? studentResults.reduce((sum: number, r: any) => sum + r.score, 0) / studentResults.length
        : 0

      return {
        id: student.id,
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        total_exams: studentResults.length,
        total_passes: passed,
        total_fails: failed,
        average_score: Math.round(avgScore),
        skill_breakdown: {},
        weaknesses: [],
        strengths: [],
        recommended_level: student.level || 'B1',
      }
    })

    setStudentAnalytics(analytics)
  }

  const getOverallStats = () => {
    const totalAttempts = examAnalytics.reduce((sum, e) => sum + e.total_attempts, 0)
    const totalPasses = examAnalytics.reduce((sum, e) => sum + e.pass_count, 0)
    const avgScore = examAnalytics.length > 0
      ? examAnalytics.reduce((sum, e) => sum + e.average_score, 0) / examAnalytics.length
      : 0

    return {
      totalAttempts,
      totalPasses,
      passRate: totalAttempts > 0 ? Math.round((totalPasses / totalAttempts) * 100) : 0,
      avgScore: Math.round(avgScore),
    }
  }

  const stats = getOverallStats()

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Header title="Analytics" />
          <div className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header title="Analytics Dashboard" />
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Exam Performance</h2>
              <p className="text-gray-600">Track student progress and exam statistics</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAttempts}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pass Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.passRate}%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <Award size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgScore}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {Math.round(examAnalytics.reduce((sum, e) => sum + e.average_time, 0) / examAnalytics.length / 60)}m
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Performance</h3>
              <div className="space-y-4">
                {examAnalytics.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{exam.exam_title}</p>
                      <p className="text-sm text-gray-500">{exam.total_attempts} attempts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{exam.average_score}%</p>
                      <p className="text-sm text-green-600">
                        {exam.pass_count} passed / {exam.fail_count} failed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-4">
                {studentAnalytics
                  .sort((a, b) => b.average_score - a.average_score)
                  .slice(0, 5)
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{student.student_name}</p>
                        <p className="text-sm text-gray-500">
                          {student.recommended_level} • {student.total_exams} exams
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{student.average_score}%</p>
                        <p className="text-sm text-blue-600">
                          {student.total_passes} passes
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Exam Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['placement', 'progress', 'final'].map(type => {
                const typeExams = examAnalytics.filter(e => e.exam_id % 3 === (type === 'placement' ? 1 : type === 'progress' ? 2 : 0))
                const avgTypeScore = typeExams.length > 0
                  ? typeExams.reduce((sum, e) => sum + e.average_score, 0) / typeExams.length
                  : 0

                return (
                  <div key={type} className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 capitalize">{type}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {Math.round(avgTypeScore)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {typeExams.reduce((sum, e) => sum + e.total_attempts, 0)} attempts
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
