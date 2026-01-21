'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import { Calendar } from 'lucide-react'

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

export default function Schedule() {
	const [events, setEvents] = useState<Event[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [studentId, setStudentId] = useState<number | null>(null)

	useEffect(() => {
		fetchStudentEvents()
	}, [])

	const fetchStudentEvents = async () => {
		try {
			setLoading(true)
			setError(null)

			const studentId = 1
			setStudentId(studentId)

			const response = await fetch(`http://localhost:8080/api/v1/events?user_type=student&user_id=${studentId}`)
			if (!response.ok) {
				throw new Error('Failed to fetch schedule')
			}
			const data = await response.json()
			setEvents(data)
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
			<div className="min-h-screen">
				<Navbar />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				</main>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-800">{error}</p>
					</div>
				</main>
			</div>
		)
	}

	return (
		<div className="min-h-screen">
			<Navbar />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<div className="flex items-center gap-3">
						<Calendar size={32} className="text-blue-600" />
						<div>
							<h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
							<p className="text-gray-600 mt-1">View your upcoming classes and exams</p>
						</div>
					</div>
				</div>

				{events.length === 0 ? (
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
