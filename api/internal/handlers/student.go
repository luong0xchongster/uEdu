package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type StudentHandler struct {
	DB *sql.DB
}

func NewStudentHandler(db *sql.DB) *StudentHandler {
	return &StudentHandler{DB: db}
}

func (h *StudentHandler) GetStudents(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT id, first_name, last_name, email, phone, level, enrolled_at, created_at, updated_at 
		FROM students ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var students []models.Student
	for rows.Next() {
		var s models.Student
		if err := rows.Scan(&s.ID, &s.FirstName, &s.LastName, &s.Email, &s.Phone, &s.Level, &s.EnrolledAt, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		students = append(students, s)
	}

	c.JSON(http.StatusOK, students)
}

func (h *StudentHandler) GetStudent(c *gin.Context) {
	id := c.Param("id")
	var s models.Student
	err := h.DB.QueryRow(`
		SELECT id, first_name, last_name, email, phone, level, enrolled_at, created_at, updated_at 
		FROM students WHERE id = $1
	`, id).Scan(&s.ID, &s.FirstName, &s.LastName, &s.Email, &s.Phone, &s.Level, &s.EnrolledAt, &s.CreatedAt, &s.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, s)
}

func (h *StudentHandler) CreateStudent(c *gin.Context) {
	var s models.Student
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO students (first_name, last_name, email, phone, level) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, enrolled_at, created_at, updated_at
	`, s.FirstName, s.LastName, s.Email, s.Phone, s.Level).Scan(&s.ID, &s.EnrolledAt, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, s)
}

func (h *StudentHandler) UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var s models.Student
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE students 
		SET first_name=$1, last_name=$2, email=$3, phone=$4, level=$5, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$6
	`, s.FirstName, s.LastName, s.Email, s.Phone, s.Level, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	s.ID, _ = c.Params.Get("id")
	c.JSON(http.StatusOK, s)
}

func (h *StudentHandler) DeleteStudent(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM students WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}
