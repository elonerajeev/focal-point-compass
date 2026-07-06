variable "name_prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "vnet_address_space" {
  type = list(string)
}

variable "aks_subnet_prefixes" {
  type = list(string)
}

variable "ingress_subnet_prefixes" {
  type = list(string)
}

variable "private_endpoint_subnet_prefixes" {
  type = list(string)
}
