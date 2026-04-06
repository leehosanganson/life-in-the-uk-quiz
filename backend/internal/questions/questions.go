package questions

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// Question represents a single quiz question with its options and correct answer.
type Question struct {
	ID            string   `json:"id"`
	Text          string   `json:"text"`
	Options       []string `json:"options"`
	AnswerIndex   int      `json:"answerIndex"`
	AnswerIndices []int    `json:"answerIndices,omitempty"`
	Category      string   `json:"category"`
	Explanation   string   `json:"explanation,omitempty"`
}

// LoadFromFile reads a JSON file at the given path and unmarshals it into a slice of Questions.
func LoadFromFile(path string) ([]Question, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var questions []Question
	if err := json.Unmarshal(data, &questions); err != nil {
		return nil, err
	}

	return questions, nil
}

// LoadFromDir reads all *.json files from the given directory (in alphabetical order)
// and returns the combined slice of Questions.
func LoadFromDir(dir string) ([]Question, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var all []Question
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		qs, err := LoadFromFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			return nil, err
		}
		all = append(all, qs...)
	}

	if all == nil {
		all = []Question{}
	}
	return all, nil
}
