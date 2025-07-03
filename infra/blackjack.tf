# DynamoDB table for blackjack game state and statistics
resource "aws_dynamodb_table" "blackjack_games" {
  name           = "blackjack-games"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"

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
    Name        = "BlackjackGames"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# IAM role for the blackjack Lambda function
resource "aws_iam_role" "blackjack_lambda_role" {
  name = "blackjack-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "BlackjackLambdaRole"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# IAM policy for DynamoDB access
resource "aws_iam_policy" "blackjack_dynamodb_policy" {
  name        = "blackjack-dynamodb-policy"
  description = "Policy for blackjack Lambda to access DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.blackjack_games.arn
      }
    ]
  })

  tags = {
    Name        = "BlackjackDynamoDBPolicy"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# Attach DynamoDB policy to Lambda role
resource "aws_iam_role_policy_attachment" "blackjack_dynamodb_attachment" {
  role       = aws_iam_role.blackjack_lambda_role.name
  policy_arn = aws_iam_policy.blackjack_dynamodb_policy.arn
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "blackjack_lambda_basic" {
  role       = aws_iam_role.blackjack_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create deployment package for blackjack Lambda
data "archive_file" "blackjack_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/blackjack-function.zip"
  excludes = [
    "commands.js",
    "function.zip"
  ]
}

# Blackjack Lambda function
resource "aws_lambda_function" "blackjack_function" {
  filename         = data.archive_file.blackjack_lambda_zip.output_path
  function_name    = "blackjack-game"
  role            = aws_iam_role.blackjack_lambda_role.arn
  handler         = "blackjack.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  source_code_hash = data.archive_file.blackjack_lambda_zip.output_base64sha256

  environment {
    variables = {
      BLACKJACK_TABLE = aws_dynamodb_table.blackjack_games.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.blackjack_lambda_basic,
    aws_iam_role_policy_attachment.blackjack_dynamodb_attachment,
    aws_cloudwatch_log_group.blackjack_lambda_logs,
  ]

  tags = {
    Name        = "BlackjackFunction"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# CloudWatch Log Group for blackjack Lambda
resource "aws_cloudwatch_log_group" "blackjack_lambda_logs" {
  name              = "/aws/lambda/blackjack-game"
  retention_in_days = 14

  tags = {
    Name        = "BlackjackLambdaLogs"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# API Gateway v2 HTTP API for blackjack
resource "aws_apigatewayv2_api" "blackjack_api" {
  name          = "blackjack-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_origins     = ["https://josephaleto.io", "https://www.josephaleto.io", "http://localhost:3000", "http://127.0.0.1:3000"]
    max_age          = 86400
  }

  tags = {
    Name        = "BlackjackAPI"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# API Gateway stage
resource "aws_apigatewayv2_stage" "blackjack_api_stage" {
  api_id      = aws_apigatewayv2_api.blackjack_api.id
  name        = "prod"
  auto_deploy = true

  tags = {
    Name        = "BlackjackAPIStage"
    Environment = "production"
    Project     = "CloudResume"
  }
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "blackjack_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.blackjack_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.blackjack_api.execution_arn}/*/*"
}

# API Gateway integration with Lambda
resource "aws_apigatewayv2_integration" "blackjack_lambda_integration" {
  api_id             = aws_apigatewayv2_api.blackjack_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.blackjack_function.invoke_arn
}

# API Gateway routes
resource "aws_apigatewayv2_route" "blackjack_post_route" {
  api_id    = aws_apigatewayv2_api.blackjack_api.id
  route_key = "POST /blackjack"
  target    = "integrations/${aws_apigatewayv2_integration.blackjack_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "blackjack_get_route" {
  api_id    = aws_apigatewayv2_api.blackjack_api.id
  route_key = "GET /blackjack"
  target    = "integrations/${aws_apigatewayv2_integration.blackjack_lambda_integration.id}"
}

# Options route for CORS
resource "aws_apigatewayv2_route" "blackjack_options_route" {
  api_id    = aws_apigatewayv2_api.blackjack_api.id
  route_key = "OPTIONS /blackjack"
  target    = "integrations/${aws_apigatewayv2_integration.blackjack_lambda_integration.id}"
}

# Output the API endpoint URL
output "blackjack_api_url" {
  description = "URL of the blackjack API"
  value       = "${aws_apigatewayv2_api.blackjack_api.api_endpoint}/prod/blackjack"
}

# Output the DynamoDB table name
output "blackjack_table_name" {
  description = "Name of the blackjack DynamoDB table"
  value       = aws_dynamodb_table.blackjack_games.name
}
