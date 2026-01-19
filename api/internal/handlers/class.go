package handlers

import (
	"database/sql"
	"net/http"
	"uedu-api/internal/models"

	"github.com/gin-gonic/gin"
)

type ClassHandler struct {
	DB *sql.DB
}

func NewClassHandler(db *sql.DB) *ClassHandler {
	return &ClassHandler{DB: db}
}

func (h *ClassHandler) GetClasses(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT c.id, c.course_id, c.teacher_id, c.title, c.description, c.class_date, 
		       c.duration, c.room, c.created_at, c.updated_at,
		       co.name as course_name, 
		       t.first_name as teacher_first_name, t.last_name as teacher_last_name
		FROM classes c
		LEFT JOIN courses co ON c.course_id = co.id
		LEFT JOIN teachers t ON c.teacher_id = t.id
		ORDER BY c.class_date ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var classes []models.ClassWithDetails
	for rows.Next() {
		var class models.ClassWithDetails
		if err := rows.Scan(&class.ID, &class.CourseID, &class.TeacherID, &class.Title, 
			&class.Description, &class.ClassDate, &class.Duration, &class.Room, 
			&class.CreatedAt, &class.UpdatedAt, &class.CourseName, &class.TeacherFirstName, 
			&class.TeacherLastName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		classes = append(classes, class)
	}

	c.JSON(http.StatusOK, classes)
}

func (h *ClassHandler) GetClass(c *gin.Context) {
	id := c.Param("id")
	var class models.ClassWithDetails
	err := h.DB.QueryRow(`
		SELECT c.id, c.course_id, c.teacher_id, c.title, c.description, c.class_date, 
		       c.duration, c.room, c.created_at, c.updated_at,
		       co.name as course_name, 
		       t.first_name as teacher_first_name, t.last_name as teacher_last_name
		FROM classes c
		LEFT JOIN courses co ON c.course_id = co.id
		LEFT JOIN teachers t ON c.teacher_id = t.id
		WHERE c.id = $1
	`, id).Scan(&class.ID, &class.CourseID, &class.TeacherID, &class.Title, 
		&class.Description, &class.ClassDate, &class.Duration, &class.Room, 
		&class.CreatedAt, &class.UpdatedAt, &class.CourseName, &class.TeacherFirstName, 
		&class.TeacherLastName)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, class)
}

