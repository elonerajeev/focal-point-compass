resource "azurerm_container_registry" "this" {
  name                = "${var.name_prefix}acr${var.environment}${var.random_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = var.admin_enabled
  tags                = var.tags
}
