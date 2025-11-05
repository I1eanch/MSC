output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_endpoint" {
  description = "API Gateway endpoint"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_gateway_url" {
  description = "API Gateway URL with stage"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/${var.environment}"
}
