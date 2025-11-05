variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "db_host" {
  description = "Database host endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password_secret" {
  description = "ARN of database password secret"
  type        = string
}

variable "redis_endpoint" {
  description = "Redis endpoint"
  type        = string
}

variable "container_port" {
  description = "Port on which the container listens"
  type        = number
  default     = 8080
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

variable "enable_alb" {
  description = "Enable Application Load Balancer"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
