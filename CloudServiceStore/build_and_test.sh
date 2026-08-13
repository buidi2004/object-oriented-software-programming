#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}🚀 Starting Build & Test Pipeline...${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Restore
echo -e "\n${BLUE}[1/4] Restoring dependencies...${NC}"
dotnet restore CloudServiceStore.slnx

# 2. Build
echo -e "\n${BLUE}[2/4] Building solution...${NC}"
dotnet build CloudServiceStore.slnx --no-restore

# 3. Unit Tests
echo -e "\n${BLUE}[3/4] Running Unit Tests (Application Layer)...${NC}"
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj \
    --no-build \
    --verbosity normal \
    --filter "FullyQualifiedName~CloudServiceStore.Tests.Application"

echo -e "${GREEN}✅ Unit Tests passed successfully!${NC}"

# 4. Integration Tests
echo -e "\n${BLUE}[4/4] Running Integration Tests...${NC}"
echo "These tests spin up Testcontainers (Docker) for MS SQL and Redis. It might take a few moments."
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj \
    --no-build \
    --verbosity normal \
    --filter "FullyQualifiedName~CloudServiceStore.Tests.Integration"

echo -e "${GREEN}✅ Integration Tests passed successfully!${NC}"

# 5. Functional / E2E Tests (Optional for local)
echo -e "\n${BLUE}[5/5] Running Functional & Regression Tests (E2E)...${NC}"
echo "These tests test entire business flows. It might take some time."
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj \
    --no-build \
    --verbosity normal \
    --filter "FullyQualifiedName~CloudServiceStore.Tests.E2E"

echo -e "${GREEN}✅ Functional Tests passed successfully!${NC}"
echo -e "\n${GREEN}🎉 Pipeline completed successfully! All tests are green.${NC}"
