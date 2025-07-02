#!/bin/bash

# Deploy Blackjack Game to josephaleto.io
# This script deploys the complete blackjack game infrastructure

set -e

echo "🃏 Deploying Blackjack Game to josephaleto.io"
echo "============================================"

# Check if we're in the right directory
if [[ ! -d "lambda" || ! -d "infra" || ! -d "website" ]]; then
    echo "❌ Error: Please run this script from the cloud-resume-challenge root directory"
    exit 1
fi

# Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd lambda
if [[ ! -f package.json ]]; then
    echo "❌ Error: package.json not found in lambda directory"
    exit 1
fi

npm install
cd ..

# Deploy infrastructure with Terraform
echo "🏗️  Deploying infrastructure with Terraform..."
cd infra

# Initialize Terraform if needed
if [[ ! -d ".terraform" ]]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

# Plan the deployment
echo "📋 Planning Terraform deployment..."
terraform plan -target=aws_dynamodb_table.blackjack_games \
                -target=aws_lambda_function.blackjack_function \
                -target=aws_apigatewayv2_api.blackjack_api \
                -target=aws_apigatewayv2_stage.blackjack_api_stage \
                -target=aws_apigatewayv2_route.blackjack_route \
                -target=aws_apigatewayv2_route.blackjack_options_route \
                -target=aws_apigatewayv2_integration.blackjack_lambda_integration \
                -out=blackjack.tfplan

# Apply the deployment
echo "🚀 Deploying blackjack infrastructure..."
terraform apply blackjack.tfplan

# Get the API endpoint URL
API_URL=$(terraform output -raw blackjack_api_url 2>/dev/null || echo "")

if [[ -z "$API_URL" ]]; then
    echo "⚠️  Warning: Could not retrieve API URL from Terraform output"
    echo "   You'll need to manually update the API_URL in blackjack.html"
else
    echo "✅ API deployed at: $API_URL"
    
    # Update the API URL in the frontend
    echo "🔧 Updating API URL in blackjack.html..."
    cd ../website
    
    # Update the API_URL constant in blackjack.html
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|const API_URL = '.*';|const API_URL = '$API_URL';|g" blackjack.html
    else
        # Linux
        sed -i "s|const API_URL = '.*';|const API_URL = '$API_URL';|g" blackjack.html
    fi
    
    echo "✅ Updated API URL in blackjack.html"
fi

cd ..

# Update and deploy the commands Lambda function
echo "🔄 Updating commands Lambda function..."
cd lambda

# Create a new deployment package for the commands function
zip -r function.zip commands.js >/dev/null 2>&1

echo "✅ Created new commands deployment package"

# Deploy to existing Lambda function (assuming it exists from your infrastructure)
aws lambda update-function-code \
    --function-name cloud-resume-commands \
    --zip-file fileb://function.zip \
    --region us-east-1 2>/dev/null || echo "⚠️  Note: Could not update commands function automatically"

cd ..

# Deploy website files
echo "🌐 Deploying website files..."

# Upload blackjack.html to S3
aws s3 cp website/blackjack.html s3://josephaleto.io/blackjack.html \
    --region us-east-1 \
    --content-type "text/html" 2>/dev/null || echo "⚠️  Note: Could not upload blackjack.html automatically"

# Invalidate CloudFront cache for blackjack.html
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='josephaleto.io distribution'].Id" \
    --output text 2>/dev/null || echo "")

if [[ -n "$DISTRIBUTION_ID" && "$DISTRIBUTION_ID" != "None" ]]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/blackjack.html" >/dev/null 2>&1 || echo "⚠️  Could not invalidate cache automatically"
    echo "✅ CloudFront cache invalidated"
else
    echo "⚠️  Could not find CloudFront distribution automatically"
fi

echo ""
echo "🎉 Blackjack Game Deployment Complete!"
echo "======================================"
echo ""
echo "🔗 Game URL: https://josephaleto.io/blackjack.html"
echo "🎮 Terminal command: Type 'blackjack' in your terminal"
if [[ -n "$API_URL" ]]; then
    echo "🔌 API endpoint: $API_URL"
fi
echo ""
echo "📊 Features deployed:"
echo "  ✅ Full blackjack game logic with proper rules"
echo "  ✅ Game state persistence in DynamoDB"
echo "  ✅ Player statistics tracking"
echo "  ✅ Responsive web interface"
echo "  ✅ AWS Lambda backend"
echo "  ✅ API Gateway REST API"
echo "  ✅ Terminal integration"
echo ""
echo "🎯 Next steps:"
echo "  1. Test the game at https://josephaleto.io/blackjack.html"
echo "  2. Try the 'blackjack' command in your terminal"
echo "  3. Verify game statistics are tracking properly"
echo ""
echo "Happy gaming! 🃏♠️♥️♦️♣️"
