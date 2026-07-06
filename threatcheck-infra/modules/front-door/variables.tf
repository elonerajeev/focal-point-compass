variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "ingress_hostname" { type = string }
variable "origin_host_header" { type = string }
