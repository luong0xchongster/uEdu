package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"uedu-api/internal/ai"
	"uedu-api/internal/database"
	"uedu-api/internal/handlers"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	if err := database.RunMigrations(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	ai.InitClient()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		studentHandler := handlers.NewStudentHandler(database.DB)
		api.GET("/students", studentHandler.GetStudents)
		api.GET("/students/:id", studentHandler.GetStudent)
		api.POST("/students", studentHandler.CreateStudent)
		api.PUT("/students/:id", studentHandler.UpdateStudent)
		api.DELETE("/students/:id", studentHandler.DeleteStudent)

		teacherHandler := handlers.NewTeacherHandler(database.DB)
		api.GET("/teachers", teacherHandler.GetTeachers)
		api.GET("/teachers/:id", teacherHandler.GetTeacher)
		api.POST("/teachers", teacherHandler.CreateTeacher)
		api.PUT("/teachers/:id", teacherHandler.UpdateTeacher)
		api.DELETE("/teachers/:id", teacherHandler.DeleteTeacher)

		courseHandler := handlers.NewCourseHandler(database.DB)
		api.GET("/courses", courseHandler.GetCourses)
		api.GET("/courses/:id", courseHandler.GetCourse)
		api.POST("/courses", courseHandler.CreateCourse)
		api.PUT("/courses/:id", courseHandler.UpdateCourse)
		api.DELETE("/courses/:id", courseHandler.DeleteCourse)

		examHandler := handlers.NewExamHandler(database.DB)
		api.GET("/exams", examHandler.GetExams)
		api.GET("/exams/:id", examHandler.GetExam)
		api.GET("/exams/:id/with-questions", examHandler.GetExamWithQuestions)
		api.POST("/exams", examHandler.CreateExam)
		api.PUT("/exams/:id", examHandler.UpdateExam)
		api.DELETE("/exams/:id", examHandler.DeleteExam)

		questionHandler := handlers.NewQuestionHandler(database.DB)
		api.GET("/exams/:exam_id/questions", questionHandler.GetQuestions)
		api.GET("/questions/:id", questionHandler.GetQuestion)
		api.POST("/questions", questionHandler.CreateQuestion)
		api.PUT("/questions/:id", questionHandler.UpdateQuestion)
		api.DELETE("/questions/:id", questionHandler.DeleteQuestion)

		examResultHandler := handlers.NewExamResultHandler(database.DB)
		api.POST("/exam-results/submit", examResultHandler.SubmitExam)
		api.GET("/exam-results", examResultHandler.GetExamResults)
		api.GET("/exam-results/:id/details", examResultHandler.GetExamResultDetails)

		aiHandler := handlers.NewAIHandler()
		ai := api.Group("/ai")
		{
			ai.POST("/exam-generator", aiHandler.GenerateExam)
			ai.POST("/chatbot", aiHandler.ChatWithBot)
			ai.DELETE("/chatbot/:student_id", aiHandler.ClearChatHistory)
			ai.POST("/grading/writing", aiHandler.EvaluateWriting)
			ai.POST("/grading/rubric", aiHandler.GenerateRubric)
			ai.POST("/adaptive-difficulty", aiHandler.AdaptiveDifficulty)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
