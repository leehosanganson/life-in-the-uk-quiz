package handler

import (
	"math"
	"math/rand"
	"net/http"
	"sort"
	"strconv"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/db"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/questions"
	"github.com/gin-gonic/gin"
)

const defaultQuizCount = 24

// RankedQuestion is the enriched response type for the hardest/easiest stats endpoints.
type RankedQuestion struct {
	QuestionID    string `json:"questionId"`
	Text          string `json:"text"`
	Category      string `json:"category"`
	TotalAttempts int    `json:"totalAttempts"`
	CorrectCount  int    `json:"correctCount"`
	Accuracy      int    `json:"accuracy"`
}

// Handler holds application state needed by HTTP handlers.
type Handler struct {
	questions []questions.Question
	store     db.StatisticsStore
}

// NewHandler constructs a Handler with the provided questions and statistics store.
// If store is nil, a NoopStore is used.
func NewHandler(qs []questions.Question, store db.StatisticsStore) *Handler {
	if store == nil {
		store = db.NoopStore{}
	}
	return &Handler{questions: qs, store: store}
}

// buildStatMap converts a slice of QuestionStat into a map keyed by QuestionID.
func buildStatMap(stats []db.QuestionStat) map[string]db.QuestionStat {
	m := make(map[string]db.QuestionStat, len(stats))
	for _, s := range stats {
		m[s.QuestionID] = s
	}
	return m
}

// getStatMap fetches statistics and builds a lookup map.
// On error it writes the error response and returns nil, false.
func (h *Handler) getStatMap(c *gin.Context) (map[string]db.QuestionStat, bool) {
	stats, err := h.store.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve stats"})
		return nil, false
	}
	return buildStatMap(stats), true
}

// buildQuestionMap builds a map from question ID to Question for fast lookup.
func buildQuestionMap(qs []questions.Question) map[string]questions.Question {
	m := make(map[string]questions.Question, len(qs))
	for _, q := range qs {
		m[q.ID] = q
	}
	return m
}

// buildRankedResponse enriches a slice of QuestionStat (already sorted by SQL) with
// question metadata from the in-memory question map. Rows whose question ID is not
// found in the map are silently skipped. Callers must ensure total_attempts > 0 for
// all input rows (this is guaranteed by the SQL WHERE clause).
func buildRankedResponse(stats []db.QuestionStat, questionMap map[string]questions.Question) []RankedQuestion {
	result := make([]RankedQuestion, 0, len(stats))
	for _, s := range stats {
		q, ok := questionMap[s.QuestionID]
		if !ok {
			continue
		}
		accuracy := int(math.Round(float64(s.CorrectCount) / float64(s.TotalAttempts) * 100))
		result = append(result, RankedQuestion{
			QuestionID:    s.QuestionID,
			Text:          q.Text,
			Category:      q.Category,
			TotalAttempts: s.TotalAttempts,
			CorrectCount:  s.CorrectCount,
			Accuracy:      accuracy,
		})
	}
	return result
}

// HealthCheck responds with a simple liveness signal.
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetQuiz returns a random selection of N questions.
func (h *Handler) GetQuiz(c *gin.Context) {
	count := defaultQuizCount
	if raw := c.Query("count"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			count = n
		}
	}
	if count > len(h.questions) {
		count = len(h.questions)
	}

	pool := make([]questions.Question, len(h.questions))
	copy(pool, h.questions)
	rand.Shuffle(len(pool), func(i, j int) { pool[i], pool[j] = pool[j], pool[i] })

	c.JSON(http.StatusOK, pool[:count])
}

// GetQuestionsCount returns the total number of questions in the in-memory pool.
func (h *Handler) GetQuestionsCount(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"count": len(h.questions)})
}

// statisticsRequest is the expected body for PostStatistics.
type statisticsRequest struct {
	QuestionID string `json:"questionId" binding:"required"`
	Correct    bool   `json:"correct"`
}

// PostStatistics records whether a question was answered correctly.
func (h *Handler) PostStats(c *gin.Context) {
	var req statisticsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.Record(c.Request.Context(), req.QuestionID, req.Correct); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record statistic"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetStats returns aggregated question difficulty statistics.
func (h *Handler) GetStats(c *gin.Context) {
	stats, err := h.store.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve stats"})
		return
	}
	if stats == nil {
		stats = []db.QuestionStat{}
	}
	c.JSON(http.StatusOK, stats)
}

// GetStatsHardest returns the top 50 hardest questions (lowest accuracy), enriched
// with question text and category.
func (h *Handler) GetStatsHardest(c *gin.Context) {
	stats, err := h.store.GetHardestStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve stats"})
		return
	}
	result := buildRankedResponse(stats, buildQuestionMap(h.questions))
	if result == nil {
		result = []RankedQuestion{}
	}
	c.JSON(http.StatusOK, result)
}

// GetStatsEasiest returns the top 50 easiest questions (highest accuracy), enriched
// with question text and category.
func (h *Handler) GetStatsEasiest(c *gin.Context) {
	stats, err := h.store.GetEasiestStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve stats"})
		return
	}
	result := buildRankedResponse(stats, buildQuestionMap(h.questions))
	if result == nil {
		result = []RankedQuestion{}
	}
	c.JSON(http.StatusOK, result)
}

// GetStatsCount returns the total number of distinct questions tracked in question_statistics.
func (h *Handler) GetStatsCount(c *gin.Context) {
	count, err := h.store.CountTrackedQuestions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve stats count"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// GetHardQuiz returns the hardest 24 questions (by lowest accuracy) from
// user stats, regardless of any accuracy threshold.  At least one attempt must
// have been recorded for a question to be included.
func (h *Handler) GetHardQuiz(c *gin.Context) {
	statMap, ok := h.getStatMap(c)
	if !ok {
		return
	}

	// Filter questions: must have at least one attempt.
	var attempted []questions.Question
	for _, q := range h.questions {
		s, ok := statMap[q.ID]
		if !ok {
			continue
		}
		if s.TotalAttempts >= 1 {
			attempted = append(attempted, q)
		}
	}

	if len(attempted) == 0 {
		c.JSON(http.StatusOK, []questions.Question{})
		return
	}

	// Sort ascending by accuracy ratio; secondary sort: descending TotalAttempts.
	sort.Slice(attempted, func(i, j int) bool {
		si := statMap[attempted[i].ID]
		sj := statMap[attempted[j].ID]
		ai := float64(si.CorrectCount) / float64(si.TotalAttempts)
		aj := float64(sj.CorrectCount) / float64(sj.TotalAttempts)
		if ai != aj {
			return ai < aj
		}
		return si.TotalAttempts > sj.TotalAttempts
	})

	// Cap to defaultQuizCount.
	if len(attempted) > defaultQuizCount {
		attempted = attempted[:defaultQuizCount]
	}

	c.JSON(http.StatusOK, attempted)
}
