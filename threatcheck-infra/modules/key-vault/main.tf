resource "azurerm_key_vault" "this" {
  name                       = "${var.name_prefix}kv${var.environment}${var.random_suffix}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  tenant_id                  = var.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  soft_delete_retention_days = 7
  purge_protection_enabled   = var.environment == "prod"
  tags                       = var.tags
}

resource "azurerm_private_endpoint" "this" {
  name                = "${var.name_prefix}-pe-kv-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoint_subnet_id

  private_service_connection {
    name                           = "kv-pe-connection"
    private_connection_resource_id = azurerm_key_vault.this.id
    is_manual_connection           = false
    subresource_names              = ["vault"]
  }

  tags = var.tags
}
