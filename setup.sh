#!/bin/bash

# setup.sh - macOS setup script for 5-aside-app

set -e

echo "🚀 Starting setup for 5-aside-app..."

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "ℹ️ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew is already installed."
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ℹ️ Node.js not found. Installing Node.js via Homebrew..."
    brew install node
else
    echo "✅ Node.js is already installed ($(node -v))."
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

echo "✨ Setup complete!"
echo "🏃 To start the development server, run: npm run dev"
