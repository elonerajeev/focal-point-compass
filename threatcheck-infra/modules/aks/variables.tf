variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "aks_subnet_id" { type = string }
variable "log_analytics_workspace_id" { type = string }
variable "kubernetes_version" { type = string }
variable "sku_tier" { type = string }

variable "system_pool" {
  type = object({
    vm_size         = string
    zones           = list(string)
    min_count       = number
    max_count       = number
    os_disk_size_gb = number
  })
}

variable "scan_pool" {
  type = object({
    vm_size         = string
    zones           = list(string)
    min_count       = number
    max_count       = number
    os_disk_size_gb = number
  })
}
