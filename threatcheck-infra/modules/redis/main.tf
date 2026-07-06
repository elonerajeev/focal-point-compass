resource "azurerm_redis_cache" "this" {
  name                          = "${var.name_prefix}-redis-${var.environment}"
  location                      = var.location
  resource_group_name           = var.resource_group_name
  capacity                      = var.capacity
  family                        = var.family
  sku_name                      = var.sku
  enable_non_ssl_port           = false
  minimum_tls_version           = "1.2"
  redis_version                 = var.redis_version
  public_network_access_enabled = false
  tags                          = var.tags
}

resource "azurerm_redis_firewall_rule" "aks" {
  name                = "allow-aks"
  redis_cache_name    = azurerm_redis_cache.this.name
  resource_group_name = var.resource_group_name
  start_ip            = "0.0.0.0"
  end_ip              = "0.0.0.0"
}
