#!/bin/bash

# Secure deployment script for blackjack Lambda function
# Uses AWS credentials from ~/.aws/credentials

set -e  # Exit on any error

# Configuration
FUNCTION_NAME="blackjack-game"
LAMBDA_DIR="lambda"
ZIP_FILE="lambda-function.zip"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of ${FUNCTION_NAME}...${NC}"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}Error: AWS credentials not configured or invalid${NC}"
    echo "Please run 'aws configure' to set up your credentials"
    exit 1
fi

# Display current AWS identity
echo -e "${GREEN}AWS Identity:${NC}"
aws sts get-caller-identity

# Check if lambda directory exists
if [ ! -d "$LAMBDA_DIR" ]; then
    echo -e "${RED}Error: Lambda directory '$LAMBDA_DIR' not found${NC}"
    exit 1
fi

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
cd "$LAMBDA_DIR"

# Remove old zip if it exists
if [ -f "$ZIP_FILE" ]; then
    rm "$ZIP_FILE"
    echo "Removed old zip file"
fi

# Create new zip excluding unwanted files
zip -r "$ZIP_FILE" . -x "*.zip" "*.git*" "*.DS_Store" "*/__pycache__/*" "*/node_modules/.cache/*"

echo -e "${GREEN}Created $ZIP_FILE${NC}"

# Deploy to Lambda
echo -e "${YELLOW}Deploying to AWS Lambda...${NC}"
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lambda function deployed successfully!${NC}"
else
    echo -e "${RED}❌ Lambda deployment failed${NC}"
    exit 1
fi

# Return to project root
cd ..

echo -e "${GREEN}✅ Lambda function deployed successfully!${NC}"
echo -e "${YELLOW}💡 Note: For production deployments, push your changes to GitHub${NC}"
echo -e "${YELLOW}   The CI/CD pipeline will handle automatic deployment${NC}"