func (h *ClassHandler) CreateClass(c *gin.Context) {
	var class models.Class
	if err := c.ShouldBindJSON(&class); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO classes (course_id, teacher_id, title, description, class_date, duration, room) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id, created_at, updated_at
	`, class.CourseID, class.TeacherID, class.Title, class.Description, 
		class.ClassDate, class.Duration, class.Room).Scan(&class.ID, &class.CreatedAt, &class.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, class)
}

func (h *ClassHandler) UpdateClass(c *gin.Context) {
	id := c.Param("id")
	var class models.Class
	if err := c.ShouldBindJSON(&class); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(`
		UPDATE classes 
		SET course_id=$1, teacher_id=$2, title=$3, description=$4, class_date=$5, 
		    duration=$6, room=$7, updated_at=CURRENT_TIMESTAMP 
		WHERE id=$8
	`, class.CourseID, class.TeacherID, class.Title, class.Description, 
		class.ClassDate, class.Duration, class.Room, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Class updated successfully"})
}

func (h *ClassHandler) DeleteClass(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec("DELETE FROM classes WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Class deleted successfully"})
}

func (h *ClassHandler) GetClassesByTeacher(c *gin.Context) {
	teacherID := c.Param("teacher_id")

	rows, err := h.DB.Query(`
		SELECT c.id, c.course_id, c.teacher_id, c.title, c.description, c.class_date, 
		       c.duration, c.room, c.created_at, c.updated_at,
		       co.name as course_name
		FROM classes c
		LEFT JOIN courses co ON c.course_id = co.id
		WHERE c.teacher_id = $1
		ORDER BY c.class_date ASC
	`, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var classes []models.ClassWithDetails
	for rows.Next() {
		var class models.ClassWithDetails
		if err := rows.Scan(&class.ID, &class.CourseID, &class.TeacherID, &class.Title, 
			&class.Description, &class.ClassDate, &class.Duration, &class.Room, 
			&class.CreatedAt, &class.UpdatedAt, &class.CourseName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		classes = append(classes, class)
	}

	c.JSON(http.StatusOK, classes)
}

func (h *ClassHandler) GetClassesByStudent(c *gin.Context) {
	studentID := c.Param("student_id")

	rows, err := h.DB.Query(`
		SELECT c.id, c.course_id, c.teacher_id, c.title, c.description, c.class_date, 
		       c.duration, c.room, c.created_at, c.updated_at,
		       co.name as course_name,
		       t.first_name as teacher_first_name, t.last_name as teacher_last_name
		FROM classes c
		INNER JOIN courses co ON c.course_id = co.id
		INNER JOIN enrollments e ON e.course_id = co.id
		LEFT JOIN teachers t ON c.teacher_id = t.id
		WHERE e.student_id = $1
		ORDER BY c.class_date ASC
	`, studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var classes []models.ClassWithDetails
	for rows.Next() {
		var class models.ClassWithDetails
		if err := rows.Scan(&class.ID, &class.CourseID, &class.TeacherID, &class.Title, 
			&class.Description, &class.ClassDate, &class.Duration, &class.Room, 
			&class.CreatedAt, &class.UpdatedAt, &class.CourseName, 
			&class.TeacherFirstName, &class.TeacherLastName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		classes = append(classes, class)
	}

	c.JSON(http.StatusOK, classes)
}

func (h *ClassHandler) GetAllEvents(c *gin.Context) {
	userType := c.Query("user_type")
	userID := c.Query("user_id")

	var query string
	var args []interface{}

	if userType == "student" {
		query = `
			SELECT 'class' as type, c.id, c.title, c.class_date, c.duration, c.room,
			       co.name as course_name,
			       t.first_name as teacher_first_name, t.last_name as teacher_last_name
			FROM classes c
			INNER JOIN courses co ON c.course_id = co.id
			INNER JOIN enrollments e ON e.course_id = co.id
			LEFT JOIN teachers t ON c.teacher_id = t.id
			WHERE e.student_id = $1
			UNION ALL
			SELECT 'exam' as type, e.id, e.title, e.start_date as class_date, 
			       e.duration as duration, '' as room,
			       co.name as course_name,
			       '' as teacher_first_name, '' as teacher_last_name
			FROM exams e
			INNER JOIN courses co ON e.course_id = co.id
			INNER JOIN enrollments en ON en.course_id = co.id
			WHERE en.student_id = $1
			ORDER BY class_date ASC
		`
		args = []interface{}{userID}
	} else if userType == "teacher" {
		query = `
			SELECT 'class' as type, c.id, c.title, c.class_date, c.duration, c.room,
			       co.name as course_name,
			       t.first_name as teacher_first_name, t.last_name as teacher_last_name
			FROM classes c
			INNER JOIN courses co ON c.course_id = co.id
			LEFT JOIN teachers t ON c.teacher_id = t.id
			WHERE c.teacher_id = $1
			UNION ALL
			SELECT 'exam' as type, e.id, e.title, e.start_date as class_date, 
			       e.duration as duration, '' as room,
			       co.name as course_name,
			       '' as teacher_first_name, '' as teacher_last_name
			FROM exams e
			INNER JOIN courses co ON e.course_id = co.id
			WHERE co.teacher_id = $1
			ORDER BY class_date ASC
		`
		args = []interface{}{userID}
	} else {
		query = `
			SELECT 'class' as type, c.id, c.title, c.class_date, c.duration, c.room,
			       co.name as course_name,
			       t.first_name as teacher_first_name, t.last_name as teacher_last_name
			FROM classes c
			LEFT JOIN courses co ON c.course_id = co.id
			LEFT JOIN teachers t ON c.teacher_id = t.id
			UNION ALL
			SELECT 'exam' as type, e.id, e.title, e.start_date as class_date, 
			       e.duration as duration, '' as room,
			       co.name as course_name,
			       '' as teacher_first_name, '' as teacher_last_name
			FROM exams e
			LEFT JOIN courses co ON e.course_id = co.id
			ORDER BY class_date ASC
		`
	}

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var event models.Event
		if err := rows.Scan(&event.Type, &event.ID, &event.Title, &event.Date, 
			&event.Duration, &event.Room, &event.CourseName, &event.TeacherFirstName, 
			&event.TeacherLastName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		events = append(events, event)
	}

	c.JSON(http.StatusOK, events)
}
