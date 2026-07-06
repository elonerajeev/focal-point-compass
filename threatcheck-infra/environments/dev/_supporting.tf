resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "random_password" "postgres_admin" {
  length  = 24
  special = false
}

resource "azurerm_private_dns_zone" "postgres" {
  name                = "privatelink.postgres.database.azure.com"
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "postgres-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  resource_group_name   = module.networking.resource_group_name
  virtual_network_id    = module.networking.vnet_id
  registration_enabled  = false
  tags                  = local.tags
}
