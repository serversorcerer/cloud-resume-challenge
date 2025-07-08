#!/bin/bash

# Cloud Resume Challenge - Quick Deploy Script
# This script syncs the website to S3 and invalidates CloudFront cache

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET="josephaleto.io"
CLOUDFRONT_DISTRIBUTION_ID="EDF9KNLZPHME3"
WEBSITE_DIR="./website"

echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "$WEBSITE_DIR" ]; then
    echo -e "${RED}❌ Website directory not found. Make sure you're in the project root.${NC}"
    exit 1
fi

# Sync website to S3
echo -e "${BLUE}📦 Syncing website to S3 bucket: $S3_BUCKET${NC}"
aws s3 sync "$WEBSITE_DIR" "s3://$S3_BUCKET" --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Website sync completed successfully${NC}"
else
    echo -e "${RED}❌ Website sync failed${NC}"
    exit 1
fi

# Invalidate CloudFront cache
echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_OUTPUT${NC}"
    echo -e "${BLUE}💡 Note: Invalidation may take a few minutes to complete${NC}"
else
    echo -e "${RED}❌ CloudFront invalidation failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Your site should be updated at: https://$S3_BUCKET${NC}"
