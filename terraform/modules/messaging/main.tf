resource "aws_sns_topic" "notifications" {
  name              = "${var.name_prefix}-notifications"
  display_name      = "Application Notifications"
  kms_master_key_id = "alias/aws/sns"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-notifications"
    }
  )
}

resource "aws_sns_topic" "alerts" {
  name              = "${var.name_prefix}-alerts"
  display_name      = "System Alerts"
  kms_master_key_id = "alias/aws/sns"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-alerts"
    }
  )
}

resource "aws_sqs_queue" "processing_dlq" {
  name                       = "${var.name_prefix}-processing-dlq"
  message_retention_seconds  = 1209600
  visibility_timeout_seconds = 300

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-processing-dlq"
      Type = "DLQ"
    }
  )
}

resource "aws_sqs_queue" "processing" {
  name                       = "${var.name_prefix}-processing"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-processing"
    }
  )
}

resource "aws_sqs_queue" "email_dlq" {
  name                       = "${var.name_prefix}-email-dlq"
  message_retention_seconds  = 1209600
  visibility_timeout_seconds = 300

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-email-dlq"
      Type = "DLQ"
    }
  )
}

resource "aws_sqs_queue" "email" {
  name                       = "${var.name_prefix}-email"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.email_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-email"
    }
  )
}

resource "aws_sns_topic_subscription" "notifications_to_processing" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.processing.arn
}

resource "aws_sns_topic_subscription" "notifications_to_email" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.email.arn
}

data "aws_iam_policy_document" "processing_queue_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.processing.arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.notifications.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "processing" {
  queue_url = aws_sqs_queue.processing.id
  policy    = data.aws_iam_policy_document.processing_queue_policy.json
}

data "aws_iam_policy_document" "email_queue_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.email.arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.notifications.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "email" {
  queue_url = aws_sqs_queue.email.id
  policy    = data.aws_iam_policy_document.email_queue_policy.json
}
