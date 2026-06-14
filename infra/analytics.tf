# =============================================================================
# Site analytics: privacy-friendly event funnel for josephaleto.io
#
# NOTE: Like the rest of this project's infra, these resources were applied
# out-of-band (AWS CLI) because the Terraform `infrastructure` job is disabled
# (state is local + drifted). This file is the IaC record / source of truth so
# the stack can be imported and managed by Terraform later.
#
# The HASH_SALT env var is a secret and is intentionally NOT stored here; it is
# set directly on the function. Provide it via TF_VAR_analytics_hash_salt if/when
# importing into Terraform.
# =============================================================================

variable "analytics_hash_salt" {
  description = "Salt for the daily-rotating visitor hash (set out-of-band; never commit)"
  type        = string
  default     = ""
  sensitive   = true
}

resource "aws_dynamodb_table" "site_analytics" {
  name         = "site-analytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Project     = "CloudResume"
    Environment = "production"
  }
}

resource "aws_iam_role" "site_analytics_lambda_role" {
  name = "site-analytics-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })

  tags = {
    Project     = "CloudResume"
    Environment = "production"
  }
}

resource "aws_iam_role_policy_attachment" "site_analytics_basic" {
  role       = aws_iam_role.site_analytics_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "site_analytics_ddb" {
  name = "site-analytics-ddb"
  role = aws_iam_role.site_analytics_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:Query"]
        Resource = aws_dynamodb_table.site_analytics.arn
      }
    ]
  })
}

data "archive_file" "site_analytics_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda-analytics"
  output_path = "${path.module}/site-analytics.zip"
}

resource "aws_lambda_function" "site_analytics" {
  filename         = data.archive_file.site_analytics_zip.output_path
  function_name    = "site-analytics"
  role             = aws_iam_role.site_analytics_lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 128
  source_code_hash = data.archive_file.site_analytics_zip.output_base64sha256

  environment {
    variables = {
      TABLE     = aws_dynamodb_table.site_analytics.name
      HASH_SALT = var.analytics_hash_salt
    }
  }

  tags = {
    Project     = "CloudResume"
    Environment = "production"
  }
}

resource "aws_lambda_function_url" "site_analytics" {
  function_name      = aws_lambda_function.site_analytics.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = [
      "https://josephaleto.io",
      "https://www.josephaleto.io",
      "http://localhost:8099",
      "http://127.0.0.1:8099",
    ]
    allow_methods = ["POST", "GET"]
    allow_headers = ["content-type"]
    max_age       = 86400
  }
}

output "site_analytics_url" {
  description = "Function URL for the analytics collector"
  value       = aws_lambda_function_url.site_analytics.function_url
}
