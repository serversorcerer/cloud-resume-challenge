# Project Structure

This document outlines the organization of the cloud-resume-challenge repository.

## Directory Structure

```
cloud-resume-challenge/
├── .github/
│   └── workflows/
│       └── complete-cicd.yml     # GitHub Actions CI/CD pipeline
├── docs/
│   ├── BLACKJACK_README.md       # Blackjack game documentation
│   └── PROJECT_STRUCTURE.md      # This file
├── infra/
│   ├── modules/
│   │   └── command_api/          # Terraform module for API Gateway
│   ├── main.tf                   # Main Terraform configuration
│   ├── provider.tf               # AWS provider configuration
│   ├── variables.tf              # Terraform variables
│   └── outputs.tf                # Terraform outputs
├── lambda/
│   ├── __tests__/                # Jest unit tests
│   ├── lib/                      # Lambda function libraries
│   ├── blackjack.js              # Main Lambda handler
│   ├── commands.js               # Terminal commands handler
│   ├── index.js                  # Lambda entry point
│   ├── package.json              # Node.js dependencies
│   ├── jest.config.js            # Jest testing configuration
│   └── .eslintrc.js              # ESLint code quality configuration
├── scripts/
│   ├── deploy.sh                 # Manual deployment script
│   └── deploy-blackjack.sh       # Blackjack-specific deployment
├── website/
│   ├── css/                      # Stylesheets
│   ├── js/                       # JavaScript files
│   ├── images/                   # Images and assets
│   └── icon-fonts/               # Font Awesome icons
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore patterns
├── Makefile                      # Build automation
└── README.md                     # Main project documentation
```

## Key Components

### Infrastructure (`infra/`)
- **Terraform configurations** for AWS resources
- **Modules** for reusable infrastructure components
- **Provider configurations** for AWS integration

### Lambda Functions (`lambda/`)
- **Source code** for serverless functions
- **Libraries** for shared functionality
- **Tests** for quality assurance
- **Configuration** for testing and linting

### Frontend (`website/`)
- **Static website** files
- **Assets** including CSS, JS, and images
- **Third-party libraries** (Font Awesome, jQuery)

### CI/CD (`.github/workflows/`)
- **GitHub Actions** workflows
- **Automated testing** and deployment
- **Quality gates** and security checks

### Scripts (`scripts/`)
- **Deployment scripts** for manual operations
- **Utility scripts** for development

### Documentation (`docs/`)
- **Project documentation**
- **Feature-specific guides**
- **Architecture diagrams**

## File Naming Conventions

- **Terraform files**: `*.tf`
- **Lambda functions**: `*.js`
- **Test files**: `*.test.js` or `*/__tests__/*.js`
- **Configuration files**: `.*rc.js`, `*.config.js`
- **Documentation**: `*.md`
- **Scripts**: `*.sh`

## Development Workflow

1. **Code changes** in `lambda/` or `website/`
2. **Tests run** locally and in CI/CD
3. **Infrastructure changes** in `infra/`
4. **Deployment** via GitHub Actions on push to `main`

## Security Considerations

- **Environment variables** stored in `.env` (gitignored)
- **AWS credentials** configured in GitHub Secrets
- **Sensitive files** excluded via `.gitignore`
- **Code quality** enforced via ESLint and Jest

## Getting Started

1. Clone the repository
2. Install dependencies: `cd lambda && npm install`
3. Configure AWS credentials
4. Run tests: `npm test`
5. Deploy: Push to `main` branch
