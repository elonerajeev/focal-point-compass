resource "azurerm_log_analytics_workspace" "this" {
  name                = "${var.name_prefix}-log-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  retention_in_days   = var.retention_days
  sku                 = "PerGB2018"
  tags                = var.tags
}

resource "azurerm_monitor_workspace" "prometheus" {
  name                = "${var.name_prefix}-prom-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_dashboard_grafana" "this" {
  name                              = "${var.name_prefix}-grafana-${var.environment}"
  resource_group_name               = var.resource_group_name
  location                          = var.location
  grafana_major_version             = 11
  public_network_access_enabled     = true
  api_key_enabled                   = false
  deterministic_outbound_ip_enabled = true
  sku                               = var.grafana_sku
  tags                              = var.tags
}
