#!/bin/bash
# =============================================================================
# Xcode Cloud CI Build Script
# =============================================================================
# This script is executed by Xcode Cloud to build the web app and sync
# Capacitor iOS assets before Xcode builds the native app.
#
# Usage: Run this script as a pre-build step in Xcode Cloud
# Requirements: Node.js 18+, npm, CocoaPods
# =============================================================================

set -euo pipefail

echo "========================================"
echo "PetLinkID - Xcode Cloud Build Script"
echo "========================================"
echo ""

# Navigate to repository root (Xcode Cloud clones to $CI_PRIMARY_REPOSITORY_PATH)
cd "${CI_PRIMARY_REPOSITORY_PATH:-$(dirname "$0")/..}"

echo "📁 Working directory: $(pwd)"
echo ""

# Step 1: Install Node.js dependencies
echo "📦 Step 1/4: Installing Node.js dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Step 2: Build web app
echo "🔨 Step 2/4: Building web app..."
npm run build
echo "✅ Web app built"
echo ""

# Step 3: Sync Capacitor iOS assets
echo "📱 Step 3/4: Syncing Capacitor iOS..."
npx cap sync ios
echo "✅ Capacitor iOS synced"
echo ""

# Step 4: Install CocoaPods dependencies
echo "🍫 Step 4/4: Installing CocoaPods..."
cd ios/App
pod install
echo "✅ CocoaPods installed"
echo ""

echo "========================================"
echo "✅ Build preparation complete!"
echo "========================================"
