package questions_test

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/questions"
)

func TestLoadFromFile(t *testing.T) {
	// Prepare sample data
	samples := []questions.Question{
		{
			ID:          "q1",
			Text:        "What is the capital of the United Kingdom?",
			Options:     []string{"Edinburgh", "Cardiff", "London", "Belfast"},
			AnswerIndex: 2,
			Category:    "Geography",
		},
		{
			ID:          "q2",
			Text:        "In what year did the Second World War end?",
			Options:     []string{"1943", "1944", "1945", "1946"},
			AnswerIndex: 2,
			Category:    "History",
		},
	}

	// Write sample data to a temp file
	tmpFile, err := os.CreateTemp(t.TempDir(), "questions-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer func() { _ = tmpFile.Close() }()

	if err := json.NewEncoder(tmpFile).Encode(samples); err != nil {
		t.Fatalf("failed to write sample data: %v", err)
	}
	_ = tmpFile.Close()

	// Call LoadFromFile
	got, err := questions.LoadFromFile(tmpFile.Name())

	// Assertions
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 questions, got %d", len(got))
	}
	if got[0].Text != samples[0].Text {
		t.Errorf("expected first question text %q, got %q", samples[0].Text, got[0].Text)
	}
}

func writeJSONFile(t *testing.T, dir, name string, qs []questions.Question) {
	t.Helper()
	f, err := os.Create(filepath.Join(dir, name))
	if err != nil {
		t.Fatalf("failed to create file %s: %v", name, err)
	}
	defer func() { _ = f.Close() }()
	if err := json.NewEncoder(f).Encode(qs); err != nil {
		t.Fatalf("failed to write %s: %v", name, err)
	}
}

func TestLoadFromDir_LoadsAllJsonFiles(t *testing.T) {
	dir := t.TempDir()

	writeJSONFile(t, dir, "a.json", []questions.Question{
		{ID: "a1", Text: "A1?", Options: []string{"1", "2", "3", "4"}, AnswerIndex: 0, Category: "Test"},
		{ID: "a2", Text: "A2?", Options: []string{"1", "2", "3", "4"}, AnswerIndex: 1, Category: "Test"},
	})
	writeJSONFile(t, dir, "b.json", []questions.Question{
		{ID: "b1", Text: "B1?", Options: []string{"1", "2", "3", "4"}, AnswerIndex: 2, Category: "Test"},
	})

	got, err := questions.LoadFromDir(dir)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(got) != 3 {
		t.Errorf("expected 3 questions, got %d", len(got))
	}
}

func TestLoadFromDir_IgnoresNonJsonFiles(t *testing.T) {
	dir := t.TempDir()

	writeJSONFile(t, dir, "questions.json", []questions.Question{
		{ID: "q1", Text: "Q1?", Options: []string{"1", "2", "3", "4"}, AnswerIndex: 0, Category: "Test"},
		{ID: "q2", Text: "Q2?", Options: []string{"1", "2", "3", "4"}, AnswerIndex: 1, Category: "Test"},
	})
	// Write a non-JSON file
	if err := os.WriteFile(filepath.Join(dir, "readme.txt"), []byte("not json"), 0644); err != nil {
		t.Fatalf("failed to write readme.txt: %v", err)
	}

	got, err := questions.LoadFromDir(dir)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(got) != 2 {
		t.Errorf("expected 2 questions (non-JSON ignored), got %d", len(got))
	}
}

func TestLoadFromFile_MultiAnswer(t *testing.T) {
	// Prepare sample data with AnswerIndices
	samples := []questions.Question{
		{
			ID:            "test001",
			Text:          "Test",
			Options:       []string{"A", "B", "C"},
			AnswerIndex:   0,
			AnswerIndices: []int{0, 2},
		},
	}

	// Write sample data to a temp file
	tmpFile, err := os.CreateTemp(t.TempDir(), "multi-questions-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer func() { _ = tmpFile.Close() }()

	if err := json.NewEncoder(tmpFile).Encode(samples); err != nil {
		t.Fatalf("failed to write sample data: %v", err)
	}
	_ = tmpFile.Close()

	// Call LoadFromFile
	got, err := questions.LoadFromFile(tmpFile.Name())

	// Assertions
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 question, got %d", len(got))
	}
	if len(got[0].AnswerIndices) != 2 {
		t.Fatalf("expected AnswerIndices length 2, got %d", len(got[0].AnswerIndices))
	}
	if got[0].AnswerIndices[0] != 0 || got[0].AnswerIndices[1] != 2 {
		t.Errorf("expected AnswerIndices [0, 2], got %v", got[0].AnswerIndices)
	}
}

func TestLoadFromDir_EmptyDir(t *testing.T) {
	dir := t.TempDir()

	got, err := questions.LoadFromDir(dir)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if got == nil {
		t.Error("expected non-nil slice for empty dir, got nil")
	}
	if len(got) != 0 {
		t.Errorf("expected 0 questions, got %d", len(got))
	}
}
