package handler_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/db"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/handler"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/questions"
	"github.com/gin-gonic/gin"
)

// practiceHardMockStore is an inline mock that implements db.StatisticsStore
// for hard quiz tests.
type practiceHardMockStore struct {
	stats []db.QuestionStat
	err   error
}

func (m *practiceHardMockStore) Record(_ context.Context, _ string, _ bool) error {
	return nil
}

func (m *practiceHardMockStore) GetStats(_ context.Context) ([]db.QuestionStat, error) {
	return m.stats, m.err
}

func (m *practiceHardMockStore) GetHardestStats(_ context.Context) ([]db.QuestionStat, error) {
	return nil, nil
}

func (m *practiceHardMockStore) GetEasiestStats(_ context.Context) ([]db.QuestionStat, error) {
	return nil, nil
}

func (m *practiceHardMockStore) CountTrackedQuestions(_ context.Context) (int, error) {
	return 0, nil
}

func setupPracticeHardRouter(h *handler.Handler) *gin.Engine {
	r := gin.New()
	r.GET("/api/quiz/hard", h.GetHardQuiz)
	return r
}

var practiceHardTestQuestions = []questions.Question{
	{ID: "q1", Text: "Q1?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 0, Category: "Test"},
	{ID: "q2", Text: "Q2?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 1, Category: "Test"},
	{ID: "q3", Text: "Q3?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 2, Category: "Test"},
}

func TestGetPracticeHardQuiz_NoStats_ReturnsEmpty(t *testing.T) {
	mock := &practiceHardMockStore{stats: []db.QuestionStat{}}
	h := handler.NewHandler(practiceHardTestQuestions, mock)
	r := setupPracticeHardRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz/hard", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty slice, got %d questions", len(got))
	}
}

func TestGetPracticeHardQuiz_FewerThan24Attempted_ReturnsAll(t *testing.T) {
	mock := &practiceHardMockStore{
		stats: []db.QuestionStat{
			{QuestionID: "q1", TotalAttempts: 4, CorrectCount: 2}, // 50%
			{QuestionID: "q2", TotalAttempts: 4, CorrectCount: 3}, // 75%
			{QuestionID: "q3", TotalAttempts: 4, CorrectCount: 4}, // 100%
		},
	}
	h := handler.NewHandler(practiceHardTestQuestions, mock)
	r := setupPracticeHardRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz/hard", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 3 {
		t.Errorf("expected 3 questions, got %d", len(got))
	}
	// Should be sorted ascending by accuracy: q1 (50%), q2 (75%), q3 (100%)
	if got[0].ID != "q1" {
		t.Errorf("expected first question to be q1 (lowest accuracy), got %s", got[0].ID)
	}
}

func TestGetPracticeHardQuiz_MoreThan24Attempted_ReturnsCappedAt24(t *testing.T) {
	// Build 30 questions with varying accuracy
	qs := make([]questions.Question, 30)
	stats := make([]db.QuestionStat, 30)
	for i := 0; i < 30; i++ {
		id := fmt.Sprintf("q%d", i+1)
		qs[i] = questions.Question{
			ID:          id,
			Text:        fmt.Sprintf("Q%d?", i+1),
			Options:     []string{"A", "B", "C", "D"},
			AnswerIndex: 0,
			Category:    "Test",
		}
		// accuracy increases with index: q1 = 0/10 = 0%, q30 = 29/30 ≈ 97%
		stats[i] = db.QuestionStat{
			QuestionID:    id,
			TotalAttempts: 10,
			CorrectCount:  i,
		}
	}

	mock := &practiceHardMockStore{stats: stats}
	h := handler.NewHandler(qs, mock)
	r := setupPracticeHardRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz/hard", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 24 {
		t.Errorf("expected 24 questions (capped), got %d", len(got))
	}
	// The 24 lowest-accuracy are q1–q24; q25–q30 should be excluded.
	for _, q := range got {
		for i := 25; i <= 30; i++ {
			if q.ID == fmt.Sprintf("q%d", i) {
				t.Errorf("question %s should have been excluded (high accuracy)", q.ID)
			}
		}
	}
}

func TestGetPracticeHardQuiz_ZeroAttempts_Excluded(t *testing.T) {
	mock := &practiceHardMockStore{
		stats: []db.QuestionStat{
			{QuestionID: "q1", TotalAttempts: 0, CorrectCount: 0}, // 0 attempts — excluded
			{QuestionID: "q2", TotalAttempts: 2, CorrectCount: 1}, // 50%
		},
	}
	h := handler.NewHandler(practiceHardTestQuestions, mock)
	r := setupPracticeHardRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz/hard", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 question (q1 excluded due to 0 attempts), got %d", len(got))
	}
	if got[0].ID != "q2" {
		t.Errorf("expected q2 to be returned, got %s", got[0].ID)
	}
}

func TestGetPracticeHardQuiz_SortedByAscendingAccuracy(t *testing.T) {
	mock := &practiceHardMockStore{
		stats: []db.QuestionStat{
			{QuestionID: "q1", TotalAttempts: 10, CorrectCount: 9}, // 90%
			{QuestionID: "q2", TotalAttempts: 10, CorrectCount: 3}, // 30%
			{QuestionID: "q3", TotalAttempts: 10, CorrectCount: 6}, // 60%
		},
	}
	h := handler.NewHandler(practiceHardTestQuestions, mock)
	r := setupPracticeHardRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz/hard", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 3 {
		t.Fatalf("expected 3 questions, got %d", len(got))
	}
	// Expected order: q2 (30%), q3 (60%), q1 (90%)
	expectedOrder := []string{"q2", "q3", "q1"}
	for i, expected := range expectedOrder {
		if got[i].ID != expected {
			t.Errorf("position %d: expected %s, got %s", i, expected, got[i].ID)
		}
	}
}
