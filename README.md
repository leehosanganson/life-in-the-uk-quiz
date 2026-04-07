# Life in the UK Quiz

A web application to help users prepare for the Life in the UK citizenship test. Users are presented with a set of multiple-choice questions drawn from real test topics and can request a fresh set at any time. No user data is tracked.

Live: https://life-in-the-uk-quiz.leehosanganson.dev/

---

## Local Installation

### Run with Docker Compose

```bash
docker compose up --build
```

URL: http://localhost:3000

## Questions Data

Questions are stored as plain JSON files in `data/questions/`. This keeps the content transparent and easy to review or extend.

Each question follows this schema:

```json
{
  "id": "q001",
  "text": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answerIndex": 0,
  "category": "History"
}
```

To add more questions, edit or add JSON files in `data/questions/` and update the loader path in the backend entrypoint accordingly.
