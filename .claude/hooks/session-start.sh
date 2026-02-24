#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing npm dependencies..."
cd "$CLAUDE_PROJECT_DIR"
npm install

echo "Session start hook complete."
