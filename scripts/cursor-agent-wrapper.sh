#!/bin/bash
# cursor-agent-wrapper.sh - Handles orphaned worker-server cleanup for Cursor Agent
#
# This wrapper addresses the issue where cursor-agent spawns worker-server processes
# that don't terminate, causing commands to hang even with the -p flag.
#
# Usage: ./cursor-agent-wrapper.sh "Your task description here"
# Example: ./cursor-agent-wrapper.sh "Review the UI components and suggest improvements"

set -e

# Validate input
if [ -z "$1" ]; then
  echo "Error: No task provided"
  echo "Usage: $0 \"Your task description\""
  exit 1
fi

TASK="$1"
PROJECT_DIR="/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io"
CURSOR_PATH="/home/devil/.local/bin/cursor-agent"
LOG_FILE="/tmp/cursor-agent-$(date +%s).log"

# Cleanup function to kill orphaned processes
cleanup() {
  echo "Cleaning up orphaned cursor-agent processes..."
  # Try pkill first (Linux), fallback to taskkill (Windows), ignore errors
  if command -v pkill &> /dev/null; then
    pkill -f 'cursor-agent.*worker-server' 2>/dev/null || true
  elif command -v taskkill &> /dev/null; then
    taskkill //F //IM cursor-agent.exe 2>/dev/null || true
  fi
  rm -f "$LOG_FILE" 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

echo "Starting Cursor Agent with task: $TASK"
echo "Log file: $LOG_FILE"
echo "---"

# Start cursor-agent in background, redirect output to log
wsl.exe bash -c "cd '$PROJECT_DIR' && sudo -u devil $CURSOR_PATH -p --force --model sonnet-4.5 --output-format text '$TASK'" > "$LOG_FILE" 2>&1 &
CURSOR_PID=$!

echo "Cursor Agent PID: $CURSOR_PID"
echo "Monitoring for completion..."

# Monitor for success in logs or process completion
TIMEOUT=300  # 5 minutes
ELAPSED=0
while kill -0 $CURSOR_PID 2>/dev/null; do
  # Check if success indicators appear in output
  if grep -qiE "success|completed|done|implementation complete|changes made" "$LOG_FILE" 2>/dev/null; then
    echo "Success detected in logs, allowing graceful completion..."
    sleep 5  # Give it a moment to finish writing
    kill $CURSOR_PID 2>/dev/null || true
    break
  fi

  # Check for timeout
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "Timeout reached ($TIMEOUT seconds), terminating..."
    kill -TERM $CURSOR_PID 2>/dev/null || true
    sleep 2
    kill -KILL $CURSOR_PID 2>/dev/null || true
    break
  fi

  sleep 2
  ELAPSED=$((ELAPSED + 2))

  # Show progress every 30 seconds
  if [ $((ELAPSED % 30)) -eq 0 ]; then
    echo "Still running... (${ELAPSED}s elapsed)"
  fi
done

# Wait for process to finish
wait $CURSOR_PID 2>/dev/null || true
EXIT_CODE=$?

echo "---"
echo "Cursor Agent execution complete (exit code: $EXIT_CODE)"
echo ""
echo "=== OUTPUT ==="
cat "$LOG_FILE"
echo "=== END OUTPUT ==="

exit $EXIT_CODE
