package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"uedu-api/internal/ai"
)

type AIHandler struct{}

func NewAIHandler() *AIHandler {
	return &AIHandler{}
}

func (h *AIHandler) GenerateExam(c *gin.Context) {
	var req ai.ExamGeneratorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ai.GenerateExam(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *AIHandler) ChatWithBot(c *gin.Context) {
	var req ai.ChatbotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ai.ChatWithStudent(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *AIHandler) ClearChatHistory(c *gin.Context) {
	studentID := c.Param("student_id")
	ai.ClearChatHistory(studentID)
	c.JSON(http.StatusOK, gin.H{"message": "Chat history cleared"})
}

func (h *AIHandler) EvaluateWriting(c *gin.Context) {
	var req ai.WritingEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ai.EvaluateWriting(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

type GradingRubricRequest struct {
	QuestionText string `json:"question_text" binding:"required"`
	QuestionType string `json:"question_type" binding:"required"`
	MaxPoints    int    `json:"max_points"`
	Level        string `json:"level"`
}

func (h *AIHandler) GenerateRubric(c *gin.Context) {
	var req GradingRubricRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ai.GenerateGradingRubric(req.QuestionText, req.QuestionType, req.MaxPoints, req.Level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *AIHandler) AdaptiveDifficulty(c *gin.Context) {
	var req ai.AdaptiveDifficultyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ai.DetermineAdaptiveDifficulty(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
