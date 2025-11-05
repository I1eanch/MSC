output "lambda_security_group_id" {
  description = "Lambda security group ID"
  value       = aws_security_group.lambda.id
}

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_functions" {
  description = "Map of Lambda function details"
  value = {
    api = {
      function_name = aws_lambda_function.api.function_name
      arn           = aws_lambda_function.api.arn
      invoke_arn    = aws_lambda_function.api.invoke_arn
    }
    worker = {
      function_name = aws_lambda_function.worker.function_name
      arn           = aws_lambda_function.worker.arn
      invoke_arn    = aws_lambda_function.worker.invoke_arn
    }
  }
}

output "lambda_function_names" {
  description = "List of Lambda function names"
  value = [
    aws_lambda_function.api.function_name,
    aws_lambda_function.worker.function_name
  ]
}
