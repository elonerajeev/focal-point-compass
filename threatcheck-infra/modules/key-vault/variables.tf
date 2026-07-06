variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "tenant_id" { type = string }
variable "random_suffix" { type = string }
variable "private_endpoint_subnet_id" { type = string }
