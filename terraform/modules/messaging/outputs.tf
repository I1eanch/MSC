output "sns_topic_arns" {
  description = "SNS topic ARNs"
  value = {
    notifications = aws_sns_topic.notifications.arn
    alerts        = aws_sns_topic.alerts.arn
  }
}

output "sqs_queue_urls" {
  description = "SQS queue URLs"
  value = {
    processing     = aws_sqs_queue.processing.url
    processing_dlq = aws_sqs_queue.processing_dlq.url
    email          = aws_sqs_queue.email.url
    email_dlq      = aws_sqs_queue.email_dlq.url
  }
}

output "sqs_queue_arns" {
  description = "SQS queue ARNs"
  value = {
    processing     = aws_sqs_queue.processing.arn
    processing_dlq = aws_sqs_queue.processing_dlq.arn
    email          = aws_sqs_queue.email.arn
    email_dlq      = aws_sqs_queue.email_dlq.arn
  }
}
