CREATE TABLE IF NOT EXISTS question_statistics (
    question_id    TEXT PRIMARY KEY,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    correct_count  INTEGER NOT NULL DEFAULT 0
);
