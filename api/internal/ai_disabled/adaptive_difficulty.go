package ai

import (
	"context"
	"fmt"
	"math"

	"github.com/sashabaranov/go-openai"
)

type AdaptiveDifficultyRequest struct {
	CurrentLevel     string  `json:"current_level"`
	CorrectAnswers   int     `json:"correct_answers"`
	TotalQuestions   int     `json:"total_questions"`
	RecentQuestions  []Question `json:"recent_questions"`
	StudentID       string  `json:"student_id"`
}

type AdaptiveDifficultyResponse struct {
	RecommendedLevel string   `json:"recommended_level"`
	Confidence      float64  `json:"confidence"`
	Weaknesses      []string `json:"weaknesses"`
	Strengths       []string `json:"strengths"`
	NextQuestion   *Question `json:"next_question,omitempty"`
}

func DetermineAdaptiveDifficulty(req AdaptiveDifficultyRequest) (*AdaptiveDifficultyResponse, error) {
	if Client == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	accuracy := 0.0
	if req.TotalQuestions > 0 {
		accuracy = float64(req.CorrectAnswers) / float64(req.TotalQuestions)
	}

	levels := []string{"A1", "A2", "B1", "B2", "C1", "C2"}
	currentLevelIndex := -1
	for i, level := range levels {
		if level == req.CurrentLevel {
			currentLevelIndex = i
			break
		}
	}

	recommendedLevel := req.CurrentLevel
	confidence := 0.5

	if currentLevelIndex >= 0 {
		if accuracy >= 0.9 && currentLevelIndex < len(levels)-1 {
			recommendedLevel = levels[currentLevelIndex+1]
			confidence = 0.85
		} else if accuracy >= 0.75 && accuracy < 0.9 {
			recommendedLevel = req.CurrentLevel
			confidence = 0.9
		} else if accuracy >= 0.6 && accuracy < 0.75 {
			recommendedLevel = req.CurrentLevel
			confidence = 0.75
		} else if accuracy < 0.6 && currentLevelIndex > 0 {
			recommendedLevel = levels[currentLevelIndex-1]
			confidence = 0.8
		}
	}

	recentQuestionsText := ""
	for i, q := range req.RecentQuestions {
		if i > 0 {
			recentQuestionsText += "\n"
		}
		recentQuestionsText += fmt.Sprintf("Q%d: %s (Type: %s, Correct: %v)",
			i+1, q.QuestionText, q.QuestionType, len(q.CorrectAnswer) > 0)
	}

	prompt := fmt.Sprintf(`You are an expert English language assessor specializing in CEFR level placement.

Student Performance:
- Current Level: %s
- Accuracy: %.2f%% (%d/%d correct)
- Recommended Level: %s

Recent Questions Answered:
%s

Your Task:
1. Analyze the student's performance
2. Identify specific strengths (grammar areas, vocabulary domains, etc.)
3. Identify specific weaknesses (areas needing improvement)
4. Provide confidence score (0-1) for the recommended level
5. Suggest the next question type to test (to verify the level assessment)

Return the response as a JSON object with this structure:
{
  "recommended_level": "%s",
  "confidence": number (0-1),
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "next_question_type": "multiple_choice|true_false|fill_blank|reading_comprehension|writing"
}

Be specific and helpful in your analysis.`, 
		req.CurrentLevel, accuracy*100, req.CorrectAnswers, req.TotalQuestions, recommendedLevel,
		recentQuestionsText, recommendedLevel)

	resp, err := Client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: "You are an expert English language assessor specializing in CEFR level placement and adaptive testing algorithms. Always respond with valid JSON.",
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
		return &AdaptiveDifficultyResponse{
			RecommendedLevel: recommendedLevel,
			Confidence:      confidence,
			Strengths:       []string{},
			Weaknesses:      []string{},
		}, nil
	}

	if len(resp.Choices) == 0 {
		return &AdaptiveDifficultyResponse{
			RecommendedLevel: recommendedLevel,
			Confidence:      confidence,
			Strengths:       []string{},
			Weaknesses:      []string{},
		}, nil
	}

	var result struct {
		RecommendedLevel string   `json:"recommended_level"`
		Confidence      float64  `json:"confidence"`
		Strengths       []string `json:"strengths"`
		Weaknesses      []string `json:"weaknesses"`
		NextQuestionType string   `json:"next_question_type"`
	}

	if err := parseJSONResponse(resp.Choices[0].Message.Content, &result); err != nil {
		return &AdaptiveDifficultyResponse{
			RecommendedLevel: recommendedLevel,
			Confidence:      confidence,
			Strengths:       []string{},
			Weaknesses:      []string{},
		}, nil
	}

	return &AdaptiveDifficultyResponse{
		RecommendedLevel: result.RecommendedLevel,
		Confidence:      math.Round(result.Confidence*100) / 100,
		Strengths:       result.Strengths,
		Weaknesses:      result.Weaknesses,
	}, nil
}
