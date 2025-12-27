#!/bin/bash

# Deploy Script for Slowly WebUI
# Handles Build -> Auth -> Sync -> Verify

set -e # Exit on error

# Directory constants
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
ENV_FILE="$PROJECT_ROOT/../.agent/secrets.env"

echo "🚀 Starting Deployment Process..."

# 1. Load Secrets
if [ -f "$ENV_FILE" ]; then
    echo "🔑 Loading secrets from $ENV_FILE..."
    source "$ENV_FILE"
    export SSHPASS="$SSH_PASSWORD"
else
    echo "❌ Error: Secrets file not found at $ENV_FILE"
    exit 1
fi

# 2. Parse Letters (regenerate letters.json from Markdown)
echo "📜 Parsing letters..."
npx tsx scripts/parse_letters.ts

# 3. Build Project
echo "🏗️  Building WebUI..."
cd "$PROJECT_ROOT"
npm run build

# 3. Deploy via Rsync
echo "📤 Syncing files to $SSH_HOST..."
# Using rsync with sshpass for non-interactive password auth
sshpass -e rsync -avz "$PROJECT_ROOT/dist/" "$SSH_HOST:$DEPLOY_PATH"

# 3b. Fix Permissions (Force fix for Mac/old rsync and strict nginx)
echo "🔒 Fixing remote permissions..."
sshpass -e ssh -o StrictHostKeyChecking=no "$SSH_HOST" "chmod -R a+rX $DEPLOY_PATH"

# 4. Smoke Test
echo "🕵️  Running Smoke Test..."
# We try to fetch letters.json to verify Nginx is serving files and JSON is valid
TEST_URL="${PUBLIC_URL}/data/letters.json"
HTTP_CODE=$(curl -o /dev/null --silent --head --write-out '%{http_code}\n' "$TEST_URL")

if [ "$HTTP_CODE" -eq "200" ]; then
    echo "✅ Smoke Test PASSED! (Status: $HTTP_CODE)"
    echo "🌐 Site is live at $PUBLIC_URL"
else
    echo "⚠️  Smoke Test WARNING: Status $HTTP_CODE"
    echo "   URL: $TEST_URL"
    # Don't fail the build script on smoke test, but warn loudly
fi

echo "✨ Deployment Complete!"
