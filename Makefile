docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-restart:
	docker compose down
	docker compose up -d

docker-logs:
	docker compose logs -f

# ----------------------------------------
# 🗃️ Database Backups
# ----------------------------------------

backup_db: ## Create full DB backup (local)
	./backend/scripts/backup_db.sh local

backup_schema: ## Create schema-only backup (local)
	./backend/scripts/backup_db.sh local --schema-only

restore_db: ## Restore DB from a backup file (local)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE. Example:"; \
		echo "   make restore_db BACKUP_FILE=backend/backups/your_backup.sql"; \
		exit 1; \
	fi
	./backend/scripts/restore_db.sh $(BACKUP_FILE) local

restore_last: ## Restore the latest backup (local)
	@LATEST=$$(ls -t backend/backups/*.sql | head -n 1); \
	echo "Restoring: $$LATEST"; \
	./backend/scripts/restore_db.sh $$LATEST local

reset_db: ## Drop and recreate the database (local)
	./backend/scripts/reset_db.sh local
