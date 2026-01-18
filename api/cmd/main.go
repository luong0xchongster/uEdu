package main

import (
	"log"

	"uedu-api/internal/database"
	"uedu-api/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	if err := database.RunMigrations(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	studentHandler := handlers.NewStudentHandler(database.DB)
	teacherHandler := handlers.NewTeacherHandler(database.DB)
	courseHandler := handlers.NewCourseHandler(database.DB)

	api := r.Group("/api")
	{
		students := api.Group("/students")
		{
			students.GET("", studentHandler.GetStudents)
			students.GET("/:id", studentHandler.GetStudent)
			students.POST("", studentHandler.CreateStudent)
			students.PUT("/:id", studentHandler.UpdateStudent)
			students.DELETE("/:id", studentHandler.DeleteStudent)
		}

		teachers := api.Group("/teachers")
		{
			teachers.GET("", teacherHandler.GetTeachers)
			teachers.GET("/:id", teacherHandler.GetTeacher)
			teachers.POST("", teacherHandler.CreateTeacher)
			teachers.PUT("/:id", teacherHandler.UpdateTeacher)
			teachers.DELETE("/:id", teacherHandler.DeleteTeacher)
		}

		courses := api.Group("/courses")
		{
			courses.GET("", courseHandler.GetCourses)
			courses.GET("/:id", courseHandler.GetCourse)
			courses.POST("", courseHandler.CreateCourse)
			courses.PUT("/:id", courseHandler.UpdateCourse)
			courses.DELETE("/:id", courseHandler.DeleteCourse)
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
