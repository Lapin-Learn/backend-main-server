
# Default environment is 'local'
ENV ?= local

# Environment-specific configurations
define CONFIG_local
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1
POSTGRES_DB=lapin-learn
endef

define CONFIG_staging
POSTGRES_HOST=staging.lapinlearn.edu.vn
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1
POSTGRES_DB=lapin-learn
endef

define CONFIG_production
POSTGRES_HOST=178.128.113.160
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Sw33tH0me
POSTGRES_DB=lapinlearn
endef

# Load the correct configuration based on ENV
$(eval CONFIG := $(CONFIG_$(ENV)))
$(eval $(CONFIG))

# Command to run migrations
.PHONY: migrate
migrate:
	@echo "Running migrations for environment: $(ENV)"
	@echo "Using database: $(POSTGRES_DB) at $(POSTGRES_HOST):$(POSTGRES_PORT)"
	@POSTGRES_HOST=$(POSTGRES_HOST) \
	POSTGRES_PORT=$(POSTGRES_PORT) \
	POSTGRES_USER=$(POSTGRES_USER) \
	POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
	POSTGRES_DB=$(POSTGRES_DB) \
	pnpm migrate
