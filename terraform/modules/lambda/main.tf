resource "aws_security_group" "lambda" {
  name        = "${var.name_prefix}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-sg"
    }
  )
}

resource "aws_security_group_rule" "lambda_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lambda.id
  description       = "Allow all outbound traffic"
}

resource "aws_iam_role" "lambda_execution" {
  name = "${var.name_prefix}-lambda-execution-role"

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

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-execution-role"
    }
  )
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.name_prefix}-lambda-secrets-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          var.db_password_secret
        ]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "lambda_api" {
  name              = "/aws/lambda/${var.name_prefix}-api"
  retention_in_days = 30

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-api-logs"
    }
  )
}

data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/lambda_placeholder.zip"

  source {
    content  = <<EOF
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Lambda! Deploy your application code here.',
        }),
    };
};
EOF
    filename = "index.js"
  }
}

resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.name_prefix}-api"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256
  runtime          = "nodejs18.x"
  timeout          = 30
  memory_size      = 512

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST        = var.db_host
      DB_NAME        = var.db_name
      DB_USER        = var.db_username
      DB_SECRET_ARN  = var.db_password_secret
      REDIS_ENDPOINT = var.redis_endpoint
      NODE_ENV       = "production"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-api"
    }
  )
}

resource "aws_cloudwatch_log_group" "lambda_worker" {
  name              = "/aws/lambda/${var.name_prefix}-worker"
  retention_in_days = 30

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-worker-logs"
    }
  )
}

resource "aws_lambda_function" "worker" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.name_prefix}-worker"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256
  runtime          = "nodejs18.x"
  timeout          = 60
  memory_size      = 1024

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST        = var.db_host
      DB_NAME        = var.db_name
      DB_USER        = var.db_username
      DB_SECRET_ARN  = var.db_password_secret
      REDIS_ENDPOINT = var.redis_endpoint
      NODE_ENV       = "production"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-worker"
    }
  )
}
