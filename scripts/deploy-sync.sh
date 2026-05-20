#!/bin/bash

# Configuration
PROJECT_DIR="$HOME/projects/mushroombox"
APP_NAME="mushroombox"

echo "🚀 Starting Deployment Sync..."

# Navigate to project
cd "$PROJECT_DIR" || { echo "❌ Error: Project directory not found"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building the application..."
npm run build

# Restart the application with PM2
echo "🔄 Restarting app with PM2..."
pm2 restart "$APP_NAME" || pm2 start npm --name "$APP_NAME" -- start

echo "✅ Deployment Complete!"
