'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
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

export default function HomePage() {
	const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchUpcomingEvents()
	}, [])

	const fetchUpcomingEvents = async () => {
		try {
			const teacherId = 1
			const response = await axios.get(`${API_URL}/api/v1/events?user_type=teacher&user_id=${teacherId}`)
			const today = new Date()
			const upcoming = response.data.filter((event: Event) => new Date(event.date) >= today)
			setUpcomingEvents(upcoming.slice(0, 5))
		} catch (err) {
			console.error('Error fetching events:', err)
		} finally {
			setLoading(false)
		}
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
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
					<p className="text-gray-600 mt-1">Here's your teaching dashboard</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Upcoming Classes</p>
								<p className="text-3xl font-bold text-gray-900">{upcomingEvents.filter(e => e.type === 'class').length}</p>
							</div>
							<Calendar className="text-blue-600" size={32} />
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Upcoming Exams</p>
								<p className="text-3xl font-bold text-gray-900">{upcomingEvents.filter(e => e.type === 'exam').length}</p>
							</div>
							<Calendar className="text-red-600" size={32} />
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Total Events</p>
								<p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
							</div>
							<Calendar className="text-green-600" size={32} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
					</div>
					<div className="p-6">
						{loading ? (
							<div className="flex items-center justify-center h-32">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							</div>
						) : upcomingEvents.length === 0 ? (
							<p className="text-gray-500 text-center">No upcoming events</p>
						) : (
							<div className="space-y-3">
								{upcomingEvents.map((event) => (
									<div
										key={event.id}
										className={`flex items-center justify-between p-4 rounded-lg border ${
											event.type === 'exam' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
										}`}
									>
										<div>
											<p className="font-medium text-gray-900">{event.title}</p>
											<p className="text-sm text-gray-600">{event.course_name}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-gray-900">
												{new Date(event.date).toLocaleDateString()}
											</p>
											<span className={`text-xs px-2 py-1 rounded-full ${
												event.type === 'exam' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
											}`}>
												{event.type}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="mt-6">
					<a
						href="/schedule"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Calendar size={20} />
						View Full Schedule
					</a>
				</div>
			</main>
		</div>
	)
}
