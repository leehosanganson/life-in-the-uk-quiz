package db

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

// Migrate runs all pending database migrations using embedded SQL files.
// It is idempotent: if no migrations are pending, it returns nil.
// The pool must have been created from a DSN (e.g. via pgxpool.New(ctx, dsn))
// so that pool.Config().ConnString() returns the original connection string.
func Migrate(_ context.Context, pool *pgxpool.Pool) error {
	src, err := iofs.New(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("create migration source: %w", err)
	}

	dsn := pool.Config().ConnString()
	// golang-migrate pgx/v5 driver is registered under "pgx5"
	dsnForMigrate := "pgx5" + dsn[strings.Index(dsn, "://"):]

	m, err := migrate.NewWithSourceInstance("iofs", src, dsnForMigrate)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}
	defer func() { _, _ = m.Close() }()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("run migrations: %w", err)
	}
	return nil
}
