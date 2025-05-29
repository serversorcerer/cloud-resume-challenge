# Cloud Resume Challenge

[![Terraform](https://img.shields.io/badge/Terraform-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

Welcome to my Cloud Resume Challenge project — a real-world demonstration of my ability to design, build, and operate scalable AWS infrastructure while delivering a seamless and interactive web experience. This project showcases not only technical skills but also my commitment to automation, reliability, and user engagement.

🚀 **Check out the live site:** [https://josephaleto.io](https://josephaleto.io)

![Architecture Diagram](/website/images/architecture.png)

## Features

- 🔥 **Real-Time Visitor Counter:** Instantly tracks and displays page views using a serverless Lambda function, providing live engagement metrics.
- 🎯 **Interactive Terminal Interface:** Engages visitors with an embedded terminal to explore commands about my experience and background, creating a memorable user experience.
- ⚙️ **Automated CI/CD Pipeline:** Seamlessly deploys updates with GitHub Actions, ensuring the website stays current without manual intervention.

## Stack Breakdown

### Infrastructure & Deployment
- **Terraform:** Infrastructure as Code for repeatable, scalable provisioning.
- **GitHub Actions:** Automated build, test, and deployment workflows.

### AWS Cloud Services
- **Amazon S3:** Reliable, cost-effective static website hosting.
- **CloudFront:** Global content delivery with SSL for secure, fast access.
- **Route 53:** DNS management ensuring smooth domain routing.
- **AWS Lambda:** Serverless compute powering the dynamic visitor counter.

## Why This Matters

For recruiters and hiring managers, this project highlights my ability to architect cloud-native solutions that combine automation, scalability, and user-centric design. It demonstrates proficiency in modern DevOps practices, cloud infrastructure, and front-end integration — all essential skills for driving impactful technology initiatives in any organization.

## Directory Overview

```
📁 /infra           → Terraform infrastructure code
📁 /website         → Static site assets (HTML, CSS, JS)
📁 /.github/workflows → CI/CD pipeline configuration
```

## Building the Project

1. Clone this repo.
2. Initialize and apply the Terraform in `infra/` to provision AWS resources.
3. Push changes to `main` – GitHub Actions will deploy the updated site to S3.

## Contact

- **Email:** [joe@josephaleto.io](mailto:joe@josephaleto.io)
- **GitHub:** [serversorcerer](https://github.com/serversorcerer)
- **LinkedIn:** [linkedin.com/in/joseph-leto](https://www.linkedin.com/in/joseph-leto/)

Real clouds. Real code. No fluff.