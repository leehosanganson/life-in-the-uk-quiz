-- name: UpsertQuestionStat :exec
INSERT INTO question_statistics (question_id, total_attempts, correct_count)
VALUES ($1, 1, $2)
ON CONFLICT (question_id) DO UPDATE
SET total_attempts = question_statistics.total_attempts + 1,
    correct_count  = question_statistics.correct_count + $2;

-- name: GetAllStats :many
SELECT question_id, total_attempts, correct_count
FROM question_statistics
ORDER BY question_id;

-- name: GetHardestStats :many
SELECT question_id, total_attempts, correct_count
FROM question_statistics
WHERE total_attempts > 0
ORDER BY CAST(correct_count AS FLOAT) / total_attempts ASC,
         total_attempts DESC
LIMIT 50;

-- name: GetEasiestStats :many
SELECT question_id, total_attempts, correct_count
FROM question_statistics
WHERE total_attempts > 0
ORDER BY CAST(correct_count AS FLOAT) / total_attempts DESC,
         total_attempts DESC
LIMIT 50;

-- name: CountTrackedQuestions :one
SELECT COUNT(*)::int AS count FROM question_statistics;
