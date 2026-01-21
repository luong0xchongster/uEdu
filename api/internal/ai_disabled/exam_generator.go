package ai

import (
	"context"
	"fmt"
	"os"

	"github.com/sashabaranov/go-openai"
)

var Client *openai.Client

func InitClient() {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		panic("OPENAI_API_KEY environment variable is not set")
	}
	Client = openai.NewClient(apiKey)
}

type ExamGeneratorRequest struct {
	ExamType     string   `json:"exam_type" binding:"required"`
	Level        string   `json:"level" binding:"required"`
	Skills       []string `json:"skills" binding:"required"`
	QuestionCount int     `json:"question_count" binding:"required"`
	Difficulty   string   `json:"difficulty"`
}

type Question struct {
	QuestionText string   `json:"question_text"`
	QuestionType string   `json:"question_type"`
	Options      []string `json:"options,omitempty"`
	CorrectAnswer string  `json:"correct_answer"`
	Points       int      `json:"points"`
	Explanation  string   `json:"explanation"`
	Passage      string   `json:"passage,omitempty"`
}

type ExamGeneratorResponse struct {
	ExamTitle    string     `json:"exam_title"`
	ExamType     string     `json:"exam_type"`
	Level        string     `json:"level"`
	Duration     int        `json:"duration"`
	PassingScore int        `json:"passing_score"`
	TotalPoints  int        `json:"total_points"`
	Questions    []Question `json:"questions"`
}

func GenerateExam(req ExamGeneratorRequest) (*ExamGeneratorResponse, error) {
	if Client == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	skillsText := ""
	for i, skill := range req.Skills {
		if i > 0 {
			skillsText += ", "
		}
		skillsText += skill
	}

	difficulty := req.Difficulty
	if difficulty == "" {
		difficulty = req.Level
	}

	prompt := fmt.Sprintf(`You are an expert English language test designer. Generate a %s exam for %s level (CEFR standard).

Exam Details:
- Type: %s
- Level: %s
- Skills to test: %s
- Number of questions: %d
- Difficulty: %s

Requirements:
1. Follow CEFR standards for %s level
2. Generate %d unique, high-quality questions
3. Balance question types among these options:
   - multiple_choice (grammar, vocabulary)
   - true_false (grammar, vocabulary)
   - short_answer (grammar, vocabulary)
   - fill_blank (grammar usage)
   - matching (vocabulary)
   - reading_comprehension (with passage)
   - writing (short answer/paragraph for AI grading)
4. Each question should have 1-3 points based on complexity
5. Include clear, concise correct answers
6. Add brief explanations for each answer
7. Ensure total points sum to 100
8. Make questions challenging but appropriate for the level
9. Avoid repetition and ensure variety
10. For reading comprehension, include a short passage (100-150 words) and 3-5 questions about it

Return the response as a JSON object with this structure:
{
  "exam_title": "string",
  "exam_type": "%s",
  "level": "%s",
  "duration": 60,
  "passing_score": 60,
  "total_points": 100,
  "questions": [
    {
      "question_text": "string",
      "question_type": "multiple_choice|true_false|short_answer|fill_blank|matching|reading_comprehension|writing",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "string or number",
      "points": 1,
      "explanation": "string",
      "passage": "string (only for reading_comprehension)"
    }
  ]
}

Ensure the JSON is valid and complete.`, req.ExamType, req.Level, req.ExamType, req.Level, skillsText, req.QuestionCount, difficulty, req.Level, req.QuestionCount, req.ExamType, req.Level)

	resp, err := Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: "You are an expert English language test designer specializing in CEFR-aligned assessments. You generate high-quality, balanced exams with diverse question types. Always respond with valid JSON.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			Temperature: 0.7,
			ResponseFormat: &openai.ChatCompletionNewFormat{
				Type: openai.ChatCompletionNewFormatTypeJSONObject,
			},
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate exam: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	var result ExamGeneratorResponse
	if err := parseJSONResponse(resp.Choices[0].Message.Content, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}
