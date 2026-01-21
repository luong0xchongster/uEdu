'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Clock, MapPin, BookOpen } from 'lucide-react'
import { format, parseISO } from 'date-fns'

type ValuePiece = Date | null
type Value = ValuePiece | ValuePiece[]

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

interface ScheduleCalendarProps {
	events: Event[]
	onEventClick?: (event: Event) => void
}

export default function ScheduleCalendar({ events, onEventClick }: ScheduleCalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Value>(new Date())
	const [selectedEvents, setSelectedEvents] = useState<Event[]>([])

	const getEventsForDate = (date: Date): Event[] => {
		const dateStr = format(date, 'yyyy-MM-dd')
		return events.filter(event => 
			format(parseISO(event.date), 'yyyy-MM-dd') === dateStr
		)
	}

	const handleDateChange = (value: Value) => {
		setSelectedDate(value)
		if (value instanceof Date) {
			const dayEvents = getEventsForDate(value)
			setSelectedEvents(dayEvents)
		}
	}

	const tileContent = ({ date, view }: { date: Date; view: string }) => {
		if (view === 'month') {
			const dayEvents = getEventsForDate(date)
			if (dayEvents.length > 0) {
				return (
					<div className="flex items-center justify-center gap-1 mt-1">
						{dayEvents.slice(0, 3).map((_, index) => (
							<div
								key={index}
								className={`w-1.5 h-1.5 rounded-full ${
									dayEvents[0].type === 'exam' ? 'bg-red-500' : 'bg-blue-500'
								}`}
							/>
						))}
						{dayEvents.length > 3 && (
							<span className="text-xs text-gray-500">+</span>
						)}
					</div>
				)
			}
		}
		return null
	}

	const tileClassName = ({ date, view }: { date: Date; view: string }) => {
		if (view === 'month') {
			const dayEvents = getEventsForDate(date)
			if (dayEvents.length > 0) {
				return 'has-events'
			}
		}
		return null
	}

	const getEventColor = (type: string) => {
		return type === 'exam' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
	}

	const getEventBadgeColor = (type: string) => {
		return type === 'exam' 
			? 'bg-red-100 text-red-800' 
			: 'bg-blue-100 text-blue-800'
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<div className="bg-white rounded-xl shadow-sm p-6">
					<Calendar
						onChange={handleDateChange}
						value={selectedDate}
						tileContent={tileContent}
						tileClassName={tileClassName}
						className="w-full"
					/>
				</div>
			</div>

			<div className="lg:col-span-1">
				<div className="bg-white rounded-xl shadow-sm p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						{selectedDate instanceof Date 
							? format(selectedDate, 'MMMM d, yyyy')
							: 'Select a date'
						}
					</h3>

					{selectedEvents.length === 0 ? (
						<p className="text-gray-500 text-sm">No events scheduled for this date</p>
					) : (
						<div className="space-y-3">
							{selectedEvents.map((event) => (
								<div
									key={event.id}
									onClick={() => onEventClick?.(event)}
									className={`p-4 rounded-lg border ${getEventColor(event.type)} cursor-pointer hover:shadow-md transition-shadow`}
								>
									<div className="flex items-start justify-between mb-2">
										<h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
										<span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventBadgeColor(event.type)}`}>
											{event.type}
										</span>
									</div>

									<div className="space-y-1.5 text-xs text-gray-600">
										<div className="flex items-center gap-2">
											<BookOpen size={14} />
											<span>{event.course_name}</span>
										</div>

										{event.type === 'class' && (
											<>
												<div className="flex items-center gap-2">
													<Clock size={14} />
													<span>
														{format(parseISO(event.date), 'HH:mm')} - {event.duration} min
													</span>
												</div>
												<div className="flex items-center gap-2">
													<MapPin size={14} />
													<span>{event.room || 'TBD'}</span>
												</div>
												<div className="text-gray-500">
													Teacher: {event.teacher_first_name} {event.teacher_last_name}
												</div>
											</>
										)}

										{event.type === 'exam' && (
											<>
												<div className="flex items-center gap-2">
													<Clock size={14} />
													<span>
														{format(parseISO(event.date), 'HH:mm')} - {event.duration} min
													</span>
												</div>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
