# Makefile for Cloud Resume Challenge
# Provides convenient commands for deployment and development

.PHONY: help deploy test clean status logs

# Default target
help:
	@echo "Available commands:"
	@echo "  deploy         - Deploy Lambda function to AWS"
	@echo "  test           - Run unit tests"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  lint           - Run ESLint code quality checks"
	@echo "  lint-fix       - Fix ESLint issues automatically"
	@echo "  clean          - Clean up build artifacts"
	@echo "  status         - Check AWS Lambda function status"
	@echo "  logs           - View Lambda function logs"
	@echo "  zip            - Create deployment package only"
	@echo "  git-tag        - Create a new git tag"

# Deploy the Lambda function
deploy:
	@echo "🚀 Starting deployment..."
	./scripts/deploy.sh

# Create deployment package only
zip:
	@echo "📦 Creating deployment package..."
	@cd lambda && zip -r lambda-function.zip . -x "*.zip" "*.git*" "*.DS_Store" "*/__pycache__/*" "*/node_modules/.cache/*"
	@echo "✅ Package created: lambda/lambda-function.zip"

# Check Lambda function status
status:
	@echo "📊 Checking Lambda function status..."
	aws lambda get-function --function-name blackjack-game --region us-east-1 --query 'Configuration.{State:State,LastUpdateStatus:LastUpdateStatus,Runtime:Runtime,LastModified:LastModified}'

# View recent Lambda logs
logs:
	@echo "📄 Fetching recent Lambda logs..."
	aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/blackjack-game" --region us-east-1
	@echo "Use 'aws logs tail /aws/lambda/blackjack-game --follow' to follow logs in real-time"

# Clean up build artifacts
clean:
	@echo "🧹 Cleaning up..."
	@find . -name "*.zip" -type f -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@find . -name ".DS_Store" -type f -delete 2>/dev/null || true
	@echo "✅ Cleanup completed"

# Run tests
test:
	@echo "🧪 Running tests..."
	@cd lambda && npm test

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	@cd lambda && npm run test:coverage

# Run linting
lint:
	@echo "🔍 Running linter..."
	@cd lambda && npm run lint

# Fix linting issues
lint-fix:
	@echo "🔧 Fixing linting issues..."
	@cd lambda && npm run lint:fix

# Create a new git tag
git-tag:
	@read -p "Enter tag name (e.g., v1.3-feature-name): " tag_name; \
	read -p "Enter tag message: " tag_message; \
	git tag -a $$tag_name -m "$$tag_message"; \
	git push origin $$tag_name; \
	echo "✅ Tag $$tag_name created and pushed"
