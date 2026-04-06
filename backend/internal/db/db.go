package db

import (
	"context"

	sqlcdb "github.com/ansonlee/life-in-the-uk-quiz/internal/db/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

// QuestionStat holds aggregated attempt data for a single question.
type QuestionStat struct {
	QuestionID    string `json:"questionId"`
	TotalAttempts int    `json:"totalAttempts"`
	CorrectCount  int    `json:"correctCount"`
}

// StatisticsStore is the interface for recording and reading statistics.
type StatisticsStore interface {
	Record(ctx context.Context, questionID string, correct bool) error
	GetStats(ctx context.Context) ([]QuestionStat, error)
	GetHardestStats(ctx context.Context) ([]QuestionStat, error)
	GetEasiestStats(ctx context.Context) ([]QuestionStat, error)
	CountTrackedQuestions(ctx context.Context) (int, error)
}

// PostgresStore implements StatisticsStore using pgxpool.
type PostgresStore struct {
	pool    *pgxpool.Pool
	queries *sqlcdb.Queries
}

// NewPostgresStore wraps an existing pgxpool.
func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{
		pool:    pool,
		queries: sqlcdb.New(pool),
	}
}

// Record upserts a row in question_statistics.
func (s *PostgresStore) Record(ctx context.Context, questionID string, correct bool) error {
	correctIncrement := int32(0)
	if correct {
		correctIncrement = int32(1)
	}
	return s.queries.UpsertQuestionStat(ctx, sqlcdb.UpsertQuestionStatParams{
		QuestionID:   questionID,
		CorrectCount: correctIncrement,
	})
}

// GetStats returns all rows from question_statistics ordered by question_id.
func (s *PostgresStore) GetStats(ctx context.Context) ([]QuestionStat, error) {
	rows, err := s.queries.GetAllStats(ctx)
	if err != nil {
		return nil, err
	}
	stats := make([]QuestionStat, len(rows))
	for i, r := range rows {
		stats[i] = QuestionStat{
			QuestionID:    r.QuestionID,
			TotalAttempts: int(r.TotalAttempts),
			CorrectCount:  int(r.CorrectCount),
		}
	}
	return stats, nil
}

// GetHardestStats returns the top 50 questions with the lowest accuracy (most difficult).
func (s *PostgresStore) GetHardestStats(ctx context.Context) ([]QuestionStat, error) {
	rows, err := s.queries.GetHardestStats(ctx)
	if err != nil {
		return nil, err
	}
	stats := make([]QuestionStat, len(rows))
	for i, r := range rows {
		stats[i] = QuestionStat{
			QuestionID:    r.QuestionID,
			TotalAttempts: int(r.TotalAttempts),
			CorrectCount:  int(r.CorrectCount),
		}
	}
	return stats, nil
}

// GetEasiestStats returns the top 50 questions with the highest accuracy (easiest).
func (s *PostgresStore) GetEasiestStats(ctx context.Context) ([]QuestionStat, error) {
	rows, err := s.queries.GetEasiestStats(ctx)
	if err != nil {
		return nil, err
	}
	stats := make([]QuestionStat, len(rows))
	for i, r := range rows {
		stats[i] = QuestionStat{
			QuestionID:    r.QuestionID,
			TotalAttempts: int(r.TotalAttempts),
			CorrectCount:  int(r.CorrectCount),
		}
	}
	return stats, nil
}

// CountTrackedQuestions returns the total number of distinct questions tracked in question_statistics.
func (s *PostgresStore) CountTrackedQuestions(ctx context.Context) (int, error) {
	count, err := s.queries.CountTrackedQuestions(ctx)
	return int(count), err
}
