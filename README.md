# Cloud Resume Challenge

Welcome to the Cloud Resume Challenge repository! This project showcases my journey and learning experiences with AWS services through the creation of a personal web resume. The aim of this challenge is to demonstrate the practical application of cloud technologies and infrastructure as code. Dive in to explore the details of the project and gain insights into AWS and web development.

![serversorcerer72_cloud_computing_challenge_b2e11874-0a47-4d20-9912-d3a49952adff](https://github.com/serversorcerer/cloud-resume-challenge/assets/134334331/23d6970c-75e4-40ad-9129-5a6653b29515)


## Project Overview

### 2023 - Present
**AWS Cloud Resume Challenge**

This project represents a detailed exploration into various AWS services and how they can be utilized to host and manage a personal web resume. Below is a summary of the key components and accomplishments of this challenge:

## Key Features

- **Designed and Developed Personal Web Resume**
  - Created a visually appealing and responsive layout using HTML and CSS.
  - Ensured cross-browser compatibility and mobile responsiveness.

- **Deployed on Amazon S3**
  - Leveraged [Amazon S3](https://aws.amazon.com/s3/) for reliable static site hosting with high availability.
  - Configured bucket policies to make the site publicly accessible.

- **Enhanced Security**
  - Implemented HTTPS for secure data transmission using [Amazon CloudFront](https://aws.amazon.com/cloudfront/).
  - Ensured end-to-end encryption for data integrity and privacy.

- **Custom Domain and DNS Settings**
  - Configured a custom domain with [Amazon Route 53](https://aws.amazon.com/route53/).
  - Set up personalized DNS settings for easy and memorable access to the site.

- **Infrastructure Optimization with Terraform**
  - Automated infrastructure deployment and management using [Terraform](https://www.terraform.io/).
  - Improved efficiency and scalability of the deployment process.

- **Real-Time Visitor Counter**
  - Integrated a real-time visitor counter using JavaScript.
  - Connected the frontend with backend services including [AWS Lambda](https://aws.amazon.com/lambda/), [API Gateway](https://aws.amazon.com/api-gateway/), and [DynamoDB](https://aws.amazon.com/dynamodb/).

- **CI/CD Pipeline with GitHub Actions**
  - Implemented continuous integration and continuous deployment (CI/CD) pipelines using [GitHub Actions](https://github.com/features/actions).
  - Ensured automated updates and maintained website security.

- **Comprehensive Documentation**
  - Documented the entire project and learning outcomes in a detailed blog post.
  - Shared insights and methodologies to help others replicate and learn from this challenge.

## Getting Started

### Prerequisites

To run this project, you'll need the following:

- An [AWS account](https://aws.amazon.com/)
- Basic knowledge of HTML, CSS, and JavaScript
- Familiarity with AWS services such as S3, CloudFront, Route 53, Lambda, API Gateway, and DynamoDB
- [Terraform](https://www.terraform.io/) for infrastructure as code
- [GitHub](https://github.com/) for version control and CI/CD

### Installation and Setup

### Deploy Infrastructure with Terraform

- Ensure Terraform is installed on your machine.
- Navigate to the `infrastructure` directory and run:
  ```bash
  terraform init
  terraform apply

### Deploy the Website
Upload your HTML/CSS files to the S3 bucket created by Terraform.
Update the CloudFront distribution to point to the S3 bucket.
Set Up CI/CD with GitHub Actions

### Configure GitHub Actions workflows to automate deployments.
Usage
Visit your personalized domain to see the live version of your resume. Any updates pushed to the GitHub repository will automatically trigger the CI/CD pipeline, ensuring your site is always up-to-date.

### Contributing
Contributions are welcome! Feel free to fork the repository, make changes, and submit pull requests. Please ensure your contributions adhere to the project's coding standards and best practices.

### License
This project is licensed under the MIT License. See the LICENSE file for more details.

### Contact
For any questions or inquiries, please reach out to me at joe@josephaleto.io.
