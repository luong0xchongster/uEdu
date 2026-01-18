package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type TeacherHandler struct {
	DB *sql.DB
}

func NewTeacherHandler(db *sql.DB) *TeacherHandler {
	return &TeacherHandler{DB: db}
}

func (h *TeacherHandler) GetTeachers(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT id, first_name, last_name, email, phone, specialty, created_at, updated_at 
		FROM teachers ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var teachers []models.Teacher
	for rows.Next() {
		var t models.Teacher
		if err := rows.Scan(&t.ID, &t.FirstName, &t.LastName, &t.Email, &t.Phone, &t.Specialty, &t.CreatedAt, &t.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		teachers = append(teachers, t)
	}

	c.JSON(http.StatusOK, teachers)
}

func (h *TeacherHandler) GetTeacher(c *gin.Context) {
	id := c.Param("id")
	var t models.Teacher
	err := h.DB.QueryRow(`
		SELECT id, first_name, last_name, email, phone, specialty, created_at, updated_at 
		FROM teachers WHERE id = $1
	`, id).Scan(&t.ID, &t.FirstName, &t.LastName, &t.Email, &t.Phone, &t.Specialty, &t.CreatedAt, &t.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TeacherHandler) CreateTeacher(c *gin.Context) {
	var t models.Teacher
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO teachers (first_name, last_name, email, phone, specialty) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, created_at, updated_at
	`, t.FirstName, t.LastName, t.Email, t.Phone, t.Specialty).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, t)
}

func (h *TeacherHandler) UpdateTeacher(c *gin.Context) {
	id := c.Param("id")
	var t models.Teacher
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE teachers 
		SET first_name=$1, last_name=$2, email=$3, phone=$4, specialty=$5, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$6
	`, t.FirstName, t.LastName, t.Email, t.Phone, t.Specialty, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TeacherHandler) DeleteTeacher(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM teachers WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Teacher deleted successfully"})
}
