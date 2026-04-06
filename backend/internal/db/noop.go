package db

import "context"

// NoopStore satisfies StatisticsStore but does nothing.
type NoopStore struct{}

func (NoopStore) Record(_ context.Context, _ string, _ bool) error {
	return nil
}

func (NoopStore) GetStats(_ context.Context) ([]QuestionStat, error) {
	return nil, nil
}

func (NoopStore) GetHardestStats(_ context.Context) ([]QuestionStat, error) {
	return nil, nil
}

func (NoopStore) GetEasiestStats(_ context.Context) ([]QuestionStat, error) {
	return nil, nil
}

func (NoopStore) CountTrackedQuestions(_ context.Context) (int, error) {
	return 0, nil
}
