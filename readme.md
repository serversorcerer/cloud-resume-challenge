# josephaleto.io — The Cloud Terminal Portfolio

This is not your typical portfolio.

`josephaleto.io` is a terminal-first, AWS-powered portfolio interface. Visitors interact through a live terminal, where every command triggers real infrastructure — not simulated shell commands.

## \u2699\ufe0f Core Features

- **Terminal UI:** Built with vanilla JS and React hooks. Emulates a real command-line interface with glowing prompt animations and typed command history.
- **Lambda-Backed Commands:** All major commands are routed through AWS Lambda using API Gateway. Responses are live and configurable from backend code.
- **`offer` Command (Live Lead Capture):** Sends recruiter info (name, email, company, optional message) through a Zapier webhook. Delivered instantly to the candidate via custom email.
- **`resume` Command:** Instantly opens a PDF resume in a new browser tab.
- **`infra` Command (In Progress):** Will dynamically render or visualize the AWS architecture behind this site.
- **View Counter:** Reads from DynamoDB via Lambda to return a live page view count to the terminal.
- **`help`, `bio`, `projects`, `stack`, `source code`:** All command outputs are dynamically served via Lambda and can be extended or aliased.

## \ud83c\udf10 Hybrid Experience

- On **desktop**, users are dropped directly into the terminal interface.
- On **mobile**, users are given the option to either enter the terminal or view a simplified scroll-based r\u00e9sum\u00e9.
- A persistent `exit terminal` option allows any visitor to access a recruiter-friendly fallback page.

## \ud83d\udcaa Infrastructure Overview

- **Frontend:** React + JS Terminal Emulator
- **Backend:** AWS Lambda + API Gateway
- **Hosting:** S3 + CloudFront + Route 53
- **Automation:** Zapier Webhooks, Airtable Feedback Tracking
- **IaC:** Terraform-managed infrastructure
- **CI/CD:** GitHub Actions with deploy-on-commit for Lambda/API infra

## \ud83d\ude80 Try It

Type `help`, `resume`, or `offer` at [https://josephaleto.io](https://josephaleto.io)    
See the terminal come to life — and maybe send an offer.

---

