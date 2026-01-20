package ai

import (
	"context"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

type ChatbotRequest struct {
	StudentID      string `json:"student_id"`
	Message        string `json:"message" binding:"required"`
	StudentLevel   string `json:"student_level"`
	CourseProgress string `json:"course_progress"`
	ExamContext    string `json:"exam_context"`
}

type ChatbotResponse struct {
	Reply      string `json:"reply"`
	IsHelpful  bool   `json:"is_helpful"`
	SuggestTopic string `json:"suggest_topic,omitempty"`
}

type ChatHistory struct {
	Messages []openai.ChatCompletionMessage
}

var chatHistories = make(map[string]*ChatHistory)

func ChatWithStudent(req ChatbotRequest) (*ChatbotResponse, error) {
	if Client == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	history, exists := chatHistories[req.StudentID]
	if !exists {
		history = &ChatHistory{
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: `You are a helpful, friendly AI tutor for an English academy. Your role is to:

1. Answer questions about English grammar, vocabulary, and language concepts
2. Provide explanations for exam questions (but NOT direct answers during active exams)
3. Give study tips and learning strategies
4. Help students understand their mistakes and how to improve
5. Guide students on how to use the platform

Important Rules:
- DO NOT provide direct answers to exam questions during an active exam
- During exams, explain the CONCEPT behind questions instead
- Encourage students to think and learn independently
- Be supportive and encouraging
- Adapt explanations to the student's English level
- Keep responses concise and easy to understand
- Use examples when helpful

If a student asks for an exam answer during an active exam, gently explain that you cannot provide the answer directly, but you can explain the concept being tested.`,
				},
			},
		}
		chatHistories[req.StudentID] = history
	}

	if req.StudentLevel != "" {
		history.Messages = append(history.Messages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleSystem,
			Content: fmt.Sprintf("Student level: %s (CEFR)", req.StudentLevel),
		})
	}

	if req.CourseProgress != "" {
		history.Messages = append(history.Messages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleSystem,
			Content: fmt.Sprintf("Current course progress: %s", req.CourseProgress),
		})
	}

	if req.ExamContext != "" {
		history.Messages = append(history.Messages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleSystem,
			Content: fmt.Sprintf("Exam context: %s (ACTIVE EXAM - NO DIRECT ANSWERS)", req.ExamContext),
		})
	}

	history.Messages = append(history.Messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: req.Message,
	})

	resp, err := Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: history.Messages,
			Temperature: 0.8,
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get chat response: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	reply := resp.Choices[0].Message.Content

	history.Messages = append(history.Messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleAssistant,
		Content: reply,
	})

	if len(history.Messages) > 20 {
		history.Messages = append([]openai.ChatCompletionMessage{history.Messages[0]}, history.Messages[len(history.Messages)-19:]...)
	}

	response := &ChatbotResponse{
		Reply:     reply,
		IsHelpful: true,
	}

	return response, nil
}

func ClearChatHistory(studentID string) {
	delete(chatHistories, studentID)
}
