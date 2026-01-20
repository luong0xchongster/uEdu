package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/sashabaranov/go-openai"
)

type WritingEvaluationRequest struct {
	QuestionID    int    `json:"question_id"`
	QuestionText  string `json:"question_text" binding:"required"`
	StudentAnswer string `json:"student_answer" binding:"required"`
	StudentLevel  string `json:"student_level"`
	MaxPoints     int    `json:"max_points"`
}

type WritingEvaluationResponse struct {
	Score         int     `json:"score"`
	MaxScore      int     `json:"max_score"`
	Feedback      string  `json:"feedback"`
	Strengths     []string `json:"strengths"`
	Improvements  []string `json:"improvements"`
	CorrectedText string  `json:"corrected_text,omitempty"`
	Suggestions   string  `json:"suggestions"`
}

type GradingRubric struct {
	Criteria     string `json:"criteria"`
	MaxPoints    int    `json:"max_points"`
	Description  string `json:"description"`
}

func EvaluateWriting(req WritingEvaluationRequest) (*WritingEvaluationResponse, error) {
	if Client == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	level := req.StudentLevel
	if level == "" {
		level = "B1"
	}

	maxPoints := req.MaxPoints
	if maxPoints == 0 {
		maxPoints = 10
	}

	prompt := fmt.Sprintf(`You are an expert English language grader. Evaluate the following writing answer.

Question: %s
Student Level: %s (CEFR)
Student Answer: %s

Grading Criteria (Total: %d points):
1. Grammar Accuracy (30%%) - Correct verb tenses, sentence structure, and grammar rules
2. Vocabulary (25%%) - Appropriate word choice, variety, and precision
3. Content & Relevance (25%%) - Addresses the prompt, stays on topic, provides relevant information
4. Coherence & Organization (20%%) - Logical flow, paragraph structure, transitions

Instructions:
1. Score the answer out of %d total points based on the criteria above
2. Provide constructive, encouraging feedback
3. Identify 2-3 strengths in the student's writing
4. Identify 2-3 areas for improvement
5. Optionally provide a corrected version with better grammar/vocabulary
6. Give specific, actionable suggestions for improvement
7. Be fair and encouraging

Return the response as a JSON object with this structure:
{
  "score": number (0-%d),
  "max_score": %d,
  "feedback": "string (overall feedback)",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "corrected_text": "string (optional corrected version)",
  "suggestions": "string (specific suggestions)"
}

Ensure the JSON is valid and complete.`, req.QuestionText, level, req.StudentAnswer, maxPoints, maxPoints, maxPoints, maxPoints)

	resp, err := Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: "You are an expert English language grader. You evaluate student writing based on grammar, vocabulary, content, and organization. You provide fair, encouraging, and actionable feedback. Always respond with valid JSON.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			Temperature: 0.6,
			ResponseFormat: &openai.ChatCompletionNewFormat{
				Type: openai.ChatCompletionNewFormatTypeJSONObject,
			},
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to evaluate writing: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	var result WritingEvaluationResponse
	if err := parseJSONResponse(resp.Choices[0].Message.Content, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	result.MaxScore = maxPoints

	return &result, nil
}

func GenerateGradingRubric(questionText string, questionType string, maxPoints int, level string) ([]GradingRubric, error) {
	if Client == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	if maxPoints == 0 {
		maxPoints = 10
	}

	prompt := fmt.Sprintf(`Generate a detailed grading rubric for the following writing question.

Question Type: %s
Question: %s
Student Level: %s (CEFR)
Max Points: %d

Create 3-5 grading criteria with point distributions that sum to %d points.
Each criterion should have a clear description of what is expected at this level.

Return the response as a JSON array with this structure:
[
  {
    "criteria": "string (e.g., Grammar Accuracy)",
    "max_points": number,
    "description": "string (detailed description of expectations)"
  }
]

Ensure the JSON is valid and complete.`, questionType, questionText, level, maxPoints, maxPoints)

	resp, err := Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: "You are an expert English language assessor. You create clear, fair grading rubrics aligned with CEFR standards. Always respond with valid JSON.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			Temperature: 0.5,
			ResponseFormat: &openai.ChatCompletionNewFormat{
				Type: openai.ChatCompletionNewFormatTypeJSONObject,
			},
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate rubric: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	var rubrics []GradingRubric
	if err := parseJSONResponse(resp.Choices[0].Message.Content, &rubrics); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return rubrics, nil
}

func parseJSONResponse(content string, target interface{}) error {
	startIdx := strings.Index(content, "{")
	if startIdx == -1 {
		startIdx = strings.Index(content, "[")
	}
	if startIdx == -1 {
		return fmt.Errorf("no JSON found in response")
	}

	jsonStr := content[startIdx:]
	
	var err error
	if strings.HasPrefix(jsonStr, "{") {
		err = json.Unmarshal([]byte(jsonStr), target)
	} else {
		err = json.Unmarshal([]byte(jsonStr), target)
	}
	
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	
	return nil
}
