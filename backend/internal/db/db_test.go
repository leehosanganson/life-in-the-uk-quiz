package db_test

import (
	"context"
	"testing"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/db"
)

func TestNoopStore_Record(t *testing.T) {
	store := db.NoopStore{}
	if err := store.Record(context.Background(), "q1", true); err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
}

func TestNoopStore_GetStats(t *testing.T) {
	store := db.NoopStore{}
	stats, err := store.GetStats(context.Background())
	if err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
	if stats != nil {
		t.Errorf("expected nil stats, got: %v", stats)
	}
}

func TestNoopStore_CountTrackedQuestions(t *testing.T) {
	store := db.NoopStore{}
	count, err := store.CountTrackedQuestions(context.Background())
	if err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
	if count != 0 {
		t.Errorf("expected count 0, got: %d", count)
	}
}
