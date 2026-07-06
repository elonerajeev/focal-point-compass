variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "retention_days" { type = number }
variable "grafana_sku" { type = string }
