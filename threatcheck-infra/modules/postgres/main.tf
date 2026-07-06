resource "azurerm_postgresql_flexible_server" "this" {
  name                          = "${var.name_prefix}-psql-${var.environment}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  version                       = var.postgres_version
  delegated_subnet_id           = var.aks_subnet_id
  private_dns_zone_id           = var.private_dns_zone_id
  administrator_login           = var.admin_user
  administrator_password        = var.admin_password
  zone                          = var.availability_zone
  storage_mb                   = var.storage_mb
  sku_name                     = var.sku_name
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.environment == "prod"
  tags                         = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "threatcheck" {
  name      = "threatcheck"
  server_id = azurerm_postgresql_flexible_server.this.id
  collation = "en_US.UTF8"
  charset   = "UTF8"
}
