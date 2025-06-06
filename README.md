# josephaleto.io — The Cloud Terminal Portfolio

[![Terraform](https://img.shields.io/badge/Terraform-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

**josephaleto.io** is a terminal-driven resume that runs entirely on AWS. Every command you type hits real Lambda code deployed through Terraform and GitHub Actions. It's part portfolio, part lab, and all proof‑of‑work.

<p align="center">
  <img src="website/images/architecture.png" alt="Cloud Architecture Diagram" width="600" />
</p>

---

## Live Demo

👉 [https://josephaleto.io](https://josephaleto.io) — open the terminal and run `help` to see what you can do.

---

## Project Description

This project started as the classic Cloud Resume Challenge and morphed into a full‑blown terminal experience. Instead of a static portfolio, visitors interact with a CLI that mirrors real infrastructure. Commands like `resume`, `stack`, and `offer` trigger a Lambda function that returns live responses or posts data to Zapier. The goal is to show how I design, deploy, and automate cloud systems, not just talk about them.

---

## Architecture Overview

- **S3** hosts the static site
- **CloudFront** serves it securely worldwide
- **API Gateway** routes terminal commands
- **Lambda** processes each command
- **DynamoDB** stores visitor stats and command data
- **Terraform** defines every resource
- **GitHub Actions** handles CI/CD

Everything is versioned and repeatable. A push to `main` triggers the pipeline and syncs the latest build to S3.

---

## Key Features

- **Real Terminal UI** — Tab completion, command history, and colored output.
- **InfraMirror** — Visualizes the backend stack directly in the terminal.
- **Zapier Contact Flow** — The `offer` command sends your info through a Zapier webhook.
- **Built‑in Commands** — `resume`, `stack`, `architecture`, `quote`, `offer`, `source code`, and more.
- **Live Visitor Counter** — Backed by Lambda and DynamoDB.

---

## Technologies Used

- **React & JavaScript** for the terminal interface
- **AWS** — S3, CloudFront, Lambda, API Gateway, DynamoDB, Route 53
- **Terraform** for Infrastructure as Code
- **GitHub Actions** for CI/CD

---

## Setup Instructions

1. Fork this repo.
2. Set your AWS credentials and domain information in `infra/variables.tf`.
3. From the `infra` directory run:
   ```bash
   terraform init
   terraform apply
   ```
4. Push to `main` to deploy via GitHub Actions.

You can tweak the terminal commands by editing `lambda/commands.js`.

---

## Author / Contact

**Joseph Leto**  
[josephaleto.io](https://josephaleto.io)  
[joe@josephaleto.io](mailto:joe@josephaleto.io)  
[github.com/serversorcerer](https://github.com/serversorcerer)

---

Built from scratch. Architected for scale. Documented for clarity.
