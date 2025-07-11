# Terraform S3 Backend Configuration
# Uncomment and configure after creating the S3 bucket for state

# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "cloud-resume-challenge/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }
