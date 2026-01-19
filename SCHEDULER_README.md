# Scheduler Calendar Feature

## Overview

The Scheduler Calendar feature allows students and teachers to view their upcoming classes and exams in an interactive calendar view. Administrators can also manage class schedules through the admin portal.

## Features

### For Students
- **View Personal Schedule**: See all enrolled classes and upcoming exams
- **Interactive Calendar**: Click on dates to see detailed event information
- **Event Details**: View time, location, course, and teacher information
- **Color-coded Events**: Blue for classes, red for exams

### For Teachers
- **View Teaching Schedule**: See all assigned classes and course exams
- **Dashboard Overview**: Quick summary of upcoming events
- **Full Calendar View**: Detailed monthly calendar with event details

### For Administrators
- **View All Schedules**: See schedule for any teacher
- **Filter by Teacher**: Select a specific teacher to view their schedule
- **Add Classes**: Create new class sessions (UI placeholder)
- **Manage Events**: Full CRUD operations for classes

## Backend Implementation

### New API Endpoints

#### Classes CRUD
- `GET /api/v1/classes` - Get all classes
- `GET /api/v1/classes/:id` - Get a specific class
- `POST /api/v1/classes` - Create a new class
- `PUT /api/v1/classes/:id` - Update a class
- `DELETE /api/v1/classes/:id` - Delete a class

#### Schedule & Events
- `GET /api/v1/classes/teacher/:teacher_id` - Get all classes for a teacher
- `GET /api/v1/classes/student/:student_id` - Get all classes for a student
- `GET /api/v1/events?user_type=student&user_id=:id` - Get all events (classes + exams) for a student
- `GET /api/v1/events?user_type=teacher&user_id=:id` - Get all events (classes + exams) for a teacher
- `GET /api/v1/events` - Get all events (admin view)

### New Models

#### ClassWithDetails
```go
type ClassWithDetails struct {
	ID             int
	CourseID       int
	TeacherID      int
	Title          string
	Description    string
	ClassDate      time.Time
	Duration       int
	Room           string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	CourseName     string
	TeacherFirstName string
	TeacherLastName  string
}
```

#### Event
```go
type Event struct {
	Type            string  // 'class' or 'exam'
	ID              int
	Title           string
	Date            time.Time
	Duration        int
	Room            string
	CourseName      string
	TeacherFirstName string
	TeacherLastName  string
}
```

## Frontend Implementation

### Components

#### ScheduleCalendar
A reusable calendar component that displays events in an interactive calendar view. Features include:
- Monthly calendar view with react-calendar
- Event indicators on dates with events
- Detailed event panel showing selected date's events
- Color-coded events by type
- Click handlers for event interactions

Location:
- `admin/src/components/ScheduleCalendar.tsx`
- `student/src/components/ScheduleCalendar.tsx`
- `teacher/src/components/ScheduleCalendar.tsx`

### Pages

#### Student Schedule
- **Path**: `student/src/app/schedule/page.tsx`
- **Features**: View personal class and exam schedule
- **Access**: `/schedule`

#### Teacher Portal
- **Path**: `teacher/src/app/schedule/page.tsx` and `teacher/src/app/page.tsx`
- **Features**: 
  - Dashboard with event summary
  - Full calendar view of teaching schedule
  - Upcoming events list
- **Access**: `/schedule` and `/`

#### Admin Schedule Management
- **Path**: `admin/src/app/schedule/page.tsx`
- **Features**:
  - View all schedules or filter by teacher
  - Add new classes
  - Manage class schedules
- **Access**: `/schedule`

## Setup Instructions

### Prerequisites

1. Ensure the backend API is running on `http://localhost:8080`
2. Install dependencies for each frontend portal

### Backend Setup

The backend is already configured with all necessary endpoints. No additional setup required.

### Frontend Setup

#### Student Portal
```bash
cd student
npm install react-calendar date-fns
npm run dev
```

Access at: http://localhost:3000 (local) or http://localhost:3002 (Docker)

#### Admin Portal
```bash
cd admin
npm install react-calendar date-fns
npm run dev
```

