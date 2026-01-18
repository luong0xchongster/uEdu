# uEdu - English Academy Management System

A comprehensive web application for managing English academy operations, including student management, course administration, and a complete exam platform.

## Features

### Admin Portal (Port 3000)
- **Dashboard**: Overview of academy statistics and recent activities
- **Student Management**: Add, edit, delete, and search students
- **Teacher Management**: Manage teaching staff
- **Course Management**: Create and manage English courses
- **Exam Management**: Create and manage three types of exams:
  - Pre-registration exams (placement tests)
  - Progress exams (during course)
  - Final exams (course completion)

### Student Portal (Port 3001)
- **Student Dashboard**: View available exams and exam history
- **Exam Platform**: Take exams with:
  - Multiple choice questions
  - True/false questions
  - Short answer questions
  - Timer functionality
  - Real-time progress tracking
  - Immediate results display
  - Pass/fail status based on passing score

### API (Port 8080)
- RESTful API with Go and Gin framework
- PostgreSQL database
- JWT authentication ready
- CORS enabled for frontend integration

## Technology Stack

### Backend
- **Go 1.21** - Programming language
- **Gin** - Web framework
- **PostgreSQL** - Database
- **lib/pq** - PostgreSQL driver

### Frontend - Admin
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Frontend - Student
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm (for local development)
- Go 1.21+ (for local development)

## Quick Start with Docker

1. Clone the repository and navigate to the project directory

2. Start all services:
```bash
docker-compose up -d
```

3. Access the applications:
- Admin Portal: http://localhost:3000
- Student Portal: http://localhost:3001
- API: http://localhost:8080

## Local Development

### Database Setup

Start PostgreSQL using Docker Compose:
```bash
docker-compose up -d postgres
```

### API Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
go mod download
```

4. Run the API server:
```bash
go run cmd/server/main.go
```

The API will be available at http://localhost:8080

### Admin Portal Setup

1. Navigate to the admin directory:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The admin portal will be available at http://localhost:3000

### Student Portal Setup

1. Navigate to the student directory:
```bash
cd student
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The student portal will be available at http://localhost:3001

## API Documentation

### Students
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/:id` - Get a specific student
- `POST /api/v1/students` - Create a new student
- `PUT /api/v1/students/:id` - Update a student
- `DELETE /api/v1/students/:id` - Delete a student

### Teachers
- `GET /api/v1/teachers` - Get all teachers
- `GET /api/v1/teachers/:id` - Get a specific teacher
- `POST /api/v1/teachers` - Create a new teacher
- `PUT /api/v1/teachers/:id` - Update a teacher
- `DELETE /api/v1/teachers/:id` - Delete a teacher

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get a specific course
- `POST /api/v1/courses` - Create a new course
- `PUT /api/v1/courses/:id` - Update a course
- `DELETE /api/v1/courses/:id` - Delete a course

### Exams
- `GET /api/v1/exams` - Get all exams
- `GET /api/v1/exams/:id` - Get a specific exam
- `GET /api/v1/exams/:id/with-questions` - Get exam with questions
- `POST /api/v1/exams` - Create a new exam
- `PUT /api/v1/exams/:id` - Update an exam
- `DELETE /api/v1/exams/:id` - Delete an exam

### Questions
- `GET /api/v1/exams/:exam_id/questions` - Get questions for an exam
- `GET /api/v1/questions/:id` - Get a specific question
- `POST /api/v1/questions` - Create a new question
- `PUT /api/v1/questions/:id` - Update a question
- `DELETE /api/v1/questions/:id` - Delete a question

### Exam Results
- `POST /api/v1/exam-results/submit` - Submit exam answers
- `GET /api/v1/exam-results` - Get exam results (with optional student_id or exam_id filters)
- `GET /api/v1/exam-results/:id/details` - Get detailed exam result

## Database Schema

### Tables
- `teachers` - Instructor information
- `students` - Student enrollment information
- `courses` - English courses
- `enrollments` - Student course enrollments
- `classes` - Scheduled classes
- `attendance` - Student attendance records
- `exams` - Exam definitions (pre-registration, progress, final)
- `questions` - Exam questions (multiple choice, true/false, short answer)
- `exam_results` - Student exam results
- `answers` - Individual question answers

## Project Structure

```
uedu/
├── api/                    # Go backend API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go    # API entry point
│   ├── internal/
│   │   ├── database/      # Database connection & migrations
│   │   ├── handlers/      # HTTP handlers
│   │   ├── models/        # Data models
│   │   └── middleware/    # Middleware (auth, logging, etc.)
│   └── go.mod             # Go module file
├── admin/                 # Admin Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   └── components/   # React components
│   └── package.json
├── student/              # Student Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   └── components/   # React components
│   └── package.json
├── docker/               # Docker configuration
├── docker-compose.yml    # Multi-container orchestration
└── README.md
```

## Development Guidelines

### Adding New Features

1. **Backend**: Add handlers in `api/internal/handlers/`, models in `api/internal/models/`
2. **Admin**: Add pages in `admin/src/app/`, components in `admin/src/components/`
3. **Student**: Add pages in `student/src/app/`, components in `student/src/components/`

### Code Style

- Go: Follow Go best practices and use `gofmt`
- TypeScript: Follow TypeScript best practices and use ESLint
- TailwindCSS: Use utility classes for styling

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
