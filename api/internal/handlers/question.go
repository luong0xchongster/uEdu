package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type QuestionHandler struct {
	DB *sql.DB
}

func NewQuestionHandler(db *sql.DB) *QuestionHandler {
	return &QuestionHandler{DB: db}
}

func (h *QuestionHandler) GetQuestions(c *gin.Context) {
	examID := c.Param("exam_id")
	rows, err := h.DB.Query(`
		SELECT id, exam_id, question_text, question_type, options, correct_answer, points, order_num, 
		       passage, audio_url, explanation, grading_rubric, created_at, updated_at 
		FROM questions WHERE exam_id = $1 ORDER BY order_num ASC
	`, examID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var q models.Question
		if err := rows.Scan(&q.ID, &q.ExamID, &q.QuestionText, &q.QuestionType, &q.Options, 
			&q.CorrectAnswer, &q.Points, &q.Order, &q.Passage, &q.AudioURL, &q.Explanation, 
			&q.GradingRubric, &q.CreatedAt, &q.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, questions)
}

func (h *QuestionHandler) GetQuestion(c *gin.Context) {
	id := c.Param("id")
	var q models.Question
	err := h.DB.QueryRow(`
		SELECT id, exam_id, question_text, question_type, options, correct_answer, points, order_num, 
		       passage, audio_url, explanation, grading_rubric, created_at, updated_at 
		FROM questions WHERE id = $1
	`, id).Scan(&q.ID, &q.ExamID, &q.QuestionText, &q.QuestionType, &q.Options, 
		&q.CorrectAnswer, &q.Points, &q.Order, &q.Passage, &q.AudioURL, &q.Explanation, 
		&q.GradingRubric, &q.CreatedAt, &q.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, q)
}

func (h *QuestionHandler) CreateQuestion(c *gin.Context) {
	var q models.Question
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points, order_num, passage, audio_url, explanation, grading_rubric) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
		RETURNING id, created_at, updated_at
	`, q.ExamID, q.QuestionText, q.QuestionType, q.Options, q.CorrectAnswer, q.Points, q.Order, 
		q.Passage, q.AudioURL, q.Explanation, q.GradingRubric).Scan(&q.ID, &q.CreatedAt, &q.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, q)
}

func (h *QuestionHandler) UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	var q models.Question
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE questions 
		SET exam_id=$1, question_text=$2, question_type=$3, options=$4, correct_answer=$5, 
		    points=$6, order_num=$7, passage=$8, audio_url=$9, explanation=$10, grading_rubric=$11, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$12
	`, q.ExamID, q.QuestionText, q.QuestionType, q.Options, q.CorrectAnswer, q.Points, q.Order, 
		q.Passage, q.AudioURL, q.Explanation, q.GradingRubric, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, q)
}

func (h *QuestionHandler) DeleteQuestion(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM questions WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question deleted successfully"})
}
