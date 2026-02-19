SHELL := /bin/bash

.DEFAULT_GOAL := help

ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
COMPOSE_PROD := docker compose -f $(ROOT_DIR)deployment/docker-compose.yml
COMPOSE_DEV := docker compose -f $(ROOT_DIR)deployment/docker-compose.dev.yml

MONGODB_URI ?= mongodb://root:password@localhost:27017/?authSource=admin
MONGODB_DB_NAME ?= risktool

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make <target>\n"} \
	/^##@/ {printf "\n%s\n", substr($$0, 5)} \
	/^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-18s %s\n", $$1, $$2} \
	END {printf "\n"}' $(MAKEFILE_LIST)

##@ Docker (Production)
up: ## Start full stack (prod) with build
	$(COMPOSE_PROD) up -d --build

down: ## Stop and remove prod containers
	$(COMPOSE_PROD) down

build: ## Build prod images
	$(COMPOSE_PROD) build

logs: ## Follow prod logs
	$(COMPOSE_PROD) logs -f --tail=100

ps: ## Show prod container status
	$(COMPOSE_PROD) ps

restart: ## Restart prod containers
	$(COMPOSE_PROD) restart

##@ Docker (Development)
dev-up: ## Start dev stack (mongo + api + web + proxy)
	$(COMPOSE_DEV) up -d --build

dev-down: ## Stop and remove dev containers
	$(COMPOSE_DEV) down

dev-logs: ## Follow dev logs
	$(COMPOSE_DEV) logs -f --tail=100

dev-ps: ## Show dev container status
	$(COMPOSE_DEV) ps

mongo: ## Start only MongoDB (dev compose)
	$(COMPOSE_DEV) up -d mongo

web-db: ## Run only Web + MongoDB (dev compose)
	$(COMPOSE_DEV) up -d mongo web

api-db: ## Run only API + MongoDB (dev compose)
	$(COMPOSE_DEV) up -d mongo api

##@ Local Development
api-install: ## Install API deps with uv
	cd api && uv sync

api-dev: ## Run API locally (requires mongo)
	cd api && MONGODB_URI=$(MONGODB_URI) MONGODB_DB_NAME=$(MONGODB_DB_NAME) uv run fastapi dev src/main.py --host 0.0.0.0 --port 8000

web-install: ## Install web deps
	cd web && npm install

web-dev: ## Run Next.js dev server
	cd web && NEXT_PUBLIC_API_URL=$${NEXT_PUBLIC_API_URL:-http://localhost:8000/api} npm run dev

web-lint: ## Lint frontend
	cd web && npm run lint
