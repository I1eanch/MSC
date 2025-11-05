resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.name_prefix}-db-password"
  description             = "Database master password"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-db-password"
    }
  )
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
  })
}

resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "${var.name_prefix}-api-keys"
  description             = "API keys and secrets"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-api-keys"
    }
  )
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    jwt_secret = random_password.jwt_secret.result
  })
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}
