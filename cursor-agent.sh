#!/bin/bash
# WSL Bridge Script for cursor-agent
# This script allows accessing cursor-agent from any environment

# Check if cursor-agent exists (it's a symlink, so check with -L)
if [ ! -L "$HOME/.local/bin/cursor-agent" ] && [ ! -f "$HOME/.local/bin/cursor-agent" ]; then
    echo "Error: cursor-agent not found at $HOME/.local/bin/cursor-agent"
    exit 1
fi

# Execute cursor-agent with all provided arguments
exec "$HOME/.local/bin/cursor-agent" "$@"