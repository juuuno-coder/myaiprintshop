#!/bin/bash

# GOODZZ Docker Deployment Script
# Usage: ./deploy.sh [user@host]

SERVER=$1

if [ -z "$SERVER" ]; then
  echo "Usage: ./deploy.sh [user@host]"
  exit 1
fi

echo "🚀 Deploying GOODZZ to $SERVER..."

# 1. Prepare lock file from root (Monorepo support)
echo "🔗 Preparing lock file from root..."
cp ../../bun.lock ./ 2>/dev/null || echo "⚠️ No bun.lock found in root"

# 2. Sync files (excluding node_modules and .next)
echo "📦 Syncing files..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ "$SERVER":~/goodzz-app/

# 2. Run docker-compose on the server
echo "🏗️ Building and starting containers on the server..."
ssh "$SERVER" "cd ~/goodzz-app && docker-compose up -d --build"

echo "✅ Deployment complete! Check your app at http://$SERVER:3300"
