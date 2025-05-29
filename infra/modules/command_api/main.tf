locals {
  lambda_zip = "${var.function_name}.zip"
}

data "archive_file" "lambda" {
  type        = "zip"
  source_file = var.source_file
  output_path = "${path.module}/${local.lambda_zip}"
}

resource "aws_iam_role" "lambda" {
  name = "${var.function_name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${var.function_name}-policy"
  role   = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
      Effect   = "Allow"
      Resource = "arn:aws:logs:*:*:*"
    }]
  })
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  filename      = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  handler       = "commands.handler"
  runtime       = var.runtime
  role          = aws_iam_role.lambda.arn
  memory_size   = var.memory_size
  timeout       = var.timeout
}

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.function_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.this.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.this.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "command" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /command"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_apigatewayv2_deployment" "this" {
  depends_on = [aws_apigatewayv2_route.command]
  api_id     = aws_apigatewayv2_api.this.id
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  deployment_id = aws_apigatewayv2_deployment.this.id
  auto_deploy = true
}
