'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Bot, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Question {
  question_text: string
  question_type: string
  options?: string[]
  correct_answer: string
  points: number
  explanation: string
  passage?: string
}

interface GeneratedExam {
  exam_title: string
  exam_type: string
  level: string
  duration: number
  passing_score: number
  total_points: number
  questions: Question[]
}

interface ExistingExam {
  id: number
  title: string
}

export default function AIExamGenerator() {
  const [existingExams, setExistingExams] = useState<ExistingExam[]>([])
  const [formData, setFormData] = useState({
    exam_type: 'progress',
    level: 'B1',
    skills: ['grammar', 'vocabulary'],
    question_count: 10,
    difficulty: '',
  })
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const skillOptions = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'reading', label: 'Reading' },
    { value: 'listening', label: 'Listening' },
    { value: 'writing', label: 'Writing' },
    { value: 'speaking', label: 'Speaking' },
  ]

  const levelOptions = [
    { value: 'A1', label: 'A1 - Beginner' },
    { value: 'A2', label: 'A2 - Elementary' },
    { value: 'B1', label: 'B1 - Intermediate' },
    { value: 'B2', label: 'B2 - Upper Intermediate' },
    { value: 'C1', label: 'C1 - Advanced' },
    { value: 'C2', label: 'C2 - Proficiency' },
  ]

  const examTypes = [
    { value: 'placement', label: 'Placement Test' },
    { value: 'progress', label: 'Progress Exam' },
    { value: 'final', label: 'Final Exam' },
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/courses`)
      setExistingExams(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
      return { ...prev, skills: newSkills }
    })
  }

  const handleGenerate = async () => {
    if (formData.skills.length === 0) {
      alert('Please select at least one skill')
      return
    }

    setIsGenerating(true)
    try {
      const response = await axios.post(`${API_URL}/api/v1/ai/exam-generator`, formData)
      setGeneratedExam(response.data)
    } catch (error: any) {
      console.error('Error generating exam:', error)
      alert(error.response?.data?.error || 'Failed to generate exam. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveExam = async () => {
    if (!generatedExam) return

    try {
      const examResponse = await axios.post(`${API_URL}/api/v1/exams`, {
        title: generatedExam.exam_title,
        description: `AI-generated ${generatedExam.exam_type} exam for ${generatedExam.level} level`,
        exam_type: formData.exam_type,
        course_id: selectedCourseId,
        duration: generatedExam.duration,
        passing_score: generatedExam.passing_score,
        total_points: generatedExam.total_points,
      })

      const examId = examResponse.data.id

      for (const question of generatedExam.questions) {
        await axios.post(`${API_URL}/api/v1/questions`, {
          exam_id: examId,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correct_answer,
          points: question.points,
          passage: question.passage,
          explanation: question.explanation,
          order: generatedExam.questions.indexOf(question),
        })
      }

      alert('Exam saved successfully!')
      setGeneratedExam(null)
    } catch (error) {
      console.error('Error saving exam:', error)
      alert('Failed to save exam. Please try again.')
    }
  }

  const getQuestionTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      true_false: 'bg-green-100 text-green-800',
      short_answer: 'bg-yellow-100 text-yellow-800',
      fill_blank: 'bg-purple-100 text-purple-800',
      matching: 'bg-pink-100 text-pink-800',
      reading_comprehension: 'bg-indigo-100 text-indigo-800',
      writing: 'bg-orange-100 text-orange-800',
      speaking: 'bg-red-100 text-red-800',
    }
    return types[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header title="AI Exam Generator" />
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bot className="text-primary-600" size={28} />
                  <h2 className="text-xl font-semibold">Configure Exam Generation</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                    <select
                      value={formData.exam_type}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {examTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Level (CEFR)</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {levelOptions.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills to Test</label>
                    <div className="grid grid-cols-2 gap-2">
                      {skillOptions.map(skill => (
                        <label
                          key={skill.value}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                            formData.skills.includes(skill.value)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill.value)}
                            onChange={() => handleSkillToggle(skill.value)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm">{skill.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={formData.question_count}
                      onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty (Optional)</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Auto (Match Level)</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot size={20} />
                        Generate Exam
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {generatedExam && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Generated Exam</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGeneratedExam(null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleSaveExam}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download size={18} />
                        Save Exam
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg">{generatedExam.exam_title}</h3>
                    <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Level</div>
                        <div className="font-medium">{generatedExam.level}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Duration</div>
                        <div className="font-medium">{generatedExam.duration} min</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Questions</div>
                        <div className="font-medium">{generatedExam.questions.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total Points</div>
                        <div className="font-medium">{generatedExam.total_points}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedExam.questions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900">Q{index + 1}. {question.question_type.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQuestionTypeBadge(question.question_type)}`}>
                              {question.question_type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">{question.points} pts</span>
                          </div>
                        </div>

                        {question.passage && (
                          <div className="mb-3 p-3 bg-gray-50 rounded text-sm italic">
                            {question.passage}
                          </div>
                        )}

                        <p className="text-gray-700 mb-3">{question.question_text}</p>

                        {question.options && question.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`px-3 py-2 rounded border ${
                                  option === question.correct_answer
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200'
                                } text-sm`}
                              >
                                {option}
                                {option === question.correct_answer && (
                                  <CheckCircle className="inline ml-2 text-green-600" size={14} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="text-gray-400 mt-0.5" size={16} />
                          <span className="text-gray-600">
                            <strong>Correct Answer:</strong> {question.correct_answer}
                          </span>
                        </div>

                        {question.explanation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!generatedExam && (
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center h-96 text-center">
                  <Bot className="text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exam Generated Yet</h3>
                  <p className="text-gray-500">Configure the settings and click "Generate Exam" to create an AI-powered exam.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
