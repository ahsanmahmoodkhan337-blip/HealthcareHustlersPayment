#!/bin/bash
set -e

echo "=== Healthcare Hustlers Invoice Portal: Publish ==="

# Build
echo "--- Building Next.js app ---"
npx next build

# Kill anything on port 3000
echo "--- Freeing port 3000 ---"
sudo sh -c 'lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null | xargs -r kill' || true

# Start the server
echo "--- Starting server on port 3000 ---"
npx next start -p 3000 &
echo "Server started (PID $!)"
echo "=== Done ==="