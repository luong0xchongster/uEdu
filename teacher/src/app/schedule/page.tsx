'use client'

import { useEffect, useState } from 'react'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import { Calendar, User } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Event {
	id: number
	type: string
	title: string
	date: string
	duration: number
	room: string
	course_name: string
	teacher_first_name: string
	teacher_last_name: string
}

interface Teacher {
	id: number
	first_name: string
	last_name: string
	email: string
}

export default function Schedule() {
	const [events, setEvents] = useState<Event[]>([])
	const [teacher, setTeacher] = useState<Teacher | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		fetchTeacherSchedule()
	}, [])

	const fetchTeacherSchedule = async () => {
		try {
			setLoading(true)
			setError(null)

			const teacherId = 1
			setTeacher({
				id: teacherId,
				first_name: 'John',
				last_name: 'Johnson',
				email: 'john@example.com'
			})

			const response = await axios.get(`${API_URL}/api/v1/events?user_type=teacher&user_id=${teacherId}`)
			setEvents(response.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load schedule')
		} finally {
			setLoading(false)
		}
	}

	const handleEventClick = (event: Event) => {
		console.log('Event clicked:', event)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center gap-3">
							<div className="bg-blue-600 text-white p-2 rounded-lg">
								<Calendar size={24} />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900">uEdu Teacher Portal</h1>
								<p className="text-xs text-gray-500">English Academy</p>
							</div>
						</div>
						{teacher && (
							<div className="flex items-center gap-2">
								<User size={20} className="text-gray-600" />
								<span className="text-sm font-medium text-gray-900">
									{teacher.first_name} {teacher.last_name}
								</span>
							</div>
						)}
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<div className="flex items-center gap-3">
						<Calendar size={32} className="text-blue-600" />
						<div>
							<h2 className="text-3xl font-bold text-gray-900">My Schedule</h2>
							<p className="text-gray-600 mt-1">View your upcoming classes and exams</p>
						</div>
					</div>
				</div>

				{error ? (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-800">{error}</p>
					</div>
				) : events.length === 0 ? (
					<div className="bg-white rounded-xl shadow-sm p-12 text-center">
						<Calendar size={48} className="mx-auto text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
						<p className="text-gray-500">You don't have any classes or exams scheduled yet.</p>
					</div>
				) : (
					<ScheduleCalendar events={events} onEventClick={handleEventClick} />
				)}
			</main>
		</div>
	)
}
