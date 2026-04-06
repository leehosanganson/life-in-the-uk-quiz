# CONTRIBUTION

## Repository Structure

```
life-in-the-uk-quiz/
├── backend/                  # Go / Gin API server
│   ├── cmd/server/           # main entrypoint (main.go)
│   ├── internal/
│   │   ├── db/               # DB connection, migrations, sqlc-generated code
│   │   ├── handler/          # HTTP handlers (Gin routes)
│   │   └── questions/        # question-loading & domain logic
│   ├── Dockerfile / Dockerfile.dev
│   └── sqlc.yaml
├── frontend/                 # TypeScript / React / Vite SPA
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React UI components
│   │   ├── hooks/            # custom React hooks
│   │   └── test/             # test utilities & setup
│   ├── public/
│   └── nginx.conf / vite.config.ts
├── data/questions/           # JSON question bank (by category)
├── docker-compose.yml        # production Compose config
├── docker-compose.dev.yml    # dev Compose override
├── Makefile                  # common dev tasks
└── flake.nix                 # Nix dev-shell
```

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Frontend  | TypeScript, React, Vite |
| Backend   | Go, Gin                 |
| Database  | PostgreSQL              |
| Container | Docker / Docker Compose |

## Image Tagging

`latest`: latest stable
`staging`: release candidate
`x.y.z`: SemVer (MAJOR.MINOR.PATCH)
`feat-xxxyyyzzz`: per branch build

Pipeline Flow:

- When a PR is raised, optionally, run `build-feat.yaml` to build a 7-day retention image for testing
- When the PR is merged to main, `build-main.yaml` will be triggered and build a sha-tagged image
- When the commit is tested, retag the sha-tagged image to a SemVer image with `release.yaml` git tagged as `vMAJOR.MINOR.PATCH`
- After a group of commits, or in a state of release candidate, retag the SemVer image as staging, with `promote.yaml`
- Promote any staging image to latest image with `promote.yaml`

## Development Workflow

### Coding Practice

- Atomic Commits
- Test Driven Development
- Run pre-commit hooks to maintain code quality, security and consistency

### Setup

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Go 1.26+](https://go.dev/dl/) (for local backend development)
- [Node.js 22+](https://nodejs.org/) and [pnpm](https://pnpm.io/) (for local frontend development)

To avoid rebuilding containers on every change, use the dev compose override:

```bash
podman compose podman-compose.yml -f docker-compose.dev.yml up --build
```

### Pre-commit Hooks

This repo uses [pre-commit](https://pre-commit.com/) to enforce code quality checks before every commit (Prettier formatting, ESLint, gofmt, and golangci-lint).

**Requirement:** `pre-commit` must be installed on your machine:

```bash
pre-commit install
```

**Run all hooks ** against every file:

```bash
pre-commit run --all-files
```

### Tests

```
pnpm --filter frontend test
cd ./backend && go test ./... && cd ..
```
