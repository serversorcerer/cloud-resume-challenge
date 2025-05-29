output "api_url" {
  description = "Invoke URL of API Gateway"
  value       = aws_apigatewayv2_api.this.api_endpoint
}
