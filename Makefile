.PHONY: help build up down start stop restart logs ps clean test migrate shell db-shell redis-shell

# Default target
help:
	@echo "Adaptive LMS - Docker Development Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build        - Build all Docker containers"
	@echo "  make up           - Start all services in detached mode"
	@echo "  make down         - Stop and remove all containers"
	@echo "  make start        - Start existing containers"
	@echo "  make stop         - Stop running containers"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make logs-f       - Follow logs from all services"
	@echo "  make ps           - List all running containers"
	@echo "  make clean        - Remove containers, volumes, and networks"
	@echo "  make test         - Run backend tests"
	@echo "  make migrate      - Run database migrations"
	@echo "  make shell        - Access backend container shell"
	@echo "  make db-shell     - Access PostgreSQL shell"
	@echo "  make redis-shell  - Access Redis CLI"
	@echo "  make backend-logs - View backend logs"
	@echo "  make init         - Initialize project (build + up + migrate)"

# Build all containers
build:
	docker compose build

# Start all services in detached mode
up:
	docker compose up -d

# Stop and remove containers
down:
	docker compose down

# Start existing containers
start:
	docker compose start

# Stop running containers
stop:
	docker compose stop

# Restart all services
restart:
	docker compose restart

# View logs from all services
logs:
	docker compose logs --tail=100

# Follow logs from all services
logs-f:
	docker compose logs -f

# View backend logs
backend-logs:
	docker compose logs -f backend

# List running containers
ps:
	docker compose ps

# Remove everything (containers, volumes, networks)
clean:
	docker compose down -v
	@echo "All containers, volumes, and networks removed."

# Run backend tests
test:
	docker compose exec backend pytest

# Run database migrations
migrate:
	docker compose exec backend alembic upgrade head

# Create new migration
migrate-create:
	@read -p "Enter migration message: " msg; \
	docker compose exec backend alembic revision --autogenerate -m "$$msg"

# Initialize database tables (development only)
db-init:
	docker compose exec backend python -c "from app.db.session import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Access backend container shell
shell:
	docker compose exec backend bash

# Access PostgreSQL shell
db-shell:
	docker compose exec postgres psql -U user -d adaptive_lms

# Access Redis CLI
redis-shell:
	docker compose exec redis redis-cli

# Create database backup
db-backup:
	@echo "Creating database backup..."
	docker compose exec postgres pg_dump -U user adaptive_lms > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created successfully!"

# Rebuild specific service
rebuild-backend:
	docker compose up -d --build backend

rebuild-celery:
	docker compose up -d --build celery-worker

# Pull Ollama model
ollama-pull:
	docker compose exec ollama ollama pull llama2

# Initialize project (first time setup)
init: build up
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Initializing database..."
	@make db-init
	@echo ""
	@echo "Setup complete! Your services are running:"
	@echo "  - Backend API: http://localhost:8000"
	@echo "  - API Docs: http://localhost:8000/docs"
	@echo "  - Database: localhost:5432"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "Optionally, pull an Ollama model with: make ollama-pull"

# Development workflow
dev:
	docker compose up

# View resource usage
stats:
	docker compose stats

# Check service health
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health | python -m json.tool || echo "Backend is not responding"
	@docker compose exec postgres pg_isready -U user || echo "PostgreSQL is not ready"
	@docker compose exec redis redis-cli ping || echo "Redis is not responding"
