output "media_bucket_id" {
  description = "Media bucket ID"
  value       = aws_s3_bucket.media.id
}

output "media_bucket_arn" {
  description = "Media bucket ARN"
  value       = aws_s3_bucket.media.arn
}

output "media_bucket_domain_name" {
  description = "Media bucket domain name"
  value       = aws_s3_bucket.media.bucket_regional_domain_name
}

output "static_bucket_id" {
  description = "Static content bucket ID"
  value       = aws_s3_bucket.static.id
}

output "static_bucket_arn" {
  description = "Static content bucket ARN"
  value       = aws_s3_bucket.static.arn
}

output "logs_bucket_id" {
  description = "Logs bucket ID"
  value       = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  description = "Logs bucket ARN"
  value       = aws_s3_bucket.logs.arn
}
