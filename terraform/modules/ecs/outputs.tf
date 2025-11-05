output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_security_group_id" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs_tasks.id
}

output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task.arn
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = var.enable_alb ? aws_lb.main[0].dns_name : null
}

output "alb_arn" {
  description = "ALB ARN"
  value       = var.enable_alb ? aws_lb.main[0].arn : null
}

output "target_group_arn" {
  description = "Target group ARN"
  value       = var.enable_alb ? aws_lb_target_group.main[0].arn : null
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs.name
}
