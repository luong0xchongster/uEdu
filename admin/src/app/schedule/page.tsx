'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import { Calendar, Plus } from 'lucide-react'
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

export default function SchedulePage() {
	const [events, setEvents] = useState<Event[]>([])
	const [teachers, setTeachers] = useState<Teacher[]>([])
	const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showAddModal, setShowAddModal] = useState(false)

	useEffect(() => {
		fetchTeachers()
		fetchAllEvents()
	}, [])

	const fetchTeachers = async () => {
		try {
			const response = await axios.get(`${API_URL}/api/v1/teachers`)
			setTeachers(response.data)
		} catch (err) {
			console.error('Error fetching teachers:', err)
		}
	}

	const fetchAllEvents = async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await axios.get(`${API_URL}/api/v1/events`)
			setEvents(response.data)
		} catch (err) {
			setError('Failed to load schedule')
		} finally {
			setLoading(false)
		}
	}

	const fetchTeacherEvents = async (teacherId: number) => {
		try {
			setLoading(true)
			setError(null)
			setSelectedTeacher(teacherId)
			const response = await axios.get(`${API_URL}/api/v1/events?user_type=teacher&user_id=${teacherId}`)
			setEvents(response.data)
		} catch (err) {
			setError('Failed to load teacher schedule')
		} finally {
			setLoading(false)
		}
	}

	const handleEventClick = (event: Event) => {
		console.log('Event clicked:', event)
	}

	const selectedTeacherData = teachers.find(t => t.id === selectedTeacher)

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1">
				<Header />
				<main className="p-8">
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Calendar size={32} className="text-blue-600" />
								<div>
									<h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
									<p className="text-gray-600 mt-1">View and manage class schedules</p>
								</div>
							</div>
							<button
								onClick={() => setShowAddModal(true)}
								className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								<Plus size={20} />
								Add Class
							</button>
						</div>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">Filter by Teacher</label>
						<select
							value={selectedTeacher || ''}
							onChange={(e) => {
								const value = e.target.value
								if (value === '') {
									setSelectedTeacher(null)
									fetchAllEvents()
								} else {
									fetchTeacherEvents(Number(value))
								}
							}}
							className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Teachers</option>
							{teachers.map((teacher) => (
								<option key={teacher.id} value={teacher.id}>
									{teacher.first_name} {teacher.last_name}
								</option>
							))}
						</select>
					</div>

					{selectedTeacherData && (
						<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<p className="text-blue-800">
								Showing schedule for: <strong>{selectedTeacherData.first_name} {selectedTeacherData.last_name}</strong>
							</p>
						</div>
					)}

					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : error ? (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<p className="text-red-800">{error}</p>
						</div>
					) : (
						<ScheduleCalendar events={events} onEventClick={handleEventClick} />
					)}

					{showAddModal && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 w-full max-w-md">
								<h2 className="text-xl font-bold mb-4">Add New Class</h2>
								<p className="text-gray-500 text-sm mb-4">
									Class creation form will be implemented here. This is a placeholder for now.
								</p>
								<button
									onClick={() => setShowAddModal(false)}
									className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Close
								</button>
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	)
}
