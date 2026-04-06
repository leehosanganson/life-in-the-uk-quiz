# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.26-alpine AS builder

WORKDIR /build

# Cache dependency downloads
COPY go.mod go.sum ./
RUN go mod download

# Build the binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# ── Final stage ──────────────────────────────────────────────────────────────
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/server ./server

# Data directory (mounted or baked in at deploy time)
ENV DATA_DIR=/data/questions

EXPOSE 8080

ENTRYPOINT ["./server"]
