package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/db"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/handler"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/questions"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func setupRouter(h *handler.Handler) *gin.Engine {
	r := gin.New()
	r.GET("/health", h.HealthCheck)
	r.GET("/api/quiz", h.GetQuiz)
	r.GET("/api/questions/count", h.GetQuestionsCount)
	r.POST("/api/stats", h.PostStats)
	r.GET("/api/stats", h.GetStats)
	r.GET("/api/stats/count", h.GetStatsCount)
	return r
}

var sampleQuestions = []questions.Question{
	{ID: "q1", Text: "Q1?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 0, Category: "Test"},
	{ID: "q2", Text: "Q2?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 1, Category: "Test"},
	{ID: "q3", Text: "Q3?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 2, Category: "Test"},
	{ID: "q4", Text: "Q4?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 3, Category: "Test"},
	{ID: "q5", Text: "Q5?", Options: []string{"A", "B", "C", "D"}, AnswerIndex: 0, Category: "Test"},
}

var largePoolQuestions = func() []questions.Question {
	qs := make([]questions.Question, 24)
	for i := range qs {
		qs[i] = questions.Question{
			ID:          fmt.Sprintf("q%d", i+1),
			Text:        fmt.Sprintf("Q%d?", i+1),
			Options:     []string{"A", "B", "C", "D"},
			AnswerIndex: 0,
			Category:    "Test",
		}
	}
	return qs
}()

func TestHealthCheck(t *testing.T) {
	h := handler.NewHandler(nil, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/health", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "ok") {
		t.Errorf("expected body to contain \"ok\", got: %s", w.Body.String())
	}
}

func TestGetQuestions(t *testing.T) {
	h := handler.NewHandler(sampleQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(got) != len(sampleQuestions) {
		t.Errorf("expected %d questions, got %d", len(sampleQuestions), len(got))
	}
}

func TestGetQuiz_DefaultCount(t *testing.T) {
	h := handler.NewHandler(sampleQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(got) != 5 {
		t.Errorf("expected 5 questions (capped by pool size, default is 24), got %d", len(got))
	}
}

func TestGetQuiz_DefaultCount_LargePool(t *testing.T) {
	h := handler.NewHandler(largePoolQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(got) != 24 {
		t.Errorf("expected 24 questions (default), got %d", len(got))
	}
}

func TestGetQuiz_WithCount(t *testing.T) {
	h := handler.NewHandler(sampleQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz?count=3", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(got) != 3 {
		t.Errorf("expected 3 questions, got %d", len(got))
	}
}

func TestGetQuiz_CappedCount(t *testing.T) {
	h := handler.NewHandler(sampleQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/quiz?count=100", nil)
	r.ServeHTTP(w, req)

	var got []questions.Question
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}
	if len(got) != 5 {
		t.Errorf("expected 5 (capped), got %d", len(got))
	}
}

// mockStore records calls to Record and can be configured to return stats.
type mockStore struct {
	recorded []struct {
		id      string
		correct bool
	}
	stats        []db.QuestionStat
	hardestStats []db.QuestionStat
	easiestStats []db.QuestionStat
	trackedCount int
	countErr     error
}

func (m *mockStore) Record(_ context.Context, id string, correct bool) error {
	m.recorded = append(m.recorded, struct {
		id      string
		correct bool
	}{id, correct})
	return nil
}

func (m *mockStore) GetStats(_ context.Context) ([]db.QuestionStat, error) {
	return m.stats, nil
}

func (m *mockStore) GetHardestStats(_ context.Context) ([]db.QuestionStat, error) {
	return m.hardestStats, nil
}

func (m *mockStore) GetEasiestStats(_ context.Context) ([]db.QuestionStat, error) {
	return m.easiestStats, nil
}

func (m *mockStore) CountTrackedQuestions(_ context.Context) (int, error) {
	return m.trackedCount, m.countErr
}

func TestPostStatistics_Valid(t *testing.T) {
	mock := &mockStore{}
	h := handler.NewHandler(nil, mock)
	r := setupRouter(h)

	body := bytes.NewBufferString(`{"questionId":"q1","correct":true}`)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/stats", body)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected 204, got %d", w.Code)
	}
	if len(mock.recorded) != 1 {
		t.Fatalf("expected 1 recorded call, got %d", len(mock.recorded))
	}
	if mock.recorded[0].id != "q1" || !mock.recorded[0].correct {
		t.Errorf("unexpected recorded values: %+v", mock.recorded[0])
	}
}

func TestPostStatistics_MissingBody(t *testing.T) {
	h := handler.NewHandler(nil, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/stats", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestGetStats_Empty(t *testing.T) {
	h := handler.NewHandler(nil, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	body := w.Body.String()
	if body != "[]" && body != "[]\n" {
		// allow trailing newline from JSON encoder
		trimmed := strings.TrimSpace(body)
		if trimmed != "[]" {
			t.Errorf("expected empty JSON array [], got: %s", body)
		}
	}
}

func TestGetStats_WithData(t *testing.T) {
	mock := &mockStore{
		stats: []db.QuestionStat{
			{QuestionID: "q1", TotalAttempts: 10, CorrectCount: 7},
			{QuestionID: "q2", TotalAttempts: 5, CorrectCount: 2},
		},
	}
	h := handler.NewHandler(nil, mock)
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []db.QuestionStat
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expected 2 stats, got %d", len(got))
	}
	if got[0].QuestionID != "q1" || got[0].TotalAttempts != 10 || got[0].CorrectCount != 7 {
		t.Errorf("unexpected stat: %+v", got[0])
	}
}

func setupStatsRankedRouter(h *handler.Handler) *gin.Engine {
	r := gin.New()
	r.GET("/api/stats/hardest", h.GetStatsHardest)
	r.GET("/api/stats/easiest", h.GetStatsEasiest)
	return r
}

func TestGetStatsHardest_Empty(t *testing.T) {
	mock := &mockStore{hardestStats: []db.QuestionStat{}}
	h := handler.NewHandler(sampleQuestions, mock)
	r := setupStatsRankedRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/hardest", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []handler.RankedQuestion
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty slice, got %d items", len(got))
	}
}

func TestGetStatsHardest_Ranked(t *testing.T) {
	// SQL already returns them in hardest-first order (25% then 80%)
	mock := &mockStore{
		hardestStats: []db.QuestionStat{
			{QuestionID: "q2", TotalAttempts: 4, CorrectCount: 1},  // 25%
			{QuestionID: "q1", TotalAttempts: 10, CorrectCount: 8}, // 80%
		},
	}
	h := handler.NewHandler(sampleQuestions, mock)
	r := setupStatsRankedRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/hardest", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []handler.RankedQuestion
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 items, got %d", len(got))
	}
	if got[0].QuestionID != "q2" {
		t.Errorf("expected first item to be q2 (25%%), got %s", got[0].QuestionID)
	}
	if got[0].Accuracy != 25 {
		t.Errorf("expected accuracy 25, got %d", got[0].Accuracy)
	}
	if got[0].Text != "Q2?" {
		t.Errorf("expected text 'Q2?', got %s", got[0].Text)
	}
	if got[0].Category != "Test" {
		t.Errorf("expected category 'Test', got %s", got[0].Category)
	}
	if got[1].QuestionID != "q1" {
		t.Errorf("expected second item to be q1 (80%%), got %s", got[1].QuestionID)
	}
	if got[1].Accuracy != 80 {
		t.Errorf("expected accuracy 80, got %d", got[1].Accuracy)
	}
}

func TestGetStatsEasiest_Ranked(t *testing.T) {
	// SQL already returns them in easiest-first order (80% then 25%)
	mock := &mockStore{
		easiestStats: []db.QuestionStat{
			{QuestionID: "q1", TotalAttempts: 10, CorrectCount: 8}, // 80%
			{QuestionID: "q2", TotalAttempts: 4, CorrectCount: 1},  // 25%
		},
	}
	h := handler.NewHandler(sampleQuestions, mock)
	r := setupStatsRankedRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/easiest", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []handler.RankedQuestion
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 items, got %d", len(got))
	}
	if got[0].QuestionID != "q1" {
		t.Errorf("expected first item to be q1 (80%%), got %s", got[0].QuestionID)
	}
	if got[0].Accuracy != 80 {
		t.Errorf("expected accuracy 80, got %d", got[0].Accuracy)
	}
	if got[1].QuestionID != "q2" {
		t.Errorf("expected second item to be q2 (25%%), got %s", got[1].QuestionID)
	}
}

func TestGetStatsHardest_UnknownQuestionSkipped(t *testing.T) {
	mock := &mockStore{
		hardestStats: []db.QuestionStat{
			{QuestionID: "unknown-id", TotalAttempts: 5, CorrectCount: 1}, // not in sampleQuestions
			{QuestionID: "q1", TotalAttempts: 10, CorrectCount: 8},        // 80%
		},
	}
	h := handler.NewHandler(sampleQuestions, mock)
	r := setupStatsRankedRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/hardest", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []handler.RankedQuestion
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 item (unknown-id skipped), got %d", len(got))
	}
	if got[0].QuestionID != "q1" {
		t.Errorf("expected q1, got %s", got[0].QuestionID)
	}
}

func TestGetStatsEasiest_Empty(t *testing.T) {
	mock := &mockStore{easiestStats: []db.QuestionStat{}}
	h := handler.NewHandler(sampleQuestions, mock)
	r := setupStatsRankedRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/easiest", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got []handler.RankedQuestion
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty slice, got %d items", len(got))
	}
}

func TestGetStatsCount_ReturnsCount(t *testing.T) {
	mock := &mockStore{trackedCount: 42}
	h := handler.NewHandler(nil, mock)
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/count", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got map[string]int
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if got["count"] != 42 {
		t.Errorf("expected count 42, got %d", got["count"])
	}
}

func TestGetStatsCount_Error(t *testing.T) {
	mock := &mockStore{countErr: errors.New("db error")}
	h := handler.NewHandler(nil, mock)
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/stats/count", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "error") {
		t.Errorf("expected body to contain \"error\", got: %s", w.Body.String())
	}
}

func TestGetQuestionsCount_ReturnsCount(t *testing.T) {
	h := handler.NewHandler(sampleQuestions, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/questions/count", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got map[string]int
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if got["count"] != 5 {
		t.Errorf("expected count 5, got %d", got["count"])
	}
}

func TestGetQuestionsCount_EmptyPool(t *testing.T) {
	h := handler.NewHandler(nil, db.NoopStore{})
	r := setupRouter(h)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/questions/count", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got map[string]int
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if got["count"] != 0 {
		t.Errorf("expected count 0, got %d", got["count"])
	}
}
