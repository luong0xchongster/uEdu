'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Exam {
  id: number
  title: string
  description: string
  exam_type: string
  course_id: number
  duration: number
  passing_score: number
  total_points: number
  start_date: string
  end_date: string
  is_random: boolean
  created_at: string
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewQuestionsModal, setViewQuestionsModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_type: 'progress',
    course_id: 1,
    duration: 60,
    passing_score: 60,
    total_points: 100,
    start_date: '',
    end_date: '',
    is_random: false,
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/exams`)
      setExams(response.data)
    } catch (error) {
      console.error('Error fetching exams:', error)
    }
  }

  const handleCreate = () => {
    setEditingExam(null)
    setFormData({
      title: '',
      description: '',
      exam_type: 'progress',
      course_id: 1,
      duration: 60,
      passing_score: 60,
      total_points: 100,
      start_date: '',
      end_date: '',
      is_random: false,
    })
    setShowModal(true)
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      title: exam.title,
      description: exam.description,
      exam_type: exam.exam_type,
      course_id: exam.course_id,
      duration: exam.duration,
      passing_score: exam.passing_score,
      total_points: exam.total_points,
      start_date: exam.start_date ? exam.start_date.split('T')[0] : '',
      end_date: exam.end_date ? exam.end_date.split('T')[0] : '',
      is_random: exam.is_random,
    })
    setShowModal(true)
  }

  const handleViewQuestions = (exam: Exam) => {
    setSelectedExam(exam)
    setViewQuestionsModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/exams/${id}`)
        fetchExams()
      } catch (error) {
        console.error('Error deleting exam:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingExam) {
        await axios.put(`${API_URL}/api/v1/exams/${editingExam.id}`, formData)
      } else {
        await axios.post(`${API_URL}/api/v1/exams`, formData)
      }
      fetchExams()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving exam:', error)
    }
  }

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getExamTypeBadge = (type: string) => {
    const colors = {
      'pre_registration': 'bg-purple-100 text-purple-800',
      'progress': 'bg-blue-100 text-blue-800',
      'final': 'bg-green-100 text-green-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header title="Exams Management" />
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Exam
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passing Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{exam.title}</div>
                        <div className="text-sm text-gray-500">{exam.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExamTypeBadge(exam.exam_type)}`}>
                          {exam.exam_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{exam.duration} min</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{exam.passing_score}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewQuestions(exam)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Questions"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Exam"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingExam ? 'Edit Exam' : 'Add New Exam'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select
                      required
                      value={formData.exam_type}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="pre_registration">Pre-registration Exam</option>
                      <option value="progress">Progress Exam</option>
                      <option value="final">Final Exam</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <input
                        type="number"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                      <input
                        type="number"
                        required
                        value={formData.passing_score}
                        onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_random"
                      checked={formData.is_random}
                      onChange={(e) => setFormData({ ...formData, is_random: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_random" className="text-sm text-gray-700">Randomize questions order</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingExam ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
