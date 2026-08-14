#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Building vps-demo-image..."
docker build -t vps-demo-image "$ROOT/docker/vps-demo-image"

echo "vps-demo-image ready."
