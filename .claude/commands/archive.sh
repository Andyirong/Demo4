#!/bin/bash

# Archive command wrapper with real-time output
# This wrapper ensures real-time output by using unbuffer

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_SCRIPT="$SCRIPT_DIR/../skills/branch-archive/scripts/archive-runner.cjs"

# Check if the archive script exists
if [ ! -f "$ARCHIVE_SCRIPT" ]; then
    echo "❌ Archive script not found: $ARCHIVE_SCRIPT"
    exit 1
fi

# Pass all arguments to the archive script
# Use node with proper stdio settings for real-time output
exec node --stdio=inherit "$ARCHIVE_SCRIPT" "$@"