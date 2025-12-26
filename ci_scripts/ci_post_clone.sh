#!/bin/bash
# =============================================================================
# Xcode Cloud Post-Clone Script
# =============================================================================
# This script runs automatically after Xcode Cloud clones the repository.
# It installs dependencies, builds the web app, and syncs Capacitor.
#
# Location: ci_scripts/ci_post_clone.sh (required by Xcode Cloud)
# Reference: https://developer.apple.com/documentation/xcode/writing-custom-build-scripts
# =============================================================================

set -euo pipefail

echo "========================================"
echo "PetLinkID - Xcode Cloud Post-Clone"
echo "========================================"
echo ""

# Navigate to repository root
cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "📁 Repository path: $CI_PRIMARY_REPOSITORY_PATH"
echo "📁 Workspace path: $CI_WORKSPACE"
echo ""

# Install Node.js via Homebrew (Xcode Cloud has Homebrew pre-installed)
echo "📦 Step 1/5: Installing Node.js..."
brew install node@20
export PATH="/usr/local/opt/node@20/bin:$PATH"
echo "✅ Node.js installed: $(node --version)"
echo ""

# Install npm dependencies
echo "📦 Step 2/5: Installing npm dependencies..."
npm ci
echo "✅ npm dependencies installed"
echo ""

# Build web app
echo "🔨 Step 3/5: Building web app..."
npm run build
echo "✅ Web app built successfully"
echo ""

# Sync Capacitor iOS
echo "📱 Step 4/5: Syncing Capacitor iOS..."
npx cap sync ios
echo "✅ Capacitor iOS synced"
echo ""

# Install CocoaPods
echo "🍫 Step 5/5: Installing CocoaPods..."
cd "$CI_PRIMARY_REPOSITORY_PATH/ios/App"
pod install
echo "✅ CocoaPods installed"
echo ""

echo "========================================"
echo "✅ Post-clone setup complete!"
echo "   Xcode will now build the iOS app."
echo "========================================"
