#!/usr/bin/env bash
set -euo pipefail

ROOT_INDEX="index.html"
DOCS_INDEX="docs/index.html"

if [[ ! -f "$ROOT_INDEX" ]]; then
  echo "Missing $ROOT_INDEX" >&2
  exit 1
fi

mkdir -p docs
cp "$ROOT_INDEX" "$DOCS_INDEX"
echo "Copied $ROOT_INDEX -> $DOCS_INDEX"
