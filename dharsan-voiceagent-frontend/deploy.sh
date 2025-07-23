#!/bin/bash

echo "🚀 Starting deployment process..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist node_modules package-lock.json

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Run build
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in dist/ directory"
    echo "🌐 Ready for deployment to Vercel"
else
    echo "❌ Build failed!"
    exit 1
fi 