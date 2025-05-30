# The Cloud Terminal

[![Terraform](https://img.shields.io/badge/Terraform-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

This site is a proof-of-work portfolio powered by real AWS services. Every terminal command runs live infrastructure that I built with Terraform and deploy through GitHub Actions.

<p align="center">
  <img src="website/images/architecture.png" alt="Cloud Architecture Diagram" width="360" />
</p>
---

## Key Features

- **Live Visitor Counter** — Tracks and stores page views using AWS Lambda and DynamoDB.
- **Interactive Terminal Interface** — Users can explore a simulated terminal with resume commands.
- **CI/CD Deployment** — GitHub Actions automates updates from Git push to production.

---

## Technology Stack

### Infrastructure
- **Terraform** — Infrastructure as Code used to provision and manage all AWS services.
- **GitHub Actions** — Continuous Integration and Deployment for both infrastructure and frontend.

### AWS Services
- **S3** — Hosts the static website.
- **CloudFront** — Distributes content globally with HTTPS.
- **Route 53** — Manages DNS and custom domain.
- **Lambda** — Handles visitor counter logic.
- **DynamoDB** — Stores view counts reliably.

---

## Why This Project Matters

This project demonstrates not just theoretical knowledge but working, production-grade DevOps. It reflects:

- Strong understanding of cloud architecture
- Ability to automate infrastructure and deployments
- Clean, responsive front-end integration
- Reliable, testable, and scalable system design

This isn't just a static resume site—it's a fully integrated DevOps pipeline. From CI/CD to serverless backend logic and DNS routing, every piece of this infrastructure mirrors how modern cloud-native applications are built and maintained in the real world.

Recruiters and engineers can quickly assess practical skills and real-world decision-making.

---

## Project Structure

```
/infra                → Infrastructure as Code (Terraform)
/website              → Frontend (HTML, CSS, JS)
/.github/workflows    → CI/CD automation configs
README.md             → Full system documentation
```

---

## How to Deploy

1. Clone this repository.
2. Navigate to `/infra` and run:
   ```bash
   terraform init
   terraform apply
   ```
3. Push changes to `main`. GitHub Actions will handle deployment.

---

## Contact

- Email: [joe@josephaleto.io](mailto:joe@josephaleto.io)
- GitHub: [serversorcerer](https://github.com/serversorcerer)
- LinkedIn: [joseph-leto](https://www.linkedin.com/in/joseph-leto)

---

📌 Built from scratch. Architected for scale. Documented for clarity.