package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/ansonlee/life-in-the-uk-quiz/internal/db"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/handler"
	"github.com/ansonlee/life-in-the-uk-quiz/internal/questions"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()

	// Load questions — prefer remote URL when QUESTIONS_BASE_URL is set.
	baseURL := os.Getenv("QUESTIONS_BASE_URL")
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "../../data/questions"
	}

	var qs []questions.Question
	if baseURL != "" {
		if os.Getenv("DATA_DIR") != "" {
			log.Printf("QUESTIONS_BASE_URL is set; ignoring DATA_DIR")
		}
		log.Printf("loading questions from remote URL: %s", baseURL)
		var err error
		qs, err = questions.LoadFromURL(baseURL)
		if err != nil {
			log.Printf("warning: could not load questions from %s: %v — starting with empty question set", baseURL, err)
			qs = []questions.Question{}
		}
		log.Printf("loaded %d questions from %s", len(qs), baseURL)
	} else {
		var err error
		qs, err = questions.LoadFromDir(dataDir)
		if err != nil {
			log.Printf("warning: could not load questions from %s: %v — starting with empty question set", dataDir, err)
			qs = []questions.Question{}
		}
		log.Printf("loaded %d questions from %s", len(qs), dataDir)
	}

	// Setup statistics store
	var store db.StatisticsStore = db.NoopStore{}
	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		pool, err := pgxpool.New(ctx, dsn)
		if err != nil {
			log.Fatalf("failed to connect to database: %v", err)
		}
		defer pool.Close()
		if err := db.Migrate(ctx, pool); err != nil {
			log.Fatalf("failed to run migrations: %v", err)
		}
		store = db.NewPostgresStore(pool)
		log.Println("connected to PostgreSQL and ran migrations")
	}

	h := handler.NewHandler(qs, store)

	// CORS configuration
	corsOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		corsOrigins = strings.Split(raw, ",")
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: corsOrigins,
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	router.GET("/health", h.HealthCheck)
	router.GET("/api/quiz", h.GetQuiz)
	router.GET("/api/questions/count", h.GetQuestionsCount)
	router.GET("/api/quiz/hard", h.GetHardQuiz)
	router.POST("/api/stats", h.PostStats)
	router.GET("/api/stats", h.GetStats)
	router.GET("/api/stats/hardest", h.GetStatsHardest)
	router.GET("/api/stats/easiest", h.GetStatsEasiest)
	router.GET("/api/stats/count", h.GetStatsCount)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
