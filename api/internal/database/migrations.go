package database

import (
	"database/sql"
	"fmt"
)

func RunMigrations() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS teachers (
			id SERIAL PRIMARY KEY,
			first_name VARCHAR(100) NOT NULL,
			last_name VARCHAR(100) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			phone VARCHAR(20),
			specialty VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS students (
			id SERIAL PRIMARY KEY,
			first_name VARCHAR(100) NOT NULL,
			last_name VARCHAR(100) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			phone VARCHAR(20),
			level VARCHAR(50),
			enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS courses (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			level VARCHAR(50),
			teacher_id INTEGER REFERENCES teachers(id),
			capacity INTEGER DEFAULT 30,
			price DECIMAL(10,2),
			start_date TIMESTAMP,
			end_date TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS enrollments (
			id SERIAL PRIMARY KEY,
			student_id INTEGER REFERENCES students(id),
			course_id INTEGER REFERENCES courses(id),
			status VARCHAR(50) DEFAULT 'active',
			enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(student_id, course_id)
		)`,
		`CREATE TABLE IF NOT EXISTS classes (
			id SERIAL PRIMARY KEY,
			course_id INTEGER REFERENCES courses(id),
			teacher_id INTEGER REFERENCES teachers(id),
			title VARCHAR(255) NOT NULL,
			description TEXT,
			class_date TIMESTAMP,
			duration INTEGER DEFAULT 60,
			room VARCHAR(50),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS attendance (
			id SERIAL PRIMARY KEY,
			class_id INTEGER REFERENCES classes(id),
			student_id INTEGER REFERENCES students(id),
			status VARCHAR(20) DEFAULT 'present',
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(class_id, student_id)
		)`,
		`CREATE TABLE IF NOT EXISTS exams (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			exam_type VARCHAR(50) NOT NULL,
			course_id INTEGER REFERENCES courses(id),
			duration INTEGER DEFAULT 60,
			passing_score INTEGER DEFAULT 60,
			total_points INTEGER DEFAULT 100,
			start_date TIMESTAMP,
			end_date TIMESTAMP,
			is_random BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS questions (
			id SERIAL PRIMARY KEY,
			exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
			question_text TEXT NOT NULL,
			question_type VARCHAR(50) DEFAULT 'multiple_choice',
			options JSONB,
			correct_answer VARCHAR(500) NOT NULL,
			points INTEGER DEFAULT 1,
			order_num INTEGER DEFAULT 0,
			passage TEXT,
			audio_url VARCHAR(500),
			explanation TEXT,
			grading_rubric JSONB,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS exam_results (
			id SERIAL PRIMARY KEY,
			exam_id INTEGER REFERENCES exams(id),
			student_id INTEGER REFERENCES students(id),
			score DECIMAL(5,2),
			total_points INTEGER DEFAULT 100,
			status VARCHAR(20) DEFAULT 'in_progress',
			started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			completed_at TIMESTAMP,
			time_taken INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS answers (
			id SERIAL PRIMARY KEY,
			exam_result_id INTEGER REFERENCES exam_results(id) ON DELETE CASCADE,
			question_id INTEGER REFERENCES questions(id),
			selected_answer TEXT,
			is_correct BOOLEAN DEFAULT FALSE,
			points_earned INTEGER DEFAULT 0,
			audio_url VARCHAR(500),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS writing_evaluations (
			id SERIAL PRIMARY KEY,
			answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
			score INTEGER NOT NULL,
			max_score INTEGER NOT NULL,
			feedback TEXT,
			strengths JSONB,
			improvements JSONB,
			corrected_text TEXT,
			suggestions TEXT,
			evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS student_chat_history (
			id SERIAL PRIMARY KEY,
			student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
			message TEXT NOT NULL,
			role VARCHAR(20) NOT NULL,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			exam_context TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS exam_integrity_logs (
			id SERIAL PRIMARY KEY,
			exam_result_id INTEGER REFERENCES exam_results(id) ON DELETE CASCADE,
			student_id INTEGER REFERENCES students(id),
			event_type VARCHAR(50) NOT NULL,
			event_details TEXT,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			ip_address VARCHAR(45)
		)`,
		`CREATE TABLE IF NOT EXISTS exam_analytics (
			id SERIAL PRIMARY KEY,
			exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
			total_attempts INTEGER DEFAULT 0,
			pass_count INTEGER DEFAULT 0,
			fail_count INTEGER DEFAULT 0,
			average_score DECIMAL(5,2),
			average_time_taken INTEGER,
			question_stats JSONB,
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS student_analytics (
			id SERIAL PRIMARY KEY,
			student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
			total_exams_taken INTEGER DEFAULT 0,
			total_passes INTEGER DEFAULT 0,
			total_fails INTEGER DEFAULT 0,
			average_score DECIMAL(5,2),
			skill_breakdown JSONB,
			weaknesses JSONB,
			strengths JSONB,
			recommended_level VARCHAR(50),
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for i, migration := range migrations {
		if _, err := DB.Exec(migration); err != nil {
			return fmt.Errorf("migration %d failed: %w", i+1, err)
		}
	}

	fmt.Println("Database migrations completed successfully")
	return nil
}
