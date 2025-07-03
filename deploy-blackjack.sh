#!/bin/bash

# Enhanced Blackjack Game Deployment Script
echo "🎰 Deploying Enhanced Blackjack Game..."

# Navigate to lambda directory
cd lambda

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create deployment package
echo "📦 Creating deployment package..."
rm -f blackjack-enhanced.zip
zip -r blackjack-enhanced.zip . -x "node_modules/*" "*.zip" ".git/*"

# Get the zip file size
ZIP_SIZE=$(du -h blackjack-enhanced.zip | cut -f1)
echo "📦 Package size: $ZIP_SIZE"

# Deploy to AWS Lambda
echo "🚀 Deploying to AWS Lambda..."
aws lambda update-function-code \
    --function-name blackjack-game \
    --zip-file fileb://blackjack-enhanced.zip \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Enhanced Blackjack game deployed successfully!"
    echo "🎮 Features now available:"
    echo "   • Splits (when you have matching cards)"
    echo "   • Surrender (give up half your bet)"
    echo "   • Insurance (when dealer shows Ace)"
    echo "   • Blackjack pays 3:2"
    echo "   • Double Down on any two cards"
    echo "   • Multiple hands support"
    echo "   • Enhanced UI with hand tracking"
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Clean up
rm -f blackjack-enhanced.zip

echo "🎉 Deployment complete! Visit your website to play the enhanced blackjack game." 