# Root module calls providers from versions.tf
# Environment-specific backend config is in each env directory

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/stage/prod)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "tc"
}
