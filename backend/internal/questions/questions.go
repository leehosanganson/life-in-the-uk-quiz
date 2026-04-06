package questions

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// KnownFiles is the ordered list of question-bank filenames used when loading
// questions from a remote base URL.
var KnownFiles = []string{
	"culture.json",
	"geography.json",
	"government.json",
	"history.json",
	"multi.json",
	"values.json",
}

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

// LoadFromURL fetches every file listed in KnownFiles from baseURL and returns
// the combined slice of Questions. The base URL may optionally include a
// trailing slash — it is normalised before use.
func LoadFromURL(baseURL string) ([]Question, error) {
	// TODO: add timeout to http client
	trimmedBase := strings.TrimRight(baseURL, "/")

	var all []Question
	for _, filename := range KnownFiles {
		url := trimmedBase + "/" + filename

		resp, err := http.Get(url) //nolint:noctx
		if err != nil {
			return nil, fmt.Errorf("fetching %s: %w", url, err)
		}
		defer resp.Body.Close() //nolint:errcheck

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return nil, fmt.Errorf("fetching %s: unexpected status %d", url, resp.StatusCode)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("reading %s: %w", url, err)
		}

		var qs []Question
		if err := json.Unmarshal(body, &qs); err != nil {
			return nil, fmt.Errorf("parsing %s: %w", url, err)
		}

		all = append(all, qs...)
	}

	if all == nil {
		all = []Question{}
	}
	return all, nil
}
