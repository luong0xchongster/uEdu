package models

import "time"

type Student struct {
	ID          int       `json:"id"`
	FirstName   string    `json:"first_name" binding:"required"`
	LastName    string    `json:"last_name" binding:"required"`
	Email       string    `json:"email" binding:"required,email"`
	Phone       string    `json:"phone"`
	Level       string    `json:"level"`
	EnrolledAt  time.Time `json:"enrolled_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Teacher struct {
	ID        int       `json:"id"`
	FirstName string    `json:"first_name" binding:"required"`
	LastName  string    `json:"last_name" binding:"required"`
	Email     string    `json:"email" binding:"required,email"`
	Phone     string    `json:"phone"`
	Specialty string    `json:"specialty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Course struct {
	ID          int       `json:"id"`
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description"`
	Level       string    `json:"level"`
	TeacherID   int       `json:"teacher_id"`
	Capacity    int       `json:"capacity"`
	Price       float64   `json:"price"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Enrollment struct {
	ID        int       `json:"id"`
	StudentID int       `json:"student_id" binding:"required"`
	CourseID  int       `json:"course_id" binding:"required"`
	Status    string    `json:"status"`
	EnrolledAt time.Time `json:"enrolled_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Class struct {
	ID          int       `json:"id"`
	CourseID    int       `json:"course_id" binding:"required"`
	TeacherID   int       `json:"teacher_id" binding:"required"`
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	ClassDate   time.Time `json:"class_date"`
	Duration    int       `json:"duration"`
	Room        string    `json:"room"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Attendance struct {
	ID        int       `json:"id"`
	ClassID   int       `json:"class_id" binding:"required"`
	StudentID int       `json:"student_id" binding:"required"`
	Status    string    `json:"status"` // present, absent, late
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Exam struct {
	ID          int       `json:"id"`
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	ExamType    string    `json:"exam_type" binding:"required"` // pre_registration, progress, final
	CourseID    int       `json:"course_id"`
	Duration    int       `json:"duration"` // in minutes
	PassingScore int      `json:"passing_score"`
	TotalPoints int       `json:"total_points"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	IsRandom    bool      `json:"is_random"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Question struct {
	ID          int       `json:"id"`
	ExamID      int       `json:"exam_id" binding:"required"`
	QuestionText string   `json:"question_text" binding:"required"`
	QuestionType string   `json:"question_type"` // multiple_choice, true_false, short_answer, fill_blank, matching, reading_comprehension, writing, speaking
	Options     string    `json:"options"` // JSON string for multiple choice options
	CorrectAnswer string  `json:"correct_answer" binding:"required"`
	Points      int       `json:"points"`
	Order       int       `json:"order"`
	Passage     string    `json:"passage"` // For reading comprehension
	AudioURL    string    `json:"audio_url"` // For speaking questions
	Explanation string   `json:"explanation"` // Answer explanation
	GradingRubric string  `json:"grading_rubric"` // JSON string for writing/speaking rubric
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ExamResult struct {
	ID           int       `json:"id"`
	ExamID       int       `json:"exam_id" binding:"required"`
	StudentID    int       `json:"student_id" binding:"required"`
	Score        float64   `json:"score"`
	TotalPoints  int       `json:"total_points"`
	Status       string    `json:"status"` // passed, failed, in_progress
	StartedAt    time.Time `json:"started_at"`
	CompletedAt  time.Time `json:"completed_at"`
	TimeTaken    int       `json:"time_taken"` // in seconds
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Answer struct {
	ID            int       `json:"id"`
	ExamResultID  int       `json:"exam_result_id" binding:"required"`
	QuestionID    int       `json:"question_id" binding:"required"`
	SelectedAnswer string  `json:"selected_answer"`
	IsCorrect     bool     `json:"is_correct"`
	PointsEarned  int      `json:"points_earned"`
	AudioURL      string    `json:"audio_url"`
	CreatedAt     time.Time `json:"created_at"`
}

type WritingEvaluation struct {
	ID            int       `json:"id"`
	AnswerID      int       `json:"answer_id"`
	Score         int       `json:"score"`
	MaxScore      int       `json:"max_score"`
	Feedback      string    `json:"feedback"`
	Strengths     string    `json:"strengths"`
	Improvements  string    `json:"improvements"`
	CorrectedText string    `json:"corrected_text"`
	Suggestions   string    `json:"suggestions"`
	EvaluatedAt   time.Time `json:"evaluated_at"`
}

type StudentChatHistory struct {
	ID           int       `json:"id"`
	StudentID    int       `json:"student_id"`
	Message      string    `json:"message"`
	Role         string    `json:"role"`
	Timestamp    time.Time `json:"timestamp"`
	ExamContext  string    `json:"exam_context"`
}

type ExamIntegrityLog struct {
	ID           int       `json:"id"`
	ExamResultID int       `json:"exam_result_id"`
	StudentID    int       `json:"student_id"`
	EventType    string    `json:"event_type"`
	EventDetails string    `json:"event_details"`
	Timestamp    time.Time `json:"timestamp"`
	IPAddress    string    `json:"ip_address"`
}

type ExamAnalytics struct {
	ID             int       `json:"id"`
	ExamID         int       `json:"exam_id"`
	TotalAttempts  int       `json:"total_attempts"`
	PassCount      int       `json:"pass_count"`
	FailCount      int       `json:"fail_count"`
	AverageScore   float64   `json:"average_score"`
	AverageTime    int       `json:"average_time_taken"`
	QuestionStats  string    `json:"question_stats"`
	LastUpdated    time.Time `json:"last_updated"`
}

type StudentAnalytics struct {
	ID                int       `json:"id"`
	StudentID         int       `json:"student_id"`
	TotalExamsTaken   int       `json:"total_exams_taken"`
	TotalPasses       int       `json:"total_passes"`
	TotalFails        int       `json:"total_fails"`
	AverageScore      float64   `json:"average_score"`
	SkillBreakdown    string    `json:"skill_breakdown"`
	Weaknesses        string    `json:"weaknesses"`
	Strengths         string    `json:"strengths"`
	RecommendedLevel  string    `json:"recommended_level"`
	LastUpdated       time.Time `json:"last_updated"`
type ClassWithDetails struct {
	ID             int       `json:"id"`
	CourseID       int       `json:"course_id"`
	TeacherID      int       `json:"teacher_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	ClassDate      time.Time `json:"class_date"`
	Duration       int       `json:"duration"`
	Room           string    `json:"room"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	CourseName     string    `json:"course_name"`
	TeacherFirstName string   `json:"teacher_first_name"`
	TeacherLastName  string   `json:"teacher_last_name"`
}

type Event struct {
	Type            string    `json:"type"`
	ID              int       `json:"id"`
	Title           string    `json:"title"`
	Date            time.Time `json:"date"`
	Duration        int       `json:"duration"`
	Room            string    `json:"room"`
	CourseName      string    `json:"course_name"`
	TeacherFirstName string   `json:"teacher_first_name"`
	TeacherLastName  string   `json:"teacher_last_name"`
}
