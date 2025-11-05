variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "media_bucket_id" {
  description = "Media bucket ID"
  type        = string
}

variable "media_bucket_arn" {
  description = "Media bucket ARN"
  type        = string
}

variable "media_bucket_domain_name" {
  description = "Media bucket domain name"
  type        = string
}

variable "default_root_object" {
  description = "Default root object"
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
