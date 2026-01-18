package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type ExamResultHandler struct {
	DB *sql.DB
}

func NewExamResultHandler(db *sql.DB) *ExamResultHandler {
	return &ExamResultHandler{DB: db}
}

type SubmitExamRequest struct {
	ExamID      int                    `json:"exam_id" binding:"required"`
	StudentID   int                    `json:"student_id" binding:"required"`
	Answers     map[int]string         `json:"answers" binding:"required"`
	StartedAt   string                 `json:"started_at"`
	CompletedAt string                 `json:"completed_at"`
}

func (h *ExamResultHandler) SubmitExam(c *gin.Context) {
	var req SubmitExamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := h.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	var exam models.Exam
	err = tx.QueryRow(`
		SELECT id, passing_score, total_points 
		FROM exams WHERE id = $1
	`, req.ExamID).Scan(&exam.ID, &exam.PassingScore, &exam.TotalPoints)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalEarnedPoints := 0
	
	for questionID, selectedAnswer := range req.Answers {
		var correctAnswer string
		var points int
		
		err := tx.QueryRow(`
			SELECT correct_answer, points FROM questions WHERE id = $1 AND exam_id = $2
		`, questionID, req.ExamID).Scan(&correctAnswer, &points)
		
		if err != nil {
			continue
		}
		
		isCorrect := (selectedAnswer == correctAnswer)
		if isCorrect {
			totalEarnedPoints += points
		}
	}

	score := float64(totalEarnedPoints) / float64(exam.TotalPoints) * 100
	status := "failed"
	if score >= float64(exam.PassingScore) {
		status = "passed"
	}

	var examResult models.ExamResult
	err = tx.QueryRow(`
		INSERT INTO exam_results (exam_id, student_id, score, total_points, status, started_at, completed_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id, created_at, updated_at
	`, req.ExamID, req.StudentID, score, exam.TotalPoints, status, req.StartedAt, req.CompletedAt).Scan(&examResult.ID, &examResult.CreatedAt, &examResult.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for questionID, selectedAnswer := range req.Answers {
		var correctAnswer string
		var points int
		
		err := tx.QueryRow(`
			SELECT correct_answer, points FROM questions WHERE id = $1 AND exam_id = $2
		`, questionID, req.ExamID).Scan(&correctAnswer, &points)
		
		if err != nil {
			continue
		}
		
		isCorrect := (selectedAnswer == correctAnswer)
		pointsEarned := 0
		if isCorrect {
			pointsEarned = points
		}

		_, err = tx.Exec(`
			INSERT INTO answers (exam_result_id, question_id, selected_answer, is_correct, points_earned) 
			VALUES ($1, $2, $3, $4, $5)
		`, examResult.ID, questionID, selectedAnswer, isCorrect, pointsEarned)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	examResult.ExamID = req.ExamID
	examResult.StudentID = req.StudentID
	examResult.Score = score
	examResult.TotalPoints = exam.TotalPoints
	examResult.Status = status

	c.JSON(http.StatusCreated, examResult)
}

func (h *ExamResultHandler) GetExamResults(c *gin.Context) {
	studentID := c.Query("student_id")
	examID := c.Query("exam_id")

	query := `
		SELECT er.id, er.exam_id, er.student_id, er.score, er.total_points, er.status, 
		       er.started_at, er.completed_at, er.time_taken, er.created_at, er.updated_at,
		       s.first_name, s.last_name, e.title as exam_title
		FROM exam_results er
		JOIN students s ON er.student_id = s.id
		JOIN exams e ON er.exam_id = e.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if studentID != "" {
		query += " AND er.student_id = $" + string(rune(argIndex))
		args = append(args, studentID)
		argIndex++
	}

	if examID != "" {
		query += " AND er.exam_id = $" + string(rune(argIndex))
		args = append(args, examID)
		argIndex++
	}

	query += " ORDER BY er.created_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var er models.ExamResult
		var firstName, lastName, examTitle string
		if err := rows.Scan(&er.ID, &er.ExamID, &er.StudentID, &er.Score, &er.TotalPoints, &er.Status, 
			&er.StartedAt, &er.CompletedAt, &er.TimeTaken, &er.CreatedAt, &er.UpdatedAt,
			&firstName, &lastName, &examTitle); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		results = append(results, map[string]interface{}{
			"id":         er.ID,
			"exam_id":    er.ExamID,
			"exam_title": examTitle,
			"student_id": er.StudentID,
			"student_name": firstName + " " + lastName,
			"score":      er.Score,
			"total_points": er.TotalPoints,
			"status":     er.Status,
			"started_at": er.StartedAt,
			"completed_at": er.CompletedAt,
			"time_taken": er.TimeTaken,
			"created_at": er.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, results)
}

func (h *ExamResultHandler) GetExamResultDetails(c *gin.Context) {
	id := c.Param("id")
	var er models.ExamResult
	var studentName, examTitle string

	err := h.DB.QueryRow(`
		SELECT er.id, er.exam_id, er.student_id, er.score, er.total_points, er.status, 
		       er.started_at, er.completed_at, er.time_taken, er.created_at, er.updated_at,
		       s.first_name || ' ' || s.last_name as student_name, e.title as exam_title
		FROM exam_results er
		JOIN students s ON er.student_id = s.id
		JOIN exams e ON er.exam_id = e.id
		WHERE er.id = $1
	`, id).Scan(&er.ID, &er.ExamID, &er.StudentID, &er.Score, &er.TotalPoints, &er.Status, 
		&er.StartedAt, &er.CompletedAt, &er.TimeTaken, &er.CreatedAt, &er.UpdatedAt,
		&studentName, &examTitle)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exam result not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := h.DB.Query(`
		SELECT a.id, a.question_id, a.selected_answer, a.is_correct, a.points_earned, a.created_at,
		       q.question_text, q.correct_answer, q.points
		FROM answers a
		JOIN questions q ON a.question_id = q.id
		WHERE a.exam_result_id = $1
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var answers []map[string]interface{}
	for rows.Next() {
		var a models.Answer
		var questionText, correctAnswer string
		var questionPoints int
		if err := rows.Scan(&a.ID, &a.QuestionID, &a.SelectedAnswer, &a.IsCorrect, &a.PointsEarned, &a.CreatedAt,
			&questionText, &correctAnswer, &questionPoints); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		var options []string
		if q.Options != nil {
			json.Unmarshal([]byte(q.Options), &options)
		}

		answers = append(answers, map[string]interface{}{
			"id":              a.ID,
			"question_id":     a.QuestionID,
			"question_text":   questionText,
			"options":         options,
			"correct_answer":  correctAnswer,
			"points":          questionPoints,
			"selected_answer": a.SelectedAnswer,
			"is_correct":     a.IsCorrect,
			"points_earned":  a.PointsEarned,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"exam_result": map[string]interface{}{
			"id":          er.ID,
			"exam_id":     er.ExamID,
			"exam_title":  examTitle,
			"student_id":  er.StudentID,
			"student_name": studentName,
			"score":       er.Score,
			"total_points": er.TotalPoints,
			"status":      er.Status,
			"started_at":  er.StartedAt,
			"completed_at": er.CompletedAt,
			"time_taken":  er.TimeTaken,
			"created_at":  er.CreatedAt,
		},
		"answers": answers,
	})
}