Access at: http://localhost:3000 (local) or http://localhost:3001 (Docker)

#### Teacher Portal
```bash
cd teacher
npm install
npm run dev
```

Access at: http://localhost:3000 (local) or http://localhost:3003 (Docker - needs to be configured)

## Usage

### Viewing Student Schedule

1. Navigate to `/schedule` in the student portal
2. The calendar displays all enrolled classes and exams
3. Click on any date to see detailed event information
4. Events are color-coded: blue for classes, red for exams

### Viewing Teacher Schedule

1. Navigate to the teacher portal
2. The dashboard shows upcoming events summary
3. Click "View Full Schedule" or navigate to `/schedule`
4. Calendar displays all assigned classes and course exams

### Managing Schedules (Admin)

1. Navigate to `/schedule` in the admin portal
2. Select a teacher from the dropdown to filter their schedule
3. Or leave empty to view all events
4. Click "Add Class" to create new class sessions (placeholder UI)

## API Response Examples

### Get Student Events
```bash
GET /api/v1/events?user_type=student&user_id=1
```

Response:
```json
[
  {
    "type": "class",
    "id": 1,
    "title": "English Grammar Intermediate",
    "date": "2026-01-20T10:00:00Z",
    "duration": 60,
    "room": "Room 101",
    "course_name": "English Grammar Intermediate",
    "teacher_first_name": "Jane",
    "teacher_last_name": "Smith"
  },
  {
    "type": "exam",
    "id": 1,
    "title": "Final Exam",
    "date": "2026-01-25T14:00:00Z",
    "duration": 90,
    "room": "",
    "course_name": "English Grammar Intermediate",
    "teacher_first_name": "",
    "teacher_last_name": ""
  }
]
```

### Get Teacher Events
```bash
GET /api/v1/events?user_type=teacher&user_id=1
```

Response:
```json
[
  {
    "type": "class",
    "id": 1,
    "title": "English Grammar Intermediate",
    "date": "2026-01-20T10:00:00Z",
    "duration": 60,
    "room": "Room 101",
    "course_name": "English Grammar Intermediate",
    "teacher_first_name": "Jane",
    "teacher_last_name": "Smith"
  }
]
```

## Customization

### Styling

The calendar uses `react-calendar` with custom Tailwind CSS. To customize:

1. Override `react-calendar/dist/Calendar.css`
2. Modify component styles in `ScheduleCalendar.tsx`
3. Update color schemes in the `getEventColor` and `getEventBadgeColor` functions

### Event Types

To add new event types:
1. Update the backend `Event` model
2. Modify the `GetAllEvents` handler in `api/internal/handlers/class.go`
3. Update the frontend event type handling in `ScheduleCalendar.tsx`

### Date Formatting

The system uses `date-fns` for date formatting. Change the format strings in `ScheduleCalendar.tsx`:
- `format(date, 'MMMM d, yyyy')` - Full date format
- `format(parseISO(event.date), 'HH:mm')` - Time format

## Future Enhancements

- [ ] Implement full class creation form in admin portal
- [ ] Add event editing functionality
- [ ] Include drag-and-drop for rescheduling events
- [ ] Add recurring class support
- [ ] Implement calendar export (iCal, Google Calendar)
- [ ] Add email notifications for schedule changes
- [ ] Include attendance tracking from calendar view
- [ ] Add conflict detection for overlapping classes

## Troubleshooting

### Calendar Not Showing Events
- Ensure the API is running on `http://localhost:8080`
- Check browser console for API errors
- Verify CORS settings in `api/cmd/server/main.go`
- Check that student/teacher IDs are correct

### Missing Dependencies
```bash
npm install react-calendar date-fns
```

### CORS Errors
Ensure CORS origins are configured in `api/cmd/server/main.go`:
```go
AllowOrigins: []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}
```

## Database Schema

The feature uses existing database tables:
- `classes` - Stores class sessions
- `exams` - Stores exam schedules
- `enrollments` - Links students to courses
- `courses` - Course information
- `teachers` - Teacher information

No new database tables are required for this feature.
