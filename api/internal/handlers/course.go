package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type CourseHandler struct {
	DB *sql.DB
}

func NewCourseHandler(db *sql.DB) *CourseHandler {
	return &CourseHandler{DB: db}
}

func (h *CourseHandler) GetCourses(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT c.id, c.name, c.description, c.level, c.teacher_id, c.capacity, c.price, 
		       c.start_date, c.end_date, c.created_at, c.updated_at,
		       t.first_name, t.last_name 
		FROM courses c 
		LEFT JOIN teachers t ON c.teacher_id = t.id 
		ORDER BY c.created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var c models.Course
		var teacherFirstName, teacherLastName sql.NullString
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.Level, &c.TeacherID, &c.Capacity, 
			&c.Price, &c.StartDate, &c.EndDate, &c.CreatedAt, &c.UpdatedAt,
			&teacherFirstName, &teacherLastName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		courses = append(courses, c)
	}

	c.JSON(http.StatusOK, courses)
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	id := c.Param("id")
	var c models.Course
	err := h.DB.QueryRow(`
		SELECT id, name, description, level, teacher_id, capacity, price, 
		       start_date, end_date, created_at, updated_at 
		FROM courses WHERE id = $1
	`, id).Scan(&c.ID, &c.Name, &c.Description, &c.Level, &c.TeacherID, &c.Capacity, 
		&c.Price, &c.StartDate, &c.EndDate, &c.CreatedAt, &c.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, c)
}

func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var c models.Course
	if err := c.ShouldBindJSON(&c); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO courses (name, description, level, teacher_id, capacity, price, start_date, end_date) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		RETURNING id, created_at, updated_at
	`, c.Name, c.Description, c.Level, c.TeacherID, c.Capacity, c.Price, c.StartDate, c.EndDate).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, c)
}

func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var c models.Course
	if err := c.ShouldBindJSON(&c); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE courses 
		SET name=$1, description=$2, level=$3, teacher_id=$4, capacity=$5, price=$6, 
		    start_date=$7, end_date=$8, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$9
	`, c.Name, c.Description, c.Level, c.TeacherID, c.Capacity, c.Price, c.StartDate, c.EndDate, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, c)
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM courses WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}
