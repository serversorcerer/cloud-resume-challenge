# Development Guide

## Prerequisites

- Node.js 18+ 
- AWS CLI configured
- Terraform 1.5+
- Git

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/serversorcerer/cloud-resume-challenge.git
   cd cloud-resume-challenge
   ```

2. **Install dependencies**
   ```bash
   cd lambda
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Configure AWS credentials**
   ```bash
   aws configure
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
cd lambda
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Infrastructure Changes

```bash
# Navigate to infrastructure directory
cd infra

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Lambda Development

```bash
# Test locally
cd lambda
node -e "console.log(require('./blackjack.js'))"

# Deploy manually (for testing)
../scripts/deploy.sh
```

### Frontend Development

```bash
# Serve locally (if you have a local server)
cd website
python -m http.server 8000
# or
npx serve .
```

## Code Quality Standards

### JavaScript Style Guide

- Use ES6+ features
- Follow ESLint rules
- Write descriptive variable names
- Add JSDoc comments for functions
- Use single quotes for strings
- Use 2-space indentation

### Testing Requirements

- Minimum 70% code coverage
- Test all public functions
- Test error conditions
- Mock external dependencies
- Use descriptive test names

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   npm test
   npm run lint
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Deployment

### Automatic Deployment

- Push to `main` branch triggers CI/CD
- GitHub Actions runs tests and deploys
- Monitor deployment in Actions tab

### Manual Deployment

```bash
# Deploy Lambda function
./scripts/deploy.sh

# Deploy Blackjack specifically
./scripts/deploy-blackjack.sh
```

## Troubleshooting

### Common Issues

1. **AWS credentials not configured**
   ```bash
   aws configure
   aws sts get-caller-identity
   ```

2. **Terraform state issues**
   ```bash
   cd infra
   terraform refresh
   ```

3. **Lambda deployment failures**
   ```bash
   # Check function exists
   aws lambda get-function --function-name blackjack-game
   
   # Check logs
   aws logs describe-log-groups --log-group-name-prefix /aws/lambda/blackjack-game
   ```

4. **Test failures**
   ```bash
   # Run specific test
   npm test -- --testNamePattern="your test name"
   
   # Debug mode
   npm test -- --verbose
   ```

### Debugging

1. **Local Lambda testing**
   ```bash
   cd lambda
   node -e "
   const handler = require('./blackjack.js').handler;
   handler({
     httpMethod: 'POST',
     body: JSON.stringify({action: 'newGame', bet: 100}),
     headers: {}
   }).then(console.log);
   "
   ```

2. **CloudWatch Logs**
   ```bash
   aws logs tail /aws/lambda/blackjack-game --follow
   ```

3. **Infrastructure debugging**
   ```bash
   cd infra
   terraform show
   terraform output
   ```

## Environment Variables

See `.env.example` for required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Architecture

See `docs/PROJECT_STRUCTURE.md` for detailed architecture information.
