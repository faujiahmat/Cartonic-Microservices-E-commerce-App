#!/bin/bash

echo "🔄 Starting all services using Docker Compose..."

# Menjalankan Kong, Prometheus, dan Grafana
docker compose -f ./api-gateway/docker-compose.yaml --env-file .env up -d

# Apply the Kong configuration
deck gateway sync --kong-addr http://localhost:8001 ./api-gateway/kong/config/kong.yaml

# Menjalankan Services
docker-compose -f ./docker/docker-compose.yaml up --build -d

echo "✅ All services are up and running!"
