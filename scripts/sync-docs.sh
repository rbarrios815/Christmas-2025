#!/usr/bin/env bash
set -euo pipefail

# Sync the GitHub Pages template with the main web app template.
# Usage: ./scripts/sync-docs.sh

ROOT_INDEX="index.html"
DOCS_INDEX="docs/index.html"

if [[ ! -f "$ROOT_INDEX" ]]; then
  echo "Missing $ROOT_INDEX" >&2
  exit 1
fi

if [[ ! -d "docs" ]]; then
  echo "Missing docs/ directory" >&2
  exit 1
fi

cp "$ROOT_INDEX" "$DOCS_INDEX"
echo "Copied $ROOT_INDEX -> $DOCS_INDEX"
