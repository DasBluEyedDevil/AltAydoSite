#!/bin/bash
# WSL Bridge Script for cursor-agent using system Node.js
# This bypasses the bundled Node.js binary issue

# Source NVM if available
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
fi

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js not found. Please install Node.js first."
    exit 1
fi

# Get the cursor-agent directory
CURSOR_AGENT_DIR="$(dirname "$(readlink ~/.local/bin/cursor-agent)")"

# Execute cursor-agent index.js directly with system Node.js
exec node --use-system-ca "$CURSOR_AGENT_DIR/index.js" "$@"