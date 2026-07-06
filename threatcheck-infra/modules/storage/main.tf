resource "azurerm_storage_account" "this" {
  name                            = "${var.name_prefix}st${var.environment}${var.random_suffix}"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  account_tier                    = var.account_tier
  account_replication_type        = var.replication_type
  account_kind                    = var.account_kind
  enable_https_traffic_only       = true
  minimum_tls_version             = "1.2"
  allow_nested_items_to_be_public = false
  tags                            = var.tags
}

resource "azurerm_storage_container" "scan_reports" {
  name                  = "scan-reports"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "sboms" {
  name                  = "sboms"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

resource "azurerm_storage_queue" "scan_queue" {
  name                 = "scan-queue"
  storage_account_name = azurerm_storage_account.this.name
}
