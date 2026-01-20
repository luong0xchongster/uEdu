'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import AudioRecorder from '@/components/AudioRecorder'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Question {
  id: number
  exam_id: number
  question_text: string
  question_type: string
  options: string
  correct_answer: string
  points: number
  order: number
  passage?: string
  audio_url?: string
  explanation?: string
  grading_rubric?: string
}

interface ExamData {
  exam: {
    id: number
    title: string
    description: string
    exam_type: string
    duration: number
    passing_score: number
    total_points: number
  }
  questions: Question[]
}

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [startedAt, setStartedAt] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchExam()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit()
    }
  }, [timeLeft, submitted])

  const fetchExam = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/exams/${params.id}/with-questions`)
      setExamData(response.data)
      setTimeLeft(response.data.exam.duration * 60)
      setStartedAt(new Date().toISOString())
    } catch (error) {
      console.error('Error fetching exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const response = await axios.post(`${API_URL}/api/v1/exam-results/submit`, {
        exam_id: parseInt(params.id as string),
        student_id: 1,
        answers: answers,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      })
      setResult(response.data)
    } catch (error) {
      console.error('Error submitting exam:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!examData) return 0
    const answered = Object.keys(answers).length
    return Math.round((answered / examData.questions.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              result.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.status === 'passed' ? (
                <CheckCircle size={48} className="text-green-600" />
              ) : (
                <XCircle size={48} className="text-red-600" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result.status === 'passed' ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-600 mb-8">
              {result.status === 'passed' 
                ? 'You have successfully passed the exam.' 
                : 'You did not reach the passing score. Keep studying and try again!'}
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {Math.round(result.score)}%
              </div>
              <p className="text-gray-600">Your Score</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Passing Score: {examData?.exam.passing_score}%
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{examData?.exam.title}</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{getProgress()}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(answers).length} / {examData?.questions.length}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {examData?.questions.map((question, index) => {
            let options: string[] = []
            try {
              options = JSON.parse(question.options)
            } catch (e) {
              options = []
            }

            return (
              <div key={question.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{question.question_text}</p>
                    <p className="text-sm text-gray-500 mt-1">{question.points} points</p>
                  </div>
                </div>

                {question.question_type === 'multiple_choice' && options.length > 0 && (
                  <div className="space-y-3 ml-14">
                    {options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          answers[question.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswer(question.id, option)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'true_false' && (
                  <div className="space-y-3 ml-14">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[question.id] === 'true' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="true"
                        checked={answers[question.id] === 'true'}
                        onChange={() => handleAnswer(question.id, 'true')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-900 font-medium">True</span>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[question.id] === 'false' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="false"
                        checked={answers[question.id] === 'false'}
                        onChange={() => handleAnswer(question.id, 'false')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-900 font-medium">False</span>
                    </label>
                  </div>
                )}

                {question.question_type === 'short_answer' && (
                  <div className="ml-14">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}

                {question.question_type === 'fill_blank' && (
                  <div className="ml-14">
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder="Type the missing word(s)..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {question.question_type === 'matching' && (
                  <div className="ml-14 space-y-3">
                    {(() => {
                      let options: string[] = []
                      try {
                        options = JSON.parse(question.options)
                      } catch (e) {
                        return <div className="text-sm text-gray-500">Invalid matching options</div>
                      }
                      return options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-6">{optIndex + 1}.</span>
                          <input
                            type="text"
                            value={(answers[question.id] as any)?.[optIndex] || ''}
                            onChange={(e) => {
                              const current = (answers[question.id] as any) || {}
                              handleAnswer(question.id, JSON.stringify({ ...current, [optIndex]: e.target.value }))
                            }}
                            placeholder="Match with..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))
                    })()}
                  </div>
                )}

                {question.question_type === 'reading_comprehension' && (
                  <div className="ml-14 space-y-4">
                    {question.passage && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Reading Passage</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {question.passage}
                        </p>
                      </div>
                    )}
                    {(() => {
                      let options: string[] = []
                      try {
                        options = JSON.parse(question.options)
                      } catch (e) {
                        return null
                      }
                      return options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[question.id] === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswer(question.id, option)}
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))
                    })()}
                  </div>
                )}

                {question.question_type === 'writing' && (
                  <div className="ml-14 space-y-3">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder="Write your response here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={8}
                    />
                    <p className="text-xs text-gray-500">
                      This answer will be evaluated by AI. Provide a well-structured response.
                    </p>
                  </div>
                )}

                {question.question_type === 'speaking' && (
                  <div className="ml-14 space-y-3">
                    {question.passage && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Speaking Prompt</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {question.passage}
                        </p>
                      </div>
                    )}
                    <AudioRecorder
                      onRecordingComplete={(blob) => {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const base64data = reader.result as string
                          handleAnswer(question.id, base64data)
                        }
                        reader.readAsDataURL(blob)
                      }}
                      duration={60}
                    />
                  </div>
                )}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Audio recording will be available in the mobile app or desktop application. For now, please type your response.
                      </p>
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder="Type your spoken response here..."
                        className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
