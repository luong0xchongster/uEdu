package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type ExamHandler struct {
	DB *sql.DB
}

func NewExamHandler(db *sql.DB) *ExamHandler {
	return &ExamHandler{DB: db}
}

func (h *ExamHandler) GetExams(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, exam_type, course_id, duration, passing_score, 
		       total_points, start_date, end_date, is_random, created_at, updated_at 
		FROM exams ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var exams []models.Exam
	for rows.Next() {
		var e models.Exam
		if err := rows.Scan(&e.ID, &e.Title, &e.Description, &e.ExamType, &e.CourseID, &e.Duration, 
			&e.PassingScore, &e.TotalPoints, &e.StartDate, &e.EndDate, &e.IsRandom, 
			&e.CreatedAt, &e.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		exams = append(exams, e)
	}

	c.JSON(http.StatusOK, exams)
}

func (h *ExamHandler) GetExam(c *gin.Context) {
	id := c.Param("id")
	var e models.Exam
	err := h.DB.QueryRow(`
		SELECT id, title, description, exam_type, course_id, duration, passing_score, 
		       total_points, start_date, end_date, is_random, created_at, updated_at 
		FROM exams WHERE id = $1
	`, id).Scan(&e.ID, &e.Title, &e.Description, &e.ExamType, &e.CourseID, &e.Duration, 
		&e.PassingScore, &e.TotalPoints, &e.StartDate, &e.EndDate, &e.IsRandom, 
		&e.CreatedAt, &e.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exam not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, e)
}

func (h *ExamHandler) GetExamWithQuestions(c *gin.Context) {
	id := c.Param("id")
	var e models.Exam
	
	err := h.DB.QueryRow(`
		SELECT id, title, description, exam_type, course_id, duration, passing_score, 
		       total_points, start_date, end_date, is_random, created_at, updated_at 
		FROM exams WHERE id = $1
	`, id).Scan(&e.ID, &e.Title, &e.Description, &e.ExamType, &e.CourseID, &e.Duration, 
		&e.PassingScore, &e.TotalPoints, &e.StartDate, &e.EndDate, &e.IsRandom, 
		&e.CreatedAt, &e.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exam not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := h.DB.Query(`
		SELECT id, exam_id, question_text, question_type, options, correct_answer, points, order_num, created_at, updated_at 
		FROM questions WHERE exam_id = $1 ORDER BY order_num ASC
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var q models.Question
		if err := rows.Scan(&q.ID, &q.ExamID, &q.QuestionText, &q.QuestionType, &q.Options, 
			&q.CorrectAnswer, &q.Points, &q.Order, &q.CreatedAt, &q.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, gin.H{
		"exam":      e,
		"questions": questions,
	})
}

func (h *ExamHandler) CreateExam(c *gin.Context) {
	var e models.Exam
	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO exams (title, description, exam_type, course_id, duration, passing_score, total_points, start_date, end_date, is_random) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
		RETURNING id, created_at, updated_at
	`, e.Title, e.Description, e.ExamType, e.CourseID, e.Duration, e.PassingScore, e.TotalPoints, e.StartDate, e.EndDate, e.IsRandom).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, e)
}

func (h *ExamHandler) UpdateExam(c *gin.Context) {
	id := c.Param("id")
	var e models.Exam
	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE exams 
		SET title=$1, description=$2, exam_type=$3, course_id=$4, duration=$5, passing_score=$6, 
		    total_points=$7, start_date=$8, end_date=$9, is_random=$10, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$11
	`, e.Title, e.Description, e.ExamType, e.CourseID, e.Duration, e.PassingScore, e.TotalPoints, 
		e.StartDate, e.EndDate, e.IsRandom, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, e)
}

func (h *ExamHandler) DeleteExam(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM exams WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exam not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exam deleted successfully"})
}
