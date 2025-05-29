# Cloud Resume Challenge

A hands-on project proving I can build and operate AWS infrastructure. This repository contains the code that powers [josephaleto.io](https://josephaleto.io), a resume site served entirely from AWS and deployed automatically from GitHub.

## Features

- **Visitor Counter** – Serverless Lambda function tracks page views and updates in real time.
- **Interactive Terminal** – Embedded terminal lets visitors explore commands about the site and my background.
- **CI/CD Pipeline** – GitHub Actions syncs the website to S3 on every push.

## Stack Breakdown

- **Amazon S3** – Hosts the static website files.
- **CloudFront** – Delivers content globally with HTTPS.
- **Route 53** – Provides DNS routing for `josephaleto.io`.
- **AWS Lambda** – Powers the visitor counter through a Lambda URL.
- **Terraform** – Defines infrastructure as code for repeatable deployments.
- **GitHub Actions** – Handles continuous integration and deployment.

## Directory Overview

```
/infra      # Terraform configuration
/website    # HTML, CSS, JS for the resume site
.github/
  workflows # CI/CD pipeline
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