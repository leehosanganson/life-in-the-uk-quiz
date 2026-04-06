# NOTE: Run 'podman login harbor.leehosanganson.dev' before invoking any target.

REGISTRY := harbor.leehosanganson.dev
PROJECT  := leehosanganson
TAG      := dev

BACKEND_IMAGE  := $(REGISTRY)/$(PROJECT)/life-in-the-uk-quiz-backend:$(TAG)
FRONTEND_IMAGE := $(REGISTRY)/$(PROJECT)/life-in-the-uk-quiz-frontend:$(TAG)

.PHONY: deploy build push help

deploy: build push
	@echo "[make] Deployment complete."

build:
	@echo "[make] Building backend ..."
	podman build -t $(BACKEND_IMAGE) ./backend
	@echo "[make] Building frontend ..."
	podman build -t $(FRONTEND_IMAGE) ./frontend

push: build
	@echo "[make] Pushing backend ..."
	podman push $(BACKEND_IMAGE)
	@echo "[make] Pushing frontend ..."
	podman push $(FRONTEND_IMAGE)

help:
	@echo "Available targets:"
	@echo "  deploy  - Build and push all images to the registry (default)"
	@echo "  build   - Build backend and frontend container images"
	@echo "  push    - Build and push backend and frontend images to the registry"
	@echo "  help    - Print this help message"
